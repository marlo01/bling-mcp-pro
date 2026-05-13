import { logger } from '../../utils/logger.js';
import { blingClient, withTokenRefresh } from '../blingClient.js';

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

export async function listarProdutos(params?: ListarProdutosParams): Promise<ProdutosResponse> {
  logger.debug('Listando produtos', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/produtos', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data as Produto[],
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
  }, 'listarProdutos');
}

export async function obterProduto(id: number | string): Promise<Produto> {
  logger.debug('Obtendo produto', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.get(`/produtos/${id}`);
    return (response.data?.data ?? response.data) as Produto;
  }, 'obterProduto');
}

export async function criarProduto(produto: Produto): Promise<Produto> {
  logger.debug('Criando produto', { produto });
  return withTokenRefresh(async () => {
    const response = await blingClient.post('/produtos', produto);
    return (response.data?.data ?? response.data) as Produto;
  }, 'criarProduto');
}

export async function atualizarProduto(
  id: number | string,
  produto: Partial<Produto>,
): Promise<Produto> {
  logger.debug('Atualizando produto', { id, produto });
  return withTokenRefresh(async () => {
    const response = await blingClient.put(`/produtos/${id}`, produto);
    return (response.data?.data ?? response.data) as Produto;
  }, 'atualizarProduto');
}

export async function excluirProduto(id: number | string): Promise<void> {
  logger.debug('Excluindo produto', { id });
  await withTokenRefresh(async () => {
    await blingClient.delete(`/produtos/${id}`);
  }, 'excluirProduto');
}

export async function excluirProdutos(idsProdutos: number[]): Promise<void> {
  logger.debug('Excluindo múltiplos produtos', { idsProdutos });
  await withTokenRefresh(async () => {
    await blingClient.delete('/produtos', { params: { idsProdutos } });
  }, 'excluirProdutos');
}
