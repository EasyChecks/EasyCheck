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
      
      const savedRecords = localStorage.getItem('attendanceRecords')
      if (savedRecords) {
        try {
          const records = JSON.parse(savedRecords)
          setAttendanceRecords(records)
          const stats = calculateAttendanceStats(records)
          setAttendanceStats(stats)
        } catch (parseError) {
          // Silent error handling
        }
      } else {
        setAttendanceRecords(mockAttendanceRecords)
        localStorage.setItem('attendanceRecords', JSON.stringify(mockAttendanceRecords))
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

  const checkIn = (time, photo) => {
    const newAttendance = {
      checkInTime: time,
      checkOutTime: null,
      status: 'checked_in',
      checkInPhoto: photo
    }
    setAttendance(newAttendance)
    localStorage.setItem(`attendance_${tabId}`, JSON.stringify(newAttendance))
  }

  const checkOut = (time, photo) => {
    const today = new Date().toISOString().split('T')[0]
    
    const newAttendance = {
      ...attendance,
      checkOutTime: time,
      status: 'not_checked_in',
      checkOutPhoto: photo
    }
    
    const getShiftStatus = (checkInTime, workTimeStart = '08:00') => {
      if (!checkInTime) return 'absent'
      const [checkHour, checkMinute] = checkInTime.split(':').map(Number)
      const [workHour, workMinute] = workTimeStart.split(':').map(Number)
      const checkTotalMinutes = checkHour * 60 + checkMinute
      const workTotalMinutes = workHour * 60 + workMinute
      return checkTotalMinutes <= workTotalMinutes ? 'on_time' : 'late'
    }
    
    const shiftRecord = {
      checkIn: attendance.checkInTime,
      checkOut: time,
      checkInPhoto: attendance.checkInPhoto,
      checkOutPhoto: photo,
      status: getShiftStatus(attendance.checkInTime, '08:00')
    }
    
    const updatedRecords = [...attendanceRecords]
    const existingDayIndex = updatedRecords.findIndex(r => r.date === today)
    
    if (existingDayIndex >= 0) {
      const existingDay = updatedRecords[existingDayIndex]
      if (!existingDay.shifts) {
        existingDay.shifts = [{
          checkIn: existingDay.checkIn,
          checkOut: existingDay.checkOut,
          status: existingDay.status
        }]
        delete existingDay.checkIn
        delete existingDay.checkOut
        delete existingDay.status
      }
      existingDay.shifts.push(shiftRecord)
      updatedRecords[existingDayIndex] = existingDay
    } else {
      updatedRecords.push({
        date: today,
        shifts: [shiftRecord]
      })
    }
    
    updatedRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    setAttendanceRecords(updatedRecords)
    localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords))
    
    const stats = calculateAttendanceStats(updatedRecords)
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
