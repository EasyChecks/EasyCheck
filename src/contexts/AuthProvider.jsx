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
    } else {
      // ถ้าไม่มีข้อมูล ให้สร้าง mock data สำหรับ demo
      const mockRecords = [
        {
          date: new Date().toISOString().split('T')[0], // วันนี้
          shifts: [
            {
              checkIn: '08:00',
              checkOut: '12:00',
              status: 'on_time'
            },
            {
              checkIn: '13:00',
              checkOut: '17:00',
              status: 'on_time'
            }
          ]
        },
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // เมื่อวาน
          shifts: [
            {
              checkIn: '08:15',
              checkOut: '17:30',
              status: 'late'
            }
          ]
        },
        {
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 วันที่แล้ว
          shifts: [
            {
              checkIn: '07:45',
              checkOut: '12:00',
              status: 'on_time'
            },
            {
              checkIn: '18:00',
              checkOut: '22:00',
              status: 'on_time'
            }
          ]
        }
      ]
      setAttendanceRecords(mockRecords)
      localStorage.setItem('attendanceRecords', JSON.stringify(mockRecords))
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
      status: 'not_checked_in', // รีเซ็ตกลับเป็น not_checked_in เพื่อพร้อมสำหรับวันใหม่หรือกะถัดไป
      checkOutPhoto: photo
    }
    
    // สร้าง shift record สำหรับการลงเวลาครั้งนี้
    const shiftRecord = {
      checkIn: attendance.checkInTime,
      checkOut: time,
      checkInPhoto: attendance.checkInPhoto,
      checkOutPhoto: photo,
      status: getAttendanceStatus({
        checkIn: attendance.checkInTime,
        checkOut: time
      }, { workTimeStart: '08:00' })
    }
    
    // อัปเดต records รองรับหลาย shift ต่อวัน
    const updatedRecords = [...attendanceRecords]
    const existingDayIndex = updatedRecords.findIndex(r => r.date === today)
    
    if (existingDayIndex >= 0) {
      // วันนี้มีข้อมูลอยู่แล้ว - เพิ่ม shift ใหม่
      const existingDay = updatedRecords[existingDayIndex]
      if (!existingDay.shifts) {
        // แปลงข้อมูลเก่าเป็นรูปแบบ shifts
        existingDay.shifts = [{
          checkIn: existingDay.checkIn,
          checkOut: existingDay.checkOut,
          status: existingDay.status
        }]
        delete existingDay.checkIn
        delete existingDay.checkOut
        delete existingDay.status
      }
      // เพิ่ม shift ใหม่
      existingDay.shifts.push(shiftRecord)
      updatedRecords[existingDayIndex] = existingDay
    } else {
      // วันใหม่ - สร้าง record ใหม่
      updatedRecords.push({
        date: today,
        shifts: [shiftRecord]
      })
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
