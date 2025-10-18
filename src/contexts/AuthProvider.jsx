import React, { useState, useEffect } from 'react'
import { AuthContext } from './AuthContextValue'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState({
    checkInTime: null,
    checkOutTime: null,
    status: 'not_checked_in' // not_checked_in, checked_in, checked_out
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedAttendance = localStorage.getItem('attendance')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    console.log('💾 Saving user to context:', userData) // Debug log
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    console.log('✅ User saved to localStorage') // Debug log
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const checkIn = (time, photo) => {
    const newAttendance = {
      checkInTime: time,
      checkOutTime: null,
      status: 'checked_in',
      checkInPhoto: photo
    }
    setAttendance(newAttendance)
    localStorage.setItem('attendance', JSON.stringify(newAttendance))
  }

  const checkOut = (time, photo) => {
    const newAttendance = {
      ...attendance,
      checkOutTime: time,
      status: 'not_checked_in', // รีเซ็ตกลับเป็น not_checked_in เพื่อพร้อมสำหรับวันใหม่
      checkOutPhoto: photo
    }
    setAttendance(newAttendance)
    localStorage.setItem('attendance', JSON.stringify(newAttendance))
  }

  const resetAttendance = () => {
    const newAttendance = {
      checkInTime: null,
      checkOutTime: null,
      status: 'not_checked_in'
    }
    setAttendance(newAttendance)
    localStorage.setItem('attendance', JSON.stringify(newAttendance))
  }

  const getDashboardPath = (role) => {
    switch (role) {
      case 'superadmin':
        return '/superadmin'
      case 'admin':
        return '/admin'
      case 'manager':
        return '/user/dashboard' // Manager ใช้ interface เดียวกับ user
      case 'user':
        return '/user/dashboard'
      default:
        return '/user/dashboard'
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    getDashboardPath,
    isAuthenticated: !!user,
    attendance,
    checkIn,
    checkOut,
    resetAttendance
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
