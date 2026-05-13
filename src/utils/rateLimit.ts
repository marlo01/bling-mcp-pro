/**
 * Rate limiter em memória usando token bucket.
 *
 * Protege contra:
 * - Abuso acidental (loops infinitos chamando a API do Bling)
 * - Estouro de limite da API do Bling (que tem rate limit próprio)
 *
 * Limite padrão: 3 requisições por segundo (conservador, abaixo do limite do Bling).
 * Configurável via env: RATE_LIMIT_PER_SECOND
 */

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_PER_SECOND || '3', 10);
const WINDOW_MS = 1000;

interface BucketState {
  tokens: number;
  lastRefill: number;
}

const bucket: BucketState = {
  tokens: RATE_LIMIT,
  lastRefill: Date.now(),
};

function refill(): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= WINDOW_MS) {
    bucket.tokens = RATE_LIMIT;
    bucket.lastRefill = now;
  }
}

/**
 * Aguarda até que haja um token disponível antes de prosseguir.
 * Bloqueia silenciosamente — ideal para chamadas internas.
 */
export async function rateLimit(): Promise<void> {
  refill();
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return;
  }

  // Esperar até a próxima janela
  const waitMs = WINDOW_MS - (Date.now() - bucket.lastRefill);
  await new Promise(resolve => setTimeout(resolve, waitMs + 10));
  return rateLimit();
}
