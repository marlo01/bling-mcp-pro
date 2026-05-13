import { z } from "zod";
import { Tool } from "fastmcp";
import {
  listarContasReceber,
  obterContaReceber,
  criarContaReceber,
  atualizarContaReceber,
  excluirContaReceber,
  baixarContaReceber,
  ContaReceber
} from './blingContasReceber.js';
import { handleApiError } from '../../utils/errorHandler.js';

const listarContasReceberParams = z.object({
  pagina: z.number().optional(),
  limite: z.number().optional(),
  situacoes: z.array(z.number()).optional(),
  tipoFiltroData: z.string().optional(),
  dataInicial: z.string().optional(),
  dataFinal: z.string().optional(),
  idsCategorias: z.array(z.number()).optional(),
  idPortador: z.number().optional(),
  idContato: z.number().optional(),
  idVendedor: z.number().optional(),
  idFormaPagamento: z.number().optional(),
  boletoGerado: z.number().optional()
});

export const listarContasReceberTool: Tool<undefined, typeof listarContasReceberParams> = {
  name: 'listarContasReceber',
  description: 'Lista as contas a receber cadastradas',
  parameters: listarContasReceberParams,
  execute: async (args, context) => {
    try {
      const params = {
        ...args,
        situacoes: args.situacoes ? args.situacoes.map(Number) : undefined,
        idsCategorias: args.idsCategorias ? args.idsCategorias.map(Number) : undefined,
      };
      const response = await listarContasReceber(params);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              contas: response.data,
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
        content: [{ type: 'text', text: String(handleApiError(error, 'listarContasReceber', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const obterContaReceberParams = z.object({
  id: z.string().describe('ID da conta a receber (obrigatório)')
});

export const obterContaReceberTool: Tool<undefined, typeof obterContaReceberParams> = {
  name: 'obterContaReceber',
  description: 'Obtém uma conta a receber pelo ID',
  parameters: obterContaReceberParams,
  execute: async (args, context) => {
    try {
      if (!args.id) {
        return {
          content: [
            {
              type: 'text',
              text: "Erro: o parâmetro 'id' é obrigatório para obter uma conta a receber.",
            },
          ],
          isError: true,
        };
      }
      const conta = await obterContaReceber(args.id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(conta, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterContaReceber', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

const criarContaReceberParams = z.object({
  idContato: z.string().describe('ID do contato (cliente) já cadastrado no Bling. Use a tool listarContatos para obter. Exemplo: "12345678"'),
  idFormaPagamento: z.string().describe('ID da forma de pagamento já cadastrada no Bling. Use a tool listarFormasPagamentos para obter. Exemplo: "12345678"'),
  idCategoria: z.string().describe('ID da categoria de receita/despesa já cadastrada no Bling. Use a tool listarCategoriasReceitasDespesas para obter. Exemplo: "12345678"'),
  idPortador: z.string().describe('ID da conta contábil (portador: conta bancária, caixa, integração de pagamento, etc) já cadastrada no Bling. Use a tool listarContasContabeis para obter. Exemplo: "12345678"'),
  situacao: z.number().describe('Situação da conta. 1 = Aberto, 2 = Pago, 3 = Parcial, 4 = Devolvido, 5 = Cancelado, 6 = Devolvido parcial, 7 = Confirmado. Exemplo: 1'),
  vencimento: z.string().describe('Data de vencimento da conta no formato YYYY-MM-DD. Exemplo: "2023-01-12"'),
  valor: z.number().describe('Valor total da conta. Exemplo: 1500.75'),
  ocorrencia: z.object({
    tipo: z.number().describe('Tipo de recorrência: 1=Única, 2=Parcelada, 3=Mensal, 4=Bimestral, 5=Trimestral, 6=Semestral, 7=Anual, 8=Quinzenal, 9=Semanal'),
    diaVencimento: z.number().optional().describe('Dia do vencimento para recorrências'),
    numeroParcelas: z.number().optional().describe('Número de parcelas (se parcelada)'),
    considerarDiasUteis: z.boolean().optional().describe('Considerar apenas dias úteis (se aplicável)'),
    diaSemanaVencimento: z.number().optional().describe('Dia da semana para vencimento (se semanal)'),
    dataLimite: z.string().optional().describe('Data limite para recorrência (formato YYYY-MM-DD)')
  }).describe('Informações de recorrência da conta. Consulte a documentação para detalhes.'),
  historico: z.string().optional().describe('Descrição da conta para controle interno da empresa.')
});

export const criarContaReceberTool: Tool<undefined, typeof criarContaReceberParams> = {
  name: 'criarContaReceber',
  description: 'Cria uma nova conta a receber',
  parameters: criarContaReceberParams,
  execute: async (args, context) => {
    try {
      const conta = await criarContaReceber(args as ContaReceber);
      return {
        content: [{ type: 'text', text: JSON.stringify(conta, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'criarContaReceber', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const atualizarContaReceberParams = z.object({
  id: z.union([z.string(), z.number()]).describe('ID da conta a receber (obrigatório)'),
  situacao: z.number().optional(),
  vencimento: z.string().optional(),
  valor: z.number().optional(),
  // ... outros campos relevantes ...
}).passthrough();

export const atualizarContaReceberTool: Tool<undefined, typeof atualizarContaReceberParams> = {
  name: 'atualizarContaReceber',
  description: 'Atualiza uma conta a receber existente',
  parameters: atualizarContaReceberParams,
  execute: async (args, context) => {
    try {
      const { id, ...dados } = args;
      const conta = await atualizarContaReceber(id, dados);
      return {
        content: [{ type: 'text', text: JSON.stringify(conta, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'atualizarContaReceber', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const excluirContaReceberParams = z.object({
  id: z.union([z.string(), z.number()]).describe('ID da conta a receber (obrigatório)')
});

export const excluirContaReceberTool: Tool<undefined, typeof excluirContaReceberParams> = {
  name: 'excluirContaReceber',
  description: 'Exclui uma conta a receber pelo ID',
  parameters: excluirContaReceberParams,
  execute: async (args, context) => {
    try {
      await excluirContaReceber(args.id);
      return {
        content: [{ type: 'text', text: 'Conta a receber excluída com sucesso.' }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'excluirContaReceber', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const baixarContaReceberParams = z.object({
  id: z.union([z.string(), z.number()]).describe('ID da conta a receber (obrigatório)'),
  payload: z.any().describe('Dados para baixar a conta (obrigatório)')
});

export const baixarContaReceberTool: Tool<undefined, typeof baixarContaReceberParams> = {
  name: 'baixarContaReceber',
  description: 'Baixa (recebe) uma conta a receber',
  parameters: baixarContaReceberParams,
  execute: async (args, context) => {
    try {
      const result = await baixarContaReceber(args.id, args.payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'baixarContaReceber', args) ?? 'Erro desconhecido') }]
      };
    }
  }
}; 