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
    status: 'active',
    // ✅ สาขา BKK - Admin จะเห็นอันนี้
    createdBy: {
      userId: 1,
      username: 'BKK1010001',
      branch: '101'
    }
  },
  {
    id: 2,
    name: 'Site Event ซอยนามบัญญัติ',
    description: 'บางนา กรุงเทพฯ',
    radius: 150,
    latitude: 13.7650,
    longitude: 100.5050,
    status: 'active',
    // สาขาอื่น - Admin BKK จะไม่เห็น
    createdBy: {
      userId: 2,
      username: 'CNX1020001',
      branch: '102'
    }
  },
  {
    id: 3,
    name: 'Site Event แยกจักรพรรดิ์',
    description: 'บางนา กรุงเทพฯ',
    radius: 100,
    latitude: 13.7580,
    longitude: 100.5100,
    status: 'active',
    // สาขาอื่น - Admin BKK จะไม่เห็น
    createdBy: {
      userId: 5,
      username: 'PKT2010001',
      branch: '201'
    }
  },
  {
    id: 4,
    name: 'โบเทค บางนา Hall 101',
    description: 'ศูนย์แสดงสินค้าและนิทรรศการ บางนา',
    radius: 200,
    latitude: 13.6709,
    longitude: 100.6311,
    status: 'active',
    // สาขาอื่น - Admin BKK จะไม่เห็น
    createdBy: {
      userId: 6,
      username: 'CMI3010001',
      branch: '301'
    }
  },
  {
    id: 5,
    name: 'CentralWorld ชั้น 3',
    description: 'ศูนย์การค้า CentralWorld',
    radius: 150,
    latitude: 13.7469,
    longitude: 100.5397,
    status: 'active',
    // สาขาอื่น - Admin BKK จะไม่เห็น
    createdBy: {
      userId: 2,
      username: 'CNX1020001',
      branch: '102'
    }
  },
  {
    id: 6,
    name: 'สำนักงานใหญ่ ชั้น 5',
    description: 'สำนักงานใหญ่บริษัท',
    radius: 100,
    latitude: 13.7563,
    longitude: 100.5018,
    status: 'active',
    // สาขาอื่น - Admin BKK จะไม่เห็น
    createdBy: {
      userId: 5,
      username: 'PKT2010001',
      branch: '201'
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
    
    // SuperAdmin เห็นทุกอย่าง
    if (user.role === 'superadmin') {
      return locations
    }
    
    // Admin เห็นเฉพาะสาขาของตัวเอง
    if (user.role === 'admin') {
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
