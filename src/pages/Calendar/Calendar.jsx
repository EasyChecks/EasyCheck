import React, { useState } from "react"
import { Calendar as PickCalendar } from "../../components/ui/calendar"

// ข้อมูล JSON สำหรับการลงเวลา (เหมือนเดิม)
const initialWorkTimes = [
  { id: 1, site: "สำนักงานใหญ่", type: "เข้างาน", time: "07:56", date: "13 ส.ค." },
  { id: 2, site: "สำนักงานใหญ่", type: "ออกงาน", time: "17:00", date: "13 ส.ค." },
]

// ✅ หมายเหตุทั้งหมด
const Note = [
  { color: "bg-green-500", text: "ลงเวลาปกติ", value: "normal" },
  { color: "bg-red-500", text: "ขาดงาน", value: "absent" },
  { color: "bg-yellow-500", text: "สาย", value: "late" },
  { color: "bg-blue-200", text: "วันลาของพนักงาน", value: "leave" },
  { color: "bg-pink-500", text: "วันที่ถูกเลือก", value: "picked" },
  { color: "bg-gray-300", text: "วันหยุดนักขัตฤกษ์", value: "holiday" },
  { color: "bg-yellow-300", text: "วันที่ปัจจุบัน", value: "today" },
  { color: "bg-yellow-200", text: "วันหยุด", value: "dayoff" },
]

// หน้าปฏิทิน
export default function CalendarPage() {
  const [expanded, setExpanded] = useState(false)
  const [workTimes, setWorkTimes] = useState(initialWorkTimes)

  // เก็บสถานะของวันต่าง ๆ
  const [markedDays, setMarkedDays] = useState({
    normal: [],
    absent: [],
    late: [],
    leave: [],
    picked: [],
    holiday: [],
    today: [],
    dayoff: [],
  })

  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedType, setSelectedType] = useState("normal")

  const toggleExpand = (e) => {
    e?.stopPropagation()
    setExpanded((s) => !s)
  }

  // เมื่อเลือกวันที่ในปฏิทิน
  const handleSelectDay = (day) => {
    setSelectedDay(day)
  }

  // ฟังก์ชันบันทึกวัน
  const handleMarkDay = () => {
    if (!selectedDay) return alert("กรุณาเลือกวันที่ก่อน")
    setMarkedDays((prev) => {
      const updated = { ...prev }

      // ลบวันที่นี้ออกจากทุกหมวดก่อน
      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].filter((d) => d.getTime() !== selectedDay.getTime())
      })

      // เพิ่มเข้าไปในหมวดที่เลือก
      updated[selectedType] = [...updated[selectedType], selectedDay]

      return updated
    })
  }

  // ฟังก์ชันรีเซ็ตวันทั้งหมด
  const handleReset = () => {
    setMarkedDays({
      normal: [],
      absent: [],
      late: [],
      leave: [],
      selected: [],
      holiday: [],
      today: [],
      dayoff: [],
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-8 p-6">

      {/* ปฏิทิน */}
      <div className="w-full max-w-4xl border rounded-lg p-4">
        <h3 className="flex text-2xl font-bold mb-3 justify-center">Calendar</h3>

        <div className="w-full h-auto">
          <PickCalendar
            mode="single"
            selected={selectedDay}
            onSelect={handleSelectDay}
            className="w-full"
            modifiers={{
              normal: markedDays.normal,
              absent: markedDays.absent,
              late: markedDays.late,
              leave: markedDays.leave,
              picked: markedDays.picked,
              holiday: markedDays.holiday,
              today: markedDays.today,
              dayoff: markedDays.dayoff,
            }}
            modifiersClassNames={{
              normal: "bg-green-500 text-white rounded-full",
              absent: "bg-red-500 text-white rounded-full",
              late: "bg-yellow-500 text-black rounded-full",
              leave: "bg-blue-300 text-black rounded-full",
              picked: "bg-pink-500 text-white rounded-full",
              holiday: "bg-gray-300 text-black rounded-full",
              today: "bg-yellow-300 text-black rounded-full",
              dayoff: "bg-yellow-200 text-black rounded-full",
            }}
          />
        </div>

        {/* ส่วนตั้งค่า */}
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded p-2"
          >
            {Note.map((note) => (
              <option key={note.value} value={note.value}>
                {note.text}
              </option>
            ))}
          </select>

          <button
            onClick={handleMarkDay}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            บันทึกวัน
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            รีเซ็ตทั้งหมด
          </button>
        </div>

        {/* หมายเหตุ และปุ่มขยาย/ย่อ */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-xl font-bold">หมายเหตุ</div>
          <button
            onClick={toggleExpand}
            className="ml-2 p-2 rounded hover:bg-gray-100"
            aria-expanded={expanded}
            aria-controls="note-list"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 8"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={expanded ? "m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" : "M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"}
              />
            </svg>
          </button>
        </div>

        {expanded && (
          <div id="note-list" className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Note.map((note, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className={`w-5 h-5 ${note.color} rounded-full flex-shrink-0`}></div>
                <div className="text-lg">{note.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* การลงเวลา */}
      <div className="w-full max-w-4xl bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">การลงเวลา</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {workTimes.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 p-3 border rounded">
              <div>
                <div className="text-sm text-gray-500">{item.site}</div>
                <div className="text-lg font-medium">{item.type}</div>
              </div>

              <div className="text-right">
                <div className="text-xl font-semibold">{item.time}</div>
                <div className="text-sm text-gray-500">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
