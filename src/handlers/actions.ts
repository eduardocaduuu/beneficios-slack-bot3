/**
 * Handlers para ações interativas (botões, menus)
 */

import { App } from '@slack/bolt';
import { logger, logSlackEvent, logError } from '../utils/logger';
import {
  buildDetailedBenefitsMessage,
  buildUnitSelectorMessage,
  buildBenefitsForUnitMessage,
  buildErrorMessage,
} from '../utils/messageBuilders';
import { Unit, UNIT_LABELS } from '../types';
import { config } from '../config/environment';
import { getBroadcastPreview, executeBroadcast } from '../services/broadcastService';

/**
 * Registra handlers de ações interativas
 */
export function registerActionHandlers(app: App) {
  // Ação: Ver todos os benefícios
  app.action('view_all_benefits', async ({ ack, respond, body }) => {
    await ack();

    try {
      const userId = body.user.id;

      logSlackEvent('action_view_all_benefits', {
        user: userId,
      });

      await respond({
        response_type: 'ephemeral',
        replace_original: false,
        blocks: buildDetailedBenefitsMessage(),
        text: 'Benefícios completos',
      });

      logger.info(`✅ Benefícios completos enviados para ${userId}`);
    } catch (error) {
      logError('Erro ao processar view_all_benefits', error, { body });
      await respond({
        response_type: 'ephemeral',
        text: '❌ Erro ao carregar benefícios. Tente novamente.',
      });
    }
  });

  // Ação: Ver por unidade (mostra seletor)
  app.action('view_by_unit', async ({ ack, respond, body }) => {
    await ack();

    try {
      const userId = body.user.id;

      logSlackEvent('action_view_by_unit', {
        user: userId,
      });

      await respond({
        response_type: 'ephemeral',
        replace_original: false,
        blocks: buildUnitSelectorMessage(),
        text: 'Selecione sua unidade',
      });

      logger.info(`✅ Seletor de unidade enviado para ${userId}`);
    } catch (error) {
      logError('Erro ao processar view_by_unit', error, { body });
      await respond({
        response_type: 'ephemeral',
        text: '❌ Erro ao carregar seletor. Tente novamente.',
      });
    }
  });

  // Ação: Seleção de unidade
  app.action('unit_select', async ({ ack, respond, body }) => {
    await ack();

    try {
      const userId = body.user.id;

      // Type guard para garantir que é uma ação de seleção estática
      if (!('actions' in body) || !body.actions || body.actions.length === 0) {
        logger.error('Corpo da ação não contém actions');
        return;
      }

      const action = body.actions[0];

      if (!('selected_option' in action) || !action.selected_option) {
        logger.error('Ação não contém selected_option');
        return;
      }

      const selectedUnit = action.selected_option.value as Unit;

      logSlackEvent('action_unit_select', {
        user: userId,
        unit: selectedUnit,
      });

      // Valida se a unidade existe
      if (!UNIT_LABELS[selectedUnit]) {
        logger.error(`Unidade inválida: ${selectedUnit}`);
        await respond({
          response_type: 'ephemeral',
          replace_original: true,
          text: `❌ Unidade "${selectedUnit}" não encontrada.`,
        });
        return;
      }

      // Constrói a mensagem
      const blocks = buildBenefitsForUnitMessage(selectedUnit);
      
      await respond({
        response_type: 'ephemeral',
        replace_original: true,
        blocks,
        text: `Benefícios para ${UNIT_LABELS[selectedUnit]}`,
      });

      logger.info(`✅ Benefícios da unidade ${selectedUnit} (${UNIT_LABELS[selectedUnit]}) enviados para ${userId}`);
    } catch (error) {
      logError('Erro ao processar unit_select', error, { body, selectedUnit: (body as any).actions?.[0]?.selected_option?.value });
      
      try {
        await respond({
          response_type: 'ephemeral',
          replace_original: true,
          text: '❌ Erro ao carregar benefícios. Tente novamente ou entre em contato com o RH/DP.',
          blocks: buildErrorMessage('Erro ao carregar benefícios da unidade selecionada.'),
        });
      } catch (respondError) {
        logger.error('Erro ao enviar mensagem de erro:', respondError);
      }
    }
  });

  // Ação: Cancelar broadcast
  app.action('cancel_broadcast', async ({ ack, respond, body, client }) => {
    await ack();

    try {
      const userId = body.user.id;
      
      // Tenta obter channelId do value do botão, ou usa um fallback
      let channelId: string | undefined;
      if ('actions' in body && body.actions && body.actions.length > 0) {
        const action = body.actions[0];
        if ('value' in action && action.value) {
          channelId = action.value;
        }
      }

      await respond({
        response_type: 'ephemeral',
        replace_original: true,
        text: '❌ Broadcast cancelado. Nenhuma mensagem foi enviada.',
      });

      // Envia mensagem ephemeral no canal se possível
      if (channelId) {
        try {
          await client.chat.postEphemeral({
            channel: channelId,
            user: userId,
            text: '❌ Broadcast cancelado. Nenhuma mensagem foi enviada.',
          });
        } catch (ephemeralError) {
          // Ignora erro se não conseguir enviar ephemeral
          logger.debug('Não foi possível enviar mensagem ephemeral de cancelamento');
        }
      }

      logger.info(`✅ Broadcast cancelado pelo usuário ${userId}`);
    } catch (error) {
      logError('Erro ao processar cancel_broadcast', error);
    }
  });

  // Ação: Confirmar e executar broadcast
  app.action('confirm_broadcast', async ({ ack, respond, body, client }) => {
    await ack();

    try {
      const userId = body.user.id;

      // Verifica se o usuário tem o valor (channelId)
      if (!('actions' in body) || !body.actions || body.actions.length === 0) {
        logger.error('Corpo da ação não contém actions');
        return;
      }

      const action = body.actions[0];
      if (!('value' in action) || !action.value) {
        logger.error('Ação não contém value (channelId)');
        return;
      }

      const channelId = action.value;

      logSlackEvent('action_broadcast_confirm', {
        user: userId,
        channel: channelId,
      });

      // Atualiza mensagem para mostrar que está processando
      await respond({
        response_type: 'ephemeral',
        replace_original: true,
        text: '⏳ Iniciando broadcast... Isso pode levar alguns minutos.',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '⏳ *Broadcast em andamento...*\n\nPor favor, aguarde. Você receberá uma notificação quando concluir.',
            },
          },
        ],
      });

      // Gera preview novamente (para pegar lista atualizada)
      const preview = await getBroadcastPreview(client, channelId);

      if (preview.willReceive === 0) {
        await respond({
          response_type: 'ephemeral',
          replace_original: true,
          text: '✅ Nenhuma mensagem precisa ser enviada.',
        });
        return;
      }

      logger.info(`🚀 Iniciando broadcast para ${preview.willReceive} usuários...`);

      // Executa broadcast
      const result = await executeBroadcast(client, preview.users, (sent, total) => {
        // Log de progresso
        if (sent % 10 === 0 || sent === total) {
          logger.info(`📊 Progresso: ${sent}/${total} mensagens enviadas`);
        }
      });

      // Mostra resultado final
      const successRate = ((result.sent / result.total) * 100).toFixed(1);

      await respond({
        response_type: 'ephemeral',
        replace_original: true,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '✅ Broadcast Concluído!',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `📨 *Enviadas:*\n${result.sent}`,
              },
              {
                type: 'mrkdwn',
                text: `⏭️ *Puladas:*\n${result.skipped}`,
              },
              {
                type: 'mrkdwn',
                text: `❌ *Falharam:*\n${result.failed}`,
              },
              {
                type: 'mrkdwn',
                text: `📊 *Taxa de sucesso:*\n${successRate}%`,
              },
            ],
          },
          ...(result.errors.length > 0
            ? [
                {
                  type: 'section' as const,
                  text: {
                    type: 'mrkdwn' as const,
                    text: `⚠️ *Erros encontrados (${result.errors.length}):*\n${result.errors
                      .slice(0, 5)
                      .map((e) => `• <@${e.userId}>: ${e.error}`)
                      .join('\n')}${result.errors.length > 5 ? `\n_...e mais ${result.errors.length - 5} erros_` : ''}`,
                  },
                },
              ]
            : []),
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `✅ _Broadcast finalizado às ${new Date().toLocaleTimeString('pt-BR')}_`,
              },
            ],
          },
        ],
        text: `Broadcast concluído: ${result.sent} enviadas, ${result.failed} falharam`,
      });

      logger.info(
        `✅ Broadcast finalizado: ${result.sent} enviadas, ${result.skipped} puladas, ${result.failed} falharam`
      );
    } catch (error) {
      logError('Erro ao executar broadcast', error, { body });
      await respond({
        response_type: 'ephemeral',
        replace_original: true,
        text: '❌ Erro ao executar broadcast. Verifique os logs para detalhes.',
      });
    }
  });

  // Ação: Contatar RH/DP
  app.action('contact_rh', async ({ ack, body, client }) => {
    await ack();

    logger.info('🔔 Botão "Falar com RH/DP" clicado!', {
      userId: body.user.id,
      channelId: (body as any).channel?.id,
      actionId: 'contact_rh',
    });

    try {
      const rhUserId = process.env.RH_USER_ID || config.rhUserId;
      const requesterId = body.user.id;
      const channelId = (body as any).channel?.id;

      logger.info('📋 Verificando configuração RH_USER_ID...', { rhUserId: rhUserId ? 'configurado' : 'não configurado' });

      if (!rhUserId) {
        logger.error('❌ RH_USER_ID não configurado no ambiente');
        await client.chat.postEphemeral({
          channel: channelId || requesterId,
          user: requesterId,
          text: '❌ Contato do RH/DP não está configurado. Fale com o administrador do bot.',
        });
        return;
      }

      logSlackEvent('action_contact_rh', {
        user: requesterId,
        rhUserId,
      });

      logger.info('🔓 Abrindo DM com o RH...', { rhUserId });

      // 1) Abrir DM com o RH
      logger.info('📨 Passo 1: Abrindo conversa com RH...', { rhUserId });
      const openRes = await client.conversations.open({
        users: rhUserId,
      });

      const dmChannelId = openRes.channel?.id;

      if (!dmChannelId) {
        throw new Error('Não foi possível abrir DM com o RH');
      }

      logger.info('✅ DM aberta com sucesso', { dmChannelId });

      // 2) Notificar o RH
      logger.info('📨 Passo 2: Enviando mensagem ao RH...', { dmChannelId });
      await client.chat.postMessage({
        channel: dmChannelId,
        text: `👋 Olá! O usuário <@${requesterId}> clicou em *Falar com RH/DP* no bot de benefícios e solicitou contato.`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `👋 *Nova solicitação de contato*\n\nO usuário <@${requesterId}> clicou no botão *Falar com RH/DP* no bot de benefícios e solicitou contato.`,
            },
          },
        ],
      });

      logger.info('✅ Mensagem enviada ao RH com sucesso');

      // 3) Confirmar para o usuário
      logger.info('📨 Passo 3: Enviando confirmação ao usuário...', { requesterId, channelId });
      await client.chat.postEphemeral({
        channel: channelId || dmChannelId,
        user: requesterId,
        text: '✅ Pronto! O RH/DP já foi notificado e entrará em contato com você em breve.',
      });

      logger.info(`✅ Processo completo: RH notificado sobre solicitação de contato de ${requesterId}`);
    } catch (error) {
      logError('Erro ao acionar RH', error, { body });

      // Fallback: tenta responder no canal do clique
      const requesterId = body.user.id;
      const channelId = (body as any).channel?.id;

      try {
        await client.chat.postEphemeral({
          channel: channelId || requesterId,
          user: requesterId,
          text: '❌ Não foi possível acionar o RH agora. Tente novamente mais tarde ou entre em contato diretamente.',
        });
      } catch (respondError) {
        logger.error('Erro ao enviar mensagem de erro ao usuário:', respondError);
      }
    }
  });

  logger.info('✅ Action handlers registrados');
}
