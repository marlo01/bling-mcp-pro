import { z } from "zod";
import { Tool, Context, ContentResult } from "fastmcp";
import { listarVendedores, obterVendedor } from "./blingVendedores.js";
import { handleApiError } from '../../utils/errorHandler.js';

const listarVendedoresParams = z.object({
  pagina: z.number().optional().describe("Número da página"),
  limite: z.number().optional().describe("Quantidade de registros por página")
});

export const listarVendedoresTool: Tool<undefined, typeof listarVendedoresParams> = {
  name: 'listarVendedores',
  description: 'Lista os vendedores cadastrados no Bling',
  parameters: listarVendedoresParams,
  execute: async (args, context: Context<undefined>): Promise<ContentResult> => {
    try {
      const vendedores = await listarVendedores(args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(vendedores, null, 2)
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarVendedores', args) ?? 'Erro desconhecido') }]
      };
    }
  }
};

const obterVendedorParams = z.object({
  id: z.string().describe("ID do vendedor a ser consultado (obrigatório)")
});

export const obterVendedorTool: Tool<undefined, typeof obterVendedorParams> = {
  name: 'obterVendedor',
  description: 'Obtém os dados de um vendedor específico do Bling',
  parameters: obterVendedorParams,
  execute: async (args, context: Context<undefined>): Promise<ContentResult> => {
    try {
      if (!args.id) {
        return {
          content: [
            {
              type: "text",
              text: "Erro: o parâmetro 'id' é obrigatório para consultar um vendedor.",
            },
          ],
          isError: true,
        };
      }
      const vendedor = await obterVendedor(args.id);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(vendedor, null, 2)
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'obterVendedor', args) ?? 'Erro desconhecido') }]
      };
    }
  }
}; 