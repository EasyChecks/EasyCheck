// 📊 ข้อมูลผู้ใช้ทั้งหมดในระบบ - แหล่งข้อมูลกลาง (Centralized Mock Data Repository)
// 🔗 ใช้ร่วมกันระหว่าง: Auth.jsx, AdminManageUser.jsx, UserDashboard.jsx, Layout.jsx, Nav.jsx
// 📝 รวมมาจาก: userData.js + buddyData.js (ย้ายมาเก็บไว้ที่เดียวเพื่อง่ายต่อการจัดการ)

export const usersData = [
  // 👨‍💼 Admin คนที่ 1 - มี 2 บัญชี (User Account สำหรับพนักงานทั่วไป + Admin Account สำหรับจัดการระบบ)
  { 
    id: 1, 
    name: 'นางสาวสุภาพร จันทร์เพ็ญ', 
    email: 'supaporn.admin@ggs.co.th', 
    role: 'admin', 
    status: 'active', 
    phone: '0812345678', 
    department: 'HR',
    provinceCode: 'BKK',
    branchCode: '101',
    username: 'BKK1010001', // 📝 บัญชีพนักงานทั่วไป (Employee Account)
    password: '1209876543210', // 🔑 รหัสผ่านใช้เลขบัตรประชาชนเป็นค่าเริ่มต้น
    nationalId: '1209876543210',
    birthDate: '1988-05-15',
    age: '37',
    position: 'HR Administrator',
    employeeId: 'BKK1010001',
    bloodType: 'A',
    salary: '55000',
    idCardNumber: '1209876543210',
    passportNumber: '',
    profileImage: 'https://i.pravatar.cc/200?u=admin1',
    emergencyContact: {
      name: 'นายสมชาย จันทร์เพ็ญ',
      phone: '089-111-2222',
      relation: 'สามี'
    },
    startDate: '2020-01-01',
    workPeriod: '5 ปี',
    time: '07:30',
    attendanceStatus: 'เข้าทำงานตรงเวลา',
    workHistory: [
      { period: '2020 - ปัจจุบัน', position: 'HR Administrator', company: 'บริษัท GGS จำกัด' }
    ],
    education: [
      'ปริญญาตรี บริหารธุรกิจบัณฑิต (B.B.A)',
      'มหาวิทยาลัยธรรมศาสตร์',
      'สาขา การจัดการทรัพยากรมนุษย์',
      'เกรดเฉลี่ย 3.52'
    ],
    certifications: ['SHRM-CP Certified', 'PHRi Certified'],
    skills: ['HR Management', 'Recruitment', 'Employee Relations', 'HRIS'],
    address: '999/88 ถ.พระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    socialSecurityNumber: '1-2098-76543-21-0',
    timeSummary: {
      totalWorkDays: 250,
      onTime: 240,
      late: 8,
      absent: 2,
      leave: 0,
      totalHours: '2,000 ชม.',
      avgCheckIn: '07:35',
      avgCheckOut: '17:30'
    },
    adminAccount: 'ADMBKK1010001', // 🔐 บัญชี Admin แยกต่างหาก (Admin Account)
    adminPassword: 'Admin@GGS2024!' // 🔒 รหัสผ่าน Admin (ต้องเข้มงวดกว่าบัญชีพนักงานทั่วไป)
  },
  // 👨‍💻 Super Admin - ผู้ดูแลระบบสูงสุด (ควบคุมทุกอย่างในระบบ)
  { 
    id: 2, 
    name: 'นายวิชัย ศรีสวัสดิ์', 
    email: 'wichai.superadmin@ggs.co.th', 
    role: 'superadmin', 
    status: 'active', 
    phone: '0829998888', 
    department: 'IT',
    provinceCode: 'BKK',
    branchCode: '101',
    username: 'BKK1010002',
    password: '1309988776655', // 🔑 รหัสผ่านใช้เลขบัตรประชาชนเป็นค่าเริ่มต้น
    nationalId: '1309988776655',
    birthDate: '1985-08-20',
    age: '40',
    position: 'System Administrator',
    employeeId: 'BKK1010002',
    bloodType: 'O',
    salary: '75000',
    idCardNumber: '1309988776655',
    passportNumber: 'AA1234567',
    profileImage: 'https://i.pravatar.cc/200?u=superadmin1',
    emergencyContact: {
      name: 'นางวรรณา ศรีสวัสดิ์',
      phone: '089-777-6666',
      relation: 'ภรรยา'
    },
    startDate: '2018-03-01',
    workPeriod: '7 ปี',
    time: '07:00',
    attendanceStatus: 'เข้าทำงานตรงเวลา',
    workHistory: [
      { period: '2018 - ปัจจุบัน', position: 'System Administrator', company: 'บริษัท GGS จำกัด' },
      { period: '2015 - 2018', position: 'Senior IT Support', company: 'บริษัท XYZ Tech จำกัด' }
    ],
    education: [
      'ปริญญาโท วิทยาศาสตรมหาบัณฑิต (M.Sc.)',
      'มหาวิทยาลัยเกษตรศาสตร์',
      'สาขา เทคโนโลยีสารสนเทศ',
      'เกรดเฉลี่ย 3.80'
    ],
    certifications: ['CCNA', 'MCSA', 'AWS Solutions Architect'],
    skills: ['System Administration', 'Network Security', 'Cloud Infrastructure', 'Database Management'],
    address: '777/55 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900',
    socialSecurityNumber: '1-3099-88776-65-5',
    timeSummary: {
      totalWorkDays: 260,
      onTime: 255,
      late: 3,
      absent: 1,
      leave: 1,
      totalHours: '2,080 ชม.',
      avgCheckIn: '07:05',
      avgCheckOut: '17:30'
    },
    adminAccount: 'ADMBKK1010002', // บัญชี Super Admin แยกต่างหาก
    adminPassword: 'SuperAdmin@GGS2024!' // รหัสผ่าน Super Admin (เข้มงวดมาก)
  },
  { 
    id: 3, 
    name: 'นายอภิชาติ รัตนา', 
    email: 'apichart.rat@email.com', 
    role: 'manager', 
    status: 'active', 
    phone: '0814325643', 
    department: 'IT',
    provinceCode: 'BKK',
    branchCode: '101',
    username: 'BKK1010003',
    password: '1100243657224',
    nationalId: '1100243657224',
    birthDate: '1992-12-02',
    age: '38',
    position: 'Senior Software Engineer',
    employeeId: 'BKK1010003',
    bloodType: 'B',
    salary: '65000',
    idCardNumber: '1100243657224',
    passportNumber: '',
    profileImage: 'https://i.pravatar.cc/200?u=1',
    emergencyContact: {
      name: 'นายสมชาย รัตนา',
      phone: '089-888-4357',
      relation: 'บิดา'
    },
    startDate: '2018-10-01',
    workPeriod: '7 ปี',
    time: '06:32',
    attendanceStatus: 'เข้าทำงานตรงเวลา',
    workHistory: [
      { period: '2018 - ปัจจุบัน', position: 'หัวหน้าทีมพัฒนาซอฟต์แวร์ (Senior Software Engineer)', company: 'บริษัท GGS จำกัด' },
      { period: '2016 - 2018', position: 'นักพัฒนาซอฟต์แวร์อาวุโส (Senior Software Developer)', company: 'บริษัท ABC Tech จำกัด' },
      { period: '2014 - 2016', position: 'นักพัฒนาซอฟต์แวร์ (Software Developer)', company: 'บริษัท XYZ Solutions จำกัด' }
    ],
    education: [
      'ปริญญาโท วิทยาศาสตรมหาบัณฑิต (M.Sc. in Computer Science)',
      'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
      'สาขา วิทยาการคอมพิวเตอร์',
      'เกรดเฉลี่ย 3.75'
    ],
    certifications: [
      'AWS Certified Solutions Architect',
      'Google Cloud Professional Developer',
      'Certified Scrum Master (CSM)'
    ],
    skills: ['React', 'Node.js', 'Python', 'Docker', 'AWS'],
    address: '123/45 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    socialSecurityNumber: '1-1002-43657-22-4',
    timeSummary: {
      totalWorkDays: 245,
      onTime: 220,
      late: 15,
      absent: 5,
      leave: 5,
      totalHours: '1,960 ชม.',
      avgCheckIn: '07:45',
      avgCheckOut: '17:30'
    },
    activities: [
      { date: '17 ต.ค. 2568', time: '14:30', action: 'แก้ไขข้อมูลโปรไฟล์', icon: 'edit' },
      { date: '16 ต.ค. 2568', time: '08:15', action: 'ลงเวลาเข้างาน', icon: 'clock' },
      { date: '15 ต.ค. 2568', time: '09:00', action: 'ส่งคำขออนุมัติลา', icon: 'calendar' },
      { date: '14 ต.ค. 2568', time: '17:45', action: 'ลงเวลาออกงาน', icon: 'logout' }
    ],
    attendanceRecords: [
      {
        date: '17 ต.ค. 2568',
        checkIn: { time: '07:32', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1a', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' },
        checkOut: { time: '17:45', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1b', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' }
      },
      {
        date: '16 ต.ค. 2568',
        checkIn: { time: '07:45', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1c', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' },
        checkOut: { time: '17:30', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1d', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' }
      },
      {
        date: '15 ต.ค. 2568',
        checkIn: { time: '08:15', status: 'มาสาย', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1e', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' },
        checkOut: { time: '17:50', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1f', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' }
      }
    ]
  },
  { 
    id: 4, 
    name: 'นางพรทิพย์ ภักดี', 
    email: 'porntip@ggs.co.th', 
    role: 'user', 
    status: 'leave', 
    phone: '0823456789', 
    department: 'Marketing',
    provinceCode: 'BKK',
    branchCode: '102',
    username: 'BKK1020001',
    password: '3567891234567',
    nationalId: '3567891234567',
    birthDate: '1990-03-15',
    age: '35',
    position: 'Digital Marketing Specialist',
    employeeId: 'BKK1020001',
    bloodType: 'A',
    salary: '45000',
    idCardNumber: '3567891234567',
    passportNumber: '',
    profileImage: 'https://i.pravatar.cc/200?u=2',
    emergencyContact: {
      name: 'นายสมศักดิ์ ภักดี',
      phone: '081-234-5678',
      relation: 'สามี'
    },
    startDate: '2019-06-01',
    workPeriod: '6 ปี',
    time: '07:03',
    attendanceStatus: 'เข้าทำงานสาย',
    workHistory: [
      { period: '2019 - ปัจจุบัน', position: 'นักการตลาดดิจิทัล (Digital Marketing Specialist)', company: 'บริษัท GGS จำกัด' }
    ],
    education: [
      'ปริญญาตรี บริหารธุรกิจบัณฑิต (B.B.A)',
      'มหาวิทยาลัยธรรมศาสตร์',
      'สาขา การตลาด',
      'เกรดเฉลี่ย 3.42'
    ],
    certifications: ['Google Ads Certified', 'Facebook Blueprint Certified'],
    skills: ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media'],
    address: '456/78 ถ.สุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110',
    socialSecurityNumber: '3-5678-91234-56-7',
    timeSummary: {
      totalWorkDays: 220,
      onTime: 180,
      late: 25,
      absent: 10,
      leave: 5,
      totalHours: '1,760 ชม.',
      avgCheckIn: '08:15',
      avgCheckOut: '17:30'
    }
  },
  { 
    id: 5, 
    name: 'นายนันทกร ทูนแก้ว', 
    email: 'nantakorn@ggs.co.th', 
    role: 'user', 
    status: 'suspended', 
    phone: '0834567890', 
    department: 'HR',
    provinceCode: 'CNX',
    branchCode: '201',
    username: 'CNX2010001',
    password: '2123456789012',
    nationalId: '2123456789012',
    birthDate: '1995-05-22',
    age: '30',
    position: 'HR Officer',
    employeeId: 'CNX2010001',
    bloodType: 'O',
    salary: '38000',
    idCardNumber: '2123456789012',
    passportNumber: '',
    profileImage: 'https://i.pravatar.cc/200?u=3',
    emergencyContact: {
      name: 'นางสาวสุดา ทูนแก้ว',
      phone: '082-345-6789',
      relation: 'มารดา'
    },
    startDate: '2020-03-15',
    workPeriod: '5 ปี',
    time: '08:15',
    attendanceStatus: 'เข้าทำงานสาย',
    workHistory: [
      { period: '2020 - ปัจจุบัน', position: 'เจ้าหน้าที่ทรัพยากรบุคคล (HR Officer)', company: 'บริษัท GGS จำกัด' }
    ],
    education: [
      'ปริญญาตรี รัฐศาสตรบัณฑิต',
      'มหาวิทยาลัยรามคำแหง',
      'สาขา การบริหารทรัพยากรมนุษย์',
      'เกรดเฉลี่ย 3.15'
    ],
    certifications: ['SHRM-CP Certified'],
    skills: ['Recruitment', 'Employee Relations', 'HR Management'],
    address: '789/12 ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
    socialSecurityNumber: '2-1234-56789-01-2',
    timeSummary: {
      totalWorkDays: 180,
      onTime: 140,
      late: 30,
      absent: 8,
      leave: 2,
      totalHours: '1,440 ชม.',
      avgCheckIn: '08:30',
      avgCheckOut: '17:30'
    }
  },
  { 
    id: 6, 
    name: 'นายเทวราช วงค์ษาจันทร์', 
    email: 'tavarach@ggs.co.th', 
    role: 'user', 
    status: 'pending', 
    phone: '0845678901', 
    department: 'Finance',
    provinceCode: 'PKT',
    branchCode: '301',
    username: 'PKT3010001',
    password: '4789012345678',
    nationalId: '4789012345678',
    birthDate: '1993-09-10',
    age: '32',
    position: 'Accountant',
    employeeId: 'PKT3010001',
    bloodType: 'AB',
    salary: '42000',
    idCardNumber: '4789012345678',
    passportNumber: '',
    profileImage: 'https://i.pravatar.cc/200?u=4',
    emergencyContact: {
      name: 'นางวิไล วงค์ษาจันทร์',
      phone: '083-456-7890',
      relation: 'มารดา'
    },
    startDate: '2021-01-10',
    workPeriod: '4 ปี',
    time: '06:45',
    attendanceStatus: 'เข้าทำงานตรงเวลา',
    workHistory: [
      { period: '2021 - ปัจจุบัน', position: 'นักบัญชี (Accountant)', company: 'บริษัท GGS จำกัด' }
    ],
    education: [
      'ปริญญาตรี บัญชีบัณฑิต (B.Acc.)',
      'มหาวิทยาลัยหอการค้าไทย',
      'สาขา การบัญชี',
      'เกรดเฉลี่ย 3.58'
    ],
    certifications: ['CPA Thailand'],
    skills: ['Accounting', 'Financial Reporting', 'Tax Planning'],
    address: '321/65 ถ.วิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
    socialSecurityNumber: '4-7890-12345-67-8',
    timeSummary: {
      totalWorkDays: 150,
      onTime: 135,
      late: 10,
      absent: 3,
      leave: 2,
      totalHours: '1,200 ชม.',
      avgCheckIn: '07:50',
      avgCheckOut: '17:30'
    }
  }
];

