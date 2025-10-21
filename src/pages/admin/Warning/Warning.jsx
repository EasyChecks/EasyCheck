import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useLeave } from '../../../contexts/LeaveContext'
import { usersData } from '../../../data/usersData'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import SuccessDialog from '../../../components/common/SuccessDialog'

export function AttachmentModal({ data, onClose }) {
  if (!data) return null
  const { att, item } = data
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4 z-50 shadow-2xl">
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold">{att.name} — {item.name}</div>
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded">ปิด</button>
        </div>
        <div>
          {att.type === 'image' ? (
            <img src={att.url} alt={att.name} className="w-full h-auto rounded" />
          ) : (
            <div className="p-6 bg-slate-50 rounded text-sm text-slate-700">
              <div className="font-semibold mb-2">ไฟล์เอกสาร</div>
              <div>ชื่อไฟล์: {att.name}</div>
              <div className="mt-3">
                <a href={att.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ดาวน์โหลดไฟล์</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Warning() {
  const { leaveList, updateLeaveStatus } = useLeave()
  const [expandedIds, setExpandedIds] = useState([]) // ✅ เปลี่ยนจาก id เดียวเป็น array
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [combinedFilter, setCombinedFilter] = useState('ทั้งหมด')
  const wrapperRefs = useRef({})
  const innerRefs = useRef({})
  const endListenersRef = useRef({})
  const animatingIds = useRef(new Set()) // ✅ เพิ่ม: ติดตาม animation ที่กำลังทำงาน
  
  // Dialog states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [showApproveSuccess, setShowApproveSuccess] = useState(false)
  const [showRejectSuccess, setShowRejectSuccess] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // แปลง leaveList เป็น format สำหรับหน้า Warning
  const items = useMemo(() => {
    const allLeaveRequests = []
    
    // ดึงข้อมูลการลาจาก localStorage สำหรับทุก user
    // ระบบปัจจุบันเก็บ leaveList รวมกันใน localStorage key เดียว
    // แต่ไม่มี userId เก็บไว้ ดังนั้นเราจะต้องใช้ข้อมูลจาก leaveData ใน usersData
    
    // สำหรับตอนนี้ ใช้ข้อมูลจาก leaveList (ของ current user)
    // และแสดงเฉพาะที่รออนุมัติ
    return leaveList
      .filter(leave => leave.status === 'รออนุมัติ')
      .map(leave => {
        // ในอนาคตถ้า leave มี userId เก็บไว้ ก็หา user จาก userId
        // แต่ตอนนี้ใช้ current user หรือข้อมูลทั่วไป
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}')
        const user = usersData.find(u => u.username === currentUserData.username) || usersData[0]
        
        return {
          id: leave.id,
          name: user.name || 'ไม่ระบุชื่อ',
          avatar: user.profileImage || 'https://i.pravatar.cc/150?u=default',
          role: user.position || user.role || 'พนักงาน',
          department: `แผนก: ${user.department || 'ไม่ระบุ'}`,
          branch: `สาขา: ${user.branchCode || 'ไม่ระบุ'}`,
          type: `ประเภท: ${leave.leaveType}`,
          file: leave.documents && leave.documents.length > 0 ? `เอกสาร: ${leave.documents.length} ไฟล์` : 'ไม่มีเอกสารแนบ',
          time: new Date(leave.id).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          startDate: leave.startDate,
          endDate: leave.endDate,
          startTime: leave.startTime,
          endTime: leave.endTime,
          leaveMode: leave.leaveMode || 'fullday',
          days: leave.days,
          reason: leave.reason,
          userId: user.id,
          username: user.username,
          attachments: leave.documents?.map((doc, idx) => ({
            id: `${leave.id}-doc-${idx}`,
            name: doc.name || `เอกสาร ${idx + 1}`,
            url: doc.url || doc,
            type: doc.type || (typeof doc === 'string' && (doc.includes('.jpg') || doc.includes('.png') || doc.includes('.jpeg')) ? 'image' : 'document')
          })) || []
        }
      })
  }, [leaveList])

  useEffect(() => {
    Object.values(wrapperRefs.current).forEach(w => {
      if (!w) return
      w.style.overflow = 'hidden'
      w.style.maxHeight = '0px'
      w.style.opacity = '0'
      w.style.transition = 'max-height 400ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease'
      w.style.willChange = 'max-height, opacity'
    })
    Object.values(innerRefs.current).forEach(i => {
      if (!i) return
      i.style.transform = 'translateY(-8px)'
      i.style.opacity = '0'
      i.style.transition = 'transform 350ms cubic-bezier(.2,.85,.2,1), opacity 300ms ease'
      i.style.willChange = 'transform, opacity'
      i.style.transformOrigin = 'top center'
    })
  }, [])

  const handleToggle = (id) => {
    // ✅ ป้องกันการกดซ้ำขณะที่ animation กำลังทำงาน
    if (animatingIds.current.has(id)) {
      return
    }

    const wrapper = wrapperRefs.current[id]
    const inner = innerRefs.current[id]
    const isOpen = expandedIds.includes(id)

    if (!wrapper || !inner) {
      setExpandedIds(prev => (isOpen ? prev.filter(x => x !== id) : [...prev, id]))
      return
    }

    // ✅ เพิ่ม id เข้า animating set
    animatingIds.current.add(id)

    if (!isOpen) {
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

      setExpandedIds(prev => [...prev, id])

      requestAnimationFrame(() => {
        const h = inner.scrollHeight
        wrapper.style.transition = 'max-height 400ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease'
        wrapper.style.maxHeight = `${h}px`
        wrapper.style.opacity = '1'
        inner.style.transform = 'translateY(0)'
        inner.style.opacity = '1'

        const onEnd = (e) => {
          if (e.propertyName === 'max-height') {
            wrapper.style.maxHeight = 'none'
            wrapper.removeEventListener('transitionend', onEnd)
            if (endListenersRef.current[id] === onEnd) delete endListenersRef.current[id]
            // ✅ ลบ id ออกจาก animating set
            animatingIds.current.delete(id)
          }
        }
        endListenersRef.current[id] = onEnd
        wrapper.addEventListener('transitionend', onEnd)
      })
    } else {
      if (endListenersRef.current[id]) {
        wrapper.removeEventListener('transitionend', endListenersRef.current[id])
        delete endListenersRef.current[id]
      }

      wrapper.style.transition = 'none'
      wrapper.style.maxHeight = `${inner.scrollHeight}px`
      wrapper.style.opacity = '1'
      inner.style.transform = 'translateY(-8px)'
      inner.style.opacity = '0'
      void wrapper.offsetHeight

      requestAnimationFrame(() => {
        wrapper.style.transition = 'max-height 350ms cubic-bezier(.2,.85,.2,1), opacity 250ms ease'
        wrapper.style.maxHeight = '0px'
        wrapper.style.opacity = '0'
      })

      const onEndClose = (e) => {
        if (e.propertyName === 'max-height') {
          wrapper.removeEventListener('transitionend', onEndClose)
          if (endListenersRef.current[id] === onEndClose) delete endListenersRef.current[id]
          setExpandedIds(prev => prev.filter(x => x !== id))
          // ✅ ลบ id ออกจาก animating set
          animatingIds.current.delete(id)
        }
      }
      endListenersRef.current[id] = onEndClose
      wrapper.addEventListener('transitionend', onEndClose)
    }
  }

  const handleApprove = (item) => {
    setSelectedItem(item)
    setShowApproveConfirm(true)
  }

  const confirmApprove = () => {
    if (!selectedItem) return
    
    // อัพเดทสถานะเป็น "อนุมัติ"
    console.log('Approving leave:', selectedItem.id, 'Status will be: อนุมัติ')
    updateLeaveStatus(selectedItem.id, 'อนุมัติ')
    
    setExpandedIds(prev => prev.filter(x => x !== selectedItem.id))
    setModalData(prev => (prev && prev.item && prev.item.id === selectedItem.id ? null : prev))
    if (endListenersRef.current[selectedItem.id]) {
      try { wrapperRefs.current[selectedItem.id]?.removeEventListener('transitionend', endListenersRef.current[selectedItem.id]) } catch (e) {}
      delete endListenersRef.current[selectedItem.id]
    }
    delete wrapperRefs.current[selectedItem.id]
    delete innerRefs.current[selectedItem.id]
    
    setShowApproveConfirm(false)
    setShowApproveSuccess(true)
    setSelectedItem(null)
  }

  const handleReject = (item) => {
    setSelectedItem(item)
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (!selectedItem) return
    
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลที่ไม่อนุมัติ')
      return
    }
    
    // อัพเดทสถานะเป็น "ไม่อนุมัติ"
    console.log('Rejecting leave:', selectedItem.id, 'Status will be: ไม่อนุมัติ')
    updateLeaveStatus(selectedItem.id, 'ไม่อนุมัติ')
    
    setExpandedIds(prev => prev.filter(x => x !== selectedItem.id))
    setModalData(prev => (prev && prev.item && prev.item.id === selectedItem.id ? null : prev))
    if (endListenersRef.current[selectedItem.id]) {
      try { wrapperRefs.current[selectedItem.id]?.removeEventListener('transitionend', endListenersRef.current[selectedItem.id]) } catch (e) {}
      delete endListenersRef.current[selectedItem.id]
    }
    delete wrapperRefs.current[selectedItem.id]
    delete innerRefs.current[selectedItem.id]
    
    setShowRejectModal(false)
    setShowRejectSuccess(true)
    setRejectReason('')
    setSelectedItem(null)
  }

  const [modalData, setModalData] = useState(null)

  useEffect(() => {
    const handler = (e) => setModalData(e.detail)
    window.addEventListener('showAttachment', handler)
    return () => window.removeEventListener('showAttachment', handler)
  }, [])

  // Get combined filter options (departments only)
  const getCombinedFilterOptions = () => {
    const options = ['ทั้งหมด']
    
    // Add departments with prefix
    const departments = [...new Set(items.map(item => {
      if (item.department?.includes(':')) return item.department.split(':')[1].trim()
      return item.department
    }).filter(Boolean))]
    departments.forEach(dept => options.push(`แผนก: ${dept}`))
    
    return options
  }

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter (ประเภทการลา)
    let matchesStatus = true
    if (statusFilter !== 'ทั้งหมด') {
      const actualType = item.type.includes(':') 
        ? item.type.split(':')[1].trim() 
        : item.type
      matchesStatus = actualType === statusFilter
    }

    // Combined filter (department only)
    let matchesFilter = true
    if (combinedFilter !== 'ทั้งหมด') {
      const actualDept = item.department?.includes(':') ? item.department.split(':')[1].trim() : item.department
      
      if (combinedFilter.startsWith('แผนก: ')) {
        matchesFilter = actualDept === combinedFilter.replace('แผนก: ', '')
      }
    }

    return matchesSearch && matchesStatus && matchesFilter
  })

  return (
    <div className="w-full bg-gray-50 min-h-screen" style={{ overflowY: 'auto', scrollbarGutter: 'stable' }}>
      <div className="w-full pl-4 pr-2 md:pl-4 md:pr-2 lg:pl-6 lg:pr-3 py-4">
        <div
          className="w-full mx-auto bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
          style={{ boxShadow: '0 12px 28px rgba(11,43,87,0.08)' }}
        >
        <div className="max-w-auto mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0f172a]">การแจ้งเตือน</h1>
            <p className="text-sm text-slate-500">ตรวจสอบสาเหตุการลา / มาสายของพนักงาน</p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อหรือแผนก..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="sm:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm bg-white cursor-pointer"
              >
                <option value="ทั้งหมด">ทั้งหมด (ประเภท)</option>
                <option value="ลาป่วย">ลาป่วย</option>
                <option value="ลากิจ">ลากิจ</option>
                <option value="มาสาย">มาสาย</option>
                <option value="ขาดงาน">ขาดงาน</option>
              </select>
            </div>

            {/* Combined Filter Dropdown */}
            <div className="sm:w-64">
              <select
                value={combinedFilter}
                onChange={(e) => setCombinedFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm bg-blue-50 cursor-pointer font-medium text-blue-700"
              >
                {getCombinedFilterOptions().map(option => (
                  <option key={option} value={option}>
                    {option === 'ทั้งหมด' ? 'ทั้งหมด (แผนก)' : option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-slate-600">
            แสดง {filteredItems.length} จาก {items.length} รายการ
            {searchQuery && (
              <span className="ml-2 text-blue-600 font-medium">
                ผลการค้นหา: "{searchQuery}"
              </span>
            )}
            {statusFilter !== 'ทั้งหมด' && (
              <span className="ml-2 text-blue-600 font-medium">
                • ประเภท: {statusFilter}
              </span>
            )}
            {combinedFilter !== 'ทั้งหมด' && (
              <span className="ml-2 text-green-600 font-medium">
                • {combinedFilter}
              </span>
            )}
          </div>

          <div>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">ไม่พบรายการ</p>
                <p className="text-gray-400 text-sm mt-1">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง</p>
              </div>
            ) : (
              filteredItems.map(s => (
                <NotificationCard
                  key={s.id}
                  item={s}
                  expanded={expandedIds.includes(s.id)} // ✅ ใช้ includes
                  onToggle={handleToggle}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  wrapperRefCallback={(id, el) => {
                    if (el && !el.dataset.warnInit) {
                      el.style.overflow = 'hidden'
                      el.style.maxHeight = '0px'
                      el.style.opacity = '0'
                      el.style.transition = 'max-height 320ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease'
                      el.style.willChange = 'max-height, opacity'
                      el.dataset.warnInit = '1'
                    }
                    wrapperRefs.current[id] = el
                  }}
                  innerRefCallback={(id, el) => {
                    if (el && !el.dataset.warnInnerInit) {
                      el.style.transform = 'translateY(-8px)'
                      el.style.opacity = '0'
                      el.style.transition = 'transform 260ms cubic-bezier(.2,.85,.2,1), opacity 220ms ease'
                      el.style.willChange = 'transform, opacity'
                      el.style.transformOrigin = 'top center'
                      el.dataset.warnInnerInit = '1'
                    }
                    innerRefs.current[id] = el
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
      </div>
      {modalData && <AttachmentModal data={modalData} onClose={() => setModalData(null)} />}
      
      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => {
          setShowApproveConfirm(false)
          setSelectedItem(null)
        }}
        onConfirm={confirmApprove}
        title="อนุมัติใบลา"
        message={`ต้องการอนุมัติใบลาของ ${selectedItem?.name} หรือไม่?`}
        confirmText="ตกลง"
        cancelText="ยกเลิก"
        type="success"
      />

      {/* Reject Modal with Reason */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRejectModal(false)
              setRejectReason('')
              setSelectedItem(null)
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-pop-up">
            <div className="bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white p-6 rounded-t-2xl shadow-md hover:shadow-lg hover:from-[#dc2626] hover:to-[#b91c1c] transition-all duration-200">
              <h2 className="text-xl font-bold">ไม่อนุมัติใบลา</h2>
              <p className="text-sm text-white/90 mt-1">กรุณาระบุเหตุผล</p>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ใบลาของ <strong className="text-red-600">{selectedItem?.name}</strong>
              </p>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุเหตุผลที่ไม่อนุมัติ..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none transition-colors"
                autoFocus
              />
            </div>

            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setSelectedItem(null)
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                ยืนยันไม่อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Success Dialog */}
      <SuccessDialog
        isOpen={showApproveSuccess}
        onClose={() => setShowApproveSuccess(false)}
        title="สำเร็จ!"
        message="อนุมัติใบลาเรียบร้อยแล้ว"
        autoClose={true}
        autoCloseDelay={2000}
      />

      {/* Reject Success Dialog */}
      <SuccessDialog
        isOpen={showRejectSuccess}
        onClose={() => setShowRejectSuccess(false)}
        title="สำเร็จ!"
        message="ไม่อนุมัติใบลาเรียบร้อยแล้ว"
        autoClose={true}
        autoCloseDelay={2000}
      />
    </div>
  )
}

function NotificationCard({ item, expanded, onToggle, onApprove, onReject, wrapperRefCallback, innerRefCallback }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 mb-6 shadow-md">
      <div className="flex items-start gap-4">
        <img src={item.avatar} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white/20" />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm text-white/90 mt-1">{item.role}</p>
              <p className="text-sm text-white/90">{item.department}</p>
              <p className="text-sm text-white/90">{item.branch}</p>
              <p className="text-sm text-white/90">{item.type}</p>
              <p className="text-sm text-white/90">{item.file}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onApprove?.(item)}
              className="inline-flex items-center justify-center text-base font-semibold bg-gradient-to-br from-sky-400 to-blue-500 text-white min-w-screen h-10 px-5 leading-none hover:from-sky-600 hover:to-cyan-700 rounded-xl shadow-md transition-all duration-200"
            >
              อนุมัติ
            </button>
            <button
              onClick={() => onReject?.(item)}
              className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:from-[#dc2626] hover:to-[#b91c1c] transition-all duration-200"
            >
              ไม่อนุมัติ
            </button>
            <button
              onClick={() => onToggle(item.id)}
              aria-expanded={expanded}
              className="relative inline-flex items-center justify-center px-5 py-2 bg-white text-[#0b2b57] rounded-xl text-base font-semibold border-2 border-white/50 hover:bg-white/90 transition-all duration-200 shadow-sm overflow-hidden"
              style={{ minWidth: 120 }}
            >
              <span
                aria-hidden={expanded}
                style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: expanded ? 0 : 1,
                  transition: 'opacity 220ms ease',
                  pointerEvents: 'none'
                }}
              >
                รายละเอียด
              </span>

              <span
                aria-hidden={!expanded}
                style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: expanded ? 1 : 0,
                  transition: 'opacity 220ms ease',
                  pointerEvents: 'none'
                }}
              >
                ซ่อนรายละเอียด
              </span>

              <span className="sr-only">{expanded ? 'ซ่อนรายละเอียด' : 'รายละเอียด'}</span>
            </button>
          </div>

          <div
            ref={el => wrapperRefCallback?.(item.id, el)}
            aria-hidden={!expanded}
            className="mt-6"
          >
            <div
              ref={el => innerRefCallback?.(item.id, el)}
              className="bg-white text-slate-800 rounded-lg p-6 shadow-inner border border-white/40"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                  <div className="text-sm mb-4">
                    <div className="font-semibold mb-2">
                      ช่วงเวลา: {item.leaveMode === 'hourly' ? 'ลาเป็นชั่วโมง' : 'ลาเป็นวัน'}
                    </div>
                    <ul className="list-disc pl-5 text-sm text-slate-700">
                      <li>
                        {item.leaveMode === 'hourly' 
                          ? `วันที่ ${item.startDate} เวลา ${item.startTime} - ${item.endTime} (${item.days})`
                          : `ตั้งแต่ ${item.startDate} - ${item.endDate} (${item.days})`
                        }
                      </li>
                    </ul>
                  </div>

                  <div className="text-sm mb-4">
                    <div className="font-semibold">เหตุผลการลา:</div>
                    <div className="text-slate-700 mt-1">{item.reason}</div>
                  </div>
                </div>

                <div className="md:col-span-1 flex items-start">
                  <div className="w-full">
                    <div className="grid grid-cols-1 gap-3">
                      {item.attachments && item.attachments.length > 0 ? (
                        item.attachments.map(att => (
                          <button
                            key={att.id}
                            onClick={() => window.dispatchEvent(new CustomEvent('showAttachment', { detail: { att, item } }))}
                            className="bg-slate-100 rounded-lg h-72 overflow-hidden flex items-center justify-center border border-dashed border-slate-200"
                          >
                            {att.type === 'image' ? (
                              <img src={att.url} alt={att.name} className="object-cover w-full h-full" />
                            ) : (
                              <div className="text-center text-sm text-slate-600 px-2">
                                <div className="font-semibold">{att.name}</div>
                                <div className="text-xs mt-1">ไฟล์</div>
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="w-full bg-slate-100 rounded-lg h-32 flex items-center justify-center text-slate-400 border border-dashed border-slate-200">
                          <div className="text-center">
                            <div className="mb-2">ไม่มีไฟล์แนบ</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-4">
          <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">{item.time}</div>
        </div>
      </div>
    </div>
  )
}

