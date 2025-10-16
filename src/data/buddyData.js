// Mock data สำหรับข้อมูลเพื่อนร่วมงาน (Buddy Check-in)
// ใช้สำหรับทดสอบระบบเช็คชื่อแทนเพื่อน

const buddyData = [
  {
    id: 1,
    employeeId: 'EMP001',
    name: 'สมชาย ใจดี',
    phone: '0812345678',
    department: 'IT',
    position: 'Developer'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    name: 'สมหญิง รักสะอาด',
    phone: '0823456789',
    department: 'HR',
    position: 'HR Manager'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    name: 'วิชัย มั่นคง',
    phone: '0834567890',
    department: 'Marketing',
    position: 'Marketing Lead'
  },
  {
    id: 4,
    employeeId: 'EMP004',
    name: 'อรทัย สวยงาม',
    phone: '0845678901',
    department: 'Sales',
    position: 'Sales Executive'
  },
  {
    id: 5,
    employeeId: 'EMP005',
    name: 'ประยุทธ์ เก่งกาจ',
    phone: '0856789012',
    department: 'IT',
    position: 'Senior Developer'
  },
  {
    id: 6,
    employeeId: 'EMP006',
    name: 'มาลี หอมกลิ่น',
    phone: '0867890123',
    department: 'Finance',
    position: 'Accountant'
  },
  {
    id: 7,
    employeeId: 'EMP007',
    name: 'ศักดิ์ชาย แข็งแรง',
    phone: '0878901234',
    department: 'Operations',
    position: 'Operations Manager'
  },
  {
    id: 8,
    employeeId: 'EMP008',
    name: 'นภา สดใส',
    phone: '0889012345',
    department: 'Customer Service',
    position: 'CS Representative'
  },
  {
    id: 9,
    employeeId: 'EMP009',
    name: 'ธนา ร่ำรวย',
    phone: '0890123456',
    department: 'Finance',
    position: 'Finance Director'
  },
  {
    id: 10,
    employeeId: 'EMP010',
    name: 'พิมพ์ใจ นักเขียน',
    phone: '0901234567',
    department: 'Content',
    position: 'Content Writer'
  }
]

// ฟังก์ชันตรวจสอบข้อมูลเพื่อน
export const validateBuddy = (employeeId, phone) => {
  const buddy = buddyData.find(
    b => b.employeeId.toLowerCase() === employeeId.toLowerCase() && 
         b.phone === phone
  )
  return buddy || null
}

// ฟังก์ชันค้นหาเพื่อนด้วยรหัสพนักงาน
export const findBuddyByEmployeeId = (employeeId) => {
  return buddyData.find(
    b => b.employeeId.toLowerCase() === employeeId.toLowerCase()
  )
}

// ฟังก์ชันดึงข้อมูลเพื่อนทั้งหมด
export const getAllBuddies = () => {
  return buddyData
}

export default buddyData
