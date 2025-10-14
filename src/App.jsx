import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/useAuth'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return null
}

export default App