/**
 * Serviço de cache em memória para rate limiting
 * Evita envio duplicado de mensagens para o mesmo usuário
 */

import { MessageCache } from '../types';
import { logger } from '../utils/logger';

// Cache em memória (Map)
const messageCache = new Map<string, MessageCache>();

// TTL padrão: 24 horas em milissegundos
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

/**
 * Gera chave única para cache
 */
function getCacheKey(userId: string, messageType: string): string {
  return `${userId}:${messageType}`;
}

/**
 * Verifica se uma mensagem pode ser enviada (não está em cache)
 */
export function canSendMessage(userId: string, messageType: string): boolean {
  const key = getCacheKey(userId, messageType);
  const cached = messageCache.get(key);

  if (!cached) {
    return true;
  }

  const now = Date.now();
  const elapsed = now - cached.timestamp;

  // Se passou o TTL, remove do cache e permite envio
  if (elapsed >= DEFAULT_TTL) {
    messageCache.delete(key);
    return true;
  }

  // Ainda dentro do TTL
  const remainingHours = Math.ceil((DEFAULT_TTL - elapsed) / (60 * 60 * 1000));
  logger.debug(
    `Rate limit: usuário ${userId} já recebeu ${messageType} há ${remainingHours}h. Bloqueando envio.`
  );
  return false;
}

/**
 * Marca mensagem como enviada (adiciona ao cache)
 */
export function markMessageSent(userId: string, messageType: string): void {
  const key = getCacheKey(userId, messageType);
  messageCache.set(key, {
    userId,
    timestamp: Date.now(),
    messageType,
  });
  logger.debug(`Cache: mensagem ${messageType} marcada como enviada para ${userId}`);
}

/**
 * Remove entrada do cache (útil para testes ou reset manual)
 */
export function clearUserCache(userId: string, messageType?: string): void {
  if (messageType) {
    const key = getCacheKey(userId, messageType);
    messageCache.delete(key);
    logger.debug(`Cache: removida entrada ${messageType} para ${userId}`);
  } else {
    // Remove todas as entradas do usuário
    const keysToDelete: string[] = [];
    messageCache.forEach((value, key) => {
      if (value.userId === userId) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => messageCache.delete(key));
    logger.debug(`Cache: removidas ${keysToDelete.length} entradas para ${userId}`);
  }
}

/**
 * Limpa entradas expiradas do cache (manutenção)
 */
export function cleanExpiredCache(): number {
  const now = Date.now();
  let cleaned = 0;

  messageCache.forEach((value, key) => {
    const elapsed = now - value.timestamp;
    if (elapsed >= DEFAULT_TTL) {
      messageCache.delete(key);
      cleaned++;
    }
  });

  if (cleaned > 0) {
    logger.debug(`Cache: limpas ${cleaned} entradas expiradas`);
  }

  return cleaned;
}

/**
 * Inicia limpeza automática periódica do cache
 */
export function startCacheCleanup(intervalMinutes: number = 60): NodeJS.Timeout {
  const intervalMs = intervalMinutes * 60 * 1000;
  logger.info(`Iniciando limpeza automática de cache a cada ${intervalMinutes} minutos`);

  return setInterval(() => {
    cleanExpiredCache();
  }, intervalMs);
}

/**
 * Retorna estatísticas do cache
 */
export function getCacheStats(): { size: number; entries: MessageCache[] } {
  return {
    size: messageCache.size,
    entries: Array.from(messageCache.values()),
  };
}
