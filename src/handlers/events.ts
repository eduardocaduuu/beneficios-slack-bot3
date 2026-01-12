/**
 * Handlers para eventos do Slack
 */

import { App, MemberJoinedChannelEvent } from '@slack/bolt';
import { config } from '../config/environment';
import { logger, logSlackEvent, logError } from '../utils/logger';
import { canSendMessage, markMessageSent } from '../services/cacheService';
import { buildWelcomeMessageForNewbie } from '../utils/messageBuilders';

/**
 * Registra handlers de eventos
 */
export function registerEventHandlers(app: App) {
  // Evento: novo membro entra no canal
  app.event('member_joined_channel', async ({ event, client }) => {
    try {
      const channelEvent = event as MemberJoinedChannelEvent;

      logSlackEvent('member_joined_channel', {
        user: channelEvent.user,
        channel: channelEvent.channel,
      });

      // Verifica se é o canal alvo
      if (channelEvent.channel !== config.welcomeChannelId) {
        logger.debug(
          `Canal ${channelEvent.channel} não é o canal de boas-vindas. Ignorando.`
        );
        return;
      }

      const userId = channelEvent.user;

      // Rate limiting: verifica se já enviou mensagem para este usuário
      if (!canSendMessage(userId, 'welcome')) {
        logger.info(`Rate limit: mensagem de boas-vindas já enviada para ${userId}. Ignorando.`);
        return;
      }

      // Envia mensagem no canal (DESATIVADO - apenas DM privado)
      // await client.chat.postMessage({
      //   channel: config.welcomeChannelId,
      //   blocks: buildWelcomeMessageForNewbie(userId),
      //   text: `Bem-vindo(a) <@${userId}>! Você tem acesso a diversos benefícios.`,
      // });
      // logger.info(`✅ Mensagem de boas-vindas enviada no canal para usuário ${userId}`);

      // Envia DM (sempre ativo - mensagem privada apenas)
      if (config.sendDm) {
        try {
          await sendDm(client, userId, {
            blocks: buildWelcomeMessageForNewbie(userId),
            text: 'Bem-vindo(a)! Você tem acesso a diversos benefícios.',
          });
          logger.info(`✅ DM de boas-vindas enviada para usuário ${userId} (apenas privado)`);
        } catch (dmError) {
          logError('Erro ao enviar DM de boas-vindas', dmError, { userId });
        }
      } else {
        logger.warn(`⚠️ SEND_DM está desativado. Nenhuma mensagem será enviada para ${userId}`);
      }

      // Marca como enviado no cache
      markMessageSent(userId, 'welcome');
    } catch (error) {
      logError('Erro ao processar member_joined_channel', error, { event });
    }
  });

  // Evento: app mencionada
  app.event('app_mention', async ({ event, client, say }) => {
    try {
      logSlackEvent('app_mention', {
        user: event.user,
        channel: event.channel,
      });

      await say({
        text: `Olá <@${event.user}>! Use o comando \`/beneficios\` para ver seus benefícios ou clique nos botões abaixo.`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Olá <@${event.user}>! 👋\n\nUse o comando \`/beneficios\` para ver seus benefícios ou clique nos botões abaixo:`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '📋 Ver benefícios',
                  emoji: true,
                },
                style: 'primary',
                action_id: 'view_all_benefits',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🏢 Ver por unidade',
                  emoji: true,
                },
                action_id: 'view_by_unit',
              },
            ],
          },
        ],
      });
    } catch (error) {
      logError('Erro ao processar app_mention', error, { event });
    }
  });

  logger.info('✅ Event handlers registrados');
}