// Helper function: แปลง usersData เป็น format สำหรับ Auth.jsx
export const getUserForAuth = (employeeId) => {
  // Try to get updated users from localStorage first (for role changes made by admin)
  let usersList = usersData;
  try {
    const storedUsers = localStorage.getItem('usersData');
    if (storedUsers) {
      usersList = JSON.parse(storedUsers);
    }
  } catch (e) {
    // If localStorage fails, use default usersData
    console.warn('Failed to read users from localStorage:', e);
  }

  const user = usersList.find(u => u.username === employeeId || u.adminAccount === employeeId);
  if (!user) return null;

  // ถ้าเป็นบัญชี Admin (ADMBKK...)
  if (employeeId.startsWith('ADM')) {
    return {
      ...user,
      username: user.adminAccount,
      role: user.role, // admin หรือ superadmin
      password: user.adminPassword,
      isAdminAccount: true,
      name: `${user.name} (${user.role === 'superadmin' ? 'Super Admin' : 'Admin'})`
    };
  }

  // ถ้าเป็นบัญชีพนักงานธรรมดา
  return {
    ...user,
    role: (user.role === 'admin' || user.role === 'superadmin') ? 'user' : user.role, // แสดงเป็น user ตอนเช็คชื่อ
    isAdminAccount: false
  };
};

