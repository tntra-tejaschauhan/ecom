import apiClient from './client'
import type {
  ProductCreatePayload,
  ProductListQuery,
  ProductListResponse,
  ProductRead,
  ProductUpdatePayload,
} from '../types/product'

export function listProducts(query: ProductListQuery): Promise<ProductListResponse> {
  return apiClient
    .get<ProductListResponse>('/products', { params: query })
    .then((res) => res.data)
}

export function getProduct(id: number): Promise<ProductRead> {
  return apiClient.get<ProductRead>(`/products/${id}`).then((res) => res.data)
}

export function createProduct(payload: ProductCreatePayload): Promise<ProductRead> {
  return apiClient.post<ProductRead>('/products', payload).then((res) => res.data)
}

export function updateProduct(id: number, payload: ProductUpdatePayload): Promise<ProductRead> {
  return apiClient.patch<ProductRead>(`/products/${id}`, payload).then((res) => res.data)
}

export function deleteProduct(id: number): Promise<void> {
  return apiClient.delete(`/products/${id}`).then(() => undefined)
}
