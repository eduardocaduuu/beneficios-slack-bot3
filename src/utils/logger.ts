/**
 * Sistema de logging estruturado
 */

import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: logLevel,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

/**
 * Log de erro com contexto adicional
 */
export function logError(message: string, error: unknown, context?: Record<string, unknown>) {
  logger.error(
    {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    },
    message
  );
}

/**
 * Log de evento do Slack
 */
export function logSlackEvent(eventType: string, details: Record<string, unknown>) {
  logger.info(
    {
      eventType,
      ...details,
    },
    `Slack event: ${eventType}`
  );
}
