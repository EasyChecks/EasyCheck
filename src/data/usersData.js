// ข้อมูลผู้ใช้ทั้งหมดในระบบ - Shared Data Source
// ใช้ร่วมกันระหว่าง Auth.jsx, AdminManageUser.jsx, UserDashboard.jsx, Layout.jsx, Nav.jsx
// Merged from: userData.js + buddyData.js

export const usersData = [
  // Admin คนที่ 1 - มี 2 บัญชี (User Account + Admin Account)
  { 
    id: 1, 
    name: 'นางสาวสุภาพร จันทร์เพ็ญ', 
    email: 'supaporn.admin@ggs.co.th', 
    role: 'admin', 
    status: 'active', 
    phone: '081-234-5678', 
    department: 'HR',
    provinceCode: 'BKK',
    branchCode: '101',
    username: 'BKK1010001', // บัญชีพนักงานทั่วไป
    password: '1209876543210', // เลขบัตรประชาชน
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
    adminAccount: 'ADMBKK1010001', // บัญชี Admin แยกต่างหาก
    adminPassword: 'Admin@GGS2024!' // รหัสผ่าน Admin (เข้มงวด)
  },
  // Super Admin
  { 
    id: 2, 
    name: 'นายวิชัย ศรีสวัสดิ์', 
    email: 'wichai.superadmin@ggs.co.th', 
    role: 'superadmin', 
    status: 'active', 
    phone: '082-999-8888', 
    department: 'IT',
    provinceCode: 'BKK',
    branchCode: '101',
    username: 'BKK1010002',
    password: '1309988776655', // เลขบัตรประชาชน
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
    phone: '081-432-5643', 
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
    phone: '082-345-6789', 
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
    phone: '083-456-7890', 
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
    phone: '084-567-8901', 
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
  const user = usersData.find(u => u.username === employeeId || u.adminAccount === employeeId);
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

export const getLegacyUserData = () => {
  // พยายามดึงข้อมูล user ที่ login อยู่จาก localStorage
  try {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
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
              const currentUser = JSON.parse(localStorage.getItem('user'));
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
        const user = JSON.parse(localStorage.getItem('user'));
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

// Export default สำหรับ compatibility กับ import userData แบบเดิม
const userData = getLegacyUserData();
export default userData;
