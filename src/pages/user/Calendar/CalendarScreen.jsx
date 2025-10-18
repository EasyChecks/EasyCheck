import React, { useState } from 'react'
import { calendarEvents, attendanceData } from '../../../data/usersData'; // Import from centralized data

function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear())
  const [expanded, setExpanded] = useState(false)

  // Events data from centralized source
  const mockEvents = calendarEvents;

  // Attendance data from centralized source
  const mockAttendance = attendanceData;

  // Custom styles for select dropdown
  const selectStyles = `
    .custom-select {
      appearance: none;
      background-color: white;
      border: 2px solid #48CBFF;
      border-radius: 12px;
      padding: 10px 40px 10px 16px;
      font-weight: 600;
      color: #1f2937;
      cursor: pointer;
      transition: all 0.2s ease;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2348CBFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      box-shadow: 0 2px 4px rgba(72, 203, 255, 0.1);
    }
    
    .custom-select:hover {
      border-color: #2BB0E8;
      box-shadow: 0 4px 8px rgba(72, 203, 255, 0.2);
    }
    
    .custom-select:focus {
      outline: none;
      border-color: #48CBFF;
      box-shadow: 0 0 0 3px rgba(72, 203, 255, 0.2);
    }
    
    .custom-select option {
      padding: 12px 16px;
      background-color: white;
      color: #1f2937;
      font-weight: 500;
    }
    
    .custom-select option:checked {
      background-color: #BFECFF;
      color: #0891b2;
    }
    
    .custom-select option:hover {
      background-color: #E0F7FF;
    }
  `

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

  const monthShortNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

  // Note data
  const Note = [
    { color: "bg-red-600/75", text: "ขาดงาน", value: "absent" },
    { color: "bg-emerald-400/75", text: "สาย", value: "late" },
    { color: "bg-blue-600/75", text: "วันลาของพนักงาน", value: "leave" },
    { color: "bg-sky-300/75", text: "วันหยุดนักขัตฤกษ์", value: "holiday" },
    { color: "bg-yellow-200/75", text: "วันหยุด", value: "dayoff" },
    { color: "bg-black", text: "วันนี้", value: "normal" }
  ]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    // เปลี่ยน selectedDate ให้ตรงกับเดือนใหม่ด้วย
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    // เปลี่ยน selectedDate ให้ตรงกับเดือนใหม่ด้วย
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
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

  const getDateStatus = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // ตรวจสอบว่าเป็นวันหยุดนักขัตฤกษ์หรือไม่
    const holidayEvent = mockEvents.find(event => event.date === dateStr && event.status === 'holiday')
    if (holidayEvent) return 'holiday'
    
    // ตรวจสอบข้อมูลการลงเวลา
    const attendance = mockAttendance.find(att => att.date === dateStr)
    if (attendance) return attendance.status
    
    return null
  }

  const getStatusColor = (status) => {
    const statusColors = {
      'absent': 'bg-red-600/75 text-gray-800',
      'late': 'bg-orange-500/75 text-gray-800',
      'leave': 'bg-blue-600/75 text-gray-800',
      'holiday': 'bg-sky-300/75 text-gray-800',
      'dayoff': 'bg-yellow-200/75 text-gray-800',
      'normal': 'bg-black/75 text-white',
    }
    return statusColors[status] || ''
  }

  const getEventsForSelectedDate = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    return mockEvents.filter(event => event.date === dateStr)
  }

  const handleMonthSelect = (monthIndex) => {
    setCurrentDate(new Date(pickerYear, monthIndex, 1))
    // เปลี่ยน selectedDate ให้ตรงกับเดือนใหม่ด้วย
    setSelectedDate(new Date(pickerYear, monthIndex, 1))
    setShowMonthPicker(false)
  }

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="space-y-6">
      {/* Custom Select Styles */}
      <style>{selectStyles}</style>
      
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
          
          {/* Month/Year Picker Button */}
          <div className="relative">
            <button
              onClick={() => {
                setPickerYear(currentDate.getFullYear())
                setShowMonthPicker(!showMonthPicker)
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-800">
                {monthShortNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Month Picker Popup */}
            {showMonthPicker && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMonthPicker(false)}
                />
                
                {/* Popup */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 w-80">
                  {/* Year Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setPickerYear(prev => prev - 1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="text-xl">&lt;</span>
                    </button>
                    <h3 className="text-2xl font-bold text-gray-800">{pickerYear + 543}</h3>
                    <button
                      onClick={() => setPickerYear(prev => prev + 1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="text-xl">&gt;</span>
                    </button>
                  </div>

                  {/* Month Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {monthShortNames.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => handleMonthSelect(index)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all ${
                          currentDate.getMonth() === index && currentDate.getFullYear() === pickerYear
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Next Month Button */}
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
            const dateStatus = getDateStatus(day)
            const isTodayDate = isToday(day)
            const isSelected = isSelectedDate(day)
            
            // กำหนดสีตาม priority: วันนี้ > วันที่เลือก > status
            let colorClass = ''
            if (isTodayDate) {
              colorClass = 'bg-black text-white font-bold'
            } else if (isSelected) {
              colorClass = 'bg-gray-200 text-gray-800 font-bold'
            } else if (dateStatus) {
              colorClass = getStatusColor(dateStatus)
            } else {
              colorClass = 'hover:bg-gray-100'
            }
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center relative
                  transition-all duration-200
                  ${colorClass}
                `}
              >
                <span className="text-sm">{day}</span>
                {hasEvent(day) && (
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full absolute bottom-1" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="font-bold text-[16px] sm:text-[18px] md:text-[18px] lg:text-[18px] xl:text-[24px]">หมายเหตุ</div>
          <button
            onClick={toggleExpand}
            className="ml-2 p-2 rounded hover:bg-gray-100 transition-colors"
            aria-expanded={expanded}
            aria-controls="note-list"
          >
            <svg
              className={`w-6 h-6 text-gray-800 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 8"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"
              />
            </svg>
          </button>
        </div>

        {/* Note List */}
        <div 
          id="note-list" 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Note.map((note, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className={`w-5 h-5 ${note.color} rounded-full flex-shrink-0`}></div>
                <div className="text-[16px] sm:text-[18px] md:text-[18px] lg:text-[18px] xl:text-[24px]">{note.text}</div>
              </div>
            ))}
          </div>
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
            {getEventsForSelectedDate().map(event => {
              const statusColor = getStatusColor(event.status)
              return (
                <div key={event.id} className={`flex items-center space-x-3 p-4 rounded-lg ${statusColor} transition-colors`}>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm opacity-90">
                      {event.type === 'meeting' ? 'ประชุม' : event.type === 'holiday' ? 'วันหยุด' : 'อบรม'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarScreen
