export interface UserRead {
  id: number
  email: string
  created_at: string
}

export interface RegisterPayload {
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface Token {
  access_token: string
  token_type: string
  expires_in: number
}
