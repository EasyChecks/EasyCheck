import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, LayersControl, useMap, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEvents } from '../../contexts/EventContext'
import { useLocations } from '../../contexts/LocationContext'

// Fix for default marker icon issue in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Add animations style
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`
document.head.appendChild(style)

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

// Component to auto-fit bounds to show all markers
function FitBoundsToMarkers({ locations }) {
  const map = useMap()

  useEffect(() => {
    if (locations && locations.length > 0) {
      // Create bounds from all location coordinates
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      )

      // Fit map to bounds with padding
      map.fitBounds(bounds, {
        padding: [50, 50], // Add padding around bounds
        maxZoom: 17, // Don't zoom in too close even if markers are very close
        animate: true,
        duration: 0.5
      })
    }
  }, [locations, map])

  return null
}

// Custom Success Dialog
function SuccessDialog({ isOpen, message, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#22C55E">
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">สำเร็จ!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  )
}

// Custom Confirm Dialog
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onConfirm()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#EF4444">
              <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Error Dialog
function ErrorDialog({ isOpen, message, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#F97316">
              <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">ข้อผิดพลาด</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  )
}

// Event status badge component
function EventStatusBadge({ status }) {
  const statusConfig = {
    ongoing: { label: 'เริ่มงานแล้ว', color: 'bg-green-100 text-green-700' },
    completed: { label: 'เสร็จสิ้น', color: 'bg-gray-100 text-gray-700' }
  }

  const config = statusConfig[status] || statusConfig.ongoing

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${config.color}`}>
      {config.label}
    </span>
  )
}

