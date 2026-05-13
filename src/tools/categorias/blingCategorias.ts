import { logger } from '../../utils/logger.js';
import { blingClient, withTokenRefresh } from '../blingClient.js';

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

export async function listarCategoriasProdutos(
  params?: ListarCategoriasProdutosParams,
): Promise<CategoriaProduto[]> {
  logger.debug('Listando categorias de produtos', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/categorias/produtos', { params });
    return response.data.data as CategoriaProduto[];
  }, 'listarCategoriasProdutos');
}

export async function obterCategoriaProduto(id: number | string): Promise<CategoriaProduto> {
  logger.debug('Obtendo categoria de produto', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.get(`/categorias/produtos/${id}`);
    return response.data.data as CategoriaProduto;
  }, 'obterCategoriaProduto');
}

export async function criarCategoriaProduto(
  categoria: Omit<CategoriaProduto, 'id'>,
): Promise<CategoriaProduto> {
  logger.debug('Criando categoria de produto', { categoria });
  return withTokenRefresh(async () => {
    const response = await blingClient.post('/categorias/produtos', categoria);
    return response.data.data as CategoriaProduto;
  }, 'criarCategoriaProduto');
}

export async function atualizarCategoriaProduto(
  id: number | string,
  categoria: Partial<CategoriaProduto>,
): Promise<CategoriaProduto> {
  logger.debug('Atualizando categoria de produto', { id, categoria });
  return withTokenRefresh(async () => {
    const response = await blingClient.put(`/categorias/produtos/${id}`, categoria);
    return response.data.data as CategoriaProduto;
  }, 'atualizarCategoriaProduto');
}

export async function excluirCategoriaProduto(id: number | string): Promise<void> {
  logger.debug('Excluindo categoria de produto', { id });
  await withTokenRefresh(async () => {
    await blingClient.delete(`/categorias/produtos/${id}`);
  }, 'excluirCategoriaProduto');
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

export async function listarCategoriasReceitasDespesas(
  params?: ListarCategoriasReceitasDespesasParams,
): Promise<CategoriaReceitaDespesa[]> {
  logger.debug('Listando categorias de receitas/despesas', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/categorias/receitas-despesas', { params });
    return response.data.data as CategoriaReceitaDespesa[];
  }, 'listarCategoriasReceitasDespesas');
}

export async function obterCategoriaReceitaDespesa(
  id: number | string,
): Promise<CategoriaReceitaDespesa> {
  logger.debug('Obtendo categoria de receita/despesa', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.get(`/categorias/receitas-despesas/${id}`);
    return response.data.data as CategoriaReceitaDespesa;
  }, 'obterCategoriaReceitaDespesa');
}

export async function criarCategoriaReceitaDespesa(
  categoria: Omit<CategoriaReceitaDespesa, 'id'>,
): Promise<CategoriaReceitaDespesa> {
  logger.debug('Criando categoria de receita/despesa', { categoria });
  return withTokenRefresh(async () => {
    const response = await blingClient.post('/categorias/receitas-despesas', categoria);
    return response.data.data as CategoriaReceitaDespesa;
  }, 'criarCategoriaReceitaDespesa');
}

export async function atualizarCategoriaReceitaDespesa(
  id: number | string,
  categoria: Partial<CategoriaReceitaDespesa>,
): Promise<CategoriaReceitaDespesa> {
  logger.debug('Atualizando categoria de receita/despesa', { id, categoria });
  return withTokenRefresh(async () => {
    const response = await blingClient.put(`/categorias/receitas-despesas/${id}`, categoria);
    return response.data.data as CategoriaReceitaDespesa;
  }, 'atualizarCategoriaReceitaDespesa');
}

export async function excluirCategoriaReceitaDespesa(id: number | string): Promise<void> {
  logger.debug('Excluindo categoria de receita/despesa', { id });
  await withTokenRefresh(async () => {
    await blingClient.delete(`/categorias/receitas-despesas/${id}`);
  }, 'excluirCategoriaReceitaDespesa');
}
