import React, { useState, useEffect, useRef } from 'react'
import { AuthContext } from './AuthContextValue'
import { calculateAttendanceStats } from '../utils/attendanceCalculator'
import {
  calculateAttendanceStatus,
  handleConsecutiveShifts,
  autoCheckoutAtMidnight,
  handleCrossMidnightShift,
  hasCheckedInToday
} from '../utils/attendanceLogic'

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
          
          // 🔥 โหลด attendance state ของ user นี้และตรวจสอบว่าเป็นวันนี้หรือไม่
          const userAttendanceStateKey = `attendance_user_${userData.id}_${tabId}`
          const savedAttendanceState = localStorage.getItem(userAttendanceStateKey)
          
          if (savedAttendanceState) {
            const savedState = JSON.parse(savedAttendanceState)
            const today = new Date().toISOString().split('T')[0]
            
            // 🔥 เช็คว่า attendance state นี้เป็นของวันนี้หรือไม่
            const stateDate = localStorage.getItem(`${userAttendanceStateKey}_date`)
            
            if (stateDate === today) {
              // เป็นวันนี้ - ใช้ state ที่บันทึกไว้
              setAttendance(savedState)
            } else {
              // เป็นวันอื่น - รีเซ็ตเป็นยังไม่เข้างาน
              setAttendance({ status: 'not_checked_in' })
              localStorage.setItem(`${userAttendanceStateKey}_date`, today)
            }
          } else {
            const today = new Date().toISOString().split('T')[0]
            setAttendance({ status: 'not_checked_in' })
            localStorage.setItem(`${userAttendanceStateKey}_date`, today)
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

    // 🔥 เพิ่ม interval ตรวจสอบทุก 2 วินาที (สำหรับ same-tab updates)
    const interval = setInterval(() => {
      if (user) {
        const userAttendanceKey = `attendanceRecords_user_${user.id}_${user.name}`
        const savedRecords = localStorage.getItem(userAttendanceKey)
        
        if (savedRecords) {
          const records = JSON.parse(savedRecords)
          // เปรียบเทียบว่าข้อมูลเปลี่ยนหรือไม่
          if (JSON.stringify(records) !== JSON.stringify(attendanceRecords)) {
            setAttendanceRecords(records)
            const stats = calculateAttendanceStats(records)
            setAttendanceStats(stats)
          }
        }
      }
    }, 2000)

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [user, tabId, attendanceRecords])

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
  const updateUserAttendanceInUsersData = (checkInTime, checkOutTime, checkInPhoto, checkOutPhoto, status, checkInGPS = null, checkInAddress = null, checkOutGPS = null, checkOutAddress = null, checkInDistance = null, checkOutDistance = null) => {
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
        users[userIndex].attendanceStatus = status === 'late' ? 'เข้าทำงานสาย' : 
                                           status === 'absent' ? 'ขาดงาน' : 
                                           'เข้าทำงานตรงเวลา'
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
          status: status === 'late' ? 'มาสาย' : status === 'absent' ? 'ขาด' : 'ตรงเวลา',
          location: 'อยู่ในพื้นที่',
          photo: checkInPhoto || users[userIndex].profileImage,
          gps: checkInGPS || '13.7563,100.5018',
          address: checkInAddress || 'ในพื้นที่อนุญาต',
          distance: checkInDistance || '-',
          checkedByBuddy: false,
          buddyName: null
        } : (recordIndex >= 0 ? users[userIndex].attendanceRecords[recordIndex].checkIn : undefined),
        checkOut: checkOutTime ? {
          time: checkOutTime,
          status: 'ตรงเวลา',
          location: 'อยู่ในพื้นที่',
          photo: checkOutPhoto || users[userIndex].profileImage,
          gps: checkOutGPS || '13.7563,100.5018',
          address: checkOutAddress || 'ในพื้นที่อนุญาต',
          distance: checkOutDistance || '-',
          checkedByBuddy: false,
          buddyName: null
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

  const checkIn = (time, photo, workTimeStart = '08:00', autoCheckOutFlag = false, locationInfo = {}) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const todayThaiFormat = new Date().toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      // 🔥 ตรวจสอบว่า check-in ไปแล้วหรือยัง
      if (hasCheckedInToday(attendanceRecords, todayThaiFormat)) {
        throw new Error('คุณได้ check-in ไปแล้ววันนี้')
      }
      
      // 🎯 ใช้ logic ใหม่: calculateAttendanceStatus
      const attendanceResult = calculateAttendanceStatus(time, workTimeStart, false)
      const { status, lateMinutes, shouldAutoCheckout, message } = attendanceResult
      
      // 🔥 ตรวจจับกะติดกัน (ถ้ามี user.shifts)
      let consecutiveInfo = null
      if (user?.shifts && user.shifts.length > 0) {
        consecutiveInfo = handleConsecutiveShifts(time, user.shifts)
        if (consecutiveInfo.coveredShifts.length > 1) {
          console.log('✅ กะติดกัน:', consecutiveInfo.message)
        }
      }
      
      const finalAutoCheckOut = shouldAutoCheckout || autoCheckOutFlag
      
      const newAttendance = {
        checkInTime: time,
        checkOutTime: finalAutoCheckOut ? time : null,
        status: finalAutoCheckOut ? 'not_checked_in' : 'checked_in',
        checkInPhoto: photo,
        checkInStatus: status,
        checkOutPhoto: finalAutoCheckOut ? photo : null,
        lateMinutes: lateMinutes || 0,
        message
      }
      
      setAttendance(newAttendance)
      
      // 🔥 บันทึก attendance แยกตาม user และบันทึกวันที่ด้วย
      if (user) {
        const userAttendanceKey = `attendance_user_${user.id}_${tabId}`
        if (!finalAutoCheckOut) {
          localStorage.setItem(userAttendanceKey, JSON.stringify(newAttendance))
          localStorage.setItem(`${userAttendanceKey}_date`, today)
        } else {
          localStorage.removeItem(userAttendanceKey)
          localStorage.removeItem(`${userAttendanceKey}_date`)
        }
      }
      
      // ✅ อัพเดตข้อมูลใน usersData.js ทันที - ส่ง location info
      const { gps: checkInGPS, address: checkInAddress, distance: checkInDistance } = locationInfo
      
      // แปลง status จาก ATTENDANCE_CONFIG เป็นรูปแบบเดิม
      const legacyStatus = status === 'ตรงเวลา' ? 'on_time' : 
                          status === 'มาสาย' ? 'late' : 
                          status === 'ขาด' ? 'absent' : 'on_time'
      
      if (finalAutoCheckOut) {
        // 🔥 Auto check-out: บันทึกทั้ง check-in และ check-out พร้อมกัน
        updateUserAttendanceInUsersData(time, time, photo, photo, legacyStatus, checkInGPS, checkInAddress, checkInGPS, checkInAddress, checkInDistance, checkInDistance)
        
        const shiftRecord = {
          checkIn: time,
          checkOut: time,
          checkInPhoto: photo,
          checkOutPhoto: photo,
          status: legacyStatus,
          lateMinutes: lateMinutes || 0,
          message
        }
        
        const updatedRecords = [...attendanceRecords]
        const existingDayIndex = updatedRecords.findIndex(r => r.date === today)
        
        if (existingDayIndex >= 0) {
          const existingDay = updatedRecords[existingDayIndex]
          if (!existingDay.shifts) {
            existingDay.shifts = [shiftRecord]
          } else {
            existingDay.shifts.push(shiftRecord)
          }
          updatedRecords[existingDayIndex] = existingDay
        } else {
          updatedRecords.push({
            date: today,
            shifts: [shiftRecord]
          })
        }
        
        updatedRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
        setAttendanceRecords(updatedRecords)
        
        if (user) {
          const userAttendanceKey = `attendanceRecords_user_${user.id}_${user.name}`
          localStorage.setItem(userAttendanceKey, JSON.stringify(updatedRecords))
        }
        
        const stats = calculateAttendanceStats(updatedRecords)
        setAttendanceStats(stats)
        
        window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
          detail: { userId: user?.id, stats, records: updatedRecords } 
        }))
      } else {
        // ปกติ: บันทึกแค่ check-in
        updateUserAttendanceInUsersData(time, null, photo, null, legacyStatus, checkInGPS, checkInAddress, null, null, checkInDistance, null)
      }
    } catch (error) {
      console.error('Error in checkIn:', error)
      throw error
    }
  }

  const checkOut = (time, photo, locationInfo = {}) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // 🔥 ตรวจสอบกะข้ามวัน - ถ้าเลยเที่ยงให้ตัดอัตโนมัติ
      let finalCheckoutTime = time
      let isAutoCheckout = false
      let autoCheckoutReason = null
      
      if (user?.shift && attendance.checkInTime) {
        const checkInRecord = {
          time: attendance.checkInTime,
          location: locationInfo.address || 'อยู่ในพื้นที่',
          address: locationInfo.address || 'ในพื้นที่อนุญาต'
        }
        
        // ตรวจสอบกะข้ามวัน
        const crossMidnightResult = handleCrossMidnightShift(
          checkInRecord,
          user.shift,
          time
        )
        
        if (crossMidnightResult) {
          finalCheckoutTime = crossMidnightResult.time
          isAutoCheckout = true
          autoCheckoutReason = crossMidnightResult.autoCheckoutReason
          console.log('🌙 กะข้ามวัน - ตัด checkout ที่เที่ยงอัตโนมัติ')
        }
        
        // ตรวจสอบลืม checkout
        if (!crossMidnightResult) {
          const midnightCheckout = autoCheckoutAtMidnight(
            checkInRecord,
            user.shift?.end || '17:00'
          )
          
          if (midnightCheckout) {
            finalCheckoutTime = midnightCheckout.time
            isAutoCheckout = true
            autoCheckoutReason = midnightCheckout.autoCheckoutReason
            console.log('🌙 ลืม checkout - ระบบทำให้อัตโนมัติที่เที่ยงคืน')
          }
        }
      }
      
      const newAttendance = {
        ...attendance,
        checkOutTime: finalCheckoutTime,
        status: 'not_checked_in',
        checkOutPhoto: photo,
        isAutoCheckout,
        autoCheckoutReason
      }
      
      const shiftRecord = {
        checkIn: attendance.checkInTime,
        checkOut: finalCheckoutTime,
        checkInPhoto: attendance.checkInPhoto,
        checkOutPhoto: photo,
        status: attendance.checkInStatus || 'on_time',
        lateMinutes: attendance.lateMinutes || 0,
        message: attendance.message || '',
        isAutoCheckout,
        autoCheckoutReason
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
      
      // 🔥 รีเซ็ต attendance state หลัง checkout (เพื่อให้วันพรุ่งนี้เริ่มใหม่)
      if (user) {
        const userAttendanceKey = `attendance_user_${user.id}_${tabId}`
        localStorage.removeItem(userAttendanceKey) // ลบ state เพราะออกงานแล้ว
        localStorage.removeItem(`${userAttendanceKey}_date`) // ลบวันที่ด้วย
      }
      
      // ✅ อัพเดตข้อมูลใน usersData.js ทันที - ส่ง location info
      const { gps: checkOutGPS, address: checkOutAddress, distance: checkOutDistance } = locationInfo
      updateUserAttendanceInUsersData(attendance.checkInTime, time, attendance.checkInPhoto, photo, shiftRecord.status, null, null, checkOutGPS, checkOutAddress, null, checkOutDistance)
      
      // ✅ Trigger custom event สำหรับ real-time sync
      window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
        detail: { userId: user?.id, stats, records: updatedRecords } 
      }))
    } catch (error) {
      console.error('Error in checkOut:', error)
      throw new Error('ไม่สามารถบันทึกเวลาออกงานได้ กรุณาลองใหม่อีกครั้ง')
    }
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
