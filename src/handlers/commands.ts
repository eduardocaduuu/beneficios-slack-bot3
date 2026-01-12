/**
 * Handlers para comandos slash do Slack
 */

import { App } from '@slack/bolt';
import { logger, logSlackEvent, logError } from '../utils/logger';
import {
  buildBenefitsMessageForTeam,
  buildWelcomeMessageForNewbie,
  buildUnitSelectorMessage,
  buildBenefitsForUnitMessage,
} from '../utils/messageBuilders';
import { parseUnit } from '../utils/unitFilter';
import { Unit } from '../types';
import { config } from '../config/environment';
import { getBroadcastPreview } from '../services/broadcastService';

/**
 * Registra handlers de comandos slash
 */
export function registerCommandHandlers(app: App) {
  // Comando: /beneficios
  app.command('/beneficios', async ({ command, ack, respond }) => {
    await ack();

    try {
      logSlackEvent('command_beneficios', {
        user: command.user_id,
        channel: command.channel_id,
      });

      await respond({
        response_type: 'ephemeral',
        blocks: buildBenefitsMessageForTeam(command.user_id),
        text: 'Seus benefícios Alcina Maria',
      });

      logger.info(`✅ Comando /beneficios executado para ${command.user_id}`);
    } catch (error) {
      logError('Erro ao processar /beneficios', error, { command });
      await respond({
        response_type: 'ephemeral',
        text: '❌ Erro ao carregar benefícios. Tente novamente.',
      });
    }
  });

  // Comando: /beneficios-novato
  app.command('/beneficios-novato', async ({ command, ack, respond }) => {
    await ack();

    try {
      logSlackEvent('command_beneficios_novato', {
        user: command.user_id,
        channel: command.channel_id,
      });

      await respond({
        response_type: 'ephemeral',
        blocks: buildWelcomeMessageForNewbie(command.user_id),
        text: 'Bem-vindo(a)! Seus benefícios estão disponíveis.',
      });

      logger.info(`✅ Comando /beneficios-novato executado para ${command.user_id}`);
    } catch (error) {
      logError('Erro ao processar /beneficios-novato', error, { command });
      await respond({
        response_type: 'ephemeral',
        text: '❌ Erro ao carregar benefícios. Tente novamente.',
      });
    }
  });

  // Comando: /beneficios-time
  app.command('/beneficios-time', async ({ command, ack, respond }) => {
    await ack();

    try {
      logSlackEvent('command_beneficios_time', {
        user: command.user_id,
        channel: command.channel_id,
      });

      await respond({
        response_type: 'ephemeral',
        blocks: buildBenefitsMessageForTeam(command.user_id),
        text: 'Seus benefícios Alcina Maria',
      });

      logger.info(`✅ Comando /beneficios-time executado para ${command.user_id}`);
    } catch (error) {
      logError('Erro ao processar /beneficios-time', error, { command });
      await respond({
        response_type: 'ephemeral',
        text: '❌ Erro ao carregar benefícios. Tente novamente.',
      });
    }
  });

  // Comando: /beneficios-unidade [nome]
  app.command('/beneficios-unidade', async ({ command, ack, respond }) => {
    await ack();

    try {
      logSlackEvent('command_beneficios_unidade', {
        user: command.user_id,
        channel: command.channel_id,
        text: command.text,
      });

      const unitText = command.text.trim();

      // Se não especificou unidade, mostra seletor
      if (!unitText) {
        await respond({
          response_type: 'ephemeral',
          blocks: buildUnitSelectorMessage(),
          text: 'Selecione sua unidade para ver os benefícios',
        });
        logger.info(`✅ Seletor de unidade enviado para ${command.user_id}`);
        return;
      }

      // Tenta parsear a unidade
      const unit = parseUnit(unitText);

      if (!unit) {
        await respond({
          response_type: 'ephemeral',
          text: `❌ Unidade "${unitText}" não encontrada.\n\nUnidades válidas: Penedo, Palmeira, Loja Coruripe, Loja Teotônio, VD Penedo, VD Palmeira, Todas`,
        });
        return;
      }

      await respond({
        response_type: 'ephemeral',
        blocks: buildBenefitsForUnitMessage(unit as Unit),
        text: `Benefícios para ${unitText}`,
      });

      logger.info(
        `✅ Comando /beneficios-unidade executado para ${command.user_id} (unidade: ${unit})`
      );
    } catch (error) {
      logError('Erro ao processar /beneficios-unidade', error, { command });
      await respond({
        response_type: 'ephemeral',
        text: '❌ Erro ao carregar benefícios. Tente novamente.',
      });
    }
  });

  // Comando: /beneficios-broadcast-preview
  app.command('/beneficios-broadcast-preview', async ({ command, ack, respond, client }) => {
    await ack();

    try {
      logSlackEvent('command_beneficios_broadcast_preview', {
        user: command.user_id,
        channel: command.channel_id,
      });

      // Mostra mensagem de carregamento
      await respond({
        response_type: 'ephemeral',
        text: '⏳ Analisando membros do canal...',
      });

      // Gera prévia (com fallback seguro)
      const preview = await getBroadcastPreview(client, config.welcomeChannelId);

      // Verifica se conseguiu listar membros (fallback seguro)
      const hasData = preview.totalMembers > 0 || preview.willReceive > 0;
      const errorMessage = !hasData && preview.totalMembers === 0 && preview.willReceive === 0
        ? '\n\n⚠️ *Não foi possível listar membros do canal.*\nVerifique se o bot tem as permissões necessárias (`channels:read`, `channels:history`).'
        : '';

      // Mostra prévia com botões de confirmação
      await respond({
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📊 Prévia do Broadcast',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Análise do canal <#${config.welcomeChannelId}>:*${errorMessage}`,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `👥 *Total de membros:*\n${preview.totalMembers > 0 ? preview.totalMembers : 'N/D'}`,
              },
              {
                type: 'mrkdwn',
                text: `🤖 *Bots (serão ignorados):*\n${preview.bots}`,
              },
              {
                type: 'mrkdwn',
                text: `✅ *Já receberam (cache):*\n${preview.alreadySent}`,
              },
              {
                type: 'mrkdwn',
                text: `📨 *Vão receber DM:*\n${preview.willReceive}`,
              },
            ],
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text:
                preview.willReceive > 0
                  ? `⚠️ *${preview.willReceive} pessoas* receberão uma mensagem direta do bot.\n\n*Importante:*\n• Envio controlado: 1 mensagem/segundo\n• Tempo estimado: ~${Math.ceil(preview.willReceive / 60)} minuto(s)\n• Não envia para bots ou quem já recebeu\n• Registra erros para análise`
                  : hasData
                  ? '✅ *Nenhuma mensagem será enviada.*\n\nTodos os membros ativos já receberam a mensagem ou são bots.'
                  : '⚠️ *Não foi possível analisar o canal.*\nVerifique as permissões do bot antes de confirmar.',
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '✅ Sim, enviar',
                  emoji: true,
                },
                style: 'primary',
                action_id: 'confirm_broadcast',
                value: config.welcomeChannelId,
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '❌ Não, cancelar',
                  emoji: true,
                },
                style: 'danger',
                action_id: 'cancel_broadcast',
              },
            ],
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: '⚠️ _Esta ação não pode ser desfeita. Confirme antes de enviar._',
              },
            ],
          },
        ],
        text: `Prévia: ${preview.willReceive} pessoas vão receber DM`,
      });

      logger.info(`✅ Preview de broadcast gerado para ${command.user_id}`);
    } catch (error) {
      logError('Erro ao gerar preview de broadcast', error, { command });
      await respond({
        response_type: 'ephemeral',
        text: '❌ Erro ao gerar prévia. Verifique se o bot tem as permissões necessárias.',
      });
    }
  });

  logger.info('✅ Command handlers registrados');
}
