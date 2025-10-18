import React, { useState, useEffect, useRef } from 'react'

export default function CreateAttendance({ onClose, onCreate, initialData, onUpdate }) {
  const [team, setTeam] = useState('')
  const [date, setDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [location, setLocation] = useState('')
  const [month, setMonth] = useState('')
  const [members, setMembers] = useState('')
  const [type, setType] = useState('')
  const [preparations, setPreparations] = useState('')
  const [tasks, setTasks] = useState('')
  const [goals, setGoals] = useState('')

  // If initialData provided, prefill fields (support editing)
  useEffect(() => {
    if (!initialData) return
    setTeam(initialData.team || '')
    setDate(initialData.date || '')
    // derive month (YYYY-MM) from date if available, or accept initialData.month
    if (initialData.month) setMonth(initialData.month)
    else if (initialData.date && initialData.date.length >= 7) setMonth(initialData.date.slice(0, 7))
    // parse time if in format 'HH:MM - HH:MM'
    if (initialData.time && initialData.time.includes('-')) {
      const parts = initialData.time.split('-').map(s => s.trim())
      setTimeStart(parts[0] || '')
      setTimeEnd(parts[1] || '')
    } else {
      setTimeStart(initialData.time || '')
      setTimeEnd('')
    }
    setLocation(initialData.location || '')
    setMembers(initialData.members || '')
    setType(initialData.type || '')
    setPreparations((initialData.preparations || []).join('\n'))
    setTasks((initialData.tasks || []).join('\n'))
    setGoals((initialData.goals || []).join('\n'))
  }, [initialData])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // refs to call native pickers where supported
  const monthRef = useRef(null)
  const dateRef = useRef(null)
  const timeStartRef = useRef(null)
  const timeEndRef = useRef(null)

  // helpers to normalize user input
  const pad = (n) => n.toString().padStart(2, '0')

  const normalizeTime = (input) => {
    if (!input) return ''
    const s = input.trim().toLowerCase()
    // am/pm
    const ampm = s.match(/^(\d{1,2}):?(\d{2})\s*(am|pm)$/)
    if (ampm) {
      let h = parseInt(ampm[1], 10)
      const m = parseInt(ampm[2], 10)
      if (ampm[3] === 'pm' && h < 12) h += 12
      if (ampm[3] === 'am' && h === 12) h = 0
      return `${pad(h)}:${pad(m)}`
    }

    // 24h H:MM or HH:MM or HMM
    const hhmm = s.match(/^(\d{1,2}):?(\d{2})$/)
    if (hhmm) {
      let h = parseInt(hhmm[1], 10)
      let m = parseInt(hhmm[2], 10)
      if (h >= 0 && h < 24 && m >= 0 && m < 60) return `${pad(h)}:${pad(m)}`
    }

    // if not recognized, return original trimmed (let server/consumer handle)
    return input.trim()
  }

  const normalizeDate = (input) => {
    if (!input) return ''
    const s = input.trim()
    // ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (dmy) {
      const d = pad(parseInt(dmy[1], 10))
      const m = pad(parseInt(dmy[2], 10))
      const y = dmy[3]
      return `${y}-${m}-${d}`
    }

    // MM/DD/YYYY
    const mdy = s.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/)
    if (mdy) {
      const m = pad(parseInt(mdy[1], 10))
      const d = pad(parseInt(mdy[2], 10))
      const y = mdy[3]
      return `${y}-${m}-${d}`
    }

    // fallback: try Date parser
    const parsed = new Date(s)
    if (!isNaN(parsed)) {
      const y = parsed.getFullYear()
      const m = pad(parsed.getMonth() + 1)
      const d = pad(parsed.getDate())
      return `${y}-${m}-${d}`
    }

    return s
  }

  const openNativePicker = (ref) => {
    try {
      if (ref && ref.current) ref.current.showPicker?.() || ref.current.click()
    } catch (e) {
      // some browsers don't support showPicker
      ref.current && ref.current.click()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // normalize times/dates before creating payload
    const nTimeStart = normalizeTime(timeStart)
    const nTimeEnd = normalizeTime(timeEnd)
    const timeStr = nTimeStart && nTimeEnd ? `${nTimeStart} - ${nTimeEnd}` : (nTimeStart || nTimeEnd || '')
    const nDate = normalizeDate(date)
    const payload = {
      id: initialData?.id ?? Date.now(),
      team: team || 'ทีมใหม่',
      month: month || (nDate ? nDate.slice(0,7) : ''),
      date: nDate || '',
      time: timeStr,
      location: location || '',
      members: members || '',
      type: type || '',
      preparations: preparations.split('\n').map(s => s.trim()).filter(Boolean),
      tasks: tasks.split('\n').map(s => s.trim()).filter(Boolean),
      goals: goals.split('\n').map(s => s.trim()).filter(Boolean),
    }

    if (onUpdate) {
      onUpdate(payload)
    } else if (onCreate) {
      onCreate(payload)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[92%] max-w-4xl bg-white rounded-lg border-4 border-[#1877F2] p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-[#0b2b57] mb-2">จัดตารางการทำงาน</h2>
        <p className="text-sm text-gray-600 mb-4">กรอกข้อมูลเพื่อสร้างตารางงานใหม่</p>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-auto pr-2">
          <div>
            <label className="block text-sm text-gray-700 mb-1">กับ (ทีม)</label>
            <input value={team} onChange={e => setTeam(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="ทีม" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">วันที่</label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => openNativePicker(dateRef)}
                  aria-label="เปิดตัวเลือกวันที่"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {/* calendar icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                    <path d="M16 2v4M8 2v4" strokeWidth="1.5" />
                  </svg>
                </button>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="YYYY-MM-DD or DD/MM/YYYY"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  onBlur={e => setDate(prev => normalizeDate(prev))}
                  className="w-full border rounded px-3 py-2 pr-10"
                  aria-label="วันที่ (พิมพ์หรือใช้ปุ่มเลือก)"
                />

                {/* hidden native date picker for devices that support it */}
                <input
                  ref={dateRef}
                  type="date"
                  className="sr-only"
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">เวลาเริ่ม</label>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => openNativePicker(timeStartRef)}
                    aria-label="เปิดตัวเลือกเวลาเริ่ม"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {/* clock icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path d="M12 7v6l4 2" strokeWidth="1.5" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={timeStart}
                    onChange={e => setTimeStart(e.target.value)}
                    onBlur={e => setTimeStart(prev => normalizeTime(prev))}
                    className="w-full border rounded px-3 py-2 pr-10"
                  />

                  <input
                    ref={timeStartRef}
                    type="time"
                    className="sr-only"
                    onChange={e => setTimeStart(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">เวลาสิ้นสุด</label>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => openNativePicker(timeEndRef)}
                    aria-label="เปิดตัวเลือกเวลาสิ้นสุด"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {/* clock icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path d="M12 7v6l4 2" strokeWidth="1.5" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={timeEnd}
                    onChange={e => setTimeEnd(e.target.value)}
                    onBlur={e => setTimeEnd(prev => normalizeTime(prev))}
                    className="w-full border rounded px-3 py-2 pr-10"
                  />

                  <input
                    ref={timeEndRef}
                    type="time"
                    className="sr-only"
                    onChange={e => setTimeEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">สถานที่</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="สถานที่" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">สมาชิก</label>
              <input value={members} onChange={e => setMembers(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="สมาชิก" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">ประเภทงาน</label>
              <input value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="ประเภทงาน" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">สิ่งที่ต้องเตรียม (แต่ละบรรทัดคือรายการ)</label>
            <textarea value={preparations} onChange={e => setPreparations(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} placeholder="รายการเตรียม" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">ภารกิจหลัก (แต่ละบรรทัดคือภารกิจ)</label>
            <textarea value={tasks} onChange={e => setTasks(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} placeholder="ภารกิจ" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">เป้าหมาย (แต่ละบรรทัด)</label>
            <textarea value={goals} onChange={e => setGoals(e.target.value)} className="w-full border rounded px-3 py-2" rows={2} placeholder="เป้าหมาย" />
          </div>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button 
              type="submit" 
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-b from-[#2b78d3] to-[#1877F2] text-white rounded-full shadow-md hover:shadow-lg hover:from-[#2466c2] hover:to-[#166fe0] transition-all duration-200 font-medium text-sm"
            >
              บันทึก
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}