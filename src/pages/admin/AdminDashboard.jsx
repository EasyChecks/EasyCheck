import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, LayersControl, useMap, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useLocations } from '../../contexts/LocationContext'
import { useEvents } from '../../contexts/EventContext'
import { mockAttendanceStats } from '../../data/usersData'

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

// Component to auto-fit bounds to show all markers
function FitBoundsToMarkers({ locations }) {
  const map = useMap()

  useEffect(() => {
    if (locations && locations.length > 0) {
      // Create bounds from all location coordinates
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      )

      // Fit map to bounds with appropriate padding and zoom
      map.fitBounds(bounds, {
        padding: [80, 80], // เพิ่ม padding ให้เห็นหมุดทุกอันชัดเจน
        maxZoom: 15, // ลด maxZoom ให้เห็นภาพรวมดีขึ้น
        animate: true,
        duration: 0.5
      })
    }
  }, [locations, map])

  return null
}

function AdminDashboard() {
  // Use Location Context (for Mapping locations)
  const { locations } = useLocations()
  // Use Event Context (for Event locations)
  const { events } = useEvents()

  const [expandedLocationIds, setExpandedLocationIds] = useState([]) // Track which locations are expanded
  const [selectedDetailType, setSelectedDetailType] = useState(null) // 'absent', 'late', 'leave'
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filterType, setFilterType] = useState('all') // 'all', 'location', 'event'
  const locationRefs = useRef({}) // Refs for scrolling to location cards

  // ใช้ Mock Data จาก usersData.js
  const attendanceStats = mockAttendanceStats

  // Combine locations from both Mapping and Events
  const mappingLocations = locations.map((loc, index) => ({
    ...loc,
    type: 'mapping',
    team: loc.team || ['ทีมพัฒนา', 'ทีมการตลาด', 'ทีมปฏิบัติการ'][index % 3],
    time: loc.time || ['09:15 น.', '09:32 น.', '08:45 น.'][index % 3],
    checkInStatus: 'พื้นที่อนุญาต',
    statusColor: 'text-green-600'
  }))

  const eventLocations = events.map((evt, index) => ({
    id: `event-${evt.id}-${evt.date}-${index}`,
    name: evt.locationName,
    description: `งาน: ${evt.name}`,
    latitude: evt.latitude,
    longitude: evt.longitude,
    radius: evt.radius,
    status: evt.status,
    type: 'event',
    team: evt.teams ? evt.teams.join(', ') : 'ไม่ระบุ',
    time: evt.startTime || 'ไม่ระบุ',
    checkInStatus: 'พื้นที่กิจกรรม',
    statusColor: 'text-primary'
  }))

  // Combine all locations
  const locationsWithStatus = [...mappingLocations, ...eventLocations]

  // Filter locations based on selected filter
  const filteredLocations = filterType === 'all' 
    ? locationsWithStatus 
    : filterType === 'location'
    ? mappingLocations
    : eventLocations

  // Toggle location details - without scrolling
  const toggleLocationDetails = (locationId) => {
    setExpandedLocationIds(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    )
  }

  // Handle view details button click - scroll within list container only
  const handleViewDetails = (locationId) => {
    // Expand the location if not already expanded
    if (!expandedLocationIds.includes(locationId)) {
      setExpandedLocationIds(prev => [...prev, locationId])
    }

    // Scroll to the card within the list container (not the whole page)
    setTimeout(() => {
      const element = locationRefs.current[locationId]
      if (element) {
        // Find the scrollable container (the list div)
        const scrollContainer = element.closest('.overflow-y-auto')
        
        if (scrollContainer) {
          const elementTop = element.offsetTop
          const containerTop = scrollContainer.scrollTop
          const containerHeight = scrollContainer.clientHeight
          const elementHeight = element.clientHeight

          // Calculate position to center the element in the container
          const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2)

          scrollContainer.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          })

          // Add highlight effect
          element.classList.add('ring-4', 'ring-primary')
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-primary')
          }, 2000)
        }
      }
    }, 100) // Small delay to let expansion animation start
  }

  const defaultCenter = [13.7606, 100.5034]

  return (
    <div className="h-full bg-accent overflow-y-auto">

      {/* Main Content */}
      <main className="px-6 py-8 max-w-8xl mx-auto">
        {/* Section 1: Stats Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary">
              สถิติการเข้างาน
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Absent Count */}
            <button
              onClick={() => {
                setSelectedDetailType('absent')
                setShowDetailModal(true)
              }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-red-500 transition-all hover:shadow-lg text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#dc2626">
                    <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-secondary text-sm mb-1">คนขาดงาน</h3>
              <p className="text-4xl font-bold text-red-600">{attendanceStats.absentCount}</p>
              <p className="text-xs text-gray-500 mt-2">คลิกเพื่อดูรายละเอียด</p>
            </button>

            {/* Late Count */}
            <button
              onClick={() => {
                setSelectedDetailType('late')
                setShowDetailModal(true)
              }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-yellow-500 transition-all hover:shadow-lg text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#eab308">
                    <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-secondary text-sm mb-1">คนมาสาย</h3>
              <p className="text-4xl font-bold text-yellow-600">{attendanceStats.lateCount}</p>
              <p className="text-xs text-gray-500 mt-2">คลิกเพื่อดูรายละเอียด</p>
            </button>

            {/* Leave Count */}
            <button
              onClick={() => {
                setSelectedDetailType('leave')
                setShowDetailModal(true)
              }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#2563eb">
                    <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-secondary text-sm mb-1">คนลางาน</h3>
              <p className="text-4xl font-bold text-blue-600">{attendanceStats.leaveCount}</p>
              <p className="text-xs text-gray-500 mt-2">คลิกเพื่อดูรายละเอียด</p>
            </button>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-secondary">
                  {selectedDetailType === 'absent' && 'รายชื่อคนขาดงาน'}
                  {selectedDetailType === 'late' && 'รายชื่อคนมาสาย'}
                  {selectedDetailType === 'leave' && 'รายชื่อคนลางาน'}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
                <p className="text-center text-gray-500 py-8">
                  ฟีเจอร์นี้จะแสดงรายละเอียดพนักงานในอนาคต
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Permitted Area */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-secondary">พื้นที่และกิจกรรม</h2>
              <p className="text-sm text-gray-600 mt-1">ภาพรวมพื้นที่อนุญาตและกิจกรรมทั้งหมด</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent-orange text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/30">
                📍 {locations.length} พื้นที่
              </div>
              <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium border border-blue-300">
                📅 {events.length} กิจกรรม
              </div>
            </div>
          </div>

          <div className="flex gap-6 h-[calc(100vh-400px)] min-h-[600px] relative z-0">
            {/* Left Side - Map */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden relative border border-gray-200">
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
                <FitBoundsToMarkers locations={filteredLocations} />

                {filteredLocations.map((location) => (
                  <React.Fragment key={`marker-${location.id}-${location.type}`}>
                    <Marker
                      position={[location.latitude, location.longitude]}
                      icon={location.type === 'event' ? eventIcon : locationIcon}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${location.type === 'event' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                            <h3 className="font-bold text-secondary">{location.name}</h3>
                          </div>
                          <p className={`text-xs font-medium mb-2 ${location.type === 'event' ? 'text-blue-600' : 'text-green-600'}`}>
                            {location.checkInStatus}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">{location.description}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <span>📍</span>
                              <span>{location.type === 'event' ? 'จากกิจกรรม' : 'จากตั้งค่าแผนที่'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>🎯</span>
                              <span>รัศมี: {location.radius} เมตร</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewDetails(location.id)}
                            className="mt-3 w-full bg-primary hover:bg-primary/90 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors"
                          >
                            ดูรายละเอียด
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={[location.latitude, location.longitude]}
                      radius={location.radius}
                      pathOptions={{
                        color: location.type === 'event' ? '#2563eb' : '#22c55e',
                        fillColor: location.type === 'event' ? '#2563eb' : '#22c55e',
                        fillOpacity: 0.2
                      }}
                    />
                  </React.Fragment>
                ))}
              </MapContainer>

              {/* Map legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">สถานะ</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">พื้นที่อนุญาต</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-600">กิจกรรม</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - List */}
            <div className="w-[400px] bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              {/* Header with Filter Tabs */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => setFilterType('all')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      filterType === 'all' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-secondary hover:bg-gray-200'
                    }`}
                  >
                    ทั้งหมด ({locationsWithStatus.length})
                  </button>
                  <button 
                    onClick={() => setFilterType('location')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      filterType === 'location' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-secondary hover:bg-gray-200'
                    }`}
                  >
                    พื้นที่ ({locations.length})
                  </button>
                  <button 
                    onClick={() => setFilterType('event')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      filterType === 'event' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-secondary hover:bg-gray-200'
                    }`}
                  >
                    กิจกรรม ({events.length})
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  คลิกที่การ์ดเพื่อดูรายละเอียดเพิ่มเติม
                </p>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredLocations.map((location) => {
                  const isExpanded = expandedLocationIds.includes(location.id)

                  return (
                    <div
                      key={`card-${location.id}-${location.type}`}
                      ref={(el) => (locationRefs.current[location.id] = el)}
                      className={`bg-accent border ${
                        location.type === 'event'
                          ? 'border-blue-200'
                          : 'border-green-200'
                      } rounded-xl overflow-hidden transition-all hover:shadow-md cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLocationDetails(location.id)
                      }}
                    >
                      {/* Header - Always Visible */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 ${location.type === 'event' ? 'bg-blue-500' : 'bg-green-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-secondary text-sm truncate">{location.name}</h3>
                              <p className={`text-xs font-medium ${location.type === 'event' ? 'text-blue-600' : 'text-green-600'}`}>
                                {location.checkInStatus}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {location.description}
                              </p>
                            </div>
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="20px"
                            viewBox="0 -960 960 960"
                            width="20px"
                            fill="currentColor"
                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-gray-400 flex-shrink-0`}
                          >
                            <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                          </svg>
                        </div>
                      </div>

                      {/* Details - Expandable */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="px-4 pb-4 space-y-2 border-t border-gray-200 pt-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500">ทีม</p>
                              <p className="font-semibold text-secondary">{location.team}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">เวลา</p>
                              <p className="font-semibold text-secondary">{location.time}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">รัศมี</p>
                              <p className="font-semibold text-secondary">{location.radius} ม.</p>
                            </div>
                            <div>
                              <p className="text-gray-500">สถานะ</p>
                              <p className={`font-semibold ${location.type === 'event' ? 'text-blue-600' : 'text-green-600'}`}>
                                {location.type === 'event' ? 'กิจกรรม' : 'พื้นที่'}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2">
                            <p className="text-gray-500 text-xs mb-1">พิกัด</p>
                            <p className="text-xs font-mono text-gray-700">
                              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard