import React, { useEffect } from 'react';

const UserEditModal = React.memo(function UserEditModal({ 
  show, 
  editingUser, 
  editForm, 
  currentUser, 
  onClose, 
  onSave, 
  onChange 
}) {
  // ป้องกันการ scroll พื้นหลังเมื่อ modal เปิด
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show || !editingUser) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            แก้ไขข้อมูลผู้ใช้
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            
            {/* ข้อมูลส่วนตัว */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ข้อมูลส่วนตัว
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รูปโปรไฟล์
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={editForm.profileImage || `https://i.pravatar.cc/100?u=${editingUser.id}`} 
                        alt="profile" 
                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                onChange({ ...editForm, profileImage: reader.result });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        อัพโหลดไฟล์รูปภาพ (JPG, PNG) หรือกรอก URL ด้านล่าง
                      </p>
                      <input
                        type="text"
                        value={editForm.profileImage || ''}
                        onChange={(e) => onChange({ ...editForm, profileImage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                        placeholder="หรือกรอก URL รูปภาพ (เช่น https://...)"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name || editingUser.name || ''}
                    onChange={(e) => onChange({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email || editingUser.email || ''}
                    onChange={(e) => onChange({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone || editingUser.phone || ''}
                    onChange={(e) => onChange({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="081-234-5678"
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันเกิด
                  </label>
                  <input
                    type="date"
                    value={editForm.birthDate || editingUser.birthDate || ''}
                    onChange={(e) => onChange({ ...editForm, birthDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อายุ (ปี)
                  </label>
                  <input
                    type="number"
                    value={editForm.age || editingUser.age || ''}
                    onChange={(e) => onChange({ ...editForm, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="35"
                  />
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เลขบัตรประชาชน
                  </label>
                  <input
                    type="text"
                    value={editForm.nationalId || editingUser.nationalId || ''}
                    onChange={(e) => onChange({ ...editForm, nationalId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="1234567890123"
                    maxLength="13"
                  />
                </div>

                {/* Blood Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หมู่เลือด
                  </label>
                  <select
                    value={editForm.bloodType || editingUser.bloodType || ''}
                    onChange={(e) => onChange({ ...editForm, bloodType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">เลือกหมู่เลือด</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ข้อมูลบัญชี */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                ข้อมูลบัญชี
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username || editingUser.username || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">สร้างอัตโนมัติเมื่อเพิ่มผู้ใช้ใหม่</p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (รหัสผ่าน)
                  </label>
                  <input
                    type="text"
                    value={editForm.password || editingUser.password || ''}
                    onChange={(e) => onChange({ ...editForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
                    placeholder="เลขบัตรประชาชน 13 หลัก"
                  />
                  <p className="text-xs text-gray-500 mt-1">แสดงแบบไม่เข้ารหัส</p>
                </div>
              </div>
            </div>

            {/* ข้อมูลการทำงาน */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                ข้อมูลการทำงาน
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee ID - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสพนักงาน
                  </label>
                  <input
                    type="text"
                    value={editForm.employeeId || editingUser.employeeId || editingUser.username || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">ไม่สามารถแก้ไขได้</p>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    value={editForm.position || editingUser.position || ''}
                    onChange={(e) => onChange({ ...editForm, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Senior Software Engineer"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    แผนก
                  </label>
                  <select
                    value={editForm.department || editingUser.department || ''}
                    onChange={(e) => onChange({ ...editForm, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">เลือกแผนก</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    บทบาท
                  </label>
                  <select
                    value={editForm.role || editingUser.role || ''}
                    onChange={(e) => onChange({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    disabled={currentUser?.role === 'admin' && editingUser?.role === 'superadmin'}
                  >
                    <option value="">เลือกบทบาท</option>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    {currentUser?.role === 'superadmin' && (
                      <option value="superadmin">Super Admin</option>
                    )}
                  </select>
                  {currentUser?.role === 'admin' && editingUser?.role === 'superadmin' && (
                    <p className="text-xs text-red-500 mt-1">Admin ไม่สามารถแก้ไข Role ของ Super Admin ได้</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สถานะ
                  </label>
                  <select
                    value={editForm.status || editingUser.status || ''}
                    onChange={(e) => onChange({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="active">Active (ทำงานปกติ)</option>
                    <option value="leave">Leave (ลาออก)</option>
                    <option value="suspended">Suspended (ระงับการใช้งาน)</option>
                    <option value="pending">Pending (รอการอนุมัติ)</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันที่เริ่มงาน
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate || editingUser.startDate || ''}
                    onChange={(e) => onChange({ ...editForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เงินเดือน (บาท)
                  </label>
                  <input
                    type="number"
                    value={editForm.salary || editingUser.salary || ''}
                    onChange={(e) => onChange({ ...editForm, salary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="45000"
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลผู้ติดต่อฉุกเฉิน */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                ข้อมูลผู้ติดต่อฉุกเฉิน
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อผู้ติดต่อฉุกเฉิน
                  </label>
                  <input
                    type="text"
                    value={editForm.emergencyContactName || editingUser.emergencyContact?.name || ''}
                    onChange={(e) => onChange({ ...editForm, emergencyContactName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="นายสมชาย รัตนา"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์ผู้ติดต่อฉุกเฉิน
                  </label>
                  <input
                    type="tel"
                    value={editForm.emergencyContactPhone || editingUser.emergencyContact?.phone || ''}
                    onChange={(e) => onChange({ ...editForm, emergencyContactPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="089-888-4357"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ความสัมพันธ์
                  </label>
                  <select
                    value={editForm.emergencyContactRelation || editingUser.emergencyContact?.relation || ''}
                    onChange={(e) => onChange({ ...editForm, emergencyContactRelation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">เลือกความสัมพันธ์</option>
                    <option value="บิดา">บิดา</option>
                    <option value="มารดา">มารดา</option>
                    <option value="สามี">สามี</option>
                    <option value="ภรรยา">ภรรยา</option>
                    <option value="พี่ชาย">พี่ชาย</option>
                    <option value="พี่สาว">พี่สาว</option>
                    <option value="น้องชาย">น้องชาย</option>
                    <option value="น้องสาว">น้องสาว</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ที่อยู่ */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                ที่อยู่
              </h3>
              <textarea
                value={editForm.address || editingUser.address || ''}
                onChange={(e) => onChange({ ...editForm, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                rows="3"
                placeholder="กรอกที่อยู่"
              />
            </div>

            {/* ประวัติการทำงาน */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ประวัติการทำงาน
              </h3>
              {editForm.workHistory && editForm.workHistory.length > 0 ? (
                <div className="space-y-2">
                  {editForm.workHistory.map((work, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{work.position}</div>
                        <div className="text-sm text-gray-600">{work.company}</div>
                        <div className="text-xs text-gray-500">{work.period}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newWorkHistory = editForm.workHistory.filter((_, i) => i !== index);
                          onChange({ ...editForm, workHistory: newWorkHistory });
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">ไม่มีประวัติการทำงาน</p>
              )}
            </div>

            {/* การศึกษา */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                การศึกษา
              </h3>
              {editForm.education && editForm.education.length > 0 ? (
                <div className="space-y-2">
                  {editForm.education.map((edu, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1 text-gray-700">{edu}</div>
                      <button
                        type="button"
                        onClick={() => {
                          const newEducation = editForm.education.filter((_, i) => i !== index);
                          onChange({ ...editForm, education: newEducation });
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">ไม่มีข้อมูลการศึกษา</p>
              )}
            </div>

            {/* ทักษะ */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ทักษะ
              </h3>
              {editForm.skills && editForm.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {editForm.skills.map((skill, index) => (
                    <div key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newSkills = editForm.skills.filter((_, i) => i !== index);
                          onChange({ ...editForm, skills: newSkills });
                        }}
                        className="text-purple-500 hover:text-purple-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">ไม่มีข้อมูลทักษะ</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            บันทึกการแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
});

export default UserEditModal;
