import React, { createContext, useState, useContext } from 'react'

// Create Context
const LocationContext = createContext()

// Initial locations data
const initialLocations = [
  {
    id: 1,
    name: 'สำนักใหญ่ TGS',
    description: 'ศูนย์การประชุมหลัก',
    radius: 200,
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
  }
]

// Provider Component
export function LocationProvider({ children }) {
  const [locations, setLocations] = useState(initialLocations)

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
