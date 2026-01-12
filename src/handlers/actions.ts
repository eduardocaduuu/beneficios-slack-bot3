/**
 * Handlers para ações interativas (botões, menus)
 */

import { App } from '@slack/bolt';
import { logger, logSlackEvent, logError } from '../utils/logger';
import {
  buildDetailedBenefitsMessage,
  buildUnitSelectorMessage,
  buildBenefitsForUnitMessage,
} from '../utils/messageBuilders';
import { Unit } from '../types';
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

      await respond({
        response_type: 'ephemeral',
        replace_original: true,
        blocks: buildBenefitsForUnitMessage(selectedUnit),
        text: `Benefícios para ${selectedUnit}`,
      });

      logger.info(`✅ Benefícios da unidade ${selectedUnit} enviados para ${userId}`);
    } catch (error) {
      logError('Erro ao processar unit_select', error, { body });
      await respond({
        response_type: 'ephemeral',
        text: '❌ Erro ao carregar benefícios. Tente novamente.',
      });
    }
  });

  // Ação: Cancelar broadcast
  app.action('broadcast_cancel', async ({ ack, respond }) => {
    await ack();

    try {
      await respond({
        response_type: 'ephemeral',
        replace_original: true,
        text: '❌ Broadcast cancelado. Nenhuma mensagem foi enviada.',
      });

      logger.info('✅ Broadcast cancelado pelo usuário');
    } catch (error) {
      logError('Erro ao processar broadcast_cancel', error);
    }
  });

  // Ação: Confirmar e executar broadcast
  app.action('broadcast_confirm', async ({ ack, respond, body, client }) => {
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

  logger.info('✅ Action handlers registrados');
}
