import React, { createContext, useState, useContext } from 'react'

// Create Context
const LocationContext = createContext()

// Initial locations data
const initialLocations = [
  // ========== กรุงเทพ (BKK - Branch 101) ==========
  {
    id: 1,
    name: 'สำนักงานใหญ่ TGS กรุงเทพ',
    description: 'สำนักงานใหญ่ ถนนสาทร กรุงเทพฯ',
    radius: 150,
    latitude: 13.7245,
    longitude: 100.5316,
    status: 'active',
    createdBy: {
      userId: 1,
      username: 'BKK1010001',
      branch: '101'
    }
  },
  
  // ========== เชียงใหม่ (CNX - Branch 102) ==========
  {
    id: 2,
    name: 'สำนักงานสาขาเชียงใหม่',
    description: 'สำนักงานสาขา ใกล้ประตูท่าแพ เชียงใหม่',
    radius: 120,
    latitude: 18.7883,
    longitude: 98.9853,
    status: 'active',
    createdBy: {
      userId: 2,
      username: 'CNX1020001',
      branch: '102'
    }
  },
  
  // ========== ภูเก็ต (PKT - Branch 201) ==========
  {
    id: 3,
    name: 'สำนักงานสาขาภูเก็ต',
    description: 'สำนักงานสาขา เมืองภูเก็ต',
    radius: 130,
    latitude: 7.8804,
    longitude: 98.3923,
    status: 'active',
    createdBy: {
      userId: 5,
      username: 'PKT2010001',
      branch: '201'
    }
  },
  
  // ========== ภาคตะวันตก - กาญจนบุรี (KAN - Branch 301) ==========
  {
    id: 4,
    name: 'สำนักงานสาขากาญจนบุรี',
    description: 'สำนักงานสาขา เมืองกาญจนบุรี',
    radius: 140,
    latitude: 14.0227,
    longitude: 99.5328,
    status: 'active',
    createdBy: {
      userId: 6,
      username: 'KAN3010001',
      branch: '301'
    }
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
        // ลบข้อมูลที่ซ้ำกัน (ตาม id)
        const uniqueLocations = []
        const seenIds = new Set()
        
        for (const loc of parsed) {
          if (!seenIds.has(loc.id)) {
            seenIds.add(loc.id)
            uniqueLocations.push(loc)
          }
        }
        
        // Merge: เพิ่ม locations ใหม่จาก initialLocations ที่ยังไม่มีใน localStorage
        const existingIds = new Set(uniqueLocations.map(loc => loc.id))
        const newLocations = initialLocations.filter(loc => !existingIds.has(loc.id))
        return [...uniqueLocations, ...newLocations]
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

  // ✅ Get filtered locations based on user role and branch
  const getFilteredLocations = (user) => {
    if (!user) return []
    
    const userRole = user.role?.toLowerCase()
    
    // SuperAdmin เห็นทุกอย่าง
    if (userRole === 'superadmin' || userRole === 'super admin') {
      return locations
    }
    
    // Admin เห็นเฉพาะสาขาของตัวเอง
    if (userRole === 'admin') {
      return locations.filter(loc => {
        // ถ้ายังไม่มี branch (location เก่า) ให้แสดงทุกอัน
        if (!loc.createdBy?.branch) return true
        // ถ้ามี branch ให้แสดงเฉพาะที่ตรงกับสาขาของ admin
        return loc.createdBy.branch === user.branchCode
      })
    }
    
    // Role อื่นๆ ไม่เห็น
    return []
  }

  const value = {
    locations,
    setLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    deleteLocations,
    getLocation,
    getFilteredLocations
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
