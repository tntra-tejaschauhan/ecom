import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as productsApi from '../api/products'
import type { ApiError } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../lib/format'
import type { ProductRead } from '../types/product'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<ProductRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    productsApi
      .getProduct(Number(id))
      .then(setProduct)
      .catch((err) => setError(err as ApiError))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!product) return
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeleting(true)
    try {
      await productsApi.deleteProduct(product.id)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err as ApiError)
      setDeleting(false)
    }
  }

  if (loading) return <p className="py-8 text-center text-gray-500">Loading…</p>

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ErrorBanner error={error} />
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-gray-900 underline">
          Back to products
        </Link>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
        ← Back to products
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">SKU: {product.sku}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <p className="mt-4 text-3xl font-semibold text-gray-900">{formatPrice(product.price)}</p>

      {product.description && <p className="mt-4 whitespace-pre-wrap text-gray-700">{product.description}</p>}

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-gray-500">Stock quantity</dt>
          <dd className="font-medium text-gray-900">{product.stock_quantity}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Created</dt>
          <dd className="font-medium text-gray-900">{new Date(product.created_at).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Last updated</dt>
          <dd className="font-medium text-gray-900">{new Date(product.updated_at).toLocaleString()}</dd>
        </div>
      </dl>

      {isAuthenticated && (
        <div className="mt-8 flex gap-3">
          <Link
            to={`/products/${product.id}/edit`}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}
