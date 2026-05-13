import dotenv from 'dotenv';

dotenv.config();

export interface BlingConfig {
  apiUrl: string;
  token: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

function validateToken(token: string): void {
  if (!token) return; // validação principal está em validateConfig
  if (token.length < 20) {
    throw new Error('BLING_TOKEN parece inválido (muito curto). Verifique a configuração.');
  }
  // Sem espaços no token
  if (/\s/.test(token)) {
    throw new Error('BLING_TOKEN contém espaços. Remova-os.');
  }
}

export const config: BlingConfig = {
  apiUrl: process.env.BLING_API_URL || 'https://www.bling.com.br/Api/v3',
  token: process.env.BLING_TOKEN || '',
  clientId: process.env.BLING_CLIENT_ID,
  clientSecret: process.env.BLING_CLIENT_SECRET,
  refreshToken: process.env.BLING_REFRESH_TOKEN,
};

/**
 * Valida a configuração e aborta se estiver inadequada.
 * Chamar na inicialização do servidor.
 */
export function validateConfig(): void {
  if (!config.token) {
    throw new Error(
      'BLING_TOKEN não configurado. ' +
        'Defina a variável de ambiente BLING_TOKEN com seu access_token do Bling.',
    );
  }
  validateToken(config.token);

  if (!config.apiUrl.startsWith('https://')) {
    throw new Error('BLING_API_URL deve usar HTTPS por segurança.');
  }
}

export default config;
