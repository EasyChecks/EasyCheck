/**
 * Admin User Management Utilities
 * ฟังก์ชันช่วยเหลือสำหรับการจัดการผู้ใช้ในระบบ Admin
 */

/**
 * Generate Employee ID based on province and branch code
 * รูปแบบ: [provinceCode 3 chars][branchCode 3 chars][sequential 4 digits]
 * ตัวอย่าง: BKK1010001, CNX2010015
 */
export const generateEmployeeId = (provinceCode, branchCode, users = []) => {
  // หา employee ที่มีรหัสจังหวัดและสาขาเดียวกัน
  const sameLocationEmployees = users.filter(u => 
    u.employeeId && 
    u.employeeId.startsWith(provinceCode + branchCode)
  );

  // หาเลขวิ่งล่าสุด
  let maxSequence = 0;
  sameLocationEmployees.forEach(emp => {
    if (emp.employeeId && emp.employeeId.length === 10) {
      const sequence = parseInt(emp.employeeId.slice(-4));
      if (!isNaN(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    }
  });

  // สร้างเลขวิ่งใหม่ (เพิ่ม 1)
  const newSequence = String(maxSequence + 1).padStart(4, '0');
  
  return `${provinceCode}${branchCode}${newSequence}`;
};

/**
 * Validate duplicate user data
 * ตรวจสอบข้อมูลซ้ำ: email, nationalId, username
 */
export const validateUserData = (newUsers, existingUsers = []) => {
  const errors = [];
  const allUsers = [...existingUsers];
  
  newUsers.forEach((user, index) => {
    // Check duplicate email
    if (allUsers.some(u => u.email === user.email)) {
      errors.push(`แถวที่ ${index + 1}: อีเมล ${user.email} ซ้ำกับข้อมูลที่มีอยู่`);
    }
    
    // Check duplicate nationalId
    if (user.nationalId && allUsers.some(u => u.nationalId === user.nationalId)) {
      errors.push(`แถวที่ ${index + 1}: เลขบัตรประชาชน ${user.nationalId} ซ้ำกับข้อมูลที่มีอยู่`);
    }
    
    // Check duplicate username
    if (allUsers.some(u => u.username === user.username)) {
      errors.push(`แถวที่ ${index + 1}: Username ${user.username} ซ้ำกับข้อมูลที่มีอยู่`);
    }
    
    allUsers.push(user);
  });
  
  return errors;
};

/**
 * Parse CSV text to array of objects
 * แปลงข้อมูล CSV เป็น Array of Objects
 */
export const parseCsvData = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      data.push(row);
    }
  }
  
  return data;
};

/**
 * Process CSV data and create user objects
 * ประมวลผลข้อมูล CSV และสร้าง user objects
 */
export const processCsvUsers = (csvData, existingUsers = []) => {
  const processedUsers = [];
  let currentId = existingUsers.length > 0 
    ? Math.max(...existingUsers.map(u => u.id)) + 1 
    : 1;

  // Track location sequences to avoid duplicate employee IDs
  const locationSequenceMap = {};

  csvData.forEach((row, index) => {
    // สร้างรหัสพนักงาน
    const provinceCode = (row.provinceCode || 'BKK').toUpperCase().slice(0, 3);
    const branchCode = (row.branchCode || '101').slice(0, 3);
    const locationKey = provinceCode + branchCode;
    
    // หาเลขวิ่งล่าสุดจาก users ที่มีอยู่แล้ว + users ที่กำลังจะสร้าง
    if (!locationSequenceMap[locationKey]) {
      const sameLocationEmployees = existingUsers.filter(u => 
        u.employeeId && 
        u.employeeId.startsWith(locationKey)
      );
      
      let maxSequence = 0;
      sameLocationEmployees.forEach(emp => {
        if (emp.employeeId && emp.employeeId.length === 10) {
          const sequence = parseInt(emp.employeeId.slice(-4));
          if (!isNaN(sequence) && sequence > maxSequence) {
            maxSequence = sequence;
          }
        }
      });
      
      locationSequenceMap[locationKey] = maxSequence;
    }
    
    // เพิ่มเลขวิ่งสำหรับ location นี้
    locationSequenceMap[locationKey]++;
    const newSequence = String(locationSequenceMap[locationKey]).padStart(4, '0');
    const employeeId = `${locationKey}${newSequence}`;
    
    // Password = nationalId (เลขบัตรประชาชน)
    const password = row.nationalId || row.password || '1234567890123';
    
    // สร้าง user ปกติ
    const normalUser = {
      id: currentId,
      name: row.name || '',
      email: row.email || '',
      username: employeeId,
      employeeId: employeeId,
      password: password,
      role: row.role || 'user',
      status: row.status || 'active',
      department: row.department || '',
      position: row.position || '',
      phone: row.phone || '',
      nationalId: row.nationalId || '',
      birthDate: row.birthDate || '',
      age: row.age || '',
      bloodType: row.bloodType || '',
      salary: row.salary || '',
      address: row.address || '',
      provinceCode: provinceCode,
      branchCode: branchCode,
      socialSecurityNumber: row.socialSecurityNumber || '',
      profileImage: row.profileImage || '',
      skills: row.skills ? row.skills.split('|').map(s => s.trim()) : [],
      education: row.education ? row.education.split('|').map(e => e.trim()) : [],
      workHistory: row.workHistory ? row.workHistory.split('|').map(w => w.trim()) : [],
      certifications: row.certifications ? row.certifications.split('|').map(c => c.trim()) : [],
      emergencyContact: row.emergencyContactName ? {
        name: row.emergencyContactName || '',
        phone: row.emergencyContactPhone || '',
        relation: row.emergencyContactRelation || ''
      } : {},
      timeSummary: {
        totalWorkDays: 0,
        onTime: 0,
        late: 0,
        absent: 0,
        leave: 0,
        totalHours: '0 ชม.',
        avgCheckIn: '08:00',
        avgCheckOut: '17:00'
      }
    };

    processedUsers.push(normalUser);
    currentId++;

    // ถ้าเป็น admin หรือ superadmin ให้สร้างรหัสที่ 2 (admin account)
    if (row.role === 'admin' || row.role === 'superadmin') {
      const adminEmployeeId = `ADM${provinceCode}${branchCode}${String(index + 1).padStart(3, '0')}`;
      const adminUser = {
        ...normalUser,
        id: currentId,
        username: adminEmployeeId,
        employeeId: adminEmployeeId,
        email: row.adminEmail || row.email.replace('@', '+admin@'),
        role: row.role,
        position: (row.role === 'superadmin' ? 'Super Administrator' : 'Administrator') + ' - ' + (row.position || ''),
      };
      processedUsers.push(adminUser);
      currentId++;
    }
  });

  return processedUsers;
};

/**
 * Export users to CSV format
 * ส่งออกข้อมูล users เป็น CSV
 */
export const exportToCSV = (users, filename = 'users.csv') => {
  const headers = [
    'name', 'email', 'employeeId', 'username', 'role', 'status',
    'department', 'position', 'phone', 'nationalId', 'birthDate',
    'age', 'bloodType', 'salary', 'address', 'provinceCode', 'branchCode'
  ];

  const csvContent = [
    headers.join(','),
    ...users.map(user => 
      headers.map(header => `"${user[header] || ''}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
