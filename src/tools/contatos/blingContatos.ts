import { logger } from '../../utils/logger.js';
import { blingClient, withTokenRefresh } from '../blingClient.js';

export interface ContatoResponse {
  data: Contato[];
  pagination: Pagination;
}

export interface Contato {
  id: number;
  nome: string;
  codigo?: string;
  situacao?: string;
  tipo?: string;
  numeroDocumento?: string;
  fantasia?: string;
  contribuinte?: number;
  cpfCnpj?: string;
  rgIe?: string;
  endereco?: Endereco;
  telefone?: string;
  celular?: string;
  email?: string;
  dataNascimento?: string;
  sexo?: string;
  clienteDesde?: string;
  contatoRepresentante?: string;
  informacaoContato?: string;
  limiteCredito?: number;
  paisOrigem?: string;
  [key: string]: any;
}

export interface Endereco {
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
  pais?: string;
}

export interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface ListarContatosParams {
  pesquisa?: string;
  limite?: number;
  pagina?: number;
  idTipoContato?: number;
  idSituacao?: number;
}

export interface ListarContatosResponse {
  contatos: Contato[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface ContatoPayload {
  nome: string;
  tipo: string;
  codigo?: string;
  situacao?: string;
  numeroDocumento?: string;
  fantasia?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: Endereco;
  [key: string]: any;
}

export async function listarContatos(params?: ListarContatosParams): Promise<ContatoResponse> {
  logger.debug('Listando contatos', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/contatos', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data as Contato[],
        pagination: {
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.data.length,
          limit: response.data.limit || response.data.data.length,
        },
      };
    }
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        pagination: { page: 1, totalPages: 1, totalItems: response.data.length, limit: 50 },
      };
    }
    return { data: [], pagination: { page: 1, totalPages: 1, totalItems: 0, limit: 50 } };
  }, 'listarContatos');
}

export async function obterContato(id: number | string): Promise<Contato> {
  logger.debug('Obtendo contato', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.get(`/contatos/${id}`);
    return (response.data?.data ?? response.data) as Contato;
  }, 'obterContato');
}

export async function criarContato(contato: ContatoPayload): Promise<Contato> {
  logger.debug('Criando contato');
  return withTokenRefresh(async () => {
    const response = await blingClient.post('/contatos', contato);
    return (response.data?.data ?? response.data) as Contato;
  }, 'criarContato');
}

export async function atualizarContato(
  id: number | string,
  contato: Partial<ContatoPayload>,
): Promise<Contato> {
  logger.debug('Atualizando contato', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.put(`/contatos/${id}`, contato);
    return (response.data?.data ?? response.data) as Contato;
  }, 'atualizarContato');
}

export async function excluirContato(id: number | string): Promise<void> {
  logger.debug('Excluindo contato', { id });
  await withTokenRefresh(async () => {
    await blingClient.delete(`/contatos/${id}`);
  }, 'excluirContato');
}

export async function listarTiposContato(): Promise<any[]> {
  logger.debug('Listando tipos de contato');
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/tipos-contato');
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return Array.isArray(response.data) ? response.data : [];
  }, 'listarTiposContato');
}

export async function obterConsumidorFinal(): Promise<Contato> {
  logger.debug('Obtendo contato consumidor final');
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/contatos/consumidor-final');
    return (response.data?.data ?? response.data) as Contato;
  }, 'obterConsumidorFinal');
}