// Helper function: Get all users สำหรับ dropdown, select, etc.
export const getAllUsers = () => {
  return usersData;
};

// Helper function: Find user by ID
export const getUserById = (id) => {
  return usersData.find(u => u.id === id);
};

// Helper function: Find user by username/employeeId
export const getUserByUsername = (username) => {
  const normalized = username.toUpperCase();
  return usersData.find(u => 
    u.username.toUpperCase() === normalized || 
    (u.adminAccount && u.adminAccount.toUpperCase() === normalized)
  );
};

// ==================== Buddy Check-in Functions ====================
// สำหรับระบบเช็คชื่อแทนเพื่อน (Buddy Check-in)

// ฟังก์ชันตรวจสอบข้อมูลเพื่อน - ใช้ข้อมูลจาก usersData
export const validateBuddy = (employeeId, phone) => {
  const normalized = employeeId.toUpperCase();
  const buddy = usersData.find(
    u => u.username.toUpperCase() === normalized && u.phone === phone
  );
  return buddy || null;
};

// ฟังก์ชันค้นหาเพื่อนด้วยรหัสพนักงาน
export const findBuddyByEmployeeId = (employeeId) => {
  const normalized = employeeId.toUpperCase();
  return usersData.find(
    u => u.username.toUpperCase() === normalized
  );
};

// ==================== Legacy userData Format ====================
// สำหรับ compatibility กับ Layout.jsx และ Nav.jsx ที่ใช้ userData แบบเก่า

// Helper: ดึง tabId จาก window.name (persistent across browser restart)
const getCurrentTabId = () => {
  return window.name || ''
}

// Helper: ดึง user จาก localStorage ของ tab ปัจจุบัน
const getCurrentUser = () => {
  const tabId = getCurrentTabId()
  if (!tabId) return null
  
  const savedUser = localStorage.getItem(`user_${tabId}`)
  return savedUser ? JSON.parse(savedUser) : null
}

export const getLegacyUserData = () => {
  // พยายามดึงข้อมูล user ที่ login อยู่จาก localStorage ของ tab ปัจจุบัน
  try {
    const loggedInUser = getCurrentUser()
    if (loggedInUser && loggedInUser.username) {
      const user = getUserByUsername(loggedInUser.username);
      if (user) {
        // แปลงเป็น format เดิมที่ Layout/Nav ใช้
        return {
          id: user.id,
          name: user.name,
          position: user.position,
          department: user.department,
          profilePic: user.profileImage || "/images/default-avatar.jpg",
          status: user.status === 'active' ? 'ปฏิบัติงาน' : 'พักงาน',
          get role() {
            try {
              const currentUser = getCurrentUser()
              return currentUser?.role || 'user';
            } catch {
              return 'user';
            }
          },

          personalInfo: {
            birthDate: user.birthDate || '',
            age: user.age || '',
            address: user.address || '',
            phone: user.phone || '',
            email: user.email || '',
            maritalStatus: 'โสด', // Default
            idCard: user.socialSecurityNumber || ''
          },
          workInfo: {
            position: user.position,
            workplace: '', // ไม่มีใน usersData
            employeeId: user.employeeId,
            department: user.department,
            startDate: user.startDate,
            education: user.education?.join(', ') || '',
            workHistory: user.workHistory?.map(w => `${w.company} (${w.period}) - ${w.position}`).join('\n') || '',
            skills: user.skills?.join(', ') || '',
            benefits: 'ประกันสังคม, กองทุนสำรองเลี้ยงชีพ' // Default
          },
          healthInfo: {
            medicalHistory: 'ปกติ',
            bloodType: user.bloodType || '',
            socialSecurity: user.socialSecurityNumber || '',
            salary: user.salary ? `${user.salary} บาท` : ''
          },
          emergencyContact: user.emergencyContact || {
            name: '',
            phone: '',
            relation: ''
          },
          timeSummary: user.timeSummary || {
            totalWorkDays: 0,
            onTime: 0,
            late: 0,
            absent: 0,
            leave: 0
          }
        };
      }
    }
  } catch (error) {
    console.error('Error loading legacy user data:', error);
  }

  // Fallback: ถ้าไม่มี user login หรือเกิด error ให้ return default
  return {
    id: 0,
    name: 'ผู้ใช้งาน',
    position: 'พนักงาน',
    department: 'ทั่วไป',
    profilePic: "/images/default-avatar.jpg",
    status: 'ปฏิบัติงาน',
    get role() {
      try {
        const user = getCurrentUser()
        return user?.role || 'user';
      } catch {
        return 'user';
      }
    },
    personalInfo: {
      birthDate: '',
      age: '',
      address: '',
      phone: '',
      email: '',
      maritalStatus: '',
      idCard: ''
    },
    workInfo: {
      position: '',
      workplace: '',
      employeeId: '',
      department: '',
      startDate: '',
      education: '',
      workHistory: '',
      skills: '',
      benefits: ''
    },
    healthInfo: {
      medicalHistory: '',
      bloodType: '',
      socialSecurity: '',
      salary: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    timeSummary: {
      totalWorkDays: 0,
      onTime: 0,
      late: 0,
      absent: 0,
      leave: 0
    }
  };
};

// ============================================
// Mock Data: บัญชี fallback สำหรับ Admin (กรณีใช้ username = admin)
// รวมศูนย์ข้อมูลไว้ใน data layer เพื่อหลีกเลี่ยงการ hardcode ใน component
// ============================================
export const mockAdminFallbackAccounts = {
  admin: {
    username: 'admin',
    employeeId: 'BKK1010002',
    role: 'superadmin',
    defaultPassword: '123456',
    linkedAdminAccount: 'ADMBKK1010002',
    name: 'บัญชีผู้ดูแลระบบกลาง'
  }
};

export const getFallbackAdminAccount = (username, storedPasswords = {}) => {
  const normalizedUsername = username.toLowerCase();
  const fallbackAccount = mockAdminFallbackAccounts[normalizedUsername];

  if (!fallbackAccount) {
    return null;
  }

  const activePassword = storedPasswords[normalizedUsername] || fallbackAccount.defaultPassword;

  return {
    ...fallbackAccount,
    password: activePassword
  };
};

// ===================================
// Event Data - ข้อมูลกิจกรรม/งานต่างๆ
// ===================================
export const eventsData = [
  {
    id: 1,
    title: "คุยงานกับลูกค้า",
    description: "เก็บ requirement ของลูกค้า",
    location: "โซนเมกะบางนา",
    time: "23/09/2025 → 24/09/2025 (09:00 - 11:00)",
  },
  {
    id: 2,
    title: "ลงตรวจ site งาน",
    description: "ตรวจความเรียบร้อยของโครงการ",
    location: "คลองเตย",
    time: "25/09/2025 (10:00 - 12:00)",
  },
  {
    id: 3,
    title: "ติดตั้งสินค้าที่บ้านลูกค้า",
    description: "ติดตั้งระบบให้ลูกค้ารายใหม่",
    location: "ลาดพร้าว 71",
    time: "27/09/2025 (13:00 - 15:00)",
  },
];

// ===================================
// Calendar Events - กิจกรรมในปฏิทิน
// ===================================
export const calendarEvents = [
  { id: 1, date: '2025-11-23', title: 'เตรียมตัวนำเสนอโปรเจค', type: 'meeting', status: 'normal' },
  { id: 2, date: '2025-11-24', title: 'นำเสนอโปรเจค', type: 'meeting', status: 'normal' },
  { id: 3, date: '2025-11-25', title: 'นำเสนอโปรเจค', type: 'meeting', status: 'normal' },
];

// ===================================
// Attendance Data - ข้อมูลการลงเวลา
// ===================================
export const attendanceData = [
  { date: '2025-10-03', status: 'late' },
  { date: '2025-10-04', status: 'absent' },
  { date: '2025-10-08', status: 'late' },
  { date: '2025-10-11', status: 'leave' },
  { date: '2025-10-17', status: 'late' },
  { date: '2025-10-18', status: 'absent' },
];

// ===================================
// Leave Data - ข้อมูลการลา
// ===================================
export const leaveData = [
  {
    id: 1,
    leaveType: 'ลาป่วย',
    days: '4 วัน',
    category: 'ลาป่วย',
    period: '23/09/2025 → 26/09/2025',
    startDate: '23/09/2025',
    endDate: '26/09/2025',
    reason: 'test',
    status: 'รออนุมัติ',
    statusColor: 'yellow',
    documents: []
  },
  {
    id: 2,
    leaveType: 'ลากิจ',
    days: '2 วัน',
    category: 'ลากิจ',
    period: '15/10/2025 → 16/10/2025',
    startDate: '15/10/2025',
    endDate: '16/10/2025',
    reason: 'ธุระส่วนตัว',
    status: 'อนุมัติ',
    statusColor: 'green',
    documents: []
  },
  {
    id: 3,
    leaveType: 'ลาพักร้อน',
    days: '5 วัน',
    category: 'ลาพักร้อน',
    period: '01/11/2025 → 05/11/2025',
    startDate: '01/11/2025',
    endDate: '05/11/2025',
    reason: 'เที่ยวกับครอบครัว',
    status: 'อนุมัติ',
    statusColor: 'green',
    documents: []
  },
  {
    id: 4,
    leaveType: 'ลาป่วย',
    days: '1 วัน',
    category: 'ลาป่วย',
    period: '10/09/2025',
    startDate: '10/09/2025',
    endDate: '10/09/2025',
    reason: 'ไข้หวัด',
    status: 'ไม่อนุมัติ',
    statusColor: 'red',
    documents: []
  },
  {
    id: 5,
    leaveType: 'ลาป่วย',
    days: '2 วัน',
    category: 'ลาป่วย',
    period: '05/08/2025 → 06/08/2025',
    startDate: '05/08/2025',
    endDate: '06/08/2025',
    reason: 'ป่วยไข้หวัด',
    status: 'อนุมัติ',
    statusColor: 'green',
    documents: []
  },
  {
    id: 6,
    leaveType: 'ลากิจ',
    days: '1 วัน',
    category: 'ลากิจ',
    period: '20/09/2025',
    startDate: '20/09/2025',
    endDate: '20/09/2025',
    reason: 'ติดธุระส่วนตัว',
    status: 'รออนุมัติ',
    statusColor: 'yellow',
    documents: []
  }
];

// ============================================
// Mock Data: ข้อมูลสาขา (Branches)
// ใช้สำหรับ: DownloadData.jsx
// ============================================
export const mockBranches = [
  { id: 'BKK101', name: 'กรุงเทพ สาขา 101', provinceCode: 'BKK' },
  { id: 'BKK102', name: 'กรุงเทพ สาขา 102', provinceCode: 'BKK' },
  { id: 'CNX201', name: 'เชียงใหม่ สาขา 201', provinceCode: 'CNX' },
  { id: 'PKT301', name: 'ภูเก็ต สาขา 301', provinceCode: 'PKT' },
];

// ============================================
// Mock Data: รายงาน (Reports)
// ใช้สำหรับ: DownloadData.jsx
// ============================================
export const mockReports = [
  {
    id: 1,
    title: 'รายงาน',
    subtitle: 'ข้อมูลแบบวันต่อวัน',
    description: 'ดาวน์โหลดข้อมูล',
    color: 'from-brand-primary to-orange-600'
  },
  {
    id: 2,
    title: 'รายงาน2',
    subtitle: 'ข้อมูลแบบเดือน',
    description: 'ดาวน์โหลดข้อมูล',
    color: 'from-brand-primary to-orange-600'
  }
];

// ============================================
// Mock Data: ตัวเลือกข้อมูล (Data Options)
// ใช้สำหรับ: DownloadData.jsx
// ============================================
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

// ============================================
// Utility Function: สร้างข้อมูล Mock สำหรับรายงาน
// ใช้สำหรับ: DownloadData.jsx
// ============================================
export const generateMockReportData = (selectedOptions) => {
  const data = [];
  
  // สร้าง 10 รายการข้อมูลตัวอย่าง
  for (let i = 1; i <= 10; i++) {
    const record = {
      'ลำดับ': i,
      'รหัสพนักงาน': `EMP${String(i).padStart(4, '0')}`,
      'ชื่อ-นามสกุล': `พนักงาน ${i}`,
    };

    if (selectedOptions.attendanceData) {
      record['เวลาเข้างาน'] = '09:00';
      record['เวลาออกงาน'] = '18:00';
      record['สถานะ'] = i % 5 === 0 ? 'มาสาย' : 'ปกติ';
    }

    if (selectedOptions.personalData) {
      record['แผนก'] = ['การเงิน', 'ไอที', 'การตลาด'][i % 3];
      record['ตำแหน่ง'] = ['พนักงาน', 'หัวหน้าทีม', 'ผู้จัดการ'][i % 3];
      record['อีเมล'] = `employee${i}@example.com`;
    }

    if (selectedOptions.gpsTracking) {
      record['GPS Status'] = i % 3 === 0 ? 'อยู่นอกระยะ' : 'อยู่ในระยะ';
      record['ระยะห่าง'] = i % 3 === 0 ? '250 ม.' : '15 ม.';
    }

    if (selectedOptions.photoAttendance) {
      record['รูปภาพ Check-in'] = `photo_checkin_${i}.jpg`;
      record['รูปภาพ Check-out'] = `photo_checkout_${i}.jpg`;
    }

    if (selectedOptions.eventStats) {
      record['กิจกรรมที่เข้าร่วม'] = Math.floor(Math.random() * 10);
      record['กิจกรรมทั้งหมด'] = 12;
      record['เปอร์เซ็นต์'] = `${Math.floor((record['กิจกรรมที่เข้าร่วม'] / 12) * 100)}%`;
    }

    data.push(record);
  }

  return data;
};

// ============================================
// Mock Data: ข้อมูลบันทึกการเข้างาน (Attendance Records)
// ใช้สำหรับ: AuthProvider.jsx
// ============================================
export const mockAttendanceRecords = [
  {
    date: new Date().toISOString().split('T')[0], // วันนี้
    shifts: [
      {
        checkIn: '08:00',
        checkOut: '12:00',
        status: 'on_time'
      },
      {
        checkIn: '13:00',
        checkOut: '17:00',
        status: 'on_time'
      }
    ]
  },
  {
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // เมื่อวาน
    shifts: [
      {
        checkIn: '08:15',
        checkOut: '17:30',
        status: 'late'
      }
    ]
  },
  {
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 วันที่แล้ว
    shifts: [
      {
        checkIn: '07:45',
        checkOut: '12:00',
        status: 'on_time'
      },
      {
        checkIn: '18:00',
        checkOut: '22:00',
        status: 'on_time'
      }
    ]
  }
];

// ============================================
// Mock Data: สมาชิกในทีม (Team Members)
// ใช้สำหรับ: TeamContext.jsx
// ============================================
export const mockTeamMembers = [
  {
    id: 1,
    name: 'สมชาย ใจดี',
    position: 'Junior Developer',
    status: 'checked_in',
    checkInTime: '08:45',
    checkOutTime: null,
    isLate: false,
    profilePic: null
  },
  {
    id: 2,
    name: 'สมหญิง รักงาน',
    position: 'UI/UX Designer',
    status: 'checked_in',
    checkInTime: '09:15',
    checkOutTime: null,
    isLate: true, // สาย 15 นาที
    profilePic: null
  },
  {
    id: 3,
    name: 'วิชัย เก่งมาก',
    position: 'Frontend Developer',
    status: 'checked_in',
    checkInTime: '08:30',
    checkOutTime: null,
    isLate: false,
    profilePic: null
  },
  {
    id: 4,
    name: 'อรทัย สวยงาม',
    position: 'Backend Developer',
    status: 'absent',
    checkInTime: null,
    checkOutTime: null,
    isLate: false,
    profilePic: null
  },
  {
    id: 5,
    name: 'ประยุทธ์ ทำงานหนัก',
    position: 'QA Tester',
    status: 'not_checked_in',
    checkInTime: null,
    checkOutTime: null,
    isLate: false,
    profilePic: null
  }
];

// ============================================
// Mock Data: ใบลาที่รออนุมัติ (Pending Leaves)
// ใช้สำหรับ: TeamContext.jsx
// ============================================
export const mockPendingLeaves = [
  {
    id: 1,
    employeeId: 2,
    employeeName: 'สมหญิง รักงาน',
    leaveType: 'ลาป่วย',
    startDate: '15/10/2568',
    endDate: '16/10/2568',
    totalDays: 2,
    reason: 'ไข้หวัด ปวดศีรษะ',
    status: 'pending',
    submittedDate: '14/10/2568',
    documents: []
  },
  {
    id: 2,
    employeeId: 4,
    employeeName: 'อรทัย สวยงาม',
    leaveType: 'ลากิจ',
    startDate: '18/10/2568',
    endDate: '18/10/2568',
    totalDays: 1,
    reason: 'ติดธุระส่วนตัว',
    status: 'pending',
    submittedDate: '15/10/2568',
    documents: []
  },
  {
    id: 3,
    employeeId: 1,
    employeeName: 'สมชาย ใจดี',
    leaveType: 'ลาพักร้อน',
    startDate: '20/10/2568',
    endDate: '22/10/2568',
    totalDays: 3,
    reason: 'เที่ยวกับครอบครัว',
    status: 'pending',
    submittedDate: '13/10/2568',
    documents: []
  }
];

// ============================================
// Mock Data: สถิติการเข้างาน (Attendance Stats)
// ใช้สำหรับ: AdminDashboard.jsx
// ============================================
export const mockAttendanceStats = {
  totalemployees: 300,
  totalWeekly: 290,
  totalToday: 95,
  lateCount: 2,
  leaveCount: 3,
  absentCount: 3
};

// ============================================
// Mock Data: ข้อมูล Chart สำหรับการเข้างาน (Chart Data)
// ใช้สำหรับ: AdminDashboard.jsx
// ============================================
export const mockAttendanceChartData = {
  week: [
    { name: 'จันทร์', value: 285 },
    { name: 'อังคาร', value: 292 },
    { name: 'พุธ', value: 268 },
    { name: 'พฤหัส', value: 290 },
    { name: 'ศุกร์', value: 95 }, // ข้อมูลวันนี้
    { name: 'เสาร์', value: 0 },
    { name: 'อาทิตย์', value: 0 }
  ],
  month: [
    { name: 'สัปดาห์ 1', value: 285 },
    { name: 'สัปดาห์ 2', value: 290 },
    { name: 'สัปดาห์ 3', value: 282 },
    { name: 'สัปดาห์ 4', value: 290 }
  ],
  year: [
    { name: 'ม.ค.', value: 280 },
    { name: 'ก.พ.', value: 285 },
    { name: 'มี.ค.', value: 290 },
    { name: 'เม.ย.', value: 275 },
    { name: 'พ.ค.', value: 292 },
    { name: 'มิ.ย.', value: 288 },
    { name: 'ก.ค.', value: 295 },
    { name: 'ส.ค.', value: 290 },
    { name: 'ก.ย.', value: 287 },
    { name: 'ต.ค.', value: 290 }, // ข้อมูลรายสัปดาห์
    { name: 'พ.ย.', value: 0 },
    { name: 'ธ.ค.', value: 0 }
  ]
};

// ============================================
// Mock Data: ตารางกิจกรรม/งาน (Schedules)
// ใช้สำหรับ: DataAttendance.jsx, ScheduleDetails.jsx
// ============================================
export const sampleSchedules = [
  {
    id: 1,
    team: 'ทีม A : งานติดตั้ง',
    date: '32/10/2568',
    location: 'โบเทค บางนา Hall 101',
    members: 'อภิสิทธิ์, พรหมพิริยะ, ธนกร',
    type: 'ติดตั้งระบบไฟฟ้า',
    time: '07.00 - 15.00',
    teams: ['IT', 'Engineering'], // แผนก IT และ Engineering เท่านั้น
    tasks: [
      'เช็คระบบสายไฟ และติดตั้งตัวควบคุม',
      'ตรวจสอบอุปกรณ์ต่อไฟฟ้าในพื้นที่ Hall 101',
      'ทดสอบการทำงานของระบบเบื้องต้น'
    ],
    preparations: [
      'อุปกรณ์สายไฟ, ผู้ควบคุม, เครื่องมือช่วยไฟ',
      'อุปกรณ์ความปลอดภัย (หมวก, ถุงมือ, รองเท้ากันบิ่น)'
    ],
    goals: [
      'ให้ระบบไฟฟ้าพร้อมใช้งานภายในสถานที่',
      'ตรวจสอบความปลอดภัยและรายงานผลก่อนเลิกงาน'
    ]
  },
  {
    id: 2,
    team: 'ทีม B : งานอีเว้นท์',
    date: '2/1/2568',
    location: 'CentralWorld ชั้น 3',
    members: 'ฤทธิ์ชัย วรกานต์',
    type: 'ออกบูธงาน',
    time: '10.00 - 22.00',
    teams: ['Marketing', 'Sales'], // แผนก Marketing และ Sales เท่านั้น
    tasks: [
      'ติดตั้งบูธและอุปกรณ์สาธิต',
      'ตรวจเช็คระบบไฟและแสงสว่าง'
    ],
    preparations: [
      'ตารางงาน, อุปกรณ์สื่อสาร, อุปกรณ์แสดงสินค้า'
    ],
    goals: [
      'บูธพร้อมใช้งานและปลอดภัยตลอดงาน'
    ]
  },
  {
    id: 3,
    team: 'ทีม C : งาน HR',
    date: '2/1/2568',
    location: 'สำนักงานใหญ่ ชั้น 5',
    members: 'สมชาย, สมหญิง',
    type: 'สัมภาษณ์พนักงานใหม่',
    time: '09.00 - 17.00',
    teams: ['HR'], // แผนก HR เท่านั้น
    tasks: [
      'เตรียมห้องสัมภาษณ์และเอกสาร',
      'ดำเนินการสัมภาษณ์ผู้สมัคร',
      'สรุปผลและรายงาน'
    ],
    preparations: [
      'เอกสารประวัติผู้สมัคร',
      'แบบฟอร์มประเมิน',
      'อุปกรณ์สำนักงาน'
    ],
    goals: [
      'คัดเลือกพนักงานที่เหมาะสมกับตำแหน่ง',
      'สรุปผลการสัมภาษณ์ทุกรายภายในวันเดียวกัน'
    ]
  }
];

// ============================================
// Utility Function: สร้าง Mock Attendance Data สำหรับทดสอบ
// ใช้สำหรับ: attendanceCalculator.js (จะลบเมื่อมี API จริง)
// ============================================
export const generateMockAttendanceData = (days = 30) => {
  const records = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // สุ่มสถานะ
    const rand = Math.random();
    let status, checkIn, checkOut;
    
    if (rand < 0.8) { // 80% มาตรงเวลา
      status = 'on-time';
      checkIn = '07:45';
      checkOut = '17:30';
    } else if (rand < 0.9) { // 10% มาสาย
      status = 'late';
      checkIn = '08:30';
      checkOut = '17:30';
    } else if (rand < 0.95) { // 5% ลา
      status = 'leave';
      checkIn = null;
      checkOut = null;
    } else { // 5% ขาด
      status = 'absent';
      checkIn = null;
      checkOut = null;
    }
    
    records.push({
      date: date.toISOString().split('T')[0],
      checkIn,
      checkOut,
      status
    });
  }
  
  return records;
};

// ============================================
// Mock Data: ข้อมูลคำเตือน/ใบลา (Warning/Leave Requests)
// ใช้สำหรับ: DataWarning.jsx
// ============================================
export const mockWarningData = [
  {
    id: 1,
    name: 'นายอภิชาติ รัตนา',
    role: 'ตำแหน่ง : หัวหน้าทีม',
    department: 'แผนก : HR',
    branch: 'สาขา : กรุงเทพ',
    type: 'ประเภทข้อความ : ลาป่วย',
    file: 'ไฟล์แนบ : มี',
    avatar: 'https://i.pravatar.cc/300?u=15',
    attachments: [
      { id: 'a1', name: 'ใบรับรองแพทย์.jpg', url: 'https://picsum.photos/seed/doc1/800/600', type: 'image' }
    ],
    time: '1 day'
  },
  {
    id: 2,
    name: 'นายพชรกล เทรทเนอร์',
    role: 'ตำแหน่ง : ผู้จัดการ',
    department: 'แผนก : การเงิน',
    branch: 'สาขา : ชลบุรี',
    type: 'ประเภทข้อความ : ลากิจ',
    file: 'ไฟล์แนบ : ไม่มี',
    avatar: 'https://i.pravatar.cc/300?u=37',
    attachments: [
      { id: 'a2', name: 'รายละเอียด.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'file' }
    ],
    time: '07.00 - 11.00'
  },
  {
    id: 3,
    name: 'นายณบิน หอมนเย็น',
    role: 'ตำแหน่ง : พนักงาน',
    department: 'แผนก : IT',
    branch: 'สาขา : กรุงเทพ',
    type: 'ประเภทข้อความ : ลากิจ',
    file: 'ไฟล์แนบ : มี',
    avatar: 'https://i.pravatar.cc/300?u=24',
    attachments: [
      { id: 'a3', name: 'รูปถ่าย1.jpg', url: 'https://picsum.photos/seed/photo1/800/600', type: 'image' },
      { id: 'a4', name: 'เอกสาร.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'file' }
    ],
    time: '1 day'
  }
];

// ============================================
// Mock Data: ข้อมูล Event Chart (สำหรับ Dashboard)
// ใช้สำหรับ: AdminDashboard.jsx - Event Chart Data
// ============================================
export const mockEventChartData = {
  week: {
    labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
    counts: [2, 3, 1, 2, 0, 0, 0] // จำนวนกิจกรรมต่อวัน
  },
  month: {
    labels: ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4'],
    counts: [4, 5, 3, 0] // จำนวนกิจกรรมต่อสัปดาห์
  },
  year: {
    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
    counts: [12, 10, 15, 18, 14, 16, 13, 11, 17, 0, 0, 0] // จำนวนกิจกรรมต่อเดือน
  }
};

// ============================================
// Utility Function: Mock Login API
// ใช้สำหรับ: Auth.jsx - จำลองการเรียก API Login
// รองรับ: user จาก usersData + user ใหม่จาก localStorage
// ============================================
export const mockLoginAPI = async (username, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Normalize username to uppercase for employee ID format
  const normalizedUsername = username.toUpperCase();
  
  // 1. ลองหา user จาก usersData เดิมก่อน (getUserForAuth จะดู localStorage อยู่แล้ว)
  let user = getUserForAuth(normalizedUsername);
  
  // 2. ถ้าไม่เจอ ให้ลองหาจาก usersData ที่บันทึกใน localStorage (user ที่เพิ่มใหม่)
  if (!user) {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('usersData') || '[]');
      user = storedUsers.find(u => 
        u.username?.toUpperCase() === normalizedUsername || 
        u.employeeId?.toUpperCase() === normalizedUsername ||
        u.adminAccount?.toUpperCase() === normalizedUsername
      );
      
      // ถ้าเจอ user ใหม่จาก localStorage ต้องจัดรูปแบบให้ตรงกับ getUserForAuth
      if (user) {
        // ถ้า login ด้วย admin account
        if (normalizedUsername === user.adminAccount?.toUpperCase()) {
          user = {
            ...user,
            username: user.adminAccount,
            isAdminAccount: true
          };
        }
      }
    } catch (e) {
      console.warn('Failed to read users from localStorage:', e);
    }
  }
  
  // 3. ตรวจสอบรหัสผ่าน
  if (user) {
    // ดึงรหัสผ่านจาก localStorage
    const storedPasswords = JSON.parse(localStorage.getItem('mockUserPasswords') || '{}');
    const correctPassword = storedPasswords[normalizedUsername.toLowerCase()] || 
                           storedPasswords[username.toLowerCase()] ||
                           user.password;
    
    if (password === correctPassword) {
      // Remove password from response
      const { password: _, adminPassword: __, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    }
  }

  return { success: false };
};

// Export default สำหรับ compatibility กับ import userData แบบเดิม
const userData = getLegacyUserData();
export default userData;
