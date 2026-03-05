import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SSO_BACK_URL}/api`
})

// Interceptor para añadir el token en cada petición
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sso_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: async (ci, password) => {
    const response = await api.post('/login', { ci, password })
    if (response.data.access_token) {
      localStorage.setItem('sso_token', response.data.access_token)
      localStorage.setItem('sso_user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  me: async () => {
    const response = await api.get('/me')
    return response.data
  },

  logout: async () => {
    await api.post('/logout')
    localStorage.removeItem('sso_token')
    localStorage.removeItem('sso_user')
  }
}

export default api
