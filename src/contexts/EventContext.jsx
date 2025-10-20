import React, { createContext, useState, useContext, useEffect } from 'react'

// Create Context
const EventContext = createContext()

// Initial default events
const defaultEvents = [
  {
    id: 1,
    name: 'ประชุมทีมขาย ประจำเดือน',
    date: '20/10/2025', // Today's date
    description: 'ประชุมวางแผนการขายและทบทวนผลการดำเนินงาน',
    locationName: 'ห้องประชุมชั้น 3',
    latitude: 13.7563,
    longitude: 100.5018,
    radius: 100,
    status: 'ongoing',
    startTime: '14:00',
    endTime: '16:00',
    teams: ['ทีมขาย', 'Marketing', 'การตลาด']
  },
  {
    id: 2,
    name: 'Workshop การพัฒนาระบบ',
    date: '21/10/2025',
    description: 'อบรมเชิงปฏิบัติการเทคโนโลยีใหม่สำหรับทีม IT',
    locationName: 'ศูนย์ฝึกอบรม อาคาร A',
    latitude: 13.7606,
    longitude: 100.5034,
    radius: 150,
    status: 'ongoing',
    startTime: '09:00',
    endTime: '17:00',
    teams: ['IT', 'ทีมพัฒนา', 'Software Engineer']
  },
  {
    id: 3,
    name: 'ตรวจสอบคุณภาพงานก่อสร้าง',
    date: '22/10/2025',
    description: 'ตรวจสอบความก้าวหน้าและคุณภาพของโครงการก่อสร้าง',
    locationName: 'ไซต์งานบางนา',
    latitude: 13.6671,
    longitude: 100.6221,
    radius: 200,
    status: 'ongoing',
    startTime: '10:00',
    endTime: '14:00',
    teams: ['ทีมก่อสร้าง', 'ทีมควบคุมคุณภาพ', 'วิศวกร']
  },
  {
    id: 4,
    name: 'ฝึกอบรม HR Management',
    date: '23/10/2025',
    description: 'อบรมระบบการจัดการทรัพยากรบุคคลสำหรับผู้บริหาร',
    locationName: 'โรงแรม Grand Hyatt',
    latitude: 13.7435,
    longitude: 100.5448,
    radius: 100,
    status: 'ongoing',
    startTime: '08:30',
    endTime: '16:30',
    teams: ['HR', 'ทรัพยากรบุคคล', 'Admin']
  },
  {
    id: 5,
    name: 'Customer Service Excellence',
    date: '24/10/2025',
    description: 'พัฒนาทักษะการบริการลูกค้าระดับมืออาชีพ',
    locationName: 'ศูนย์การค้า Central World',
    latitude: 13.7469,
    longitude: 100.5397,
    radius: 150,
    status: 'ongoing',
    startTime: '13:00',
    endTime: '17:00',
    teams: ['ทีมบริการลูกค้า', 'Customer Service', 'ฝ่ายบริการ']
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
    } catch (error) {
      console.error('Error saving events to localStorage:', error)
    }
  }, [events])

  // Add new event
  const addEvent = (event) => {
    setEvents(prev => {
      const newEvents = [...prev, event]
      return newEvents
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

  // Filter events by user's department/team
  const getEventsForUser = (userDepartment, userPosition) => {
    // Convert user info to comparable format
    const userTeams = [userDepartment, userPosition].filter(Boolean).map(t => t.toLowerCase())
    
    return events.filter(event => {
      // If event has no teams specified, it's visible to all
      if (!event.teams || event.teams.length === 0) {
        return true
      }
      
      // Check if user's department or position matches any of the event teams
      return event.teams.some(eventTeam => 
        userTeams.some(userTeam => 
          eventTeam.toLowerCase().includes(userTeam) || 
          userTeam.includes(eventTeam.toLowerCase())
        )
      )
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
