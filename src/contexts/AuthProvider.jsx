import React, { useState, useEffect } from 'react'
import { AuthContext } from './AuthContextValue'
import { calculateAttendanceStats } from '../utils/attendanceCalculator'
import { mockAttendanceRecords } from '../data/usersData'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tabId] = useState(() => {
    // ✅ สร้าง persistent tabId ที่ไม่หายแม้ปิด browser
    // ใช้ window.name เพื่อเก็บ tabId ที่ unique ต่อแต่ละ tab
    if (!window.name) {
      // ถ้า tab นี้ยังไม่มี name (tab ใหม่) → สร้าง ID ใหม่
      const newTabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      window.name = newTabId
      return newTabId
    }
    // ถ้ามี name แล้ว (refresh หรือ back/forward) → ใช้ ID เดิม
    return window.name
  })
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

  // ✅ โหลด session เมื่อ mount - แต่ละ tab มี session แยกกัน และไม่หายแม้ปิด browser
  useEffect(() => {
    // ใช้ localStorage + tabId (จาก window.name) เพื่อให้แต่ละ tab แยกกัน และไม่หายเมื่อปิด browser
    const savedUser = localStorage.getItem(`user_${tabId}`)
    const savedAttendance = localStorage.getItem(`attendance_${tabId}`)
    const savedRecords = localStorage.getItem('attendanceRecords') // attendance records ใช้ localStorage เพื่อ sync ข้อมูล
    
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
      // ถ้าไม่มีข้อมูล ใช้ Mock Data จาก usersData.js
      setAttendanceRecords(mockAttendanceRecords)
      localStorage.setItem('attendanceRecords', JSON.stringify(mockAttendanceRecords))
    }
    setLoading(false)
  }, [tabId])

  // ✅ Multi-tab Sync - Sync เฉพาะข้อมูล attendance และ usersData (ไม่ sync session/login)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // ไม่ sync user session ระหว่าง tab (ให้แต่ละ tab login แยกกัน)
      // Sync เฉพาะ attendance records และ usersData
      
      if (e.key === 'attendanceRecords') {
        if (e.newValue) {
          const records = JSON.parse(e.newValue)
          setAttendanceRecords(records)
          const stats = calculateAttendanceStats(records)
          setAttendanceStats(stats)
        }
      } else if (e.key === 'usersData') {
        // ✅ เมื่อ admin แก้ไข user data → อัปเดต user ที่ login อยู่
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
    console.log('💾 Saving user to localStorage with tabId:', tabId) // Debug log
    setUser(userData)
    localStorage.setItem(`user_${tabId}`, JSON.stringify(userData)) // ใช้ localStorage + tabId
    console.log('✅ User saved to localStorage') // Debug log
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(`user_${tabId}`) // ลบจาก localStorage ของ tab นี้
    localStorage.removeItem(`attendance_${tabId}`) // ลบ attendance ด้วย
  }

  const checkIn = (time, photo) => {
    const newAttendance = {
      checkInTime: time,
      checkOutTime: null,
      status: 'checked_in',
      checkInPhoto: photo
    }
    setAttendance(newAttendance)
    localStorage.setItem(`attendance_${tabId}`, JSON.stringify(newAttendance)) // ใช้ localStorage + tabId
  }

  const checkOut = (time, photo) => {
    const today = new Date().toISOString().split('T')[0]
    
    const newAttendance = {
      ...attendance,
      checkOutTime: time,
      status: 'not_checked_in', // รีเซ็ตกลับเป็น not_checked_in เพื่อพร้อมสำหรับวันใหม่หรือกะถัดไป
      checkOutPhoto: photo
    }
    
    // ฟังก์ชันช่วยคำนวณสถานะการเข้างาน
    const getShiftStatus = (checkInTime, workTimeStart = '08:00') => {
      if (!checkInTime) return 'absent'
      const [checkHour, checkMinute] = checkInTime.split(':').map(Number)
      const [workHour, workMinute] = workTimeStart.split(':').map(Number)
      const checkTotalMinutes = checkHour * 60 + checkMinute
      const workTotalMinutes = workHour * 60 + workMinute
      return checkTotalMinutes <= workTotalMinutes ? 'on_time' : 'late'
    }
    
    // สร้าง shift record สำหรับการลงเวลาครั้งนี้
    const shiftRecord = {
      checkIn: attendance.checkInTime,
      checkOut: time,
      checkInPhoto: attendance.checkInPhoto,
      checkOutPhoto: photo,
      status: getShiftStatus(attendance.checkInTime, '08:00')
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
    localStorage.setItem(`attendance_${tabId}`, JSON.stringify(newAttendance)) // ใช้ localStorage + tabId
  }

  const resetAttendance = () => {
    const newAttendance = {
      checkInTime: null,
      checkOutTime: null,
      status: 'not_checked_in'
    }
    setAttendance(newAttendance)
    localStorage.setItem(`attendance_${tabId}`, JSON.stringify(newAttendance)) // ใช้ localStorage + tabId
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
