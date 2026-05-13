/**
 * Logger seguro com redação automática de dados sensíveis.
 *
 * NUNCA loga tokens, senhas, secrets ou dados pessoais sensíveis (CPF, e-mail, telefone)
 * em níveis acima de DEBUG. Em produção (LOG_LEVEL=info), esses dados são automaticamente
 * substituídos por "[REDACTED]".
 *
 * @example
 *   logger.info('Listando produtos', { pagina: 1 });
 *   logger.error('Falha ao criar produto', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || 'info';

// Padrões que devem ser redatados de qualquer log fora do nível debug.
const SENSITIVE_KEYS = [
  'token', 'access_token', 'refresh_token', 'authorization',
  'password', 'senha', 'secret', 'client_secret', 'clientSecret',
  'apiKey', 'api_key', 'bearer', 'cpf', 'cnpj', 'rg',
  'cartao', 'cartaoCredito', 'numeroCartao', 'cvv',
  // PII adicional comum em respostas do Bling
  'email', 'telefone', 'celular', 'cpfCnpj', 'numeroDocumento',
  'dataNascimento', 'endereco', 'cep', 'inscricaoEstadual',
];

const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /[a-f0-9]{32,}/gi, // tokens em hex longos
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, // JWT
];

function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    let s = value;
    for (const pattern of SENSITIVE_PATTERNS) {
      s = s.replace(pattern, '[REDACTED]');
    }
    return s;
  }
  if (Array.isArray(value)) return value.map(redactValue);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk.toLowerCase()))) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redactValue(v);
      }
    }
    return out;
  }
  return value;
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

function format(level: LogLevel, msg: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const safeMeta = currentLevel === 'debug' ? meta : redactValue(meta);
  const metaStr = safeMeta !== undefined ? ` ${JSON.stringify(safeMeta)}` : '';
  return `[${ts}] [${level.toUpperCase()}] ${msg}${metaStr}`;
}

export const logger = {
  debug(msg: string, meta?: unknown): void {
    if (shouldLog('debug')) console.error(format('debug', msg, meta));
  },
  info(msg: string, meta?: unknown): void {
    if (shouldLog('info')) console.error(format('info', msg, meta));
  },
  warn(msg: string, meta?: unknown): void {
    if (shouldLog('warn')) console.error(format('warn', msg, meta));
  },
  error(msg: string, meta?: unknown): void {
    if (shouldLog('error')) console.error(format('error', msg, meta));
  },
};

export { redactValue };
