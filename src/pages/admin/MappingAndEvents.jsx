import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useLocations } from '../../contexts/LocationContext'
import { useEvents } from '../../contexts/EventContext'
import { usersData } from '../../data/usersData'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for different marker types
const locationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMjJjNTVlIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiLz48L3N2Zz4=',
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMjJjNTVlIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiLz48L3N2Zz4=',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const eventIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMjU2M2ViIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiLz48L3N2Zz4=',
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMjU2M2ViIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiLz48L3N2Zz4=',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to auto-fit bounds (only on initial load)
function FitBoundsToMarkers({ locations, disabled }) {
  const map = useMap()
  const hasInitialized = React.useRef(false)

  React.useEffect(() => {
    // Only run once on initial load and if not disabled
    if (!disabled && !hasInitialized.current && locations && locations.length > 0) {
      hasInitialized.current = true
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      )
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
        duration: 0.5
      })
    }
  }, [locations, map, disabled])

  return null
}

// Component to fly to location when search marker changes
function FlyToLocation({ position, onFlyStart, onFlyEnd }) {
  const map = useMap()
  const previousPosition = React.useRef(null)

  React.useEffect(() => {
    if (!position) {
      previousPosition.current = null
      return
    }

    // Check if position actually changed to prevent duplicate animations
    if (previousPosition.current && 
        previousPosition.current[0] === position[0] && 
        previousPosition.current[1] === position[1]) {
      return
    }

    previousPosition.current = position

    // Check if we need to fly or just open popup
    const currentCenter = map.getCenter()
    const distance = map.distance(currentCenter, position)
    
    // If we're already very close (less than 50 meters), just open popup without flying
    if (distance < 50) {
      // Just open the popup without animation
      setTimeout(() => {
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const latLng = layer.getLatLng()
            if (Math.abs(latLng.lat - position[0]) < 0.00001 && 
                Math.abs(latLng.lng - position[1]) < 0.00001) {
              layer.openPopup()
            }
          }
        })
        if (onFlyEnd) onFlyEnd()
      }, 100)
      return
    }

    // Notify that fly animation is starting
    if (onFlyStart) onFlyStart()

    // Get map container dimensions
    const container = map.getContainer()
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight
    
    const rightPanelWidth = 100
    
    // คำนวณจุดกึ่งกลางของพื้นที่แผนที่ที่มองเห็น (ส่วนซ้าย)
    const visibleMapWidth = containerWidth - rightPanelWidth
    const visibleCenterX = visibleMapWidth / 2
    
    // จุดกึ่งกลางของ container ทั้งหมด
    const containerCenterX = containerWidth / 2
    
    // คำนวณระยะ offset (เป็นลบเพราะต้องเลื่อนไปทางซ้าย)
    const offsetPixelsX = visibleCenterX - containerCenterX
    
    // แปลง pixel offset เป็น lat/lng offset
    // ใช้ zoom level 18 (ปลายทาง) ในการคำนวณ
    const targetZoom = 18
    const markerPoint = map.project(position, targetZoom)
    const adjustedPoint = L.point(markerPoint.x - offsetPixelsX, markerPoint.y)
    const adjustedPosition = map.unproject(adjustedPoint, targetZoom)
    
    // Stop any ongoing animations first
    map.stop()
    
    // Fly to the adjusted position with smooth animation
    map.flyTo(adjustedPosition, targetZoom, {
      animate: true,
      duration: 1.5
    })
    
    // Open popup after animation
    const popupTimer = setTimeout(() => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          const latLng = layer.getLatLng()
          if (Math.abs(latLng.lat - position[0]) < 0.00001 && 
              Math.abs(latLng.lng - position[1]) < 0.00001) {
            layer.openPopup()
          }
        }
      })
      if (onFlyEnd) onFlyEnd()
    }, 1600)

    return () => {
      clearTimeout(popupTimer)
    }
  }, [position, map, onFlyStart, onFlyEnd])

  return null
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  const map = useMap()

  React.useEffect(() => {
    map.on('click', onMapClick)
    return () => {
      map.off('click', onMapClick)
    }
  }, [map, onMapClick])

  return null
}

