import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useLocations } from '../../contexts/LocationContext'
import { useEvents } from '../../contexts/EventContext'
import Mapping from './Mapping'
import EventManagement from './EventManagement'

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

// Component to auto-fit bounds
function FitBoundsToMarkers({ locations }) {
  const map = useMap()

  React.useEffect(() => {
    if (locations && locations.length > 0) {
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
  }, [locations, map])

  return null
}

function MappingAndEvents() {
  const { locations, deleteLocation } = useLocations()
  const { events, deleteEvent } = useEvents()
  const [activeTab, setActiveTab] = useState('locations') // 'locations' or 'events'
  const [scrollToLocationId, setScrollToLocationId] = useState(null)
  const [scrollToEventId, setScrollToEventId] = useState(null)
  const [mapType, setMapType] = useState('default') // 'default' or 'satellite'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null) // For showing details in sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false) // Control sidebar visibility

  const defaultCenter = [13.7606, 100.5034]

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

  // Handle view details from map popup
  const handleViewLocationDetails = (locationId) => {
    const location = locations.find(loc => loc.id === locationId)
    setSelectedItem({ type: 'location', data: location })
    setActiveTab('locations')
    setSidebarOpen(true) // Open sidebar when viewing details
  }

  const handleViewEventDetails = (eventId) => {
    const event = events.find(evt => evt.id === eventId)
    setSelectedItem({ type: 'event', data: event })
    setActiveTab('events')
    setSidebarOpen(true) // Open sidebar when viewing details
  }

  // Handle item click from sidebar list
  const handleItemClick = (item, type) => {
    setSelectedItem({ type, data: item })
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
        setSelectedItem(null) // Clear selection after delete
      } catch (error) {
        console.error('Error deleting:', error)
        alert('เกิดข้อผิดพลาดในการลบ')
      }
    }
  }

  // Close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false)
    setSelectedItem(null)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าพื้นที่และกิจกรรม</h1>
        <p className="text-sm text-gray-600 mt-1">
          กำหนดพื้นที่อนุญาตและกิจกรรมต่างๆที่พนักงานต้องเช็คเข้างาน
        </p>
      </div>

      {/* Main Content - Google Maps Style Layout */}
      <div className="px-6 py-6 max-w-full mx-auto">
        <div className="flex gap-4 h-[calc(100vh-180px)] relative">
          {/* Left Sidebar - Detail View (Hidden by default) */}
          <div className={`w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 absolute left-0 top-0 bottom-0 z-[999] border-r-2 border-gray-100 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Close Button */}
            <div className="absolute top-5 right-7 z-10">
              <button
                onClick={closeSidebar}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Search Box */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาพื้นที่หรือกิจกรรม..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm"
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
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedItem ? (
                <div>
                  {/* Header */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 ${
                      selectedItem.type === 'location' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedItem.type === 'location' ? '📍 พื้นที่อนุญาต' : '📅 กิจกรรม'}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedItem.data.name}</h2>
                    <p className="text-sm text-gray-600">{selectedItem.data.description}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">สถานะ</p>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            selectedItem.data.status === 'active' || selectedItem.data.status === 'ongoing'
                              ? selectedItem.type === 'location' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {selectedItem.type === 'location' 
                              ? (selectedItem.data.status === 'active' ? '✓ ใช้งาน' : '✕ ปิด')
                              : (selectedItem.data.status === 'ongoing' ? '● กำลังดำเนินการ' : '○ เสร็จสิ้น')
                            }
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">รัศมี</p>
                          <p className="text-sm font-semibold text-gray-800">🎯 {selectedItem.data.radius} เมตร</p>
                        </div>
                      </div>
                    </div>

                    {selectedItem.type === 'event' && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-2">ข้อมูลเพิ่มเติม</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span className="text-gray-700">{selectedItem.data.locationName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span className="text-gray-700">{selectedItem.data.date}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedItem.type === 'location' && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-2">พิกัด</p>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Lat:</span>
                            <span className="text-gray-700 font-mono">{selectedItem.data.latitude}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Lng:</span>
                            <span className="text-gray-700 font-mono">{selectedItem.data.longitude}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleDelete(selectedItem.data.id, selectedItem.type)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      ลบ{selectedItem.type === 'location' ? 'พื้นที่' : 'กิจกรรม'}นี้
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-gray-500">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">คลิกที่หมุดบนแผนที่เพื่อดูรายละเอียด</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Box - Floating over map */}
          <div className={`absolute top-4 z-[998] w-80 transition-all duration-300 ${
            sidebarOpen ? 'left-[416px]' : 'left-4'
          }`}>
            <div className="relative ml-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาพื้นที่หรือกิจกรรม..."
                className="w-full pl-10 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
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
            {/* Search results indicator */}
            {searchQuery && (
              <div className="mt-2 bg-white rounded-lg shadow-lg p-3 text-sm border border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-600 font-medium">ผลการค้นหา:</span>
                  <span className="inline-flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-semibold text-green-700">{filteredLocations.length}</span>
                    <span className="text-green-600 text-xs">พื้นที่</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-semibold text-blue-700">{filteredEvents.length}</span>
                    <span className="text-blue-600 text-xs">กิจกรรม</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Map */}
          <div className={`flex-1 bg-white rounded-2xl shadow-lg overflow-hidden relative transition-all duration-300 ${
            sidebarOpen ? 'ml-[400px]' : 'ml-0'
          }`}>
            {/* Map Type Toggle Button */}
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
              <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">แสดงทั้งหมด</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-semibold text-gray-700">{locations.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm font-semibold text-gray-700">{events.length}</span>
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

              {/* Auto-fit bounds to show all markers */}
              <FitBoundsToMarkers locations={[...locations, ...events]} />

              {/* Location Markers (Green) - Only show filtered results */}
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
                            <span>🎯</span>
                            <span>รัศมี: {location.radius} เมตร</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{location.status === 'active' ? '✅' : '❌'}</span>
                            <span>{location.status === 'active' ? 'กำลังใช้งาน' : 'ไม่ได้ใช้งาน'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewLocationDetails(location.id)}
                          className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors"
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
                      color: 'green',
                      fillColor: 'green',
                      fillOpacity: 0.2
                    }}
                  />
                </React.Fragment>
              ))}

              {/* Event Markers (Blue) - Only show filtered results */}
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
                          onClick={() => handleViewEventDetails(event.id)}
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
                      color: event.status === 'ongoing' ? 'blue' : 'gray',
                      fillColor: event.status === 'ongoing' ? 'blue' : 'gray',
                      fillOpacity: 0.2
                    }}
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>


      </div>
    </div>
  )
}

export default MappingAndEvents
