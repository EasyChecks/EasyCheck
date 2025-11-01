import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, LayersControl, useMap, Popup } from 'react-leaflet'
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

// Add animations style
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`
document.head.appendChild(style)

// Component to handle map clicks
function MapClickHandler({ onMapClick, isActive }) {
  useMapEvents({
    click: (e) => {
      if (isActive) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

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
        padding: [50, 50], // Add padding around bounds
        maxZoom: 16,
        animate: true,
        duration: 0.5
      })
    }
  }, [locations, map])

  return null
}

// Custom Success Dialog
function SuccessDialog({ isOpen, message, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-6 animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#22C55E">
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">สำเร็จ!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600  text-white px-6 py-3 rounded-xl font-semibold hover:shadow-sm transition-all"
          >
            ตกลง (Enter)
          </button>
        </div>
      </div>
    </div>
  )
}

// Custom Confirm Dialog
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-6 animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#EF4444">
              <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              ยกเลิก (Esc)
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gray-600  text-white px-6 py-3 rounded-xl font-semibold hover:shadow-sm transition-all"
            >
              ยืนยัน (Enter)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Error Dialog
function ErrorDialog({ isOpen, message, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-6 animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#F97316">
              <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">ข้อผิดพลาด</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600  text-white px-6 py-3 rounded-xl font-semibold hover:shadow-sm transition-all"
          >
            ตกลง (Enter)
          </button>
        </div>
      </div>
    </div>
  )
}

function Mapping({ hideHeader = false, hideMap = false, scrollToId = null }) {
  // Use Location Context
  const { locations, addLocation, updateLocation, deleteLocation, deleteLocations } = useLocations()
  // Use Event Context (to check for duplicates)
  const { events } = useEvents()

  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [isMultiDeleteMode, setIsMultiDeleteMode] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [mapClickEnabled, setMapClickEnabled] = useState(false)
  const mapRef = useRef(null)
  const locationRefs = useRef({}) // Refs for scrolling to location cards

  // Dialog states
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, message: '' })
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: '' })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  })

  // Handle scroll to location when scrollToId changes
  useEffect(() => {
    if (scrollToId && locationRefs.current[scrollToId]) {
      setTimeout(() => {
        const element = locationRefs.current[scrollToId]
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          })
          
          element.classList.add('ring-4', 'ring-green-400')
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-green-400')
          }, 2000)
        }
      }, 400)
    }
  }, [scrollToId])

  // Form state for adding new location
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    radius: '',
    latitude: '',
    longitude: ''
  })

  // Edit form data for inline editing
  const [editFormData, setEditFormData] = useState({})

  // Map center for Bangkok
  const defaultCenter = [13.7606, 100.5034]
  const defaultZoom = 12

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        if (successDialog.isOpen) {
          setSuccessDialog({ isOpen: false, message: '' })
        } else if (errorDialog.isOpen) {
          setErrorDialog({ isOpen: false, message: '' })
        } else if (confirmDialog.isOpen) {
          if (confirmDialog.onCancel) {
            confirmDialog.onCancel()
          }
        } else if (editingId !== null) {
          handleCancelEdit()
        } else if (isAddingLocation) {
          handleCancelForm()
        } else if (isMultiDeleteMode) {
          setIsMultiDeleteMode(false)
          setSelectedLocations([])
        }
      }

      // Handle Enter key
      if (e.key === 'Enter' && !e.shiftKey) {
        if (confirmDialog.isOpen && confirmDialog.onConfirm) {
          e.preventDefault()
          confirmDialog.onConfirm()
        } else if (successDialog.isOpen) {
          e.preventDefault()
          setSuccessDialog({ isOpen: false, message: '' })
        } else if (errorDialog.isOpen) {
          e.preventDefault()
          setErrorDialog({ isOpen: false, message: '' })
        } else if (editingId !== null) {
          e.preventDefault()
          handleUpdateLocation()
        } else if (isAddingLocation) {
          e.preventDefault()
          handleSubmitLocation()
        } else if (isMultiDeleteMode && selectedLocations.length > 0) {
          e.preventDefault()
          handleDeleteSelected()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAddingLocation, editingId, isMultiDeleteMode, selectedLocations, successDialog, errorDialog, confirmDialog, formData, editFormData])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle add new location
  const handleAddLocation = () => {
    setIsAddingLocation(true)
    setMapClickEnabled(true)
    setFormData({
      name: '',
      description: '',
      radius: '',
      latitude: '',
      longitude: ''
    })
  }

  // Handle map click to get coordinates
  const handleMapClick = (latlng) => {
    if (mapClickEnabled) {
      if (isAddingLocation) {
        // For adding new location
        setFormData(prev => ({
          ...prev,
          latitude: latlng.lat.toFixed(6),
          longitude: latlng.lng.toFixed(6)
        }))
      } else if (editingId !== null) {
        // For editing location inline
        setEditFormData(prev => ({
          ...prev,
          latitude: latlng.lat.toFixed(6),
          longitude: latlng.lng.toFixed(6)
        }))
      }
    }
  }

  // Handle submit new location
  const handleSubmitLocation = () => {
    // Validation
    if (!formData.name || !formData.radius || !formData.latitude || !formData.longitude) {
      setErrorDialog({
        isOpen: true,
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อสถานที่, รัศมี, และพิกัด)'
      })
      return
    }

    const trimmedName = formData.name.trim()
    const newLat = parseFloat(formData.latitude)
    const newLng = parseFloat(formData.longitude)

    // Check for duplicate name in mapping
    const duplicateName = locations.find(loc =>
      loc.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicateName) {
      setErrorDialog({
        isOpen: true,
        message: `มีสถานที่ชื่อ "${trimmedName}" อยู่ในพื้นที่อนุญาตแล้ว กรุณาใช้ชื่ออื่น`
      })
      return
    }

    // Check for duplicate name in events
    const duplicateNameInEvents = events.find(evt =>
      evt.locationName.toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicateNameInEvents) {
      setErrorDialog({
        isOpen: true,
        message: `มีสถานที่ชื่อ "${trimmedName}" อยู่ในกิจกรรมแล้ว กรุณาใช้ชื่ออื่น`
      })
      return
    }

    // Check for duplicate coordinates in mapping (within 0.0001 degrees ~11 meters)
    const duplicateCoords = locations.find(loc =>
      Math.abs(loc.latitude - newLat) < 0.0001 &&
      Math.abs(loc.longitude - newLng) < 0.0001
    )
    if (duplicateCoords) {
      setErrorDialog({
        isOpen: true,
        message: `พิกัดนี้ใกล้เคียงกับพื้นที่อนุญาต "${duplicateCoords.name}" ที่มีอยู่แล้ว กรุณาเลือกตำแหน่งอื่น`
      })
      return
    }

    // Check for duplicate coordinates in events
    const duplicateCoordsInEvents = events.find(evt =>
      Math.abs(evt.latitude - newLat) < 0.0001 &&
      Math.abs(evt.longitude - newLng) < 0.0001
    )
    if (duplicateCoordsInEvents) {
      setErrorDialog({
        isOpen: true,
        message: `พิกัดนี้ใกล้เคียงกับกิจกรรม "${duplicateCoordsInEvents.name}" ที่มีอยู่แล้ว กรุณาเลือกตำแหน่งอื่น`
      })
      return
    }

    // Generate unique ID
    const maxId = locations.length > 0 ? Math.max(...locations.map(loc => loc.id)) : 0
    const newLocation = {
      id: maxId + 1,
      name: trimmedName,
      description: formData.description.trim() || '',
      radius: parseFloat(formData.radius),
      latitude: newLat,
      longitude: newLng,
      status: 'active'
    }

    // Add to locations array using Context
    addLocation(newLocation)

    // Reset form
    setIsAddingLocation(false)
    setMapClickEnabled(false)
    setFormData({
      name: '',
      description: '',
      radius: '',
      latitude: '',
      longitude: ''
    })

    // Show success message
    setSuccessDialog({
      isOpen: true,
      message: `เพิ่มพื้นที่ "${newLocation.name}" สำเร็จ!`
    })
  }

  // Handle edit location (inline)
  const handleEditLocation = (location) => {
    setEditingId(location.id)
    setMapClickEnabled(true)
    setEditFormData({
      name: location.name,
      description: location.description,
      radius: location.radius.toString(),
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    })
  }

  // Handle update location (inline)
  const handleUpdateLocation = () => {
    // Validation
    if (!editFormData.name || !editFormData.radius || !editFormData.latitude || !editFormData.longitude) {
      setErrorDialog({
        isOpen: true,
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อสถานที่, รัศมี, และพิกัด)'
      })
      return
    }

    const updatedName = editFormData.name.trim()
    const updatedLat = parseFloat(editFormData.latitude)
    const updatedLng = parseFloat(editFormData.longitude)

    // Check for duplicate name (excluding current location)
    const duplicateName = locations.find(loc =>
      loc.id !== editingId && loc.name.toLowerCase() === updatedName.toLowerCase()
    )
    if (duplicateName) {
      setErrorDialog({
        isOpen: true,
        message: `มีสถานที่ชื่อ "${updatedName}" อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`
      })
      return
    }

    // Check for duplicate coordinates (excluding current location)
    const duplicateCoords = locations.find(loc =>
      loc.id !== editingId &&
      Math.abs(loc.latitude - updatedLat) < 0.0001 &&
      Math.abs(loc.longitude - updatedLng) < 0.0001
    )
    if (duplicateCoords) {
      setErrorDialog({
        isOpen: true,
        message: `พิกัดนี้ใกล้เคียงกับสถานที่ "${duplicateCoords.name}" ที่มีอยู่แล้ว กรุณาเลือกตำแหน่งอื่น`
      })
      return
    }

    // Update location using Context
    updateLocation(editingId, {
      name: updatedName,
      description: editFormData.description.trim() || '',
      radius: parseFloat(editFormData.radius),
      latitude: updatedLat,
      longitude: updatedLng
    })

    // Reset edit mode
    setEditingId(null)
    setMapClickEnabled(false)
    setEditFormData({})

    // Show success message
    setSuccessDialog({
      isOpen: true,
      message: `แก้ไขพื้นที่ "${updatedName}" สำเร็จ!`
    })
  }

  // Handle cancel inline edit
  const handleCancelEdit = () => {
    setEditingId(null)
    setMapClickEnabled(false)
    setEditFormData({})
  }

  // Handle cancel form (for add location only)
  const handleCancelForm = () => {
    setIsAddingLocation(false)
    setMapClickEnabled(false)
    setFormData({
      name: '',
      description: '',
      radius: '',
      latitude: '',
      longitude: ''
    })
  }

  // Handle delete single location
  const handleDeleteLocation = (id) => {
    const location = locations.find(loc => loc.id === id)
    setConfirmDialog({
      isOpen: true,
      message: `คุณต้องการลบพื้นที่ "${location.name}" หรือไม่?`,
      onConfirm: () => {
        deleteLocation(id)
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null })
        setSuccessDialog({
          isOpen: true,
          message: `ลบพื้นที่ "${location.name}" สำเร็จ!`
        })
      },
      onCancel: () => {
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null })
      }
    })
  }

  // Handle toggle multi-delete mode
  const handleToggleMultiDelete = () => {
    setIsMultiDeleteMode(!isMultiDeleteMode)
    setSelectedLocations([])
  }

  // Handle checkbox selection
  const handleCheckboxChange = (id) => {
    setSelectedLocations(prev =>
      prev.includes(id)
        ? prev.filter(locId => locId !== id)
        : [...prev, id]
    )
  }

  // Handle delete selected locations
  const handleDeleteSelected = () => {
    if (selectedLocations.length === 0) {
      setErrorDialog({
        isOpen: true,
        message: 'กรุณาเลือกพื้นที่ที่ต้องการลบ'
      })
      return
    }

    setConfirmDialog({
      isOpen: true,
      message: `คุณต้องการลบพื้นที่ ${selectedLocations.length} รายการใช่หรือไม่?`,
      onConfirm: () => {
        const count = selectedLocations.length
        deleteLocations(selectedLocations)
        setSelectedLocations([])
        setIsMultiDeleteMode(false)
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null })
        setSuccessDialog({
          isOpen: true,
          message: `ลบพื้นที่ ${count} รายการสำเร็จ!`
        })
      },
      onCancel: () => {
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null })
      }
    })
  }

  // Handle view details button click - scroll to location card
  const handleViewDetails = (locationId) => {
    setTimeout(() => {
      const element = locationRefs.current[locationId]
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
        // Add highlight effect
        element.classList.add('ring-4', 'ring-orange-400')
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-orange-400')
        }, 2000)
      }
    }, 100)
  }

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-[#FAFBFC]"}>
      {/* Page Header */}
      {!hideHeader && (
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าพื้นที่อนุญาต</h1>
          <p className="text-sm text-gray-600 mt-1">
            กำหนดพื้นที่อนุญาตให้พนักงานเช็คเข้างานได้ พร้อมรัศมีและข้อมูลสถานที่แต่ละจุด
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className={hideHeader ? "" : "px-6 py-8 max-w-8xl mx-auto"}>

        {/* Section 1: Map with all locations */}
        {!hideMap && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">พื้นที่อนุญาตทั้งหมด</h2>
            </div>
            <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
              {locations.length} สถานที่
            </div>
          </div>

          <div className="relative h-[550px] rounded-xl overflow-hidden border-2 border-orange-200">
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
              <FitBoundsToMarkers locations={locations} />

              {locations.map((location) => (
                <React.Fragment key={location.id}>
                  <Marker
                    position={[location.latitude, location.longitude]}
                    eventHandlers={{
                      click: () => handleMarkerClick(location.id)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${location.status === 'active' ? 'bg-gray-600' : 'bg-gray-600'}`}></div>
                          <h3 className="font-bold text-gray-800">{location.name}</h3>
                        </div>
                        <p className={`text-xs font-medium mb-2 ${location.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                          {location.status === 'active' ? 'กำลังใช้งาน' : 'ไม่ได้ใช้งาน'}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">{location.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 fill-brand-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                            </svg>
                            <span>พื้นที่อนุญาต</span>
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
                          className="mt-3 w-full bg-gray-600 hover:hover:bg-gray-700 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors"
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
                      color: location.status === 'active' ? 'green' : 'red',
                      fillColor: location.status === 'active' ? 'green' : 'red',
                      fillOpacity: 0.2
                    }}
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
          </div>
        )}

        {/* Section 2: Location List */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">รายการสถานที่ทั้งหมด</h2>
            {/* Action Buttons */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">จัดการสถานที่</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleAddLocation}
                  className="flex items-center gap-3 bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-sm transition-all hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                  </svg>
                  เพิ่มพื้นที่ใหม่
                </button>

                {!isMultiDeleteMode ? (
                  <button
                    onClick={handleToggleMultiDelete}
                    className="flex items-center gap-3 bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 hover:shadow-sm transition-all hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z" />
                    </svg>
                    ลบพื้นที่ที่เลือก
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-3 bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 hover:shadow-sm transition-all hover:scale-105"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z" />
                      </svg>
                      ลบที่เลือก ({selectedLocations.length})
                    </button>
                    <button
                      onClick={handleToggleMultiDelete}
                      className="flex items-center gap-3 bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 hover:shadow-sm transition-all hover:scale-105"
                    >
                      ยกเลิก
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Add Location Form */}
        {isAddingLocation && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border-2 border-orange-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">เพิ่มพื้นที่ใหม่</h3>
              <button
                onClick={handleCancelForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                </svg>
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อสถานที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="เช่น สำนักใหญ่ TGS"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รัศมี (เมตร) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="radius"
                  value={formData.radius}
                  onChange={handleInputChange}
                  placeholder="เช่น 200"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-primary focus:outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รายละเอียดสถานที่
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="เช่น ศูนย์การประชุมหลักของหัสรักดี"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-primary focus:outline-none transition-all"
                />
              </div>

              {/* Map for selecting location in form */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    เลือกตำแหน่งบนแผนที่ <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const lat = position.coords.latitude.toFixed(6)
                            const lon = position.coords.longitude.toFixed(6)
                            setFormData(prev => ({
                              ...prev,
                              latitude: lat,
                              longitude: lon
                            }))
                            alert(`✅ ใช้ตำแหน่งปัจจุบัน:\nLat: ${lat}\nLon: ${lon}`)
                          },
                          (error) => {
                            alert(`❌ ไม่สามารถดึงตำแหน่งได้: ${error.message}`)
                          },
                          {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                          }
                        )
                      } else {
                        alert('❌ เบราว์เซอร์ไม่รองรับ Geolocation')
                      }
                    }}
                    className="flex items-center gap-2 bg-gray-600 hover:hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                      <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Z"/>
                    </svg>
                    ใช้ตำแหน่งปัจจุบัน
                  </button>
                </div>
                <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-gray-300">
                  <MapContainer
                    center={formData.latitude && formData.longitude
                      ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
                      : defaultCenter
                    }
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} isActive={true} />

                    {formData.latitude && formData.longitude && (
                      <>
                        <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
                        {formData.radius && (
                          <Circle
                            center={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                            radius={parseFloat(formData.radius) || 100}
                            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.3 }}
                          />
                        )}
                      </>
                    )}
                  </MapContainer>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-brand-primary text-white px-3 py-2 rounded-lg text-xs font-medium shadow-sm z-[1000] pointer-events-none">
                    คลิกบนแผนที่เพื่อเลือกตำแหน่ง
                  </div>
                </div>
                {formData.latitude && formData.longitude && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">พิกัดที่เลือก:</span> {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmitLocation}
                className="flex-1 bg-brand-primary  text-white px-6 py-3 rounded-xl font-semibold hover:shadow-sm transition-all hover:scale-105"
              >
                ยืนยัน
              </button>
              <button
                onClick={handleCancelForm}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

          {/* Location List - Show max 3 items, scrollable */}
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="64px" fill="#E5E7EB" className="mx-auto mb-4">
                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Z" />
              </svg>
              <p className="text-gray-500 text-lg">ยังไม่มีพื้นที่อนุญาต</p>
              <p className="text-gray-400 text-sm mt-2">คลิก "เพิ่มพื้นที่ใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            /* Location List - Show max 3 items, scrollable */
            <div className="max-h-[800px] overflow-y-auto space-y-4 pr-2">
              {locations.map((location) => {
                const isEditing = editingId === location.id
                const currentFormData = isEditing ? editFormData : location

                return (
                  <div
                    key={location.id}
                    ref={(el) => (locationRefs.current[location.id] = el)}
                    className={`rounded-xl p-5 transition-all ${isEditing
                        ? 'bg-green-50 border-2 border-green-400 shadow-sm'
                        : 'bg-orange-50 border-2 border-orange-200 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Checkbox for multi-delete mode */}
                        {isMultiDeleteMode && !isEditing && (
                          <div className="flex items-center pt-1">
                            <input
                              type="checkbox"
                              checked={selectedLocations.includes(location.id)}
                              onChange={() => handleCheckboxChange(location.id)}
                              className="w-5 h-5 text-brand-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-brand-primary cursor-pointer"
                            />
                          </div>
                        )}

                        {/* Location Icon */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isEditing
                            ? 'bg-gray-600 to-green-600'
                            : 'bg-brand-primary to-orange-600'
                          }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="white">
                            <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Z" />
                          </svg>
                        </div>

                        {/* Location Details or Edit Form */}
                        <div className="flex-1">
                          {isEditing ? (
                            /* Edit Form */
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-green-700">กำลังแก้ไข...</span>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ชื่อสถานที่ <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={currentFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    รายละเอียด
                                  </label>
                                  <input
                                    type="text"
                                    value={currentFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    รัศมี (เมตร) <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={currentFormData.radius}
                                    onChange={(e) => setEditFormData({ ...editFormData, radius: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Latitude <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.000001"
                                    value={currentFormData.latitude}
                                    onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Longitude <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.000001"
                                    value={currentFormData.longitude}
                                    onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Inline Map for Editing */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    คลิกบนแผนที่เพื่อเลือกตำแหน่งใหม่ {mapClickEnabled && <span className="text-green-600">(✓ เปิดใช้งาน)</span>}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                          (position) => {
                                            const lat = position.coords.latitude.toFixed(6)
                                            const lon = position.coords.longitude.toFixed(6)
                                            setEditFormData(prev => ({
                                              ...prev,
                                              latitude: lat,
                                              longitude: lon
                                            }))
                                            alert(`✅ ใช้ตำแหน่งปัจจุบัน:\nLat: ${lat}\nLon: ${lon}`)
                                          },
                                          (error) => {
                                            alert(`❌ ไม่สามารถดึงตำแหน่งได้: ${error.message}`)
                                          },
                                          {
                                            enableHighAccuracy: true,
                                            timeout: 10000,
                                            maximumAge: 0
                                          }
                                        )
                                      } else {
                                        alert('❌ เบราว์เซอร์ไม่รองรับ Geolocation')
                                      }
                                    }}
                                    className="flex items-center gap-2 bg-gray-600 hover:hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                                      <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Z"/>
                                    </svg>
                                    ใช้ตำแหน่งปัจจุบัน
                                  </button>
                                </div>
                                <div className="relative h-[400px] rounded-lg overflow-hidden border-2 border-green-300">
                                  <MapContainer
                                    center={[parseFloat(currentFormData.latitude), parseFloat(currentFormData.longitude)]}
                                    zoom={15}
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

                                    <MapClickHandler onMapClick={handleMapClick} isActive={mapClickEnabled} />

                                    <Marker position={[parseFloat(currentFormData.latitude), parseFloat(currentFormData.longitude)]} />
                                    {currentFormData.radius && (
                                      <Circle
                                        center={[parseFloat(currentFormData.latitude), parseFloat(currentFormData.longitude)]}
                                        radius={parseFloat(currentFormData.radius)}
                                        pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }}
                                      />
                                    )}
                                  </MapContainer>
                                  {mapClickEnabled && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm z-[1000] pointer-events-none">
                                      คลิกบนแผนที่เพื่อเลือกตำแหน่ง
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Edit Action Buttons */}
                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={handleUpdateLocation}
                                  className="flex-1 bg-gray-600  text-white px-6 py-3 rounded-xl font-semibold hover:shadow-sm transition-all hover:scale-105"
                                >
                                  บันทึกการแก้ไข
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Normal Display */
                            <>
                              <h3 className="text-lg font-bold text-gray-800 mb-1">{location.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{location.description}</p>

                              <div className="grid md:grid-cols-3 gap-3">
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-xs text-gray-600 mb-1">รัศมี</p>
                                  <p className="font-semibold text-gray-800">{location.radius} เมตร</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 md:col-span-2">
                                  <p className="text-xs text-gray-600 mb-1">พิกัด</p>
                                  <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#9CA3AF">
                                      <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Z" />
                                    </svg>
                                    <p className="text-sm text-gray-700">
                                      {location.latitude}, {location.longitude}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons (only show in normal mode) */}
                      {!isMultiDeleteMode && !isEditing && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditLocation(location)}
                            className="bg-brand-primary hover:bg-gray-700 text-white p-3 rounded-lg transition-all hover:scale-110 shadow-sm"
                            title="แก้ไข"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                              <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-all hover:scale-110 shadow-sm"
                            title="ลบ"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Dialog Components */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ isOpen: false, message: '' })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />

      <ErrorDialog
        isOpen={errorDialog.isOpen}
        message={errorDialog.message}
        onClose={() => setErrorDialog({ isOpen: false, message: '' })}
      />
    </div>
  )
}

export default Mapping