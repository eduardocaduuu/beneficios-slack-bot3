/**
 * Serviço de broadcast - envia mensagens em massa com proteções
 */

import { WebClient } from '@slack/web-api';
import { logger } from '../utils/logger';
import { canSendMessage, markMessageSent } from './cacheService';
import { buildWelcomeMessageForNewbie } from '../utils/messageBuilders';
import { sendDm, withRateLimitRetry } from './slackMessaging';

export interface BroadcastResult {
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
}

export interface BroadcastPreview {
  totalMembers: number;
  bots: number;
  alreadySent: number;
  willReceive: number;
  users: string[];
}

/**
 * Lista membros de um canal (filtrando bots e usuários desativados)
 */
export async function getChannelMembers(
  client: WebClient,
  channelId: string
): Promise<{ userId: string; isBot: boolean; isDeleted: boolean }[]> {
  try {
    logger.info(`📋 Listando membros do canal ${channelId}...`);

    // Pega lista de IDs dos membros do canal (paginado)
const memberIds: string[] = [];
let cursor: string | undefined;

do {
  const page = await withRateLimitRetry(
    () =>
      client.conversations.members({
        channel: channelId,
        limit: 1000, // Slack permite até 1000 por página
        cursor,
      }),
    { actionName: 'conversations.members' }
  );

  const members = (page as any).members as string[] | undefined;
  if (members && members.length > 0) memberIds.push(...members);

  cursor = (page as any).response_metadata?.next_cursor || undefined;
  if (cursor) cursor = cursor.trim() || undefined;
} while (cursor);

if (memberIds.length === 0) {
  logger.warn(`⚠️ Nenhum membro encontrado no canal ${channelId}`);
  return [];
}

    logger.info(`📊 Encontrados ${memberIds.length} membros no canal`);

    // Busca informações detalhadas de cada membro em batches para evitar rate limiting
    const members: { userId: string; isBot: boolean; isDeleted: boolean }[] = [];
    const batchSize = 10; // Processa 10 usuários por vez
    const delayBetweenBatches = 200; // 200ms entre batches

    for (let i = 0; i < memberIds.length; i += batchSize) {
      const batch = memberIds.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (userId) => {
          try {
            const userInfo = await withRateLimitRetry(
              () => client.users.info({ user: userId }),
              { actionName: 'users.info', maxRetries: 2 }
            );
            return {
              userId,
              isBot: userInfo.user?.is_bot || false,
              isDeleted: userInfo.user?.deleted || false,
            };
          } catch (error: any) {
            // Log mais detalhado do erro
            const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
            const errorCode = error?.code || error?.data?.error || 'unknown';
            
            // Trata erros específicos
            if (errorCode === 'user_not_found' || errorCode === 'users_not_found') {
              logger.debug(`👤 Usuário ${userId} não encontrado (provavelmente deletado)`);
            } else if (errorCode === 'missing_scope') {
              logger.warn(`⚠️ Sem permissão para buscar info do usuário ${userId}: ${errorMessage}`);
            } else {
              logger.warn(`⚠️ Erro ao buscar info do usuário ${userId} (${errorCode}): ${errorMessage}`);
            }
            
            // Retorna como deletado para ser filtrado
            return { userId, isBot: false, isDeleted: true };
          }
        })
      );

      members.push(...batchResults);

      // Delay entre batches (exceto no último)
      if (i + batchSize < memberIds.length) {
        await delay(delayBetweenBatches);
      }
    }

    logger.info(`✅ Processados ${members.length} membros (${members.filter(m => !m.isDeleted).length} ativos)`);

    return members;
  } catch (error) {
    logger.error('❌ Erro ao listar membros do canal:', error);
    throw error;
  }
}

/**
 * Gera prévia do broadcast (quem vai receber)
 * Com fallback seguro caso não consiga listar membros
 */
export async function getBroadcastPreview(
  client: WebClient,
  channelId: string
): Promise<BroadcastPreview> {
  try {
    const members = await getChannelMembers(client, channelId);

    const totalMembers = members.length;
    const bots = members.filter((m) => m.isBot).length;

    // Filtra: remove bots e usuários deletados
    const activeUsers = members.filter((m) => !m.isBot && !m.isDeleted).map((m) => m.userId);

    // Verifica cache: quem já recebeu mensagem
    const alreadySent = activeUsers.filter((userId) => !canSendMessage(userId, 'welcome')).length;

    // Quem vai receber: usuários ativos que não estão no cache
    const willReceiveUsers = activeUsers.filter((userId) => canSendMessage(userId, 'welcome'));

    return {
      totalMembers,
      bots,
      alreadySent,
      willReceive: willReceiveUsers.length,
      users: willReceiveUsers,
    };
  } catch (error: any) {
    // Fallback seguro: se não conseguir listar membros (ex: missing_scope, permissão negada)
    logger.warn('⚠️ Erro ao listar membros do canal, usando fallback seguro:', error);
    
    // Retorna preview com valores seguros (permite exibir botões mesmo sem dados)
    return {
      totalMembers: 0,
      bots: 0,
      alreadySent: 0,
      willReceive: 0,
      users: [],
    };
  }
}

/**
 * Delay entre envios (rate limiting)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executa broadcast para lista de usuários
 */
export async function executeBroadcast(
  client: WebClient,
  userIds: string[],
  onProgress?: (sent: number, total: number) => void
): Promise<BroadcastResult> {
  const result: BroadcastResult = {
    total: userIds.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  logger.info(`🚀 Iniciando broadcast para ${userIds.length} usuários...`);

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];

    try {
      // Verifica cache novamente (proteção extra)
      if (!canSendMessage(userId, 'welcome')) {
        logger.debug(`⏭️ Pulando ${userId} (já recebeu mensagem)`);
        result.skipped++;
        continue;
      }

      // Envia DM
      await sendDm(client, userId, {
        blocks: buildWelcomeMessageForNewbie(userId),
        text: 'Bem-vindo(a)! Você tem acesso a diversos benefícios.',
      });

      // Marca como enviado
      markMessageSent(userId, 'welcome');
      result.sent++;

      logger.info(`✅ [${result.sent}/${userIds.length}] DM enviada para ${userId}`);

      // Callback de progresso
      if (onProgress) {
        onProgress(result.sent, userIds.length);
      }

      // Rate limiting: 1 mensagem por segundo
      if (i < userIds.length - 1) {
        await delay(1000);
      }
    } catch (error: any) {
      result.failed++;
      const errorMsg = error.message || 'Erro desconhecido';
      result.errors.push({ userId, error: errorMsg });
      logger.error(`❌ Erro ao enviar para ${userId}:`, error);

      // Continua mesmo com erro
      continue;
    }
  }

  logger.info(
    `✅ Broadcast concluído: ${result.sent} enviadas, ${result.skipped} puladas, ${result.failed} falharam`
  );

  return result;
}
