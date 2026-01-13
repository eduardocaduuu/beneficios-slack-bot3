/**
 * Configuração e inicialização do Slack App
 */

import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import * as http from 'http';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { registerEventHandlers } from '../handlers/events';
import { registerCommandHandlers } from '../handlers/commands';
import { registerActionHandlers } from '../handlers/actions';
import { startCacheCleanup } from './cacheService';

// Servidor HTTP para health check (usado em Socket Mode para Render)
let healthCheckServer: http.Server | null = null;

/**
 * Inicia servidor HTTP mínimo para health check (necessário para Render em Socket Mode)
 */
function startHealthCheckServer(port: number): void {
  if (healthCheckServer) {
    return; // Já está rodando
  }

  healthCheckServer = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200);
      res.end();
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  healthCheckServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`⚠️ Porta ${port} já está em uso. Health check pode não estar disponível.`);
    } else {
      logger.error('❌ Erro ao iniciar servidor de health check:', err);
    }
  });

  healthCheckServer.listen(port, '0.0.0.0', () => {
    logger.info(`✅ Health check endpoint disponível em http://0.0.0.0:${port}/health`);
  });
}

/**
 * Cria e configura a aplicação Slack
 */
export function createSlackApp(): App {
  let app: App;

  // Configuração base comum
  const baseConfig = {
    token: config.slackBotToken,
    signingSecret: config.slackSigningSecret,
    logLevel: config.nodeEnv === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  };

  // Socket Mode (recomendado para desenvolvimento)
  if (config.appMode === 'socket') {
    logger.info('🔌 Iniciando app em Socket Mode');

    app = new App({
      ...baseConfig,
      socketMode: true,
      appToken: config.slackAppToken,
    });

    // Inicia servidor HTTP mínimo para health check (necessário para Render)
    startHealthCheckServer(config.port);
  }
  // HTTP Mode (para produção com webhook)
  else {
    logger.info('🌐 Iniciando app em HTTP Mode');

    const receiver = new ExpressReceiver({
      signingSecret: config.slackSigningSecret,
    });

    app = new App({
      ...baseConfig,
      receiver,
    });

    // Expõe o servidor Express
    const server = receiver.app;

    // Health check endpoint (supports GET, HEAD, etc. for UptimeRobot compatibility)
    server.all('/health', (_req, res) => {
      res.status(200).end();
    });

    logger.info(`✅ Health check endpoint disponível em http://localhost:${config.port}/health`);
  }

  // Registra handlers
  registerEventHandlers(app);
  registerCommandHandlers(app);
  registerActionHandlers(app);

  // Tratamento global de erros
  app.error(async (error) => {
    logger.error('❌ Erro global capturado:', error);
  });

  return app;
}

/**
 * Inicia a aplicação Slack
 */
export async function startSlackApp(app: App): Promise<void> {
  try {
    if (config.appMode === 'http') {
      await app.start(config.port);
    } else {
      await app.start();
    }

    if (config.appMode === 'socket') {
      logger.info('⚡ Bot em Socket Mode está rodando!');
    } else {
      logger.info(`⚡ Bot em HTTP Mode está rodando na porta ${config.port}!`);
    }

    logger.info(`📢 Monitorando canal: ${config.welcomeChannelId}`);
    logger.info(`📨 Envio de DM: ${config.sendDm ? 'ativado' : 'desativado'}`);

    // Inicia limpeza automática de cache (a cada 1 hora)
    startCacheCleanup(60);

    logger.info('✅ Bot de Benefícios Alcina Maria pronto para uso!');
    logger.info('💡 Use /beneficios para testar');
  } catch (error) {
    logger.error('❌ Erro ao iniciar aplicação:', error);
    throw error;
  }
}

/**
 * Graceful shutdown
 */
export async function stopSlackApp(app: App): Promise<void> {
  try {
    await app.stop();
    
    // Fecha servidor HTTP de health check se estiver rodando
    if (healthCheckServer) {
      await new Promise<void>((resolve, reject) => {
        healthCheckServer!.close((err) => {
          if (err) {
            logger.error('❌ Erro ao fechar servidor de health check:', err);
            reject(err);
          } else {
            healthCheckServer = null;
            logger.info('👋 Servidor de health check encerrado');
            resolve();
          }
        });
      });
    }
    
    logger.info('👋 Bot encerrado com sucesso');
  } catch (error) {
    logger.error('❌ Erro ao encerrar aplicação:', error);
    throw error;
  }
}
