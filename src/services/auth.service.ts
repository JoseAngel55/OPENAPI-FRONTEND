import api from './api'
import type { AuthUser } from '@/store/authStore'

interface LoginPayload {
  username: string
  password: string
}

interface LoginApiResponse {
  token: string
  tipo: 'Bearer'
  expira_en: number
}

interface JwtPayload {
  sub: number
  username: string
  rol: string
  iat: number
  exp: number
}

interface LoginResult {
  token: string
  user: AuthUser
}

function decodeJwt(token: string): JwtPayload {
  return JSON.parse(atob(token.split('.')[1]))
}

async function realLogin(payload: LoginPayload): Promise<LoginResult> {
  const { data } = await api.post<LoginApiResponse>('/auth/login', payload)

  const decoded = decodeJwt(data.token)

  const user: AuthUser = {
    id: decoded.sub,
    nombre: decoded.username,
    email: '',
    rol: decoded.rol.toLowerCase() as AuthUser['rol'],
  }

  return { token: data.token, user }
}

export const authService = {
  login: (payload: LoginPayload): Promise<LoginResult> => realLogin(payload),
}