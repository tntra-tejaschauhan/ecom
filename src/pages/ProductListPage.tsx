import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as productsApi from '../api/products'
import type { ApiError } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'
import Pagination from '../components/Pagination'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../lib/format'
import type { ProductListResponse, ProductSortBy, ProductSortOrder } from '../types/product'

const PAGE_SIZE = 20

export default function ProductListPage() {
  const { isAuthenticated } = useAuth()
  const [page, setPage] = useState(1)
  const [nameInput, setNameInput] = useState('')
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState<'all' | 'true' | 'false'>('all')
  const [sortBy, setSortBy] = useState<ProductSortBy>('created_at')
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('desc')
  const [data, setData] = useState<ProductListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    productsApi
      .listProducts({
        page,
        page_size: PAGE_SIZE,
        name: name || undefined,
        is_active: isActive === 'all' ? undefined : isActive === 'true',
        sort_by: sortBy,
        sort_order: sortOrder,
      })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err as ApiError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, name, isActive, sortBy, sortOrder])

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setName(nameInput.trim())
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await productsApi.deleteProduct(id)
      setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((p) => p.id !== id), total: prev.total - 1 } : prev,
      )
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        {isAuthenticated && (
          <Link
            to="/products/new"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            New Product
          </Link>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Search by name
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. widget"
            className="w-56 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Status
          <select
            value={isActive}
            onChange={(e) => {
              setPage(1)
              setIsActive(e.target.value as 'all' | 'true' | 'false')
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Sort by
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductSortBy)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          >
            <option value="created_at">Newest</option>
            <option value="price">Price</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Order
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as ProductSortOrder)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      <ErrorBanner error={error} />

      {loading && <p className="py-8 text-center text-gray-500">Loading…</p>}

      {!loading && data && data.items.length === 0 && (
        <p className="py-8 text-center text-gray-500">No products found.</p>
      )}

      {!loading && data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                {isAuthenticated && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.items.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/products/${product.id}`} className="font-medium text-gray-900 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">{product.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isAuthenticated && (
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link to={`/products/${product.id}/edit`} className="text-gray-600 hover:text-gray-900">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {deletingId === product.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > 0 && (
        <div className="mt-4">
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
