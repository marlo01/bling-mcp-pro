## Melhorias sobre o `bling-mcp` original
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
