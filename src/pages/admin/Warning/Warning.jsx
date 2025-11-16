import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useLeave } from '../../../contexts/LeaveContext'
import { usersData } from '../../../data/usersData'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import SuccessDialog from '../../../components/common/SuccessDialog'

// Inline ErrorDialog component
function ErrorDialog({ isOpen, message, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 z-50 shadow-xl">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 w-full"
          >
            ตรวจสอบแล้ว
          </button>
        </div>
      </div>
    </div>
  );
}

export function AttachmentModal({ data, onClose }) {
  if (!data) return null
  const { att, item } = data
  const isPDF = att.type === 'pdf' || att.name?.toLowerCase().endsWith('.pdf') || att.url?.toLowerCase().includes('.pdf')
  const isImage = att.type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => att.name?.toLowerCase().endsWith(`.${ext}`) || att.url?.toLowerCase().includes(`.${ext}`))
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col z-[10000]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xl text-gray-900 truncate">{att.name}</div>
            <div className="text-sm text-gray-600 mt-1">ผู้ขอลา: {item.name}</div>
          </div>
          <button 
            onClick={onClose} 
            className="ml-4 px-5 py-2.5 bg-brand-primary hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            ปิด
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-center min-h-full">
            {isPDF ? (
              <iframe
                src={att.url}
                className="w-full h-[600px] rounded-lg border-2 border-gray-300 bg-white"
                title={att.name}
              />
            ) : isImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={att.url} 
                  alt={att.name} 
                  className="rounded-lg shadow-lg object-contain"
                  style={{ maxWidth: '500px', maxHeight: '280px', width: 'auto', height: 'auto' }}
                />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <iframe
                  src={att.url}
                  className="w-full max-w-4xl h-[500px] rounded-lg border-2 border-gray-300 bg-white shadow-lg"
                  title={att.name}
                />
                <a
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  ดาวน์โหลดไฟล์
                </a>
              </div>
            )}
          </div>
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
  const rejectReasonRef = useRef(null)
  
  // Dialog states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [showApproveSuccess, setShowApproveSuccess] = useState(false)
  const [showRejectSuccess, setShowRejectSuccess] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: '' })

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
        const tabId = window.name || '' // ใช้ window.name แทน sessionStorage
        const currentUserData = tabId ? JSON.parse(localStorage.getItem(`user_${tabId}`) || '{}') : {}
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
          attachments: leave.documents?.map((doc, idx) => {
            const docUrl = doc.url || doc
            const docName = doc.name || `เอกสาร ${idx + 1}`
            const isImage = typeof docUrl === 'string' && (docUrl.toLowerCase().includes('.jpg') || docUrl.toLowerCase().includes('.png') || docUrl.toLowerCase().includes('.jpeg') || docUrl.toLowerCase().includes('.gif') || docUrl.toLowerCase().includes('.webp'))
            const isPDF = typeof docUrl === 'string' && (docUrl.toLowerCase().includes('.pdf') || docName.toLowerCase().endsWith('.pdf'))
            
            return {
              id: `${leave.id}-doc-${idx}`,
              name: docName,
              url: docUrl,
              type: doc.type || (isPDF ? 'pdf' : isImage ? 'image' : 'document')
            }
          }) || []
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

  // Auto focus textarea when reject modal opens
  useEffect(() => {
    if (showRejectModal && rejectReasonRef.current) {
      setTimeout(() => {
        rejectReasonRef.current.focus();
      }, 100);
    }
  }, [showRejectModal]);

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
      setErrorDialog({
        isOpen: true,
        message: 'กรุณาระบุเหตุผลที่ไม่อนุมัติ'
      })
      return
    }
    
    // อัพเดทสถานะเป็น "ไม่อนุมัติ"
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
    <div className="w-full bg-gray-50 min-h-screen overflow-y-auto" 
      style={{ scrollbarGutter: 'stable' }}
    >
      <div className="w-full pl-3 pr-2 md:pl-4 md:pr-2 lg:pl-6 lg:pr-3 py-6">
        <div
          className="w-full mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          style={{ boxShadow: '0 12px 28px rgba(11,43,87,0.08)' }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">คำขออนุมัติการลา</h2>
              <p className="text-sm text-gray-600 mt-1">ตรวจสอบและอนุมัติคำขอลาของพนักงาน</p>
            </div>
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-sm bg-white cursor-pointer"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-sm bg-brand-accent cursor-pointer font-medium text-black"
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
              <span className="ml-2 text-primary font-medium">
                ผลการค้นหา: "{searchQuery}"
              </span>
            )}
            {statusFilter !== 'ทั้งหมด' && (
              <span className="ml-2 text-primary font-medium">
                • ประเภท: {statusFilter}
              </span>
            )}
            {combinedFilter !== 'ทั้งหมด' && (
              <span className="ml-2 text-green-600 font-medium">
                • {combinedFilter}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
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

      {/* Reject Modal with Reason - Redesigned */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-sm max-w-md w-full overflow-hidden"
            style={{
              animation: 'modalSlideUp 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="bg-destructive to-destructive/90 p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">ไม่อนุมัติใบลา</h2>
              <p className="text-red-100 text-sm">กรุณาระบุเหตุผลในการไม่อนุมัติ</p>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Employee Info */}
              <div className="mb-5 p-4 bg-brand-accent-soft border border-orange-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">รายการที่จะไม่อนุมัติ:</p>
                <p className="text-gray-900 font-bold text-lg">
                  {selectedItem?.name}
                </p>
                <p className="text-gray-600 text-sm mt-1">{selectedItem?.role}</p>
              </div>
              
              {/* Reason Input */}
              <div className="mb-2">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  เหตุผลที่ไม่อนุมัติ <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={rejectReasonRef}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ระบุเหตุผล เช่น มีงานเร่งด่วน, ไม่สามารถอนุมัติได้เนื่องจาก..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-primary focus:outline-none resize-none text-sm"
                  style={{ transition: 'all 0.2s ease' }}
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                ข้อความนี้จะถูกส่งไปยังผู้ขอลา
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setSelectedItem(null)
                }}
                className="flex-1 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-brand-accent transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-5 py-3 bg-destructive text-white rounded-lg font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                ยืนยันไม่อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            transform: translateX(-100%) skewX(-12deg);
          }
          50% {
            transform: translateX(100%) skewX(-12deg);
          }
        }
      `}</style>

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
    <div className="relative rounded-xl p-4 text-gray-900 border-2 shadow-sm h-fit transition-colors border-gray-200">
      {/* top-right: time pill (always shown) */}
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <div className="bg-brand-accent text-gray-900 px-2.5 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
          {item.time}
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          {/* Avatar + Info */}
          <div className="flex items-start gap-3 mb-4">
            <img src={item.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" />
            <div className="flex-1 pr-16">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <div className="text-sm text-gray-600 mt-0.5 space-y-0.5">
                <div className="leading-tight">{item.role}</div>
                <div className="leading-tight">{item.department}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 mb-2 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onApprove?.(item)}
              className="inline-flex items-center justify-center text-sm font-semibold bg-brand-primary hover:bg-gray-700 text-white min-w-[100px] h-8 px-4 leading-none rounded-lg shadow-sm transition-colors"
            >
              อนุมัติ
            </button>
            <button
              onClick={() => onReject?.(item)}
              className="inline-flex items-center justify-center text-sm font-semibold bg-destructive hover:bg-destructive/90 text-white min-w-[100px] h-8 px-4 leading-none rounded-lg shadow-sm transition-colors"
            >
              ไม่อนุมัติ
            </button>
            <button
              onClick={() => onToggle(item.id)}
              aria-expanded={expanded}
              className="relative inline-flex items-center justify-center text-sm font-semibold rounded-lg shadow-sm transition-colors overflow-hidden bg-white text-gray-900 border-2 border-gray-300 min-w-[100px] h-8 px-4 leading-none hover:bg-brand-accent"
            >
              <span
                aria-hidden={expanded}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[220ms] ease-in-out pointer-events-none ${expanded ? 'opacity-0' : 'opacity-100'}`}
              >
                รายละเอียด
              </span>

              <span
                aria-hidden={!expanded}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[220ms] ease-in-out pointer-events-none ${expanded ? 'opacity-100' : 'opacity-0'}`}
              >
                ซ่อน
              </span>

              <span className="sr-only">{expanded ? 'ซ่อนรายละเอียด' : 'รายละเอียด'}</span>
            </button>
          </div>

          {/* Expandable Details */}
          <div
            ref={el => wrapperRefCallback?.(item.id, el)}
            aria-hidden={!expanded}
            className="mt-3"
          >
            <div
              ref={el => innerRefCallback?.(item.id, el)}
              className="bg-white text-gray-800 rounded-lg p-3 border border-gray-200"
            >
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1.5 text-base">ช่วงเวลา:</h4>
                  <div className="text-sm text-gray-700">
                    {item.leaveMode === 'hourly' ? 'ลาเป็นชั่วโมง' : 'ลาเป็นวัน'}
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-0.5">
                    <li>
                      {item.leaveMode === 'hourly' 
                        ? `วันที่ ${item.startDate} เวลา ${item.startTime} - ${item.endTime} (${item.days})`
                        : `ตั้งแต่ ${item.startDate} - ${item.endDate} (${item.days})`
                      }
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-1.5 text-base">เหตุผลการลา:</h4>
                  <div className="text-sm text-gray-700">{item.reason}</div>
                </div>

                {/* Attachments */}
                {item.attachments && item.attachments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-base">เอกสารแนบ:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {item.attachments.map(att => {
                        const isPDF = att.type === 'pdf' || att.name?.toLowerCase().endsWith('.pdf') || att.url?.toLowerCase().includes('.pdf')
                        const isImage = att.type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => att.name?.toLowerCase().endsWith(`.${ext}`) || att.url?.toLowerCase().includes(`.${ext}`))
                        
                        return (
                          <button
                            key={att.id}
                            onClick={() => window.dispatchEvent(new CustomEvent('showAttachment', { detail: { att, item } }))}
                            className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-brand-primary transition-all hover:shadow-lg group relative"
                          >
                            <div className="aspect-video relative">
                              {isPDF ? (
                                <div className="w-full h-full flex items-center justify-center bg-red-50">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 18v-1h8v1H8zm0-4v-1h8v1H8zm0-4v-1h5v1H8z"/>
                                  </svg>
                                </div>
                              ) : isImage ? (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={att.url} 
                                    alt={att.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z"/>
                                  </svg>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                            <div className="p-2 text-xs text-gray-700 font-medium text-left truncate">
                              {att.name}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

