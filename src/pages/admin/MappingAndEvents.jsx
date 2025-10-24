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
  const { locations } = useLocations()
  const { events } = useEvents()
  const [activeTab, setActiveTab] = useState('locations') // 'locations' or 'events'
  const [scrollToLocationId, setScrollToLocationId] = useState(null)
  const [scrollToEventId, setScrollToEventId] = useState(null)

  const defaultCenter = [13.7606, 100.5034]

  // Handle view details from map popup
  const handleViewLocationDetails = (locationId) => {
    setActiveTab('locations')
    setScrollToLocationId(null) // Reset first
    setTimeout(() => setScrollToLocationId(locationId), 50)
  }

  const handleViewEventDetails = (eventId) => {
    setActiveTab('events')
    setScrollToEventId(null) // Reset first
    setTimeout(() => setScrollToEventId(eventId), 50)
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

      {/* Combined Map Section */}
      <div className="px-6 py-8 max-w-8xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">แผนที่ทั้งหมด</h2>
              <p className="text-sm text-gray-600 mt-1">
                <span className="inline-flex items-center gap-1 mr-3">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>พื้นที่อนุญาต</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span>กิจกรรม</span>
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                {locations.length} พื้นที่
              </div>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                {events.length} กิจกรรม
              </div>
            </div>
          </div>

          <div className="relative h-[550px] rounded-xl overflow-hidden border-2 border-blue-200">
            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Auto-fit bounds to show all markers */}
              <FitBoundsToMarkers locations={[...locations, ...events]} />

              {/* Location Markers (Green) */}
              {locations.map((location) => (
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

              {/* Event Markers (Blue) */}
              {events.map((event) => (
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

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 rounded-t-2xl">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'locations'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Z" />
                </svg>
                <span>พื้นที่อนุญาต</span>
                <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  {locations.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'events'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Z" />
                </svg>
                <span>กิจกรรม</span>
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  {events.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-lg">
          {activeTab === 'locations' ? (
            <div className="p-6">
              <Mapping hideHeader={true} hideMap={true} scrollToId={scrollToLocationId} />
            </div>
          ) : (
            <div className="p-6">
              <EventManagement hideHeader={true} hideMap={true} scrollToId={scrollToEventId} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MappingAndEvents
