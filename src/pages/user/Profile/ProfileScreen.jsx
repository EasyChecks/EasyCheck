import React from 'react';

const data = {
  // ข้อมูลพื้นฐาน
  id: 1,
  name: "เอกชาติ รัตนา (Mr. Apichart Rattana)",
  position: "เจ้าหน้าที่คนดำ",
  department: "JUBJUB",
  profilePic: "/images/niggatron.jpg",
  status: "ปฏิบัติงาน",

  // ข้อมูลส่วนตัว
  personalInfo: {
    birthDate: "2 ธันวาคม 2530",
    age: "38 ปี",
    address: "18/25 หมู่ 10 ตำบลบุรมณฑ์ 77 แขวงคลองขาน กรุงเทพฯ 10250",
    phone: "091-432-5643",
    email: "apichart.rat@email.com",
    maritalStatus: "โสด",
    idCard: "1-1002-43657-22-4"
  },

  // ข้อมูลการทำงาน
  workInfo: {
    position: "พัฒนากร วิศวกรรมคอมพิวเตอร์สาขาจุดใจ (Senior Software Engineer)",
    workplace: "AE 0478",
    employeeId: "AR0478 Apichart",
    department: "แผนกพัฒนาซอฟต์แวร์ (Software Development)",
    startDate: "1 ตุลาคม 2568",
    education: "ปริญญาตรี วิชาวิศวกรรมซอฟต์แวร์คอมพิวเตอร์ จากมหาวิทยาลัย K",
    workHistory: "U. ABC Tech (2560-2568) ตำแหน่ง Software Developer",
    skills: "ทักษะด้านทำงานระยะมาว",
    benefits: "ประกันสังคม, กองทุนสำรองเลี้ยงชีพ (ส่ง 5%)"
  },

  // ข้อมูลสุขภาพ
  healthInfo: {
    medicalHistory: "ปกติ (ตรวจล่าสุด 2568)",
    bloodType: "B",
    socialSecurity: "123-4-XXXXX-9 สบทร M",
    salary: "65,000 บาท (เมื่อทุกเดือน)"
  },

  // ข้อมูลเพิ่มเติม
  additionalInfo: {
    attendance: "ลาป่วย 4 วัน / ลากิจ 0 วัน / มาสาย 1 ครั้ง (ตรวจล่าสุด)",
    performance: "ผ่านการประเมินงาน : ระดับดีมาก (A)",
    disciplinary: "ไม่เคยมีประวัติการลงโทษ"
  },

  // ข้อมูลบริษัท
  companyInfo: {
    name: "Pineapple Solutions Co., Ltd.",
    address: "88 อาคารดีทัค ทาวเวอร์ 2 ยูนิต 1507 ชั้น 15 ถ.เทคโนโลยี แขวง บางเขน เขตบางเขน กรุงเทพมหานคร 10220",
    callCenter: "02-456-7890",
    email: "contact@pineapplesolutions.com"
  }
};

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