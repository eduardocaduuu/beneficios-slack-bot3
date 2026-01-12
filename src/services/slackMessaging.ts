/**
 * Helpers de envio de mensagens no Slack (DM + retry de rate limit)
 */

import { WebClient, WebAPICallError } from '@slack/web-api';
import { logger } from '../utils/logger';

function isWebApiCallError(err: unknown): err is WebAPICallError {
  return typeof err === 'object' && err !== null && 'data' in err;
}

function getRetryAfterMs(err: unknown): number | null {
  if (!isWebApiCallError(err)) return null;

  // Slack costuma mandar retry-after em segundos no header
  // O SDK expõe isso em err.data?.retry_after ou em err.headers?.['retry-after'] dependendo da versão.
  const anyErr = err as any;
  const retryAfterSeconds =
    anyErr?.data?.retry_after ??
    anyErr?.retryAfter ??
    (typeof anyErr?.headers?.['retry-after'] !== 'undefined' ? Number(anyErr.headers['retry-after']) : undefined);

  if (typeof retryAfterSeconds === 'number' && Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.ceil(retryAfterSeconds * 1000);
  }

  return null;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executa uma chamada na Web API com retry simples para rate limiting.
 */
export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  opts: { maxRetries?: number; baseDelayMs?: number; actionName?: string } = {}
): Promise<T> {
  const maxRetries = opts.maxRetries ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 1000;
  const actionName = opts.actionName ?? 'slack_api_call';

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      const slackError = err?.data?.error || err?.code || err?.message;

      const isRateLimited =
        slackError === 'ratelimited' ||
        slackError === 'rate_limited' ||
        slackError === 'slack_webapi_rate_limited';

      if (!isRateLimited || attempt >= maxRetries) {
        throw err;
      }

      const retryAfterMs = getRetryAfterMs(err);
      const waitMs = retryAfterMs ?? baseDelayMs * Math.pow(2, attempt);

      logger.warn(`⏳ Rate limit (${actionName}). Tentativa ${attempt + 1}/${maxRetries}. Aguardando ${waitMs}ms...`);
      await delay(waitMs);
      attempt++;
      continue;
    }
  }
}

/**
 * Envia DM para um usuário de forma robusta:
 * - abre (ou reutiliza) a conversa via conversations.open
 * - envia a mensagem no channel id retornado
 */
export async function sendDm(
  client: WebClient,
  userId: string,
  params: { text: string; blocks?: any[] }
): Promise<void> {
  const opened = await withRateLimitRetry(
    () => client.conversations.open({ users: userId }),
    { actionName: 'conversations.open' }
  );

  const dmChannelId = (opened as any)?.channel?.id as string | undefined;
  if (!dmChannelId) {
    throw new Error(`Não foi possível abrir DM para o usuário ${userId}`);
  }

  await withRateLimitRetry(
    () =>
      client.chat.postMessage({
        channel: dmChannelId,
        text: params.text,
        blocks: params.blocks,
      }),
    { actionName: 'chat.postMessage' }
  );
}
