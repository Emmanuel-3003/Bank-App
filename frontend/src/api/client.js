
import axios from 'axios'

export const SESSION_KEY = 'bank_session'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

function isAuthCall(url = '') {
  return url.startsWith('/auth/login') || url.startsWith('/auth/register')
}

// Attach the saved token to authenticated requests.
client.interceptors.request.use((config) => {
  const raw = localStorage.getItem(SESSION_KEY)

  if (raw && !isAuthCall(config.url)) {
    const { token } = JSON.parse(raw)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

// Clear the session if an authenticated request returns 401.
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
