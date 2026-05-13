import { z } from "zod";
import { Tool } from "fastmcp";
import {
  listarCategoriasProdutos,
  obterCategoriaProduto,
  criarCategoriaProduto,
  atualizarCategoriaProduto,
  excluirCategoriaProduto,
  listarCategoriasReceitasDespesas,
  obterCategoriaReceitaDespesa,
  criarCategoriaReceitaDespesa,
  atualizarCategoriaReceitaDespesa,
  excluirCategoriaReceitaDespesa,
  CategoriaProduto,
  CategoriaReceitaDespesa
} from './blingCategorias.js';
import { handleApiError } from '../../utils/errorHandler.js';

const listarCategoriasProdutosParams = z.object({
  pagina: z.number().optional(),
  limite: z.number().optional(),
  descricao: z.string().optional()
});

export const listarCategoriasProdutosTool: Tool<undefined, typeof listarCategoriasProdutosParams> = {
  name: 'listarCategoriasProdutos',
  description: 'Lista as categorias de produtos',
  parameters: listarCategoriasProdutosParams,
  execute: async (args) => {
    try {
      const categorias = await listarCategoriasProdutos(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(categorias, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarCategoriasProdutos', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const obterCategoriaProdutoParams = z.object({
  id: z.string().describe('ID da categoria de produto')
});

export const obterCategoriaProdutoTool: Tool<undefined, typeof obterCategoriaProdutoParams> = {
  name: 'obterCategoriaProduto',
  description: 'Obtém uma categoria de produto pelo ID',
  parameters: obterCategoriaProdutoParams,
  execute: async (args) => {
    try {
      const categoria = await obterCategoriaProduto(args.id);
      return {
        content: [{ type: 'text', text: JSON.stringify(categoria, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterCategoriaProduto', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const criarCategoriaProdutoParams = z.object({
  descricao: z.string()
});

export const criarCategoriaProdutoTool: Tool<undefined, typeof criarCategoriaProdutoParams> = {
  name: 'criarCategoriaProduto',
  description: 'Cria uma nova categoria de produto',
  parameters: criarCategoriaProdutoParams,
  execute: async (args) => {
    try {
      const categoria = await criarCategoriaProduto(args as Omit<CategoriaProduto, "id">);
      return {
        content: [{ type: 'text', text: JSON.stringify(categoria, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'criarCategoriaProduto', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const atualizarCategoriaProdutoParams = z.object({
  id: z.string().describe('ID da categoria de produto'),
  descricao: z.string().optional()
});

export const atualizarCategoriaProdutoTool: Tool<undefined, typeof atualizarCategoriaProdutoParams> = {
  name: 'atualizarCategoriaProduto',
  description: 'Atualiza uma categoria de produto pelo ID',
  parameters: atualizarCategoriaProdutoParams,
  execute: async (args) => {
    try {
      const { id, ...data } = args;
      const categoria = await atualizarCategoriaProduto(id, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(categoria, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'atualizarCategoriaProduto', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const excluirCategoriaProdutoParams = z.object({
  id: z.string().describe('ID da categoria de produto')
});

export const excluirCategoriaProdutoTool: Tool<undefined, typeof excluirCategoriaProdutoParams> = {
  name: 'excluirCategoriaProduto',
  description: 'Exclui uma categoria de produto pelo ID',
  parameters: excluirCategoriaProdutoParams,
  execute: async (args) => {
    try {
      await excluirCategoriaProduto(args.id);
      return {
        content: [{ type: 'text', text: 'Categoria de produto excluída com sucesso.' }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'excluirCategoriaProduto', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const listarCategoriasReceitasDespesasParams = z.object({
  pagina: z.number().optional(),
  limite: z.number().optional(),
  descricao: z.string().optional(),
  tipo: z.number().optional()
});

export const listarCategoriasReceitasDespesasTool: Tool<undefined, typeof listarCategoriasReceitasDespesasParams> = {
  name: 'listarCategoriasReceitasDespesas',
  description: 'Lista as categorias de receitas/despesas',
  parameters: listarCategoriasReceitasDespesasParams,
  execute: async (args) => {
    try {
      const categorias = await listarCategoriasReceitasDespesas(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(categorias, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarCategoriasReceitasDespesas', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const obterCategoriaReceitaDespesaParams = z.object({
  id: z.string().describe('ID da categoria de receita/despesa')
});

export const obterCategoriaReceitaDespesaTool: Tool<undefined, typeof obterCategoriaReceitaDespesaParams> = {
  name: 'obterCategoriaReceitaDespesa',
  description: 'Obtém uma categoria de receita/despesa pelo ID',
  parameters: obterCategoriaReceitaDespesaParams,
  execute: async (args) => {
    try {
      const categoria = await obterCategoriaReceitaDespesa(args.id);
      return {
        content: [{ type: 'text', text: JSON.stringify(categoria, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterCategoriaReceitaDespesa', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const criarCategoriaReceitaDespesaParams = z.object({
  descricao: z.string(),
  tipo: z.number(),
  idCategoriaPai: z.number().optional()
});

export const criarCategoriaReceitaDespesaTool: Tool<undefined, typeof criarCategoriaReceitaDespesaParams> = {
  name: 'criarCategoriaReceitaDespesa',
  description: 'Cria uma nova categoria de receita/despesa',
  parameters: criarCategoriaReceitaDespesaParams,
  execute: async (args) => {
    try {
      const categoria = await criarCategoriaReceitaDespesa(args as Omit<CategoriaReceitaDespesa, "id">);
      return {
        content: [{ type: 'text', text: JSON.stringify(categoria, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'criarCategoriaReceitaDespesa', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const atualizarCategoriaReceitaDespesaParams = z.object({
  id: z.string().describe('ID da categoria de receita/despesa'),
  descricao: z.string().optional(),
  tipo: z.number().optional(),
  idCategoriaPai: z.number().optional()
});

export const atualizarCategoriaReceitaDespesaTool: Tool<undefined, typeof atualizarCategoriaReceitaDespesaParams> = {
  name: 'atualizarCategoriaReceitaDespesa',
  description: 'Atualiza uma categoria de receita/despesa pelo ID',
  parameters: atualizarCategoriaReceitaDespesaParams,
  execute: async (args) => {
    try {
      const { id, ...data } = args;
      const categoria = await atualizarCategoriaReceitaDespesa(id, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(categoria, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'atualizarCategoriaReceitaDespesa', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const excluirCategoriaReceitaDespesaParams = z.object({
  id: z.string().describe('ID da categoria de receita/despesa')
});

export const excluirCategoriaReceitaDespesaTool: Tool<undefined, typeof excluirCategoriaReceitaDespesaParams> = {
  name: 'excluirCategoriaReceitaDespesa',
  description: 'Exclui uma categoria de receita/despesa pelo ID',
  parameters: excluirCategoriaReceitaDespesaParams,
  execute: async (args) => {
    try {
      await excluirCategoriaReceitaDespesa(args.id);
      return {
        content: [{ type: 'text', text: 'Categoria de receita/despesa excluída com sucesso.' }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'excluirCategoriaReceitaDespesa', args) ?? 'Erro desconhecido') }]
      };
    }
  }
}; 