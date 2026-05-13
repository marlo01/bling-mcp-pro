import { logger } from '../../utils/logger.js';
import { blingClient, withTokenRefresh } from '../blingClient.js';

export interface ContaReceber {
  id?: number;
  situacao: number;
  vencimento: string;
  valor: number;
  idTransacao?: string;
  linkQRCodePix?: string;
  linkBoleto?: string;
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
  vendedor?: any;
  borderos?: number[];
  ocorrencia?: any;
  [key: string]: any;
}

export interface ListarContasReceberParams {
  pagina?: number;
  limite?: number;
  situacoes?: number[];
  tipoFiltroData?: string;
  dataInicial?: string;
  dataFinal?: string;
  idsCategorias?: number[];
  idPortador?: number;
  idContato?: number;
  idVendedor?: number;
  idFormaPagamento?: number;
  boletoGerado?: number;
}

export async function listarContasReceber(
  params?: ListarContasReceberParams,
): Promise<{ data: ContaReceber[]; pagination: any }> {
  logger.debug('Listando contas a receber', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/contas/receber', { params });
    return {
      data: response.data.data as ContaReceber[],
      pagination: {
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.data?.length || 0,
        limit: response.data.limit || response.data.data?.length || 0,
      },
    };
  }, 'listarContasReceber');
}

export async function obterContaReceber(id: number | string): Promise<ContaReceber> {
  logger.debug('Obtendo conta a receber', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.get(`/contas/receber/${id}`);
    return (response.data?.data ?? response.data) as ContaReceber;
  }, 'obterContaReceber');
}

export async function criarContaReceber(conta: ContaReceber): Promise<ContaReceber> {
  logger.debug('Criando conta a receber', { conta });
  return withTokenRefresh(async () => {
    const response = await blingClient.post('/contas/receber', conta);
    return (response.data?.data ?? response.data) as ContaReceber;
  }, 'criarContaReceber');
}

export async function atualizarContaReceber(
  id: number | string,
  conta: Partial<ContaReceber>,
): Promise<ContaReceber> {
  logger.debug('Atualizando conta a receber', { id, conta });
  return withTokenRefresh(async () => {
    const response = await blingClient.put(`/contas/receber/${id}`, conta);
    return (response.data?.data ?? response.data) as ContaReceber;
  }, 'atualizarContaReceber');
}

export async function excluirContaReceber(id: number | string): Promise<void> {
  logger.debug('Excluindo conta a receber', { id });
  await withTokenRefresh(async () => {
    await blingClient.delete(`/contas/receber/${id}`);
  }, 'excluirContaReceber');
}

export async function baixarContaReceber(id: number | string, payload: any): Promise<any> {
  logger.debug('Baixando conta a receber', { id, payload });
  return withTokenRefresh(async () => {
    const response = await blingClient.post(`/contas/receber/${id}/baixar`, payload);
    return response.data;
  }, 'baixarContaReceber');
}
