import React, { useState } from 'react'

function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Mock events data - รอทีมทำ API
  const mockEvents = [
    { id: 1, date: '2024-01-15', title: 'ประชุมทีม', type: 'meeting', color: 'blue' },
    { id: 2, date: '2024-01-20', title: 'วันหยุด', type: 'holiday', color: 'red' },
    { id: 3, date: '2024-01-25', title: 'อบรม', type: 'training', color: 'green' },
  ]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelectedDate = (day) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  const hasEvent = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return mockEvents.some(event => event.date === dateStr)
  }

  const getEventsForSelectedDate = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    return mockEvents.filter(event => event.date === dateStr)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">ปฏิทิน</h1>
        <p className="text-gray-600 mt-1">ดูกำหนดการและกิจกรรม</p>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>
          
          <h2 className="text-xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center font-bold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center relative
                  transition-all duration-200
                  ${isToday(day) ? 'bg-blue-500 text-white font-bold' : ''}
                  ${isSelectedDate(day) && !isToday(day) ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                  ${!isToday(day) && !isSelectedDate(day) ? 'hover:bg-gray-100' : ''}
                `}
              >
                <span className="text-sm">{day}</span>
                {hasEvent(day) && (
                  <div className="w-1 h-1 bg-orange-500 rounded-full absolute bottom-1" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events for Selected Date */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          กิจกรรมวันที่ {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
        </h3>
        
        {getEventsForSelectedDate().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#9CA3AF" className="mx-auto mb-2">
              <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/>
            </svg>
            <p>ไม่มีกิจกรรมในวันนี้</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getEventsForSelectedDate().map(event => (
              <div key={event.id} className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`w-3 h-3 rounded-full bg-${event.color}-500`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {event.type === 'meeting' ? 'ประชุม' : event.type === 'holiday' ? 'วันหยุด' : 'อบรม'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">สัญลักษณ์</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-sm text-gray-700">วันนี้</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded border-2 border-blue-600" />
            <span className="text-sm text-gray-700">วันที่เลือก</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-sm text-gray-700">มีกิจกรรม</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarScreen
