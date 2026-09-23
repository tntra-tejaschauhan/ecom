import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as productsApi from '../api/products'
import type { ApiError } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'

interface FormState {
  name: string
  description: string
  price: string
  sku: string
  stock_quantity: string
  is_active: boolean
}

const emptyForm: FormState = {
  name: '',
  description: '',
  price: '',
  sku: '',
  stock_quantity: '0',
  is_active: true,
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productsApi
      .getProduct(Number(id))
      .then((product) => {
        setForm({
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          sku: product.sku,
          stock_quantity: String(product.stock_quantity),
          is_active: product.is_active,
        })
      })
      .catch((err) => setError(err as ApiError))
      .finally(() => setLoading(false))
  }, [id])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const payload = {
      name: form.name,
      description: form.description || null,
      price: form.price,
      sku: form.sku,
      stock_quantity: Number(form.stock_quantity),
      is_active: form.is_active,
    }

    try {
      if (isEditMode && id) {
        const updated = await productsApi.updateProduct(Number(id), payload)
        navigate(`/products/${updated.id}`)
      } else {
        const created = await productsApi.createProduct(payload)
        navigate(`/products/${created.id}`)
      }
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="py-8 text-center text-gray-500">Loading…</p>

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        {isEditMode ? 'Edit Product' : 'New Product'}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner error={error} />

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Name
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Description
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Price (USD)
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            SKU
            <input
              type="text"
              required
              maxLength={64}
              value={form.sku}
              onChange={(e) => updateField('sku', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Stock quantity
            <input
              type="number"
              step="1"
              min="0"
              required
              value={form.stock_quantity}
              onChange={(e) => updateField('stock_quantity', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => updateField('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Active
          </label>
        </div>

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create product'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
