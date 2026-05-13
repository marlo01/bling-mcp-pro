import { logger } from '../../utils/logger.js';
import { blingClient, withTokenRefresh } from '../blingClient.js';

export interface FormaPagamento {
  id?: number;
  descricao: string;
  tipoPagamento: number; // 1=Dinheiro, 2=Cheque, ...
  finalidade: number; // 1=Pagamentos, 2=Recebimentos, 3=Ambos
  situacao?: number; // 0=Inativa, 1=Ativa
  padrao?: number; // 0=Não, 1=Padrão, 2=Padrão devolução
  fixa?: boolean;
}

export interface ListarFormasPagamentosParams {
  pagina?: number;
  limite?: number;
  descricao?: string;
  situacao?: number;
  tipoPagamento?: number;
  finalidade?: number;
}

export async function listarFormasPagamentos(
  params?: ListarFormasPagamentosParams,
): Promise<FormaPagamento[]> {
  logger.debug('Listando formas de pagamento', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/formas-pagamentos', { params });
    return response.data.data as FormaPagamento[];
  }, 'listarFormasPagamentos');
}

export async function obterFormaPagamento(id: number | string): Promise<FormaPagamento> {
  logger.debug('Obtendo forma de pagamento', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.get(`/formas-pagamentos/${id}`);
    return response.data.data as FormaPagamento;
  }, 'obterFormaPagamento');
}

export async function criarFormaPagamento(
  forma: Omit<FormaPagamento, 'id' | 'fixa'>,
): Promise<FormaPagamento> {
  logger.debug('Criando forma de pagamento', { forma });
  return withTokenRefresh(async () => {
    const response = await blingClient.post('/formas-pagamentos', forma);
    return response.data.data as FormaPagamento;
  }, 'criarFormaPagamento');
}

export async function atualizarFormaPagamento(
  id: number | string,
  forma: Partial<FormaPagamento>,
): Promise<FormaPagamento> {
  logger.debug('Atualizando forma de pagamento', { id, forma });
  return withTokenRefresh(async () => {
    const response = await blingClient.put(`/formas-pagamentos/${id}`, forma);
    return response.data.data as FormaPagamento;
  }, 'atualizarFormaPagamento');
}

export async function excluirFormaPagamento(id: number | string): Promise<void> {
  logger.debug('Excluindo forma de pagamento', { id });
  await withTokenRefresh(async () => {
    await blingClient.delete(`/formas-pagamentos/${id}`);
  }, 'excluirFormaPagamento');
}
