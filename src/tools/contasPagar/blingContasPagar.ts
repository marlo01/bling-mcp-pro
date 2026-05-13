import { logger } from '../../utils/logger.js';
import { blingClient, withTokenRefresh } from '../blingClient.js';

export interface ContaPagar {
  id?: number;
  situacao?: number;
  vencimento?: string;
  valor?: number;
  dataEmissao?: string;
  contato?: any;
  formaPagamento?: any;
  contaContabil?: any;
  origem?: any;
  saldo?: number;
  vencimentoOriginal?: string;
  numeroDocumento?: string;
  competencia?: string;
  historico?: string;
  numeroBanco?: string;
  portador?: any;
  categoria?: any;
  borderos?: number[];
  ocorrencia?: any;
  [key: string]: any;
}

export interface ListarContasPagarParams {
  pagina?: number;
  limite?: number;
  dataEmissaoInicial?: string;
  dataEmissaoFinal?: string;
  dataVencimentoInicial?: string;
  dataVencimentoFinal?: string;
  dataPagamentoInicial?: string;
  dataPagamentoFinal?: string;
  situacao?: number;
  idContato?: number;
}

export async function listarContasPagar(
  params?: ListarContasPagarParams,
): Promise<{ data: ContaPagar[]; pagination: any }> {
  logger.debug('Listando contas a pagar', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/contas/pagar', { params });
    return {
      data: response.data.data as ContaPagar[],
      pagination: {
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.data?.length || 0,
        limit: response.data.limit || response.data.data?.length || 0,
      },
    };
  }, 'listarContasPagar');
}

export async function obterContaPagar(id: number | string): Promise<ContaPagar> {
  logger.debug('Obtendo conta a pagar', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.get(`/contas/pagar/${id}`);
    return (response.data?.data ?? response.data) as ContaPagar;
  }, 'obterContaPagar');
}

export async function criarContaPagar(conta: ContaPagar): Promise<ContaPagar> {
  logger.debug('Criando conta a pagar', { conta });
  return withTokenRefresh(async () => {
    const response = await blingClient.post('/contas/pagar', conta);
    return (response.data?.data ?? response.data) as ContaPagar;
  }, 'criarContaPagar');
}

export async function atualizarContaPagar(
  id: number | string,
  conta: Partial<ContaPagar>,
): Promise<ContaPagar> {
  logger.debug('Atualizando conta a pagar', { id, conta });
  return withTokenRefresh(async () => {
    const response = await blingClient.put(`/contas/pagar/${id}`, conta);
    return (response.data?.data ?? response.data) as ContaPagar;
  }, 'atualizarContaPagar');
}

export async function excluirContaPagar(id: number | string): Promise<void> {
  logger.debug('Excluindo conta a pagar', { id });
  await withTokenRefresh(async () => {
    await blingClient.delete(`/contas/pagar/${id}`);
  }, 'excluirContaPagar');
}

export async function baixarContaPagar(id: number | string, payload: any): Promise<any> {
  logger.debug('Baixando conta a pagar', { id, payload });
  return withTokenRefresh(async () => {
    const response = await blingClient.post(`/contas/pagar/${id}/baixar`, payload);
    return response.data;
  }, 'baixarContaPagar');
}
