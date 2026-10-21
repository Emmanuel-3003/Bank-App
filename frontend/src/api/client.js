import axios from 'axios'

export const SESSION_KEY = 'bank_session'

const client = axios.create({ baseURL: '/api' })

function isAuthCall(url = '') {
  return url.startsWith('/auth/login') || url.startsWith('/auth/register')
}

// Before every request: attach the saved token (except on login and register).
client.interceptors.request.use((config) => {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw && !isAuthCall(config.url)) {
    const { token } = JSON.parse(raw)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// After every response: if the server says 401, the session is over.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthCall(error.config?.url)) {
      localStorage.removeItem(SESSION_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client