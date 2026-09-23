export interface ProductRead {
  id: number
  name: string
  description: string | null
  price: string
  sku: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductCreatePayload {
  name: string
  description?: string | null
  price: string
  sku: string
  stock_quantity: number
  is_active: boolean
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>

export type ProductSortBy = 'price' | 'created_at'
export type ProductSortOrder = 'asc' | 'desc'

export interface ProductListQuery {
  page?: number
  page_size?: number
  name?: string
  is_active?: boolean
  sort_by?: ProductSortBy
  sort_order?: ProductSortOrder
}

export interface ProductListResponse {
  items: ProductRead[]
  total: number
  page: number
  page_size: number
}
