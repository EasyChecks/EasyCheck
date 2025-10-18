import React, { useState, useEffect } from 'react'

export default function CreateAttendance({ onClose, onCreate }) {
  const [team, setTeam] = useState('')
  const [date, setDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [location, setLocation] = useState('')
  const [members, setMembers] = useState('')
  const [type, setType] = useState('')
  const [preparations, setPreparations] = useState('')
  const [tasks, setTasks] = useState('')
  const [goals, setGoals] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    const timeStr = timeStart && timeEnd ? `${timeStart} - ${timeEnd}` : (timeStart || timeEnd || '')
    const newItem = {
      id: Date.now(),
      team: team || 'ทีมใหม่',
      date: date || '',
      time: timeStr,
      location: location || '',
      members: members || '',
      type: type || '',
      preparations: preparations.split('\n').map(s => s.trim()).filter(Boolean),
      tasks: tasks.split('\n').map(s => s.trim()).filter(Boolean),
      goals: goals.split('\n').map(s => s.trim()).filter(Boolean),
    }
    onCreate(newItem)
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
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">เวลาเริ่ม</label>
                <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">เวลาสิ้นสุด</label>
                <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} className="w-full border rounded px-3 py-2" />
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

          <div className="flex items-center space-x-3 pt-2">
            <button type="submit" className="px-4 py-2 bg-[#1877F2] text-white rounded">Summit</button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}