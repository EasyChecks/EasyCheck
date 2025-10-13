import React from 'react'
import { NavLink } from 'react-router-dom'

function Nav() {
  const items = [
    { 
      id: 1, 
      path: '/', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>,
      text: 'หลัก'
    },
    { 
      id: 2, 
      path: '/leave',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"/></svg>,
      text: 'วันลา'
    },
    { 
      id: 3, 
      path: '/calendar',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>,
      text: 'ปฏิทิน'
    },
  ];
  
  return (
    <>
      <div 
          className='fixed bottom-0 left-0 right-0 bg-black p-4 border-t border-gray-200
          font-prompt shadow-lg'>
        <div className='flex justify-around'>
          {items.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({isActive}) => `
                p-2 rounded-lg flex flex-col items-center cursor-pointer 
                transition-all duration-300 ease-in-out
                hover:drop-shadow-[0_4px_8px_rgba(72,203,255,0.4)]
                ${isActive ? 'text-[#48CBFF] drop-shadow-[0_2px_4px_rgba(72,203,255,0.3)]' : 'text-[#A5A5A5]'}
              ` }
            >
              {({isActive}) => (
                <>
                  <div className='transition-all duration-300 ease-in-out'>
                    {React.cloneElement(item.icon, {
                      fill: isActive ? '#48CBFF' : '#A5A5A5',
                      className: 'transition-all duration-300 ease-in-out filter hover:drop-shadow-[0_4px_8px_rgba(72,203,255,0.6)]'
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