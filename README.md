# Bling MCP Pro 🔒

> Servidor MCP open source para integração segura com a API do Bling ERP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![Status](https://img.shields.io/badge/status-beta-orange)]()

Permite que assistentes baseados em LLM (Claude, etc.) acessem e manipulem dados do Bling ERP através do [Model Context Protocol](https://modelcontextprotocol.io).

> ⚠️ **Projeto não oficial.** Não somos afiliados ao Bling Sistemas Ltda.

---

## 🆕 Melhorias sobre o `bling-mcp` original

Este projeto é um fork hardened do [`bling-mcp` v1.0.1](https://www.npmjs.com/package/bling-mcp), com foco em segurança:

| Aspecto | Original | Pro |
|---------|----------|-----|
| Logs com tokens vazando | ❌ Sim | ✅ Redação automática |
| Validação de config | ❌ Mínima | ✅ Reforçada (HTTPS, formato, tamanho) |
| Rate limiting | ❌ Não tem | ✅ Token bucket configurável |
| Tratamento de erros | ❌ Genérico | ✅ Mensagens por status HTTP |
| Transporte HTTP/SSE | ❌ Comentado | ✅ Funcional |
| Encerramento limpo | ❌ Não tem | ✅ SIGINT/SIGTERM |
| Timeout em requisições | ❌ Não tem | ✅ 30s padrão |
| Documentação | ❌ Incompleta | ✅ Completa |
| Política de segurança | ❌ Não tem | ✅ SECURITY.md |

---

## 📦 Funcionalidades

**45+ ferramentas MCP** cobrindo:

- 📦 **Produtos**: listar, obter, criar, atualizar, excluir (individual e em lote)
- 👥 **Contatos**: CRUD completo + tipos + consumidor final
- 💰 **Contas a Pagar**: CRUD + baixa de conta
- 💵 **Contas a Receber**: CRUD + baixa de conta
- 🏷️ **Categorias**: produtos e receitas/despesas
- 💳 **Formas de Pagamento**: CRUD completo
- 👔 **Vendedores**: listar e obter
- 📊 **Contas Contábeis**: listar

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18 ou superior
- Token de acesso à API do Bling ([como obter](https://developer.bling.com.br))

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/marlo01/bling-mcp-pro.git
cd bling-mcp-pro

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env
# Edite .env e adicione seu BLING_TOKEN

# 4. Compile
npm run build

# 5. Execute
npm start
```

---

## ⚙️ Configuração

Todas as configurações são feitas via variáveis de ambiente. Veja [`.env.example`](.env.example) para a lista completa.

### Mínimo necessário

```bash
BLING_TOKEN=seu_token_aqui
```

### Recomendado para produção

```bash
BLING_TOKEN=seu_token_aqui
BLING_CLIENT_ID=seu_client_id
BLING_CLIENT_SECRET=seu_client_secret
BLING_REFRESH_TOKEN=seu_refresh_token
LOG_LEVEL=info
RATE_LIMIT_PER_SECOND=3
```

---

## 🔌 Integração com Claude

### Claude Desktop (modo stdio)

Adicione ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bling": {
      "command": "node",
      "args": ["/caminho/absoluto/para/bling-mcp-pro/dist/index.js"],
      "env": {
        "BLING_TOKEN": "seu_token_aqui",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Claude Web / Remoto (modo HTTP/SSE)

Para usar como Custom Connector remoto:

```bash
# No seu servidor (VPS, Docker, etc.)
MCP_TRANSPORT=sse MCP_PORT=4545 npm start
```

Depois adicione no Claude: **Settings → Connectors → Add custom connector**

URL: `https://seu-servidor.com/sse`

> ⚠️ **Importante:** Sempre coloque atrás de um proxy reverso com HTTPS (Nginx/Caddy/Traefik).

---

## 🔒 Segurança

Leia [SECURITY.md](SECURITY.md) para detalhes sobre:

- Boas práticas de configuração
- Como reportar vulnerabilidades
- Práticas de segurança aplicadas

**Resumo rápido:**

- ✅ Tokens nunca aparecem em logs (exceto em `LOG_LEVEL=debug`)
- ✅ HTTPS obrigatório
- ✅ Rate limiting embutido
- ✅ Validação de configuração na inicialização

---

## 💖 Apoie o projeto

Este é um projeto open source mantido voluntariamente. Se ele te ajuda, considere:

- ⭐ Dar uma estrela no GitHub
- 🐛 Reportar bugs e sugerir melhorias
- 🤝 Contribuir com código (PRs são bem-vindos!)
- ☕ Fazer uma doação via [PIX/Ko-fi/GitHub Sponsors] *(configure em .github/FUNDING.yml)*

**Não oferecemos suporte técnico individual.** Use as [Issues do GitHub](https://github.com/marlo01/bling-mcp-pro/issues) para a comunidade ajudar.

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Por favor:

1. Abra uma issue antes de PRs grandes
2. Mantenha o código limpo e tipado
3. Não adicione `console.log` — use `logger`
4. Não exponha dados sensíveis em logs ou erros
5. Atualize o README se mudar comportamento

---

## 📜 Histórico

Este é um fork derivativo do [`bling-mcp` v1.0.1](https://www.npmjs.com/package/bling-mcp), publicado sob licença MIT em abril de 2025 por autor anônimo. Mantemos a atribuição original na [LICENSE](LICENSE).

---

## ⚖️ Aviso legal

- Este software é fornecido **"como está"**, sem garantias.
- Use por sua conta e risco.
- Não somos afiliados ou endossados pelo Bling Sistemas Ltda.
- "Bling" é marca registrada de seus respectivos donos.
- Não somos responsáveis por danos decorrentes do uso deste software.

---

## 📄 Licença

[MIT](LICENSE) — sinta-se livre para usar, modificar e distribuir.
