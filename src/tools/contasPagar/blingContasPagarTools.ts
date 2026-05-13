import { z } from "zod";
import { Tool } from "fastmcp";
import {
  listarContasPagar,
  obterContaPagar,
  criarContaPagar,
  atualizarContaPagar,
  excluirContaPagar,
  baixarContaPagar,
  ContaPagar,
} from "./blingContasPagar.js";
import { handleApiError } from "../../utils/errorHandler.js";

const listarContasPagarParams = z.object({
  pagina: z.number().optional(),
  limite: z.number().optional(),
  dataEmissaoInicial: z.string().optional(),
  dataEmissaoFinal: z.string().optional(),
  dataVencimentoInicial: z.string().optional(),
  dataVencimentoFinal: z.string().optional(),
  dataPagamentoInicial: z.string().optional(),
  dataPagamentoFinal: z.string().optional(),
  situacao: z.string().optional(),
  idContato: z.string().optional(),
});

export const listarContasPagarTool: Tool<
  undefined,
  typeof listarContasPagarParams
> = {
  name: "listarContasPagar",
  description: "Lista as contas a pagar cadastradas",
  parameters: listarContasPagarParams,
  execute: async (args, context) => {
    try {
      const params = {
        ...args,
        situacao: args.situacao ? Number(args.situacao) : undefined,
        idContato: args.idContato ? Number(args.idContato) : undefined,
      };
      const response = await listarContasPagar(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                contas: response.data,
                total: response.pagination.totalItems,
                pagina: response.pagination.page,
                totalPaginas: response.pagination.totalPages,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarContasPagar', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

const obterContaPagarParams = z.object({
  id: z.string().describe("ID da conta a pagar"),
});

export const obterContaPagarTool: Tool<
  undefined,
  typeof obterContaPagarParams
> = {
  name: "obterContaPagar",
  description: "Obtém uma conta a pagar pelo ID",
  parameters: obterContaPagarParams,
  execute: async (args, context) => {
    try {
      if (!args.id) {
        return {
          content: [
            { type: "text", text: "Erro: o parâmetro id é obrigatório." },
          ],
          isError: true,
        };
      }
      const conta = await obterContaPagar(Number(args.id));
      return {
        content: [{ type: "text", text: JSON.stringify(conta, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterContaPagar', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

const criarContaPagarParams = z.object({
  idContato: z
    .string()
    .describe(
      'ID do contato (fornecedor) já cadastrado no Bling. Use a tool listarContatos para obter. Exemplo: "12345678"'
    ),
  idFormaPagamento: z
    .string()
    .describe(
      'ID da forma de pagamento já cadastrada no Bling. Use a tool listarFormasPagamentos para obter. Exemplo: "12345678"'
    ),
  idCategoria: z
    .string()
    .describe(
      'ID da categoria de receita/despesa já cadastrada no Bling. Use a tool listarCategoriasReceitasDespesas para obter. Exemplo: "12345678"'
    ),
  idPortador: z
    .string()
    .describe(
      'ID da conta contábil (portador: conta bancária, caixa, integração de pagamento, etc) já cadastrada no Bling. Use a tool listarContasContabeis para obter. Exemplo: "12345678"'
    ),
  situacao: z
    .number()
    .describe(
      "Situação da conta. 1 = Aberto, 2 = Pago, 3 = Parcial, 4 = Devolvido, 5 = Cancelado, 6 = Devolvido parcial, 7 = Confirmado. Exemplo: 1"
    ),
  vencimento: z
    .string()
    .describe(
      'Data de vencimento da conta no formato YYYY-MM-DD. Exemplo: "2023-01-12"'
    ),
  valor: z.number().describe("Valor total da conta. Exemplo: 1500.75"),
  ocorrencia: z
    .object({
      tipo: z
        .number()
        .describe(
          "Tipo de recorrência: 1=Única, 2=Parcelada, 3=Mensal, 4=Bimestral, 5=Trimestral, 6=Semestral, 7=Anual, 8=Quinzenal, 9=Semanal"
        ),
      diaVencimento: z
        .number()
        .optional()
        .describe("Dia do vencimento para recorrências"),
      numeroParcelas: z
        .number()
        .optional()
        .describe("Número de parcelas (se parcelada)"),
      considerarDiasUteis: z
        .boolean()
        .optional()
        .describe("Considerar apenas dias úteis (se aplicável)"),
      diaSemanaVencimento: z
        .number()
        .optional()
        .describe("Dia da semana para vencimento (se semanal)"),
      dataLimite: z
        .string()
        .optional()
        .describe("Data limite para recorrência (formato YYYY-MM-DD)"),
    })
    .describe(
      "Informações de recorrência da conta. Consulte a documentação para detalhes."
    ),
  historico: z
    .string()
    .optional()
    .describe("Descrição da conta para controle interno da empresa."),
});

export const criarContaPagarTool: Tool<
  undefined,
  typeof criarContaPagarParams
> = {
  name: "criarContaPagar",
  description: "Cria uma nova conta a pagar",
  parameters: criarContaPagarParams,
  execute: async (args, context) => {
    try {
      const conta: ContaPagar = {
        ...args,
        idContato: args.idContato ? Number(args.idContato) : undefined,
      };
      const criada = await criarContaPagar(conta);
      return {
        content: [{ type: "text", text: JSON.stringify(criada, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'criarContaPagar', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

const atualizarContaPagarParams = criarContaPagarParams.extend({
  id: z.string().describe("ID da conta a pagar"),
});

export const atualizarContaPagarTool: Tool<
  undefined,
  typeof atualizarContaPagarParams
> = {
  name: "atualizarContaPagar",
  description: "Atualiza uma conta a pagar existente",
  parameters: atualizarContaPagarParams,
  execute: async (args, context) => {
    try {
      const { id, ...contaArgs } = args;
      const conta: Partial<ContaPagar> = {
        ...contaArgs,
        idContato: contaArgs.idContato
          ? Number(contaArgs.idContato)
          : undefined,
      };
      const atualizada = await atualizarContaPagar(Number(id), conta);
      return {
        content: [{ type: "text", text: JSON.stringify(atualizada, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'atualizarContaPagar', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

const excluirContaPagarParams = z.object({
  id: z.string().describe("ID da conta a pagar"),
});

export const excluirContaPagarTool: Tool<
  undefined,
  typeof excluirContaPagarParams
> = {
  name: "excluirContaPagar",
  description: "Exclui uma conta a pagar pelo ID",
  parameters: excluirContaPagarParams,
  execute: async (args, context) => {
    try {
      await excluirContaPagar(Number(args.id));
      return {
        content: [
          { type: "text", text: "Conta a pagar excluída com sucesso." },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'excluirContaPagar', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

const baixarContaPagarParams = z.object({
  id: z.string().describe("ID da conta a pagar"),
  payload: z.any().describe("Dados para baixa/pagamento da conta"),
});

export const baixarContaPagarTool: Tool<
  undefined,
  typeof baixarContaPagarParams
> = {
  name: "baixarContaPagar",
  description: "Baixa (paga) uma conta a pagar",
  parameters: baixarContaPagarParams,
  execute: async (args, context) => {
    try {
      const result = await baixarContaPagar(Number(args.id), args.payload);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'baixarContaPagar', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};
