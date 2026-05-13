import { z } from "zod";
import { Tool, Context, ContentResult } from "fastmcp";
import {
  listarContatos,
  obterContato,
  criarContato,
  atualizarContato,
  excluirContato,
  listarTiposContato,
  obterConsumidorFinal,
  ContatoPayload,
} from "./blingContatos.js";
import { handleApiError } from '../../utils/errorHandler.js';

// Esquema vazio para ferramentas sem parâmetros
const emptyParams = z.object({});

// Parâmetros para a ferramenta de listar contatos
const listarContatosParams = z.object({
  pesquisa: z
    .string()
    .optional()
    .describe("Busca por nome, CPF, CNPJ, apelido, etc."),
  limite: z.number().optional().describe("Limite de registros por página"),
  pagina: z.number().optional().describe("Número da página"),
  idTipoContato: z.number().optional().describe("ID do tipo de contato"),
  idSituacao: z.number().optional().describe("ID da situação do contato"),
});

export const listarContatosTool: Tool<undefined, typeof listarContatosParams> = {
  name: "listarContatos",
  description: "Lista os contatos cadastrados no Bling",
  parameters: listarContatosParams,
  execute: async (
    args,
    context: Context<undefined>
  ): Promise<ContentResult> => {
    try {
      const response = await listarContatos(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                contatos: response.data,
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
        content: [{ type: 'text', text: String(handleApiError(error, 'listarContatos', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

// Parâmetros para a ferramenta de obter contato
const obterContatoParams = z.object({
  id: z.string().describe("ID do contato que deseja consultar (obrigatório)")
});

export const obterContatoTool: Tool<undefined, typeof obterContatoParams> = {
  name: "obterContato",
  description: "Obtém os dados de um contato específico pelo ID",
  parameters: obterContatoParams,
  execute: async (
    args,
    context: Context<undefined>
  ): Promise<ContentResult> => {
    try {
      if (!args.id) {
        return {
          content: [
            {
              type: "text",
              text: "Erro: o parâmetro 'id' é obrigatório para obter um contato.",
            },
          ],
          isError: true,
        };
      }
      const contato = await obterContato(args.id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(contato, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterContato', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

// Parâmetros para a ferramenta de criar contato
const criarContatoParams = z.object({
  nome: z.string().min(1).describe("Nome do contato (obrigatório)"),
  tipo: z.enum(["F", "J"]).describe("Tipo do contato: F para pessoa física, J para pessoa jurídica (obrigatório)"),
  codigo: z.string().optional().describe("Código do contato (opcional)"),
  situacao: z.enum(["A", "I", "E"]).optional().describe("Situação do contato: A para Ativo, I para Inativo, E para Excluído (opcional)"),
  numeroDocumento: z.string().optional().describe("CPF ou CNPJ do contato"),
  fantasia: z
    .string()
    .optional()
    .describe("Nome fantasia (para pessoa jurídica)"),
  telefone: z.string().optional().describe("Telefone do contato"),
  celular: z.string().optional().describe("Celular do contato"),
  email: z.string().optional().describe("Email do contato"),
  endereco: z
    .object({
      endereco: z.string().optional().describe("Endereço"),
      numero: z.string().optional().describe("Número"),
      complemento: z.string().optional().describe("Complemento"),
      bairro: z.string().optional().describe("Bairro"),
      cep: z.string().optional().describe("CEP"),
      municipio: z.string().optional().describe("Município"),
      uf: z.string().optional().describe("UF"),
      pais: z.string().optional().describe("País"),
    })
    .optional()
    .describe("Endereço do contato"),
});

export const criarContatoTool: Tool<undefined, typeof criarContatoParams> = {
  name: "criarContato",
  description: "Cria um novo contato no Bling",
  parameters: criarContatoParams,
  execute: async (
    args,
    context: Context<undefined>
  ): Promise<ContentResult> => {
    try {
      if (!args.nome) {
        return {
          content: [
            {
              type: "text",
              text: "Erro: o parâmetro 'nome' é obrigatório para criar um contato.",
            },
          ],
          isError: true,
        };
      }
      if (!args.tipo) {
        return {
          content: [
            {
              type: "text",
              text: "Erro: o parâmetro 'tipo' é obrigatório para criar um contato. Use 'F' para pessoa física ou 'J' para pessoa jurídica.",
            },
          ],
          isError: true,
        };
      }
      const contato = await criarContato(args as ContatoPayload);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(contato, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'criarContato', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

// Parâmetros para a ferramenta de atualizar contato
const atualizarContatoParams = z.object({
  id: z.string().describe("ID do contato a ser atualizado (obrigatório)"),
  nome: z.string().min(1).optional().describe("Nome do contato"),
  tipo: z.enum(["F", "J"]).describe("Tipo do contato: F para pessoa física, J para pessoa jurídica"),
  codigo: z.string().optional().describe("Código do contato"),
  situacao: z.enum(["A", "I", "E", "S"]).describe("Situação do contato: A (Ativo), I (Inativo), E (Excluído) ou S (Sem movimento)"),
  numeroDocumento: z.string().optional().describe("CPF ou CNPJ do contato"),
  fantasia: z.string().optional().describe("Nome fantasia (para pessoa jurídica)"),
  telefone: z.string().optional().describe("Telefone do contato"),
  celular: z.string().optional().describe("Celular do contato"),
  email: z.string().optional().describe("Email do contato"),
  endereco: z.object({
    endereco: z.string().optional().describe("Endereço"),
    numero: z.string().optional().describe("Número"),
    complemento: z.string().optional().describe("Complemento"),
    bairro: z.string().optional().describe("Bairro"),
    cep: z.string().optional().describe("CEP"),
    municipio: z.string().optional().describe("Município"),
    uf: z.string().optional().describe("UF"),
    pais: z.string().optional().describe("País"),
  }).optional().describe("Endereço do contato")
}).partial().extend({
  id: z.string().describe("ID do contato a ser atualizado (obrigatório)")
});

export const atualizarContatoTool: Tool<undefined, typeof atualizarContatoParams> = {
  name: "atualizarContato",
  description: "Atualiza um contato existente no Bling",
  parameters: atualizarContatoParams,
  execute: async (args, context: Context<undefined>): Promise<ContentResult> => {
    try {
      if (!args.id) {
        return {
          content: [
            {
              type: "text",
              text: "Erro: o parâmetro 'id' é obrigatório para atualizar um contato.",
            },
          ],
          isError: true,
        };
      }
      const contatoAtual = await obterContato(args.id);
      const { id, ...dadosAtualizacao } = args;
      const dadosLimpos = Object.entries(dadosAtualizacao).reduce<Record<string, any>>((acc, [key, value]) => {
        if (value && typeof value === 'object') {
          const subObj = Object.entries(value).reduce<Record<string, any>>((subAcc, [subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null && subValue !== '') {
              subAcc[subKey] = subValue;
            }
            return subAcc;
          }, {});
          if (Object.keys(subObj).length > 0) {
            acc[key] = subObj;
          }
        } else if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      const dadosFinais = {
        ...dadosLimpos,
        tipo: dadosLimpos.tipo || contatoAtual.tipo,
        situacao: dadosLimpos.situacao || contatoAtual.situacao
      };
      const contato = await atualizarContato(id, dadosFinais);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(contato, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'atualizarContato', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

// Parâmetros para a ferramenta de excluir contato
const excluirContatoParams = z.object({
  id: z.string().describe("ID do contato a ser excluído (obrigatório)")
});

export const excluirContatoTool: Tool<undefined, typeof excluirContatoParams> = {
  name: "excluirContato",
  description: "Remove um contato do Bling",
  parameters: excluirContatoParams,
  execute: async (args, context: Context<undefined>): Promise<ContentResult> => {
    try {
      if (!args.id) {
        return {
          content: [
            {
              type: "text",
              text: "Erro: o parâmetro 'id' é obrigatório para excluir um contato.",
            },
          ],
          isError: true,
        };
      }
      await excluirContato(args.id);
      return {
        content: [
          {
            type: "text",
            text: `Contato com ID ${args.id} excluído com sucesso.`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'excluirContato', args) ?? 'Erro desconhecido') }]
      };
    }
  },
};

export const listarTiposContatoTool: Tool<undefined, typeof emptyParams> = {
  name: 'listarTiposContato',
  description: 'Lista os tipos de contato disponíveis no Bling',
  parameters: emptyParams,
  execute: async (args, context: Context<undefined>): Promise<ContentResult> => {
    try {
      const tipos = await listarTiposContato();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(tipos, null, 2)
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarTiposContato', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

export const obterConsumidorFinalTool: Tool<undefined, typeof emptyParams> = {
  name: 'obterConsumidorFinal',
  description: 'Obtém o contato "consumidor final" do Bling',
  parameters: emptyParams,
  execute: async (args, context: Context<undefined>): Promise<ContentResult> => {
    try {
      const consumidorFinal = await obterConsumidorFinal();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(consumidorFinal, null, 2)
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterConsumidorFinal', args) ?? 'Erro desconhecido') }]
      };
    }
  }
}; 