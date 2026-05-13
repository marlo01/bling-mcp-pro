import { z } from "zod";
import { Tool } from "fastmcp";
import {
  listarFormasPagamentos,
  obterFormaPagamento,
  criarFormaPagamento,
  atualizarFormaPagamento,
  excluirFormaPagamento,
  FormaPagamento
} from './blingFormasPagamentos.js';
import { handleApiError } from '../../utils/errorHandler.js';

const listarFormasPagamentosParams = z.object({
  pagina: z.number().optional(),
  limite: z.number().optional(),
  descricao: z.string().optional(),
  situacao: z.number().optional(),
  tipoPagamento: z.number().optional(),
  finalidade: z.number().optional(),
});

export const listarFormasPagamentosTool: Tool<undefined, typeof listarFormasPagamentosParams> = {
  name: 'listarFormasPagamentos',
  description: 'Lista as formas de pagamento cadastradas',
  parameters: listarFormasPagamentosParams,
  execute: async (args) => {
    try {
      const formas = await listarFormasPagamentos(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(formas, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarFormasPagamentos', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const obterFormaPagamentoParams = z.object({
  id: z.string().describe('ID da forma de pagamento')
});

export const obterFormaPagamentoTool: Tool<undefined, typeof obterFormaPagamentoParams> = {
  name: 'obterFormaPagamento',
  description: 'Obtém uma forma de pagamento pelo ID',
  parameters: obterFormaPagamentoParams,
  execute: async (args) => {
    try {
      const forma = await obterFormaPagamento(args.id);
      return {
        content: [{ type: 'text', text: JSON.stringify(forma, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterFormaPagamento', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const criarFormaPagamentoParams = z.object({
  descricao: z.string(),
  tipoPagamento: z.number(),
  finalidade: z.number(),
  situacao: z.number().optional(),
  padrao: z.number().optional()
});

export const criarFormaPagamentoTool: Tool<undefined, typeof criarFormaPagamentoParams> = {
  name: 'criarFormaPagamento',
  description: 'Cria uma nova forma de pagamento',
  parameters: criarFormaPagamentoParams,
  execute: async (args) => {
    try {
      const forma = await criarFormaPagamento(args as Omit<FormaPagamento, "id">);
      return {
        content: [{ type: 'text', text: JSON.stringify(forma, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'criarFormaPagamento', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const atualizarFormaPagamentoParams = z.object({
  id: z.string().describe('ID da forma de pagamento'),
  descricao: z.string().optional(),
  tipoPagamento: z.number().optional(),
  finalidade: z.number().optional(),
  situacao: z.number().optional(),
  padrao: z.number().optional()
});

export const atualizarFormaPagamentoTool: Tool<undefined, typeof atualizarFormaPagamentoParams> = {
  name: 'atualizarFormaPagamento',
  description: 'Atualiza uma forma de pagamento pelo ID',
  parameters: atualizarFormaPagamentoParams,
  execute: async (args) => {
    try {
      const { id, ...data } = args;
      const forma = await atualizarFormaPagamento(id, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(forma, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'atualizarFormaPagamento', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const excluirFormaPagamentoParams = z.object({
  id: z.string().describe('ID da forma de pagamento')
});

export const excluirFormaPagamentoTool: Tool<undefined, typeof excluirFormaPagamentoParams> = {
  name: 'excluirFormaPagamento',
  description: 'Exclui uma forma de pagamento pelo ID',
  parameters: excluirFormaPagamentoParams,
  execute: async (args) => {
    try {
      await excluirFormaPagamento(args.id);
      return {
        content: [{ type: 'text', text: 'Forma de pagamento excluída com sucesso.' }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'excluirFormaPagamento', args) ?? 'Erro desconhecido') }]
      };
    }
  }
}; 