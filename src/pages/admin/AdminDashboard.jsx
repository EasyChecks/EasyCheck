import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, LayersControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useLocations } from '../../contexts/LocationContext'
import { useEvents } from '../../contexts/EventContext'

// Fix for default marker icon issue in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
      
      // Fit map to bounds with padding
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 17,
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
  
  const [chartPeriod, setChartPeriod] = useState('week') // week, month, year
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  // Mock data for demonstration
  const stats = {
    totalWeekly: 100,
    totalToday: 95,
    lateCount: 2,
    leaveCount: 3,
    absentCount: 3
  }

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
    id: `event-${evt.id}`,
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
    statusColor: 'text-blue-600'
  }))

  // Combine all locations
  const locationsWithStatus = [...mappingLocations, ...eventLocations]

  
  const defaultCenter = [13.7606, 100.5034]

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">ภาพรวมการปฏิบัติงานทั้งหมด</h1>
        <p className="text-sm text-gray-600 mt-1">ข้อมูลเรียลไทม์ของระบบตรวจสอบการเข้างาน การลางาน และพื้นที่อนุญาต</p>
      </div>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-8xl mx-auto">
        {/* Section 1: Attendance Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">สถิติการเข้างาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Weekly */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                    <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white/90 text-sm mb-1">จำนวนพนักงานทั้งหมดในสัปดาร์นี้</h3>
              <p className="text-4xl font-bold">{stats.totalWeekly}</p>
              <p className="text-xs text-white/80 mt-2">จากทีมทั้งหมดรวมถึงเจ้าหน้าที่</p>
            </div>

            {/* Total Today */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white/90 text-sm mb-1">เข้างานสำเร็จวันนี้</h3>
              <p className="text-4xl font-bold">{stats.totalToday}</p>
              <p className="text-xs text-white/80 mt-2">95% check on-time</p>
            </div>

            {/* Late Count */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                    <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white/90 text-sm mb-1">มาสาย / ลางาน</h3>
              <p className="text-4xl font-bold">{stats.lateCount + stats.leaveCount}</p>
              <p className="text-xs text-white/80 mt-2">2 คนมาสาย, 3 ลางาน</p>
            </div>
          </div>
        </div>

        {/* Section 2: Weekly Attendance Trends Chart */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Weekly Attendance Trends</h2>
          </div>

          {/* Chart Area - Using SVG for simple line chart */}
          <div className="relative h-80 bg-white rounded-xl p-6 border border-blue-100">
            <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="60" x2="800" y2="60" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="0" y1="180" x2="800" y2="180" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="0" y1="240" x2="800" y2="240" stroke="#E5E7EB" strokeWidth="1" />

              {/* Attendance line chart */}
              <polyline
                points="0,250 100,180 200,90 300,120 400,60 500,200 600,80 700,110 800,280"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Area under the curve */}
              <polyline
                points="0,250 100,180 200,90 300,120 400,60 500,200 600,80 700,110 800,280 800,300 0,300"
                fill="url(#gradient)"
                opacity="0.3"
              />

              {/* Data points */}
              <circle cx="100" cy="180" r="5" fill="#3B82F6" />
              <circle cx="200" cy="90" r="5" fill="#3B82F6" />
              <circle cx="300" cy="120" r="5" fill="#3B82F6" />
              <circle cx="400" cy="60" r="5" fill="#3B82F6" />
              <circle cx="500" cy="200" r="5" fill="#3B82F6" />
              <circle cx="600" cy="80" r="5" fill="#3B82F6" />
              <circle cx="700" cy="110" r="5" fill="#3B82F6" />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              {chartPeriod === 'week' && (
                <>
                  <span>จันทร์</span>
                  <span>อังคาร</span>
                  <span>พุธ</span>
                  <span>พฤหัส</span>
                  <span>ศุกร์</span>
                  <span>เสาร์</span>
                  <span>อาทิตย์</span>
                </>
              )}
              {chartPeriod === 'month' && (
                <>
                  <span>สัปดาห์ 1</span>
                  <span>สัปดาห์ 2</span>
                  <span>สัปดาห์ 3</span>
                  <span>สัปดาห์ 4</span>
                </>
              )}
              {chartPeriod === 'year' && (
                <>
                  <span>ม.ค.</span>
                  <span>ก.พ.</span>
                  <span>มี.ค.</span>
                  <span>เม.ย.</span>
                  <span>พ.ค.</span>
                  <span>มิ.ย.</span>
                  <span>ก.ค.</span>
                  <span>ส.ค.</span>
                  <span>ก.ย.</span>
                  <span>ต.ค.</span>
                  <span>พ.ย.</span>
                  <span>ธ.ค.</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Permitted Area */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Permitted Work Area</h2>
              <p className="text-sm text-white mt-1">พื้นที่อนุญาต</p>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              {locationsWithStatus.length} สถานที่
            </div>
          </div>

          <div className="grid lg:grid-cols-1 gap-6">
            {/* Map Area - Leaflet */}
            <div className="relative bg-white rounded-xl overflow-hidden border-2 border-blue-300 shadow-inner h-[500px]">
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
                <FitBoundsToMarkers locations={locationsWithStatus} />

                {locationsWithStatus.map((location) => (
                  <React.Fragment key={location.id}>
                    <Marker position={[location.latitude, location.longitude]} />
                    <Circle
                      center={[location.latitude, location.longitude]}
                      radius={location.radius}
                      pathOptions={{ 
                        color: location.type === 'event' ? '#EAB308' : (location.status === 'active' ? 'green' : 'red'),
                        fillColor: location.type === 'event' ? '#EAB308' : (location.status === 'active' ? 'green' : 'red'),
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
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600">กิจกรรม</span>
                  </div>                 
                </div>
              </div>
            </div>

            {/* Location Details List */}
            <div className="space-y-4">
              {locationsWithStatus.map((location) => (
                <div
                  key={location.id}
                  className={`bg-gradient-to-r ${
                    location.type === 'event' 
                      ? 'from-yellow-50 to-yellow-100 border-yellow-300' 
                      : 'from-green-50 to-green-100 border-green-200'
                    } border-2 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 ${
                          location.type === 'event' ? 'bg-yellow-500' : 'bg-green-500'
                          } rounded-full flex items-center justify-center text-white font-bold shadow-md`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                          <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{location.name}</h3>
                        <p className={`text-sm font-medium ${location.type === 'event' ? 'text-yellow-700' : location.statusColor}`}>
                          {location.checkInStatus}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {location.type === 'event' ? '📅 จากกิจกรรม' : '📍 จากตั้งค่าแผนที่'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">รายละเอียด</p>
                    <p className="font-semibold text-gray-800 text-sm">{location.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">ทีม / หน่วยงาน</p>
                      <p className="font-semibold text-gray-800 text-sm">{location.team}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">เวลาเช็คอิน</p>
                      <p className="font-semibold text-gray-800 text-sm">{location.time}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">รัศมี</p>
                      <p className="font-semibold text-gray-800 text-sm">{location.radius} เมตร</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">พิกัด</p>
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="14px"
                          viewBox="0 -960 960 960"
                          width="14px"
                          fill="#6B7280"
                        >
                          <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Z" />
                        </svg>
                        <p className="text-xs text-gray-700">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard