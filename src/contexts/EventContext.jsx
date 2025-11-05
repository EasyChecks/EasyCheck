import React, { createContext, useState, useContext, useEffect } from 'react'

// Create Context
const EventContext = createContext()

// Initial default events
const defaultEvents = [
  {
    id: 1,
    name: 'ประชุมทีมขาย ประจำเดือน',
    date: '20/10/2025', // Today's date
    startDate: '20/10/2025',
    endDate: '20/10/2025',
    description: 'ประชุมวางแผนการขายและทบทวนผลการดำเนินงาน',
    locationName: 'ห้องประชุมชั้น 3',
    latitude: 13.7563,
    longitude: 100.5018,
    radius: 100,
    status: 'ongoing',
    startTime: '14:00',
    endTime: '16:00',
    teams: ['ทีมขาย', 'Marketing', 'การตลาด'],
    assignedUsers: [], // Array of user IDs or user objects
    assignedDepartments: [], // Array of departments  
    assignedPositions: [] // Array of positions
  },
  {
    id: 2,
    name: 'Workshop การพัฒนาระบบ',
    date: '21/10/2025',
    startDate: '21/10/2025',
    endDate: '21/10/2025',
    description: 'อบรมเชิงปฏิบัติการเทคโนโลยีใหม่สำหรับทีม IT',
    locationName: 'ศูนย์ฝึกอบรม อาคาร A',
    latitude: 13.7606,
    longitude: 100.5034,
    radius: 150,
    status: 'ongoing',
    startTime: '09:00',
    endTime: '17:00',
    teams: ['IT', 'ทีมพัฒนา', 'Software Engineer'],
    assignedUsers: [3], // นายอภิชาติ (IT)
    assignedDepartments: ['IT'],
    assignedPositions: []
  },
  {
    id: 3,
    name: 'ตรวจสอบคุณภาพงานก่อสร้าง',
    date: '22/10/2025',
    startDate: '22/10/2025',
    endDate: '22/10/2025',
    description: 'ตรวจสอบความก้าวหน้าและคุณภาพของโครงการก่อสร้าง',
    locationName: 'ไซต์งานบางนา',
    latitude: 13.6671,
    longitude: 100.6221,
    radius: 200,
    status: 'ongoing',
    startTime: '10:00',
    endTime: '14:00',
    teams: ['ทีมก่อสร้าง', 'ทีมควบคุมคุณภาพ', 'วิศวกร'],
    assignedUsers: [],
    assignedDepartments: [],
    assignedPositions: []
  },
  {
    id: 4,
    name: 'ฝึกอบรม HR Management',
    date: '23/10/2025',
    startDate: '23/10/2025',
    endDate: '23/10/2025',
    description: 'อบรมระบบการจัดการทรัพยากรบุคคลสำหรับผู้บริหาร',
    locationName: 'โรงแรม Grand Hyatt',
    latitude: 13.7435,
    longitude: 100.5448,
    radius: 100,
    status: 'ongoing',
    startTime: '08:30',
    endTime: '16:30',
    teams: ['HR', 'ทรัพยากรบุคคล', 'Admin'],
    assignedUsers: [],
    assignedDepartments: ['HR'],
    assignedPositions: []
  },
  {
    id: 5,
    name: 'Customer Service Excellence',
    date: '24/10/2025',
    startDate: '24/10/2025',
    endDate: '24/10/2025',
    description: 'พัฒนาทักษะการบริการลูกค้าระดับมืออาชีพ',
    locationName: 'ศูนย์การค้า Central World',
    latitude: 13.7469,
    longitude: 100.5397,
    radius: 150,
    status: 'ongoing',
    startTime: '13:00',
    endTime: '17:00',
    teams: ['ทีมบริการลูกค้า', 'Customer Service', 'ฝ่ายบริการ'],
    assignedUsers: [4], // นางพรทิพย์ (Marketing)
    assignedDepartments: [],
    assignedPositions: []
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

  const value = {
    events,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getEventsForUser,
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
