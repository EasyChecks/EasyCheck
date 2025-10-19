/**
 * Attendance Statistics Calculator
 * คำนวณสถิติการลงเวลาจากข้อมูลจริง
 */

/**
 * คำนวณสถิติการลงเวลาทั้งหมด
 * @param {Array} attendanceRecords - array ของข้อมูลการลงเวลา [{date, checkIn, checkOut, status}]
 * @param {Object} options - ตัวเลือกการคำนวณ {startDate, endDate, workTimeStart}
 * @returns {Object} สถิติการลงเวลา
 */
export const calculateAttendanceStats = (attendanceRecords = [], options = {}) => {
  const {
    startDate = null,
    endDate = null,
    workTimeStart = '08:00' // เวลาเริ่มงานมาตรฐาน
  } = options;

  // กรองข้อมูลตามช่วงวันที่ถ้ามีการระบุ
  let filteredRecords = attendanceRecords;
  
  if (startDate || endDate) {
    filteredRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && recordDate < start) return false;
      if (end && recordDate > end) return false;
      return true;
    });
  }

  const stats = {
    totalWorkDays: 0,    // จำนวนวันทำงานทั้งหมด
    onTime: 0,           // จำนวนวันมาตรงเวลา
    late: 0,             // จำนวนวันมาสาย
    absent: 0,           // จำนวนวันขาดงาน
    leave: 0,            // จำนวนวันลา
    totalWorkHours: 0,   // ชั่วโมงทำงานรวม
    averageCheckInTime: null, // เวลาเข้างานเฉลี่ย
    records: filteredRecords
  };

  if (!filteredRecords || filteredRecords.length === 0) {
    return stats;
  }

  let totalMinutes = 0;
  let checkInCount = 0;

  filteredRecords.forEach(record => {
    stats.totalWorkDays++;

    // นับสถานะต่างๆ
    if (record.status === 'absent') {
      stats.absent++;
    } else if (record.status === 'leave') {
      stats.leave++;
    } else if (record.status === 'late') {
      stats.late++;
    } else if (record.status === 'on-time' || record.status === 'present') {
      stats.onTime++;
    }

    // คำนวณชั่วโมงทำงาน
    if (record.checkIn && record.checkOut) {
      const checkInTime = parseTime(record.checkIn);
      const checkOutTime = parseTime(record.checkOut);
      
      if (checkInTime && checkOutTime) {
        const workMinutes = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60);
        if (workMinutes > 0) {
          stats.totalWorkHours += workMinutes / 60;
        }

        // คำนวณเวลาเข้างานเฉลี่ย
        totalMinutes += checkInTime.getHours() * 60 + checkInTime.getMinutes();
        checkInCount++;
      }
    }
  });

  // คำนวณเวลาเข้างานเฉลี่ย
  if (checkInCount > 0) {
    const avgMinutes = Math.round(totalMinutes / checkInCount);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    stats.averageCheckInTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // ปัดเศษชั่วโมงทำงาน
  stats.totalWorkHours = Math.round(stats.totalWorkHours * 10) / 10;

  return stats;
};

/**
 * ตรวจสอบว่ามาสายหรือไม่
 * @param {string} checkInTime - เวลาเข้างาน (HH:MM)
 * @param {string} workTimeStart - เวลาเริ่มงานมาตรฐาน (HH:MM)
 * @returns {boolean}
 */
export const isLate = (checkInTime, workTimeStart = '08:00') => {
  if (!checkInTime) return false;
  
  const checkIn = parseTime(checkInTime);
  const workStart = parseTime(workTimeStart);
  
  if (!checkIn || !workStart) return false;
  
  return checkIn > workStart;
};

/**
 * คำนวณจำนวนนาทีที่สาย
 * @param {string} checkInTime - เวลาเข้างาน (HH:MM)
 * @param {string} workTimeStart - เวลาเริ่มงานมาตรฐาน (HH:MM)
 * @returns {number} จำนวนนาทีที่สาย (0 ถ้าไม่สาย)
 */
export const getLateMinutes = (checkInTime, workTimeStart = '08:00') => {
  if (!checkInTime) return 0;
  
  const checkIn = parseTime(checkInTime);
  const workStart = parseTime(workTimeStart);
  
  if (!checkIn || !workStart || checkIn <= workStart) return 0;
  
  return Math.round((checkIn - workStart) / (1000 * 60));
};

/**
 * แปลงเวลาจาก string เป็น Date object
 * @param {string} timeString - เวลา (HH:MM หรือ HH:MM:SS)
 * @returns {Date|null}
 */
const parseTime = (timeString) => {
  if (!timeString) return null;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch {
    return null;
  }
};

/**
 * สร้างรายงานสรุปรายเดือน
 * @param {Array} attendanceRecords - ข้อมูลการลงเวลา
 * @param {number} year - ปี
 * @param {number} month - เดือน (1-12)
 * @returns {Object}
 */
export const generateMonthlyReport = (attendanceRecords, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const stats = calculateAttendanceStats(attendanceRecords, {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  return {
    year,
    month,
    monthName: startDate.toLocaleDateString('th-TH', { month: 'long' }),
    ...stats
  };
};

/**
 * สร้างรายงานสรุปรายปี
 * @param {Array} attendanceRecords - ข้อมูลการลงเวลา
 * @param {number} year - ปี
 * @returns {Object}
 */
export const generateYearlyReport = (attendanceRecords, year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const stats = calculateAttendanceStats(attendanceRecords, {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  // สร้างรายงานแยกตามเดือน
  const monthlyStats = [];
  for (let month = 1; month <= 12; month++) {
    const monthReport = generateMonthlyReport(attendanceRecords, year, month);
    monthlyStats.push(monthReport);
  }

  return {
    year,
    ...stats,
    monthlyBreakdown: monthlyStats
  };
};

/**
 * ตรวจสอบสถานะการลงเวลาของวันนั้น
 * @param {Object} record - ข้อมูลการลงเวลา {date, checkIn, checkOut}
 * @param {Object} options - ตัวเลือก {workTimeStart, workTimeEnd}
 * @returns {string} 'on-time', 'late', 'absent', 'leave', 'present'
 */
export const getAttendanceStatus = (record, options = {}) => {
  const { workTimeStart = '08:00' } = options;
  
  if (!record) return 'absent';
  
  // ถ้ามีการระบุสถานะมาแล้วให้ใช้เลย
  if (record.status) return record.status;
  
  // ถ้าไม่มีข้อมูล checkIn
  if (!record.checkIn) return 'absent';
  
  // ตรวจสอบว่ามาสายหรือไม่
  if (isLate(record.checkIn, workTimeStart)) {
    return 'late';
  }
  
  return 'on-time';
};

/**
 * สร้าง mock data สำหรับทดสอบ (จะลบออกเมื่อมี API จริง)
 */
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
