import apiClient from './client'
import type { LoginPayload, RegisterPayload, Token, UserRead } from '../types/auth'

export function register(payload: RegisterPayload): Promise<UserRead> {
  return apiClient.post<UserRead>('/auth/register', payload).then((res) => res.data)
}

export function login(payload: LoginPayload): Promise<Token> {
  return apiClient.post<Token>('/auth/login', payload).then((res) => res.data)
}
