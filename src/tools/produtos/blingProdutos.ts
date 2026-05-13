import { logger } from '../../utils/logger.js';
import { blingClient, renovarToken } from '../blingClient.js';
import axios from 'axios';

/**
 * Interfaces para Produto (baseado no schema ProdutosDadosDTO)
 */
export interface Produto {
  id?: number;
  nome: string;
  codigo?: string;
  preco?: number;
  tipo: 'S' | 'P' | 'N';
  situacao?: 'A' | 'I';
  formato?: 'S' | 'V' | 'E';
  descricaoCurta?: string;
  imagemURL?: string;
  dataValidade?: string;
  unidade?: string;
  pesoLiquido?: number;
  pesoBruto?: number;
  volumes?: number;
  itensPorCaixa?: number;
  gtin?: string;
  gtinEmbalagem?: string;
  tipoProducao?: 'P' | 'T';
  condicao?: 0 | 1 | 2;
  freteGratis?: boolean;
  marca?: string;
  descricaoComplementar?: string;
  linkExterno?: string;
  observacoes?: string;
  descricaoEmbalagemDiscreta?: string;
  categoria?: any;
  estoque?: any;
  fornecedor?: any;
  actionEstoque?: 'Z' | 'T';
  dimensoes?: any;
  tributacao?: any;
  midia?: any;
  linhaProduto?: any;
  estrutura?: any;
  camposCustomizados?: any[];
  variacoes?: Produto[];
  [key: string]: any;
}

export interface ListarProdutosParams {
  pagina?: number;
  limite?: number;
  criterio?: number;
  tipo?: string;
  idComponente?: number;
  dataInclusaoInicial?: string;
  dataInclusaoFinal?: string;
  dataAlteracaoInicial?: string;
  dataAlteracaoFinal?: string;
  idCategoria?: number;
  idLoja?: number;
  nome?: string;
  idsProdutos?: number[];
  codigos?: string[];
}

export interface ProdutosResponse {
  data: Produto[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

/**
 * Lista os produtos cadastrados no Bling
 */
export async function listarProdutos(params?: ListarProdutosParams): Promise<ProdutosResponse> {
  try {
    logger.debug('Listando produtos', params);
    const response = await blingClient.get('/produtos', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data as Produto[],
        pagination: {
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.data.length,
          limit: response.data.limit || response.data.data.length
        }
      };
    }
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
    return {
      data: Array.isArray(response.data) ? response.data : (response.data && Array.isArray(response.data.data)) ? response.data.data : [],
      pagination: {
        page: 1,
        totalPages: 1,
        totalItems: Array.isArray(response.data) ? response.data.length : (response.data && Array.isArray(response.data.data)) ? response.data.data.length : 0,
        limit: 50
      }
    };
  } catch (error) {
    return handleApiError(error, 'listarProdutos', params);
  }
}

/**
 * Obtém um produto pelo ID
 */
export async function obterProduto(id: number | string): Promise<Produto> {
  try {
    logger.debug('Obtendo produto', id);
    const response = await blingClient.get(`/produtos/${id}`);
    if (response.data && response.data.data) {
      return response.data.data as Produto;
    }
    return response.data as Produto;
  } catch (error) {
    return handleApiError(error, 'obterProduto', { id });
  }
}

/**
 * Cria um novo produto
 */
export async function criarProduto(produto: Produto): Promise<Produto> {
  try {
    logger.debug('Criando produto', produto);
    const response = await blingClient.post('/produtos', produto);
    if (response.data && response.data.data) {
      return response.data.data as Produto;
    }
    return response.data as Produto;
  } catch (error) {
    return handleApiError(error, 'criarProduto', produto);
  }
}

/**
 * Atualiza um produto existente
 */
export async function atualizarProduto(id: number | string, produto: Partial<Produto>): Promise<Produto> {
  try {
    logger.debug('Atualizando produto', id, produto);
    const response = await blingClient.put(`/produtos/${id}`, produto);
    if (response.data && response.data.data) {
      return response.data.data as Produto;
    }
    return response.data as Produto;
  } catch (error) {
    return handleApiError(error, 'atualizarProduto', { id, produto });
  }
}

/**
 * Remove um produto pelo ID
 */
export async function excluirProduto(id: number | string): Promise<void> {
  try {
    logger.debug('Excluindo produto', id);
    await blingClient.delete(`/produtos/${id}`);
    logger.debug('Produto excluído com sucesso');
  } catch (error) {
    return handleApiError(error, 'excluirProduto', { id });
  }
}

/**
 * Remove múltiplos produtos pelos IDs
 */
export async function excluirProdutos(idsProdutos: number[]): Promise<void> {
  try {
    logger.debug('Excluindo múltiplos produtos', idsProdutos);
    await blingClient.delete('/produtos', { params: { idsProdutos } });
    logger.debug('Produtos excluídos com sucesso');
  } catch (error) {
    return handleApiError(error, 'excluirProdutos', { idsProdutos });
  }
}

/**
 * Função auxiliar para tratamento de erros da API
 */
async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    logger.debug(`Token expirado (401) em ${funcName}, tentando renovar...`);
    try {
      await renovarToken();
      if (funcName === 'listarProdutos') return listarProdutos(params as ListarProdutosParams);
      if (funcName === 'obterProduto') return obterProduto(params.id);
      if (funcName === 'criarProduto') return criarProduto(params);
      if (funcName === 'atualizarProduto') return atualizarProduto(params.id, params.produto);
      if (funcName === 'excluirProduto') return excluirProduto(params.id);
      if (funcName === 'excluirProdutos') return excluirProdutos(params.idsProdutos);
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