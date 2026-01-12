/**
 * Bot de Benefícios Alcina Maria
 * Entrada principal da aplicação
 */

import { logger } from './utils/logger';
import { createSlackApp, startSlackApp, stopSlackApp } from './services/slackApp';

// Banner de inicialização
function printBanner() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║                                                ║');
  console.log('║   🎁  Bot de Benefícios Alcina Maria  🎁       ║');
  console.log('║                                                ║');
  console.log('║   Slack Bot para gerenciar benefícios          ║');
  console.log('║   dos colaboradores                            ║');
  console.log('║                                                ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('\n');
}

/**
 * Função principal
 */
async function main() {
  try {
    printBanner();

    logger.info('🚀 Iniciando Bot de Benefícios...');

    // Cria e inicia app
    const app = createSlackApp();
    await startSlackApp(app);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n⚠️  Recebido sinal ${signal}. Encerrando gracefully...`);
      await stopSlackApp(app);
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Tratamento de exceções não capturadas
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error);

      // Evita derrubar o processo e ficar offline (o que causa "dispatch_failed" no Slack).
      // Em produção, prefira rodar com um supervisor (pm2/docker) e decidir se quer reiniciar.
      logger.warn('⚠️ Exceção não capturada. O bot continuará rodando para manter a conexão ativa.');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection:', { reason, promise });

      // Evita derrubar o processo por qualquer rejeição não tratada.
      // Se estiver rodando em produção, use um gerenciador (pm2/docker) para reiniciar em caso de falhas graves.
      if (process.env.NODE_ENV === 'production') {
        logger.warn('⚠️ Rejeição não tratada em produção. O bot continuará rodando para evitar ficar offline.');
      }
    });
  } catch (error) {
    // Tenta logar o erro, mas se o logger falhar, usa console.error
    try {
      logger.error('❌ Erro fatal ao iniciar aplicação:', error);
    } catch {
      console.error('❌ Erro fatal ao iniciar aplicação:', error);
    }
    
    // Aguarda um pouco para garantir que os logs sejam escritos
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

// Executa
main();
