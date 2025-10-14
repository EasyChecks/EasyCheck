import React from 'react';
import { IoArrowBack, IoLockClosedOutline, IoPowerOutline, IoExitOutline } from 'react-icons/io5';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';


function ProfileScreen() {
  return (
    <div className="min-h-screen font-sans bg-slate-100">
      <header className="relative p-6 pt-12 text-white bg-blue-500">
        <button className="absolute text-2xl top-5 left-5">
          <IoArrowBack />
        </button>
        <div className="flex flex-col items-center">

          <img
            src="/images/niggatron.jpg"
            alt="Profile Picture"
            className="object-cover w-24 h-24 mb-4 border-4 border-white rounded-full"
          />
        {/* ข้อมูลพนักงาน */}
          <h1 className="text-xl font-bold">Mr.NiggaTron</h1>
          <p className="text-sm text-blue-100">เจ้าหน้าที่คนดำ</p>
          <p className="mt-1 text-xs text-blue-200">JUBJUB</p>
        </div>
      </header>

      <main className="p-4">
        {/* เมนูตั้งค่า */}
        <div className="overflow-hidden bg-white rounded-lg shadow-sm">
          {/* เมนูตั้งรหัสผ่าน */}
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
            <div className="flex items-center">
              <IoLockClosedOutline className="mr-4 text-xl text-slate-500" />
              <span className="text-slate-800">ตั้งรหัสผ่าน</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* ข้อมูลบริษัท */}
        <div className="p-4 mt-4 bg-white rounded-lg shadow-sm">
          <div className="flex">
            <HiOutlineOfficeBuilding className="mt-1 mr-4 text-2xl text-slate-500" />
            <div>
              <h2 className="font-bold text-slate-800">Pineapple Solutions Co., Ltd.</h2>
              <p className="mt-2 text-sm text-slate-600">
                88 อาคารดีทัค ทาวเวอร์ 2 ยูนิต 1507 ชั้น 15 ถ.เทคโนโลยี <br/>
                แขวง บางเขน เขตบางเขน กรุงเทพมหานคร 10220
              </p>
              <p className="mt-2 text-sm text-slate-600">Call Center : 02-456-7890</p>
              <p className="mt-1 text-sm text-slate-600">Email : contact@pineapplesolutions.com</p>
            </div>
          </div>
        </div>

        {/* ออกจากระบบ */}
        <div className="mt-4 overflow-hidden bg-white rounded-lg shadow-sm">
           <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
            <div className="flex items-center">
              <IoPowerOutline className="mr-4 text-xl text-red-500" />
              <span className="font-medium text-red-500">ออกจากระบบ</span>
            </div>
            <IoExitOutline className="text-xl text-slate-400" />
          </div>
        </div>
      </main>

    </div>
  );
}

export default ProfileScreen;