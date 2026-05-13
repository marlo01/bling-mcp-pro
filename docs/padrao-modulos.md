# Como Criar/Adaptar Novos Módulos (Padrão Atual)

⚠️ **ATENÇÃO: Siga todos os passos abaixo para garantir padronização e evitar bugs!**

## Estrutura de Pastas e Arquivos

- Cada domínio/recurso do Bling (produtos, contatos, etc) fica em uma subpasta de `src/tools/`:
  - Exemplo: `src/tools/produtos/blingProdutos.ts` (funções de integração)
  - Exemplo: `src/tools/produtos/blingProdutosTools.ts` (tools MCP)
- O registro das tools MCP é centralizado em `src/tools/index.ts`.
- **Não é mais necessário alterar o `server.ts` para registrar novas tools.**

## Passo a passo

1. **Analise os endpoints no arquivo `openapi-bling.json`** para entender todos os campos, parâmetros e respostas do recurso.
2. **Crie as funções de integração** em `src/tools/<domínio>/bling<Domínio>.ts` (ex: `src/tools/produtos/blingProdutos.ts`).
3. **Crie as interfaces** para os parâmetros e retorno das funções (no próprio arquivo ou em `src/types/` se forem compartilhadas).
4. **Implemente tratamento de erro e renovação de token** igual aos outros módulos, usando uma função `handleApiError` centralizada.
5. **Adicione logs detalhados** para facilitar o debug (parâmetros, status, resposta, erros).
6. **Documente cada função com JSDoc** (parâmetros, retorno, erros).
7. **Crie as tools MCP** em `src/tools/<domínio>/bling<Domínio>Tools.ts`, importando as funções do módulo e usando zod para validação dos parâmetros.
   - NUNCA implemente lógica de integração diretamente nas tools MCP.
8. **Siga o padrão de nomes:** listarX, obterX, criarX, atualizarX, excluirX.
9. **Registre as tools** em `src/tools/index.ts` para que fiquem disponíveis no MCP.
10. **Exporte as funções e interfaces necessárias** para uso em outros módulos.
11. **Teste com a API real** para garantir que tudo está funcionando conforme esperado.

## Exemplo de registro no index.ts

```ts
// src/tools/index.ts
import { listarProdutosTool, criarProdutoTool } from "./produtos/blingProdutosTools";
import { listarContatosTool } from "./contatos/blingContatosTools";

export function registerTools(mcp: FastMCP<undefined>) {
  mcp.addTool(listarProdutosTool);
  mcp.addTool(criarProdutoTool);
  mcp.addTool(listarContatosTool);
  // ...
}
```

## Padrão para parâmetros de tools MCP
- IDs e arrays de IDs sempre como string no schema Zod das tools MCP.
- Converter para number/number[] antes de chamar a função de integração.

## Checklist para revisão de novos módulos
- [ ] Funções de integração criadas em `<domínio>/bling<Domínio>.ts`
- [ ] Tools MCP criadas em `<domínio>/bling<Domínio>Tools.ts`
- [ ] Tools registradas em `src/tools/index.ts`
- [ ] Testado com a API real

> Consulte sempre o módulo de produtos como referência de implementação completa e padronizada!

## Exemplo prático: service e tool MCP

```ts
// src/tools/produtos/blingProdutos.ts
import { blingClient, renovarToken } from '../blingClient';
import axios from 'axios';

export interface Produto {
  id?: number;
  nome: string;
  preco?: number;
  tipo: 'S' | 'P' | 'N';
  // ... outros campos relevantes ...
}

export async function listarProdutos(params?: { pagina?: number; limite?: number }): Promise<Produto[]> {
  try {
    const response = await blingClient.get('/produtos', { params });
    return response.data.data as Produto[];
  } catch (error) {
    return handleApiError(error, 'listarProdutos', params);
  }
}

async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    await renovarToken();
    if (funcName === 'listarProdutos') return listarProdutos(params);
  }
  throw error;
}
```

```ts
// src/tools/produtos/blingProdutosTools.ts
import { z } from 'zod';
import { Tool } from 'fastmcp';
import { listarProdutos } from './blingProdutos';

const listarProdutosParams = z.object({
  pagina: z.number().optional(),
  limite: z.number().optional()
});

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
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarProdutosTool', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};
