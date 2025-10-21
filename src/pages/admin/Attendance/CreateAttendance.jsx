import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useLocations } from '../../../contexts/LocationContext'
import PageModal from '../../../components/common/PageModal'

// Inline styles for animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes bounceIn {
    from {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    to {
      transform: scale(1);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }

  .animate-bounce-in {
    animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
`

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  if (!document.head.querySelector('style[data-createattendance-styles]')) {
    styleSheet.setAttribute('data-createattendance-styles', 'true')
    document.head.appendChild(styleSheet)
  }
}

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to handle map clicks
function MapClickHandler({ onMapClick, isActive }) {
  useMapEvents({
    click: (e) => {
      if (isActive) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

export default function CreateAttendance({ onClose, onCreate, initialData, onUpdate }) {
  const { locations, addLocation } = useLocations()
  const [team, setTeam] = useState('')
  const [date, setDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [location, setLocation] = useState('')
  const [month, setMonth] = useState('')
  const [members, setMembers] = useState('')
  const [type, setType] = useState('')
  const [preparations, setPreparations] = useState('')
  const [tasks, setTasks] = useState('')
  const [goals, setGoals] = useState('')
  const [showMapModal, setShowMapModal] = useState(false)
  const [showWarningPopup, setShowWarningPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  // New location form for map modal
  const [newLocationForm, setNewLocationForm] = useState({
    name: '',
    description: '',
    radius: '100',
    latitude: '',
    longitude: ''
  })
  const [mapClickEnabled, setMapClickEnabled] = useState(false)
  const [showNewLocationForm, setShowNewLocationForm] = useState(false)
  const [showTimeStartPicker, setShowTimeStartPicker] = useState(false)
  const [showTimeEndPicker, setShowTimeEndPicker] = useState(false)

  // If initialData provided, prefill fields (support editing)
  useEffect(() => {
    if (!initialData) return
    setTeam(initialData.team || '')
    setDate(initialData.date || '')
    // derive month (YYYY-MM) from date if available, or accept initialData.month
    if (initialData.month) setMonth(initialData.month)
    else if (initialData.date && initialData.date.length >= 7) setMonth(initialData.date.slice(0, 7))
    // parse time if in format 'HH:MM - HH:MM'
    if (initialData.time && initialData.time.includes('-')) {
      const parts = initialData.time.split('-').map(s => s.trim())
      setTimeStart(parts[0] || '')
      setTimeEnd(parts[1] || '')
    } else {
      setTimeStart(initialData.time || '')
      setTimeEnd('')
    }
    setLocation(initialData.location || '')
    setMembers(initialData.members || '')
    setType(initialData.type || '')
    setPreparations((initialData.preparations || []).join('\n'))
    setTasks((initialData.tasks || []).join('\n'))
    setGoals((initialData.goals || []).join('\n'))
  }, [initialData])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // refs to call native pickers where supported
  const monthRef = useRef(null)
  const dateRef = useRef(null)
  const timeStartRef = useRef(null)
  const timeEndRef = useRef(null)
  const timeStartPickerRef = useRef(null)
  const timeEndPickerRef = useRef(null)

  // Close time pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeStartPickerRef.current && !timeStartPickerRef.current.contains(event.target)) {
        setShowTimeStartPicker(false)
      }
      if (timeEndPickerRef.current && !timeEndPickerRef.current.contains(event.target)) {
        setShowTimeEndPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Default map center (Bangkok)
  const defaultCenter = [13.7606, 100.5034]
  const defaultZoom = 12

  // Handle map click to create new location
  const handleMapClick = (latlng) => {
    if (mapClickEnabled) {
      setNewLocationForm(prev => ({
        ...prev,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6)
      }))
      setShowNewLocationForm(true)
      setMapClickEnabled(false)
    }
  }

  // Handle select existing location from map
  const handleSelectLocation = (locationName) => {
    setLocation(locationName)
    setShowMapModal(false)
  }

  // Handle create new location from map
  const handleCreateNewLocation = () => {
    if (!newLocationForm.name || !newLocationForm.radius || !newLocationForm.latitude || !newLocationForm.longitude) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วน')
      setShowErrorPopup(true)
      setTimeout(() => {
        setShowErrorPopup(false)
      }, 3000)
      return
    }

    const maxId = locations.length > 0 ? Math.max(...locations.map(loc => loc.id)) : 0
    const newLocation = {
      id: maxId + 1,
      name: newLocationForm.name.trim(),
      description: newLocationForm.description.trim() || '',
      radius: parseFloat(newLocationForm.radius),
      latitude: parseFloat(newLocationForm.latitude),
      longitude: parseFloat(newLocationForm.longitude),
      status: 'active'
    }

    // Add to locations context
    addLocation(newLocation)
    
    // Set as selected location
    setLocation(newLocation.name)
    
    // Reset form
    setNewLocationForm({
      name: '',
      description: '',
      radius: '100',
      latitude: '',
      longitude: ''
    })
    setShowNewLocationForm(false)
    setShowMapModal(false)
  }

  // Cancel new location form
  const handleCancelNewLocation = () => {
    setNewLocationForm({
      name: '',
      description: '',
      radius: '100',
      latitude: '',
      longitude: ''
    })
    setShowNewLocationForm(false)
    setMapClickEnabled(false)
  }

  // Handle map modal open with validation
  const handleOpenMapModal = () => {
    // ตรวจสอบว่ากรอกข้อมูลพื้นฐานแล้วหรือยัง
    if (!team || !date) {
      setShowWarningPopup(true)
      setTimeout(() => {
        setShowWarningPopup(false)
      }, 3000)
      return
    }
    setShowMapModal(true)
  }

  // helpers to normalize user input
  const pad = (n) => n.toString().padStart(2, '0')

  const normalizeTime = (input) => {
    if (!input) return ''
    const s = input.trim().toLowerCase()
    // am/pm
    const ampm = s.match(/^(\d{1,2}):?(\d{2})\s*(am|pm)$/)
    if (ampm) {
      let h = parseInt(ampm[1], 10)
      const m = parseInt(ampm[2], 10)
      if (ampm[3] === 'pm' && h < 12) h += 12
      if (ampm[3] === 'am' && h === 12) h = 0
      return `${pad(h)}:${pad(m)}`
    }

    // 24h H:MM or HH:MM or HMM
    const hhmm = s.match(/^(\d{1,2}):?(\d{2})$/)
    if (hhmm) {
      let h = parseInt(hhmm[1], 10)
      let m = parseInt(hhmm[2], 10)
      if (h >= 0 && h < 24 && m >= 0 && m < 60) return `${pad(h)}:${pad(m)}`
    }

    // if not recognized, return original trimmed (let server/consumer handle)
    return input.trim()
  }

  const normalizeDate = (input) => {
    if (!input) return ''
    const s = input.trim()
    // ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (dmy) {
      const d = pad(parseInt(dmy[1], 10))
      const m = pad(parseInt(dmy[2], 10))
      const y = dmy[3]
      return `${y}-${m}-${d}`
    }

    // MM/DD/YYYY
    const mdy = s.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/)
    if (mdy) {
      const m = pad(parseInt(mdy[1], 10))
      const d = pad(parseInt(mdy[2], 10))
      const y = mdy[3]
      return `${y}-${m}-${d}`
    }

    // fallback: try Date parser
    const parsed = new Date(s)
    if (!isNaN(parsed)) {
      const y = parsed.getFullYear()
      const m = pad(parsed.getMonth() + 1)
      const d = pad(parsed.getDate())
      return `${y}-${m}-${d}`
    }

    return s
  }

  const openNativePicker = (ref) => {
    try {
      if (ref && ref.current) ref.current.showPicker?.() || ref.current.click()
    } catch (e) {
      // some browsers don't support showPicker
      ref.current && ref.current.click()
    }
  }

  // Generate hours for 24-hour format (00-23)
  const hours24 = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  // Generate minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  const handleTimeSelect = (hour, minute, isStart) => {
    const timeValue = `${hour}:${minute}`
    if (isStart) {
      setTimeStart(timeValue)
      setShowTimeStartPicker(false)
    } else {
      setTimeEnd(timeValue)
      setShowTimeEndPicker(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // normalize times/dates before creating payload
    const nTimeStart = normalizeTime(timeStart)
    const nTimeEnd = normalizeTime(timeEnd)
    const timeStr = nTimeStart && nTimeEnd ? `${nTimeStart} - ${nTimeEnd}` : (nTimeStart || nTimeEnd || '')
    const nDate = normalizeDate(date)
    const payload = {
      id: initialData?.id ?? Date.now(),
      team: team || 'ทีมใหม่',
      month: month || (nDate ? nDate.slice(0,7) : ''),
      date: nDate || '',
      time: timeStr,
      location: location || '',
      members: members || '',
      type: type || '',
      preparations: preparations.split('\n').map(s => s.trim()).filter(Boolean),
      tasks: tasks.split('\n').map(s => s.trim()).filter(Boolean),
      goals: goals.split('\n').map(s => s.trim()).filter(Boolean),
    }

    if (onUpdate) {
      onUpdate(payload)
    } else if (onCreate) {
      onCreate(payload)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[92%] max-w-4xl bg-white rounded-lg border-4 border-[#1877F2] p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-[#0b2b57] mb-2">จัดตารางการทำงาน</h2>
        <p className="text-sm text-gray-600 mb-4">กรอกข้อมูลเพื่อสร้างตารางงานใหม่</p>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-auto pr-2">
          <div>
            <label className="block text-sm text-gray-700 mb-1">ชื่อทีม</label>
            <input value={team} onChange={e => setTeam(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="ทีม" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">วันที่</label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => openNativePicker(dateRef)}
                  aria-label="เปิดตัวเลือกวันที่"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {/* calendar icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                    <path d="M16 2v4M8 2v4" strokeWidth="1.5" />
                  </svg>
                </button>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="YYYY-MM-DD or DD/MM/YYYY"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  onBlur={e => setDate(prev => normalizeDate(prev))}
                  className="w-full border rounded px-3 py-2 pr-10"
                  aria-label="วันที่ (พิมพ์หรือใช้ปุ่มเลือก)"
                />

                {/* hidden native date picker for devices that support it */}
                <input
                  ref={dateRef}
                  type="date"
                  className="sr-only"
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">เวลาเริ่ม (24 ชม.)</label>
                <div className="relative w-full" ref={timeStartPickerRef}>
                  <input
                    type="text"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    onBlur={(e) => setTimeStart(prev => normalizeTime(prev))}
                    onFocus={() => setShowTimeStartPicker(true)}
                    placeholder="เช่น 09:00"
                    className="w-full border rounded px-3 py-2 pr-10 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimeStartPicker(!showTimeStartPicker)
                      setShowTimeEndPicker(false)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path d="M12 7v6l4 2" strokeWidth="1.5" />
                    </svg>
                  </button>

                  {/* Custom Time Picker Dropdown */}
                  {showTimeStartPicker && (
                    <div className="absolute z-50 mt-1 w-full bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-64 overflow-hidden">
                      <div className="flex">
                        {/* Hours Column */}
                        <div className="flex-1 border-r border-gray-200">
                          <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                            ชั่วโมง
                          </div>
                          <div className="overflow-y-auto max-h-56">
                            {hours24.map((hour) => (
                              <button
                                key={hour}
                                type="button"
                                onClick={() => {
                                  const currentMinute = timeStart?.split(':')[1] || '00'
                                  handleTimeSelect(hour, currentMinute, true)
                                }}
                                className={`w-full px-3 py-2 text-center hover:bg-blue-50 transition-colors ${
                                  timeStart?.startsWith(hour) ? 'bg-blue-100 font-semibold text-blue-600' : ''
                                }`}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Minutes Column */}
                        <div className="flex-1">
                          <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                            นาที
                          </div>
                          <div className="overflow-y-auto max-h-56">
                            {minutes.map((minute) => (
                              <button
                                key={minute}
                                type="button"
                                onClick={() => {
                                  const currentHour = timeStart?.split(':')[0] || '00'
                                  handleTimeSelect(currentHour, minute, true)
                                }}
                                className={`w-full px-3 py-2 text-center hover:bg-blue-50 transition-colors ${
                                  timeStart?.endsWith(minute) ? 'bg-blue-100 font-semibold text-blue-600' : ''
                                }`}
                              >
                                {minute}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">เวลาสิ้นสุด (24 ชม.)</label>
                <div className="relative w-full" ref={timeEndPickerRef}>
                  <input
                    type="text"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    onBlur={(e) => setTimeEnd(prev => normalizeTime(prev))}
                    onFocus={() => setShowTimeEndPicker(true)}
                    placeholder="เช่น 17:00"
                    className="w-full border rounded px-3 py-2 pr-10 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimeEndPicker(!showTimeEndPicker)
                      setShowTimeStartPicker(false)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path d="M12 7v6l4 2" strokeWidth="1.5" />
                    </svg>
                  </button>

                  {/* Custom Time Picker Dropdown */}
                  {showTimeEndPicker && (
                    <div className="absolute z-50 mt-1 w-full bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-64 overflow-hidden">
                      <div className="flex">
                        {/* Hours Column */}
                        <div className="flex-1 border-r border-gray-200">
                          <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                            ชั่วโมง
                          </div>
                          <div className="overflow-y-auto max-h-56">
                            {hours24.map((hour) => (
                              <button
                                key={hour}
                                type="button"
                                onClick={() => {
                                  const currentMinute = timeEnd?.split(':')[1] || '00'
                                  handleTimeSelect(hour, currentMinute, false)
                                }}
                                className={`w-full px-3 py-2 text-center hover:bg-blue-50 transition-colors ${
                                  timeEnd?.startsWith(hour) ? 'bg-blue-100 font-semibold text-blue-600' : ''
                                }`}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Minutes Column */}
                        <div className="flex-1">
                          <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                            นาที
                          </div>
                          <div className="overflow-y-auto max-h-56">
                            {minutes.map((minute) => (
                              <button
                                key={minute}
                                type="button"
                                onClick={() => {
                                  const currentHour = timeEnd?.split(':')[0] || '00'
                                  handleTimeSelect(currentHour, minute, false)
                                }}
                                className={`w-full px-3 py-2 text-center hover:bg-blue-50 transition-colors ${
                                  timeEnd?.endsWith(minute) ? 'bg-blue-100 font-semibold text-blue-600' : ''
                                }`}
                              >
                                {minute}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">สถานที่</label>
            <div className="relative">
              <button
                type="button"
                onClick={handleOpenMapModal}
                aria-label="เปิดแผนที่เลือกสถานที่"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 z-10"
              >
                {/* Map icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </button>

              <input 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="w-full border rounded px-3 py-2 pr-12" 
                placeholder="พิมพ์หรือเลือกจากแผนที่" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">สมาชิก</label>
              <input value={members} onChange={e => setMembers(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="สมาชิก" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">ประเภทงาน</label>
              <input value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="ประเภทงาน" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">สิ่งที่ต้องเตรียม (แต่ละบรรทัดคือรายการ)</label>
            <textarea value={preparations} onChange={e => setPreparations(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} placeholder="รายการเตรียม" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">ภารกิจหลัก (แต่ละบรรทัดคือภารกิจ)</label>
            <textarea value={tasks} onChange={e => setTasks(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} placeholder="ภารกิจ" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">เป้าหมาย (แต่ละบรรทัด)</label>
            <textarea value={goals} onChange={e => setGoals(e.target.value)} className="w-full border rounded px-3 py-2" rows={2} placeholder="เป้าหมาย" />
          </div>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button 
              type="submit" 
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-b from-[#2b78d3] to-[#1877F2] text-white rounded-full shadow-md hover:shadow-lg hover:from-[#2466c2] hover:to-[#166fe0] transition-all duration-200 font-medium text-sm"
            >
              บันทึก
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <PageModal onClose={() => setShowMapModal(false)}>
          <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '90vh' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">เลือกสถานที่จากแผนที่</h3>
                <p className="text-sm text-blue-100 mt-1">คลิกบนแผนที่เพื่อสร้างพื้นที่ใหม่ หรือเลือกจากพื้นที่ที่มีอยู่</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row" style={{ height: 'calc(90vh - 80px)' }}>
              {/* Map Section */}
              <div className="flex-1 relative">
                <MapContainer
                  center={defaultCenter}
                  zoom={defaultZoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="แผนที่ปกติ">
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="แผนที่ดาวเทียม">
                      <TileLayer
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>

                  <MapClickHandler onMapClick={handleMapClick} isActive={mapClickEnabled} />

                  {/* Show existing locations */}
                  {locations.map((loc) => (
                    <React.Fragment key={loc.id}>
                      <Marker 
                        position={[loc.latitude, loc.longitude]}
                        eventHandlers={{
                          click: () => handleSelectLocation(loc.name)
                        }}
                      />
                      <Circle
                        center={[loc.latitude, loc.longitude]}
                        radius={loc.radius}
                        pathOptions={{ 
                          color: 'green',
                          fillColor: 'green',
                          fillOpacity: 0.2 
                        }}
                      />
                    </React.Fragment>
                  ))}

                  {/* Show new location preview */}
                  {newLocationForm.latitude && newLocationForm.longitude && (
                    <>
                      <Marker position={[parseFloat(newLocationForm.latitude), parseFloat(newLocationForm.longitude)]} />
                      {newLocationForm.radius && (
                        <Circle
                          center={[parseFloat(newLocationForm.latitude), parseFloat(newLocationForm.longitude)]}
                          radius={parseFloat(newLocationForm.radius)}
                          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                        />
                      )}
                    </>
                  )}
                </MapContainer>

                {/* Enable Click Mode Button */}
                {!mapClickEnabled && !showNewLocationForm && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                    <button
                      onClick={() => setMapClickEnabled(true)}
                      className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      สร้างพื้นที่ใหม่
                    </button>
                  </div>
                )}

                {mapClickEnabled && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-[1000] pointer-events-none">
                    คลิกบนแผนที่เพื่อเลือกตำแหน่ง
                  </div>
                )}
              </div>

              {/* Sidebar - Location List or New Location Form */}
              <div className="lg:w-96 bg-gray-50 overflow-y-auto border-l border-gray-200">
                {showNewLocationForm ? (
                  // New Location Form
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">สร้างพื้นที่ใหม่</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ชื่อสถานที่ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newLocationForm.name}
                          onChange={(e) => setNewLocationForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="เช่น สำนักใหญ่ TGS"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          รายละเอียด
                        </label>
                        <input
                          type="text"
                          value={newLocationForm.description}
                          onChange={(e) => setNewLocationForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="เช่น ศูนย์การประชุมหลัก"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          รัศมี (เมตร) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={newLocationForm.radius}
                          onChange={(e) => setNewLocationForm(prev => ({ ...prev, radius: e.target.value }))}
                          placeholder="100"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          พิกัด (Latitude)
                        </label>
                        <input
                          type="text"
                          value={newLocationForm.latitude}
                          readOnly
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          พิกัด (Longitude)
                        </label>
                        <input
                          type="text"
                          value={newLocationForm.longitude}
                          readOnly
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleCreateNewLocation}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          สร้างและเลือก
                        </button>
                        <button
                          onClick={handleCancelNewLocation}
                          className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Location List
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">พื้นที่ที่มีอยู่ ({locations.length})</h4>
                    
                    {locations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>ยังไม่มีพื้นที่</p>
                        <p className="text-sm mt-2">คลิก "สร้างพื้นที่ใหม่" เพื่อเริ่มต้น</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {locations.map((loc) => (
                          <button
                            key={loc.id}
                            onClick={() => handleSelectLocation(loc.name)}
                            className="w-full text-left bg-white border-2 border-gray-200 hover:border-blue-400 rounded-lg p-4 transition-all hover:shadow-md"
                          >
                            <div className="flex items-start gap-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">{loc.name}</div>
                                {loc.description && (
                                  <div className="text-sm text-gray-500 mt-1">{loc.description}</div>
                                )}
                                <div className="text-xs text-gray-400 mt-2">
                                  รัศมี: {loc.radius} เมตร
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageModal>
      )}

      {/* Warning Popup - กรอกข้อมูลก่อนเปิดแผนที่ */}
      {showWarningPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 border-2 border-orange-400 pointer-events-auto animate-bounce-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">กรุณากรอกข้อมูลก่อน!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  กรุณากรอก <span className="font-semibold text-orange-600">ชื่อทีม</span> และ <span className="font-semibold text-orange-600">วันที่</span> ก่อนเลือกสถานที่
                </p>
              </div>
              <button
                onClick={() => setShowWarningPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup - กรอกข้อมูลไม่ครบในแผนที่ */}
      {showErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 border-2 border-red-400 pointer-events-auto animate-bounce-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">ข้อมูลไม่ครบ!</h3>
                <p className="text-sm text-gray-600 mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}