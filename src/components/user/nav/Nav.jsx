import React from 'react'
import { NavLink } from 'react-router-dom'

function Nav() {
  const items = [
    { 
      id: 1, 
      path: '/user/dashboard', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>,
      text: 'หลัก'
    },
    { 
      id: 2, 
      path: '/user/leave',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Z"/></svg>,
      text: 'วันลา'
    },
    { 
      id: 3, 
      path: '/user/calendar',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/></svg>,
      text: 'ปฏิทิน'
    },
    { 
      id: 4, 
      path: '/user/events',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"/></svg>,
      text: 'กิจกรรม'
    },
  ];
  
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