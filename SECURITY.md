# Política de Segurança

## Versões com suporte de segurança

| Versão | Suportada          |
| ------ | ------------------ |
| 2.x    | ✅ Sim             |
| 1.x    | ❌ Não (fork antigo) |

## Reportando uma vulnerabilidade

Se você descobrir uma vulnerabilidade de segurança neste projeto:

**NÃO abra uma issue pública.** Em vez disso:

1. Envie um e-mail para: `cdbbahia2@gmail.com`
2. Inclua:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se tiver)

Responderemos em até **7 dias úteis**.

## Práticas de segurança aplicadas

Este projeto adota as seguintes práticas:

- ✅ **Redação automática de tokens e PII em logs** — tokens, secrets, e dados pessoais (email, telefone, CPF/CNPJ, endereço, data de nascimento) nunca aparecem em logs acima do nível DEBUG
- ✅ **Autenticação Bearer obrigatória no modo SSE/HTTP** *(v2.1.0+)* — exige `MCP_AUTH_TOKEN` com mínimo 32 caracteres; servidor recusa iniciar sem ele em modo de rede
- ✅ **Comparação tempo-constante de tokens** *(v2.1.0+)* — uso de `crypto.timingSafeEqual` impede timing attacks na validação do Bearer
- ✅ **Persistência segura do refresh_token** *(v2.1.0+)* — após rotação OAuth2, o novo `refresh_token` é gravado no `.env` (mode `0600`) para sobreviver a restarts
- ✅ **Retry de 401 com limite estrito** *(v2.1.0+)* — `withTokenRefresh` centraliza a renovação com no máximo 1 tentativa e dedup de chamadas concorrentes (sem mais recursão infinita)
- ✅ **Validação reforçada de configuração** — tokens malformados, `BLING_API_URL` sem HTTPS e `MCP_TRANSPORT` inválido são rejeitados na inicialização
- ✅ **HTTPS obrigatório** — a API URL é validada para forçar HTTPS
- ✅ **Rate limiting** — protege contra abuso e estouro de limites da API do Bling
- ✅ **Timeout em todas as requisições** — previne travamentos
- ✅ **Encerramento limpo** — SIGINT/SIGTERM tratados corretamente
- ✅ **Sem dependências com vulnerabilidades críticas** (auditado via `npm audit`)

## O que você como usuário deve fazer

- 🔐 **Nunca commite seu `.env`** no Git
- 🔐 Use **variáveis de ambiente** em produção, não arquivos `.env`
- 🔐 Use um **token com escopo mínimo** no Bling (somente o necessário)
- 🔐 **Rotacione tokens periodicamente** (mensalmente é uma boa prática) — vale para `BLING_TOKEN` e `MCP_AUTH_TOKEN`
- 🔐 Configure `LOG_LEVEL=info` ou `warn` em produção (nunca `debug`)
- 🔐 Em deployment HTTP/SSE:
  - ✅ Gere `MCP_AUTH_TOKEN` com `openssl rand -hex 32` (32+ chars)
  - ✅ Sempre coloque atrás de um **proxy reverso com TLS** (Nginx/Caddy/Traefik)
  - ✅ Nunca exponha o servidor sem HTTPS — o Bearer token viaja no header
- 🔐 Considere restringir o acesso ao endpoint SSE por **IP allowlist** no proxy, mesmo com Bearer ativo

## Aviso legal

Este software é fornecido "como está", sem garantias. O uso é por sua conta e risco.
Não somos responsáveis por vazamentos decorrentes de má configuração do usuário.
