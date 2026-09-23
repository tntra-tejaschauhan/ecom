import axios, { AxiosError } from 'axios'

export const TOKEN_STORAGE_KEY = 'ecom_access_token'

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiError {
  status: number
  message: string
  details?: ApiErrorDetail[]
}

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; details?: ApiErrorDetail[] }>) => {
    const status = error.response?.status ?? 0
    const message = error.response?.data?.error ?? error.message ?? 'Something went wrong'
    const details = error.response?.data?.details

    if (status === 401) {
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
    }

    const apiError: ApiError = { status, message, details }
    return Promise.reject(apiError)
  },
)

export default apiClient
