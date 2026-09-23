import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-gray-900 underline">
        Back to products
      </Link>
    </div>
  )
}