// Component to show temporary search marker
function SearchMarker({ position, name, onClick }) {
  const markerRef = useRef(null)
  
  // Auto-open popup when marker is created or updated
  useEffect(() => {
    if (markerRef.current && position) {
      // Small delay to ensure marker is rendered
      setTimeout(() => {
        markerRef.current.openPopup()
      }, 100)
    }
  }, [position])
  
  if (!position) return null
  
  const searchIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjZWY0NDQ0IiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiLz48L3N2Zz4=',
    iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjZWY0NDQ0IiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiLz48L3N2Zz4=',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  return (
    <Marker 
      position={position} 
      icon={searchIcon}
      ref={markerRef}
    >
      <Popup autoClose={false} closeOnClick={false}>
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h3 className="font-bold text-secondary dark:text-white">{name === 'ตำแหน่งใหม่' ? 'ตำแหน่งที่เลือก' : 'ผลการค้นหา'}</h3>
          </div>
          <p className="text-xs text-secondary dark:text-white/70 mb-2">{name}</p>
          <div className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
            <div className="font-medium mb-1">พิกัด:</div>
            <div className="font-mono">{position[0].toFixed(6)}, {position[1].toFixed(6)}</div>
          </div>
          <button
            onClick={onClick}
            className="w-full bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-white px-3 py-2.5 rounded-lg text-xs font-medium transition-colors"
          >
            สร้างพื้นที่/กิจกรรมที่นี่
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

// Multi-Select Component with Search
function MultiSelect({ selected, onChange, options, placeholder, label }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.secondary && opt.secondary.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const selectedLabels = selected.map(val => {
    const opt = options.find(o => o.value === val)
    return opt ? opt.label : val
  })

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
        {label}
      </label>
      
      <div 
        className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus-within:border-primary dark:focus-within:border-primary cursor-pointer min-h-[42px] flex flex-wrap gap-2 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        ) : (
          selectedLabels.map((label, idx) => (
            <span key={idx} className="bg-accent dark:bg-accent-orange text-primary dark:text-primary px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              {label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const opt = options.find(o => o.label === label)
                  if (opt) toggleOption(opt.value)
                }}
                className="hover:bg-accent dark:hover:bg-accent-orange/30 rounded-full"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[2100] w-full mt-1 bg-white dark:bg-secondary/95 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg text-sm focus:border-primary dark:focus:border-primary focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">ไม่พบข้อมูล</div>
            ) : (
              filtered.map(opt => (
                <div
                  key={opt.value}
                  className={`px-4 py-2 cursor-pointer hover:bg-accent dark:hover:bg-accent-orange/30 flex items-center gap-2 ${
                    selected.includes(opt.value) ? 'bg-accent dark:bg-accent-orange' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOption(opt.value)
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary dark:text-primary"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                    {opt.secondary && (
                      <div className="text-xs text-gray-500">{opt.secondary}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Create Form Component
function CreateForm({ type, position, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    radius: 100,
    locationName: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    assignedUsers: [],
    assignedRoles: [],
    assignedDepartments: [],
    assignedPositions: []
  })

  const startDateRef = useRef(null)
  const endDateRef = useRef(null)
  const formRef = useRef(null)

  const pad = (n) => n.toString().padStart(2, '0')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
      if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        if (formRef.current) {
          formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  const normalizeDate = (input) => {
    if (!input) return ''
    const s = input.trim()
    
    // Already in YYYY-MM-DD format from date picker
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (dmy) {
      const d = pad(parseInt(dmy[1], 10))
      const m = pad(parseInt(dmy[2], 10))
      const y = dmy[3]
      return `${y}-${m}-${d}`
    }

    // Try parsing as date
    const parsed = new Date(s)
    if (!isNaN(parsed)) {
      const y = parsed.getFullYear()
      const m = pad(parsed.getMonth() + 1)
      const d = pad(parsed.getDate())
      return `${y}-${m}-${d}`
    }

    return s
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อ')
      return
    }
    if (type === 'event' && (!formData.startDate || !formData.endDate)) {
      alert('กรุณาเลือกวันที่เริ่มและวันที่สิ้นสุด')
      return
    }
    
    // Validate dates if event type
    if (type === 'event') {
      // แปลงวันที่เป็น Date object เพื่อเปรียบเทียบ
      let startDateObj, endDateObj
      
      // ถ้าเป็นรูปแบบ DD/MM/YYYY
      if (formData.startDate.includes('/')) {
        const [d1, m1, y1] = formData.startDate.split('/')
        startDateObj = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1))
      } else {
        startDateObj = new Date(formData.startDate)
      }
      
      if (formData.endDate.includes('/')) {
        const [d2, m2, y2] = formData.endDate.split('/')
        endDateObj = new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2))
      } else {
        endDateObj = new Date(formData.endDate)
      }
      
      if (startDateObj > endDateObj) {
        alert('วันที่เริ่มต้องไม่เกินวันที่สิ้นสุด')
        return
      }

      // Validate ผู้รับผิดชอบ - ต้องมีอย่างน้อย 1 เกณฑ์
      const hasAssignment = 
        formData.assignedUsers.length > 0 ||
        formData.assignedRoles.length > 0 ||
        formData.assignedDepartments.length > 0 ||
        formData.assignedPositions.length > 0

      if (!hasAssignment) {
        alert('กรุณากำหนดผู้รับผิดชอบอย่างน้อย 1 เกณฑ์\n(เลือกพนักงาน, Role, แผนก หรือตำแหน่ง)')
        return
      }
    }
    
    onSubmit(formData)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Position Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-xs text-gray-500 mb-2 font-medium">พิกัดที่เลือก</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-gray-700">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
          ชื่อ{type === 'location' ? 'พื้นที่' : 'กิจกรรม'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
          placeholder={`ระบุชื่อ${type === 'location' ? 'พื้นที่' : 'กิจกรรม'}`}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
          คำอธิบาย
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors resize-none"
          rows="3"
          placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
        />
      </div>

      {/* Radius */}
      <div>
        <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
          รัศมี (เมตร) <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={formData.radius}
            onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
            className="flex-1"
          />
          <input
            type="number"
            min="50"
            max="1000"
            value={formData.radius}
            onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) || 100 })}
            className="w-24 px-3 py-2 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none text-center font-medium"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">ระยะทางที่อนุญาตให้เช็คอินได้จากจุดนี้</p>
      </div>

      {/* Event specific fields */}
      {type === 'event' && (
        <>
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
              ชื่อสถานที่
            </label>
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
              placeholder="เช่น โรงแรม ABC, งานเทศกาล XYZ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
              วันที่เริ่มกิจกรรม <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => {
                  if (startDateRef.current) {
                    startDateRef.current.showPicker?.() || startDateRef.current.click()
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-white hover:text-primary dark:hover:text-primary z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                  <path d="M16 2v4M8 2v4" strokeWidth="1.5" />
                </svg>
              </button>

              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                onBlur={(e) => {
                  const normalized = normalizeDate(e.target.value)
                  if (normalized) {
                    // แปลงเป็น DD/MM/YYYY เพื่อแสดง
                    const [year, month, day] = normalized.split('-')
                    setFormData({ ...formData, startDate: `${day}/${month}/${year}` })
                  }
                }}
                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                required
              />

              <input
                ref={startDateRef}
                type="date"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-')
                    setFormData({ ...formData, startDate: `${day}/${month}/${year}` })
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
              วันที่สิ้นสุดกิจกรรม <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => {
                  if (endDateRef.current) {
                    endDateRef.current.showPicker?.() || endDateRef.current.click()
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-white hover:text-primary dark:hover:text-primary z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                  <path d="M16 2v4M8 2v4" strokeWidth="1.5" />
                </svg>
              </button>

              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                onBlur={(e) => {
                  const normalized = normalizeDate(e.target.value)
                  if (normalized) {
                    // แปลงเป็น DD/MM/YYYY เพื่อแสดง
                    const [year, month, day] = normalized.split('-')
                    setFormData({ ...formData, endDate: `${day}/${month}/${year}` })
                  }
                }}
                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                required
              />

              <input
                ref={endDateRef}
                type="date"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-')
                    setFormData({ ...formData, endDate: `${day}/${month}/${year}` })
                  }
                }}
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                เวลาเริ่ม <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                เวลาสิ้นสุด <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4 pt-4 border-t-2 border-gray-200">
            <h3 className="text-base font-bold text-secondary dark:text-white flex items-center gap-2">              
              กำหนดผู้รับผิดชอบ
            </h3>

            <MultiSelect
              label="เลือกพนักงานเฉพาะราย"
              selected={formData.assignedUsers}
              onChange={(values) => setFormData({ ...formData, assignedUsers: values })}
              options={usersData.filter(u => u.role !== 'admin' && u.role !== 'superadmin').map(u => ({
                value: u.id,
                label: u.name,
                secondary: `${u.department} - ${u.position}`
              }))}
              placeholder="เลือกพนักงาน..."
            />

            <MultiSelect
              label="เลือกตาม Role (บทบาท)"
              selected={formData.assignedRoles}
              onChange={(values) => setFormData({ ...formData, assignedRoles: values })}
              options={[
                { value: 'user', label: 'User', secondary: 'พนักงานทั่วไป' },
                { value: 'manager', label: 'Manager', secondary: 'ผู้จัดการ' }
              ]}
              placeholder="เลือก Role..."
            />

            <MultiSelect
              label="เลือกตาม Department (แผนก)"
              selected={formData.assignedDepartments}
              onChange={(values) => setFormData({ ...formData, assignedDepartments: values })}
              options={[...new Set(usersData.map(u => u.department))].filter(Boolean).map(dept => ({
                value: dept,
                label: dept
              }))}
              placeholder="เลือกแผนก..."
            />

            <MultiSelect
              label="เลือกตาม Position (ตำแหน่ง)"
              selected={formData.assignedPositions}
              onChange={(values) => setFormData({ ...formData, assignedPositions: values })}
              options={[...new Set(usersData.map(u => u.position))].filter(Boolean).map(pos => ({
                value: pos,
                label: pos
              }))}
              placeholder="เลือกตำแหน่ง..."
            />

            <div className="bg-accent dark:bg-accent-orange border border-gray-200 dark:border-white/10 rounded-lg p-3">
              <p className="text-xs text-secondary dark:text-white">
                <strong>💡 หมายเหตุ:</strong> ผู้ใช้จะเห็นกิจกรรมนี้หากตรงกับเงื่อนไข<strong>ใดเงื่อนไขหนึ่ง</strong>ที่กำหนด
              </p>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-accent dark:bg-accent-orange hover:bg-accent/80 dark:hover:bg-accent-orange/80 text-secondary dark:text-white rounded-lg font-medium transition-colors"
        >
          ย้อนกลับ
        </button>
        <button
          type="submit"
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors text-white ${
            type === 'location'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/80'
          }`}
        >
          สร้าง{type === 'location' ? 'พื้นที่' : 'กิจกรรม'}
        </button>
      </div>
    </form>
  )
}

// Edit Form Component
function EditForm({ type, item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: item.name || '',
    description: item.description || '',
    radius: item.radius || 100,
    locationName: item.locationName || '',
    startDate: item.startDate || item.date || '',
    endDate: item.endDate || item.date || '',
    startTime: item.startTime || '09:00',
    endTime: item.endTime || '17:00',
    status: item.status || 'ongoing',
    assignedUsers: item.assignedUsers || [],
    assignedRoles: item.assignedRoles || [],
    assignedDepartments: item.assignedDepartments || [],
    assignedPositions: item.assignedPositions || []
  })

  const startDateRef = useRef(null)
  const endDateRef = useRef(null)
  const formRef = useRef(null)

  const pad = (n) => n.toString().padStart(2, '0')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
      if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        if (formRef.current) {
          formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  const normalizeDate = (input) => {
    if (!input) return ''
    const s = input.trim()
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

    const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (dmy) {
      const d = pad(parseInt(dmy[1], 10))
      const m = pad(parseInt(dmy[2], 10))
      const y = dmy[3]
      return `${y}-${m}-${d}`
    }

    const parsed = new Date(s)
    if (!isNaN(parsed)) {
      const y = parsed.getFullYear()
      const m = pad(parsed.getMonth() + 1)
      const d = pad(parsed.getDate())
      return `${y}-${m}-${d}`
    }

    return s
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อ')
      return
    }
    if (type === 'event' && (!formData.startDate || !formData.endDate)) {
      alert('กรุณาเลือกวันที่เริ่มและวันที่สิ้นสุด')
      return
    }
    
    if (type === 'event') {
      let startDateObj, endDateObj
      
      if (formData.startDate.includes('/')) {
        const [d1, m1, y1] = formData.startDate.split('/')
        startDateObj = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1))
      } else {
        startDateObj = new Date(formData.startDate)
      }
      
      if (formData.endDate.includes('/')) {
        const [d2, m2, y2] = formData.endDate.split('/')
        endDateObj = new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2))
      } else {
        endDateObj = new Date(formData.endDate)
      }
      
      if (startDateObj > endDateObj) {
        alert('วันที่เริ่มต้องไม่เกินวันที่สิ้นสุด')
        return
      }

      // Validate ผู้รับผิดชอบ - ต้องมีอย่างน้อย 1 เกณฑ์
      const hasAssignment = 
        formData.assignedUsers.length > 0 ||
        formData.assignedRoles.length > 0 ||
        formData.assignedDepartments.length > 0 ||
        formData.assignedPositions.length > 0

      if (!hasAssignment) {
        alert('กรุณากำหนดผู้รับผิดชอบอย่างน้อย 1 เกณฑ์\n(เลือกพนักงาน, Role, แผนก หรือตำแหน่ง)')
        return
      }
    }
    
    onSubmit(formData)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
          ชื่อ{type === 'location' ? 'พื้นที่' : 'กิจกรรม'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
          คำอธิบาย
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors resize-none"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
          รัศมี (เมตร) <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={formData.radius}
            onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
            className="flex-1"
          />
          <input
            type="number"
            min="50"
            max="1000"
            value={formData.radius}
            onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) || 100 })}
            className="w-24 px-3 py-2 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none text-center font-medium"
          />
        </div>
      </div>

      {type === 'event' && (
        <>
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
              ชื่อสถานที่
            </label>
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
              วันที่เริ่มกิจกรรม <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => {
                  if (startDateRef.current) {
                    startDateRef.current.showPicker?.() || startDateRef.current.click()
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-white hover:text-primary dark:hover:text-primary z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                  <path d="M16 2v4M8 2v4" strokeWidth="1.5" />
                </svg>
              </button>

              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                onBlur={(e) => {
                  const normalized = normalizeDate(e.target.value)
                  if (normalized) {
                    const [year, month, day] = normalized.split('-')
                    setFormData({ ...formData, startDate: `${day}/${month}/${year}` })
                  }
                }}
                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                required
              />

              <input
                ref={startDateRef}
                type="date"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-')
                    setFormData({ ...formData, startDate: `${day}/${month}/${year}` })
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
              วันที่สิ้นสุดกิจกรรม <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => {
                  if (endDateRef.current) {
                    endDateRef.current.showPicker?.() || endDateRef.current.click()
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-white hover:text-primary dark:hover:text-primary z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                  <path d="M16 2v4M8 2v4" strokeWidth="1.5" />
                </svg>
              </button>

              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                onBlur={(e) => {
                  const normalized = normalizeDate(e.target.value)
                  if (normalized) {
                    const [year, month, day] = normalized.split('-')
                    setFormData({ ...formData, endDate: `${day}/${month}/${year}` })
                  }
                }}
                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                required
              />

              <input
                ref={endDateRef}
                type="date"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-')
                    setFormData({ ...formData, endDate: `${day}/${month}/${year}` })
                  }
                }}
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                เวลาเริ่ม <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                เวลาสิ้นสุด <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
              สถานะกิจกรรม <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
              required
            >
              <option value="ongoing">● ดำเนินการ</option>
              <option value="completed">○ สิ้นสุด</option>
            </select>
          </div>

          {/* Assignment Section - Edit Mode */}
          <div className="space-y-4 pt-4 border-t-2 border-gray-200">
            <h3 className="text-base font-bold text-secondary dark:text-white flex items-center gap-2">
              กำหนดผู้รับผิดชอบ
            </h3>

            <MultiSelect
              label="เลือกพนักงาน"
              selected={formData.assignedUsers}
              onChange={(values) => setFormData({ ...formData, assignedUsers: values })}
              options={usersData.filter(u => u.role !== 'admin' && u.role !== 'superadmin').map(u => ({
                value: u.id,
                label: u.name,
                secondary: `${u.department} - ${u.position}`
              }))}
              placeholder="เลือกพนักงาน..."
            />

            <MultiSelect
              label="เลือกตาม Role (บทบาท)"
              selected={formData.assignedRoles}
              onChange={(values) => setFormData({ ...formData, assignedRoles: values })}
              options={[
                { value: 'user', label: 'User', secondary: 'พนักงานทั่วไป' },
                { value: 'manager', label: 'Manager', secondary: 'ผู้จัดการ' }
              ]}
              placeholder="เลือก Role..."
            />

            <MultiSelect
              label="เลือกตาม Department (แผนก)"
              selected={formData.assignedDepartments}
              onChange={(values) => setFormData({ ...formData, assignedDepartments: values })}
              options={[...new Set(usersData.map(u => u.department))].filter(Boolean).map(dept => ({
                value: dept,
                label: dept
              }))}
              placeholder="เลือกแผนก..."
            />

            <MultiSelect
              label="เลือกตาม Position (ตำแหน่ง)"
              selected={formData.assignedPositions}
              onChange={(values) => setFormData({ ...formData, assignedPositions: values })}
              options={[...new Set(usersData.map(u => u.position))].filter(Boolean).map(pos => ({
                value: pos,
                label: pos
              }))}
              placeholder="เลือกตำแหน่ง..."
            />          
          </div>
        </>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-accent dark:bg-accent-orange hover:bg-accent/80 dark:hover:bg-accent-orange/80 text-secondary dark:text-white rounded-lg font-medium transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors text-white ${
            type === 'location'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/80'
          }`}
        >
          บันทึก
        </button>
      </div>
    </form>
  )
}

function MappingAndEvents() {
  const { locations, deleteLocation, addLocation, updateLocation } = useLocations()
  const { events, deleteEvent, addEvent, updateEvent } = useEvents()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'locations' or 'events'
  const [mapType, setMapType] = useState('default') // 'default' or 'satellite'
  const [searchQuery, setSearchQuery] = useState('')
  const [mapSearchQuery, setMapSearchQuery] = useState('') // For map location search
  const [mapSearchResults, setMapSearchResults] = useState([])
  const [isSearchingMap, setIsSearchingMap] = useState(false)
  const [searchMarkerPosition, setSearchMarkerPosition] = useState(null) // For temporary search marker
  const [searchMarkerName, setSearchMarkerName] = useState('') // Name of searched location
  const [openIds, setOpenIds] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createType, setCreateType] = useState(null) // 'location' or 'event'
  const [newMarkerPosition, setNewMarkerPosition] = useState(null)
  const [isFlying, setIsFlying] = useState(false) // Track if map is currently flying
  const wrapperRefs = useRef({})
  const innerRefs = useRef({})
  const endListenersRef = useRef({})
  const [showEditModal, setShowEditModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const mapSearchTimeoutRef = useRef(null)

  const defaultCenter = [13.7606, 100.5034]

  // Initialize refs for animations
  useEffect(() => {
    Object.values(wrapperRefs.current).forEach(w => {
      if (!w) return
      w.style.overflow = 'hidden'
      w.style.maxHeight = '0px'
      w.style.opacity = '0'
      w.style.transition = 'max-height 280ms cubic-bezier(.2,.8,.2,1), opacity 200ms ease'
      w.style.willChange = 'max-height, opacity'
      try { w.style.contain = 'layout'; } catch (e) {}
    })
    Object.values(innerRefs.current).forEach(i => {
      if (!i) return
      i.style.transform = 'translateY(-6px)'
      i.style.opacity = '0'
      i.style.transition = 'transform 240ms cubic-bezier(.2,.85,.2,1), opacity 200ms ease'
      i.style.willChange = 'transform, opacity'
      i.style.transformOrigin = 'top center'
    })
  }, [])

  // Filter items based on search query
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.locationName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Combined items for display
  const getFilteredItems = () => {
    if (activeTab === 'locations') return filteredLocations.map((loc, index) => ({ ...loc, type: 'location', uniqueKey: `loc-${loc.id}-${index}` }))
    if (activeTab === 'events') return filteredEvents.map((evt, index) => ({ ...evt, type: 'event', uniqueKey: `evt-${evt.id}-${evt.date}-${index}` }))
    return [
      ...filteredLocations.map((loc, index) => ({ ...loc, type: 'location', uniqueKey: `loc-${loc.id}-${index}` })),
      ...filteredEvents.map((evt, index) => ({ ...evt, type: 'event', uniqueKey: `evt-${evt.id}-${evt.date}-${index}` }))
    ]
  }

  const filteredItems = getFilteredItems()

  // Helper function to translate location display name to Thai-friendly format
  const formatLocationName = (result) => {
    const parts = result.display_name.split(',').map(s => s.trim())
    
    // Try to extract meaningful parts
    const addressParts = []
    
    // Get the main location name (usually first part)
    if (parts[0]) addressParts.push(parts[0])
    
    // Look for district/subdistrict (usually contains ตำบล, อำเภอ, เขต)
    const districtPart = parts.find(p => 
      p.includes('ตำบล') || p.includes('อำเภอ') || p.includes('เขต') || 
      p.includes('District') || p.includes('Sub-district')
    )
    if (districtPart) addressParts.push(districtPart)
    
    // Look for province (usually contains จังหวัด or ends with Province)
    const provincePart = parts.find(p => 
      p.includes('จังหวัด') || p.includes('Province') || p.includes('Bangkok')
    )
    if (provincePart && !addressParts.includes(provincePart)) {
      addressParts.push(provincePart)
    }
    
    // If we have less than 2 parts, add the second part from original
    if (addressParts.length < 2 && parts.length > 1 && !addressParts.includes(parts[1])) {
      addressParts.push(parts[1])
    }
    
    return addressParts.join(', ')
  }

  // Search map locations using Nominatim API
  const searchMapLocation = async (query) => {
    if (!query.trim()) {
      setMapSearchResults([])
      return
    }

    setIsSearchingMap(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=th&accept-language=th`
      )
      const data = await response.json()
      // Add formatted name to each result
      const formattedResults = data.map(result => ({
        ...result,
        formatted_name: formatLocationName(result)
      }))
      setMapSearchResults(formattedResults)
    } catch (error) {
      console.error('Error searching map:', error)
      setMapSearchResults([])
    } finally {
      setIsSearchingMap(false)
    }
  }

  // Debounced map search
  useEffect(() => {
    if (mapSearchTimeoutRef.current) {
      clearTimeout(mapSearchTimeoutRef.current)
    }

    mapSearchTimeoutRef.current = setTimeout(() => {
      searchMapLocation(mapSearchQuery)
    }, 500)

    return () => {
      if (mapSearchTimeoutRef.current) {
        clearTimeout(mapSearchTimeoutRef.current)
      }
    }
  }, [mapSearchQuery])

  // Get tile layer URL based on map type
  const getTileLayerUrl = () => {
    if (mapType === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }

  const getTileLayerAttribution = () => {
    if (mapType === 'satellite') {
      return '&copy; <a href="https://www.esri.com/">Esri</a>'
    }
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }

  // Toggle details animation
  const toggleDetails = (id) => {
    const wrapper = wrapperRefs.current[id]
    const inner = innerRefs.current[id]
    const isOpen = openIds.includes(id)

    if (!wrapper || !inner) {
      if (!isOpen) {
        setOpenIds([id])
      } else {
        setOpenIds([])
      }
      return
    }

    if (!isOpen) {
      // Close all other open items
      openIds.forEach(openId => {
        if (openId !== id) {
          const otherWrapper = wrapperRefs.current[openId]
          const otherInner = innerRefs.current[openId]
          
          if (otherWrapper && otherInner) {
            if (endListenersRef.current[openId]) {
              otherWrapper.removeEventListener('transitionend', endListenersRef.current[openId])
              delete endListenersRef.current[openId]
            }

            const currentMax = getComputedStyle(otherWrapper).maxHeight
            if (currentMax === 'none') otherWrapper.style.maxHeight = `${otherInner.scrollHeight}px`
            otherWrapper.style.opacity = '1'
            otherInner.style.transform = 'translateY(-8px)'
            otherInner.style.opacity = '0'
            void otherWrapper.offsetHeight

            requestAnimationFrame(() => {
              otherWrapper.style.transition = 'max-height 260ms cubic-bezier(.2,.85,.2,1), opacity 200ms ease'
              otherWrapper.style.maxHeight = '0px'
              otherWrapper.style.opacity = '0'
            })

            const onEndClose = (e) => {
              if (e.propertyName === 'max-height') {
                otherWrapper.removeEventListener('transitionend', onEndClose)
                if (endListenersRef.current[openId] === onEndClose) delete endListenersRef.current[openId]
              }
            }
            endListenersRef.current[openId] = onEndClose
            otherWrapper.addEventListener('transitionend', onEndClose)
          }
        }
      })

      if (endListenersRef.current[id]) {
        wrapper.removeEventListener('transitionend', endListenersRef.current[id])
        delete endListenersRef.current[id]
      }

      wrapper.style.transition = 'none'
      wrapper.style.maxHeight = '0px'
      wrapper.style.opacity = '0'
      inner.style.transform = 'translateY(-8px)'
      inner.style.opacity = '0'
      void wrapper.offsetHeight

      setOpenIds([id])

      requestAnimationFrame(() => {
        const h = inner.scrollHeight
        wrapper.style.transition = 'max-height 320ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease'
        wrapper.style.maxHeight = `${h}px`
        wrapper.style.opacity = '1'
        inner.style.transform = 'translateY(0)'
        inner.style.opacity = '1'

        const onEnd = (e) => {
          if (e.propertyName === 'max-height') {
            wrapper.style.maxHeight = 'none'
            wrapper.removeEventListener('transitionend', onEnd)
            if (endListenersRef.current[id] === onEnd) delete endListenersRef.current[id]
          }
        }
        endListenersRef.current[id] = onEnd
        wrapper.addEventListener('transitionend', onEnd)
      })
    } else {
      if (endListenersRef.current[id]) {
        wrapper.removeEventListener('transitionend', endListenersRef.current[id])
        delete endListenersRef.current[id]
      }

      const currentMax = getComputedStyle(wrapper).maxHeight
      if (currentMax === 'none') wrapper.style.maxHeight = `${inner.scrollHeight}px`
      wrapper.style.opacity = '1'
      inner.style.transform = 'translateY(-8px)'
      inner.style.opacity = '0'
      void wrapper.offsetHeight

      requestAnimationFrame(() => {
        wrapper.style.transition = 'max-height 260ms cubic-bezier(.2,.85,.2,1), opacity 200ms ease'
        wrapper.style.maxHeight = '0px'
        wrapper.style.opacity = '0'
      })

      const onEndClose = (e) => {
        if (e.propertyName === 'max-height') {
          wrapper.removeEventListener('transitionend', onEndClose)
          if (endListenersRef.current[id] === onEndClose) delete endListenersRef.current[id]
          setOpenIds([])
        }
      }
      endListenersRef.current[id] = onEndClose
      wrapper.addEventListener('transitionend', onEndClose)
    }
  }

  // Handle delete
  const handleDelete = async (id, type) => {
    if (window.confirm(`คุณต้องการลบ${type === 'location' ? 'พื้นที่' : 'กิจกรรม'}นี้ใช่หรือไม่?`)) {
      try {
        if (type === 'location') {
          await deleteLocation(id)
        } else {
          await deleteEvent(id)
        }
        // Close the detail if it was open
        setOpenIds(prev => prev.filter(openId => openId !== id))
      } catch (error) {
        console.error('Error deleting:', error)
        alert('เกิดข้อผิดพลาดในการลบ')
      }
    }
  }

  // Handle map click to create new marker
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng
    setNewMarkerPosition([lat, lng])
    setSearchMarkerPosition([lat, lng])
    setSearchMarkerName('ตำแหน่งใหม่')
    // Don't open modal immediately, wait for user to click the create button in popup
    // The FlyToLocation component will handle opening the popup automatically
  }

  // Handle search marker click to open create modal
  const handleSearchMarkerClick = () => {
    if (searchMarkerPosition) {
      setNewMarkerPosition(searchMarkerPosition)
      setShowCreateModal(true)
      setCreateType(null) // Reset to show type selection
    }
  }

  // Handle create location/event
  const handleCreate = async (formData) => {
    try {
      if (createType === 'location') {
        // Check duplicate name for locations
        const isDuplicate = locations.some(loc => 
          loc.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
        )
        if (isDuplicate) {
          alert('มีพื้นที่ชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น')
          return
        }

        const newId = locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1
        addLocation({
          id: newId,
          ...formData,
          latitude: newMarkerPosition[0],
          longitude: newMarkerPosition[1],
          status: 'active'
        })
      } else if (createType === 'event') {
        // Check duplicate name for events
        const isDuplicate = events.some(evt => 
          evt.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
        )
        if (isDuplicate) {
          alert('มีกิจกรรมชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น')
          return
        }

        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1

        let formattedStartDate = formData.startDate
        let formattedEndDate = formData.endDate
        
        if (!formData.startDate.includes('/')) {
          // แปลงจาก YYYY-MM-DD เป็น DD/MM/YYYY
          const [y1, m1, d1] = formData.startDate.split('-')
          formattedStartDate = `${d1}/${m1}/${y1}`
        }
        
        if (!formData.endDate.includes('/')) {
          // แปลงจาก YYYY-MM-DD เป็น DD/MM/YYYY
          const [y2, m2, d2] = formData.endDate.split('-')
          formattedEndDate = `${d2}/${m2}/${y2}`
        }
        
        // Auto-check status based on current date
        const autoStatus = checkEventStatus(formattedStartDate, formattedEndDate, formData.startTime, formData.endTime)
        
        addEvent({
          id: newId,
          ...formData,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          date: formattedStartDate, // Keep for compatibility
          latitude: newMarkerPosition[0],
          longitude: newMarkerPosition[1],
          status: autoStatus,
          teams: [],
          assignedUsers: formData.assignedUsers || [],
          assignedRoles: formData.assignedRoles || [],
          assignedDepartments: formData.assignedDepartments || [],
          assignedPositions: formData.assignedPositions || []
        })
      }
      setShowCreateModal(false)
      setCreateType(null)
      setNewMarkerPosition(null)
      setSearchMarkerPosition(null)
      setSearchMarkerName('')
      alert('สร้างสำเร็จ!')
    } catch (error) {
      console.error('Error creating:', error)
      alert('เกิดข้อผิดพลาดในการสร้าง')
    }
  }

  // Helper function to check event status based on date/time
  const checkEventStatus = (startDateStr, endDateStr, startTime, endTime) => {
    try {
      const now = new Date()
      
      // Parse DD/MM/YYYY format
      const [startDay, startMonth, startYear] = startDateStr.split('/')
      const [endDay, endMonth, endYear] = endDateStr.split('/')
      
      // Create date objects with times
      const startDateTime = new Date(`${startYear}-${startMonth}-${startDay}T${startTime}:00`)
      const endDateTime = new Date(`${endYear}-${endMonth}-${endDay}T${endTime}:00`)
      
      if (now < startDateTime) {
        return 'upcoming' // ยังไม่เริ่ม
      } else if (now > endDateTime) {
        return 'completed' // สิ้นสุดแล้ว
      } else {
        return 'ongoing' // กำลังดำเนินการ
      }
    } catch (error) {
      console.error('Error checking event status:', error)
      return 'ongoing' // default
    }
  }

  // Handle edit location/event
  const handleEdit = async (formData) => {
    try {
      if (editItem.type === 'location') {
        // Check duplicate name for locations (exclude current item)
        const isDuplicate = locations.some(loc => 
          loc.id !== editItem.id && 
          loc.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
        )
        if (isDuplicate) {
          alert('มีพื้นที่ชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น')
          return
        }

        updateLocation(editItem.id, {
          ...editItem,
          ...formData
        })
      } else if (editItem.type === 'event') {
        // Check duplicate name for events (exclude current item)
        const isDuplicate = events.some(evt => 
          evt.id !== editItem.id && 
          evt.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
        )
        if (isDuplicate) {
          alert('มีกิจกรรมชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น')
          return
        }

        // Validate ผู้รับผิดชอบ - ต้องมีอย่างน้อย 1 เกณฑ์
        const hasAssignment = 
          formData.assignedUsers.length > 0 ||
          formData.assignedRoles.length > 0 ||
          formData.assignedDepartments.length > 0 ||
          formData.assignedPositions.length > 0

        if (!hasAssignment) {
          alert('กรุณากำหนดผู้รับผิดชอบอย่างน้อย 1 เกณฑ์\n(เลือกพนักงาน, Role, แผนก หรือตำแหน่ง)')
          return
        }

        let formattedStartDate = formData.startDate
        let formattedEndDate = formData.endDate
        
        if (!formData.startDate.includes('/')) {
          const [y1, m1, d1] = formData.startDate.split('-')
          formattedStartDate = `${d1}/${m1}/${y1}`
        }
        
        if (!formData.endDate.includes('/')) {
          const [y2, m2, d2] = formData.endDate.split('-')
          formattedEndDate = `${d2}/${m2}/${y2}`
        }
        
        updateEvent(editItem.id, {
          ...editItem,
          ...formData,
          status: formData.status,
          assignedUsers: formData.assignedUsers || [],
          assignedRoles: formData.assignedRoles || [],
          assignedDepartments: formData.assignedDepartments || [],
          assignedPositions: formData.assignedPositions || [],
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          date: formattedStartDate
        })
      }
      setShowEditModal(false)
      setEditItem(null)
      alert('แก้ไขสำเร็จ!')
    } catch (error) {
      console.error('Error updating:', error)
      alert('เกิดข้อผิดพลาดในการแก้ไข')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Detail Modal */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                {detailItem.type === 'location' ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    รายละเอียดพื้นที่อนุญาต
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-primary dark:bg-primary"></div>
                    รายละเอียดกิจกรรม
                  </>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setDetailItem(null)
                }}
                className="text-gray-400 hover:text-secondary dark:text-white/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              {/* Basic Info */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-100">
                <h3 className="font-bold text-lg text-secondary dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ข้อมูลพื้นฐาน
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ชื่อ{detailItem.type === 'location' ? 'พื้นที่' : 'กิจกรรม'}</p>
                    <p className="font-semibold text-secondary dark:text-white">{detailItem.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">สถานะ</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      detailItem.status === 'active' || detailItem.status === 'ongoing'
                        ? detailItem.type === 'location'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-accent dark:bg-accent-orange text-primary dark:text-primary'
                        : detailItem.status === 'upcoming'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {detailItem.type === 'location' 
                        ? (detailItem.status === 'active' ? '✓ ใช้งาน' : '✕ ปิด')
                        : detailItem.status === 'ongoing' 
                        ? '● ดำเนินการ' 
                        : detailItem.status === 'upcoming'
                        ? '◷ ยังไม่เริ่ม'
                        : '○ สิ้นสุด'
                      }
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">คำอธิบาย</p>
                    <p className="text-gray-700">{detailItem.description || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">รัศมี</p>
                    <p className="font-semibold text-secondary dark:text-white">{detailItem.radius} เมตร</p>
                  </div>
                  {detailItem.type === 'event' && detailItem.locationName && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ชื่อสถานที่</p>
                      <p className="font-semibold text-secondary dark:text-white">{detailItem.locationName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Time Info (Events only) */}
              {detailItem.type === 'event' && (
                <div className="bg-white dark:bg-secondary transition-colors duration-300/95 rounded-xl p-5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10">
                  <h3 className="font-bold text-lg text-secondary dark:text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    วันที่และเวลา
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">วันที่เริ่ม</p>
                      <p className="font-semibold text-secondary dark:text-white">{detailItem.startDate || detailItem.date || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">วันที่สิ้นสุด</p>
                      <p className="font-semibold text-secondary dark:text-white">{detailItem.endDate || detailItem.date || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">เวลาเริ่ม</p>
                      <p className="font-semibold text-secondary dark:text-white">{detailItem.startTime || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">เวลาสิ้นสุด</p>
                      <p className="font-semibold text-secondary dark:text-white">{detailItem.endTime || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Info */}
              <div className="bg-white dark:bg-secondary transition-colors duration-300/95 rounded-xl p-5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10">
                <h3 className="font-bold text-lg text-secondary dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  พิกัดที่ตั้ง
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ละติจูด (Latitude)</p>
                    <p className="font-mono font-semibold text-secondary dark:text-white">{detailItem.latitude?.toFixed(6) || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ลองจิจูด (Longitude)</p>
                    <p className="font-mono font-semibold text-secondary dark:text-white">{detailItem.longitude?.toFixed(6) || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Assignment Info (Events only) */}
              {detailItem.type === 'event' && (
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border-2 border-purple-100">
                  <h3 className="font-bold text-lg text-secondary dark:text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    ผู้รับผิดชอบ
                  </h3>
                  <div className="space-y-3">
                    {detailItem.assignedUsers && detailItem.assignedUsers.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">พนักงานที่ถูกมอบหมาย</p>
                        <div className="flex flex-wrap gap-2">
                          {detailItem.assignedUsers.map(userId => {
                            const user = usersData.find(u => u.id === userId)
                            return user ? (
                              <span key={userId} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                {user.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                    {detailItem.assignedRoles && detailItem.assignedRoles.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">บทบาทที่ถูกมอบหมาย</p>
                        <div className="flex flex-wrap gap-2">
                          {detailItem.assignedRoles.map(role => (
                            <span key={role} className="bg-accent dark:bg-accent-orange text-primary dark:text-primary px-3 py-1 rounded-full text-sm font-medium">
                              {role === 'user' ? 'User' : role === 'manager' ? 'Manager' : role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailItem.assignedDepartments && detailItem.assignedDepartments.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">แผนกที่ถูกมอบหมาย</p>
                        <div className="flex flex-wrap gap-2">
                          {detailItem.assignedDepartments.map(dept => (
                            <span key={dept} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailItem.assignedPositions && detailItem.assignedPositions.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">ตำแหน่งที่ถูกมอบหมาย</p>
                        <div className="flex flex-wrap gap-2">
                          {detailItem.assignedPositions.map(pos => (
                            <span key={pos} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                              {pos}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!detailItem.assignedUsers || detailItem.assignedUsers.length === 0) &&
                     (!detailItem.assignedRoles || detailItem.assignedRoles.length === 0) &&
                     (!detailItem.assignedDepartments || detailItem.assignedDepartments.length === 0) &&
                     (!detailItem.assignedPositions || detailItem.assignedPositions.length === 0) && (
                      <p className="text-gray-500 text-sm italic">ไม่มีการกำหนดผู้รับผิดชอบ (เปิดให้ทุกคนเข้าถึงได้)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setDetailItem(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-accent dark:bg-accent-orange hover:bg-accent/80 dark:hover:bg-accent-orange/80 text-secondary dark:text-white rounded-lg font-medium transition-colors"
                >
                  ปิด
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setEditItem(detailItem)
                    setShowEditModal(true)
                  }}
                  className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  แก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary dark:text-white">
                {createType ? (createType === 'location' ? 'สร้างพื้นที่อนุญาตใหม่' : 'สร้างกิจกรรมใหม่') : 'เลือกประเภท'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateType(null)
                  setNewMarkerPosition(null)
                  setSearchMarkerPosition(null)
                  setSearchMarkerName('')
                }}
                className="text-gray-400 hover:text-secondary dark:text-white/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-accent dark:bg-accent-orange rounded-xl p-4 border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-secondary dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary dark:bg-primary text-white rounded-full flex items-center justify-center text-sm">1</span>
                  การสร้างพื้นที่/กิจกรรมใหม่
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 ml-8">
                  <li className="flex items-start gap-2">
                    <span className="text-primary dark:text-primary mt-1">•</span>
                    <span><strong>คลิกที่แผนที่</strong> เพื่อปักหมุดและสร้างพื้นที่/กิจกรรมใหม่</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary dark:text-primary mt-1">•</span>
                    <span><strong>ค้นหาสถานที่</strong> ด้วยช่องค้นหาบนแผนที่ แล้วคลิกผลลัพธ์</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary dark:text-primary mt-1">•</span>
                    <span>คลิกปุ่ม <strong>"สร้างพื้นที่/กิจกรรมที่นี่"</strong> ใน popup ที่ปรากฏ</span>
                  </li>
                </ul>
              </div>

              <div className="bg-accent dark:bg-accent-orange rounded-xl p-4 border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-secondary dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  การจัดการรายการ
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 ml-8">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>คลิกที่หมุด</strong> บนแผนที่จะพาไปยังรายการนั้นในลิสต์</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>ปุ่มแก้ไข</strong> สำหรับแก้ไขข้อมูลพื้นที่หรือกิจกรรม</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>ปุ่มลบ</strong> สำหรับลบรายการที่ไม่ต้องการ</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <h3 className="font-bold text-secondary dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  สัญลักษณ์บนแผนที่
                </h3>
                <div className="space-y-2 text-sm text-gray-700 ml-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span><strong>หมุดสีเขียว</strong> = พื้นที่อนุญาตให้เช็คอิน</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary dark:bg-primary rounded-full"></div>
                    <span><strong>หมุดสีน้ำเงิน</strong> = กิจกรรมพิเศษ</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span><strong>หมุดสีแดง</strong> = ตำแหน่งที่กำลังเลือก</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <h3 className="font-bold text-secondary dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm">💡</span>
                  เคล็ดลับ
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 ml-8">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>ใช้ <strong>แท็บกรอง</strong> เพื่อแสดงเฉพาะพื้นที่หรือกิจกรรม</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>สลับ <strong>มุมมองแผนที่/ดาวเทียม</strong> ได้ที่มุมบนขวา</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>คลิก <strong>"ลบหมุดค้นหา"</strong> เพื่อลบหมุดชั่วคราว</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-300 dark:border-white/20">
                <h3 className="font-bold text-secondary dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm">⌨️</span>
                  คีย์ลัด (Keyboard Shortcuts)
                </h3>
                <div className="space-y-2 text-sm text-gray-700 ml-8">
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-white border-2 border-gray-300 dark:border-white/20 rounded text-xs font-mono shadow-sm">ESC</kbd>
                    <span>ยกเลิกการแก้ไข/สร้าง</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-white border-2 border-gray-300 dark:border-white/20 rounded text-xs font-mono shadow-sm">Enter</kbd>
                    <span>บันทึกการแก้ไข/สร้าง</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-secondary dark:text-white">
                แก้ไข{editItem.type === 'location' ? 'พื้นที่อนุญาต' : 'กิจกรรม'}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditItem(null)
                }}
                className="text-gray-400 hover:text-secondary dark:text-white/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              <EditForm
                type={editItem.type}
                item={editItem}
                onSubmit={handleEdit}
                onCancel={() => {
                  setShowEditModal(false)
                  setEditItem(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-secondary dark:text-white">
                {createType ? (createType === 'location' ? 'สร้างพื้นที่อนุญาตใหม่' : 'สร้างกิจกรรมใหม่') : 'เลือกประเภท'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateType(null)
                  setNewMarkerPosition(null)
                  setSearchMarkerPosition(null)
                  setSearchMarkerName('')
                }}
                className="text-gray-400 hover:text-secondary dark:text-white/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              {!createType ? (
                // Type Selection
                <div className="space-y-4">
                  <p className="text-secondary dark:text-white/70 mb-6">เลือกประเภทที่ต้องการสร้างสำหรับตำแหน่งนี้:</p>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mb-6">
                    <div className="font-medium mb-1">พิกัด:</div>
                    <div className="font-mono">{newMarkerPosition ? `${newMarkerPosition[0].toFixed(6)}, ${newMarkerPosition[1].toFixed(6)}` : 'N/A'}</div>
                  </div>
                  <button
                    onClick={() => setCreateType('location')}
                    className="w-full bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-lg"
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg mb-1">พื้นที่อนุญาต</div>
                      <div className="text-sm opacity-90">กำหนดพื้นที่ที่พนักงานสามารถเช็คอินได้</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setCreateType('event')}
                    className="w-full bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-white px-6 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-lg"
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg mb-1">กิจกรรม</div>
                      <div className="text-sm opacity-90">สร้างกิจกรรมพิเศษที่มีวันที่กำหนด</div>
                    </div>
                  </button>
                </div>
              ) : (
                // Form
                <CreateForm
                  type={createType}
                  position={newMarkerPosition}
                  onSubmit={handleCreate}
                  onCancel={() => {
                    setCreateType(null)
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary dark:text-white">ตั้งค่าพื้นที่และกิจกรรม</h1>
            <p className="text-sm text-secondary dark:text-white/70 mt-1">
              กำหนดพื้นที่อนุญาตและกิจกรรมต่างๆที่พนักงานต้องเช็คเข้างาน
            </p>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent dark:bg-accent-orange hover:bg-accent dark:bg-accent-orange text-primary dark:text-primary rounded-lg transition-colors font-medium text-sm border border-gray-200 dark:border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            วิธีใช้งาน
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-full mx-auto">
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Left Side - Map */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden relative">
            {/* Clear Search Marker Button - Top Left (if marker exists) */}
            {searchMarkerPosition && (
              <div className="absolute top-20 left-14 z-[1001] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSearchMarkerPosition(null)
                    setSearchMarkerName('')
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg font-medium text-xs transition-all flex items-center gap-2 border border-red-600"
                  title="ลบหมุดค้นหา"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  ลบหมุดค้นหา
                </button>
                {searchMarkerName && (
                  <div className="bg-white rounded-lg shadow-lg px-3 py-2 border border-gray-200 max-w-[160px]">
                    <p className="text-xs text-gray-500 mb-1 font-medium">ตำแหน่งปัจจุบัน</p>
                    <p className="text-xs text-secondary dark:text-white font-medium line-clamp-2">{searchMarkerName.split(',')[0]}</p>
                  </div>
                )}
              </div>
            )}

            {/* Map Search Box - Top Left */}
            <div className="absolute top-4 left-14 z-[1000] w-60">
              <div className="relative">
                <input
                  type="text"
                  value={mapSearchQuery}
                  onChange={(e) => setMapSearchQuery(e.target.value)}
                  placeholder="ค้นหาสถานที่บนแผนที่..."
                  className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-xl shadow-lg focus:border-primary dark:focus:border-primary focus:outline-none transition-colors text-sm"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isSearchingMap && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary dark:border-primary"></div>
                  </div>
                )}
                {mapSearchQuery && !isSearchingMap && (
                  <button
                    onClick={() => {
                      setMapSearchQuery('')
                      setMapSearchResults([])
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary dark:text-white/70"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {mapSearchResults.length > 0 && (
                <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                  {mapSearchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const lat = parseFloat(result.lat)
                        const lon = parseFloat(result.lon)
                        
                        // Set marker position and name (FlyToLocation component will handle the animation)
                        setSearchMarkerPosition([lat, lon])
                        setSearchMarkerName(result.formatted_name || result.display_name)
                        
                        // Clear search
                        setMapSearchQuery('')
                        setMapSearchResults([])
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-accent dark:hover:bg-accent-orange/30 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-secondary dark:text-white">{result.formatted_name || result.display_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        พิกัด: {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map Type Toggle Button - Top Right */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={() => setMapType(mapType === 'default' ? 'satellite' : 'default')}
                className="bg-white hover:bg-accent dark:hover:bg-accent-orange text-secondary dark:text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-all flex items-center gap-2 border border-gray-200"
                title={mapType === 'default' ? 'สลับเป็นมุมมองดาวเทียม' : 'สลับเป็นมุมมองแผนที่'}
              >
                {mapType === 'default' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>ดาวเทียม</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                    </svg>
                    <span>แผนที่</span>
                  </>
                )}
              </button>

              {/* Stats Badge */}
              <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 min-w-[150px]">
                <div className="text-xs text-gray-500 mb-2 font-medium">หมุดทั้งหมด</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-green-50 px-2 py-1.5 rounded-md">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0"></span>
                    <div className="flex flex-col">
                      <span className="text-xs text-green-600 font-medium">พื้นที่อนุญาต</span>
                      <span className="text-lg font-bold text-green-700">{locations.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-accent dark:bg-accent-orange px-2 py-1.5 rounded-md">
                    <span className="w-2.5 h-2.5 bg-primary dark:bg-primary rounded-full flex-shrink-0"></span>
                    <div className="flex flex-col">
                      <span className="text-xs text-primary dark:text-primary font-medium">กิจกรรม</span>
                      <span className="text-lg font-bold text-primary dark:text-primary">{events.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution={getTileLayerAttribution()}
                url={getTileLayerUrl()}
              />

              {/* Auto-fit bounds to show all markers (disabled when flying to search marker) */}
              <FitBoundsToMarkers 
                locations={[...locations, ...events]} 
                disabled={isFlying || searchMarkerPosition !== null}
              />

              {/* Map click handler */}
              <MapClickHandler onMapClick={handleMapClick} />

              {/* Fly to search location when marker position changes */}
              <FlyToLocation 
                position={searchMarkerPosition}
                onFlyStart={() => setIsFlying(true)}
                onFlyEnd={() => setIsFlying(false)}
              />

              {/* Temporary Search Marker (Red) */}
              {searchMarkerPosition && (
                <SearchMarker 
                  position={searchMarkerPosition} 
                  name={searchMarkerName}
                  onClick={handleSearchMarkerClick}
                />
              )}

              {/* Location Markers (Green) */}
              {filteredLocations.map((location) => (
                <React.Fragment key={`location-${location.id}`}>
                  <Marker
                    position={[location.latitude, location.longitude]}
                    icon={locationIcon}
                    eventHandlers={{
                      click: () => {
                        // Scroll to the item in the list and highlight it
                        const itemElement = document.querySelector(`[data-item-id="location-${location.id}"]`)
                        if (itemElement) {
                          itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          // Add highlight effect
                          itemElement.classList.add('ring-4', 'ring-green-400', 'ring-opacity-50')
                          setTimeout(() => {
                            itemElement.classList.remove('ring-4', 'ring-green-400', 'ring-opacity-50')
                          }, 2000)
                        }
                      }
                    }}
                  />
                  <Circle
                    center={[location.latitude, location.longitude]}
                    radius={location.radius}
                    pathOptions={{
                      color: 'green',
                      fillColor: 'green',
                      fillOpacity: 0.2
                    }}
                  />
                </React.Fragment>
              ))}

              {/* Event Markers (Blue) */}
              {filteredEvents.map((event) => (
                <React.Fragment key={`event-${event.id}`}>
                  <Marker
                    position={[event.latitude, event.longitude]}
                    icon={eventIcon}
                    eventHandlers={{
                      click: () => {
                        // Scroll to the item in the list and highlight it
                        const itemElement = document.querySelector(`[data-item-id="event-${event.id}"]`)
                        if (itemElement) {
                          itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          // Add highlight effect
                          itemElement.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50')
                          setTimeout(() => {
                            itemElement.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50')
                          }, 2000)
                        }
                      }
                    }}
                  />
                  <Circle
                    center={[event.latitude, event.longitude]}
                    radius={event.radius}
                    pathOptions={{
                      color: event.status === 'ongoing' ? 'blue' : 'gray',
                      fillColor: event.status === 'ongoing' ? 'blue' : 'gray',
                      fillOpacity: 0.2
                    }}
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>

          {/* Right Panel - List View */}
          <div className="w-[480px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-gray-200">
            {/* Header with Search and Tabs */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาพื้นที่หรือกิจกรรม..."
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-xl focus:border-primary dark:focus:border-primary focus:outline-none transition-colors text-sm"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary dark:text-white/70"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Tab Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-primary dark:bg-primary text-white'
                      : 'bg-accent dark:bg-accent-orange text-secondary dark:text-white hover:bg-accent/80 dark:hover:bg-accent-orange/80'
                  }`}
                >
                  ทั้งหมด ({locations.length + events.length})
                </button>
                <button
                  onClick={() => setActiveTab('locations')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'locations'
                      ? 'bg-green-500 text-white'
                      : 'bg-accent dark:bg-accent-orange text-secondary dark:text-white hover:bg-accent/80 dark:hover:bg-accent-orange/80'
                  }`}
                >
                  พื้นที่ ({locations.length})
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'events'
                      ? 'bg-primary dark:bg-primary text-white'
                      : 'bg-accent dark:bg-accent-orange text-secondary dark:text-white hover:bg-accent/80 dark:hover:bg-accent-orange/80'
                  }`}
                >
                  กิจกรรม ({events.length})
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredItems.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">ไม่พบข้อมูล</p>
                </div>
              )}

              {filteredItems.map((item) => {
                const isOpen = openIds.includes(item.id)
                const isLocation = item.type === 'location'
                
                return (
                  <div
                    key={item.uniqueKey}
                    data-item-id={`${item.type}-${item.id}`}
                    className={`relative rounded-xl p-4 border-2 shadow-sm transition-colors ${
                      isLocation 
                        ? 'border-gray-200 dark:border-white/10 bg-white dark:bg-secondary/95' 
                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-secondary/95'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold mb-2 ${
                          isLocation 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-accent dark:bg-accent-orange text-primary dark:text-primary'
                        }`}>
                          {isLocation ? 'พื้นที่' : 'กิจกรรม'}
                        </div>
                        <h3 className="font-bold text-lg text-secondary dark:text-white mb-1">{item.name}</h3>
                        <p className="text-xs text-secondary dark:text-white/70 line-clamp-2">{item.description}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        item.status === 'active' || item.status === 'ongoing'
                          ? isLocation 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-accent dark:bg-accent-orange text-primary dark:text-primary'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {isLocation 
                          ? (item.status === 'active' ? '✓ ใช้งาน' : '✕ ปิด')
                          : item.status === 'ongoing' 
                          ? '● ดำเนินการ' 
                          : '○ สิ้นสุด'
                        }
                      </span>
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center gap-4 text-xs text-secondary dark:text-white/70 mb-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">รัศมี:</span>
                        <span>{item.radius}ม.</span>
                      </div>
                      {!isLocation && item.locationName && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">สถานที่:</span>
                          <span className="truncate">{item.locationName}</span>
                        </div>
                      )}
                      {!isLocation && item.date && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">วันที่เริ่ม:</span>
                          <span>{item.date}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setDetailItem(item);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-2 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        title="ดูรายละเอียด"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        ดู
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditItem(item);
                          setShowEditModal(true);
                        }}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        title="แก้ไข"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        แก้ไข
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.type); }}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        title="ลบ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Details Section (Collapsible) */}
                    <div
                      ref={el => {
                        if (el && !el.dataset.attInit) {
                          el.style.overflow = 'hidden'
                          el.style.maxHeight = '0px'
                          el.style.opacity = '0'
                          el.style.transition = 'max-height 320ms cubic-bezier(.4,0,.2,1), opacity 220ms ease'
                          el.dataset.attInit = '1'
                        }
                        wrapperRefs.current[item.id] = el
                      }}
                      className="mt-3"
                    >
                      <div
                        ref={el => {
                          if (el && !el.dataset.attInnerInit) {
                            el.style.transform = 'translateY(-6px)'
                            el.style.opacity = '0'
                            el.style.transition = 'transform 260ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease'
                            el.dataset.attInnerInit = '1'
                          }
                          innerRefs.current[item.id] = el
                        }}
                        className="bg-white rounded-lg p-3 border border-gray-200 space-y-3"
                      >
                        {/* Coordinates/Location Info */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-2 font-medium">
                            {isLocation ? 'พิกัดที่ตั้ง' : 'ข้อมูลเพิ่มเติม'}
                          </p>
                          {isLocation ? (
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-xs">Lat:</span>
                                <span className="text-gray-700 font-mono text-xs">{item.latitude}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-xs">Lng:</span>
                                <span className="text-gray-700 font-mono text-xs">{item.longitude}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-xs">สถานที่:</span>
                                <span className="text-gray-700 text-xs">{item.locationName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-xs">วันที่:</span>
                                <span className="text-gray-700 text-xs">{item.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-xs">พิกัด:</span>
                                <span className="text-gray-700 font-mono text-xs">{item.latitude}, {item.longitude}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* View on Map Button */}
                        <button
                          onClick={() => {
                            const mapElement = document.querySelector('.leaflet-container')
                            if (mapElement && mapElement._leaflet_map) {
                              const map = mapElement._leaflet_map
                              const position = [item.latitude, item.longitude]
                              
                              // Get map container dimensions
                              const container = map.getContainer()
                              const containerWidth = container.offsetWidth
                              
                              // Calculate the visible map area (excluding right panel)
                              const rightPanelWidth = 504 // 480px panel + 24px gap
                              const visibleMapWidth = containerWidth - rightPanelWidth
                              const visibleCenterX = visibleMapWidth / 2
                              const containerCenterX = containerWidth / 2
                              const offsetPixelsX = visibleCenterX - containerCenterX
                              
                              // Convert pixel offset to lat/lng offset at zoom 16
                              const targetZoom = 16
                              const markerPoint = map.project(position, targetZoom)
                              const adjustedPoint = L.point(markerPoint.x - offsetPixelsX, markerPoint.y)
                              const adjustedPosition = map.unproject(adjustedPoint, targetZoom)
                              
                              // Fly to adjusted position
                              map.flyTo(adjustedPosition, targetZoom, { animate: true, duration: 1.0 })
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                            isLocation
                              ? 'bg-green-100 hover:bg-green-200 text-green-700'
                              : 'bg-accent dark:bg-accent-orange hover:bg-accent dark:hover:bg-accent-orange/50 text-primary dark:text-primary'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          ดูบนแผนที่
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MappingAndEvents
