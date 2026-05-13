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

- ✅ **Redação automática de tokens em logs** — tokens, secrets e dados sensíveis nunca aparecem em logs acima do nível DEBUG
- ✅ **Validação reforçada de configuração** — tokens malformados são rejeitados na inicialização
- ✅ **HTTPS obrigatório** — a API URL é validada para forçar HTTPS
- ✅ **Rate limiting** — protege contra abuso e estouro de limites da API do Bling
- ✅ **Timeout em todas as requisições** — previne travamentos
- ✅ **Encerramento limpo** — SIGINT/SIGTERM tratados corretamente
- ✅ **Sem dependências com vulnerabilidades conhecidas** (auditado via `npm audit`)

## O que você como usuário deve fazer

- 🔐 **Nunca commite seu `.env`** no Git
- 🔐 Use **variáveis de ambiente** em produção, não arquivos `.env`
- 🔐 Use um **token com escopo mínimo** no Bling (somente o necessário)
- 🔐 **Rotacione tokens periodicamente** (mensalmente é uma boa prática)
- 🔐 Configure `LOG_LEVEL=info` ou `warn` em produção (nunca `debug`)
- 🔐 Em deployment HTTP/SSE, sempre coloque atrás de um **proxy reverso com TLS** (Nginx/Caddy)

## Aviso legal

Este software é fornecido "como está", sem garantias. O uso é por sua conta e risco.
Não somos responsáveis por vazamentos decorrentes de má configuração do usuário.
