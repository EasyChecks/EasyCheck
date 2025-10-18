import React, { useState, useEffect } from 'react'
import { AuthContext } from './AuthContextValue'
import { calculateAttendanceStats, getAttendanceStatus } from '../utils/attendanceCalculator'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
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
    const savedUser = localStorage.getItem('user')
    const savedAttendance = localStorage.getItem('attendance')
    const savedRecords = localStorage.getItem('attendanceRecords')
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance))
    }
    if (savedRecords) {
      const records = JSON.parse(savedRecords)
      setAttendanceRecords(records)
      // คำนวณสถิติจากข้อมูลที่โหลดมา
      const stats = calculateAttendanceStats(records)
      setAttendanceStats(stats)
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
    const today = new Date().toISOString().split('T')[0]
    
    const newAttendance = {
      ...attendance,
      checkOutTime: time,
      status: 'not_checked_in', // รีเซ็ตกลับเป็น not_checked_in เพื่อพร้อมสำหรับวันใหม่
      checkOutPhoto: photo
    }
    
    // บันทึกข้อมูลการลงเวลาของวันนี้ลง records
    const todayRecord = {
      date: today,
      checkIn: attendance.checkInTime,
      checkOut: time,
      status: getAttendanceStatus({
        checkIn: attendance.checkInTime,
        checkOut: time
      }, { workTimeStart: '08:00' })
    }
    
    // อัปเดต records
    const updatedRecords = [...attendanceRecords]
    const existingIndex = updatedRecords.findIndex(r => r.date === today)
    
    if (existingIndex >= 0) {
      updatedRecords[existingIndex] = todayRecord
    } else {
      updatedRecords.push(todayRecord)
    }
    
    // เรียงลำดับตามวันที่
    updatedRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    setAttendanceRecords(updatedRecords)
    localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords))
    
    // คำนวณสถิติใหม่
    const stats = calculateAttendanceStats(updatedRecords)
    setAttendanceStats(stats)
    
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
    resetAttendance,
    // ข้อมูลใหม่สำหรับสถิติ
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
