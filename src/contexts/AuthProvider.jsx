import React, { useState, useEffect } from 'react'
import { AuthContext } from './AuthContextValue'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const getDashboardPath = (role) => {
    switch (role) {
      case 'superadmin':
        return '/superadmin'
      case 'admin':
        return '/admin'
      case 'manager':
        return '/manager'
      case 'user':
        return '/user'
      default:
        return '/user'
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    getDashboardPath,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
