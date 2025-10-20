import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Nav from '../../../components/user/nav/Nav'
import { useAuth } from '../../../contexts/useAuth'
import { getLegacyUserData } from '../../../data/usersData' // Updated: merged from userData.js

function Layout() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('userProfileData')
    return saved ? JSON.parse(saved) : getLegacyUserData()
  })

  // อัพเดตข้อมูลเมื่อ localStorage เปลี่ยน
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('userProfileData')
      if (saved) {
        setProfileData(JSON.parse(saved))
      }
    }

    // ฟังการเปลี่ยนแปลงของ localStorage
    window.addEventListener('storage', handleStorageChange)
    
    // ตรวจสอบทุก 500ms (สำหรับการเปลี่ยนแปลงใน tab เดียวกัน)
    const interval = setInterval(() => {
      const saved = localStorage.getItem('userProfileData')
      if (saved) {
        const newData = JSON.parse(saved)
        setProfileData(prevData => {
          // เปรียบเทียบว่ามีการเปลี่ยนแปลงหรือไม่
          if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
            return newData
          }
          return prevData
        })
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // ใช้ข้อมูลจาก profileData ที่อัพเดตจาก localStorage
  const mockUser = {
    name: profileData.name,
    position: profileData.position,
    department: profileData.department,
    employeeId: profileData.workInfo?.employeeId || profileData.workInfo.employeeId,
    profileImage: profileData.profilePic
  }

  const handleLogout = () => {
    if (logout) {
      logout()
    }
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20 font-prompt">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white shadow-lg sticky w-full top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">ระบบลงเวลา</h1>
                <p className="text-xs text-blue-100">EasyCheck</p>
              </div>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{mockUser.name}</p>
                  <p className="text-xs text-blue-100">{mockUser.position}</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#48CBFF] font-bold shadow-md">
                  {mockUser.profileImage ? (
                    <img src={mockUser.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{mockUser.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] p-4 text-white">
                    <p className="font-semibold">{mockUser.name}</p>
                    <p className="text-sm text-blue-100">{mockUser.position}</p>
                    <p className="text-xs text-blue-100 mt-1">รหัส: {mockUser.employeeId}</p>
                  </div>
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        navigate('/user/profile')
                        setShowProfileMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#48CBFF">
                        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                      </svg>
                      <span>โปรไฟล์</span>
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/user/settings')
                        setShowProfileMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#48CBFF">
                        <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Z"/>
                      </svg>
                      <span>ตั้งค่า</span>
                    </button>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#DC2626">
                        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
                      </svg>
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <Nav />

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  )
}

export default Layout