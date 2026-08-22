import { apiRequest, clearAccessToken, setAccessToken } from '@/services/api-client'
import type { AuthUser, LoginRequest, LoginResponse } from '@/services/types'

const USER_KEY = 'dayflow.user'

function saveUser(user: AuthUser): void {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthUser> {
    const response = await apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
    setAccessToken(response.access_token)
    saveUser(response.user)
    return response.user
  },

  async restoreSession(): Promise<AuthUser | null> {
    try {
      const user = await apiRequest<AuthUser>('/auth/me')
      saveUser(user)
      return user
    } catch {
      clearAccessToken()
      window.localStorage.removeItem(USER_KEY)
      return null
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<{ message: string }>('/auth/logout', { method: 'POST' })
    } finally {
      clearAccessToken()
      window.localStorage.removeItem(USER_KEY)
    }
  },
}
