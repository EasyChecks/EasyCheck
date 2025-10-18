import React, { createContext, useState, useContext, useEffect } from 'react'

// Create Context
const EventContext = createContext()

// Initial default events
const defaultEvents = [
  {
    id: 1,
    name: 'คุยงานกับลูกค้า',
    date: '23/09/2025 → 24/09/2025',
    description: 'เก็บ requirement ของลูกค้า',
    locationName: 'โซนเมกะบางนา',
    latitude: 13.6671,
    longitude: 100.6221,
    radius: 200,
    status: 'completed',
    startTime: '09:00',
    endTime: '11:00',
    teams: ['ทีมขาย', 'ทีมพัฒนา']
  },
  {
    id: 2,
    name: 'ลงตรวจ site งาน',
    date: '25/09/2025',
    description: 'ตรวจความเรียบร้อยของโครงการ',
    locationName: 'คลองเตย',
    latitude: 13.7218,
    longitude: 100.5856,
    radius: 150,
    status: 'completed',
    startTime: '10:00',
    endTime: '12:00',
    teams: ['ทีมก่อสร้าง', 'ทีมควบคุมคุณภาพ']
  },
  {
    id: 3,
    name: 'ติดตั้งสินค้าที่บ้านลูกค้า',
    date: '27/09/2025',
    description: 'ติดตั้งระบบให้ลูกค้ารายใหม่',
    locationName: 'ลาดพร้าว 71',
    latitude: 13.8021,
    longitude: 100.6048,
    radius: 100,
    status: 'completed',
    startTime: '13:00',
    endTime: '15:00',
    teams: ['ทีมติดตั้ง', 'ทีมบริการลูกค้า']
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

  const value = {
    events,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent
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
