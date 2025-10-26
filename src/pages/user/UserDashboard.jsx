import React, { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { useTeam } from '../../contexts/useTeam'
import { useLoading } from '../../contexts/useLoading'
import { useLocations } from '../../contexts/LocationContext'
import { useLeave } from '../../contexts/LeaveContext'
import { useEvents } from '../../contexts/EventContext'
import { validateBuddy } from '../../data/usersData'
import { AttendanceStatsRow } from '../../components/common/AttendanceStatsCard'
import { useCamera } from '../../hooks/useCamera'
import { config } from '../../config'

function UserDashboard() {
  const { attendance, user, attendanceRecords } = useAuth()
  const { getTeamStats, getUnreadNotifications } = useTeam()
  const { hideLoading } = useLoading()
  const { locations } = useLocations()
  const { leaveList, getUsedDays, leaveQuota } = useLeave()
  const { getEventsForUser } = useEvents()
  const navigate = useNavigate()
  
  // Camera hook สำหรับขออนุญาตกล้อง
  const { requestCameraPermission } = useCamera()
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showBuddyCheckIn, setShowBuddyCheckIn] = useState(false)
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false)
  const [buddyData, setBuddyData] = useState({
    employeeId: '',
    phone: ''
  })
  const [buddyError, setBuddyError] = useState('')
  const [buddySuccess, setBuddySuccess] = useState(false)
  const [_currentLocation, _setCurrentLocation] = useState(null) // เก็บไว้สำหรับอนาคต
  const [isWithinAllowedArea, setIsWithinAllowedArea] = useState(false)
  const [checkingLocation, setCheckingLocation] = useState(true)
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [popupInfoMessage, setPopupInfoMessage] = useState('');
  const [checkingCamera, setCheckingCamera] = useState(false)

  // ตรวจสอบว่าเป็นหัวหน้าหรือไม่
  const isManager = useMemo(() => user?.role === 'manager', [user])
  const teamStats = useMemo(() => isManager ? getTeamStats() : null, [isManager, getTeamStats])
  const notifications = useMemo(() => isManager ? getUnreadNotifications() : null, [isManager, getUnreadNotifications])

  // คำนวณวันลาคงเหลือของผู้ใช้
  const leaveBalance = useMemo(() => {
    const sickDaysUsed = getUsedDays('ลาป่วย')
    const personalDaysUsed = getUsedDays('ลากิจ')
    const vacationDaysUsed = getUsedDays('ลาพักร้อน')
    const maternityDaysUsed = getUsedDays('ลาคลอด')

    const sickDaysRemaining = leaveQuota['ลาป่วย'].totalDays - sickDaysUsed
    const personalDaysRemaining = leaveQuota['ลากิจ'].totalDays - personalDaysUsed
    const vacationDaysRemaining = leaveQuota['ลาพักร้อน'].totalDays - vacationDaysUsed
    const maternityDaysRemaining = leaveQuota['ลาคลอด'].totalDays - maternityDaysUsed

    const totalRemaining = sickDaysRemaining + personalDaysRemaining + vacationDaysRemaining + maternityDaysRemaining
    const totalQuota = leaveQuota['ลาป่วย'].totalDays + leaveQuota['ลากิจ'].totalDays + 
                       leaveQuota['ลาพักร้อน'].totalDays + leaveQuota['ลาคลอด'].totalDays

    return {
      total: totalRemaining,
      quota: totalQuota,
      breakdown: {
        sick: { used: sickDaysUsed, remaining: sickDaysRemaining, total: leaveQuota['ลาป่วย'].totalDays },
        personal: { used: personalDaysUsed, remaining: personalDaysRemaining, total: leaveQuota['ลากิจ'].totalDays },
        vacation: { used: vacationDaysUsed, remaining: vacationDaysRemaining, total: leaveQuota['ลาพักร้อน'].totalDays },
        maternity: { used: maternityDaysUsed, remaining: maternityDaysRemaining, total: leaveQuota['ลาคลอด'].totalDays }
      }
    }
  }, [getUsedDays, leaveQuota])

  // กิจกรรมที่เกี่ยวข้องกับผู้ใช้
  const userEvents = useMemo(() => {
    const events = getEventsForUser(user?.department, user?.position)
    return events.filter(event => event.status === 'ongoing')
  }, [getEventsForUser, user])

  // หาตารางงานสำหรับวันนี้จากข้อมูล user โดยตรง
  const todaySchedule = useMemo(() => {
    // ใช้ตารางงานจากข้อมูล user โดยตรง (จาก usersData.js ผ่าน useAuth)
    if (user?.schedule) {
      return {
        id: user.employeeId || 'user-schedule',
        time: user.schedule,
        location: user.workLocation || 'Office', // สมมติว่ามี field workLocation
        team: user.department || 'ทั่วไป'
      };
    }
    // ตารางงานเริ่มต้นหากไม่พบในข้อมูล user
    return { id: 'default', time: '09:00 - 18:00', location: 'Office', team: 'ทั่วไป' };
  }, [user])

  // สร้างการแจ้งเตือนจากหลายแหล่ง
  const userNotifications = useMemo(() => {
    const notifs = []

    // 1. การแจ้งเตือนเกี่ยวกับการลา
    const recentLeaves = leaveList
      .filter(leave => leave.id)
      .sort((a, b) => b.id - a.id)
      .slice(0, 3)

    recentLeaves.forEach(leave => {
      if (leave.status === 'อนุมัติ') {
        notifs.push({
          id: `leave-approved-${leave.id}`,
          title: `✅ การลา${leave.leaveType}ของคุณได้รับการอนุมัติ`,
          description: `ช่วงเวลา: ${leave.period}`,
          date: new Date(leave.id).toLocaleDateString('th-TH'),
          type: 'success',
          category: 'leave'
        })
      } else if (leave.status === 'ไม่อนุมัติ') {
        notifs.push({
          id: `leave-rejected-${leave.id}`,
          title: `❌ การลา${leave.leaveType}ของคุณไม่ได้รับการอนุมัติ`,
          description: `ช่วงเวลา: ${leave.period}`,
          date: new Date(leave.id).toLocaleDateString('th-TH'),
          type: 'error',
          category: 'leave'
        })
      } else if (leave.status === 'รออนุมัติ') {
        notifs.push({
          id: `leave-pending-${leave.id}`,
          title: `⏳ การลา${leave.leaveType}กำลังรออนุมัติ`,
          description: `ช่วงเวลา: ${leave.period}`,
          date: new Date(leave.id).toLocaleDateString('th-TH'),
          type: 'info',
          category: 'leave'
        })
      }
    })

    // 2. การแจ้งเตือนกิจกรรมใหม่
    const upcomingEvents = userEvents
      .sort((a, b) => {
        const dateA = a.date.split('/').reverse().join('')
        const dateB = b.date.split('/').reverse().join('')
        return dateA.localeCompare(dateB)
      })
      .slice(0, 3)

    upcomingEvents.forEach(event => {
      notifs.push({
        id: `event-${event.id}`,
        title: `🎯 กิจกรรมใหม่: ${event.name}`,
        description: `${event.date} เวลา ${event.startTime} - ${event.endTime}`,
        date: event.date,
        type: 'info',
        category: 'event'
      })
    })

    // 3. เตือนวันลาใกล้หมด
    if (leaveBalance.breakdown.vacation.remaining <= 3 && leaveBalance.breakdown.vacation.remaining > 0) {
      notifs.push({
        id: 'leave-warning-vacation',
        title: '⚠️ วันลาพักร้อนเหลือน้อย',
        description: `คุณมีวันลาพักร้อนเหลือเพียง ${leaveBalance.breakdown.vacation.remaining} วัน`,
        date: new Date().toLocaleDateString('th-TH'),
        type: 'warning',
        category: 'system'
      })
    }

    // 4. เตือนการเข้างานสาย (ถ้ามี)
    if (attendance.status === 'late') {
      notifs.push({
        id: 'attendance-late-warning',
        title: '⏰ คุณเข้างานสายในวันนี้',
        description: 'กรุณาตรวจสอบเวลาการเข้างานของคุณ',
        date: new Date().toLocaleDateString('th-TH'),
        type: 'warning',
        category: 'attendance'
      })
    }

    // 5. แจ้งเตือนทั่วไป
    notifs.push({
      id: 'system-reminder',
      title: '💡 อย่าลืมเช็คอินเข้างานทุกวัน',
      description: 'การเช็คอินเข้างานต้องอยู่ในพื้นที่อนุญาตเท่านั้น',
      date: new Date().toLocaleDateString('th-TH'),
      type: 'info',
      category: 'system'
    })

    // เรียงตามวันที่ล่าสุด
    return notifs.sort((a, b) => {
      // Convert Thai date string to comparable format
      const parseDate = (dateStr) => {
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/')
          return new Date(year, month - 1, day).getTime()
        }
        return new Date(dateStr).getTime()
      }
      return parseDate(b.date) - parseDate(a.date)
    }).slice(0, 8) // แสดงสูงสุด 8 รายการ
  }, [leaveList, userEvents, leaveBalance, attendance])

  // ฟังก์ชันคำนวณระยะทาง (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // รัศมีโลกเป็นเมตร
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // ระยะทางเป็นเมตร
  }

  // ✅ แก้ไขความช้า: ตรวจสอบตำแหน่งปัจจุบันแบบ optimized
  useEffect(() => {
    let watchId = null
    
    if (navigator.geolocation) {
      // ใช้ getCurrentPosition ครั้งแรกเพื่อความเร็ว
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLon = position.coords.longitude
          
          _setCurrentLocation({ lat: userLat, lon: userLon })

          // ตรวจสอบว่าอยู่ในพื้นที่อนุญาตหรือไม่
          const isInside = locations.some(location => {
            if (location.status !== 'active') return false
            
            const distance = calculateDistance(
              userLat,
              userLon,
              location.latitude,
              location.longitude
            )
            
            return distance <= location.radius
          })
          
          setIsWithinAllowedArea(isInside)
          setCheckingLocation(false)
        },
        (error) => {
          console.warn('Location error:', error)
          setCheckingLocation(false)
          // ในกรณี error ให้อนุญาตใช้งานได้ (เพื่อไม่ให้บล็อกการใช้งาน)
          setIsWithinAllowedArea(true)
        },
        {
          enableHighAccuracy: false, // ใช้ความแม่นยำต่ำเพื่อความเร็ว
          timeout: 5000, // ลดเวลา timeout
          maximumAge: 30000 // ยอมรับตำแหน่งเก่าได้ถึง 30 วินาที
        }
      )
      
      // จากนั้นใช้ watchPosition สำหรับอัปเดตต่อเนื่อง
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLon = position.coords.longitude
          
          _setCurrentLocation({ lat: userLat, lon: userLon })

          const isInside = locations.some(location => {
            if (location.status !== 'active') return false
            
            const distance = calculateDistance(
              userLat,
              userLon,
              location.latitude,
              location.longitude
            )
            
            return distance <= location.radius
          })
          
          setIsWithinAllowedArea(isInside)
        },
        (error) => {
          console.warn('Location watch error:', error)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000
        }
      )

      return () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
        }
      }
    } else {
      setCheckingLocation(false)
      setIsWithinAllowedArea(true)
    }
  }, [locations])

  // Hide loading เมื่อ component พร้อม render
  useEffect(() => {
    hideLoading()
  }, [hideLoading])

  // ล็อกการเลื่อนเมื่อ Modal เปิด
  useEffect(() => {
    if (showBuddyCheckIn || showAttendanceHistory) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showBuddyCheckIn, showAttendanceHistory])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock data - ใช้ข้อมูลจาก user context
  const mockData = {
    user: {
      name: user?.name || '',
      employeeId: user?.employeeId || user?.username || '',
      department: user?.department || '',
      position: user?.position || ''
    }
  }

  // ใช้ attendance จาก context แทน mock data
  const isCheckedIn = attendance.status === 'checked_in'
  const buttonColor = isCheckedIn 
    ? 'bg-[#FF6666] hover:bg-[#FF5555] shadow-[0_4px_12px_rgba(255,102,102,0.4)]' 
    : 'bg-white hover:shadow-xl'
  const buttonTextColor = isCheckedIn ? 'text-white' : 'text-[#48CBFF]'
  const buttonText = isCheckedIn ? 'ออกงาน' : 'เข้างาน'
  
  // ปิดการใช้งานปุ่มถ้าไม่ได้อยู่ในพื้นที่อนุญาต
  const isButtonDisabled = !isWithinAllowedArea && !checkingLocation

  const formatDate = (date) => {
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleBuddyCheckIn = () => {
    // ตรวจสอบข้อมูล
    if (!buddyData.employeeId.trim()) {
      setBuddyError('กรุณากรอกรหัสพนักงาน')
      return
    }
    if (!buddyData.phone.trim()) {
      setBuddyError('กรุณากรอกเบอร์โทรศัพท์')
      return
    }
    if (buddyData.phone.length !== 10 || !/^[0-9]+$/.test(buddyData.phone)) {
      setBuddyError('เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก)')
      return
    }

    // ตรวจสอบข้อมูลพนักงานจาก Mock Data
    const validBuddy = validateBuddy(buddyData.employeeId, buddyData.phone)
    
    if (!validBuddy) {
      setBuddyError('ไม่พบข้อมูลพนักงาน หรือรหัสพนักงานกับเบอร์โทรไม่ตรงกัน')
      return
    }

    // บันทึกสำเร็จ
    setBuddyError('')
    setBuddySuccess(true)

    // แสดงข้อความสำเร็จพร้อมชื่อเพื่อน
    console.log(`✅ เช็คชื่อแทนเพื่อนสำเร็จ: ${validBuddy.name} (${validBuddy.employeeId})`)

    // รีเซ็ตและปิด modal หลัง 2 วินาที
    setTimeout(() => {
      setShowBuddyCheckIn(false)
      setBuddySuccess(false)
      setBuddyData({ employeeId: '', phone: '' })
    }, 2000)
  }

  const handleBuddyInputChange = (field, value) => {
    setBuddyData(prev => ({ ...prev, [field]: value }))
    setBuddyError('') // ล้าง error เมื่อพิมพ์
  }

  // ✅ ฟังก์ชันสำหรับจัดการคลิกปุ่มเช็คอิน/เช็คเอาท์
  const handleCheckInOutClick = async (e) => {
    // ถ้าไม่อยู่ในพื้นที่อนุญาต
    if (isButtonDisabled) {
      e.preventDefault()
      setPopupInfoMessage('คุณต้องอยู่ในพื้นที่อนุญาตเท่านั้นจึงจะสามารถเช็คอินได้');
      setShowInfoPopup(true);
      return
    }

    // ถ้าปิดการตรวจสอบกล้องใน config ให้ไปหน้าถ่ายรูปเลย
    if (!config.features.enableCameraCheck) {
      return // ปล่อยให้ Link ทำงานตามปกติ
    }

    // ขออนุญาตกล้อง
    e.preventDefault() // หยุด Link ไว้ก่อน
    setCheckingCamera(true)
    
    const result = await requestCameraPermission()
    setCheckingCamera(false)

    if (result.success) {
      // อนุญาตกล้องแล้ว ไปหน้าถ่ายรูป
      navigate('/user/take-photo', { state: { schedule: todaySchedule } })
    } else {
      // ไม่อนุญาตกล้อง แสดง error
      setPopupInfoMessage(result.error || 'ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้องในการตั้งค่าเบราว์เซอร์')
      setShowInfoPopup(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="p-6 bg-white shadow-md rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">สวัสดี, {mockData.user.name}</h2>
            <p className="mt-1 text-gray-600">{mockData.user.position}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{formatDate(currentTime)}</p>
            <p className="text-2xl font-bold text-[#48CBFF]">{formatTime(currentTime)}</p>
          </div>
        </div>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-gradient-to-br from-[#48CBFF] to-[#3AB4E8] rounded-2xl shadow-lg p-6 text-white">
        <h3 className="mb-4 text-xl font-bold">บันทึกเวลา</h3>
        
        {/* Location Status Banner */}
        {checkingLocation ? (
          <div className="flex items-center gap-2 p-3 mb-4 bg-white/20 backdrop-blur-sm rounded-xl">
            <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
            <span className="text-sm">กำลังตรวจสอบตำแหน่งของคุณ...</span>
          </div>
        ) : !isWithinAllowedArea ? (
          <div className="flex items-center gap-2 p-3 mb-4 border bg-red-500/30 backdrop-blur-sm rounded-xl border-red-300/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">⚠️ คุณอยู่นอกพื้นที่อนุญาต - ไม่สามารถเช็คอินได้</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 mb-4 border bg-green-500/30 backdrop-blur-sm rounded-xl border-green-300/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">คุณอยู่ในพื้นที่อนุญาต - สามารถเช็คอินได้</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm112 168 56-56-128-128v-184h-80v216l152 152Z"/>
              </svg>
              <span className="text-sm">เข้างาน: {attendance.checkInTime || '-'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm112 168 56-56-128-128v-184h-80v216l152 152Z"/>
              </svg>
              <span className="text-sm">ออกงาน: {attendance.checkOutTime || '-'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* ปุ่มเช็คอิน/เช็คเอาท์ - พร้อมการขออนุญาตกล้อง */}
            {checkingCamera ? (
              <button
                disabled
                className="bg-white/50 text-gray-400 px-8 py-3 rounded-full font-bold shadow-lg inline-block text-center opacity-75 cursor-wait"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-b-transparent rounded-full animate-spin"></div>
                  <span>กำลังตรวจสอบกล้อง...</span>
                </div>
              </button>
            ) : (
              <Link 
                to={isButtonDisabled ? "#" : "/user/take-photo"}
                state={{ schedule: todaySchedule }}
                onClick={handleCheckInOutClick}
                className={`${buttonColor} ${buttonTextColor} px-8 py-3 rounded-full font-bold shadow-lg transform transition-all inline-block text-center ${
                  isButtonDisabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'hover:scale-105'
                }`}
              >
                {buttonText}
              </Link>
            )}
            <button
              onClick={() => {
                if (isButtonDisabled) {
                  setPopupInfoMessage('คุณต้องอยู่ในพื้นที่อนุญาตเท่านั้นจึงจะสามารถเช็คชื่อแทนเพื่อนได้');
                  setShowInfoPopup(true);
                } else {
                  setShowBuddyCheckIn(true)
                }
              }}
              disabled={isButtonDisabled}
              className={`bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/30 transition-all ${
                isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30'
              }`}
            >
              เช็คชื่อแทนเพื่อน
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Statistics - แสดงสถิติการลงเวลาจริง */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">สรุปการทำงาน</h3>
          <button
            onClick={() => setShowAttendanceHistory(true)}
            className="px-4 py-2 bg-[#48CBFF] hover:bg-[#3AB4E8] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ประวัติการลงเวลา
          </button>
        </div>
        <AttendanceStatsRow />
      </div>

      {/* Work Schedule - ตารางงาน */}
      <div className="p-6 bg-white shadow-md rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">ตารางงานของคุณ</h3>
          <span className="text-sm text-gray-500">วันนี้</span>
        </div>
        
        {/* User's work schedules - แสดงตารางงานของ user */}
        {todaySchedule && todaySchedule.id !== 'default' ? (
          <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] rounded-xl p-4 text-white">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-lg font-semibold">{todaySchedule.team}</h4>
              <span className="px-3 py-1 text-xs border rounded-full bg-white/20 border-white/30">
                {todaySchedule.time}
              </span>
            </div>
            <div className="space-y-1 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>สถานที่: {todaySchedule.location}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>ไม่มีตารางงานสำหรับวันนี้</p>
          </div>
        )}
      </div>

      {/* Manager Section - แสดงเฉพาะหัวหน้า */}
      {isManager && teamStats && (
        <div className="space-y-4">
          {/* Team Stats */}
          <div className="p-6 bg-white shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">สถิติทีมวันนี้</h3>
              <Link 
                to="/user/team-attendance"
                className="px-4 py-2 bg-[#48CBFF] hover:bg-[#3AB4E8] text-white rounded-lg text-sm font-medium transition-colors"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <div className="bg-[#48CBFF] rounded-xl p-4 text-center text-white">
                <p className="text-2xl font-bold">{teamStats.total}</p>
                <p className="mt-1 text-sm">ทั้งหมด</p>
              </div>
              <div className="p-4 text-center bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{teamStats.checkedIn}</p>
                <p className="mt-1 text-sm text-gray-600">เข้างาน</p>
              </div>
              <div className="p-4 text-center bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-600">{teamStats.late}</p>
                <p className="mt-1 text-sm text-gray-600">สาย</p>
              </div>
              <div className="p-4 text-center bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{teamStats.absent}</p>
                <p className="mt-1 text-sm text-gray-600">ขาด</p>
              </div>
            </div>
          </div>

          {/* Pending Leaves */}
          {notifications && notifications.pendingLeaveCount > 0 && (
            <div className="p-6 bg-white shadow-md rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FB923C">
                      <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">ใบลารออนุมัติ</h3>
                    <p className="text-sm text-gray-500">{notifications.pendingLeaveCount} รายการ</p>
                  </div>
                </div>
                <Link 
                  to="/user/leave-approval"
                  className="px-4 py-2 text-sm font-medium text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
                >
                  จัดการ
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Notifications */}
      <div className="p-6 bg-white shadow-md rounded-2xl">
        <h3 className="mb-4 text-lg font-bold text-gray-800">การแจ้งเตือนล่าสุด</h3>
        <div 
          className={`space-y-3 ${
            userNotifications.length > 3 
              ? 'max-h-[300px] overflow-y-auto pr-2' 
              : ''
          }`}
          style={userNotifications.length > 3 ? {
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 #F1F5F9'
          } : {}}
        >
          {userNotifications.length === 0 ? (
            <p className="py-4 text-center text-gray-500">ไม่มีการแจ้งเตือน</p>
          ) : (
            userNotifications.map(notification => (
              <div key={notification.id} className="flex items-start p-3 space-x-3 transition-colors rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  notification.type === 'success' ? 'bg-green-500' : 
                  notification.type === 'error' ? 'bg-red-500' :
                  notification.type === 'warning' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug text-gray-800">{notification.title}</p>
                  {notification.description && (
                    <p className="mt-1 text-xs text-gray-600">{notification.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{notification.date}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      notification.category === 'leave' ? 'bg-blue-100 text-blue-700' :
                      notification.category === 'event' ? 'bg-orange-100 text-orange-700' :
                      notification.category === 'attendance' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {notification.category === 'leave' ? 'การลา' :
                       notification.category === 'event' ? 'กิจกรรม' :
                       notification.category === 'attendance' ? 'เข้างาน' :
                       'ระบบ'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attendance History Modal */}
      {showAttendanceHistory && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowAttendanceHistory(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">ประวัติการลงเวลา</h2>
                  <p className="text-white/90 text-sm mt-1">รายละเอียดการเข้า-ออกงานของคุณ</p>
                </div>
                <button
                  onClick={() => setShowAttendanceHistory(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {!attendanceRecords || attendanceRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">ยังไม่มีประวัติการลงเวลา</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendanceRecords.map((record, index) => {
                    const recordDate = new Date(record.date)
                    const dateStr = recordDate.toLocaleDateString('th-TH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    
                    // รองรับทั้งรูปแบบเก่า (checkIn/checkOut) และรูปแบบใหม่ (shifts)
                    const shifts = record.shifts || [{
                      checkIn: record.checkIn,
                      checkOut: record.checkOut,
                      status: record.status
                    }]
                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-800">{dateStr}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {shifts.length} {shifts.length === 1 ? 'กะ' : 'กะ'}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            shifts.some(s => s.status === 'late') ? 'bg-yellow-100 text-yellow-700' :
                            shifts.some(s => s.status === 'on_time') ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {shifts.some(s => s.status === 'late') ? '⏰ มาสาย' :
                             shifts.some(s => s.status === 'on_time') ? '✅ ตรงเวลา' :
                             '📝 บันทึกแล้ว'}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {shifts.map((shift, shiftIndex) => (
                            <div key={shiftIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-700">
                                  {shifts.length > 1 ? `กะที่ ${shiftIndex + 1}` : 'เวลาทำงาน'}
                                </span>
                                {shift.status && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    shift.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                    shift.status === 'on_time' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {shift.status === 'late' ? 'สาย' :
                                     shift.status === 'on_time' ? 'ตรงเวลา' :
                                     shift.status}
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1">เข้างาน</p>
                                    <p className="font-bold text-gray-800">
                                      {shift.checkIn || '-'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1">ออกงาน</p>
                                    <p className="font-bold text-gray-800">
                                      {shift.checkOut || 'ยังไม่ออกงาน'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {shift.checkIn && shift.checkOut && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">เวลาทำงาน</span>
                                    <span className="font-semibold text-gray-800">
                                      {(() => {
                                        const [inHour, inMin] = shift.checkIn.split(':').map(Number)
                                        const [outHour, outMin] = shift.checkOut.split(':').map(Number)
                                        const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin)
                                        const hours = Math.floor(totalMinutes / 60)
                                        const minutes = totalMinutes % 60
                                        return `${hours} ชั่วโมง ${minutes} นาที`
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowAttendanceHistory(false)}
                className="w-full bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buddy Check-In Modal */}
      {showBuddyCheckIn && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => {
            setShowBuddyCheckIn(false)
            setBuddyData({ employeeId: '', phone: '' })
            setBuddyError('')
            setBuddySuccess(false)
          }}
        >
          <div 
            className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] p-6">
              <h2 className="text-2xl font-bold text-white">เช็คชื่อแทนเพื่อน</h2>
              <p className="mt-1 text-sm text-white/90">กรุณากรอกข้อมูลเพื่อนของคุณ</p>
            </div>
            
            <div className="p-6 space-y-4">
              {buddySuccess ? (
                <div className="py-8 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#22C55E">
                      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">บันทึกสำเร็จ!</h3>
                  <p className="mt-2 text-gray-600">เช็คชื่อแทนเพื่อนเรียบร้อยแล้ว</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      รหัสพนักงาน <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={buddyData.employeeId}
                      onChange={(e) => handleBuddyInputChange('employeeId', e.target.value)}
                      placeholder="กรอกรหัสพนักงานเพื่อน"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#48CBFF] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={buddyData.phone}
                      onChange={(e) => handleBuddyInputChange('phone', e.target.value)}
                      placeholder="0812345678"
                      maxLength="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#48CBFF] focus:border-transparent outline-none transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">กรอกเบอร์โทรศัพท์ 10 หลัก</p>
                  </div>

                  {buddyError && (
                    <div className="flex items-center p-3 space-x-2 border border-red-200 bg-red-50 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#EF4444">
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                      </svg>
                      <p className="text-sm font-medium text-red-600">{buddyError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowBuddyCheckIn(false)
                        setBuddyData({ employeeId: '', phone: '' })
                        setBuddyError('')
                      }}
                      className="flex-1 py-3 font-semibold text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleBuddyCheckIn}
                      className="flex-1 bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      ยืนยัน
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Popup */}
      {showInfoPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-8 text-center bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#F59E0B">
                <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">แจ้งเตือน</h2>
            <p className="mb-8 text-gray-600">{popupInfoMessage}</p>
            <button
              onClick={() => setShowInfoPopup(false)}
              className="w-full bg-[#48CBFF] text-white py-3 px-6 rounded-xl font-prompt font-medium text-lg shadow-lg hover:bg-[#3AB5E8] transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard