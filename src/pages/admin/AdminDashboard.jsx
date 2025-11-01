import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, LayersControl, useMap, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useLocations } from '../../contexts/LocationContext'
import { useEvents } from '../../contexts/EventContext'
import { mockAttendanceStats, mockAttendanceChartData, mockEventChartData } from '../../data/usersData'

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
  const [statsType, setStatsType] = useState('attendance') // attendance, event
  const [expandedLocationIds, setExpandedLocationIds] = useState([]) // Track which locations are expanded
  const locationRefs = useRef({}) // Refs for scrolling to location cards

  // ใช้ Mock Data จาก usersData.js
  const attendanceStats = mockAttendanceStats

  // Calculate real event stats from EventContext
  const eventStats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'ongoing').length,
    todayEvents: events.filter(e => {
      const today = new Date()
      const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
      return e.date === todayStr
    }).length,
    completedEvents: events.filter(e => e.status === 'completed').length,
    // Mock participants data (can be extended to track real participants in the future)
    totalParticipants: events.reduce((sum, e) => sum + (e.teams?.length || 0) * 15, 0), // Estimate 15 people per team
    todayParticipants: events.filter(e => {
      const today = new Date()
      const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
      return e.date === todayStr
    }).reduce((sum, e) => sum + (e.teams?.length || 0) * 15, 0)
  }

  // Get current stats based on selected type
  const stats = statsType === 'attendance' ? attendanceStats : eventStats

  // Generate chart data based on selected period and type
  const getChartData = () => {
    if (statsType === 'attendance') {
      // ใช้ Attendance Chart Data จาก usersData.js
      return mockAttendanceChartData[chartPeriod] || []
    } else {
      // Event data: ใช้ mockEventChartData จาก usersData.js
      const avgParticipantsPerEvent = eventStats.totalEvents > 0
        ? Math.max(1, Math.round(eventStats.totalParticipants / eventStats.totalEvents))
        : 15

      // ดึงข้อมูลจาก mockEventChartData
      const eventData = mockEventChartData[chartPeriod];
      if (!eventData) return [];

      const { labels, counts } = eventData;

      // แปลง event counts เป็น participant counts
      const mapCountsToParticipants = labels.map((label, idx) => {
        // สำหรับข้อมูลวันปัจจุบัน (ศุกร์) ใช้ todayParticipants ถ้ามี
        if (label === 'ศุกร์' && eventStats.todayParticipants) {
          return { name: label, value: eventStats.todayParticipants };
        }
        // แปลงจำนวน event เป็นจำนวนผู้เข้าร่วม
        return { name: label, value: (counts[idx] || 0) * avgParticipantsPerEvent };
      });

      // ตรวจสอบว่ามีข้อมูลหรือไม่
      if (mapCountsToParticipants.length === 0 && eventStats.totalParticipants) {
        return [{ name: chartPeriod, value: eventStats.totalParticipants }];
      }
      
      return mapCountsToParticipants;
    }
  }

  // Compute chart data and dynamic Y axis max so chart doesn't hug the top
  const chartData = getChartData()
  const maxValue = chartData && chartData.length ? Math.max(...chartData.map(d => d.value || 0)) : (statsType === 'attendance' ? attendanceStats.totalWeekly : eventStats.totalParticipants)
  const yAxisMax = Math.ceil(Math.max(1, maxValue) * 1.12) // 12% headroom

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-4 min-w-[200px]">
          <p className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {entry.name}
                  </span>
                </div>
                <span className="text-lg font-bold" style={{ color: entry.color }}>
                  {entry.value} คน
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
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
    statusColor: 'text-brand-primary'
  }))

  // Combine all locations
  const locationsWithStatus = [...mappingLocations, ...eventLocations]

  // Toggle location details
  const toggleLocationDetails = (locationId) => {
    const wasExpanded = expandedLocationIds.includes(locationId)

    setExpandedLocationIds(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    )

    // If expanding, scroll to show the element at the top
    if (!wasExpanded) {
      setTimeout(() => {
        const element = locationRefs.current[locationId]
        if (element) {
          const scrollContainer = element.parentElement

          if (scrollContainer) {
            const elementTop = element.offsetTop

            scrollContainer.scrollTo({
              top: elementTop - 10,
              behavior: 'smooth'
            })
          }
        }
      }, 50) // Small delay to let the state update
    }
  }

  // Handle view details button click - scroll to location card and expand it
  const handleViewDetails = (locationId) => {
    // Expand the location if not already expanded
    if (!expandedLocationIds.includes(locationId)) {
      setExpandedLocationIds(prev => [...prev, locationId])
    }

    // Scroll to the location card - wait for expansion animation
    setTimeout(() => {
      const element = locationRefs.current[locationId]
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })

        // Add highlight effect
        element.classList.add('ring-4', 'ring-orange-400')
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-orange-400')
        }, 2000)
      }
    }, 350)
  }

  const defaultCenter = [13.7606, 100.5034]

  return (
    <div className="min-h-screen bg-brand-accent">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">ภาพรวมการปฏิบัติงานทั้งหมด</h1>
        <p className="text-sm text-gray-600 mt-1">ข้อมูลเรียลไทม์ของระบบตรวจสอบการเข้างาน การลางาน และพื้นที่อนุญาต</p>
      </div>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-8xl mx-auto">
        {/* Section 1: Stats with Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {statsType === 'attendance' ? 'สถิติการเข้างาน' : 'สถิติการเข้าร่วมกิจกรรม'}
            </h2>
            <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setStatsType('attendance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${statsType === 'attendance'
                    ? 'bg-white text-brand-primary shadow-sm transform scale-105'
                    : 'text-gray-600 hover:bg-gray-300'
                  }`}
              >
                การเข้างาน
              </button>
              <button
                onClick={() => setStatsType('event')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${statsType === 'event'
                    ? 'bg-white text-brand-primary shadow-sm transform scale-105'
                    : 'text-gray-600 hover:bg-gray-300'
                  }`}
              >
                กิจกรรม
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsType === 'attendance' ? (
              <>
                {/* Total Weekly - Attendance */}
                <div className="bg-brand-primary rounded-2xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                        <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white/90 text-sm mb-1">จำนวนพนักงานทั้งหมดในสัปดาห์นี้</h3>
                  <p className="text-4xl font-bold">{attendanceStats.totalWeekly}</p>
                  <p className="text-xs text-white/80 mt-2">จากทั้งหมด {attendanceStats.totalemployees} คน</p>
                </div>

                {/* Total Today - Attendance */}
                <div className="bg-gray-600  rounded-2xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white/90 text-sm mb-1">เข้างานสำเร็จวันนี้</h3>
                  <p className="text-4xl font-bold">{attendanceStats.totalToday}</p>
                  <p className="text-xs text-white/80 mt-2">95% check on-time</p>
                </div>

                {/* Late Count - Attendance */}
                <div className="bg-gray-600  rounded-2xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                        <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white/90 text-sm mb-1">มาสาย / ลางาน</h3>
                  <p className="text-4xl font-bold">{attendanceStats.lateCount + attendanceStats.leaveCount}</p>
                  <p className="text-xs text-white/80 mt-2">{attendanceStats.lateCount} คนมาสาย, {attendanceStats.leaveCount} ลางาน</p>
                </div>
              </>
            ) : (
              <>
                {/* Total Participants - LEFT */}
                <div className="bg-brand-primary rounded-2xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                        <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white/90 text-sm mb-1">ผู้เข้าร่วมทั้งหมด</h3>
                  <p className="text-4xl font-bold">{eventStats.totalParticipants}</p>
                  <p className="text-xs text-white/80 mt-2">จาก {eventStats.totalEvents} กิจกรรม</p>
                </div>

                {/* Active Events - CENTER */}
                <div className="bg-gray-600  rounded-2xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white/90 text-sm mb-1">กิจกรรมที่กำลังดำเนินการ</h3>
                  <p className="text-4xl font-bold">{eventStats.activeEvents}</p>
                  <p className="text-xs text-white/80 mt-2">จากทั้งหมด {eventStats.totalEvents} กิจกรรม</p>
                </div>

                {/* Today Events - RIGHT */}
                <div className="bg-yellow-500 rounded-2xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                        <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white/90 text-sm mb-1">กิจกรรมวันนี้</h3>
                  <p className="text-4xl font-bold">{eventStats.todayEvents}</p>
                  <p className="text-xs text-white/80 mt-2">เสร็จสิ้น {eventStats.completedEvents} กิจกรรม</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: Attendance Trends Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">แนวโน้มข้อมูล</h2>
              <p className="text-sm text-gray-600 mt-1">
                {statsType === 'attendance' ? 'แนวโน้มการเข้างานของพนักงาน' : 'แนวโน้มการเข้าร่วมกิจกรรม'}
              </p>
            </div>

            {/* Control Panel */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Period Selector */}
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartPeriod('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${chartPeriod === 'week'
                      ? 'bg-white text-gray-800 shadow-sm transform scale-105'
                      : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  สัปดาห์
                </button>
                <button
                  onClick={() => setChartPeriod('month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${chartPeriod === 'month'
                      ? 'bg-white text-gray-800 shadow-sm transform scale-105'
                      : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  เดือน
                </button>
                <button
                  onClick={() => setChartPeriod('year')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${chartPeriod === 'year'
                      ? 'bg-white text-gray-800 shadow-sm transform scale-105'
                      : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  ปี
                </button>
              </div>
            </div>
          </div>

          {/* Chart Area - Using Recharts with dual data */}
          <div className="relative h-96 bg-gray-50 rounded-xl p-6 border-2 border-orange-100 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F26623" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F26623" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorEvent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  style={{ fontSize: '13px', fontFamily: 'Prompt', fontWeight: '500' }}
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontFamily: 'Prompt' }}
                  tick={{ fill: '#9CA3AF' }}
                  domain={[0, yAxisMax]}
                  label={{
                    value: 'จำนวน (คน)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '13px', fontFamily: 'Prompt', fontWeight: '600', fill: '#4B5563' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Show single line based on statsType */}
                <Area
                  type="monotone"
                  dataKey="value"
                  name={statsType === 'attendance' ? 'การเข้างาน' : 'กิจกรรม'}
                  stroke={statsType === 'attendance' ? '#F26623' : '#eab308'}
                  strokeWidth={3}
                  fill={statsType === 'attendance' ? 'url(#colorAttendance)' : 'url(#colorEvent)'}
                  fillOpacity={1}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  dot={{
                    fill: statsType === 'attendance' ? '#F26623' : '#eab308',
                    strokeWidth: 2,
                    r: 5,
                    stroke: '#fff'
                  }}
                  activeDot={{
                    r: 8,
                    stroke: statsType === 'attendance' ? '#F26623' : '#eab308',
                    strokeWidth: 3,
                    fill: '#fff'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Permitted Area */}
        <div className="bg-brand-primary  rounded-2xl shadow-sm p-6">
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
            <div className="relative bg-white rounded-xl overflow-hidden border-2 border-orange-300 shadow-inner h-[500px]">
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
                    <Marker
                      position={[location.latitude, location.longitude]}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${location.type === 'event' ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
                            <h3 className="font-bold text-gray-800">{location.name}</h3>
                          </div>
                          <p className={`text-xs font-medium mb-2 ${location.type === 'event' ? 'text-yellow-700' : 'text-green-600'}`}>
                            {location.checkInStatus}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">{location.description}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 fill-brand-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                              </svg>
                              <span>{location.type === 'event' ? 'จากกิจกรรม' : 'จากตั้งค่าแผนที่'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 fill-brand-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                              </svg>
                              <span>รัศมี: {location.radius} เมตร</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewDetails(location.id)}
                            className="mt-3 w-full bg-brand-primary hover:bg-gray-700 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors"
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
                        color: location.type === 'event' ? '#EAB308' : (location.status === 'active' ? 'green' : 'red'),
                        fillColor: location.type === 'event' ? '#EAB308' : (location.status === 'active' ? 'green' : 'red'),
                        fillOpacity: 0.2
                      }}
                    />
                  </React.Fragment>
                ))}
              </MapContainer>

              {/* Map legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm z-[1000]">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">สถานะ</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
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
            <div className="relative">
              {/* Scroll indicator at top (shows when scrolled down) */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 pointer-events-none z-10 opacity-0 transition-opacity" id="scroll-top-indicator"></div>

              {/* Scrollable container */}
              <div
                className="space-y-4 max-h-[380px] overflow-y-auto pr-2 scroll-smooth"
                onScroll={(e) => {
                  const target = e.currentTarget
                  const topIndicator = document.getElementById('scroll-top-indicator')
                  const bottomIndicator = document.getElementById('scroll-bottom-indicator')

                  // Show top indicator when scrolled down
                  if (topIndicator) {
                    topIndicator.style.opacity = target.scrollTop > 20 ? '1' : '0'
                  }

                  // Show bottom indicator when not at bottom
                  if (bottomIndicator) {
                    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 20
                    bottomIndicator.style.opacity = isAtBottom ? '0' : '1'
                  }
                }}
              >
                {locationsWithStatus.map((location) => {
                  const isExpanded = expandedLocationIds.includes(location.id)

                  return (
                    <div
                      key={location.id}
                      ref={(el) => (locationRefs.current[location.id] = el)}
                      className={`bg-${location.type === 'event'
                          ? 'from-yellow-50 border-yellow-300'
                          : 'from-green-50 border-green-200'
                        } border-2 rounded-xl overflow-hidden transition-all`}
                    >
                      {/* Header - Always Visible (Clickable) */}
                      <div
                        className="p-5 cursor-pointer hover:bg-white/30 transition-colors"
                        onClick={() => toggleLocationDetails(location.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`w-12 h-12 ${location.type === 'event' ? 'bg-yellow-500' : 'bg-gray-600'
                                } rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">{location.name}</h3>
                              <p className={`text-sm font-medium ${location.type === 'event' ? 'text-yellow-700' : location.statusColor}`}>
                                {location.checkInStatus}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                {location.type === 'event' ? (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                                    จากกิจกรรม
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                                    จากตั้งค่าแผนที่
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Dropdown Arrow */}
                          <div className="ml-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 -960 960 960"
                              width="24px"
                              fill="currentColor"
                              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-gray-600`}
                            >
                              <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Details - Expandable */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                          } overflow-hidden`}
                      >
                        <div className="px-5 pb-5 space-y-3">
                          <div className="bg-white/60 rounded-lg p-3">
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

                          <div className="grid grid-cols-2 gap-3">
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
                                  fill="#9CA3AF"
                                >
                                  <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Z" />
                                </svg>
                                <p className="text-xs text-gray-700">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Scroll indicator at bottom (shows when not scrolled to bottom) */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-100 pointer-events-none z-10 transition-opacity" id="scroll-bottom-indicator"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard