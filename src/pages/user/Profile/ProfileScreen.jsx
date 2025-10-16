import React, { useState, useRef, useEffect } from 'react';
import userData from '../../../data/userData';

function ProfileScreen() {
  // State สำหรับเก็บข้อมูลที่แก้ไขได้
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('userProfileData');
    return saved ? JSON.parse(saved) : userData;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [tempData, setTempData] = useState({});
  const fileInputRef = useRef(null);

  // บันทึกข้อมูลลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('userProfileData', JSON.stringify(profileData));
  }, [profileData]);

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
    <div className="font-sans relative">
      {/* Header with Profile Picture */}
      <div className="relative bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] rounded-t-2xl overflow-hidden">
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
              <div className="w-full h-full rounded-full bg-blue-100 hidden items-center justify-center text-blue-600 font-bold text-2xl">
                {profileData.name?.charAt(0) || 'U'}
              </div>
            </div>
            {/* Edit Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-sm">✏️</span>
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
          <p className="text-blue-100 text-sm mb-1">{profileData.position}</p>
          <p className="text-blue-200 text-xs">{profileData.department}</p>
          
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
              <span className="mr-2">👤</span>
              ข้อมูลส่วนตัว
            </h2>
            <button
              onClick={() => handleEditClick('personalInfo')}
              className="px-3 py-1 bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
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
          </div>
        </div>

        {/* 2. ข้อมูลการทำงาน */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💼</span>
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
              <span className="text-gray-500 w-32 flex-shrink-0">วันเริ่มงาน / วันสร้าง :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.startDate}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติการศึกษา :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.education}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติการทำงาน :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.workHistory}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ทักษะทางงาน :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.skills}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ข้อมูลสวัสดิการ :</span>
              <span className="text-gray-800 font-medium">{profileData.workInfo.benefits}</span>
            </div>
          </div>
        </div>

        {/* 3. ข้อมูลสุขภาพและความสามารถ */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📋</span>
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
            <span className="mr-2">📊</span>
            ข้อมูลเพิ่มเติม
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">สถิติการลา :</span>
              <span className="text-gray-800 font-medium">{profileData.additionalInfo.attendance}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ผลการประเมินงาน :</span>
              <span className="text-gray-800 font-medium">{profileData.additionalInfo.performance}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติการลงโทษ :</span>
              <span className="text-gray-800 font-medium">{profileData.additionalInfo.disciplinary}</span>
            </div>
          </div>
        </div>

        {/* ข้อมูลบริษัท */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏢</span>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white p-6 rounded-t-2xl">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อายุ</label>
                    <input
                      type="text"
                      value={tempData.age || ''}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                    <textarea
                      value={tempData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์ติดต่อ</label>
                    <input
                      type="tel"
                      value={tempData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input
                      type="email"
                      value={tempData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                    <select
                      value={tempData.maritalStatus || ''}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white rounded-lg hover:bg-[#1cbfff] transition-colors font-medium"
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