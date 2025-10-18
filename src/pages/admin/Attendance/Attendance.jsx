import React, { useState, useRef, useEffect } from 'react'
import { sampleSchedules } from './DataAttendance.jsx'
import CreateAttendance from './CreateAttendance.jsx'

function Attendance() {
  const [schedules, setSchedules] = useState(sampleSchedules)
  const [openId, setOpenId] = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const wrapperRefs = useRef({})
  const innerRefs = useRef({})
  const endListenersRef = useRef({}) // เก็บ listener ปัจจุบันต่อรายการ

  useEffect(() => {
    Object.values(wrapperRefs.current).forEach(w => {
      if (!w) return
      w.style.overflow = 'hidden'
      w.style.maxHeight = '0px'
      w.style.opacity = '0'
      w.style.transition = 'max-height 320ms cubic-bezier(.4,0,.2,1), opacity 220ms ease'
    })
    Object.values(innerRefs.current).forEach(i => {
      if (!i) return
      i.style.transform = 'translateY(-6px)'
      i.style.opacity = '0'
      i.style.transition = 'transform 260ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease'
    })
  }, [schedules])

  const toggleDetails = (id) => {
     const wrapper = wrapperRefs.current[id]
     const inner = innerRefs.current[id]
     const isOpen = openId === id

    if (!wrapper || !inner) {
      setOpenId(prev => (prev === id ? null : id))
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

      setOpenId(id)

      requestAnimationFrame(() => {
        const h = inner.scrollHeight
        wrapper.style.transition = 'max-height 360ms cubic-bezier(.4,0,.2,1), opacity 240ms ease'
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
        wrapper.style.transition = 'max-height 320ms cubic-bezier(.4,0,.2,1), opacity 220ms ease'
        wrapper.style.maxHeight = '0px'
        wrapper.style.opacity = '0'
      })

      const onEndClose = (e) => {
        if (e.propertyName === 'max-height') {
          wrapper.removeEventListener('transitionend', onEndClose)
          if (endListenersRef.current[id] === onEndClose) delete endListenersRef.current[id]
          setOpenId(null)
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
      setOpenId(null)
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
    setOpenId(null)
  }

  const handleCreate = (newItem) => {
    setSchedules(prev => [newItem, ...prev])
    setShowCreate(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0b2b57]">จัดตารางงาน</h2>
            <p className="text-sm text-gray-600 mt-1">ตรวจสอบและปรับตารางให้เหมาะสมกับจำนวนพนักงานและพื้นที่</p>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#1877F2] text-white rounded shadow">สร้างตารางใหม่</button>

            {!selectMode ? (
              <button onClick={toggleSelectMode} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">ลบตาราง</button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={confirmDelete}
                  disabled={selectedIds.length === 0}
                  className={`px-4 py-2 rounded ${selectedIds.length === 0 ? 'bg-gray-300 text-gray-600' : 'bg-red-500 text-white'}`}
                >
                  ลบตารางที่เลือก ({selectedIds.length})
                </button>
                <button onClick={toggleSelectMode} className="px-4 py-2 bg-white text-gray-700 rounded border">ยกเลิก</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {schedules.length === 0 && (
            <div className="text-center text-gray-600 py-8">ไม่มีตารางงาน</div>
          )}

          {schedules.map(item => {
            const isOpen = openId === item.id
            const checked = selectedIds.includes(item.id)

            return (
              <div key={item.id} className="relative bg-[#2b78d3] rounded-lg p-5 text-white shadow-md">
                {/* top-right: checkbox (in select mode) + time pill (always shown) */}
                <div className="absolute top-4 right-4 flex items-center space-x-3">
                  <div className="bg-white/20 text-white px-4 py-1 rounded-full text-sm border border-white/30">
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
                    <h3 className="font-semibold text-lg">{item.team}</h3>
                    <div className="text-xs text-white/90 mt-2 space-y-1">
                      <div>วันที่: {item.date}</div>
                      <div>สถานที่: {item.location}</div>
                      <div>สมาชิก: {item.members}</div>
                      <div>ประเภทงาน: {item.type}</div>
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      <button className="px-3 py-1 bg-[#0a62b3] text-white rounded text-sm">ปรับตาราง</button>
                      {/* details button always shown now */}
                      <button
                        onClick={() => toggleDetails(item.id)}
                        className="px-3 py-1 bg-white text-[#0b2b57] rounded text-sm border border-white/40"
                      >
                        {isOpen ? 'ซ่อนรายละเอียด' : 'รายละเอียด'}
                      </button>
                    </div>

                    <div
                      ref={el => { wrapperRefs.current[item.id] = el }}
                      aria-hidden={!isOpen}
                      className="mt-4"
                    >
                      <div
                        ref={el => { innerRefs.current[item.id] = el }}
                        className="bg-white text-gray-800 rounded-md p-4 border border-gray-200"
                      >
                        <div className="mb-3">
                          <h4 className="font-semibold mb-2">ภารกิจหลัก:</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {item.tasks?.map((t, idx) => <li key={idx}>{t}</li>)}
                          </ul>
                        </div>

                        <div className="mb-3">
                          <h4 className="font-semibold mb-2">สิ่งที่ต้องเตรียม:</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {item.preparations?.map((p, idx) => <li key={idx}>{p}</li>)}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">เป้าหมาย:</h4>
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
      </div>
    </div>
  )
}

export default Attendance