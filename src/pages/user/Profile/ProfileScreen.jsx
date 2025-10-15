import React from 'react';
import userData from '../../../data/userData';

// ใช้ข้อมูลจาก shared data file
const data = userData;

function ProfileScreen() {
  return (
    <div className="font-sans">
      {/* Header with Profile Picture */}
      <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-t-2xl overflow-hidden">
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
                src={data.profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full rounded-full bg-blue-100 hidden items-center justify-center text-blue-600 font-bold text-2xl">
                {data.name?.charAt(0) || 'U'}
              </div>
            </div>
            {/* Edit Button */}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
              <span className="text-sm">✏️</span>
            </button>
          </div>

          {/* User Info */}
          <h1 className="text-xl font-bold text-white mb-1">{data.name}</h1>
          <p className="text-blue-100 text-sm mb-1">{data.position}</p>
          <p className="text-blue-200 text-xs">{data.department}</p>
          
          {/* Status Badge */}
          <div className="mt-3 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium">● สถานะ: {data.status}</span>
          </div>
        </div>
      </div>

      <main className="p-4 space-y-4">
        {/* 1. ข้อมูลส่วนตัว */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            ข้อมูลส่วนตัว
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">วันเกิด :</span>
              <span className="text-gray-800 font-medium">{data.personalInfo.birthDate}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">อายุ :</span>
              <span className="text-gray-800 font-medium">{data.personalInfo.age}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ที่อยู่ :</span>
              <span className="text-gray-800 font-medium">{data.personalInfo.address}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">เบอร์ติดต่อ :</span>
              <span className="text-gray-800 font-medium">{data.personalInfo.phone}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">อีเมล :</span>
              <span className="text-gray-800 font-medium">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">สถานะ :</span>
              <span className="text-gray-800 font-medium">{data.personalInfo.maritalStatus}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">เลขบัตรประชาชน :</span>
              <span className="text-gray-800 font-medium">{data.personalInfo.idCard}</span>
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
              <span className="text-gray-800 font-medium">{data.workInfo.position}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">สถานที่ปฏิบัติงาน :</span>
              <span className="text-gray-800 font-medium">{data.workInfo.workplace}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">รหัสพนักงาน :</span>
              <span className="text-gray-800 font-medium">{data.workInfo.employeeId}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">แผนก/งาน/ฝ่าย :</span>
              <span className="text-gray-800 font-medium">{data.workInfo.department}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">วันเริ่มงาน / วันสร้าง :</span>
              <span className="text-gray-800 font-medium">{data.workInfo.startDate}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติการศึกษา :</span>
              <span className="text-gray-800 font-medium">{data.workInfo.education}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติการทำงาน :</span>
              <span className="text-gray-800 font-medium">{data.workInfo.workHistory}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ทักษะทางงาน :</span>
              <span className="text-gray-800 font-medium">{data.workInfo.skills}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ข้อมูลสวัสดิการ :</span>
              <span className="text-gray-800 font-medium">{data.workInfo.benefits}</span>
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
              <span className="text-gray-800 font-medium">{data.healthInfo.medicalHistory}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">กรุ๊ปเลือด :</span>
              <span className="text-gray-800 font-medium">{data.healthInfo.bloodType}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">เลขประกันสังคม :</span>
              <span className="text-gray-800 font-medium">{data.healthInfo.socialSecurity}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">เงินเดือน :</span>
              <span className="text-gray-800 font-medium">{data.healthInfo.salary}</span>
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
              <span className="text-gray-800 font-medium">{data.additionalInfo.attendance}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ผลการประเมินงาน :</span>
              <span className="text-gray-800 font-medium">{data.additionalInfo.performance}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 w-32 flex-shrink-0">ประวัติการลงโทษ :</span>
              <span className="text-gray-800 font-medium">{data.additionalInfo.disciplinary}</span>
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
            <h3 className="font-bold text-gray-800">{data.companyInfo.name}</h3>
            <p className="text-gray-600">{data.companyInfo.address}</p>
            <p className="text-gray-600">Call Center : {data.companyInfo.callCenter}</p>
            <p className="text-gray-600">Email : {data.companyInfo.email}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfileScreen;