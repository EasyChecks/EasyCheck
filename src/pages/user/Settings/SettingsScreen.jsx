import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/useAuth'

function SettingsScreen() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = () => {
    if (logout) {
      logout()
    }
    navigate('/auth')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่า</h1>
        <p className="text-gray-600 mt-1">จัดการการตั้งค่าและความเป็นส่วนตัว</p>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">บัญชี</h2>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/user/profile')}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#48CBFF">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">แก้ไขโปรไฟล์</p>
                <p className="text-sm text-gray-600">จัดการข้อมูลส่วนตัว</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>

          <button
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#22C55E">
                  <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">เปลี่ยนรหัสผ่าน</p>
                <p className="text-sm text-gray-600">อัปเดตรหัสผ่านของคุณ</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">การตั้งค่าแอป</h2>
        <div className="space-y-4">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FB923C">
                  <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160ZM480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">การแจ้งเตือน</p>
                <p className="text-sm text-gray-600">รับการแจ้งเตือนต่างๆ</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`
                w-14 h-7 rounded-full transition-colors duration-200
                ${notifications ? 'bg-blue-500' : 'bg-gray-300'}
              `}
            >
              <div className={`
                w-5 h-5 bg-white rounded-full transition-transform duration-200
                ${notifications ? 'translate-x-8' : 'translate-x-1'}
              `} />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#A855F7">
                  <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">โหมดมืด</p>
                <p className="text-sm text-gray-600">เปิดใช้งานธีมมืด (เร็วๆ นี้)</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              disabled
              className={`
                w-14 h-7 rounded-full transition-colors duration-200 opacity-50
                ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}
              `}
            >
              <div className={`
                w-5 h-5 bg-white rounded-full transition-transform duration-200
                ${darkMode ? 'translate-x-8' : 'translate-x-1'}
              `} />
            </button>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#EC4899">
                  <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">ภาษา</p>
                <p className="text-sm text-gray-600">ไทย</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">เกี่ยวกับ</h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-gray-800">เงื่อนไขการใช้งาน</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-gray-800">นโยบายความเป็นส่วนตัว</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>

          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">เวอร์ชัน</p>
            <p className="font-medium text-gray-800">1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-md hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
        <span>ออกจากระบบ</span>
      </button>
    </div>
  )
}

export default SettingsScreen
