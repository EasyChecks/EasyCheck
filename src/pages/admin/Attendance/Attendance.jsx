import React, { useState, useRef, useEffect } from 'react'
import { sampleSchedules } from './DataAttendance.jsx'
import CreateAttendance from './CreateAttendance.jsx'

function Attendance() {
  const [schedules, setSchedules] = useState(sampleSchedules)
  const [openIds, setOpenIds] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const wrapperRefs = useRef({})
  const innerRefs = useRef({})
  const endListenersRef = useRef({}) // เก็บ listener ปัจจุบันต่อรายการ

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
    const remaining = schedules.filter(s => !selectedIds.includes(s.id))
    setSchedules(remaining)
    setSelectedIds([])
    setSelectMode(false)
    setOpenIds([])
  }

  // ลบทั้งหมด (ทำงานจริงเมื่อผู้ใช้ยืนยันจาก modal)
  const deleteAll = () => {
    if (schedules.length === 0) return
    setSchedules([])
    setSelectedIds([])
    setSelectMode(false)
    setOpenIds([])
    setShowDeleteAllConfirm(false)
  }

  const handleCreate = (newItem) => {
    setSchedules(prev => [newItem, ...prev])
    setShowCreate(false)
  }

      return (
        <div className="bg-gray-50 h-screen" style={{ height: '100vh', overflowY: 'auto', scrollbarGutter: 'stable' }}>
      <div className="w-full px-4 md:px-8 lg:px-12 py-8">
        <div
          className="w-full mx-auto bg-white rounded-2xl p-6 shadow-xl border border-gray-200 max-w-screen-2xl"
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
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              สร้างตารางใหม่
            </button>

            {!selectMode ? (
              // ปกติ: แสดงปุ่มเข้าสู่โหมดลบ
              <button 
                onClick={toggleSelectMode} 
                className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-white rounded-full shadow-md hover:shadow-lg hover:from-[#d97706] hover:to-[#b45309] transition-all duration-200 font-medium text-sm"
              >

                ลบตาราง
              </button>
            ) : (
              // ในโหมดเลือก: แสดงปุ่มลบทั้งหมด, ลบที่เลือก, ยกเลิก
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  disabled={schedules.length === 0}
                  className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full transition-all duration-200 font-medium text-sm ${
                    schedules.length === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-600 text-white shadow-md hover:shadow-lg hover:bg-red-500'
                  }`}
                >
                  ลบทั้งหมด
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={selectedIds.length === 0}
                  className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full transition-all duration-200 font-medium text-sm ${
                    selectedIds.length === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-600 text-white shadow-md hover:shadow-lg hover:bg-red-500'
                  }`}
                >
                  ลบที่เลือก ({selectedIds.length})
                </button>

                <button 
                  onClick={toggleSelectMode} 
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
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
                className="relative bg-[#2b78d3] rounded-2xl p-5 pb-4 text-white shadow-lg min-h-[120px] mb-6"
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
                      <button onClick={() => { setEditingItem(item); setShowEdit(true); }} className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-b from-[#06b6d4] to-[#0891b2] text-white rounded-full text-base font-semibold shadow-md hover:shadow-lg hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200">
                        ปรับตาราง
                      </button>
                      <button
                        onClick={() => toggleDetails(item.id)}
                        className="inline-flex items-center justify-center px-5 py-2 bg-white text-[#0b2b57] rounded-full text-base font-semibold border-2 border-white/50 hover:bg-white/90 transition-all duration-200 shadow-sm"
                      >
                        {isOpen ? 'ซ่อนรายละเอียด' : 'รายละเอียด'}
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
            onUpdate={(updated) => {
              setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s))
              setShowEdit(false)
              setEditingItem(null)
            }}
            initialData={editingItem}
          />
        )}

        {/* Delete All Confirmation Modal */}
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9998 }} role="dialog" aria-modal="true">
            {/* Backdrop with blur and dim */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDeleteAllConfirm(false)}
              style={{ zIndex: 9998 }}
            />

            {/* Modal content card with border, ring and elevated shadow */}
            <div
              className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-200 shadow-2xl"
              style={{ zIndex: 9999, boxShadow: '0 10px 30px rgba(11,43,87,0.18)' }}
              role="document"
            >
              <h3 className="text-lg font-semibold text-gray-800">ยืนยันการลบทั้งหมด</h3>
              <p className="text-sm text-gray-600 mt-2">คุณแน่ใจหรือไม่ว่าต้องการลบตารางทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้</p>

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
      </div>
    </div>
  </div>
  )
}

export default Attendance