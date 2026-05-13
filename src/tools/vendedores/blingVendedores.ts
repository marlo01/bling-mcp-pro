import { logger } from '../../utils/logger.js';
import { blingClient, withTokenRefresh } from '../blingClient.js';

interface ListarVendedoresParams {
  pagina?: number;
  limite?: number;
}

export interface Vendedor {
  id: string;
  nome: string;
  [key: string]: any;
}

interface VendedoresResponse {
  data: Vendedor[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export async function listarVendedores(
  params?: ListarVendedoresParams,
): Promise<VendedoresResponse> {
  logger.debug('Listando vendedores', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/vendedores', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data as Vendedor[],
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
  }, 'listarVendedores');
}

export async function obterVendedor(id: string): Promise<Vendedor> {
  logger.debug('Obtendo vendedor', { id });
  return withTokenRefresh(async () => {
    const response = await blingClient.get(`/vendedores/${id}`);
    return (response.data?.data ?? response.data) as Vendedor;
  }, 'obterVendedor');
}
