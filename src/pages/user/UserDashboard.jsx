import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { useTeam } from '../../contexts/useTeam'
import { useLoading } from '../../contexts/useLoading'
import { validateBuddy } from '../../data/usersData' // Updated: merged from buddyData.js

function UserDashboard() {
  const { attendance, user } = useAuth() // เพิ่ม user จาก useAuth
  const { getTeamStats, getUnreadNotifications } = useTeam()
  const { hideLoading } = useLoading()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showBuddyCheckIn, setShowBuddyCheckIn] = useState(false)
  const [buddyData, setBuddyData] = useState({
    employeeId: '',
    phone: ''
  })
  const [buddyError, setBuddyError] = useState('')
  const [buddySuccess, setBuddySuccess] = useState(false)

  // ตรวจสอบว่าเป็นหัวหน้าหรือไม่ - ใช้ user จาก context แทน userData
  const isManager = useMemo(() => user?.role === 'manager', [user])
  const teamStats = useMemo(() => isManager ? getTeamStats() : null, [isManager, getTeamStats])
  const notifications = useMemo(() => isManager ? getUnreadNotifications() : null, [isManager, getUnreadNotifications])

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
    },
    leave: {
      remaining: 10,
      used: 2,
      total: 12
    },
    notifications: [
      { id: 1, title: 'การลาได้รับการอนุมัติ', date: '2024-01-15', type: 'success' },
      { id: 2, title: 'มีกิจกรรมใหม่', date: '2024-01-14', type: 'info' },
      { id: 3, title: 'ระบบจะปิดปรับปรุงในวันอาทิตย์', date: '2024-01-10', type: 'info' },
      { id: 4, title: 'อย่าลืมเช็คอินเข้างานทุกวัน', date: '2024-01-09', type: 'info' },
      { id: 5, title: 'ประกาศวันหยุดพิเศษ', date: '2024-01-08', type: 'success' }
    ]
  }

  // ใช้ attendance จาก context แทน mock data
  const isCheckedIn = attendance.status === 'checked_in'
  const buttonColor = isCheckedIn 
    ? 'bg-[#FF6666] hover:bg-[#FF5555] shadow-[0_4px_12px_rgba(255,102,102,0.4)]' 
    : 'bg-white hover:shadow-xl'
  const buttonTextColor = isCheckedIn ? 'text-white' : 'text-[#48CBFF]'
  const buttonText = isCheckedIn ? 'ออกงาน' : 'เข้างาน'

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
              to="/user/take-photo"
              className={`${buttonColor} ${buttonTextColor} px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all inline-block text-center`}
            >
              {buttonText}
            </Link>
            <button
              onClick={() => setShowBuddyCheckIn(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-all border border-white/30"
            >
              เช็คชื่อแทนเพื่อน
            </button>
          </div>
        </div>
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
            <div className="grid grid-cols-4 gap-4">
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
          <p className="text-3xl font-bold text-gray-800">{mockData.leave.remaining}</p>
          <p className="text-xs text-gray-500 mt-1">จาก {mockData.leave.total} วัน</p>
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
          <p className="text-3xl font-bold text-gray-800">5</p>
          <p className="text-xs text-gray-500 mt-1">กิจกรรมที่กำลังจะมาถึง</p>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">การแจ้งเตือนล่าสุด</h3>
        <div 
          className={`space-y-3 ${
            mockData.notifications.length > 3 
              ? 'max-h-[300px] overflow-y-auto pr-2' 
              : ''
          }`}
          style={mockData.notifications.length > 3 ? {
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 #F1F5F9'
          } : {}}
        >
          {mockData.notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">ไม่มีการแจ้งเตือน</p>
          ) : (
            mockData.notifications.map(notification => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.date}</p>
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