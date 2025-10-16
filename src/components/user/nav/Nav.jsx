import React, { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import userData from '../../../data/userData'

function Nav() {
  // ตรวจสอบว่าเป็น manager หรือไม่
  const isManager = useMemo(() => userData.role === 'manager', [])

  // รวมเมนูตามสิทธิ์
  const items = useMemo(() => {
    // เมนูพื้นฐานสำหรับทุกคน
    const basicItems = [
      { 
        id: 1, 
        path: '/user/dashboard', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>,
        text: 'หลัก'
      }
    ]

    // เมนูเพิ่มเติมสำหรับ manager (ทีม, อนุมัติ)
    const managerItems = [
      {
        id: 2,
        path: '/user/team-attendance',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z"/></svg>,
        text: 'ทีม'
      },
      {
        id: 3,
        path: '/user/leave-approval',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>,
        text: 'อนุมัติ'
      }
    ]

    // เมนูที่เหลือสำหรับทุกคน (วันลา, ปฏิทิน, กิจกรรม)
    const commonItems = [
      { 
        id: 4, 
        path: '/user/leave',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Z"/></svg>,
        text: 'วันลา'
      },
      { 
        id: 5, 
        path: '/user/calendar',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/></svg>,
        text: 'ปฏิทิน'
      },
      { 
        id: 6, 
        path: '/user/event',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"/></svg>,
        text: 'กิจกรรม'
      }
    ]

    // รวมเมนูตามสิทธิ์: หลัก → (ทีม, อนุมัติ ถ้าเป็น manager) → วันลา → ปฏิทิน → กิจกรรม
    return isManager 
      ? [...basicItems, ...managerItems, ...commonItems] 
      : [...basicItems, ...commonItems]
  }, [isManager])
  
  return (
    <>
      <div 
          className='fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200
          font-prompt shadow-lg z-50 max-w-7xl mx-auto'>
        <div className='flex justify-around items-center'>
          {items.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({isActive}) => `
                px-4 py-2 rounded-xl flex flex-col items-center cursor-pointer 
                transition-all duration-300 ease-in-out min-w-[70px]
                hover:bg-blue-50
                ${isActive ? 'text-[#48CBFF] bg-blue-50 scale-105' : 'text-[#A5A5A5]'}
              ` }
            >
              {({isActive}) => (
                <>
                  <div className='transition-all duration-300 ease-in-out'>
                    {React.cloneElement(item.icon, {
                      fill: isActive ? '#48CBFF' : '#A5A5A5',
                      className: 'transition-all duration-300 ease-in-out'
                    })}
                  </div>
                  <div className="text-center text-xs mt-1 transition-all duration-300 ease-in-out font-medium">
                    {item.text}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}

export default Nav