import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { useTeam } from '../../contexts/useTeam'
import { useLoading } from '../../contexts/useLoading'
import { useLocations } from '../../contexts/LocationContext'
import { useLeave } from '../../contexts/LeaveContext'
import { useEvents } from '../../contexts/EventContext'
import { validateBuddy } from '../../data/usersData'
import { AttendanceStatsRow } from '../../components/common/AttendanceStatsCard'

function UserDashboard() {
  const { attendance, user } = useAuth()
  const { getTeamStats, getUnreadNotifications } = useTeam()
  const { hideLoading } = useLoading()
  const { locations } = useLocations()
  const { leaveList, getUsedDays, leaveQuota } = useLeave()
  const { getEventsForUser } = useEvents()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showBuddyCheckIn, setShowBuddyCheckIn] = useState(false)
  const [buddyData, setBuddyData] = useState({
    employeeId: '',
    phone: ''
  })
  const [buddyError, setBuddyError] = useState('')
  const [buddySuccess, setBuddySuccess] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isWithinAllowedArea, setIsWithinAllowedArea] = useState(false)
  const [checkingLocation, setCheckingLocation] = useState(true)

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

  // ตรวจสอบตำแหน่งปัจจุบัน
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLon = position.coords.longitude
          
          setCurrentLocation({ lat: userLat, lon: userLon })

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
          setCheckingLocation(false)
          // ในกรณี error ให้อนุญาตใช้งานได้ (เพื่อไม่ให้บล็อกการใช้งาน)
          setIsWithinAllowedArea(true)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      )

      return () => navigator.geolocation.clearWatch(watchId)
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
    if (showBuddyCheckIn) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showBuddyCheckIn])

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">สวัสดี, {mockData.user.name}</h2>
            <p className="text-gray-600 mt-1">{mockData.user.position}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{formatDate(currentTime)}</p>
            <p className="text-2xl font-bold text-[#48CBFF]">{formatTime(currentTime)}</p>
          </div>
        </div>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-gradient-to-br from-[#48CBFF] to-[#3AB4E8] rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">บันทึกเวลา</h3>
        
        {/* Location Status Banner */}
        {checkingLocation ? (
          <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span className="text-sm">กำลังตรวจสอบตำแหน่งของคุณ...</span>
          </div>
        ) : !isWithinAllowedArea ? (
          <div className="mb-4 bg-red-500/30 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 border border-red-300/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">⚠️ คุณอยู่นอกพื้นที่อนุญาต - ไม่สามารถเช็คอินได้</span>
          </div>
        ) : (
          <div className="mb-4 bg-green-500/30 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 border border-green-300/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">✅ คุณอยู่ในพื้นที่อนุญาต - สามารถเช็คอินได้</span>
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
            <Link 
              to={isButtonDisabled ? "#" : "/user/take-photo"}
              onClick={(e) => {
                if (isButtonDisabled) {
                  e.preventDefault()
                  alert('❌ คุณต้องอยู่ในพื้นที่อนุญาตเท่านั้นจึงจะสามารถเช็คอินได้')
                }
              }}
              className={`${buttonColor} ${buttonTextColor} px-8 py-3 rounded-full font-bold shadow-lg transform transition-all inline-block text-center ${
                isButtonDisabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'hover:scale-105'
              }`}
            >
              {buttonText}
            </Link>
            <button
              onClick={() => {
                if (isButtonDisabled) {
                  alert('❌ คุณต้องอยู่ในพื้นที่อนุญาตเท่านั้นจึงจะสามารถเช็คชื่อแทนเพื่อนได้')
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
        <AttendanceStatsRow />
      </div>

      {/* Manager Section - แสดงเฉพาะหัวหน้า */}
      {isManager && teamStats && (
        <div className="space-y-4">
          {/* Team Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">สถิติทีมวันนี้</h3>
              <Link 
                to="/user/team-attendance"
                className="px-4 py-2 bg-[#48CBFF] hover:bg-[#3AB4E8] text-white rounded-lg text-sm font-medium transition-colors"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-[#48CBFF] rounded-xl p-4 text-center text-white">
                <p className="text-2xl font-bold">{teamStats.total}</p>
                <p className="text-sm mt-1">ทั้งหมด</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl text-green-600 font-bold">{teamStats.checkedIn}</p>
                <p className="text-sm text-gray-600 mt-1">เข้างาน</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <p className="text-2xl text-yellow-600 font-bold">{teamStats.late}</p>
                <p className="text-sm text-gray-600 mt-1">สาย</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl text-red-600 font-bold">{teamStats.absent}</p>
                <p className="text-sm text-gray-600 mt-1">ขาด</p>
              </div>
            </div>
          </div>

          {/* Pending Leaves */}
          {notifications && notifications.pendingLeaveCount > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
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
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  จัดการ
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Leave Balance */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF">
                <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">วันลาคงเหลือ</h3>
          <p className="text-3xl font-bold text-gray-800">{leaveBalance.total}</p>
          <p className="text-xs text-gray-500 mt-1">จาก {leaveBalance.quota} วัน</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">ลาป่วย:</span>
                <span className="font-semibold text-blue-600">{leaveBalance.breakdown.sick.remaining}/{leaveBalance.breakdown.sick.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ลากิจ:</span>
                <span className="font-semibold text-green-600">{leaveBalance.breakdown.personal.remaining}/{leaveBalance.breakdown.personal.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ลาพักร้อน:</span>
                <span className="font-semibold text-orange-600">{leaveBalance.breakdown.vacation.remaining}/{leaveBalance.breakdown.vacation.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FB923C">
                <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160ZM480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">กิจกรรม</h3>
          <p className="text-3xl font-bold text-gray-800">{userEvents.length}</p>
          <p className="text-xs text-gray-500 mt-1">กิจกรรมที่เกี่ยวข้อง</p>
          {userEvents.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link 
                to="/user/event" 
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
              >
                ดูกิจกรรมทั้งหมด
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">การแจ้งเตือนล่าสุด</h3>
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
            <p className="text-gray-500 text-center py-4">ไม่มีการแจ้งเตือน</p>
          ) : (
            userNotifications.map(notification => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  notification.type === 'success' ? 'bg-green-500' : 
                  notification.type === 'error' ? 'bg-red-500' :
                  notification.type === 'warning' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium text-sm leading-snug">{notification.title}</p>
                  {notification.description && (
                    <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] p-6">
              <h2 className="text-2xl font-bold text-white">เช็คชื่อแทนเพื่อน</h2>
              <p className="text-white/90 text-sm mt-1">กรุณากรอกข้อมูลเพื่อนของคุณ</p>
            </div>
            
            <div className="p-6 space-y-4">
              {buddySuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#22C55E">
                      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">บันทึกสำเร็จ!</h3>
                  <p className="text-gray-600 mt-2">เช็คชื่อแทนเพื่อนเรียบร้อยแล้ว</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <p className="text-xs text-gray-500 mt-1">กรอกเบอร์โทรศัพท์ 10 หลัก</p>
                  </div>

                  {buddyError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#EF4444">
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                      </svg>
                      <p className="text-sm text-red-600 font-medium">{buddyError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowBuddyCheckIn(false)
                        setBuddyData({ employeeId: '', phone: '' })
                        setBuddyError('')
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
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
    </div>
  )
}

export default UserDashboard