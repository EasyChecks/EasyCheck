// ===================================
// Mock Data Options - ตัวเลือกข้อมูลสำหรับรายงาน
// ===================================

export const mockDataOptions = [
  {
    id: 'attendanceData',
    label: 'ข้อมูลเวลาเข้า/ออก',
    description: 'เวลาเข้า-ออก, ขาด, ลา, มาสาย',
    color: 'blue'
  },
  {
    id: 'personalData',
    label: 'ข้อมูลส่วนตัว/งาน',
    description: 'ข้อมูลส่วนตัว, ตำแหน่งงาน',
    color: 'purple'
  },
  {
    id: 'gpsTracking',
    label: 'GPS Tracking',
    description: 'สถานะอยู่ในหรือนอกระยะ',
    color: 'green'
  },
  {
    id: 'photoAttendance',
    label: 'ข้อมูลภาพถ่าย',
    description: 'รูปถ่าย Check-in, Check-out',
    color: 'pink'
  },
  {
    id: 'eventStats',
    label: 'สถิติการเข้าร่วมกิจกรรม',
    description: 'จำนวนกิจกรรมที่เข้าร่วม',
    color: 'orange'
  }
];
