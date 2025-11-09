import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/useAuth';

// ฟังก์ชันแปลงวันที่ ISO เป็น DD/MM/YYYY (พ.ศ.)
const convertToThaiDate = (isoDate) => {
  if (!isoDate) return '';
  
  try {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yearBE = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
    
    return `${day}/${month}/${yearBE}`;
  } catch {
    return isoDate;
  }
};

function ProfileScreen() {
  const { user } = useAuth(); // ดึงข้อมูล user จาก context
  
  // State สำหรับเก็บข้อมูลที่แก้ไขได้
  const [profileData, setProfileData] = useState(() => {
    // Clear old data และใช้ข้อมูลจาก user ที่ login
    localStorage.removeItem('userProfileData'); // Clear old cache
    
    // แปลง workHistory array เป็น string
    const workHistoryText = user?.workHistory && Array.isArray(user.workHistory) 
      ? user.workHistory.map(w => `${w.period}: ${w.position} ที่ ${w.company}`).join('\n')
      : '';
    
    // แปลง skills array เป็น string
    const skillsText = user?.skills && Array.isArray(user.skills)
      ? user.skills.join(', ')
      : '';
    
    // แปลง education array เป็น string
    const educationText = user?.education && Array.isArray(user.education)
      ? user.education.join(', ')
      : 'ปริญญาตรี';
    
    // แปลง certifications array เป็น string
    const certificationsText = user?.certifications && Array.isArray(user.certifications)
      ? user.certifications.join(', ')
      : '';
    
    // จัดการข้อมูล timeSummary
    const timeSummary = user?.timeSummary || {};
    const attendanceText = timeSummary.totalWorkDays 
      ? `ทำงาน ${timeSummary.totalWorkDays} วัน (ตรงเวลา ${timeSummary.onTime} วัน, สาย ${timeSummary.late} วัน, ลา ${timeSummary.leave} วัน, ขาด ${timeSummary.absent} วัน)`
      : 'ไม่มีข้อมูล';
    
    return {
      id: user?.id || 1,
      name: user?.name || '',
      position: user?.position || '',
      department: user?.department || '',
      profilePic: user?.profileImage || 'https://i.pravatar.cc/200?u=default',
      status: user?.status || 'ปฏิบัติงาน',
      role: user?.role || 'user',
      personalInfo: {
        birthDate: convertToThaiDate(user?.birthDate) || '',
        age: user?.age || '',
        address: user?.address || '',
        phone: user?.phone || '',
        email: user?.email || '',
        maritalStatus: 'โสด',
        idCard: user?.nationalId || '',
        emergencyContact: user?.emergencyContact ? `${user.emergencyContact.name} (${user.emergencyContact.relation}) - ${user.emergencyContact.phone}` : ''
      },
      workInfo: {
        position: user?.position || '',
        workplace: user?.department || '',
        employeeId: user?.employeeId || user?.username || '',
        department: user?.department || '',
        startDate: convertToThaiDate(user?.startDate) || '',
        workPeriod: user?.workPeriod || '',
        education: educationText,
        workHistory: workHistoryText,
        skills: skillsText,
        certifications: certificationsText,
        benefits: 'ประกันสังคม'
      },
      healthInfo: {
        medicalHistory: 'ปกติ',
        bloodType: user?.bloodType || '',
        socialSecurity: user?.socialSecurityNumber || '',
        salary: user?.salary ? `${Number(user.salary).toLocaleString()} บาท` : ''
      },
      additionalInfo: {
        attendance: attendanceText,
        performance: 'ไม่มีข้อมูล',
        disciplinary: 'ไม่เคยมีประวัติการลงโทษ',
        totalHours: timeSummary.totalHours || '',
        avgCheckIn: timeSummary.avgCheckIn || '',
        avgCheckOut: timeSummary.avgCheckOut || ''
      },
      companyInfo: {
        name: 'GGS Co., Ltd.',
        address: '88 อาคาร ชั้น 15',
        callCenter: '02-456-7890',
        email: 'contact@ggs.com'
      }
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [tempData, setTempData] = useState({});
  const fileInputRef = useRef(null);

  // บันทึกข้อมูลลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('userProfileData', JSON.stringify(profileData));
  }, [profileData]);

  // ✅ ข้อ 3: ฟังการเปลี่ยนแปลงจาก Admin (Admin แก้ไข → User เห็นทันที)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'usersData' && e.newValue && user) {
        try {
          const updatedUsers = JSON.parse(e.newValue);
          const updatedUser = updatedUsers.find(u => u.id === user.id);
          
          if (updatedUser) {
            // อัปเดตข้อมูลโปรไฟล์ทันทีเมื่อ Admin แก้ไข
            const workHistoryText = updatedUser.workHistory && Array.isArray(updatedUser.workHistory) 
              ? updatedUser.workHistory.map(w => `${w.period}: ${w.position} ที่ ${w.company}`).join('\n')
              : '';
            
            const skillsText = updatedUser.skills && Array.isArray(updatedUser.skills)
              ? updatedUser.skills.join(', ')
              : '';
            
            const educationText = updatedUser.education && Array.isArray(updatedUser.education)
              ? updatedUser.education.join(', ')
              : 'ปริญญาตรี';
            
            const certificationsText = updatedUser.certifications && Array.isArray(updatedUser.certifications)
              ? updatedUser.certifications.join(', ')
              : '';
            
            const timeSummary = updatedUser.timeSummary || {};
            const attendanceText = timeSummary.totalWorkDays 
              ? `ทำงาน ${timeSummary.totalWorkDays} วัน (ตรงเวลา ${timeSummary.onTime} วัน, สาย ${timeSummary.late} วัน, ลา ${timeSummary.leave} วัน, ขาด ${timeSummary.absent} วัน)`
              : 'ไม่มีข้อมูล';
            
            setProfileData({
              id: updatedUser.id,
              name: updatedUser.name || '',
              position: updatedUser.position || '',
              department: updatedUser.department || '',
              profilePic: updatedUser.profileImage || 'https://i.pravatar.cc/200?u=default',
              status: updatedUser.status || 'ปฏิบัติงาน',
              role: updatedUser.role || 'user',
              personalInfo: {
                birthDate: updatedUser.birthDate || '',
                age: updatedUser.age || '',
                address: updatedUser.address || '',
                phone: updatedUser.phone || '',
                email: updatedUser.email || '',
                maritalStatus: 'โสด',
                idCard: updatedUser.nationalId || ''
              },
              workInfo: {
                position: updatedUser.position || '',
                workplace: '',
                employeeId: updatedUser.employeeId || updatedUser.username || '',
                department: updatedUser.department || '',
                startDate: updatedUser.startDate || '',
                education: educationText,
                workHistory: workHistoryText,
                skills: skillsText,
                benefits: 'ประกันสังคม, กองทุนสำรองเลี้ยงชีพ'
              },
              healthInfo: {
                medicalHistory: 'ปกติ',
                bloodType: updatedUser.bloodType || '',
                socialSecurity: updatedUser.socialSecurityNumber || updatedUser.nationalId || '',
                salary: updatedUser.salary ? `${updatedUser.salary} บาท` : ''
              },
              emergencyContact: updatedUser.emergencyContact || {
                name: '',
                phone: '',
                relation: ''
              },
              attendance: attendanceText,
              certifications: certificationsText
            });
          }
        } catch (e) {
          console.warn('Failed to sync profile data:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // 🔥 ฟังการอัปเดต timeSummary real-time
  useEffect(() => {
    const handleTimeSummaryUpdate = (e) => {
      if (e.detail.userId === user?.id) {
        const newTimeSummary = e.detail.timeSummary;
        const attendanceText = newTimeSummary.totalWorkDays 
          ? `ทำงาน ${newTimeSummary.totalWorkDays} วัน (ตรงเวลา ${newTimeSummary.onTime} วัน, สาย ${newTimeSummary.late} วัน, ลา ${newTimeSummary.leave} วัน, ขาด ${newTimeSummary.absent} วัน)`
          : 'ไม่มีข้อมูล';
        
        setProfileData(prev => ({
          ...prev,
          additionalInfo: {
            ...prev.additionalInfo,
            attendance: attendanceText,
            totalHours: newTimeSummary.totalHours || '',
            avgCheckIn: newTimeSummary.avgCheckIn || '',
            avgCheckOut: newTimeSummary.avgCheckOut || ''
          }
        }));
      }
    };

    window.addEventListener('timeSummaryUpdated', handleTimeSummaryUpdate);
    return () => {
      window.removeEventListener('timeSummaryUpdated', handleTimeSummaryUpdate);
    };
  }, [user]);

  // ล็อกการเลื่อนหน้าเมื่อ Modal เปิด
  useEffect(() => {
    if (isEditing) {
      // ป้องกันการ scroll
      document.body.style.overflow = 'hidden';
    } else {
      // คืนค่าการ scroll
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup เมื่อ component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditing]);

  // ฟังก์ชันเปลี่ยนรูปโปรไฟล์
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePic: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ฟังก์ชันเปิด modal แก้ไข
  const handleEditClick = (section) => {
    setEditSection(section);
    setTempData(profileData[section] || {});
    setIsEditing(true);
  };

  // ฟังก์ชันบันทึกข้อมูล
  const handleSave = () => {
    setProfileData(prev => ({
      ...prev,
      [editSection]: tempData
    }));
    setIsEditing(false);
    setEditSection('');
    setTempData({});
  };

  // ฟังก์ชันยกเลิก
  const handleCancel = () => {
    setIsEditing(false);
    setEditSection('');
    setTempData({});
  };

  // ฟังก์ชันอัพเดทข้อมูลชั่วคราว
  const handleInputChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ฟังก์ชันคลิกนอก Modal
  const handleBackdropClick = (e) => {
    // ถ้าคลิกที่ backdrop (พื้นหลัง) ให้ยกเลิก
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div className="relative">
      {/* Header with Profile Picture */}
      <div className="relative bg-gradient-to-r from-brand-primary to-orange-600 rounded-t-2xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute top-20 -left-10 w-32 h-32 bg-white rounded-full"></div>
        </div>
        
        <div className="relative p-6 flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
              <img
                src={profileData.profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full rounded-full bg-orange-100 hidden items-center justify-center text-brand-primary font-bold text-2xl">
                {profileData.name?.charAt(0) || 'U'}
              </div>
            </div>
            {/* Edit Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-brand-primary hover:bg-orange-50 transition-colors"
            >
              <svg className="w-5 h-5 fill-brand-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <h1 className="text-xl font-bold text-white mb-1">{profileData.name}</h1>
          <p className="text-orange-100 text-sm mb-1">{profileData.position}</p>
          <p className="text-orange-200 text-xs">{profileData.department}</p>
          
          {/* Status Badge */}
          <div className="mt-3 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium">● สถานะ: {profileData.status}</span>
          </div>
        </div>
      </div>

      <main className="p-4 space-y-4">
        {/* 1. ข้อมูลส่วนตัว */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 fill-brand-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              ข้อมูลส่วนตัว
            </h2>
            <button
              onClick={() => handleEditClick('personalInfo')}
              className="px-3 py-1 bg-gradient-to-r from-brand-primary to-orange-600 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              แก้ไข
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">วันเกิด :</span>
              <span className="text-gray-800 font-medium">{profileData.personalInfo.birthDate}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">อายุ :</span>
              <span className="text-gray-800 font-medium">{profileData.personalInfo.age}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ที่อยู่ :</span>
              <span className="text-gray-800 font-medium">{profileData.personalInfo.address}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">เบอร์ติดต่อ :</span>
              <span className="text-gray-800 font-medium">{profileData.personalInfo.phone}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">อีเมล :</span>
              <span className="text-gray-800 font-medium">{profileData.personalInfo.email}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">สถานะ :</span>
              <span className="text-gray-800 font-medium">{profileData.personalInfo.maritalStatus}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">เลขบัตรประชาชน :</span>
              <span className="text-gray-800 font-medium">{profileData.personalInfo.idCard}</span>
            </div>
            {profileData.personalInfo.emergencyContact && (
              <div className="flex items-start">
                <span className="text-gray-500 w-32 flex-shrink-0">ผู้ติดต่อฉุกเฉิน :</span>
                <span className="text-gray-800 font-medium">{profileData.personalInfo.emergencyContact}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. ข้อมูลการทำงาน */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 fill-brand-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-5 9h-4v4h4v-4z"/>
            </svg>
            ข้อมูลการทำงาน
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ตำแหน่ง :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.position}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">สถานที่ปฏิบัติงาน :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.workplace}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">รหัสพนักงาน :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.employeeId}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">แผนก/งาน/ฝ่าย :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.department}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">วันเริ่มงาน :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.startDate}</span>
            </div>
            {profileData.workInfo.workPeriod && (
              <div className="flex items-start">
                <span className="text-gray-500 w-32 flex-shrink-0">ระยะเวลาทำงาน :</span>
                <span className="text-gray-800 font-medium">{profileData.workInfo.workPeriod}</span>
              </div>
            )}
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติการศึกษา :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.education}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติการทำงาน :</span>
              <span className="text-gray-800 font-medium whitespace-pre-line">{profileData.workInfo.workHistory}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ทักษะทางงาน :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.skills}</span>
            </div>
            {profileData.workInfo.certifications && (
              <div className="flex items-start">
                <span className="text-gray-500 w-32 flex-shrink-0">ใบรับรอง/ประกาศนียบัตร :</span>
                <span className="text-gray-800 font-medium">{profileData.workInfo.certifications}</span>
              </div>
            )}
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ข้อมูลสวัสดิการ :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.benefits}</span>
            </div>
          </div>
        </div>

        {/* 3. ข้อมูลสุขภาพและความสามารถ */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 fill-brand-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 16H9v-2h4v2zm3-4H9v-2h7v2z"/>
            </svg>
            ข้อมูลสุขภาพและความสามารถ
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติสุขภาพ :</span>
              <span className="text-gray-800 font-medium">{profileData.healthInfo.medicalHistory}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">กรุ๊ปเลือด :</span>
              <span className="text-gray-800 font-medium">{profileData.healthInfo.bloodType}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">เลขประกันสังคม :</span>
              <span className="text-gray-800 font-medium">{profileData.healthInfo.socialSecurity}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">เงินเดือน :</span>
              <span className="text-gray-800 font-medium">{profileData.healthInfo.salary}</span>
            </div>
          </div>
        </div>

        {/* 4. ข้อมูลเพิ่มเติม */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 fill-brand-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            ข้อมูลเพิ่มเติม
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-gray-500 w-40 flex-shrink-0">สถิติการลา :</span>
              <span className="text-gray-800 font-medium">{profileData.additionalInfo.attendance}</span>
            </div>
            {profileData.additionalInfo.totalHours && (
              <div className="flex items-start">
                <span className="text-gray-500 w-40 flex-shrink-0">ชั่วโมงทำงานรวม :</span>
                <span className="text-gray-800 font-medium">{profileData.additionalInfo.totalHours}</span>
              </div>
            )}
            {profileData.additionalInfo.avgCheckIn && (
              <div className="flex items-start">
                <span className="text-gray-500 w-40 flex-shrink-0">เวลาเข้างานเฉลี่ย :</span>
                <span className="text-gray-800 font-medium">{profileData.additionalInfo.avgCheckIn}</span>
              </div>
            )}
            {profileData.additionalInfo.avgCheckOut && (
              <div className="flex items-start">
                <span className="text-gray-500 w-40 flex-shrink-0">เวลาออกงานเฉลี่ย :</span>
                <span className="text-gray-800 font-medium">{profileData.additionalInfo.avgCheckOut}</span>
              </div>
            )}
            <div className="flex items-start">
              <span className="text-gray-500 w-40 flex-shrink-0">ผลการประเมินงาน :</span>
              <span className="text-gray-800 font-medium">{profileData.additionalInfo.performance}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-40 flex-shrink-0">ประวัติการลงโทษ :</span>
              <span className="text-gray-800 font-medium">{profileData.additionalInfo.disciplinary}</span>
            </div>
          </div>
        </div>

        {/* ข้อมูลบริษัท */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 fill-brand-primary" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7h-10zm6 10h-4v4h-4v-4H6v-4h4v-4h4v4h4v4z"/></svg>
            ข้อมูลบริษัท
          </h2>
          <div className="space-y-3 text-sm">
            <h3 className="font-bold text-gray-800">{profileData.companyInfo.name}</h3>
            <p className="text-gray-600">{profileData.companyInfo.address}</p>
            <p className="text-gray-600">Call Center : {profileData.companyInfo.callCenter}</p>
            <p className="text-gray-600">Email : {profileData.companyInfo.email}</p>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditing && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-brand-primary to-orange-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold">แก้ไขข้อมูล</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {editSection === 'personalInfo' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                    <input
                      type="text"
                      value={tempData.birthDate || ''}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อายุ</label>
                    <input
                      type="text"
                      value={tempData.age || ''}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                    <textarea
                      value={tempData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์ติดต่อ</label>
                    <input
                      type="tel"
                      value={tempData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input
                      type="email"
                      value={tempData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                    <select
                      value={tempData.maritalStatus || ''}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="โสด">โสด</option>
                      <option value="สมรส">สมรส</option>
                      <option value="หย่าร้าง">หย่าร้าง</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน</label>
                    <input
                      type="text"
                      value={tempData.idCard || ''}
                      onChange={(e) => handleInputChange('idCard', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-brand-primary to-orange-600 text-white rounded-lg hover:bg-[#F26623] transition-colors font-medium"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileScreen;