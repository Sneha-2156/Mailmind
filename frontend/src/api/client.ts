import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: attach JWT from localStorage
client.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 (redirect to login)
client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Only redirect if not already on the login or auth callback page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth/callback')) {
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default client
