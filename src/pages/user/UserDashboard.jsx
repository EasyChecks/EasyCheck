import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import userData from '../../data/userData'

function UserDashboard() {
  const { attendance } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock data - ใช้ข้อมูลจาก userData.js
  const mockData = {
    user: {
      name: userData.name,
      employeeId: userData.workInfo.employeeId,
      department: userData.department,
      position: userData.position
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
          <Link 
            to="/user/take-photo"
            className={`${buttonColor} ${buttonTextColor} px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all inline-block`}
          >
            {buttonText}
          </Link>
        </div>
      </div>

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
    </div>
  )
}

export default UserDashboard