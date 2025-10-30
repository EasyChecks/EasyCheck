import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useLocations } from '../../contexts/LocationContext'
import { useEvents } from '../../contexts/EventContext'

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
    >
      <Popup autoClose={false} closeOnClick={false}>
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h3 className="font-bold text-gray-800">{name === 'ตำแหน่งใหม่' ? 'ตำแหน่งที่เลือก' : 'ผลการค้นหา'}</h3>
          </div>
          <p className="text-xs text-gray-600 mb-2">{name}</p>
          <div className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
            <div className="font-medium mb-1">พิกัด:</div>
            <div className="font-mono">{position[0].toFixed(6)}, {position[1].toFixed(6)}</div>
          </div>
          <button
            onClick={onClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 rounded-lg text-xs font-medium transition-colors"
          >
            สร้างพื้นที่/กิจกรรมที่นี่
          </button>
        </div>
      </Popup>
    </Marker>
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
    endDate: ''
  })

  const startDateRef = useRef(null)
  const endDateRef = useRef(null)

  // Helper function to pad numbers with zero
  const pad = (n) => n.toString().padStart(2, '0')

  // Helper function to normalize date input to DD/MM/YYYY
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
    }
    
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ชื่อ{type === 'location' ? 'พื้นที่' : 'กิจกรรม'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          placeholder={`ระบุชื่อ${type === 'location' ? 'พื้นที่' : 'กิจกรรม'}`}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบาย
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
          rows="3"
          placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
        />
      </div>

      {/* Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center font-medium"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">ระยะทางที่อนุญาตให้เช็คอินได้จากจุดนี้</p>
      </div>

      {/* Event specific fields */}
      {type === 'event' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อสถานที่
            </label>
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="เช่น โรงแรม ABC, งานเทศกาล XYZ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
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
                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
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
                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
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
        </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          ย้อนกลับ
        </button>
        <button
          type="submit"
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors text-white ${
            type === 'location'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          สร้าง{type === 'location' ? 'พื้นที่' : 'กิจกรรม'}
        </button>
      </div>
    </form>
  )
}

function MappingAndEvents() {
  const { locations, deleteLocation, addLocation } = useLocations()
  const { events, deleteEvent, addEvent } = useEvents()
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
    if (activeTab === 'locations') return filteredLocations.map(loc => ({ ...loc, type: 'location' }))
    if (activeTab === 'events') return filteredEvents.map(evt => ({ ...evt, type: 'event' }))
    return [
      ...filteredLocations.map(loc => ({ ...loc, type: 'location' })),
      ...filteredEvents.map(evt => ({ ...evt, type: 'event' }))
    ]
  }

  const filteredItems = getFilteredItems()

  // Search map locations using Nominatim API
  const searchMapLocation = async (query) => {
    if (!query.trim()) {
      setMapSearchResults([])
      return
    }

    setIsSearchingMap(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=th`
      )
      const data = await response.json()
      setMapSearchResults(data)
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
        const newId = locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1
        addLocation({
          id: newId,
          ...formData,
          latitude: newMarkerPosition[0],
          longitude: newMarkerPosition[1],
          status: 'active'
        })
      } else if (createType === 'event') {
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1
        
        // ถ้าวันที่อยู่ในรูปแบบ DD/MM/YYYY อยู่แล้ว ใช้เลย
        // ถ้าไม่ใช่ ให้แปลง
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
        
        addEvent({
          id: newId,
          ...formData,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          date: formattedStartDate, // Keep for compatibility
          latitude: newMarkerPosition[0],
          longitude: newMarkerPosition[1],
          status: 'ongoing',
          teams: []
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

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
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
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!createType ? (
                // Type Selection
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6">เลือกประเภทที่ต้องการสร้างสำหรับตำแหน่งนี้:</p>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mb-6">
                    <div className="font-medium mb-1">พิกัด:</div>
                    <div className="font-mono">{newMarkerPosition ? `${newMarkerPosition[0].toFixed(6)}, ${newMarkerPosition[1].toFixed(6)}` : 'N/A'}</div>
                  </div>
                  <button
                    onClick={() => setCreateType('location')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg mb-1">พื้นที่อนุญาต</div>
                      <div className="text-sm opacity-90">กำหนดพื้นที่ที่พนักงานสามารถเช็คอินได้</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setCreateType('event')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
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
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าพื้นที่และกิจกรรม</h1>
        <p className="text-sm text-gray-600 mt-1">
          กำหนดพื้นที่อนุญาตและกิจกรรมต่างๆที่พนักงานต้องเช็คเข้างาน
        </p>
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
                    <p className="text-xs text-gray-800 font-medium line-clamp-2">{searchMarkerName.split(',')[0]}</p>
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
                  className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-xl shadow-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {mapSearchQuery && !isSearchingMap && (
                  <button
                    onClick={() => {
                      setMapSearchQuery('')
                      setMapSearchResults([])
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {mapSearchResults.length > 0 && (
                <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                  {mapSearchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const lat = parseFloat(result.lat)
                        const lon = parseFloat(result.lon)
                        
                        // Set marker position and name (FlyToLocation component will handle the animation)
                        setSearchMarkerPosition([lat, lon])
                        setSearchMarkerName(result.display_name)
                        
                        // Clear search
                        setMapSearchQuery('')
                        setMapSearchResults([])
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-gray-800">{result.display_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
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
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-all flex items-center gap-2 border border-gray-200"
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
                  <div className="flex items-center gap-2 bg-blue-50 px-2 py-1.5 rounded-md">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <div className="flex flex-col">
                      <span className="text-xs text-blue-600 font-medium">กิจกรรม</span>
                      <span className="text-lg font-bold text-blue-700">{events.length}</span>
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
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <h3 className="font-bold text-gray-800">{location.name}</h3>
                        </div>
                        <p className="text-xs font-medium mb-2 text-green-600">พื้นที่อนุญาต</p>
                        <p className="text-xs text-gray-600 mb-2">{location.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">รัศมี:</span>
                            <span>{location.radius} เมตร</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">สถานะ:</span>
                            <span>{location.status === 'active' ? 'กำลังใช้งาน' : 'ไม่ได้ใช้งาน'}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
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
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${event.status === 'ongoing' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                          <h3 className="font-bold text-gray-800">{event.name}</h3>
                        </div>
                        <p className={`text-xs font-medium mb-2 ${event.status === 'ongoing' ? 'text-blue-600' : 'text-gray-600'}`}>
                          กิจกรรม - {event.status === 'ongoing' ? 'เริ่มงานแล้ว' : 'เสร็จสิ้น'}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">สถานที่:</span>
                            <span>{event.locationName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">วันที่:</span>
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">รัศมี:</span>
                            <span>{event.radius} เมตร</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
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
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm"
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ทั้งหมด ({locations.length + events.length})
                </button>
                <button
                  onClick={() => setActiveTab('locations')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'locations'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  พื้นที่ ({locations.length})
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'events'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    key={`${item.type}-${item.id}`}
                    className={`relative rounded-xl p-4 border-2 shadow-sm transition-all duration-200 ${
                      isLocation 
                        ? 'border-green-100 bg-gradient-to-br from-green-50/50 to-white' 
                        : 'border-blue-100 bg-gradient-to-br from-blue-50/50 to-white'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold mb-2 ${
                          isLocation 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isLocation ? 'พื้นที่' : 'กิจกรรม'}
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        item.status === 'active' || item.status === 'ongoing'
                          ? isLocation 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isLocation 
                          ? (item.status === 'active' ? '✓ ใช้งาน' : '✕ ปิด')
                          : (item.status === 'ongoing' ? '● ดำเนินการ' : '○ สิ้นสุด')
                        }
                      </span>
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3 flex-wrap">
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
                          <span className="font-medium">วันที่:</span>
                          <span>{item.date}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleDetails(item.id); }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isLocation
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isOpen ? 'ซ่อน' : 'รายละเอียด'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.type); }}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
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
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
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
