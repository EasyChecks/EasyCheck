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
          
          // 🔥 โหลด attendanceRecords เฉพาะ user นี้
          const userAttendanceKey = `attendanceRecords_user_${userData.id}_${userData.name}`
          const savedRecords = localStorage.getItem(userAttendanceKey)
          
          if (savedRecords) {
            const records = JSON.parse(savedRecords)
            setAttendanceRecords(records)
            const stats = calculateAttendanceStats(records)
            setAttendanceStats(stats)
          } else {
            // ไม่มีข้อมูล ให้เริ่มต้นเป็น array ว่าง
            setAttendanceRecords([])
          }
          
          // 🔥 โหลด attendance state ของ user นี้ (สถานะเข้า/ออกงานวันนี้)
          const userAttendanceStateKey = `attendance_user_${userData.id}_${tabId}`
          const savedAttendanceState = localStorage.getItem(userAttendanceStateKey)
          
          if (savedAttendanceState) {
            setAttendance(JSON.parse(savedAttendanceState))
          } else {
            setAttendance({ status: 'not_checked_in' })
          }
        } catch {
          localStorage.removeItem(`user_${tabId}`)
          setAttendance({ status: 'not_checked_in' })
        }
      } else {
        setAttendance({ status: 'not_checked_in' })
      }
    } catch {
      // Silent error handling
      setAttendance({ status: 'not_checked_in' })
    } finally {
      setLoading(false)
    }
  }, [tabId])

  useEffect(() => {
    const handleStorageChange = (e) => {
      // 🔥 ฟังการเปลี่ยนแปลงของ attendanceRecords ของ user นี้
      if (user && e.key === `attendanceRecords_user_${user.id}_${user.name}`) {
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
            // 🔒 ป้องกันไม่ให้ role จาก usersData ทับ role ที่ convert แล้ว
            // ถ้า user ปัจจุบันมี isAdminAccount = false (Login ด้วยรหัสพนักงาน)
            // ห้าม merge role จาก usersData เพราะจะทำให้กลับเป็น 'admin' อีก
            const mergedUser = user.isAdminAccount === false
              ? { ...user, ...updatedUser, role: user.role } // Keep converted role
              : { ...user, ...updatedUser } // Normal merge
            
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
    } catch {
      // Silent error handling
    }
  }

  const logout = () => {
    // ลบ attendance ของ user ปัจจุบันก่อน logout
    if (user) {
      const userAttendanceKey = `attendance_user_${user.id}_${tabId}`
      localStorage.removeItem(userAttendanceKey)
    }
    
    setUser(null)
    setAttendance({ status: 'not_checked_in' }) // Reset state
    localStorage.removeItem(`user_${tabId}`)
  }

  // ✅ ฟังก์ชันอัพเดตข้อมูลการเข้า-ออกงานไปยัง usersData.js
  const updateUserAttendanceInUsersData = (checkInTime, checkOutTime, checkInPhoto, checkOutPhoto, status) => {
    if (!user) return
    
    try {
      // ดึงข้อมูล users จาก localStorage
      const storedUsers = localStorage.getItem('usersData')
      if (!storedUsers) return
      
      const users = JSON.parse(storedUsers)
      const userIndex = users.findIndex(u => u.id === user.id)
      
      if (userIndex === -1) return
      
      const today = new Date()
      const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear() + 543}`
      
      // อัพเดตข้อมูล time และ attendanceStatus
      if (checkInTime) {
        users[userIndex].time = checkInTime
        users[userIndex].attendanceStatus = status === 'late' ? 'เข้าทำงานสาย' : 'เข้าทำงานตรงเวลา'
      }
      
      // อัพเดต attendanceRecords
      if (!users[userIndex].attendanceRecords) {
        users[userIndex].attendanceRecords = []
      }
      
      const recordIndex = users[userIndex].attendanceRecords.findIndex(r => r.date === todayStr)
      
      const newRecord = {
        date: todayStr,
        checkIn: checkInTime ? {
          time: checkInTime,
          status: status === 'late' ? 'มาสาย' : 'ตรงเวลา',
          location: 'อยู่ในพื้นที่',
          photo: checkInPhoto || users[userIndex].profileImage,
          gps: '13.7563,100.5018',
          address: 'บริษัท GGS จำกัด'
        } : (recordIndex >= 0 ? users[userIndex].attendanceRecords[recordIndex].checkIn : undefined),
        checkOut: checkOutTime ? {
          time: checkOutTime,
          status: 'ตรงเวลา',
          location: 'อยู่ในพื้นที่',
          photo: checkOutPhoto || users[userIndex].profileImage,
          gps: '13.7563,100.5018',
          address: 'บริษัท GGS จำกัด'
        } : undefined
      }
      
      if (recordIndex >= 0) {
        users[userIndex].attendanceRecords[recordIndex] = newRecord
      } else {
        users[userIndex].attendanceRecords.unshift(newRecord)
      }
      
      // เก็บไว้เฉพาะ 30 วันล่าสุด
      if (users[userIndex].attendanceRecords.length > 30) {
        users[userIndex].attendanceRecords = users[userIndex].attendanceRecords.slice(0, 30)
      }
      
      // 🔥 คำนวณและอัพเดท timeSummary จากข้อมูลจริง
      const userRecords = users[userIndex].attendanceRecords || []
      const stats = calculateAttendanceStats(
        userRecords.map(record => ({
          date: record.date,
          checkIn: record.checkIn?.time,
          checkOut: record.checkOut?.time,
          status: record.checkIn?.status === 'มาสาย' ? 'late' : 
                  record.checkIn?.status === 'ตรงเวลา' ? 'on-time' : 'absent'
        })),
        { workTimeStart: '08:00' }
      )
      
      // คำนวณเวลาเฉลี่ย
      const totalCheckInMinutes = userRecords.reduce((sum, record) => {
        if (record.checkIn?.time) {
          const [hours, minutes] = record.checkIn.time.split(':').map(Number)
          return sum + (hours * 60 + minutes)
        }
        return sum
      }, 0)
      const avgCheckInMinutes = userRecords.length > 0 ? Math.round(totalCheckInMinutes / userRecords.length) : 0
      const avgCheckInTime = `${String(Math.floor(avgCheckInMinutes / 60)).padStart(2, '0')}:${String(avgCheckInMinutes % 60).padStart(2, '0')}`
      
      // อัพเดท timeSummary
      users[userIndex].timeSummary = {
        totalWorkDays: stats.totalWorkDays || 0,
        onTime: stats.onTime || 0,
        late: stats.late || 0,
        absent: stats.absent || 0,
        leave: stats.leave || 0,
        totalHours: `${Math.round(stats.totalWorkHours || 0).toLocaleString()} ชม.`,
        avgCheckIn: stats.averageCheckInTime || avgCheckInTime || '08:00',
        avgCheckOut: '17:30' // ค่าเริ่มต้น
      }
      
      // บันทึกกลับไปที่ localStorage
      localStorage.setItem('usersData', JSON.stringify(users))
      
      // Trigger storage event เพื่อให้ tab อื่นอัพเดตด้วย
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'usersData',
        newValue: JSON.stringify(users),
        url: window.location.href
      }))
      
      // Trigger custom event สำหรับ real-time sync
      window.dispatchEvent(new CustomEvent('timeSummaryUpdated', {
        detail: { userId: user.id, timeSummary: users[userIndex].timeSummary }
      }))
    } catch (error) {
      console.warn('Failed to update timeSummary:', error)
    }
  }

  const checkIn = (time, photo, status = 'on_time') => {
    const newAttendance = {
      checkInTime: time,
      checkOutTime: null,
      status: 'checked_in',
      checkInPhoto: photo,
      checkInStatus: status
    }
    setAttendance(newAttendance)
    
    // 🔥 บันทึก attendance แยกตาม user (ไม่ใช้ tabId อย่างเดียว)
    if (user) {
      const userAttendanceKey = `attendance_user_${user.id}_${tabId}`
      localStorage.setItem(userAttendanceKey, JSON.stringify(newAttendance))
    }
    
    // ✅ อัพเดตข้อมูลใน usersData.js ทันที
    updateUserAttendanceInUsersData(time, null, photo, null, status)
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
      status: attendance.checkInStatus || getShiftStatus(attendance.checkInTime, '08:00')
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
    
    // 🔥 บันทึก attendanceRecords แยกตาม user (ชื่อชัดเจน)
    if (user) {
      const userAttendanceKey = `attendanceRecords_user_${user.id}_${user.name}`
      localStorage.setItem(userAttendanceKey, JSON.stringify(updatedRecords))
    }
    
    const stats = calculateAttendanceStats(updatedRecords)
    setAttendanceStats(stats)
    
    setAttendance(newAttendance)
    
    // 🔥 บันทึก attendance state แยกตาม user (ให้ตรงกับตอนโหลด)
    if (user) {
      const userAttendanceStateKey = `attendance_user_${user.id}_${tabId}`
      localStorage.setItem(userAttendanceStateKey, JSON.stringify(newAttendance))
    }
    
    // ✅ อัพเดตข้อมูลใน usersData.js ทันที
    updateUserAttendanceInUsersData(attendance.checkInTime, time, attendance.checkInPhoto, photo, shiftRecord.status)
    
    // ✅ Trigger custom event สำหรับ real-time sync
    window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
      detail: { userId: user?.id, stats, records: updatedRecords } 
    }))
  }

  const resetAttendance = () => {
    const newAttendance = {
      checkInTime: null,
      checkOutTime: null,
      status: 'not_checked_in'
    }
    setAttendance(newAttendance)
    
    // 🔥 Reset attendance แยกตาม user
    if (user) {
      const userAttendanceKey = `attendance_user_${user.id}_${tabId}`
      localStorage.setItem(userAttendanceKey, JSON.stringify(newAttendance))
    }
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
