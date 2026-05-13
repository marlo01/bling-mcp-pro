import { logger } from '../../utils/logger.js';
import { blingClient, renovarToken } from '../blingClient.js';
import axios from 'axios';

// Categorias de Produtos
export interface CategoriaProduto {
  id?: number;
  descricao: string;
}

export interface ListarCategoriasProdutosParams {
  pagina?: number;
  limite?: number;
  descricao?: string;
}

/**
 * Lista as categorias de produtos
 */
export async function listarCategoriasProdutos(params?: ListarCategoriasProdutosParams): Promise<CategoriaProduto[]> {
  try {
    logger.debug('Listando categorias de produtos', params);
    const response = await blingClient.get('/categorias/produtos', { params });
    return response.data.data as CategoriaProduto[];
  } catch (error) {
    return handleApiError(error, 'listarCategoriasProdutos', params);
  }
}

/**
 * Obtém uma categoria de produto pelo ID
 */
export async function obterCategoriaProduto(id: number | string): Promise<CategoriaProduto> {
  try {
    logger.debug('Obtendo categoria de produto', id);
    const response = await blingClient.get(`/categorias/produtos/${id}`);
    return response.data.data as CategoriaProduto;
  } catch (error) {
    return handleApiError(error, 'obterCategoriaProduto', { id });
  }
}

/**
 * Cria uma nova categoria de produto
 */
export async function criarCategoriaProduto(categoria: Omit<CategoriaProduto, 'id'>): Promise<CategoriaProduto> {
  try {
    logger.debug('Criando categoria de produto', categoria);
    const response = await blingClient.post('/categorias/produtos', categoria);
    return response.data.data as CategoriaProduto;
  } catch (error) {
    return handleApiError(error, 'criarCategoriaProduto', categoria);
  }
}

/**
 * Atualiza uma categoria de produto existente
 */
export async function atualizarCategoriaProduto(id: number | string, categoria: Partial<CategoriaProduto>): Promise<CategoriaProduto> {
  try {
    logger.debug('Atualizando categoria de produto', id, categoria);
    const response = await blingClient.put(`/categorias/produtos/${id}`, categoria);
    return response.data.data as CategoriaProduto;
  } catch (error) {
    return handleApiError(error, 'atualizarCategoriaProduto', { id, categoria });
  }
}

/**
 * Remove uma categoria de produto pelo ID
 */
export async function excluirCategoriaProduto(id: number | string): Promise<void> {
  try {
    logger.debug('Excluindo categoria de produto', id);
    await blingClient.delete(`/categorias/produtos/${id}`);
    logger.debug('Categoria de produto excluída com sucesso');
  } catch (error) {
    return handleApiError(error, 'excluirCategoriaProduto', { id });
  }
}

// Categorias de Receitas/Despesas
export interface CategoriaReceitaDespesa {
  id?: number;
  idCategoriaPai?: number;
  descricao: string;
  tipo: number; // 1=Despesa, 2=Receita, 3=Ambos
}

export interface ListarCategoriasReceitasDespesasParams {
  pagina?: number;
  limite?: number;
  descricao?: string;
  tipo?: number;
}

/**
 * Lista as categorias de receitas/despesas
 */
export async function listarCategoriasReceitasDespesas(params?: ListarCategoriasReceitasDespesasParams): Promise<CategoriaReceitaDespesa[]> {
  try {
    logger.debug('Listando categorias de receitas/despesas', params);
    const response = await blingClient.get('/categorias/receitas-despesas', { params });
    return response.data.data as CategoriaReceitaDespesa[];
  } catch (error) {
    return handleApiError(error, 'listarCategoriasReceitasDespesas', params);
  }
}

/**
 * Obtém uma categoria de receita/despesa pelo ID
 */
export async function obterCategoriaReceitaDespesa(id: number | string): Promise<CategoriaReceitaDespesa> {
  try {
    logger.debug('Obtendo categoria de receita/despesa', id);
    const response = await blingClient.get(`/categorias/receitas-despesas/${id}`);
    return response.data.data as CategoriaReceitaDespesa;
  } catch (error) {
    return handleApiError(error, 'obterCategoriaReceitaDespesa', { id });
  }
}

/**
 * Cria uma nova categoria de receita/despesa
 */
export async function criarCategoriaReceitaDespesa(categoria: Omit<CategoriaReceitaDespesa, 'id'>): Promise<CategoriaReceitaDespesa> {
  try {
    logger.debug('Criando categoria de receita/despesa', categoria);
    const response = await blingClient.post('/categorias/receitas-despesas', categoria);
    return response.data.data as CategoriaReceitaDespesa;
  } catch (error) {
    return handleApiError(error, 'criarCategoriaReceitaDespesa', categoria);
  }
}

/**
 * Atualiza uma categoria de receita/despesa existente
 */
export async function atualizarCategoriaReceitaDespesa(id: number | string, categoria: Partial<CategoriaReceitaDespesa>): Promise<CategoriaReceitaDespesa> {
  try {
    logger.debug('Atualizando categoria de receita/despesa', id, categoria);
    const response = await blingClient.put(`/categorias/receitas-despesas/${id}`, categoria);
    return response.data.data as CategoriaReceitaDespesa;
  } catch (error) {
    return handleApiError(error, 'atualizarCategoriaReceitaDespesa', { id, categoria });
  }
}

/**
 * Remove uma categoria de receita/despesa pelo ID
 */
export async function excluirCategoriaReceitaDespesa(id: number | string): Promise<void> {
  try {
    logger.debug('Excluindo categoria de receita/despesa', id);
    await blingClient.delete(`/categorias/receitas-despesas/${id}`);
    logger.debug('Categoria de receita/despesa excluída com sucesso');
  } catch (error) {
    return handleApiError(error, 'excluirCategoriaReceitaDespesa', { id });
  }
}

// Tratamento centralizado de erro e renovação de token
async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    await renovarToken();
    if (funcName === 'listarCategoriasProdutos') return listarCategoriasProdutos(params);
    if (funcName === 'obterCategoriaProduto') return obterCategoriaProduto(params.id);
    if (funcName === 'criarCategoriaProduto') return criarCategoriaProduto(params);
    if (funcName === 'atualizarCategoriaProduto') return atualizarCategoriaProduto(params.id, params.categoria);
    if (funcName === 'excluirCategoriaProduto') return excluirCategoriaProduto(params.id);
    if (funcName === 'listarCategoriasReceitasDespesas') return listarCategoriasReceitasDespesas(params);
    if (funcName === 'obterCategoriaReceitaDespesa') return obterCategoriaReceitaDespesa(params.id);
    if (funcName === 'criarCategoriaReceitaDespesa') return criarCategoriaReceitaDespesa(params);
    if (funcName === 'atualizarCategoriaReceitaDespesa') return atualizarCategoriaReceitaDespesa(params.id, params.categoria);
    if (funcName === 'excluirCategoriaReceitaDespesa') return excluirCategoriaReceitaDespesa(params.id);
  }
  throw error;
} 