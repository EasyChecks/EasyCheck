import React, { createContext, useState, useContext } from 'react'

// Create Context
const LocationContext = createContext()

// Initial locations data
const initialLocations = [
  {
    id: 1,
    name: 'สำนักใหญ่ TGS',
    description: 'ศูนย์การประชุมหลัก',
    radius: 150,
    latitude: 13.7596,
    longitude: 100.5008,
    status: 'active'
  },
  {
    id: 2,
    name: 'Site Event ซอยนามบัญญัติ',
    description: 'บางนา กรุงเทพฯ',
    radius: 150,
    latitude: 13.7650,
    longitude: 100.5050,
    status: 'active'
  },
  {
    id: 3,
    name: 'Site Event แยกจักรพรรดิ์',
    description: 'บางนา กรุงเทพฯ',
    radius: 100,
    latitude: 13.7580,
    longitude: 100.5100,
    status: 'active'
  },
  {
    id: 4,
    name: 'โบเทค บางนา Hall 101',
    description: 'ศูนย์แสดงสินค้าและนิทรรศการ บางนา',
    radius: 200,
    latitude: 13.6709,
    longitude: 100.6311,
    status: 'active'
  },
  {
    id: 5,
    name: 'CentralWorld ชั้น 3',
    description: 'ศูนย์การค้า CentralWorld',
    radius: 150,
    latitude: 13.7469,
    longitude: 100.5397,
    status: 'active'
  },
  {
    id: 6,
    name: 'สำนักงานใหญ่ ชั้น 5',
    description: 'สำนักงานใหญ่บริษัท',
    radius: 100,
    latitude: 13.7563,
    longitude: 100.5018,
    status: 'active'
  }
]

// Provider Component
export function LocationProvider({ children }) {
  // อ่านข้อมูลจาก localStorage หรือใช้ค่าเริ่มต้นถ้าไม่มี
  const [locations, setLocations] = useState(() => {
    try {
      const savedLocations = localStorage.getItem('locations')
      if (savedLocations) {
        const parsed = JSON.parse(savedLocations)
        // Merge: เพิ่ม locations ใหม่จาก initialLocations ที่ยังไม่มีใน localStorage
        const existingNames = new Set(parsed.map(loc => loc.name))
        const newLocations = initialLocations.filter(loc => !existingNames.has(loc.name))
        return [...parsed, ...newLocations]
      }
    } catch (error) {
      console.error('Error loading locations from localStorage:', error)
    }
    return initialLocations
  })

  // บันทึกลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  React.useEffect(() => {
    try {
      localStorage.setItem('locations', JSON.stringify(locations))
    } catch (error) {
      console.error('Error saving locations to localStorage:', error)
    }
  }, [locations])

  // Add new location
  const addLocation = (location) => {
    setLocations(prev => [...prev, location])
  }

  // Update location
  const updateLocation = (id, updatedLocation) => {
    setLocations(prev => 
      prev.map(loc => loc.id === id ? { ...loc, ...updatedLocation } : loc)
    )
  }

  // Delete location
  const deleteLocation = (id) => {
    setLocations(prev => prev.filter(loc => loc.id !== id))
  }

  // Delete multiple locations
  const deleteLocations = (ids) => {
    setLocations(prev => prev.filter(loc => !ids.includes(loc.id)))
  }

  // Get location by id
  const getLocation = (id) => {
    return locations.find(loc => loc.id === id)
  }

  const value = {
    locations,
    setLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    deleteLocations,
    getLocation
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

// Custom hook to use Location Context
export function useLocations() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocations must be used within LocationProvider')
  }
  return context
}

export default LocationContext
