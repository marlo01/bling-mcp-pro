# Padrão de Tratamento de Erros (Atualizado)

## Tratamento de erro nos módulos de integração
- Cada módulo de integração (ex: produtos, contatos) deve ter uma função `handleApiError` centralizada.
- Todas as funções de integração devem usar `try/catch` e delegar para `handleApiError`.
- Para erros 401 (token expirado), a função handleApiError deve tentar renovar o token e repetir a operação.
- Sempre lançar erros claros e amigáveis para o consumidor da função.

```ts
// Exemplo em src/tools/produtos/blingProdutos.ts
async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    await renovarToken();
    if (funcName === 'listarProdutos') return listarProdutos(params);
    if (funcName === 'obterProduto') return obterProduto(params.id);
    // ...
  }
  if (axios.isAxiosError(error)) {
    console.error(`Erro em ${funcName}:`, error.response?.status, error.response?.data);
    throw new Error(`Erro ao ${funcName}: ${error.response?.data?.message || error.message}`);
  }
  throw error;
}
```

## Tratamento de erro nas tools MCP
- Toda tool MCP (em `<domínio>/bling<Domínio>Tools.ts`) deve envolver o execute em `try/catch`.
- Sempre retornar `{ isError: true }` e uma mensagem amigável em caso de erro.

```ts
export const listarProdutosTool: Tool<undefined, typeof listarProdutosParams> = {
  name: 'listarProdutos',
  description: 'Lista os produtos cadastrados no Bling',
  parameters: listarProdutosParams,
  execute: async (args) => {
    try {
      const produtos = await listarProdutos(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(produtos, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Erro ao listar produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}` }],
        isError: true
      };
    }
  }
};
```

## Checklist para revisão de tratamento de erro
- [ ] Todas as funções de integração usam try/catch e delegam para handleApiError
- [ ] Todas as tools MCP usam try/catch no execute e retornam { isError: true } em caso de erro
- [ ] Mensagens de erro são claras e amigáveis
- [ ] Não é necessário alterar nada fora da pasta tools para tratamento de erro

## Dicas
- Sempre logue detalhes do erro (status, mensagem, dados da resposta) nos módulos de integração
- Documente o comportamento de erro nas JSDoc das funções
- Consulte o módulo de produtos como referência de implementação

## Uso de try/catch
Sempre envolva chamadas externas em try/catch:

```ts
try {
  const response = await blingClient.get('/contatos');
  return response.data;
} catch (error) {
  return handleApiError(error, 'listarContatos', params);
}
```

## Função handleApiError
Centralize o tratamento de erro em uma função por módulo:

```ts
async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    // Token expirado, tentar renovar
    await renovarToken();
    // Repetir operação
    if (funcName === 'listarContatos') return listarContatos(params);
    // ...
  }
  if (axios.isAxiosError(error)) {
    console.error(`Erro em ${funcName}:`, error.response?.status, error.response?.data);
    throw new Error(`Erro ao ${funcName}: ${error.response?.data?.message || error.message}`);
  }
  throw error;
}
```

## Exemplo de log de erro
```ts
console.error('Erro ao criar contato:', error);
console.error('Status:', error.response?.status);
console.error('Data:', error.response?.data);
```

## Lançando erros claros
Sempre lance erros com mensagens compreensíveis para o consumidor:

```ts
throw new Error('Erro ao criar contato: CPF já cadastrado');
```

## Documentação de erros
Explique na JSDoc como a função lida com erros:

```ts
/**
 * Cria um novo contato
 * @throws Erro se o contato já existir ou houver erro de validação
 */
```

- Usar try/catch em todas as funções que fazem requisições externas.
- Centralizar o tratamento de erro em uma função handleApiError dentro de cada módulo.
- Para erros 401 (token expirado), tentar renovar o token e repetir a operação.
- Logar detalhes do erro (status, mensagem, dados da resposta).
- Lançar erros claros para o consumidor da função.
- Sempre documentar o comportamento de erro na JSDoc da função. 