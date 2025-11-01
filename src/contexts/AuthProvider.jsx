import React, { useState, useEffect, useRef } from 'react'
import { AuthContext } from './AuthContextValue'
import { calculateAttendanceStats } from '../utils/attendanceCalculator'
import { mockAttendanceRecords } from '../data/usersData'

const getOrCreateTabId = () => {
  let tabId = sessionStorage.getItem('tabId')
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('tabId', tabId)
  }
  return tabId
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const tabIdRef = useRef(getOrCreateTabId())
  const tabId = tabIdRef.current
  const [attendance, setAttendance] = useState({
    checkInTime: null,
    checkOutTime: null,
    status: 'not_checked_in' // not_checked_in, checked_in, checked_out
  })
  // เก็บประวัติการลงเวลารายวัน
  const [attendanceRecords, setAttendanceRecords] = useState([])
  // สถิติการลงเวลา
  const [attendanceStats, setAttendanceStats] = useState({
    totalWorkDays: 0,
    onTime: 0,
    late: 0,
    absent: 0
  })

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(`user_${tabId}`)
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          
          // โหลดข้อมูล attendance ของ user คนนี้เท่านั้น
          const savedRecords = localStorage.getItem('attendanceRecords')
          if (savedRecords) {
            const allRecords = JSON.parse(savedRecords)
            const userRecords = allRecords.filter(r => r.userId === userData.id)
            setAttendanceRecords(userRecords)
            const stats = calculateAttendanceStats(userRecords)
            setAttendanceStats(stats)
          }
        } catch (parseError) {
          localStorage.removeItem(`user_${tabId}`)
        }
      }
      
      const savedAttendance = localStorage.getItem(`attendance_${tabId}`)
      if (savedAttendance) {
        try {
          setAttendance(JSON.parse(savedAttendance))
        } catch (parseError) {
          // Silent error handling
        }
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }, [tabId])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'attendanceRecords') {
        if (e.newValue) {
          const records = JSON.parse(e.newValue)
          setAttendanceRecords(records)
          const stats = calculateAttendanceStats(records)
          setAttendanceStats(stats)
        }
      } else if (e.key === 'usersData') {
        if (e.newValue && user) {
          const updatedUsers = JSON.parse(e.newValue)
          const updatedUser = updatedUsers.find(u => u.id === user.id)
          if (updatedUser) {
            const mergedUser = { ...user, ...updatedUser }
            setUser(mergedUser)
            localStorage.setItem(`user_${tabId}`, JSON.stringify(mergedUser))
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user, tabId])

  const login = (userData) => {
    setUser(userData)
    try {
      localStorage.setItem(`user_${tabId}`, JSON.stringify(userData))
    } catch (error) {
      // Silent error handling
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(`user_${tabId}`)
    localStorage.removeItem(`attendance_${tabId}`)
  }

  const checkIn = (time, photo, status = 'on_time') => {
    if (!user) return;
    
    const newAttendance = {
      checkInTime: time,
      checkOutTime: null,
      status: 'checked_in',
      checkInPhoto: photo,
      shiftStatus: status
    }
    setAttendance(newAttendance)
    localStorage.setItem(`attendance_${tabId}`, JSON.stringify(newAttendance))
  }

  const checkOut = (time, photo) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0]
    
    const newAttendance = {
      ...attendance,
      checkOutTime: time,
      status: 'not_checked_in',
      checkOutPhoto: photo
    }
    
    const shiftRecord = {
      checkIn: attendance.checkInTime,
      checkOut: time,
      checkInPhoto: attendance.checkInPhoto,
      checkOutPhoto: photo,
      status: attendance.shiftStatus || 'on_time',
      userId: user.id,
      userName: user.name
    }
    
    // โหลด attendance records ที่มีอยู่
    const savedRecords = localStorage.getItem('attendanceRecords')
    let allRecords = savedRecords ? JSON.parse(savedRecords) : []
    
    // หา record ของ user คนนี้ในวันนี้
    let userRecord = allRecords.find(r => r.userId === user.id && r.date === today)
    
    if (userRecord) {
      // มี record อยู่แล้ว เพิ่ม shift
      if (!userRecord.shifts) {
        userRecord.shifts = []
      }
      userRecord.shifts.push(shiftRecord)
    } else {
      // ยังไม่มี record สร้างใหม่
      userRecord = {
        userId: user.id,
        userName: user.name,
        date: today,
        shifts: [shiftRecord]
      }
      allRecords.push(userRecord)
    }
    
    // บันทึกกลับ
    localStorage.setItem('attendanceRecords', JSON.stringify(allRecords))
    
    // คำนวณสถิติของ user คนนี้เท่านั้น
    const userRecords = allRecords.filter(r => r.userId === user.id)
    const stats = calculateAttendanceStats(userRecords)
    setAttendanceStats(stats)
    
    setAttendance(newAttendance)
    localStorage.setItem(`attendance_${tabId}`, JSON.stringify(newAttendance))
  }

  const resetAttendance = () => {
    const newAttendance = {
      checkInTime: null,
      checkOutTime: null,
      status: 'not_checked_in'
    }
    setAttendance(newAttendance)
    localStorage.setItem(`attendance_${tabId}`, JSON.stringify(newAttendance))
  }

  const getDashboardPath = (role) => {
    switch (role) {
      case 'superadmin':
        return '/superadmin'
      case 'admin':
        return '/admin'
      case 'manager':
        return '/user/dashboard'
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
    resetAttendance,
    attendanceRecords,
    attendanceStats,
    setAttendanceRecords
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
