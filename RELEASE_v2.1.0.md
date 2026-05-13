# Bling MCP Pro v2.1.0 — Security Hardening

Release focada em segurança, derivada de auditoria completa do código. **Não há mudanças quebrantes** (`breaking changes`) na API das ferramentas MCP — usuários em modo `stdio` (Claude Desktop) podem atualizar diretamente.

> ⚠️ **Atenção operacional para usuários em modo SSE/HTTP**: a partir desta versão é **obrigatório** definir a variável `MCP_AUTH_TOKEN` (mínimo 32 caracteres). Veja a seção [Migrando de v2.0.0 para v2.1.0](#migrando-de-v200-para-v210) abaixo.

---

## 🔒 Os 5 fixes de segurança

### 1. Autenticação Bearer no modo SSE/HTTP (crítico)

**Antes**: qualquer pessoa que acessasse a URL do servidor SSE controlava as 45 ferramentas no Bling do operador. O README apenas recomendava "proxy reverso com HTTPS" — mas TLS criptografa, não autentica.

**Agora**: o servidor exige a variável `MCP_AUTH_TOKEN` (≥32 chars) e valida todas as requisições com:

- Header `Authorization: Bearer <token>`
- Comparação tempo-constante via `crypto.timingSafeEqual` (resiste a timing attacks)
- Servidor recusa iniciar em modo de rede se `MCP_AUTH_TOKEN` não estiver definido

### 2. Retry de 401 com limite estrito + dedup de renovações

**Antes**: cada um dos 8 módulos de ferramentas tinha sua própria `handleApiError` que, ao receber 401, chamava `renovarToken()` e re-executava a operação **recursivamente sem contador**. Se o `refresh_token` estivesse permanentemente quebrado, o servidor entrava em loop infinito.

**Agora**: `withTokenRefresh` centraliza toda a lógica:

- Limite estrito de 1 tentativa após renovação (máx. 2 chamadas totais)
- Renovações concorrentes compartilham a mesma `Promise` (race protection em modo SSE multi-cliente)
- Helper antes morto agora é usado por todos os 33 operações

### 3. Persistência do `refresh_token` rotacionado

**Antes**: quando o Bling retornava um novo `refresh_token` (rotação OAuth2), ele era atualizado **apenas em memória**. No próximo restart, o servidor lia o `refresh_token` antigo do `.env` — possivelmente já invalidado — e quebrava a renovação.

**Agora**: após rotação, o novo `refresh_token` é gravado no arquivo `.env` com permissão `0600`. O caminho pode ser customizado via `BLING_ENV_FILE`. Se o arquivo não existir (deployments puramente baseados em env vars), o erro é logado mas não propagado.

### 4. PII removida de logs de erro

**Antes**: handlers locais logavam `JSON.stringify(error.response?.data, null, 2)` em nível `error`. O payload de erro do Bling pode conter nome completo, CPF/CNPJ, email e telefone do cliente afetado. Como a string já vinha serializada, a redação automática do logger não atuava.

**Agora**:

- Os `logger.error('Data:', JSON.stringify(...))` foram removidos junto dos handlers locais
- Response body só aparece em `LOG_LEVEL=debug`, e mesmo aí passa pelo redator
- Lista de chaves sensíveis ampliada para incluir `email`, `telefone`, `celular`, `cpfCnpj`, `numeroDocumento`, `dataNascimento`, `endereco`, `cep`, `inscricaoEstadual`

### 5. Validação rigorosa de `MCP_TRANSPORT`

**Antes**: `process.env.MCP_TRANSPORT` era lido com fallback silencioso — valores inválidos ou `http` (não suportado puro) caíam em SSE sem aviso.

**Agora**: `parseTransport()` aceita apenas `stdio | sse | http` e aborta a inicialização com mensagem clara se receber outro valor.

---

## 📦 Outras melhorias

- Lista de chaves sensíveis no logger ampliada (PII brasileira: CPF/CNPJ, endereço, inscrição estadual)
- README documenta o fluxo completo de configuração SSE com Bearer, incluindo comandos para gerar token forte em Linux/macOS/Windows
- `SECURITY.md` atualizado com as práticas de segurança da v2.1.0
- Servidor reporta o transporte ativo no log de inicialização

---

## Migrando de v2.0.0 para v2.1.0

### Modo `stdio` (Claude Desktop)

✅ **Nenhuma mudança necessária.** A versão é compatível ponto-a-ponto.

### Modo SSE/HTTP (Claude Web, deploys remotos)

1. Gere um Bearer token forte:

   ```bash
   # Linux / macOS
   openssl rand -hex 32

   # Windows (PowerShell)
   -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
   ```

2. Adicione ao seu `.env`:

   ```
   MCP_AUTH_TOKEN=cole_o_valor_gerado_aqui
   ```

3. Adicione o header em qualquer cliente que se conecte ao SSE:

   ```
   Authorization: Bearer cole_o_valor_gerado_aqui
   ```

4. Reinicie o servidor.

Sem o passo 2, o servidor recusa iniciar com mensagem clara apontando o que falta.

---

## Comparação com v2.0.0

| Aspecto | v2.0.0 | v2.1.0 |
|---------|--------|--------|
| Autenticação no SSE/HTTP | ❌ Sem auth | ✅ Bearer obrigatório (≥32 chars, comparação tempo-constante) |
| Retry de 401 | ⚠️ Recursão potencialmente infinita | ✅ Limite de 1 tentativa + dedup |
| Refresh token rotacionado | ⚠️ Só em memória | ✅ Persistido no `.env` (`0600`) |
| PII em logs de erro | ⚠️ Vazava em response.data | ✅ Removida; redação ampliada |
| Validação de `MCP_TRANSPORT` | ⚠️ Fallback silencioso | ✅ Falha rápida com erro claro |
| Código morto (`withTokenRefresh`) | ⚠️ Definido mas não usado | ✅ Usado em todas as 33 operações |
