import { logger } from '../../utils/logger.js';
import { blingClient, renovarToken } from '../blingClient.js';
import axios from 'axios';

// Interfaces migradas do types global
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

/**
 * Interface para criação ou atualização de contato
 */
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
  endereco?: {
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    municipio?: string;
    uf?: string;
    pais?: string;
  };
  [key: string]: any;
}

/**
 * Lista os contatos cadastrados no Bling
 * 
 * @param params - Parâmetros para a listagem de contatos
 * @returns Resposta com os contatos e informações de paginação
 */
export async function listarContatos(params?: ListarContatosParams): Promise<ContatoResponse> {
  try {
    logger.debug(`Buscando contatos com parâmetros:`, JSON.stringify(params, null, 2));
    
    const response = await blingClient.get('/contatos', {
      params
    });
    
    logger.debug('Resposta da API de contatos:');
    logger.debug('Status:', response.status);
    
    // Formato real da API é diferente do esperado
    // Vamos adaptar para nosso formato
    if (response.data && Array.isArray(response.data.data)) {
      // Criar uma resposta no formato esperado
      return {
        data: response.data.data as Contato[],
        pagination: {
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.data.length,
          limit: response.data.limit || response.data.data.length
        }
      };
    }
    
    // Se não é um array, vamos ver se é outro formato conhecido
    logger.debug('Verificando outros formatos de resposta');
    
    // Se a própria resposta já é um array, usamos diretamente
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        pagination: {
          page: 1,
          totalPages: 1,
          totalItems: response.data.length,
          limit: 50
        }
      };
    }
    
    // Tentar criar uma resposta válida mesmo com formato inesperado
    return {
      data: Array.isArray(response.data) ? response.data : 
            (response.data && Array.isArray(response.data.data)) ? response.data.data : [],
      pagination: {
        page: 1,
        totalPages: 1,
        totalItems: Array.isArray(response.data) ? response.data.length : 
                    (response.data && Array.isArray(response.data.data)) ? response.data.data.length : 0,
        limit: 50
      }
    };
  } catch (error) {
    return handleApiError(error, 'listarContatos', params);
  }
}

/**
 * Obtém um contato específico por ID
 * 
 * @param id - ID do contato
 * @returns Dados do contato
 */
export async function obterContato(id: number | string): Promise<Contato> {
  try {
    logger.debug(`Buscando contato com ID: ${id}`);
    
    const response = await blingClient.get(`/contatos/${id}`);
    
    logger.debug('Status:', response.status);
    logger.debug('Estrutura da resposta:', JSON.stringify(Object.keys(response.data), null, 2));
    
    // A API retorna os dados no formato { data: {...} }
    if (response.data && response.data.data) {
      return response.data.data as Contato;
    }
    
    return response.data as Contato;
  } catch (error) {
    return handleApiError(error, 'obterContato', { id });
  }
}

/**
 * Cria um novo contato
 * 
 * @param contato - Dados do contato a ser criado
 * @returns Contato criado
 */
export async function criarContato(contato: ContatoPayload): Promise<Contato> {
  try {
    logger.debug(`Criando novo contato:`, JSON.stringify(contato, null, 2));
    
    const response = await blingClient.post('/contatos', contato);
    
    logger.debug('Status:', response.status);
    logger.debug('Estrutura da resposta:', JSON.stringify(Object.keys(response.data), null, 2));
    
    // A API retorna os dados no formato { data: {...} }
    if (response.data && response.data.data) {
      return response.data.data as Contato;
    }
    
    return response.data as Contato;
  } catch (error) {
    return handleApiError(error, 'criarContato', contato);
  }
}

/**
 * Atualiza um contato existente
 * 
 * @param id - ID do contato
 * @param contato - Dados a serem atualizados
 * @returns Contato atualizado
 */
export async function atualizarContato(id: number | string, contato: Partial<ContatoPayload>): Promise<Contato> {
  try {
    logger.debug(`Atualizando contato ${id}:`, JSON.stringify(contato, null, 2));
    
    const response = await blingClient.put(`/contatos/${id}`, contato);
    
    logger.debug('Status:', response.status);
    logger.debug('Estrutura da resposta:', JSON.stringify(Object.keys(response.data), null, 2));
    
    // A API retorna os dados no formato { data: {...} }
    if (response.data && response.data.data) {
      return response.data.data as Contato;
    }
    
    return response.data as Contato;
  } catch (error) {
    return handleApiError(error, 'atualizarContato', { id, contato });
  }
}

/**
 * Remove um contato
 * 
 * @param id - ID do contato
 */
export async function excluirContato(id: number | string): Promise<void> {
  try {
    logger.debug(`Excluindo contato com ID: ${id}`);
    
    await blingClient.delete(`/contatos/${id}`);
    
    logger.debug('Contato excluído com sucesso');
  } catch (error) {
    return handleApiError(error, 'excluirContato', { id });
  }
}

/**
 * Obtém os tipos de contato disponíveis
 */
export async function listarTiposContato(): Promise<any[]> {
  try {
    logger.debug('Listando tipos de contato');
    
    const response = await blingClient.get('/tipos-contato');
    
    logger.debug('Status:', response.status);
    
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return handleApiError(error, 'listarTiposContato', {});
  }
}

/**
 * Obtém o contato "consumidor final"
 */
export async function obterConsumidorFinal(): Promise<Contato> {
  try {
    logger.debug('Obtendo contato consumidor final');
    
    const response = await blingClient.get('/contatos/consumidor-final');
    
    logger.debug('Status:', response.status);
    
    if (response.data && response.data.data) {
      return response.data.data as Contato;
    }
    
    return response.data as Contato;
  } catch (error) {
    return handleApiError(error, 'obterConsumidorFinal', {});
  }
}

/**
 * Função auxiliar para tratamento de erros da API
 */
async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    // Token expirado, tentar renovar
    logger.debug(`Token expirado (401) em ${funcName}, tentando renovar...`);
    try {
      await renovarToken();
      
      // Tentar executar a função novamente com os mesmos parâmetros
      // Recursão com verificação para evitar loop infinito
      if (funcName === 'listarContatos') return listarContatos(params as ListarContatosParams);
      if (funcName === 'obterContato') return obterContato(params.id);
      if (funcName === 'criarContato') return criarContato(params as ContatoPayload);
      if (funcName === 'atualizarContato') return atualizarContato(params.id, params.contato);
      if (funcName === 'excluirContato') return excluirContato(params.id);
      if (funcName === 'listarTiposContato') return listarTiposContato();
      if (funcName === 'obterConsumidorFinal') return obterConsumidorFinal();
      
      throw new Error(`Função desconhecida: ${funcName}`);
    } catch (renewError) {
      logger.error(`Erro ao renovar token em ${funcName}:`, renewError);
      throw new Error(`Falha na renovação do token: ${renewError instanceof Error ? renewError.message : 'Erro desconhecido'}`);
    }
  }
  
  if (axios.isAxiosError(error)) {
    logger.error(`Erro em ${funcName}:`);
    logger.error('Status:', error.response?.status);
    logger.error('Data:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(`Erro ao ${funcName}: ${error.response?.data?.message || error.message}`);
  }
  
  logger.error(`Erro não relacionado ao Axios em ${funcName}:`, error);
  throw error;
} 