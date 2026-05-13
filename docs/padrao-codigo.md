# Padrão de Código TypeScript/Node (Atualizado)

## Estrutura e organização
- Cada domínio/recurso do Bling fica em uma subpasta de `src/tools`.
- Funções de integração ficam em `<domínio>/bling<Domínio>.ts`.
- Tools MCP ficam em `<domínio>/bling<Domínio>Tools.ts` e só fazem validação e chamada das funções de integração.

## Tipagem explícita e interfaces
Sempre use interfaces ou types para definir a estrutura dos dados:

```ts
// src/types/Produto.ts
export interface Produto {
  id: string;
  nome: string;
  preco: number;
}
```

## Funções assíncronas e tratamento de erro
Prefira sempre `async/await` para lidar com promessas e use try/catch:

```ts
// src/tools/produtos/blingProdutos.ts
export async function obterProduto(id: string): Promise<Produto> {
  try {
    const response = await blingClient.get(`/produtos/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'obterProduto', { id });
  }
}
```

## Tools MCP: validação e chamada da integração
Sempre use try/catch e retorne `{ isError: true }` em caso de erro:

```ts
// src/tools/produtos/blingProdutosTools.ts
export const obterProdutoTool: Tool<undefined, typeof obterProdutoParams> = {
  name: 'obterProduto',
  description: 'Obtém um produto pelo ID',
  parameters: obterProdutoParams,
  execute: async (args) => {
    try {
      const produto = await obterProduto(args.id);
      return {
        content: [{ type: 'text', text: JSON.stringify(produto, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Erro ao obter produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}` }],
        isError: true
      };
    }
  }
};
```

## Logs claros para debug
Utilize `console.log` para registrar ações importantes, parâmetros e respostas:

```ts
console.log('Buscando produto', id);
console.log('Resposta da API:', response.data);
```

## Documentação com JSDoc
Documente todas as funções públicas:

```ts
/**
 * Busca um produto pelo ID
 * @param id - ID do produto
 * @returns Produto encontrado
 */
async function buscarProduto(id: string): Promise<Produto> { ... }
```

## Nomes descritivos
Use nomes claros e objetivos para variáveis, funções e interfaces:

```ts
let quantidadeTotal: number;
function calcularDesconto(valor: number): number { ... }
```

## Convenção de nomes
- camelCase para variáveis e funções: `buscarProduto`, `quantidadeTotal`
- PascalCase para interfaces e tipos: `Produto`, `ContatoPayload`

## Separação de responsabilidades
Cada função deve ter uma responsabilidade clara e arquivos devem ser pequenos e focados:

```ts
// src/tools/produtos/blingProdutos.ts
export async function listarProdutos() { ... }
export async function obterProduto(id: string) { ... }

// src/tools/produtos/blingProdutosTools.ts
export const listarProdutosTool = { ... }
export const obterProdutoTool = { ... }
```

## Checklist para revisão de código
- [ ] Tipagem explícita em todas as funções e variáveis
- [ ] Funções assíncronas usam async/await
- [ ] Todas as funções de integração usam try/catch e handleApiError
- [ ] Todas as tools MCP usam try/catch e retorno padronizado de erro
- [ ] Logs claros para debug
- [ ] Documentação JSDoc presente
- [ ] Nomes descritivos e padronizados
- [ ] Separação de responsabilidades entre integração e tool MCP 