import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/useAuth';
import { usersData } from '../../../data/usersData';

export default function CheackInstead() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState('');
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const reasons = [
    'ลาป่วย',
    'ลากิจ',
    'ติดภารกิจ',
    'อุบัติเหตุ',
    'ติดธุระส่วนตัว',
    'อื่นๆ (โปรดระบุ)'
  ];

  // กรองเพื่อนที่อยู่ในแผนกเดียวกัน (ยกเว้นตัวเอง)
  const colleagues = usersData.filter(
    u => u.department === user.department && u.id !== user.id && u.status === 'active'
  );

  const handleEvidenceChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidence(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFriend || !reason || !evidence) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (reason === 'อื่นๆ (โปรดระบุ)' && !otherReason.trim()) {
      alert('กรุณาระบุเหตุผล');
      return;
    }

    setIsSubmitting(true);

    // สร้างคำขอเช็คชื่อแทน
    const checkInRequest = {
      id: Date.now(),
      requesterId: user.id,
      requesterName: user.name,
      requesterRole: user.role,
      targetUserId: parseInt(selectedFriend),
      targetUserName: colleagues.find(c => c.id === parseInt(selectedFriend))?.name,
      reason: reason === 'อื่นๆ (โปรดระบุ)' ? otherReason : reason,
      evidence: evidencePreview,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date().toISOString(),
      approver: getApprover(user.role)
    };

    // บันทึกลง localStorage
    const existingRequests = JSON.parse(localStorage.getItem('checkInRequests') || '[]');
    existingRequests.push(checkInRequest);
    localStorage.setItem('checkInRequests', JSON.stringify(existingRequests));

    setIsSubmitting(false);
    setShowSuccess(true);
  };

  // กำหนดผู้อนุมัติตาม role
  const getApprover = (role) => {
    switch (role) {
      case 'user':
        return 'manager';
      case 'manager':
        return 'admin';
      case 'admin':
        return 'superadmin';
      case 'superadmin':
        return 'superadmin'; // superadmin อนุมัติเอง
      default:
        return 'manager';
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-2xl rounded-2xl">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
            <svg className="w-12 h-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800 font-prompt">ส่งคำขอสำเร็จ!</h2>
          <p className="mb-8 text-gray-600 font-prompt">
            รอ{getApprover(user.role) === 'manager' ? 'ผู้จัดการ' : getApprover(user.role) === 'admin' ? 'แอดมิน' : 'ซุปเปอร์แอดมิน'}อนุมัติ
          </p>
          <button 
            onClick={() => navigate('/user/dashboard')} 
            className="w-full bg-primary text-white py-3 px-6 rounded-xl font-prompt font-medium text-lg shadow-lg hover:bg-primary/90 transition-all duration-300"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="relative flex items-center justify-center h-full">
          <button 
            onClick={() => navigate('/user/dashboard')} 
            className="absolute p-2 transition-colors rounded-lg left-4 hover:bg-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold font-prompt">เช็คชื่อแทน</h1>
            <p className="text-xs mt-0.5 opacity-90">ยื่นคำขอเพื่อรอการอนุมัติ</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* เลือกเพื่อน */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <label className="block text-sm font-medium text-secondary mb-2 font-prompt">
              เลือกเพื่อนที่ต้องการเช็คแทน <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl font-prompt focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">เลือกเพื่อน</option>
              {colleagues.map(colleague => (
                <option key={colleague.id} value={colleague.id}>
                  {colleague.name} - {colleague.position}
                </option>
              ))}
            </select>
          </div>

          {/* เหตุผล */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <label className="block text-sm font-medium text-secondary mb-2 font-prompt">
              เหตุผลที่เช็คแทน <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl font-prompt focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">เลือกเหตุผล</option>
              {reasons.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
            </select>
            
            {reason === 'อื่นๆ (โปรดระบุ)' && (
              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="โปรดระบุเหตุผล..."
                className="w-full p-3 mt-3 border border-gray-300 rounded-xl font-prompt focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="3"
                required
              />
            )}
          </div>

          {/* แนบหลักฐาน */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <label className="block text-sm font-medium text-secondary mb-2 font-prompt">
              แนบหลักฐาน <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleEvidenceChange}
              className="hidden"
              required
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary transition-colors font-prompt text-gray-600"
            >
              {evidence ? 'เปลี่ยนไฟล์' : 'คลิกเพื่ออัพโหลดหลักฐาน'}
            </button>
            
            {evidencePreview && (
              <div className="mt-4">
                <img src={evidencePreview} alt="Evidence Preview" className="w-full h-auto rounded-xl shadow-md" />
              </div>
            )}
          </div>

          {/* ปุ่มส่ง */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-prompt font-medium text-lg shadow-lg transition-all duration-300 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอ'}
          </button>
        </form>
      </div>
    </div>
  );
}
