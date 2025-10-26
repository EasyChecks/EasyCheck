import React, { useState, useRef, useEffect } from 'react'
import { sampleSchedules } from './DataAttendance.jsx'
import CreateAttendance from './CreateAttendance.jsx'
import { useLocations } from '../../../contexts/LocationContext'
import { MapContainer, TileLayer, Marker, Circle, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function Attendance() {
  const { locations } = useLocations()
  
  // Load schedules from localStorage or use sampleSchedules as default
  const [schedules, setSchedules] = useState(() => {
    const savedSchedules = localStorage.getItem('attendanceSchedules')
    if (savedSchedules) {
      try {
        return JSON.parse(savedSchedules)
      } catch (error) {
        console.error('Error parsing saved schedules:', error)
        // บันทึก sampleSchedules ลง localStorage ถ้า parse error
        localStorage.setItem('attendanceSchedules', JSON.stringify(sampleSchedules))
        return sampleSchedules
      }
    }
    // บันทึก sampleSchedules ลง localStorage ถ้ายังไม่มีข้อมูล
    localStorage.setItem('attendanceSchedules', JSON.stringify(sampleSchedules))
    return sampleSchedules
  })
  
  const [openIds, setOpenIds] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const wrapperRefs = useRef({})
  const innerRefs = useRef({})
  const endListenersRef = useRef({}) // เก็บ listener ปัจจุบันต่อรายการ

  // Save schedules to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('attendanceSchedules', JSON.stringify(schedules))
  }, [schedules])

  useEffect(() => {
    Object.values(wrapperRefs.current).forEach(w => {
      if (!w) return
      w.style.overflow = 'hidden'
      w.style.maxHeight = '0px'
      w.style.opacity = '0'
      w.style.transition = 'max-height 280ms cubic-bezier(.2,.8,.2,1), opacity 200ms ease'
      w.style.willChange = 'max-height, opacity'
      // give layout containment hint to reduce paint of siblings
      try { w.style.contain = 'layout'; } catch (e) {}
    })
    Object.values(innerRefs.current).forEach(i => {
      if (!i) return
      i.style.transform = 'translateY(-6px)'
      i.style.opacity = '0'
      i.style.transition = 'transform 240ms cubic-bezier(.2,.85,.2,1), opacity 200ms ease'
      i.style.willChange = 'transform, opacity'
      i.style.transformOrigin = 'top center'
    })
  }, [])

  const toggleDetails = (id) => {
    const wrapper = wrapperRefs.current[id]
    const inner = innerRefs.current[id]
    const isOpen = openIds.includes(id)

    if (!wrapper || !inner) {
      setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
      return
    }

    if (!isOpen) {
      // ถ้ามี listener เก่าให้ลบก่อน เพื่อไม่ให้ listener เก่ามากระทบหลังจาก reopen
      if (endListenersRef.current[id]) {
        wrapper.removeEventListener('transitionend', endListenersRef.current[id])
        delete endListenersRef.current[id]
      }

      wrapper.style.transition = 'none'
      wrapper.style.maxHeight = '0px'
      wrapper.style.opacity = '0'
      inner.style.transform = 'translateY(-8px)'
      inner.style.opacity = '0'
      void wrapper.offsetHeight

      // update openIds after layout flush so starting the animation isn't
      // interrupted by a React rerender which may affect refs/styles
      setOpenIds(prev => prev.includes(id) ? prev : [...prev, id])

      requestAnimationFrame(() => {
        const h = inner.scrollHeight
        wrapper.style.transition = 'max-height 320ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease'
        wrapper.style.maxHeight = `${h}px`
        wrapper.style.opacity = '1'
        inner.style.transform = 'translateY(0)'
        inner.style.opacity = '1'

        const onEnd = (e) => {
          if (e.propertyName === 'max-height') {
            wrapper.style.maxHeight = 'none'
            wrapper.removeEventListener('transitionend', onEnd)
            if (endListenersRef.current[id] === onEnd) delete endListenersRef.current[id]
          }
        }
        // เก็บ listener เพื่อให้ลบได้ถ้าผู้ใช้ toggle ใหม่ก่อนจบ transition
        endListenersRef.current[id] = onEnd
        wrapper.addEventListener('transitionend', onEnd)
      })
  } else {
      // ถ้ามี listener เก่า ให้ลบก่อน เพื่อไม่ให้ callback เก่าไป setOpenId หลังจาก reopen
      if (endListenersRef.current[id]) {
        wrapper.removeEventListener('transitionend', endListenersRef.current[id])
        delete endListenersRef.current[id]
      }

      const currentMax = getComputedStyle(wrapper).maxHeight
      if (currentMax === 'none') wrapper.style.maxHeight = `${inner.scrollHeight}px`
      wrapper.style.opacity = '1'
      inner.style.transform = 'translateY(-8px)'
      inner.style.opacity = '0'
      void wrapper.offsetHeight

      requestAnimationFrame(() => {
        wrapper.style.transition = 'max-height 260ms cubic-bezier(.2,.85,.2,1), opacity 200ms ease'
        wrapper.style.maxHeight = '0px'
        wrapper.style.opacity = '0'
      })

      const onEndClose = (e) => {
        if (e.propertyName === 'max-height') {
          wrapper.removeEventListener('transitionend', onEndClose)
          if (endListenersRef.current[id] === onEndClose) delete endListenersRef.current[id]
          setOpenIds(prev => prev.filter(x => x !== id))
        }
      }
      endListenersRef.current[id] = onEndClose
      wrapper.addEventListener('transitionend', onEndClose)
    }
  }

  const toggleSelectMode = () => {
    if (selectMode) {
      setSelectedIds([])
      setSelectMode(false)
    } else {
      setSelectMode(true)
      setOpenIds([])
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      return [...prev, id]
    })
  }

  const confirmDelete = () => {
    if (selectedIds.length === 0) return
    setSchedules(prev => prev.filter(s => !selectedIds.includes(s.id)))
    setSelectedIds([])
    setSelectMode(false)
    setOpenIds([])
    setShowDeleteSelectedConfirm(false)
    
    // แสดง popup สำเร็จ
    setSuccessMessage(`ลบตารางงานที่เลือกเรียบร้อย!`)
    setShowSuccessPopup(true)
    
    // ปิด popup อัตโนมัติหลัง 3 วินาที
    setTimeout(() => {
      setShowSuccessPopup(false)
    }, 3000)
  }

  // ลบทั้งหมด (ทำงานจริงเมื่อผู้ใช้ยืนยันจาก modal)
  const deleteAll = () => {
    if (schedules.length === 0) return
    setSchedules([])
    setSelectedIds([])
    setSelectMode(false)
    setOpenIds([])
    setShowDeleteAllConfirm(false)
    
    // แสดง popup สำเร็จ
    setSuccessMessage('ลบตารางงานทั้งหมดเรียบร้อย!')
    setShowSuccessPopup(true)
    
    // ปิด popup อัตโนมัติหลัง 3 วินาที
    setTimeout(() => {
      setShowSuccessPopup(false)
    }, 3000)
  }

  const handleCreate = (newItem) => {
    setSchedules(prev => [...prev, newItem])
    setShowCreate(false)
    
    // แสดง popup สำเร็จ
    setSuccessMessage('สร้างตารางงานเรียบร้อย!')
    setShowSuccessPopup(true)
    
    // ปิด popup อัตโนมัติหลัง 3 วินาที
    setTimeout(() => {
      setShowSuccessPopup(false)
    }, 3000)
  }

  const handleUpdate = (updated) => {
    setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s))
    setShowEdit(false)
    setEditingItem(null)
    
    // แสดง popup สำเร็จ
    setSuccessMessage('ปรับตารางงานเรียบร้อย!')
    setShowSuccessPopup(true)
    
    // ปิด popup อัตโนมัติหลัง 3 วินาที
    setTimeout(() => {
      setShowSuccessPopup(false)
    }, 3000)
  }

    return (
      <div className="w-full bg-gray-50 min-h-screen overflow-y-auto" 
      style={{ scrollbarGutter: 'stable' }}
      >
        <div className="w-full pl-3 pr-2 md:pl-4 md:pr-2 lg:pl-6 lg:pr-3 py-6">
          <div
            className="w-full mx-auto bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            style={{ boxShadow: '0 12px 28px rgba(11,43,87,0.08)' }}
          >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0b2b57]">จัดตารางงาน</h2>
              <p className="text-sm text-gray-600 mt-1">ตรวจสอบและปรับตารางให้เหมาะสมกับจำนวนพนักงานและพื้นที่</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={() => setShowCreate(true)} 
                className="inline-flex items-center justify-center text-base font-semibold bg-gradient-to-br from-sky-500 to-blue-500 text-white min-w-[120px] h-10 px-5 leading-none hover:from-sky-600 hover:to-cyan-600 rounded-xl shadow-md transition-all duration-200"
              >
                สร้างตารางใหม่
              </button>

              {!selectMode ? (
                // ปกติ: แสดงปุ่มเข้าสู่โหมดลบ
                <button 
                  onClick={toggleSelectMode} 
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white rounded-lg shadow-md hover:shadow-lg hover:from-[#dc2626] hover:to-[#b91c1c] transition-all duration-200 font-medium text-sm"
                >

                  ลบตาราง
                </button>
              ) : (
                // ในโหมดเลือก: แสดงปุ่มลบทั้งหมด, ลบที่เลือก, ยกเลิก
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    disabled={schedules.length === 0}
                    className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                      schedules.length === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-600 text-white shadow-md hover:shadow-lg hover:bg-red-500'
                    }`}
                  >
                    ลบทั้งหมด
                  </button>

                  <button
                    onClick={() => setShowDeleteSelectedConfirm(true)}
                    disabled={selectedIds.length === 0}
                    className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                      selectedIds.length === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-600 text-white shadow-md hover:shadow-lg hover:bg-red-500'
                    }`}
                  >
                    ลบที่เลือก ({selectedIds.length})
                  </button>

                  <button 
                    onClick={toggleSelectMode} 
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
          </div>
        </div>

        <div className="space-y-6">
          {schedules.length === 0 && (
            <div className="text-center text-gray-600 py-8">ไม่มีตารางงาน</div>
          )}

          {schedules.map(item => {
            const isOpen = openIds.includes(item.id)
            const checked = selectedIds.includes(item.id)

            return (
              <div
                key={item.id}
                className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 pb-4 text-white shadow-lg min-h-[120px] mb-6"
              >
                {/* top-right: checkbox (in select mode) + time pill (always shown) */}
                <div className="absolute top-4 right-4 flex items-center space-x-3">
                  <div className="bg-white/20 text-white px-3 py-1.5 rounded-full text-sm border border-white/30 shadow-sm">
                    {item.time}
                  </div>
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(item.id)}
                      className="w-5 h-5 rounded border-white/40 bg-white"
                      aria-label={`เลือก ${item.team}`}
                    />
                  )}
                </div>

                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-2xl">{item.team}</h3>
                    <div className="text-base text-white/95 mt-1 space-y-1">
                      <div className="leading-tight">วันที่: {item.date}</div>
                      <div className="leading-tight">สถานที่: {item.location}</div>
                      <div className="leading-tight">สมาชิก: {item.members}</div>
                      <div className="leading-tight">ประเภทงาน: {item.type}</div>
                    </div>

                    <div className="mt-6 mb-2 flex items-center gap-2 flex-wrap">
                      {/* Primary button - unified size */}
                      <button
                        onClick={() => { setEditingItem(item); setShowEdit(true); }}
                        className="inline-flex items-center justify-center text-base font-semibold bg-gradient-to-br from-sky-400 to-blue-500 text-white min-w-[120px] h-10 px-5 leading-none hover:from-sky-600 hover:to-cyan-700 rounded-xl shadow-md transition-all duration-200"
                        style={{ boxShadow: '0 6px 18px rgba(11,43,87,0.12)' }}
                      >
                        ปรับตาราง
                      </button>

                      {/* Secondary toggle - unified size */}
                      <button
                        onClick={() => toggleDetails(item.id)}
                        aria-expanded={isOpen}
                        className="relative inline-flex items-center justify-center text-base font-semibold rounded-xl shadow-md transition-all duration-200 overflow-hidden bg-white text-[#0b2b57] border-2 border-white/50 min-w-[120px] h-10 px-5 leading-none hover:bg-gray-50"
                        style={{ boxShadow: '0 6px 18px rgba(11,43,87,0.12)' }}
                      >
                        <span
                          aria-hidden={isOpen}
                          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[220ms] ease-in-out pointer-events-none ${isOpen ? 'opacity-0' : 'opacity-100'}`}
                        >
                          รายละเอียด
                        </span>

                        <span
                          aria-hidden={!isOpen}
                          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[220ms] ease-in-out pointer-events-none ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                        >
                          ซ่อนรายละเอียด
                        </span>

                        <span className="sr-only">{isOpen ? 'ซ่อนรายละเอียด' : 'รายละเอียด'}</span>
                      </button>
                    </div>

                    <div
                      ref={el => {
                        if (el && !el.dataset.attInit) {
                          // initialize wrapper styles only once per DOM node
                          el.style.overflow = 'hidden'
                          el.style.maxHeight = '0px'
                          el.style.opacity = '0'
                          el.style.transition = 'max-height 320ms cubic-bezier(.4,0,.2,1), opacity 220ms ease'
                          el.dataset.attInit = '1'
                        }
                        wrapperRefs.current[item.id] = el
                      }}
                      aria-hidden={!isOpen}
                      className="mt-4"
                    >
                      <div
                        ref={el => {
                            if (el && !el.dataset.attInnerInit) {
                              el.style.transform = 'translateY(-6px)'
                              el.style.opacity = '0'
                              el.style.transition = 'transform 260ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease'
                              el.dataset.attInnerInit = '1'
                            }
                            innerRefs.current[item.id] = el
                        }}
                        className="bg-white text-gray-800 rounded-md p-4 border border-gray-200"
                      >
                        {/* Layout: Left side (Info) + Right side (Map) */}
                        {(() => {
                          const locationData = locations.find(loc => loc.name === item.location)
                          
                          return (
                            <div className="flex flex-col lg:flex-row gap-6">
                              {/* Left Side - Information */}
                              <div className="flex-1 space-y-4">
                                <div className="mb-3">
                                  <h4 className="font-semibold mb-2 text-base">ภารกิจหลัก:</h4>
                                  <ul className="list-disc pl-5 text-sm space-y-1">
                                    {item.tasks?.map((t, idx) => <li key={idx}>{t}</li>)}
                                  </ul>
                                </div>

                                <div className="mb-3">
                                  <h4 className="font-semibold mb-2 text-base">สิ่งที่ต้องเตรียม:</h4>
                                  <ul className="list-disc pl-5 text-sm space-y-1">
                                    {item.preparations?.map((p, idx) => <li key={idx}>{p}</li>)}
                                  </ul>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2 text-base">เป้าหมาย:</h4>
                                  <ul className="list-disc pl-5 text-sm space-y-1">
                                    {item.goals?.map((g, idx) => <li key={idx}>{g}</li>)}
                                  </ul>
                                </div>
                              </div>

                              {/* Right Side - Map */}
                              {locationData && (
                                <div className="lg:w-[400px] flex-shrink-0">
                                  <h4 className="font-semibold mb-3 text-base flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
                                    </svg>
                                    แผนที่ตำแหน่ง
                                  </h4>
                                  <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-blue-200 shadow-lg">
                                    <MapContainer
                                      center={[locationData.latitude, locationData.longitude]}
                                      zoom={16}
                                      style={{ height: '100%', width: '100%' }}
                                      scrollWheelZoom={true}
                                      zoomControl={true}
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
                                      
                                      <Marker position={[locationData.latitude, locationData.longitude]} />
                                      <Circle
                                        center={[locationData.latitude, locationData.longitude]}
                                        radius={locationData.radius}
                                        pathOptions={{ 
                                          color: 'green',
                                          fillColor: 'green',
                                          fillOpacity: 0.2 
                                        }}
                                      />
                                    </MapContainer>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2 text-center">
                                    วงกลมสีเขียวแสดงพื้นที่ที่สามารถเช็คอินได้
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* show modal when creating */}
        {showCreate && (
          <CreateAttendance
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}

        {/* Edit modal (reuse CreateAttendance in edit mode) */}
        {showEdit && editingItem && (
          <CreateAttendance
            onClose={() => { setShowEdit(false); setEditingItem(null) }}
            onUpdate={handleUpdate}
            initialData={editingItem}
          />
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 border-2 border-green-400 pointer-events-auto animate-bounce-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{successMessage}</h3>
                  <p className="text-sm text-gray-600 mt-1">ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว</p>
                </div>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Confirmation Modal */}
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[9998]" role="dialog" aria-modal="true">
            {/* Backdrop with blur and dim */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
              onClick={() => setShowDeleteAllConfirm(false)}
            />

            {/* Modal content card with border, ring and elevated shadow */}
            <div
              className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-200 shadow-2xl z-[9999]"
              style={{ boxShadow: '0 10px 30px rgba(11,43,87,0.18)' }}
              role="document"
            >
              <h3 className="text-lg font-semibold text-gray-800">ยืนยันการลบทั้งหมด</h3>
              <p className="text-sm text-gray-600 mt-2">คุณแน่ใจหรือไม่ว่าต้องการลบตารางทั้งหมด ({schedules.length} รายการ)? การกระทำนี้ไม่สามารถย้อนกลับได้</p>

              <div className="mt-4 flex justify-end items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteAllConfirm(false)} 
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="button" 
                  onClick={deleteAll} 
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-red-500 transition-all duration-200 font-medium text-sm"
                >
                  ลบทั้งหมด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Selected Confirmation Modal */}
        {showDeleteSelectedConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[9998]" role="dialog" aria-modal="true">
            {/* Backdrop with blur and dim */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
              onClick={() => setShowDeleteSelectedConfirm(false)}
            />

            {/* Modal content card with border, ring and elevated shadow */}
            <div
              className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-200 shadow-2xl z-[9999]"
              style={{ boxShadow: '0 10px 30px rgba(11,43,87,0.18)' }}
              role="document"
            >
              <h3 className="text-lg font-semibold text-gray-800">ยืนยันการลบที่เลือก</h3>
              <p className="text-sm text-gray-600 mt-2">คุณแน่ใจหรือไม่ว่าต้องการลบตารางที่เลือก ({selectedIds.length} รายการ)? การกระทำนี้ไม่สามารถย้อนกลับได้</p>

              <div className="mt-4 flex justify-end items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteSelectedConfirm(false)} 
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="button" 
                  onClick={confirmDelete} 
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-red-500 transition-all duration-200 font-medium text-sm"
                >
                  ลบที่เลือก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

export default Attendance