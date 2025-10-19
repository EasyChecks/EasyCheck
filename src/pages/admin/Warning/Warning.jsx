import React, { useState, useRef, useEffect } from 'react'
import sample from './DataWarning'

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
  const [expandedIds, setExpandedIds] = useState([]) // ✅ เปลี่ยนจาก id เดียวเป็น array
  const [items, setItems] = useState(sample)
  const wrapperRefs = useRef({})
  const innerRefs = useRef({})
  const endListenersRef = useRef({})

  useEffect(() => {
    Object.values(wrapperRefs.current).forEach(w => {
      if (!w) return
      w.style.overflow = 'hidden'
      w.style.maxHeight = '0px'
      w.style.opacity = '0'
      w.style.transition = 'max-height 320ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease'
      w.style.willChange = 'max-height, opacity'
    })
    Object.values(innerRefs.current).forEach(i => {
      if (!i) return
      i.style.transform = 'translateY(-8px)'
      i.style.opacity = '0'
      i.style.transition = 'transform 260ms cubic-bezier(.2,.85,.2,1), opacity 220ms ease'
      i.style.willChange = 'transform, opacity'
      i.style.transformOrigin = 'top center'
    })
  }, [])

  const handleToggle = (id) => {
    const wrapper = wrapperRefs.current[id]
    const inner = innerRefs.current[id]
    const isOpen = expandedIds.includes(id)

    if (!wrapper || !inner) {
      setExpandedIds(prev => (isOpen ? prev.filter(x => x !== id) : [...prev, id]))
      return
    }

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
        wrapper.style.transition = 'max-height 260ms cubic-bezier(.2,.85,.2,1), opacity 200ms ease'
        wrapper.style.maxHeight = '0px'
        wrapper.style.opacity = '0'
      })

      const onEndClose = (e) => {
        if (e.propertyName === 'max-height') {
          wrapper.removeEventListener('transitionend', onEndClose)
          if (endListenersRef.current[id] === onEndClose) delete endListenersRef.current[id]
          setExpandedIds(prev => prev.filter(x => x !== id))
        }
      }
      endListenersRef.current[id] = onEndClose
      wrapper.addEventListener('transitionend', onEndClose)
    }
  }

  const handleApprove = (item) => {
    setItems(prev => prev.filter(s => s.id !== item.id))
    setExpandedIds(prev => prev.filter(x => x !== item.id))
    setModalData(prev => (prev && prev.item && prev.item.id === item.id ? null : prev))
    if (endListenersRef.current[item.id]) {
      try { wrapperRefs.current[item.id]?.removeEventListener('transitionend', endListenersRef.current[item.id]) } catch (e) {}
      delete endListenersRef.current[item.id]
    }
    delete wrapperRefs.current[item.id]
    delete innerRefs.current[item.id]
  }

  const handleReject = handleApprove // เหมือนกัน

  const [modalData, setModalData] = useState(null)

  useEffect(() => {
    const handler = (e) => setModalData(e.detail)
    window.addEventListener('showAttachment', handler)
    return () => window.removeEventListener('showAttachment', handler)
  }, [])

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

          <div>
            {items.map(s => (
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
            ))}
          </div>
        </div>
      </div>
      </div>
      {modalData && <AttachmentModal data={modalData} onClose={() => setModalData(null)} />}
    </div>
  )
}

function NotificationCard({ item, expanded, onToggle, onApprove, onReject, wrapperRefCallback, innerRefCallback }) {
  return (
    <div className="relative bg-[#2b78d3] text-white rounded-2xl p-5 mb-6 shadow-md">
      <div className="flex items-start gap-4">
        <img src={item.avatar} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white/20" />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm text-white/90 mt-1">{item.role}</p>
              <p className="text-sm text-white/90">{item.type}</p>
              <p className="text-sm text-white/90">{item.file}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onApprove?.(item)}
              className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-b from-[#06b6d4] to-[#0891b2] text-white rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200"
            >
              อนุมัติ
            </button>
            <button
              onClick={() => onReject?.(item)}
              className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:from-[#dc2626] hover:to-[#b91c1c] transition-all duration-200"
            >
              ปฏิเสธ
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
                    <div className="font-semibold mb-2">ช่วงเวลา : ลาเป็นวัน</div>
                    <ul className="list-disc pl-5 text-sm text-slate-700">
                      <li>ตั้งแต่ 03/10/2568 - 04/10/2568</li>
                    </ul>
                  </div>

                  <div className="text-sm mb-4">
                    <div className="font-semibold">เหตุผลการลา:</div>
                    <div className="text-slate-700 mt-1">อาการป่วย</div>
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

