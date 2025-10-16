import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/useAuth'

function SettingsScreen() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  // ล็อกการเลื่อนหน้าเมื่อ Modal เปิด
  useEffect(() => {
    if (showTerms || showPrivacy) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showTerms, showPrivacy])

  const handleLogout = () => {
    if (logout) {
      logout()
    }
    navigate('/auth')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่า</h1>
        <p className="text-gray-600 mt-1">จัดการการตั้งค่าและความเป็นส่วนตัว</p>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">บัญชี</h2>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/user/profile')}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#48CBFF">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">แก้ไขโปรไฟล์</p>
                <p className="text-sm text-gray-600">จัดการข้อมูลส่วนตัว</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>

          <button
            onClick={() => navigate('/auth?mode=reset')}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#22C55E">
                  <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">เปลี่ยนรหัสผ่าน</p>
                <p className="text-sm text-gray-600">อัปเดตรหัสผ่านของคุณ</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">เกี่ยวกับ</h2>
        <div className="space-y-4">
          <button 
            onClick={() => setShowTerms(true)}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium text-gray-800">เงื่อนไขการใช้งาน</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>

          <button 
            onClick={() => setShowPrivacy(true)}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium text-gray-800">นโยบายความเป็นส่วนตัว</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#9CA3AF">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>

          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">เวอร์ชัน</p>
            <p className="font-medium text-gray-800">1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-md hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
        <span>ออกจากระบบ</span>
      </button>

      {/* Terms Modal */}
      {showTerms && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowTerms(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">เงื่อนไขการใช้งาน</h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm">
                <h3 className="font-bold text-lg mb-3">1. การยอมรับเงื่อนไข</h3>
                <p className="text-gray-600 mb-4">
                  การใช้งานแอปพลิเคชัน EasyCheck ถือว่าคุณยอมรับเงื่อนไขการใช้งานทั้งหมดนี้
                </p>

                <h3 className="font-bold text-lg mb-3">2. การใช้งาน</h3>
                <p className="text-gray-600 mb-4">
                  - ผู้ใช้ต้องใช้งานระบบด้วยความรับผิดชอบ<br/>
                  - ห้ามใช้งานในทางที่ผิดกฎหมาย<br/>
                  - ห้ามแชร์ข้อมูลเข้าสู่ระบบกับผู้อื่น
                </p>

                <h3 className="font-bold text-lg mb-3">3. ความรับผิดชอบ</h3>
                <p className="text-gray-600 mb-4">
                  ผู้ใช้มีหน้าที่รับผิดชอบในการรักษาความปลอดภัยของบัญชีผู้ใช้
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTerms(false)}
                className="w-full bg-sky-500 text-white py-3 rounded-xl font-semibold hover:bg-sky-600 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowPrivacy(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">นโยบายความเป็นส่วนตัว</h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm">
                <h3 className="font-bold text-lg mb-3">1. การเก็บรวบรวมข้อมูล</h3>
                <p className="text-gray-600 mb-4">
                  เราเก็บรวบรวมข้อมูลส่วนบุคคลที่จำเป็นต่อการให้บริการ เช่น:<br/>
                  - ชื่อ-นามสกุล<br/>
                  - รหัสพนักงาน<br/>
                  - แผนก/ตำแหน่ง<br/>
                  - ข้อมูลการเข้างาน-ออกงาน
                </p>

                <h3 className="font-bold text-lg mb-3">2. การใช้ข้อมูล</h3>
                <p className="text-gray-600 mb-4">
                  ข้อมูลของคุณจะถูกใช้เพื่อ:<br/>
                  - บริหารจัดการเวลาทำงาน<br/>
                  - ออกรายงานสำหรับฝ่ายบุคคล<br/>
                  - ปรับปรุงการให้บริการ
                </p>

                <h3 className="font-bold text-lg mb-3">3. ความปลอดภัย</h3>
                <p className="text-gray-600 mb-4">
                  เรามีมาตรการรักษาความปลอดภัยข้อมูลตามมาตรฐาน PDPA
                </p>

                <h3 className="font-bold text-lg mb-3">4. สิทธิของผู้ใช้</h3>
                <p className="text-gray-600 mb-4">
                  คุณมีสิทธิ์:<br/>
                  - เข้าถึงและแก้ไขข้อมูลส่วนตัว<br/>
                  - ขอลบข้อมูลส่วนตัว<br/>
                  - คัดค้านการประมวลผลข้อมูล
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-full bg-sky-500 text-white py-3 rounded-xl font-semibold hover:bg-sky-600 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsScreen
