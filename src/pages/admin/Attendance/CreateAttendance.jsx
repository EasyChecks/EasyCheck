import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useLocations } from '../../../contexts/LocationContext'
import { usersData } from '../../../data/usersData'
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

  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
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

// Component to handle map clicks - memoize เพื่อลด re-render
const MapClickHandler = React.memo(function MapClickHandler({ onMapClick, isActive }) {
  useMapEvents({
    click: (e) => {
      if (isActive) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
})

// Map Component - แยกออกมาเพื่อ lazy load
const LocationMapView = React.memo(function LocationMapView({ 
  defaultCenter, 
  defaultZoom, 
  mapClickEnabled, 
  handleMapClick, 
  locations, 
  handleSelectLocation,
  newLocationForm 
}) {
  return (
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
  )
})

export default function CreateAttendance({ onClose, onCreate, initialData, onUpdate }) {
  const { locations, addLocation } = useLocations()
  const [team, setTeam] = useState('')
  const [date, setDate] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [location, setLocation] = useState('')
  const [month, setMonth] = useState('')
  const [members, setMembers] = useState('')
  const [type, setType] = useState('')
  const [preparations, setPreparations] = useState('')
  const [tasks, setTasks] = useState('')
  const [goals, setGoals] = useState('')
  const [selectedTeams, setSelectedTeams] = useState([]) // แผนก/ตำแหน่งที่จะเห็นตาราง
  const [showTeamsDropdown, setShowTeamsDropdown] = useState(false) // แสดง/ซ่อน dropdown
  const teamsDropdownRef = useRef(null) // ref สำหรับปิด dropdown เมื่อคลิกนอก
  const [showTypeDropdown, setShowTypeDropdown] = useState(false) // แสดง/ซ่อน dropdown ประเภทงาน
  const typeDropdownRef = useRef(null) // ref สำหรับปิด dropdown ประเภทงาน
  const [showMembersDropdown, setShowMembersDropdown] = useState(false) // แสดง/ซ่อน dropdown สมาชิก
  const membersDropdownRef = useRef(null) // ref สำหรับปิด dropdown สมาชิก
  const [selectedMembers, setSelectedMembers] = useState([]) // สมาชิกที่เลือก
  const [workTypes, setWorkTypes] = useState(() => [
    'งานประจำ',
    'โครงการพิเศษ',
    'งานบริการลูกค้า',
    'งานวิจัยและพัฒนา',
    'งานการตลาด',
    'งานฝึกอบรม',
    'งานประชุม',
    'งานสัมมนา',
    'งานอีเวนท์',
    'งานบำรุงรักษา'
  ]) // รายการประเภทงาน - lazy init
  const [showAddTypeForm, setShowAddTypeForm] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [showMapModal, setShowMapModal] = useState(false)
  const [showWarningPopup, setShowWarningPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  // รายการแผนกและตำแหน่งที่มี
  const availableTeams = [
    'IT',
    'Engineering', 
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Manager',
    'Staff'
  ]
  
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
  const [searchLocation, setSearchLocation] = useState('') // ค้นหาสถานที่

  // If initialData provided, prefill fields (support editing)
  useEffect(() => {
    if (!initialData) return
    setTeam(initialData.team || '')
    setDate(initialData.date || '')
    setDateEnd(initialData.dateEnd || '')
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
    setSelectedTeams(initialData.teams || [])
  }, [initialData])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (teamsDropdownRef.current && !teamsDropdownRef.current.contains(event.target)) {
        setShowTeamsDropdown(false)
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false)
        setShowAddTypeForm(false)
      }
      if (membersDropdownRef.current && !membersDropdownRef.current.contains(event.target)) {
        setShowMembersDropdown(false)
      }
    }
    
    if (showTeamsDropdown || showTypeDropdown || showMembersDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTeamsDropdown, showTypeDropdown, showMembersDropdown])

  // refs to call native pickers where supported
  const monthRef = useRef(null)
  const dateRef = useRef(null)
  const dateEndRef = useRef(null)
  const timeStartRef = useRef(null)
  const timeEndRef = useRef(null)
  const timeStartPickerRef = useRef(null)
  const timeEndPickerRef = useRef(null)
  
  // Refs สำหรับการกด Enter เพื่อไปช่องถัดไป
  const teamRef = useRef(null)
  const locationRef = useRef(null)
  const membersRef = useRef(null)
  const preparationsRef = useRef(null)
  const tasksRef = useRef(null)
  const goalsRef = useRef(null)

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

  // Default map center (Bangkok) - memoize เพื่อไม่ให้สร้างใหม่ทุกครั้ง
  const defaultCenter = useMemo(() => [13.7606, 100.5034], [])
  const defaultZoom = 12

  // Filter locations based on search - useMemo เพื่อไม่ให้คำนวณซ้ำ
  const filteredLocations = useMemo(() => {
    // กรองเฉพาะพื้นที่ที่ active เท่านั้น
    const activeLocations = locations.filter(loc => loc.status === 'active')
    
    if (!searchLocation.trim()) return activeLocations
    const search = searchLocation.toLowerCase()
    return activeLocations.filter(loc => 
      loc.name.toLowerCase().includes(search) || 
      (loc.description && loc.description.toLowerCase().includes(search))
    )
  }, [locations, searchLocation])

  // Filter members based on search - useMemo เพื่อไม่ให้คำนวณซ้ำ
  const filteredMembers = useMemo(() => {
    const search = members.toLowerCase()
    
    return usersData
      .filter(user => {
        // ไม่แสดง admin
        if (user.role === 'admin') return false
        
        // ถ้าเลือกแผนก/ตำแหน่งแล้ว ให้กรองตามแผนก/ตำแหน่งที่เลือก
        if (selectedTeams.length > 0) {
          const userDepartment = user.department?.toLowerCase() || ''
          const userPosition = user.position?.toLowerCase() || ''
          const userRole = user.role?.toLowerCase() || ''
          
          // ตรวจสอบว่า user อยู่ในแผนก/ตำแหน่งที่เลือกหรือไม่
          const matchesTeam = selectedTeams.some(team => {
            const teamLower = team.toLowerCase()
            return userDepartment.includes(teamLower) || 
                   userPosition.includes(teamLower) ||
                   userRole.includes(teamLower)
          })
          
          if (!matchesTeam) return false
        }
        
        // ถ้าไม่มีคำค้นหา แสดงทุกคน (ที่ผ่านการกรองแผนกแล้ว)
        if (!search.trim()) return true
        
        // กรองตามคำค้นหา
        return user.name.toLowerCase().includes(search) || 
               user.department?.toLowerCase().includes(search) ||
               user.position?.toLowerCase().includes(search) ||
               user.employeeId?.toLowerCase().includes(search)
      })
      .slice(0, 15) // เพิ่มจำนวนเป็น 15 คน
  }, [members, selectedTeams])

  // Handle map click to create new location - useCallback เพื่อป้องกัน re-render
  const handleMapClick = useCallback((latlng) => {
    if (mapClickEnabled) {
      setNewLocationForm(prev => ({
        ...prev,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6)
      }))
      setShowNewLocationForm(true)
      setMapClickEnabled(false)
    }
  }, [mapClickEnabled])

  // Handle select existing location from map - useCallback
  const handleSelectLocation = useCallback((locationName) => {
    setLocation(locationName)
    setShowMapModal(false)
  }, [])

  // Handle create new location from map - useCallback
  const handleCreateNewLocation = useCallback(() => {
    console.log('Creating new location, current form:', newLocationForm)
    
    // ตรวจสอบว่ากรอกชื่อสถานที่แล้วหรือยัง
    if (!newLocationForm.name || !newLocationForm.name.trim()) {
      console.log('Error: No location name')
      setErrorMessage('กรุณากรอกชื่อสถานที่')
      setShowErrorPopup(true)
      setTimeout(() => {
        setShowErrorPopup(false)
      }, 3000)
      return
    }

    // ตรวจสอบว่ามีพิกัดแล้วหรือยัง
    if (!newLocationForm.latitude || !newLocationForm.longitude) {
      console.log('Error: No coordinates')
      setErrorMessage('กรุณาคลิกบนแผนที่เพื่อเลือกตำแหน่ง')
      setShowErrorPopup(true)
      setTimeout(() => {
        setShowErrorPopup(false)
      }, 3000)
      return
    }

    // ตรวจสอบรัศมี
    if (!newLocationForm.radius || parseFloat(newLocationForm.radius) <= 0) {
      console.log('Error: Invalid radius')
      setErrorMessage('กรุณากรอกรัศมีที่ถูกต้อง (มากกว่า 0)')
      setShowErrorPopup(true)
      setTimeout(() => {
        setShowErrorPopup(false)
      }, 3000)
      return
    }

    console.log('Validation passed, creating location...')
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

    console.log('Adding new location to context:', newLocation)
    
    // Add to locations context (จะบันทึกลง localStorage อัตโนมัติผ่าน useEffect ใน LocationContext)
    addLocation(newLocation)
    
    console.log('✓ Location added successfully and saved to localStorage')
    console.log('Total locations now:', locations.length + 1)
    
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
  }, [newLocationForm, locations, addLocation])

  // Cancel new location form - useCallback
  const handleCancelNewLocation = useCallback(() => {
    setNewLocationForm({
      name: '',
      description: '',
      radius: '100',
      latitude: '',
      longitude: ''
    })
    setShowNewLocationForm(false)
    setMapClickEnabled(false)
  }, [])

  // Toggle team selection - useCallback
  const toggleTeam = useCallback((teamName) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamName)) {
        return prev.filter(t => t !== teamName)
      } else {
        return [...prev, teamName]
      }
    })
  }, [])

  // Toggle member selection - useCallback
  const toggleMember = useCallback((user) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === user.id)
      if (exists) {
        // ลบออก
        const newMembers = prev.filter(m => m.id !== user.id)
        // อัพเดท members string
        setMembers('')
        return newMembers
      } else {
        // เพิ่มเข้า
        const newMembers = [...prev, user]
        // เคลียร์ช่องค้นหา
        setMembers('')
        return newMembers
      }
    })
  }, [])

  // Remove member from selected - useCallback
  const removeMember = useCallback((userId) => {
    setSelectedMembers(prev => {
      const newMembers = prev.filter(m => m.id !== userId)
      setMembers('')
      return newMembers
    })
  }, [])

  // Select work type - useCallback
  const selectWorkType = useCallback((typeName) => {
    setType(typeName)
    setShowTypeDropdown(false)
  }, [])

  // Add new work type - useCallback
  const handleAddNewType = useCallback(() => {
    if (newTypeName.trim() && !workTypes.includes(newTypeName.trim())) {
      setWorkTypes(prev => [...prev, newTypeName.trim()])
      setType(newTypeName.trim())
      setNewTypeName('')
      setShowAddTypeForm(false)
      setShowTypeDropdown(false)
    }
  }, [newTypeName, workTypes])

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
    
    // ถ้าพิมพ์แค่ตัวเลข 1-2 หลัก (เช่น 9, 14) ให้เพิ่ม :00
    if (/^\d{1,2}$/.test(s)) {
      const hour = parseInt(s, 10)
      if (hour >= 0 && hour < 24) {
        return `${pad(hour)}:00`
      }
    }
    
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

  // Generate hours for 24-hour format (00-23) - memoize เพื่อไม่สร้างซ้ำ
  const hours24 = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), [])
  // Generate minutes (00-59) - memoize เพื่อไม่สร้างซ้ำ
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), [])

  const handleTimeSelect = useCallback((hour, minute, isStart) => {
    const timeValue = `${hour}:${minute}`
    if (isStart) {
      setTimeStart(timeValue)
      setShowTimeStartPicker(false)
    } else {
      setTimeEnd(timeValue)
      setShowTimeEndPicker(false)
    }
  }, [])

  // ฟังก์ชันจัดการ Enter key เพื่อไปช่องถัดไป - useCallback
  const handleKeyDown = useCallback((e, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      // Auto-complete time format for time inputs
      if (currentField === 'timeStart' || currentField === 'timeEnd') {
        const value = currentField === 'timeStart' ? timeStart.trim() : timeEnd.trim()
        if (/^\d{1,2}$/.test(value)) {
          const hour = parseInt(value, 10)
          if (hour >= 0 && hour < 24) {
            const formattedTime = `${value.padStart(2, '0')}:00`
            if (currentField === 'timeStart') {
              setTimeStart(formattedTime)
            } else {
              setTimeEnd(formattedTime)
            }
          }
        }
        
        // ปิด dropdown เวลา
        if (currentField === 'timeStart') {
          setShowTimeStartPicker(false)
        } else if (currentField === 'timeEnd') {
          setShowTimeEndPicker(false)
        }
      }
      
      // Navigate to next field
      const fieldOrder = {
        team: dateRef,
        date: dateEndRef,
        dateEnd: timeStartRef,
        timeStart: timeEndRef,
        timeEnd: locationRef,
        location: membersRef,
        members: preparationsRef,
        preparations: tasksRef,
        tasks: goalsRef,
        goals: 'submit' // ช่องสุดท้าย - submit form
      }
      
      const nextField = fieldOrder[currentField]
      
      if (nextField === 'submit') {
        // ช่องสุดท้าย - บันทึกทันที
        handleSubmit(e)
      } else if (nextField && nextField.current) {
        nextField.current.focus()
      }
    }
  }, [timeStart, timeEnd, dateRef, dateEndRef, timeStartRef, timeEndRef, locationRef, membersRef, preparationsRef, tasksRef, goalsRef])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    
    // ตรวจสอบข้อมูลที่จำเป็นต้องกรอก
    if (!team.trim()) {
      setErrorMessage('กรุณากรอกชื่อทีม')
      setShowErrorPopup(true)
      setTimeout(() => setShowErrorPopup(false), 3000)
      teamRef.current?.focus()
      return
    }
    
    // วันที่ไม่บังคับ - ถ้าไม่มีจะเป็นงานแสดงตลอด
    // if (!date.trim()) {
    //   setErrorMessage('กรุณากรอกวันที่')
    //   setShowErrorPopup(true)
    //   setTimeout(() => setShowErrorPopup(false), 3000)
    //   dateRef.current?.focus()
    //   return
    // }
    
    // ตรวจสอบว่าถ้ามีวันที่เริ่ม แต่มีวันที่สิ้นสุด ต้องตรวจสอบว่าวันที่สิ้นสุดไม่น้อยกว่าวันที่เริ่ม
    if (date.trim() && dateEnd.trim()) {
      const startDate = new Date(normalizeDate(date))
      const endDate = new Date(normalizeDate(dateEnd))
      if (endDate < startDate) {
        setErrorMessage('วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น')
        setShowErrorPopup(true)
        setTimeout(() => setShowErrorPopup(false), 3000)
        return
      }
    }
    
    if (!timeStart.trim()) {
      setErrorMessage('กรุณากรอกเวลาเริ่ม')
      setShowErrorPopup(true)
      setTimeout(() => setShowErrorPopup(false), 3000)
      timeStartRef.current?.focus()
      return
    }
    
    if (!timeEnd.trim()) {
      setErrorMessage('กรุณากรอกเวลาสิ้นสุด')
      setShowErrorPopup(true)
      setTimeout(() => setShowErrorPopup(false), 3000)
      timeEndRef.current?.focus()
      return
    }
    
    if (!location.trim()) {
      setErrorMessage('กรุณากรอกสถานที่')
      setShowErrorPopup(true)
      setTimeout(() => setShowErrorPopup(false), 3000)
      locationRef.current?.focus()
      return
    }
    
    // normalize times/dates before creating payload
    const nTimeStart = normalizeTime(timeStart)
    const nTimeEnd = normalizeTime(timeEnd)
    const timeStr = nTimeStart && nTimeEnd ? `${nTimeStart} - ${nTimeEnd}` : (nTimeStart || nTimeEnd || '')
    const nDate = date.trim() ? normalizeDate(date) : ''
    const nDateEnd = dateEnd.trim() ? normalizeDate(dateEnd) : ''
    
    const payload = {
      id: initialData?.id ?? Date.now(),
      team: team || 'ทีมใหม่',
      month: month || (nDate ? nDate.slice(0,7) : ''),
      date: nDate || '',
      dateEnd: nDateEnd || '',
      time: timeStr,
      startTime: nTimeStart || '', // เพิ่มเวลาเริ่มแยก
      endTime: nTimeEnd || '',     // เพิ่มเวลาสิ้นสุดแยก
      location: location || '',
      members: members || '',
      type: type || '',
      preparations: preparations.split('\n').map(s => s.trim()).filter(Boolean),
      tasks: tasks.split('\n').map(s => s.trim()).filter(Boolean),
      goals: goals.split('\n').map(s => s.trim()).filter(Boolean),
      teams: selectedTeams, // เพิ่มแผนก/ตำแหน่งที่จะเห็นตาราง
      isPermanent: !nDate, // ถ้าไม่มีวันที่ = แสดงตลอด
    }

    if (onUpdate) {
      onUpdate(payload)
    } else if (onCreate) {
      onCreate(payload)
    }
  }, [team, date, dateEnd, timeStart, timeEnd, location, month, members, type, preparations, tasks, goals, selectedTeams, initialData, onUpdate, onCreate, teamRef, locationRef, timeStartRef, timeEndRef])

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 sm:pt-16 bg-black/60 backdrop-blur-md overflow-y-auto"
      style={{
        animation: 'fadeIn 0.3s ease-out forwards'
      }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div 
        className="relative w-[95%] max-w-5xl bg-white rounded-2xl border-4 border-[#F26623] shadow-2xl my-8"
        style={{
          animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F26623] to-orange-500 px-6 py-5 rounded-t-xl border-b-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">จัดตารางการทำงาน</h2>
                <p className="text-sm text-orange-100 mt-0.5">กรอกข้อมูลเพื่อสร้างตารางงานใหม่</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* ชื่อทีม */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              ชื่อทีม
              <span className="text-red-500">*</span>
            </label>
            <input 
              ref={teamRef}
              value={team} 
              onChange={e => setTeam(e.target.value)} 
              onKeyDown={(e) => handleKeyDown(e, 'team')}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
              placeholder="ระบุชื่อทีม เช่น ทีมพัฒนา" 
            />
          </div>

          {/* แผนก/ตำแหน่งที่จะเห็นตารางนี้ */}
          <div className="relative" ref={teamsDropdownRef}>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              แผนก/ตำแหน่งที่จะเห็นตารางนี้ 
              <span className="text-xs font-normal text-gray-500 ml-auto bg-gray-100 px-2 py-1 rounded-full">
                ไม่บังคับ
              </span>
            </label>
            
            {/* Dropdown Button */}
            <button
              type="button"
              onClick={() => setShowTeamsDropdown(!showTeamsDropdown)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all flex items-center justify-between outline-none"
            >
              <span className="text-gray-700">
                {selectedTeams.length === 0 
                  ? 'เลือกแผนก/ตำแหน่ง...' 
                  : `เลือกแล้ว ${selectedTeams.length} รายการ`
                }
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-400 transition-transform ${showTeamsDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showTeamsDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-sm max-h-60 overflow-y-auto">
                {availableTeams.map((teamOption) => (
                  <label
                    key={teamOption}
                    className="flex items-center px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(teamOption)}
                      onChange={() => toggleTeam(teamOption)}
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary focus:ring-2 mr-3"
                    />
                    <span className="text-gray-700">{teamOption}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Selected Teams Tags */}
            {selectedTeams.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTeams.map(team => (
                  <span key={team} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    {team}
                    <button
                      type="button"
                      onClick={() => toggleTeam(team)}
                      className="hover:text-orange-900 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ช่วงวันที่ทำงาน - ปรับ Layout ใหม่ */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">
            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              ช่วงวันที่ทำงาน
              <span className="text-xs font-normal text-gray-500 ml-auto bg-white px-2 py-1 rounded-full border border-orange-200">
                ไม่บังคับ
              </span>
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  วันที่เริ่มต้น
                </label>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => openNativePicker(dateRef)}
                    aria-label="เปิดตัวเลือกวันที่เริ่ม"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 z-10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                      <path d="M16 2v4M8 2v4" strokeWidth="1.5" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="YYYY-MM-DD"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    onBlur={e => setDate(prev => normalizeDate(prev))}
                    onKeyDown={(e) => handleKeyDown(e, 'date')}
                    className="w-full border-2 border-gray-200 bg-white rounded-lg px-3 py-2.5 pr-10 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none text-sm"
                    aria-label="วันที่เริ่มต้น"
                  />

                  <input
                    ref={dateRef}
                    type="date"
                    className="sr-only"
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  วันที่สิ้นสุด
                </label>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => openNativePicker(dateEndRef)}
                    aria-label="เปิดตัวเลือกวันที่สิ้นสุด"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 z-10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                      <path d="M16 2v4M8 2v4" strokeWidth="1.5" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="YYYY-MM-DD"
                    value={dateEnd}
                    onChange={e => setDateEnd(e.target.value)}
                    onBlur={e => setDateEnd(prev => normalizeDate(prev))}
                    onKeyDown={(e) => handleKeyDown(e, 'dateEnd')}
                    className="w-full border-2 border-gray-200 bg-white rounded-lg px-3 py-2.5 pr-10 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none text-sm"
                    aria-label="วันที่สิ้นสุด"
                  />

                  <input
                    ref={dateEndRef}
                    type="date"
                    className="sr-only"
                    onChange={e => setDateEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* แสดงสถานะงาน */}
            <div className="mt-3">
              {!date.trim() && !dateEnd.trim() && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-white px-3 py-2.5 rounded-lg border-2 border-green-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">งานนี้จะแสดงตลอดไป (ไม่มีวันหมดอายุ)</span>
                </div>
              )}
              {date.trim() && !dateEnd.trim() && (
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-white px-3 py-2.5 rounded-lg border-2 border-blue-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">งานวันเดียว: {date}</span>
                </div>
              )}
              {date.trim() && dateEnd.trim() && (
                <div className="flex items-center gap-2 text-sm text-purple-700 bg-white px-3 py-2.5 rounded-lg border-2 border-purple-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">งานรายสัปดาห์: {date} ถึง {dateEnd}</span>
                </div>
              )}
            </div>
          </div>

          {/* เวลาทำงาน */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              เวลาทำงาน
              <span className="text-red-500 text-sm">*</span>
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  เวลาเริ่ม (24 ชม.)
                </label>
                <div className="relative w-full" ref={timeStartPickerRef}>
                  <input
                    ref={timeStartRef}
                    type="text"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    onBlur={(e) => setTimeStart(prev => normalizeTime(prev))}
                    onFocus={() => setShowTimeStartPicker(true)}
                    onKeyDown={(e) => handleKeyDown(e, 'timeStart')}
                    placeholder="09:00"
                    className="w-full border-2 border-gray-200 bg-white rounded-lg px-3 py-2.5 pr-10 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimeStartPicker(!showTimeStartPicker)
                      setShowTimeEndPicker(false)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path d="M12 7v6l4 2" strokeWidth="1.5" />
                    </svg>
                  </button>

                  {/* Custom Time Picker Dropdown */}
                  {showTimeStartPicker && (
                    <div className="absolute z-50 mt-1 w-full bg-white border-2 border-blue-400 rounded-lg shadow-lg max-h-64 overflow-hidden">
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
                <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  เวลาสิ้นสุด (24 ชม.)
                </label>
                <div className="relative w-full" ref={timeEndPickerRef}>
                  <input
                    ref={timeEndRef}
                    type="text"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    onBlur={(e) => setTimeEnd(prev => normalizeTime(prev))}
                    onFocus={() => setShowTimeEndPicker(true)}
                    onKeyDown={(e) => handleKeyDown(e, 'timeEnd')}
                    placeholder="17:00"
                    className="w-full border-2 border-gray-200 bg-white rounded-lg px-3 py-2.5 pr-10 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimeEndPicker(!showTimeEndPicker)
                      setShowTimeStartPicker(false)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path d="M12 7v6l4 2" strokeWidth="1.5" />
                    </svg>
                  </button>

                  {/* Custom Time Picker Dropdown */}
                  {showTimeEndPicker && (
                    <div className="absolute z-50 mt-1 w-full bg-white border-2 border-blue-400 rounded-lg shadow-lg max-h-64 overflow-hidden">
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

          {/* สถานที่และข้อมูลเพิ่มเติม */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                สถานที่
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleOpenMapModal}
                  aria-label="เปิดแผนที่เลือกสถานที่"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 z-10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </button>

                <input 
                  ref={locationRef}
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  onKeyDown={(e) => handleKeyDown(e, 'location')}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 pr-12 hover:border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none" 
                  placeholder="พิมพ์หรือเลือกจากแผนที่" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative" ref={membersDropdownRef}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  สมาชิก
                </label>

                {/* Selected Members Tags */}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedMembers.map(member => (
                      <div 
                        key={member.id}
                        className="flex items-center gap-1 bg-brand-primary text-white px-3 py-1 rounded-full text-sm"
                      >
                        <span>{member.name}</span>
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input 
                  ref={membersRef}
                  value={members} 
                  onChange={e => {
                    setMembers(e.target.value)
                    setShowMembersDropdown(true)
                  }} 
                  onKeyDown={(e) => handleKeyDown(e, 'members')}
                  onFocus={() => setShowMembersDropdown(true)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all outline-none" 
                  placeholder="ค้นหาชื่อสมาชิก หรือคลิกเพื่อดูทั้งหมด..." 
                />

                {/* Dropdown Menu */}
                {showMembersDropdown && filteredMembers.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredMembers.map((user) => {
                      const isSelected = selectedMembers.some(m => m.id === user.id)
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            toggleMember(user)
                            // ช่องค้นหาจะถูกเคลียร์ใน toggleMember แล้ว
                            // เปิด dropdown ต่อไปเพื่อเลือกคนถัดไป
                            setTimeout(() => {
                              membersRef.current?.focus()
                              setShowMembersDropdown(true)
                            }, 100)
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-brand-accent transition-colors flex items-center justify-between border-b border-gray-100 last:border-0 ${
                            isSelected ? 'bg-brand-accent-soft' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.profileImage || 'https://i.pravatar.cc/150?u=default'} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">
                                {user.position} • {user.department}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="relative" ref={typeDropdownRef}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  ประเภทงาน
                </label>
                
                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 bg-white hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all flex items-center justify-between outline-none"
                >
                  <span className={type ? "text-gray-700" : "text-gray-400"}>
                    {type || 'เลือกประเภทงาน...'}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showTypeDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    {/* Existing Types */}
                    <div className="max-h-48 overflow-y-auto">
                    {workTypes.map((workType) => (
                      <button
                        key={workType}
                        type="button"
                        onClick={() => selectWorkType(workType)}
                        className={`w-full text-left px-4 py-2 hover:bg-orange-50 transition-colors ${
                          type === workType ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {workType}
                      </button>
                    ))}
                  </div>

                  {/* Add New Type Section */}
                  <div className="border-t-2 border-gray-200">
                    {showAddTypeForm ? (
                      <div className="p-3 bg-gray-50">
                        <input
                          type="text"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddNewType()
                            }
                          }}
                          placeholder="ชื่อประเภทงานใหม่..."
                          className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:border-brand-primary focus:outline-none mb-2"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddNewType}
                            className="flex-1 bg-brand-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                          >
                            เพิ่ม
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddTypeForm(false)
                              setNewTypeName('')
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddTypeForm(true)}
                        className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        เพิ่มประเภทงานใหม่
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Type Badge */}
              {type && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    {type}
                    <button
                      type="button"
                      onClick={() => setType('')}
                      className="hover:text-orange-900 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* ข้อมูลเพิ่มเติม - กรอกรายละเอียด */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-4 space-y-4">
            <label className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              รายละเอียดงาน
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                สิ่งที่ต้องเตรียม <span className="text-xs text-gray-500">(แต่ละบรรทัดคือรายการ)</span>
              </label>
              <textarea 
                ref={preparationsRef}
                value={preparations} 
                onChange={e => setPreparations(e.target.value)} 
                onKeyDown={(e) => handleKeyDown(e, 'preparations')}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all outline-none resize-none" 
                rows={3} 
                placeholder="เช่น: โน๊ตบุ๊ค, เอกสาร, อุปกรณ์" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ภารกิจหลัก <span className="text-xs text-gray-500">(แต่ละบรรทัดคือภารกิจ)</span>
              </label>
              <textarea 
                ref={tasksRef}
                value={tasks} 
                onChange={e => setTasks(e.target.value)} 
                onKeyDown={(e) => handleKeyDown(e, 'tasks')}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all outline-none resize-none" 
                rows={3} 
                placeholder="เช่น: ประชุมทีม, จัดทำรายงาน" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                เป้าหมาย <span className="text-xs text-gray-500">(แต่ละบรรทัด)</span>
              </label>
              <textarea 
                ref={goalsRef}
                value={goals} 
                onChange={e => setGoals(e.target.value)} 
                onKeyDown={(e) => handleKeyDown(e, 'goals')}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all outline-none resize-none" 
                rows={2} 
                placeholder="เช่น: เสร็จทันเวลา, คุณภาพงานดี" 
              />
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
            <button 
              type="submit" 
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F26623] to-orange-500 text-white rounded-xl shadow-md hover:shadow-lg hover:from-orange-600 hover:to-[#F26623] transition-all duration-200 font-semibold text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              บันทึกตาราง
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              ยกเลิก
            </button>
          </div>
        </form>
      </div>

      {/* Map Modal */}
      {/* Map Modal - Lazy load เฉพาะตอนเปิด */}
      {showMapModal && (
        <PageModal onClose={() => setShowMapModal(false)}>
          <div 
            key="map-modal" 
            className="relative w-full max-w-6xl bg-white rounded-2xl shadow-sm overflow-hidden" 
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="bg-brand-primary  px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">เลือกสถานที่จากแผนที่</h3>
                <p className="text-sm text-orange-100 mt-1">คลิกบนแผนที่เพื่อสร้างพื้นที่ใหม่ หรือเลือกจากพื้นที่ที่มีอยู่</p>
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
                <LocationMapView
                  defaultCenter={defaultCenter}
                  defaultZoom={defaultZoom}
                  mapClickEnabled={mapClickEnabled}
                  handleMapClick={handleMapClick}
                  locations={filteredLocations}
                  handleSelectLocation={handleSelectLocation}
                  newLocationForm={newLocationForm}
                />

                {/* Enable Click Mode Button */}
                {!mapClickEnabled && !showNewLocationForm && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                    <button
                      onClick={() => setMapClickEnabled(true)}
                      className="bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-700 transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      สร้างพื้นที่ใหม่
                    </button>
                  </div>
                )}

                {mapClickEnabled && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm z-[1000] pointer-events-none">
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
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-primary focus:outline-none"
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
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-primary focus:outline-none"
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
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-primary focus:outline-none"
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
                          className="flex-1 bg-brand-primary  text-white px-4 py-3 rounded-lg font-semibold hover:shadow-sm transition-all"
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
                    {/* Search Box */}
                    <div className="mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="ค้นหาสถานที่..."
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          className="w-full px-4 py-2 pr-20 rounded-lg border-2 border-gray-300 focus:border-brand-primary focus:outline-none bg-white"
                        />
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchLocation && (
                          <button
                            onClick={() => setSearchLocation('')}
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      พื้นที่ที่มีอยู่ ({filteredLocations.length})
                    </h4>
                    
                    {searchLocation && filteredLocations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>ไม่พบสถานที่ "{searchLocation}"</p>
                      </div>
                    ) : filteredLocations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>ยังไม่มีพื้นที่</p>
                        <p className="text-sm mt-2">คลิก "สร้างพื้นที่ใหม่" เพื่อเริ่มต้น</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredLocations.map((loc) => (
                          <button
                            key={loc.id}
                            onClick={() => handleSelectLocation(loc.name)}
                            className="w-full text-left bg-white border-2 border-gray-200 hover:border-green-400 rounded-lg p-4 transition-all hover:shadow-md group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{loc.name}</div>
                                {loc.description && (
                                  <div className="text-sm text-gray-500 mt-1">{loc.description}</div>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    รัศมี: {loc.radius} เมตร
                                  </span>
                                </div>
                              </div>
                              <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
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

      {/* Warning Popup - กรอกข้อมูลก่อนเปิดแผนที่ (portal to body so it appears above map modal) */}
      {showWarningPopup && (typeof document !== 'undefined' ? createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center z-[100000] transition-opacity duration-300 ease-out bg-black/30"
          style={{
            animation: 'fadeIn 0.3s ease-out forwards',
            pointerEvents: 'auto'
          }}
          onClick={() => setShowWarningPopup(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-sm p-6 max-w-md mx-4 border-2 border-orange-400 pointer-events-auto transform"
            style={{
              animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-400/20 animate-pulse"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-orange-500 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">กรุณากรอกข้อมูลก่อน!</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  กรุณากรอก <span className="font-semibold text-orange-600">ชื่อทีม</span> และ <span className="font-semibold text-orange-600">วันที่</span> ก่อนเลือกสถานที่
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  </svg>
                  <span>ข้อมูลเหล่านี้จำเป็นสำหรับการสร้างตาราง</span>
                </div>
              </div>
              <button
                onClick={() => setShowWarningPopup(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all transform hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>, document.body) : (
          <div className="fixed inset-0 flex items-center justify-center z-[100000] transition-opacity duration-300 ease-out" style={{ animation: 'fadeIn 0.3s ease-out forwards', pointerEvents: 'auto' }}>
              <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-sm p-6 max-w-md mx-4 border-2 border-orange-400 pointer-events-auto transform" style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-orange-400/20 animate-pulse"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-orange-500 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">กรุณากรอกข้อมูลก่อน!</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">กรุณากรอก <span className="font-semibold text-orange-600">ชื่อทีม</span> และ <span className="font-semibold text-orange-600">วันที่</span> ก่อนเลือกสถานที่</p>
                </div>
                <button onClick={() => setShowWarningPopup(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all transform hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Error Popup - กรอกข้อมูลไม่ครบในแผนที่ (portal to body so it appears above map modal) */}
      {showErrorPopup && (typeof document !== 'undefined' ? createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center z-[110000] transition-opacity duration-300 ease-out bg-black/30"
          style={{
            animation: 'fadeIn 0.3s ease-out forwards',
            pointerEvents: 'auto'
          }}
          onClick={() => setShowErrorPopup(false)}
        >
          <div onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-2xl shadow-sm p-6 max-w-md mx-4 border-2 border-red-400 pointer-events-auto transform"
            style={{
              animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-red-400/20 animate-pulse"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">ข้อมูลไม่ครบถ้วน!</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{errorMessage}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>กรุณาตรวจสอบข้อมูลและลองอีกครั้ง</span>
                </div>
              </div>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all transform hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>, document.body) : (
          <div className="fixed inset-0 flex items-center justify-center z-[110000] transition-opacity duration-300 ease-out" style={{ animation: 'fadeIn 0.3s ease-out forwards', pointerEvents: 'auto' }}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-sm p-6 max-w-md mx-4 border-2 border-red-400 pointer-events-auto transform" style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-400/20 animate-pulse"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">ข้อมูลไม่ครบถ้วน!</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{errorMessage}</p>
                </div>
                <button onClick={() => setShowErrorPopup(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all transform hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>,
    document.body
  )
}