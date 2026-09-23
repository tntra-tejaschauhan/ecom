import type { ApiError } from '../api/client'

export default function ErrorBanner({ error }: { error: ApiError | null }) {
  if (!error) return null

  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-medium">{error.message}</p>
      {error.details && error.details.length > 0 && (
        <ul className="mt-1 list-inside list-disc">
          {error.details.map((d, i) => (
            <li key={i}>
              {d.field}: {d.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
