/**
 * Configuração e validação de variáveis de ambiente
 */

import * as dotenv from 'dotenv';
import { AppConfig } from '../types';
import { logger } from '../utils/logger';

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Valida uma variável de ambiente obrigatória
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Variável de ambiente obrigatória não definida: ${key}`);
  }
  return value;
}

/**
 * Obtém uma variável de ambiente opcional com valor padrão
 */
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Converte string para boolean
 */
function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}

/**
 * Valida e retorna a configuração completa do app
 */
export function loadConfig(): AppConfig {
  try {
    const config: AppConfig = {
      slackBotToken: requireEnv('SLACK_BOT_TOKEN'),
      slackAppToken: requireEnv('SLACK_APP_TOKEN'),
      slackSigningSecret: requireEnv('SLACK_SIGNING_SECRET'),
      welcomeChannelId: requireEnv('WELCOME_CHANNEL_ID'),
      sendDm: parseBoolean(getEnv('SEND_DM', 'true')),
      defaultLocale: getEnv('DEFAULT_LOCALE', 'pt-BR'),
      rhContactLink: getEnv('RH_CONTACT_LINK', 'https://slack.com/app_redirect?channel=rh-dp'),
      appMode: (getEnv('APP_MODE', 'socket') as 'socket' | 'http'),
      port: parseInt(getEnv('PORT', '3000'), 10),
      logLevel: getEnv('LOG_LEVEL', 'info'),
      nodeEnv: getEnv('NODE_ENV', 'development'),
    };

    // Validações adicionais
    if (config.appMode !== 'socket' && config.appMode !== 'http') {
      throw new Error('APP_MODE deve ser "socket" ou "http"');
    }

    if (!config.welcomeChannelId.match(/^C[A-Z0-9]+$/)) {
      logger.warn(
        `⚠️ WELCOME_CHANNEL_ID (${config.welcomeChannelId}) não parece ser um ID de canal válido do Slack`
      );
    }

    if (!config.slackBotToken.startsWith('xoxb-')) {
      throw new Error('SLACK_BOT_TOKEN deve começar com "xoxb-"');
    }

    if (config.appMode === 'socket' && !config.slackAppToken.startsWith('xapp-')) {
      throw new Error('SLACK_APP_TOKEN deve começar com "xapp-" para Socket Mode');
    }

    logger.info('✅ Configuração carregada e validada com sucesso');
    logger.debug('Configuração:', {
      appMode: config.appMode,
      welcomeChannelId: config.welcomeChannelId,
      sendDm: config.sendDm,
      nodeEnv: config.nodeEnv,
    });

    return config;
  } catch (error) {
    logger.error('❌ Erro ao carregar configuração:', error);
    logger.error('\n📋 Certifique-se de que o arquivo .env está configurado corretamente.');
    logger.error('💡 Veja o arquivo .env.example para referência.\n');
    throw error;
  }
}

// Exporta configuração carregada
export const config = loadConfig();
