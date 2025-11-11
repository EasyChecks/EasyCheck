import React, { createContext, useState, useContext, useEffect } from 'react'

// Create Context
const EventContext = createContext()

// Initial default events
const defaultEvents = [
  // ========== กรุงเทพ (BKK - Branch 101) ==========
  {
    id: 1,
    name: 'ประชุมผู้บริหารประจำเดือน',
    date: '15/11/2025',
    startDate: '15/11/2025',
    endDate: '15/11/2025',
    description: 'ประชุมวางแผนกลยุทธ์และทบทวนผลการดำเนินงานประจำเดือน',
    locationName: 'ห้องประชุมชั้น 8 สำนักงานใหญ่',
    latitude: 13.7245,
    longitude: 100.5316,
    radius: 100,
    status: 'ongoing',
    startTime: '09:00',
    endTime: '12:00',
    teams: ['ผู้บริหาร', 'ฝ่ายวางแผน'],
    assignedUsers: [],
    assignedDepartments: ['Management'],
    assignedPositions: [],
    createdBy: {
      userId: 1,
      username: 'BKK1010001',
      branch: '101'
    }
  },
  {
    id: 2,
    name: 'อบรมพัฒนาทักษะการขาย',
    date: '18/11/2025',
    startDate: '18/11/2025',
    endDate: '18/11/2025',
    description: 'ฝึกอบรมเทคนิคการขายและการบริการลูกค้า',
    locationName: 'ห้องฝึกอบรม ชั้น 5',
    latitude: 13.7250,
    longitude: 100.5320,
    radius: 120,
    status: 'ongoing',
    startTime: '13:00',
    endTime: '17:00',
    teams: ['ทีมขาย', 'Marketing'],
    assignedUsers: [],
    assignedDepartments: ['Sales', 'Marketing'],
    assignedPositions: [],
    createdBy: {
      userId: 1,
      username: 'BKK1010001',
      branch: '101'
    }
  },
  {
    id: 3,
    name: 'สัมมนาเทคโนโลยีดิจิทัล',
    date: '20/11/2025',
    startDate: '20/11/2025',
    endDate: '20/11/2025',
    description: 'สัมมนาแนวโน้มเทคโนโลยีและนวัตกรรมใหม่ๆ',
    locationName: 'ศูนย์ประชุม BITEC บางนา',
    latitude: 13.6709,
    longitude: 100.6311,
    radius: 200,
    status: 'ongoing',
    startTime: '08:30',
    endTime: '16:30',
    teams: ['IT', 'Digital'],
    assignedUsers: [],
    assignedDepartments: ['IT'],
    assignedPositions: [],
    createdBy: {
      userId: 1,
      username: 'BKK1010001',
      branch: '101'
    }
  },

  // ========== เชียงใหม่ (CNX - Branch 102) ==========
  {
    id: 4,
    name: 'ประชุมทีมงานภาคเหนือ',
    date: '16/11/2025',
    startDate: '16/11/2025',
    endDate: '16/11/2025',
    description: 'ประชุมประสานงานและติดตามผลงานภาคเหนือ',
    locationName: 'ห้องประชุม สาขาเชียงใหม่',
    latitude: 18.7883,
    longitude: 98.9853,
    radius: 100,
    status: 'ongoing',
    startTime: '10:00',
    endTime: '14:00',
    teams: ['ทีมภาคเหนือ'],
    assignedUsers: [],
    assignedDepartments: ['Operations'],
    assignedPositions: [],
    createdBy: {
      userId: 2,
      username: 'CNX1020001',
      branch: '102'
    }
  },
  {
    id: 5,
    name: 'Workshop การพัฒนาผลิตภัณฑ์',
    date: '19/11/2025',
    startDate: '19/11/2025',
    endDate: '19/11/2025',
    description: 'อบรมเชิงปฏิบัติการพัฒนาผลิตภัณฑ์ท้องถิ่น',
    locationName: 'ศูนย์ประชุมเชียงใหม่ ฮอลล์ 2',
    latitude: 18.7960,
    longitude: 98.9800,
    radius: 150,
    status: 'ongoing',
    startTime: '09:00',
    endTime: '16:00',
    teams: ['Product Development'],
    assignedUsers: [],
    assignedDepartments: ['R&D'],
    assignedPositions: [],
    createdBy: {
      userId: 2,
      username: 'CNX1020001',
      branch: '102'
    }
  },

  // ========== ภูเก็ต (PKT - Branch 201) ==========
  {
    id: 6,
    name: 'สัมมนาการท่องเที่ยว',
    date: '17/11/2025',
    startDate: '17/11/2025',
    endDate: '17/11/2025',
    description: 'สัมมนาแนวทางพัฒนาการท่องเที่ยวภาคใต้',
    locationName: 'โรงแรมภูเก็ต แกรนด์บอลรูม',
    latitude: 7.8804,
    longitude: 98.3923,
    radius: 180,
    status: 'ongoing',
    startTime: '09:00',
    endTime: '17:00',
    teams: ['Tourism', 'Business Development'],
    assignedUsers: [],
    assignedDepartments: ['Tourism'],
    assignedPositions: [],
    createdBy: {
      userId: 5,
      username: 'PKT2010001',
      branch: '201'
    }
  },
  {
    id: 7,
    name: 'ตรวจสอบสถานที่โครงการ',
    date: '21/11/2025',
    startDate: '21/11/2025',
    endDate: '21/11/2025',
    description: 'ตรวจสอบความคืบหน้าโครงการก่อสร้างรีสอร์ท',
    locationName: 'ไซต์งานกะตะ ภูเก็ต',
    latitude: 7.8400,
    longitude: 98.2980,
    radius: 200,
    status: 'ongoing',
    startTime: '08:00',
    endTime: '12:00',
    teams: ['Construction', 'Quality Control'],
    assignedUsers: [],
    assignedDepartments: ['Engineering'],
    assignedPositions: [],
    createdBy: {
      userId: 5,
      username: 'PKT2010001',
      branch: '201'
    }
  },
  {
    id: 8,
    name: 'ประชุมพันธมิตรธุรกิจ',
    date: '25/11/2025',
    startDate: '25/11/2025',
    endDate: '25/11/2025',
    description: 'ประชุมหารือความร่วมมือกับพันธมิตรท้องถิ่น',
    locationName: 'ห้องประชุม สาขาภูเก็ต',
    latitude: 7.8850,
    longitude: 98.3950,
    radius: 100,
    status: 'ongoing',
    startTime: '14:00',
    endTime: '17:00',
    teams: ['Partnership', 'Business'],
    assignedUsers: [],
    assignedDepartments: ['Business Development'],
    assignedPositions: [],
    createdBy: {
      userId: 5,
      username: 'PKT2010001',
      branch: '201'
    }
  },

  // ========== ภาคตะวันตก - กาญจนบุรี (KAN - Branch 301) ==========
  {
    id: 9,
    name: 'อบรมความปลอดภัยในการทำงาน',
    date: '22/11/2025',
    startDate: '22/11/2025',
    endDate: '22/11/2025',
    description: 'ฝึกอบรมมาตรฐานความปลอดภัยสำหรับพนักงานภาคสนาม',
    locationName: 'ศูนย์ฝึกอบรม กาญจนบุรี',
    latitude: 14.0227,
    longitude: 99.5328,
    radius: 150,
    status: 'ongoing',
    startTime: '08:30',
    endTime: '15:30',
    teams: ['Safety', 'Field Operations'],
    assignedUsers: [],
    assignedDepartments: ['Safety'],
    assignedPositions: [],
    createdBy: {
      userId: 6,
      username: 'KAN3010001',
      branch: '301'
    }
  },
  {
    id: 10,
    name: 'ประชุมทีมโครงการพิเศษ',
    date: '26/11/2025',
    startDate: '26/11/2025',
    endDate: '26/11/2025',
    description: 'ประชุมติดตามความคืบหน้าโครงการพิเศษภาคตะวันตก',
    locationName: 'ห้องประชุม สาขากาญจนบุรี',
    latitude: 14.0250,
    longitude: 99.5350,
    radius: 120,
    status: 'ongoing',
    startTime: '10:00',
    endTime: '13:00',
    teams: ['Project Management'],
    assignedUsers: [],
    assignedDepartments: ['Project'],
    assignedPositions: [],
    createdBy: {
      userId: 6,
      username: 'KAN3010001',
      branch: '301'
    }
  }
]

