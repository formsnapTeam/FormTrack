import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                const res = await api.get('/auth/me')
                setUser(res.data.user)
            } catch (error) {
                localStorage.removeItem('token')
                delete api.defaults.headers.common['Authorization']
            }
        }
        setLoading(false)
    }

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password })
            const { token, user } = res.data
            localStorage.setItem('token', token)
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            setUser(user)
            return { success: true, user }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed'
            const code = error.response?.data?.code || ''
            return { success: false, error: message, code }
        }
    }

    const register = async (name, email, password) => {
        try {
            const res = await api.post('/auth/register', { name, email, password })
            const { token, user } = res.data
            localStorage.setItem('token', token)
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            setUser(user)
            return { success: true, user }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed'
            return { success: false, error: message }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    const value = {
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
