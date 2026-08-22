import { apiRequest, clearAccessToken, setAccessToken } from '@/services/api-client'
import type { AuthUser, LoginRequest, LoginResponse } from '@/services/types'

const USER_KEY = 'dayflow.user'
const forgetUser = () => typeof window !== 'undefined' && window.localStorage.removeItem(USER_KEY)
const saveUser = (user: AuthUser) => window.localStorage.setItem(USER_KEY, JSON.stringify(user))

export const authService = {
  async login(credentials: LoginRequest) { const response = await apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }); setAccessToken(response.access_token); saveUser(response.user); return response.user },
  async restoreSession() { try { const user = await apiRequest<AuthUser>('/auth/me'); saveUser(user); return user } catch { clearAccessToken(); forgetUser(); return null } },
  async logout() { try { await apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }) } finally { clearAccessToken(); forgetUser() } },
}
