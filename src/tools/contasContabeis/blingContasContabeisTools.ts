import { z } from 'zod';
import { Tool } from 'fastmcp';
import { listarContasContabeis } from './blingContasContabeis.js';
import { handleApiError } from '../../utils/errorHandler.js';

const listarContasContabeisParams = z.object({
  pagina: z.number().optional(),
  limite: z.number().optional(),
  ocultarInvisiveis: z.boolean().optional(),
  ocultarTipoContaBancaria: z.boolean().optional(),
});

export const listarContasContabeisTool: Tool<undefined, typeof listarContasContabeisParams> = {
  name: 'listarContasContabeis',
  description: 'Lista as contas contábeis cadastradas no Bling',
  parameters: listarContasContabeisParams,
  execute: async (args) => {
    try {
      const contas = await listarContasContabeis(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(contas, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(handleApiError(error, 'listarContasContabeis', args) ?? 'Erro desconhecido') }]
      };
    }
  }
}; 