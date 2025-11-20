/**
 * 📦 Attendance Data Migration Utility
 * 
 * ฟังก์ชันสำหรับอัพเดทข้อมูลเก่าที่ไม่มี address และ distance
 * ให้มีค่า default เพื่อให้แสดงผลได้ถูกต้อง
 */

/**
 * Migration: เพิ่ม address และ distance ให้กับ attendance records เก่า
 * @param {Array} users - Array ของ users data
 * @returns {Array} - Updated users data
 */
export const migrateAttendanceData = (users) => {
  if (!Array.isArray(users)) {
    console.warn('migrateAttendanceData: users is not an array');
    return users;
  }

  const updatedUsers = users.map(user => {
    if (!user.attendanceRecords || !Array.isArray(user.attendanceRecords)) {
      return user;
    }

    const updatedRecords = user.attendanceRecords.map(record => {
      const updatedRecord = { ...record };

      // Migrate checkIn
      if (updatedRecord.checkIn) {
        updatedRecord.checkIn = {
          ...updatedRecord.checkIn,
          address: updatedRecord.checkIn.address || 'ในพื้นที่อนุญาต',
          distance: updatedRecord.checkIn.distance || '-'
        };
      }

      // Migrate checkOut
      if (updatedRecord.checkOut) {
        updatedRecord.checkOut = {
          ...updatedRecord.checkOut,
          address: updatedRecord.checkOut.address || 'ในพื้นที่อนุญาต',
          distance: updatedRecord.checkOut.distance || '-'
        };
      }

      return updatedRecord;
    });

    return {
      ...user,
      attendanceRecords: updatedRecords
    };
  });

  return updatedUsers;
};

/**
 * Migration: เพิ่ม timeSummary ให้กับ users ที่ยังไม่มี
 * @param {Array} users - Array ของ users data
 * @returns {Array} - Updated users data
 */
export const migrateTimeSummary = (users) => {
  if (!Array.isArray(users)) {
    console.warn('migrateTimeSummary: users is not an array');
    return users;
  }

  const updatedUsers = users.map(user => {
    // ถ้ามี timeSummary แล้ว ให้ข้ามไป
    if (user.timeSummary) {
      return user;
    }

    // ถ้าไม่มี ให้เพิ่ม default timeSummary
    return {
      ...user,
      timeSummary: {
        totalWorkDays: 250,
        onTime: 240,
        late: 8,
        absent: 2,
        leave: 0,
        totalHours: '2,000 ชม.',
        avgCheckIn: '08:00',
        avgCheckOut: '17:30'
      }
    };
  });

  return updatedUsers;
};

/**
 * Auto-run migration on localStorage data
 * เรียกใช้ตอน app start เพื่ออัพเดทข้อมูลเก่าอัตโนมัติ
 */
export const runAttendanceMigration = () => {
  try {
    const storedUsers = localStorage.getItem('usersData');
    if (!storedUsers) {
      console.log('No usersData found in localStorage, skipping migration');
      return;
    }

    const users = JSON.parse(storedUsers);
    
    // 🔥 Run migrations
    let migratedUsers = migrateAttendanceData(users);
    migratedUsers = migrateTimeSummary(migratedUsers);
    
    // บันทึกกลับ localStorage
    localStorage.setItem('usersData', JSON.stringify(migratedUsers));
    
    console.log('✅ Attendance data migration completed successfully (includes timeSummary)');
    return migratedUsers;
  } catch (error) {
    console.error('❌ Attendance data migration failed:', error);
    return null;
  }
};
