import React, { useState } from 'react'
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/useAuth'
import { ThemeToggle } from '../../../components/common/ThemeToggle'

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return { title: 'ภาพรวมการปฏิบัติงานทั้งหมด', subtitle: 'ข้อมูลเรียลไทม์ของระบบตรวจสอบการเข้างาน การลางาน และพื้นที่อนุญาต' }
    if (path.includes('/manage-users')) return { title: 'จัดการผู้ใช้', subtitle: 'จัดการสิทธิ์การใช้งานและข้อมูลผู้ใช้ในระบบ' }
    if (path.includes('/attendance')) return { title: 'ตารางเวลางาน', subtitle: 'จัดการตารางเวลาและการเข้างานของพนักงาน' }
    if (path.includes('/download')) return { title: 'ดาวน์โหลดข้อมูล', subtitle: 'ส่งออกรายงานและข้อมูลต่างๆ' }
    if (path.includes('/mapping')) return { title: 'ตั้งค่าแผนที่และกิจกรรม', subtitle: 'จัดการพื้นที่อนุญาตและกิจกรรม' }
    if (path.includes('/notifications')) return { title: 'ส่งแจ้งเตือนแบบกลุ่ม', subtitle: 'ส่งข้อความแจ้งเตือนไปยังผู้ใช้' }
    if (path.includes('/checkin-approval')) return { title: 'อนุมัติเช็คชื่อแทน', subtitle: 'อนุมัติการเช็คชื่อแทนของพนักงาน' }
    if (path.includes('/warning')) return { title: 'การแจ้งเตือน', subtitle: 'ตรวจสอบสาเหตุการลา / มาสายของพนักงาน' }
    return { title: 'Admin Dashboard', subtitle: 'จัดการระบบ Easy Check' }
  }

  const pageInfo = getPageTitle()

  const handleLogout = () => {
    if (logout) {
      logout()
    }
    navigate('/auth')
  }

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'ภาพรวม',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Z"/>
        </svg>
      )
    },
    {
      path: '/admin/manage-users',
      label: 'จัดการผู้ใช้',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z"/>
        </svg>
      )
    },
    {
      path: '/admin/attendance',
      label: 'ตารางเวลางาน',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/>
        </svg>
      )
    },
    {
      path: '/admin/download',
      label: 'ดาวน์โหลดข้อมูล',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
        </svg>
      )
    },
    {
      path: '/admin/mapping',
      label: 'ต้ังค่าเเผนที่และกิจกรรม',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="m600-120-240-84-186 72q-20 8-37-4.5T120-170v-560q0-13 7.5-23t20.5-15l212-72 240 84 186-72q20-8 37 4.5t17 33.5v560q0 13-7.5 23T812-192l-212 72Zm-40-98v-468l-160-56v468l160 56Z"/>
        </svg>
      )
    },
    {
      path: '/admin/notifications',
      label: 'ส่งแจ้งเตือนแบบกลุ่ม',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160ZM480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Z"/>
        </svg>
      )
    },
    {
      path: '/admin/checkin-approval',
      label: 'อนุมัติเช็คชื่อแทน',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
        </svg>
      )
    },
    {
      path: '/admin/warning',
      label: 'รับการแจ้งเตือน',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Z"/>
        </svg>
      )
    }
  ]

  return (
    <div className="flex h-screen bg-accent dark:bg-secondary transition-colors duration-300">
      {/* Sidebar - Minimal Design */}
      <aside 
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white dark:bg-secondary/95 border-r border-gray-200 dark:border-white/10 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-2xl font-bold text-primary">Easy Check</h1>
              <p className="text-xs text-gray-500 dark:text-white/70 mt-1">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-accent dark:hover:bg-accent-orange/30 rounded-lg transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              height="24px" 
              viewBox="0 -960 960 960" 
              width="24px" 
              fill="currentColor"
              className={`text-gray-600 dark:text-white/90 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
            >
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all${
                    isActive
                      ? 'bg-accent-orange text-primary border-l-4 border-primary dark:bg-primary/10'
                      : 'text-gray-700 dark:text-white/90 hover:bg-accent dark:hover:bg-accent-orange/50 border-l-4 border-transparent'
                  } ${sidebarCollapsed ? 'justify-center px-3' : ''}`
                }
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className={`flex-shrink-0 ${({ isActive }) => isActive ? 'text-primary' : 'text-gray-600 dark:text-white/70 group-hover:text-primary'}`}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-primary hover:bg-orange-50 dark:hover:bg-primary/20 rounded-lg transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
            </svg>
            {!sidebarCollapsed && <span className="font-medium">ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-secondary/95 border-b border-gray-200 dark:border-white/10 p-[1.63rem] flex items-center justify-between transition-colors duration-300">
          <div>
            <h2 className="text-xl font-bold text-secondary dark:text-white">{pageInfo.title}</h2>
            <p className="text-sm text-gray-500 dark:text-white/70">{pageInfo.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content - เพิ่ม transition */}
        <main className="flex-1 overflow-y-auto bg-accent dark:bg-secondary transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout