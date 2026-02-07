import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add token from localStorage on startup
const token = localStorage.getItem('token')
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect on 401 for authenticated routes (not login/register)
        // Check if it's a token-related auth error, not a login attempt error
        const isLoginAttempt = error.config?.url?.includes('/auth/login')
        const isRegisterAttempt = error.config?.url?.includes('/auth/register')

        if (error.response?.status === 401 && !isLoginAttempt && !isRegisterAttempt) {
            // Only clear token and redirect for protected route 401s
            localStorage.removeItem('token')
            delete api.defaults.headers.common['Authorization']
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
