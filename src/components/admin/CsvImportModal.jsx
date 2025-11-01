import React, { memo } from 'react';

/**
 * CsvImportModal - Modal สำหรับแสดง preview ข้อมูล CSV ก่อนนำเข้า
 * ใช้ร่วมกับ AdminManageUser
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const CsvImportModal = memo(function CsvImportModal({ 
  isOpen, 
  csvData, 
  generateEmployeeId,
  onConfirm, 
  onClose 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-primary dark:bg-primary text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              อัพโหลดไฟล์ CSV
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-accent hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sky-100 mt-2">ตรวจสอบข้อมูลก่อนนำเข้าระบบ</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-4 bg-accent dark:bg-accent-orange border border-gray-200 dark:border-white/10 rounded-lg p-4">
            <p className="text-sm text-secondary dark:text-white">
              <span className="font-semibold">📋 จำนวนข้อมูล:</span> {csvData.length} รายการ
            </p>
            <p className="text-sm text-primary dark:text-primary mt-1">
              กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการนำเข้า
            </p>
          </div>

          {/* CSV Data Preview Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-accent dark:bg-accent-orange">
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">#</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">รหัสพนักงาน (Auto)</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">ชื่อ-นามสกุล</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">อีเมล</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">จังหวัด</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">สาขา</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">แผนก</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">ตำแหน่ง</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">บทบาท</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">เบอร์โทร</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, index) => {
                  const provinceCode = (row.provinceCode || 'BKK').toUpperCase().slice(0, 3);
                  const branchCode = (row.branchCode || '101').slice(0, 3);
                  const previewEmployeeId = generateEmployeeId(provinceCode, branchCode);

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-2 py-2">
                        <span className="font-semibold text-primary dark:text-primary">{previewEmployeeId}</span>
                      </td>
                      <td className="border border-gray-300 px-2 py-2">{row.name || ''}</td>
                      <td className="border border-gray-300 px-2 py-2 text-xs">{row.email || ''}</td>
                      <td className="border border-gray-300 px-2 py-2">{row.provinceCode || ''}</td>
                      <td className="border border-gray-300 px-2 py-2">{row.branchCode || ''}</td>
                      <td className="border border-gray-300 px-2 py-2">{row.department || ''}</td>
                      <td className="border border-gray-300 px-2 py-2">{row.position || ''}</td>
                      <td className="border border-gray-300 px-2 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          row.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          row.role === 'superadmin' ? 'bg-red-100 text-red-700' :
                          'bg-accent dark:bg-accent-orange text-secondary dark:text-white'
                        }`}>
                          {row.role === 'admin' ? 'Admin' : 
                           row.role === 'superadmin' ? 'Super Admin' : 
                           'User'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-2">{row.phone || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CSV Format Example */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-secondary dark:text-white mb-2">📄 ตัวอย่างรูปแบบไฟล์ CSV:</h3>
            <div className="bg-white border border-gray-300 rounded p-3 text-xs overflow-x-auto">
              <code className="text-gray-800">
                name,email,provinceCode,branchCode,role,department,position,nationalId,phone,skills<br/>
                นายสมชาย ใจดี,somchai@email.com,BKK,101,user,IT,Developer,1234567890123,081-234-5678,"JavaScript|React"<br/>
                นางสาวสมหญิง สวย,somying@email.com,BKK,101,admin,HR,HR Manager,9876543210987,082-345-6789,"HR|Recruitment"
              </code>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-accent dark:bg-accent-orange hover:bg-accent/80 dark:hover:bg-accent-orange/80 text-secondary dark:text-white rounded-xl transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-white rounded-xl shadow-lg hover: transition-all font-medium"
          >
            ยืนยันนำเข้า ({csvData.length} รายการ)
          </button>
        </div>
      </div>
    </div>
  );
});

CsvImportModal.displayName = 'CsvImportModal';

export default CsvImportModal;