// Provider Component
export function EventProvider({ children }) {
  // Load events from localStorage or use default
  const [events, setEvents] = useState(() => {
    try {
      const savedEvents = localStorage.getItem('easycheck_events')
      return savedEvents ? JSON.parse(savedEvents) : defaultEvents
    } catch (error) {
      console.error('Error loading events from localStorage:', error)
      return defaultEvents
    }
  })

  // Save to localStorage whenever events change
  useEffect(() => {
    try {
      localStorage.setItem('easycheck_events', JSON.stringify(events))
      // debug log to help trace persistence
      console.debug('[EventContext] saved events to localStorage, count=', Array.isArray(events) ? events.length : 0)
    } catch (error) {
      console.error('Error saving events to localStorage:', error)
    }
  }, [events])

  // Listen for localStorage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'easycheck_events' && e.newValue !== e.oldValue) {
        try {
          const newEvents = JSON.parse(e.newValue || '[]')
          setEvents(newEvents)
          console.debug('[EventContext] localStorage changed, syncing events')
        } catch (error) {
          console.error('Error parsing events from localStorage:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Add new event
  const addEvent = (event) => {
    setEvents(prev => {
      try {
        const base = Array.isArray(prev) ? prev : []
        const newEvents = [...base, event]
        console.debug('[EventContext] addEvent - adding', event, 'new length', newEvents.length)
        
        // Trigger storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'easycheck_events',
          newValue: JSON.stringify(newEvents),
          oldValue: JSON.stringify(base)
        }))
        
        return newEvents
      } catch (e) {
        console.error('[EventContext] addEvent error:', e)
        return prev
      }
    })
  }

  // Update event
  const updateEvent = (id, updatedEvent) => {
    setEvents(prev => {
      const newEvents = prev.map(evt => evt.id === id ? { ...evt, ...updatedEvent } : evt)
      return newEvents
    })
  }

  // Delete event
  const deleteEvent = (id) => {
    setEvents(prev => {
      const newEvents = prev.filter(evt => evt.id !== id)
      return newEvents
    })
  }

  // Get event by id
  const getEvent = (id) => {
    return events.find(evt => evt.id === id)
  }

  // Filter events by user's department/team/assignment
  const getEventsForUser = (userId, userRole, userDepartment, userPosition) => {
    return events.filter(event => {
      // 1. Check if user is directly assigned (by ID or name)
      if (event.assignedUsers && event.assignedUsers.length > 0) {
        const isAssigned = event.assignedUsers.some(assigned => {
          // Check if it's a user ID (number)
          if (typeof assigned === 'number' && assigned === userId) {
            return true
          }
          // Check if it's a user object with id
          if (typeof assigned === 'object' && assigned.id === userId) {
            return true
          }
          // Check if it's a name string (normalize comparison)
          if (typeof assigned === 'string') {
            return assigned.toLowerCase().includes(String(userId).toLowerCase())
          }
          return false
        })
        if (isAssigned) return true
      }

      // 2. Check if user's department is assigned
      if (event.assignedDepartments && event.assignedDepartments.length > 0) {
        if (event.assignedDepartments.some(dept => 
          dept.toLowerCase() === userDepartment?.toLowerCase() ||
          dept.toLowerCase().includes(userDepartment?.toLowerCase()) ||
          userDepartment?.toLowerCase().includes(dept.toLowerCase())
        )) {
          return true
        }
      }

      // 3. Check if user's position is assigned
      if (event.assignedPositions && event.assignedPositions.length > 0) {
        if (event.assignedPositions.some(pos => 
          pos.toLowerCase() === userPosition?.toLowerCase() ||
          pos.toLowerCase().includes(userPosition?.toLowerCase()) ||
          userPosition?.toLowerCase().includes(pos.toLowerCase())
        )) {
          return true
        }
      }

      // 4. Fallback to old teams logic for backward compatibility
      if (event.teams && event.teams.length > 0) {
        const userTeams = [userDepartment, userPosition].filter(Boolean).map(t => t.toLowerCase().trim())
        
        return event.teams.some(eventTeam => {
          const normalizedEventTeam = eventTeam.toLowerCase().trim()
          
          return userTeams.some(userTeam => {
            return (
              normalizedEventTeam === userTeam ||
              normalizedEventTeam.includes(userTeam) || 
              userTeam.includes(normalizedEventTeam)
            )
          })
        })
      }

      // If no assignment criteria, don't show the event
      return false
    })
  }

  // Check if user can join event (within 30 minutes after start time)
  const canJoinEvent = (event) => {
    if (!event.startTime || !event.date) {
      return true // If no time specified, allow joining
    }

    try {
      // Parse date (format: DD/MM/YYYY)
      const [day, month, year] = event.date.split('/')
      // Parse time (format: HH:MM)
      const [hours, minutes] = event.startTime.split(':')
      
      // Create event start time
      const eventStartTime = new Date(year, month - 1, day, hours, minutes)
      
      // Add 30 minutes grace period
      const joinDeadline = new Date(eventStartTime.getTime() + 30 * 60 * 1000)
      
      // Get current time
      const now = new Date()
      
      // Can join if current time is before deadline
      return now <= joinDeadline
    } catch (error) {
      console.error('Error parsing event date/time:', error)
      return true // In case of error, allow joining
    }
  }

  // Get time remaining to join event (returns object with hours and minutes)
  const getTimeRemainingToJoin = (event) => {
    if (!event.startTime || !event.date) {
      return null
    }

    try {
      const [day, month, year] = event.date.split('/')
      const [hours, minutes] = event.startTime.split(':')
      
      const eventStartTime = new Date(year, month - 1, day, hours, minutes)
      const joinDeadline = new Date(eventStartTime.getTime() + 30 * 60 * 1000)
      const now = new Date()
      
      const diff = joinDeadline - now
      const totalMinutes = Math.floor(diff / (1000 * 60))
      
      if (totalMinutes <= 0) {
        return { hours: 0, minutes: 0, total: 0 }
      }
      
      const hoursRemaining = Math.floor(totalMinutes / 60)
      const minutesRemaining = totalMinutes % 60
      
      return {
        hours: hoursRemaining,
        minutes: minutesRemaining,
        total: totalMinutes,
        formatted: `${hoursRemaining}:${minutesRemaining.toString().padStart(2, '0')}`
      }
    } catch (error) {
      console.error('Error calculating time remaining:', error)
      return null
    }
  }

  // ✅ Get filtered events based on user role and branch
  const getFilteredEvents = (user) => {
    if (!user) return []
    
    // SuperAdmin เห็นทุกอย่าง
    if (user.role === 'superadmin') {
      return events
    }
    
    // Admin เห็นเฉพาะสาขาของตัวเอง
    if (user.role === 'admin') {
      return events.filter(evt => {
        // ถ้ายังไม่มี branch (event เก่า) ให้แสดงทุกอัน
        if (!evt.createdBy?.branch) return true
        // ถ้ามี branch ให้แสดงเฉพาะที่ตรงกับสาขาของ admin
        return evt.createdBy.branch === user.branchCode
      })
    }
    
    // Manager และ User ใช้ getEventsForUser แทน
    return getEventsForUser(user.id, user.role, user.department, user.position)
  }

  const value = {
    events,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getEventsForUser,
    getFilteredEvents,
    canJoinEvent,
    getTimeRemainingToJoin
  }

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  )
}

// Custom hook to use EventContext
export function useEvents() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider')
  }
  return context
}

export default EventContext
