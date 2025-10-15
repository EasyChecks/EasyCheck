import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user, loading, getDashboardPath } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, redirect to their dashboard
        const dashboardPath = getDashboardPath(user.role)
        navigate(dashboardPath, { replace: true })
      } else {
        // User is not logged in, redirect to auth
        navigate('/auth', { replace: true })
      }
    }
  }, [user, loading, navigate, getDashboardPath])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return null();
}


