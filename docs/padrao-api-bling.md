# Padrão de Integração com APIs Externas (Bling) - Atualizado

## Estrutura de um módulo de integração
- Cada recurso do Bling deve ter sua própria subpasta em `src/tools/`, por exemplo: `src/tools/produtos/blingProdutos.ts`, `src/tools/produtos/blingProdutosTools.ts`.
- Funções de integração ficam em `<domínio>/bling<Domínio>.ts`.
- Tools MCP ficam em `<domínio>/bling<Domínio>Tools.ts` e só fazem validação e chamada das funções de integração.

## Interfaces para parâmetros e retorno
Sempre defina interfaces para os parâmetros e para o retorno das funções:

```ts
// src/types/Vendedor.ts
export interface ListarVendedoresParams {
  pagina?: number;
  limite?: number;
}

export interface Vendedor {
  id: string;
  nome: string;
  // ... outros campos
}
```

## Exemplo de função de integração
```ts
// src/tools/vendedores/blingVendedores.ts
/**
 * Lista os vendedores cadastrados no Bling
 * @param params - Parâmetros de paginação
 * @returns Lista de vendedores e paginação
 */
export async function listarVendedores(params?: ListarVendedoresParams): Promise<VendedoresResponse> {
  try {
    const response = await blingClient.get('/vendedores', { params });
    return {
      data: response.data.data,
      pagination: {
        page: response.data.page,
        totalPages: response.data.totalPages,
        totalItems: response.data.data.length,
        limit: response.data.limit
      }
    };
  } catch (error) {
    return handleApiError(error, 'listarVendedores', params);
  }
}
```

## Exemplo de tool MCP
```ts
// src/tools/vendedores/blingVendedoresTools.ts
export const listarVendedoresTool: Tool<undefined, typeof listarVendedoresParams> = {
  name: 'listarVendedores',
  description: 'Lista os vendedores cadastrados no Bling',
  parameters: listarVendedoresParams,
  execute: async (args) => {
    try {
      const vendedores = await listarVendedores(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(vendedores, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Erro ao listar vendedores: ${error instanceof Error ? error.message : 'Erro desconhecido'}` }],
        isError: true
      };
    }
  }
};
```

## Adaptação do retorno
Garanta que o retorno da função seja sempre consistente, mesmo que a API varie:

```ts
if (response.data && Array.isArray(response.data.data)) {
  // ...
} else if (Array.isArray(response.data)) {
  // ...
} else {
  // ...
}
```

## Logs detalhados
Sempre registre parâmetros, status e dados relevantes:

```ts
console.log('Buscando vendedor', id);
console.log('Status:', response.status);
console.log('Dados:', response.data);
```

## Documentação JSDoc
Documente cada função, parâmetros e retorno:

```ts
/**
 * Obtém um vendedor pelo ID
 * @param id - ID do vendedor
 * @returns Dados do vendedor
 */
```

## Padrão de nomes
- listarX, obterX, criarX, atualizarX, excluirX

## Checklist para revisão
- [ ] Funções de integração em `<domínio>/bling<Domínio>.ts` com tratamento de erro centralizado
- [ ] Tools MCP em `<domínio>/bling<Domínio>Tools.ts` com try/catch e retorno padronizado de erro
- [ ] Interfaces para parâmetros e retorno criadas e exportadas
- [ ] Logs detalhados presentes
- [ ] Documentação JSDoc em todas as funções
- [ ] Nomes de funções e arquivos padronizados
- [ ] Testado com a API real

> Consulte sempre o módulo de produtos como referência de implementação completa e padronizada!

## Exemplo de exportação
```ts
export { listarVendedores, obterVendedor };
```

- Criar um arquivo por módulo de integração (ex: blingContatos.ts, blingVendedores.ts).
- Sempre criar interfaces para parâmetros e retorno dos métodos.
- Adaptar o retorno da API para um formato consistente no projeto.
- Tratar erros e renovação de token dentro do próprio módulo.
- Adicionar logs detalhados para cada requisição e resposta.
- Documentar cada função com JSDoc.
- Usar nomes de funções no padrão listarX, obterX, criarX, atualizarX, excluirX. 