function EventManagement() {
  // Use Event Context
  const { events, addEvent, updateEvent, deleteEvent } = useEvents()
  // Use Location Context (to check for duplicates)
  const { locations } = useLocations()

  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)
  const eventRefs = useRef({}) // Refs for scrolling to event cards

  // Dialog states
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, message: '' })
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: '' })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  })

  // Form state for adding new event
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    locationName: '',
    radius: '',
    latitude: '',
    longitude: '',
    startTime: '',
    endTime: '',
    teams: '',
    status: 'ongoing'
  })

  // Edit form data
  const [editFormData, setEditFormData] = useState({})

  // Map center for Bangkok
  const defaultCenter = [13.7606, 100.5034]

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        if (successDialog.isOpen) {
          setSuccessDialog({ isOpen: false, message: '' })
        } else if (errorDialog.isOpen) {
          setErrorDialog({ isOpen: false, message: '' })
        } else if (confirmDialog.isOpen) {
          if (confirmDialog.onCancel) {
            confirmDialog.onCancel()
          }
        } else if (editingEventId !== null) {
          handleCancelEdit()
        } else if (isAddingEvent) {
          handleCancelForm()
        }
      }

      // Handle Enter key
      if (e.key === 'Enter' && !e.shiftKey) {
        if (confirmDialog.isOpen && confirmDialog.onConfirm) {
          e.preventDefault()
          confirmDialog.onConfirm()
        } else if (successDialog.isOpen) {
          e.preventDefault()
          setSuccessDialog({ isOpen: false, message: '' })
        } else if (errorDialog.isOpen) {
          e.preventDefault()
          setErrorDialog({ isOpen: false, message: '' })
        } else if (editingEventId !== null) {
          e.preventDefault()
          handleUpdateEvent()
        } else if (isAddingEvent) {
          e.preventDefault()
          handleSubmitEvent()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAddingEvent, editingEventId, successDialog, errorDialog, confirmDialog, formData, editFormData])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle add new event
  const handleAddEvent = () => {
    setIsAddingEvent(true)
    setFormData({
      name: '',
      date: '',
      description: '',
      locationName: '',
      radius: '',
      latitude: '',
      longitude: '',
      startTime: '',
      endTime: '',
      teams: '',
      status: 'ongoing'
    })
  }

  // Handle map click to get coordinates
  const handleMapClick = (latlng) => {
    if (isAddingEvent) {
      setFormData(prev => ({
        ...prev,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6)
      }))
    } else if (editingEventId !== null) {
      setEditFormData(prev => ({
        ...prev,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6)
      }))
    }
  }

  // Handle submit new event
  const handleSubmitEvent = () => {
    // Validation
    if (!formData.name || !formData.date || !formData.locationName || !formData.latitude || !formData.longitude) {
      setErrorDialog({
        isOpen: true,
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อกิจกรรม, วันที่, สถานที่, และพิกัด)'
      })
      return
    }

    const trimmedName = formData.name.trim()
    const trimmedLocationName = formData.locationName.trim()
    const newLat = parseFloat(formData.latitude)
    const newLng = parseFloat(formData.longitude)

    // Check for duplicate event name
    const duplicateName = events.find(evt =>
      evt.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicateName) {
      setErrorDialog({
        isOpen: true,
        message: `มีกิจกรรมชื่อ "${trimmedName}" อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`
      })
      return
    }

    // Check for duplicate location name in events
    const duplicateLocationInEvents = events.find(evt =>
      evt.locationName.toLowerCase() === trimmedLocationName.toLowerCase()
    )
    if (duplicateLocationInEvents) {
      setErrorDialog({
        isOpen: true,
        message: `มีสถานที่ชื่อ "${trimmedLocationName}" อยู่ในกิจกรรมแล้ว กรุณาใช้ชื่ออื่น`
      })
      return
    }

    // Check for duplicate location name in mapping locations
    const duplicateLocationInMapping = locations.find(loc =>
      loc.name.toLowerCase() === trimmedLocationName.toLowerCase()
    )
    if (duplicateLocationInMapping) {
      setErrorDialog({
        isOpen: true,
        message: `มีสถานที่ชื่อ "${trimmedLocationName}" อยู่ในพื้นที่อนุญาตแล้ว กรุณาใช้ชื่ออื่น`
      })
      return
    }

    // Check for duplicate coordinates in events (within 0.0001 degrees ~11 meters)
    const duplicateCoordsInEvents = events.find(evt =>
      Math.abs(evt.latitude - newLat) < 0.0001 &&
      Math.abs(evt.longitude - newLng) < 0.0001
    )
    if (duplicateCoordsInEvents) {
      setErrorDialog({
        isOpen: true,
        message: `พิกัดนี้ใกล้เคียงกับกิจกรรม "${duplicateCoordsInEvents.name}" ที่มีอยู่แล้ว กรุณาเลือกตำแหน่งอื่น`
      })
      return
    }

    // Check for duplicate coordinates in mapping locations
    const duplicateCoordsInMapping = locations.find(loc =>
      Math.abs(loc.latitude - newLat) < 0.0001 &&
      Math.abs(loc.longitude - newLng) < 0.0001
    )
    if (duplicateCoordsInMapping) {
      setErrorDialog({
        isOpen: true,
        message: `พิกัดนี้ใกล้เคียงกับพื้นที่อนุญาต "${duplicateCoordsInMapping.name}" ที่มีอยู่แล้ว กรุณาเลือกตำแหน่งอื่น`
      })
      return
    }

    // Generate unique ID
    const maxId = events.length > 0 ? Math.max(...events.map(evt => evt.id)) : 0

    const newEvent = {
      id: maxId + 1,
      name: trimmedName,
      date: formData.date,
      description: formData.description.trim() || '',
      locationName: trimmedLocationName,
      latitude: newLat,
      longitude: newLng,
      radius: parseFloat(formData.radius) || 100,
      status: formData.status,
      startTime: formData.startTime,
      endTime: formData.endTime,
      teams: formData.teams ? formData.teams.split(',').map(t => t.trim()) : []
    }

    // Add to events using context
    addEvent(newEvent)

    // Reset form
    setIsAddingEvent(false)
    setFormData({
      name: '',
      date: '',
      description: '',
      locationName: '',
      radius: '',
      latitude: '',
      longitude: '',
      startTime: '',
      endTime: '',
      teams: '',
      status: 'ongoing'
    })

    // Show success message
    setSuccessDialog({
      isOpen: true,
      message: `เพิ่มกิจกรรม "${newEvent.name}" สำเร็จ!`
    })
  }

  // Handle edit event
  const handleEditEvent = (event) => {
    setEditingEventId(event.id)
    setEditFormData({
      name: event.name,
      date: event.date,
      description: event.description,
      locationName: event.locationName,
      radius: event.radius.toString(),
      latitude: event.latitude.toString(),
      longitude: event.longitude.toString(),
      startTime: event.startTime,
      endTime: event.endTime,
      teams: event.teams.join(', '),
      status: event.status
    })
  }

  // Handle update event
  const handleUpdateEvent = () => {
    if (!editFormData.name || !editFormData.date || !editFormData.locationName) {
      setErrorDialog({
        isOpen: true,
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
      })
      return
    }

    const updatedEvent = {
      name: editFormData.name.trim(),
      date: editFormData.date,
      description: editFormData.description.trim() || '',
      locationName: editFormData.locationName.trim(),
      latitude: parseFloat(editFormData.latitude),
      longitude: parseFloat(editFormData.longitude),
      radius: parseFloat(editFormData.radius) || 100,
      status: editFormData.status,
      startTime: editFormData.startTime,
      endTime: editFormData.endTime,
      teams: editFormData.teams ? editFormData.teams.split(',').map(t => t.trim()) : []
    }

    // Update event using context
    updateEvent(editingEventId, updatedEvent)

    setEditingEventId(null)
    setEditFormData({})

    setSuccessDialog({
      isOpen: true,
      message: `แก้ไขกิจกรรม "${updatedEvent.name}" สำเร็จ!`
    })
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingEventId(null)
    setEditFormData({})
  }

  // Handle cancel form
  const handleCancelForm = () => {
    setIsAddingEvent(false)
    setFormData({
      name: '',
      date: '',
      description: '',
      locationName: '',
      radius: '',
      latitude: '',
      longitude: '',
      startTime: '',
      endTime: '',
      teams: '',
      status: 'ongoing'
    })
  }

  // Handle cancel event
  const handleCancelEvent = (id) => {
    const event = events.find(evt => evt.id === id)
    setConfirmDialog({
      isOpen: true,
      title: 'ลบกิจกรรม',
      message: `คุณต้องการลบกิจกรรม "${event.name}" หรือไม่?`,
      onConfirm: () => {
        // Remove event using context
        deleteEvent(id)

        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null })
        setSuccessDialog({
          isOpen: true,
          message: `ลบกิจกรรม "${event.name}" สำเร็จ!`
        })
      },
      onCancel: () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null })
      }
    })
  }

  // Handle view details button click - scroll to event card
  const handleViewDetails = (eventId) => {
    setTimeout(() => {
      const element = eventRefs.current[eventId]
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
        // Add highlight effect
        element.classList.add('ring-4', 'ring-blue-400')
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-blue-400')
        }, 2000)
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-800">จัดการงานอีเวนท์</h1>
        <p className="text-sm text-gray-600 mt-1">
          กำหนดกิจกรรมและสถานที่ต่างๆที่คนทำงานและผู้เข้าร่วมงานต้องเช็คเข้างานตอนนั้น
        </p>
      </div>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-8xl mx-auto">
        {/* Section: All Event Locations Map */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">พื้นที่กิจกรรมทั้งหมด</h2>
              <p className="text-sm text-gray-600 mt-1">
                แสดงตำแหน่งของกิจกรรมทั้งหมดบนแผนที่
              </p>
            </div>
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              {events.length} กิจกรรม
            </div>
          </div>

          <div className="relative h-[550px] rounded-xl overflow-hidden border-2 border-blue-200">
            <MapContainer
              center={defaultCenter}
              zoom={13}
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

              {/* Auto-fit bounds to show all markers */}
              {events.length > 0 && <FitBoundsToMarkers locations={events} />}

              {/* Show existing event markers */}
              {events.map((event) => (
                <React.Fragment key={event.id}>
                  <Marker
                    position={[event.latitude, event.longitude]}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${event.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          <h3 className="font-bold text-gray-800">{event.name}</h3>
                        </div>
                        <p className={`text-xs font-medium mb-2 ${event.status === 'ongoing' ? 'text-green-600' : 'text-gray-600'}`}>
                          {event.status === 'ongoing' ? 'เริ่มงานแล้ว' : 'เสร็จสิ้น'}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{event.locationName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🎯</span>
                            <span>รัศมี: {event.radius} เมตร</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDetails(event.id)}
                          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors"
                        >
                          ดูรายละเอียด
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[event.latitude, event.longitude]}
                    radius={event.radius}
                    pathOptions={{
                      color: event.status === 'ongoing' ? 'green' : 'gray',
                      fillColor: event.status === 'ongoing' ? 'green' : 'gray',
                      fillOpacity: 0.2
                    }}
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Section: Events List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">รายการกิจกรรมทั้งหมด</h2>
            {/* Action Button */}
            <div className="mb-4">
              <button
                onClick={handleAddEvent}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
                เพิ่มกิจกรรมใหม่
              </button>
            </div>
          </div>

          {/* Add Event Form */}
            {isAddingEvent && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-blue-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">เพิ่มกิจกรรมใหม่</h3>
                  <button
                    onClick={handleCancelForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                    </svg>
                  </button>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อกิจกรรม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="เช่น Grand Opening Siam Square"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      วันที่จัดงาน (วัน/เดือน/ปี) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      placeholder="เช่น 20/10/2025"
                      pattern="\d{2}/\d{2}/\d{4}"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รายละเอียด
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="เช่น กิจกรรมเปิดตัวและติดตั้ง รับประทานอาหาร"
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อสถานที่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="locationName"
                      value={formData.locationName}
                      onChange={handleInputChange}
                      placeholder="เช่น Siam Square ชั้น 4 ห้องประชุมเอ"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รัศมี (เมตร)
                    </label>
                    <input
                      type="number"
                      name="radius"
                      value={formData.radius}
                      onChange={handleInputChange}
                      placeholder="เช่น 100"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เวลาเริ่มต้น (24 ชั่วโมง)
                    </label>
                    <input
                      type="text"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      placeholder="เช่น 14:30"
                      pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เวลาสิ้นสุด (24 ชั่วโมง)
                    </label>
                    <input
                      type="text"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      placeholder="เช่น 17:00"
                      pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ทีมที่เข้าร่วม (คั่นด้วยเครื่องหมายจุลภาค)
                    </label>
                    <input
                      type="text"
                      name="teams"
                      value={formData.teams}
                      onChange={handleInputChange}
                      placeholder="เช่น ทีมพัฒนา, ทีมการตลาด, ทีมปฏิบัติการ"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Map for selecting location in form */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เลือกตำแหน่งบนแผนที่ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-gray-300">
                      <MapContainer
                        center={formData.latitude && formData.longitude
                          ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
                          : defaultCenter
                        }
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onMapClick={handleMapClick} isActive={true} />

                        {formData.latitude && formData.longitude && (
                          <>
                            <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
                            {formData.radius && (
                              <Circle
                                center={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                                radius={parseFloat(formData.radius) || 100}
                                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.3 }}
                              />
                            )}
                          </>
                        )}
                      </MapContainer>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg z-[1000] pointer-events-none">
                        คลิกบนแผนที่เพื่อเลือกตำแหน่ง
                      </div>
                    </div>
                    {formData.latitude && formData.longitude && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          <span className="font-semibold">พิกัดที่เลือก:</span> {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSubmitEvent}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                  >
                    ยืนยัน
                  </button>
                  <button
                    onClick={handleCancelForm}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}

          <div className="space-y-6">
            {events.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="64px" fill="#D1D5DB" className="mx-auto mb-4">
                  <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Z" />
                </svg>
                <p className="text-gray-500 text-lg">ยังไม่มีกิจกรรม</p>
                <p className="text-gray-400 text-sm mt-2">คลิก "เพิ่มงานใหม่" เพื่อเริ่มต้น</p>
              </div>
            ) : (
              events.map((event) => {
                const isEditing = editingEventId === event.id
                const currentFormData = isEditing ? editFormData : event

                return (
                  <div
                    key={event.id}
                    ref={(el) => (eventRefs.current[event.id] = el)}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all ${isEditing ? 'ring-2 ring-blue-500' : 'hover:shadow-xl'
                      }`}
                  >
                    {isEditing ? (
                      /* Edit Mode */
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-800">แก้ไขรายละเอียด</h3>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                            </svg>
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              ชื่อกิจกรรม <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={currentFormData.name}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              วันที่จัดงาน (วัน/เดือน/ปี) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={currentFormData.date}
                              onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                              placeholder="เช่น 20/10/2025"
                              pattern="\d{2}/\d{2}/\d{4}"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"></input>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              รายละเอียด
                            </label>
                            <textarea
                              value={currentFormData.description}
                              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                              rows="3"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              ชื่อสถานที่ <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={currentFormData.locationName}
                              onChange={(e) => setEditFormData({ ...editFormData, locationName: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              รัศมี (เมตร)
                            </label>
                            <input
                              type="number"
                              value={currentFormData.radius}
                              onChange={(e) => setEditFormData({ ...editFormData, radius: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              เวลาเริ่มต้น (24 ชั่วโมง)
                            </label>
                            <input
                              type="text"
                              value={currentFormData.startTime}
                              onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                              placeholder="เช่น 14:30"
                              pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              เวลาสิ้นสุด (24 ชั่วโมง)
                            </label>
                            <input
                              type="text"
                              value={currentFormData.endTime}
                              onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                              placeholder="เช่น 17:00"
                              pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              สถานะ
                            </label>
                            <select
                              value={currentFormData.status}
                              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            >
                              <option value="ongoing">เริ่มงานแล้ว</option>
                              <option value="completed">เสร็จสิ้น</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              ทีมที่เข้าร่วม (คั่นด้วยเครื่องหมายจุลภาค)
                            </label>
                            <input
                              type="text"
                              value={currentFormData.teams}
                              onChange={(e) => setEditFormData({ ...editFormData, teams: e.target.value })}
                              placeholder="เช่น ทีมพัฒนา, ทีมการตลาด, ทีมปฏิบัติการ"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          {/* Map for editing location */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              เลือกตำแหน่งบนแผนที่ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-gray-300">
                              <MapContainer
                                center={currentFormData.latitude && currentFormData.longitude
                                  ? [parseFloat(currentFormData.latitude), parseFloat(currentFormData.longitude)]
                                  : defaultCenter
                                }
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                                key={`edit-map-${editingEventId}`}
                              >
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapClickHandler onMapClick={handleMapClick} isActive={true} />

                                {currentFormData.latitude && currentFormData.longitude && (
                                  <>
                                    <Marker position={[parseFloat(currentFormData.latitude), parseFloat(currentFormData.longitude)]} />
                                    {currentFormData.radius && (
                                      <Circle
                                        center={[parseFloat(currentFormData.latitude), parseFloat(currentFormData.longitude)]}
                                        radius={parseFloat(currentFormData.radius) || 100}
                                        pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.3 }}
                                      />
                                    )}
                                  </>
                                )}
                              </MapContainer>
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg z-[1000] pointer-events-none">
                                คลิกบนแผนที่เพื่อเปลี่ยนตำแหน่ง
                              </div>
                            </div>
                            {currentFormData.latitude && currentFormData.longitude && (
                              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-sm text-orange-700">
                                  <span className="font-semibold">พิกัดที่เลือก:</span> {parseFloat(currentFormData.latitude).toFixed(6)}, {parseFloat(currentFormData.longitude).toFixed(6)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={handleUpdateEvent}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
                          >
                            บันทึกการแก้ไข
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Display Mode */
                      <div className="bg-[#085EC5] p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                            <p className="text-blue-100 text-sm">{event.date}</p>
                          </div>
                          <EventStatusBadge status={event.status} />
                        </div>

                        <p className="text-white/90 text-sm mb-4">{event.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {event.locationName}
                          </span>
                          {event.startTime && event.endTime && (
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                              {event.startTime} - {event.endTime}
                            </span>
                          )}
                          {event.teams && event.teams.length > 0 && (
                            event.teams.map((team, idx) => (
                              <span key={idx} className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                                {team}
                              </span>
                            ))
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                              <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Z" />
                            </svg>
                            แก้ไขรายละเอียด
                          </button>
                          <button
                            onClick={() => handleCancelEvent(event.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
                          >
                            ลบงาน
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* Dialog Components */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ isOpen: false, message: '' })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />

      <ErrorDialog
        isOpen={errorDialog.isOpen}
        message={errorDialog.message}
        onClose={() => setErrorDialog({ isOpen: false, message: '' })}
      />
    </div>
  )
}

export default EventManagement
