import { z } from "zod";
import { Tool } from "fastmcp";
import {
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  excluirProdutos,
  Produto
} from './blingProdutos.js';
import { handleApiError } from '../../utils/errorHandler.js';

const listarProdutosParams = z.object({
  pagina: z.number().optional().describe('Número da página'),
  limite: z.number().optional().describe('Limite de registros por página'),
  criterio: z.number().optional().describe('Critério de listagem'),
  tipo: z.string().optional().describe('Tipo do produto'),
  idComponente: z.number().optional().describe('ID do componente'),
  dataInclusaoInicial: z.string().optional().describe('Data de inclusão inicial'),
  dataInclusaoFinal: z.string().optional().describe('Data de inclusão final'),
  dataAlteracaoInicial: z.string().optional().describe('Data de alteração inicial'),
  dataAlteracaoFinal: z.string().optional().describe('Data de alteração final'),
  idCategoria: z.number().optional().describe('ID da categoria do produto'),
  idLoja: z.number().optional().describe('ID da loja'),
  nome: z.string().optional().describe('Nome do produto'),
  idsProdutos: z.array(z.number()).optional().describe('IDs dos produtos'),
  codigos: z.array(z.string()).optional().describe('Códigos (SKU) dos produtos')
});

export const listarProdutosTool: Tool<undefined, typeof listarProdutosParams> = {
  name: 'listarProdutos',
  description: 'Lista os produtos cadastrados no Bling',
  parameters: listarProdutosParams,
  execute: async (args, context) => {
    try {
      const response = await listarProdutos(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              produtos: response.data,
              total: response.pagination.totalItems,
              pagina: response.pagination.page,
              totalPaginas: response.pagination.totalPages
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarProdutos', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const obterProdutoParams = z.object({
  id: z.string().describe('ID do produto (obrigatório)')
});

export const obterProdutoTool: Tool<undefined, typeof obterProdutoParams> = {
  name: 'obterProduto',
  description: 'Obtém um produto pelo ID',
  parameters: obterProdutoParams,
  execute: async (args, context) => {
    try {
      if (!args.id) {
        return {
          content: [
            {
              type: 'text',
              text: "Erro: o parâmetro 'id' é obrigatório para obter um produto.",
            },
          ],
          isError: true,
        };
      }
      const produto = await obterProduto(args.id);
      return { content: [{ type: 'text', text: JSON.stringify(produto, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterProduto', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const criarProdutoParams = z.object({
  nome: z.string().min(1).describe('Nome do produto (obrigatório)'),
  tipo: z.enum(['S', 'P', 'N']).describe('Tipo do produto: S=Serviço, P=Produto, N=Serviço 06 21 22'),
  situacao: z.enum(['A', 'I']).optional().describe('Situação: A=Ativo, I=Inativo'),
  formato: z.enum(['S', 'V', 'E']).optional().describe('Formato: S=Simples, V=Variações, E=Composição'),
  preco: z.number().optional().describe('Preço do produto'),
  codigo: z.string().optional().describe('Código do produto'),
  descricaoCurta: z.string().optional().describe('Descrição curta'),
  // ... outros campos relevantes ...
}).passthrough();

export const criarProdutoTool: Tool<undefined, typeof criarProdutoParams> = {
  name: 'criarProduto',
  description: 'Cria um novo produto no Bling',
  parameters: criarProdutoParams,
  execute: async (args, context) => {
    try {
      const produto = await criarProduto(args as Produto);
      return {
        content: [{ type: 'text', text: JSON.stringify(produto, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'criarProduto', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const atualizarProdutoParams = z.object({
  id: z.string().describe('ID do produto (obrigatório)'),
  // Os campos abaixo são opcionais para atualização parcial
  nome: z.string().optional(),
  tipo: z.enum(['S', 'P', 'N']).optional(),
  situacao: z.enum(['A', 'I']).optional(),
  formato: z.enum(['S', 'V', 'E']).optional(),
  preco: z.number().optional(),
  codigo: z.string().optional(),
  descricaoCurta: z.string().optional(),
  // ... outros campos relevantes ...
}).passthrough();

export const atualizarProdutoTool: Tool<undefined, typeof atualizarProdutoParams> = {
  name: 'atualizarProduto',
  description: 'Atualiza um produto existente no Bling',
  parameters: atualizarProdutoParams,
  execute: async (args, context) => {
    try {
      if (!args.id) {
        return {
          content: [
            {
              type: 'text',
              text: "Erro: o parâmetro 'id' é obrigatório para atualizar um produto.",
            },
          ],
          isError: true,
        };
      }
      const { id, ...dados } = args;
      const produto = await atualizarProduto(id, dados);
      return { content: [{ type: 'text', text: JSON.stringify(produto, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'atualizarProduto', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const excluirProdutoParams = z.object({
  id: z.string().describe('ID do produto (obrigatório)')
});

export const excluirProdutoTool: Tool<undefined, typeof excluirProdutoParams> = {
  name: 'excluirProduto',
  description: 'Exclui um produto pelo ID',
  parameters: excluirProdutoParams,
  execute: async (args, context) => {
    try {
      if (!args.id) {
        return {
          content: [
            {
              type: 'text',
              text: "Erro: o parâmetro 'id' é obrigatório para excluir um produto.",
            },
          ],
          isError: true,
        };
      }
      await excluirProduto(args.id);
      return { content: [{ type: 'text', text: 'Produto excluído com sucesso.' }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'excluirProduto', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const excluirProdutosParams = z.object({
  idsProdutos: z.array(z.string()).min(1).describe('IDs dos produtos a serem excluídos')
});

export const excluirProdutosTool: Tool<undefined, typeof excluirProdutosParams> = {
  name: 'excluirProdutos',
  description: 'Exclui múltiplos produtos pelos IDs',
  parameters: excluirProdutosParams,
  execute: async (args, context) => {
    try {
      if (!args.idsProdutos || args.idsProdutos.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: "Erro: é obrigatório informar ao menos um ID para exclusão.",
            },
          ],
          isError: true,
        };
      }
      await excluirProdutos(args.idsProdutos.map(Number));
      return { content: [{ type: 'text', text: 'Produtos excluídos com sucesso.' }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'excluirProdutos', args) ?? 'Erro desconhecido') }]
      };
    }
  }
}; 