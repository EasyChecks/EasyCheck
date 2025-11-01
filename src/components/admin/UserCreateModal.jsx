import React, { useState, memo, useEffect } from 'react';

/**
 * UserCreateModal - Modal สำหรับเพิ่มผู้ใช้ใหม่ทีละคน
 * ใช้ร่วมกับ AdminManageUser เพื่อสร้างผู้ใช้ใหม่
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const UserCreateModal = memo(function UserCreateModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  generateEmployeeId, 
  users 
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'user',
    position: '',
    nationalId: '',
    provinceCode: '',
    branchCode: '',
    birthDate: '',
    address: '',
    bloodType: '',
    age: '',
    salary: '',
    status: 'active',
    startDate: '', // วันที่เริ่มงาน
    // ข้อมูลผู้ติดต่อฉุกเฉิน
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    // ประวัติการทำงาน
    workHistory: [],
    // การศึกษา
    education: [],
    // ทักษะ
    skills: []
  });

  const [errors, setErrors] = useState({});
  const [previewEmployeeId, setPreviewEmployeeId] = useState('');
  
  // State สำหรับ dynamic fields
  const [currentWorkHistory, setCurrentWorkHistory] = useState({ position: '', company: '', period: '' });
  const [currentEducation, setCurrentEducation] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');

  // ป้องกันการ scroll พื้นหลังเมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Province และ Branch options
  const provinces = [
    { code: 'BKK', name: 'กรุงเทพฯ' },
    { code: 'CNX', name: 'เชียงใหม่' },
    { code: 'PKT', name: 'ภูเก็ต' },
    { code: 'KKN', name: 'ขอนแก่น' },
    { code: 'HDY', name: 'หาดใหญ่' },
  ];

  const branches = [
    { code: '101', name: 'สำนักงานใหญ่' },
    { code: '102', name: 'สาขาที่ 2' },
    { code: '103', name: 'สาขาที่ 3' },
    { code: '201', name: 'สาขาย่อย 1' },
    { code: '202', name: 'สาขาย่อย 2' },
  ];

  const departments = [
    'การเงิน',
    'ฝ่ายบุคคล',
    'ฝ่ายขาย',
    'ฝ่ายผลิต',
    'ฝ่ายไอที',
    'ฝ่ายการตลาด',
    'ฝ่ายบริการ'
  ];

  const positions = [
    'พนักงาน',
    'หัวหน้าทีม',
    'ผู้จัดการ',
    'ผู้อำนวยการ',
    'ผู้บริหาร'
  ];

  const bloodTypes = ['A', 'B', 'AB', 'O'];

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-generate preview employee ID
    if (field === 'provinceCode' || field === 'branchCode') {
      const provinceCode = field === 'provinceCode' ? value : formData.provinceCode;
      const branchCode = field === 'branchCode' ? value : formData.branchCode;
      
      if (provinceCode && branchCode) {
        const preview = generateEmployeeId(provinceCode, branchCode);
        setPreviewEmployeeId(preview);
      } else {
        setPreviewEmployeeId('');
      }
    }

    // Auto-calculate age from birthDate
    if (field === 'birthDate' && value) {
      const birthYear = new Date(value).getFullYear();
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - birthYear;
      setFormData(prev => ({
        ...prev,
        age: calculatedAge.toString()
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    if (!formData.email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    if (!formData.phone.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    if (!formData.department) newErrors.department = 'กรุณาเลือกแผนก';
    if (!formData.position) newErrors.position = 'กรุณาเลือกตำแหน่ง';
    if (!formData.nationalId.trim()) newErrors.nationalId = 'กรุณากรอกเลขบัตรประชาชน';
    if (!formData.provinceCode) newErrors.provinceCode = 'กรุณาเลือกจังหวัด';
    if (!formData.branchCode) newErrors.branchCode = 'กรุณาเลือกสาขา';

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // Validate phone format (10 digits)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    }

    // Validate national ID format (13 digits)
    if (formData.nationalId && !/^\d{13}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    }

    // Check duplicates
    const employeeId = previewEmployeeId;
    
    if (users.some(u => u.email === formData.email)) {
      newErrors.email = 'อีเมลนี้มีในระบบแล้ว';
    }

    if (users.some(u => u.nationalId === formData.nationalId)) {
      newErrors.nationalId = 'เลขบัตรประชาชนนี้มีในระบบแล้ว';
    }

    if (users.some(u => u.username === employeeId || u.employeeId === employeeId)) {
      newErrors.provinceCode = 'รหัสพนักงานนี้มีในระบบแล้ว';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ฟังก์ชันจัดการ Work History
  const addWorkHistory = () => {
    if (currentWorkHistory.position && currentWorkHistory.company && currentWorkHistory.period) {
      setFormData({
        ...formData,
        workHistory: [...formData.workHistory, { ...currentWorkHistory }]
      });
      setCurrentWorkHistory({ position: '', company: '', period: '' });
    }
  };

  const removeWorkHistory = (index) => {
    setFormData({
      ...formData,
      workHistory: formData.workHistory.filter((_, i) => i !== index)
    });
  };

  // ฟังก์ชันจัดการ Education
  const addEducation = () => {
    if (currentEducation.trim()) {
      setFormData({
        ...formData,
        education: [...formData.education, currentEducation.trim()]
      });
      setCurrentEducation('');
    }
  };

  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  // ฟังก์ชันจัดการ Skills
  const addSkill = () => {
    if (currentSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // สร้างข้อมูลผู้ใช้ใหม่
    const newUser = {
      id: users.length + 1,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      department: formData.department,
      role: formData.role,
      position: formData.position,
      nationalId: formData.nationalId.trim(),
      username: previewEmployeeId, // สร้างอัตโนมัติ
      employeeId: previewEmployeeId, // สร้างอัตโนมัติ
      password: formData.nationalId.trim(), // รหัสผ่านเริ่มต้นเป็นเลขบัตรประชาชน
      provinceCode: formData.provinceCode,
      branchCode: formData.branchCode,
      birthDate: formData.birthDate,
      age: formData.age,
      address: formData.address,
      bloodType: formData.bloodType,
      salary: formData.salary,
      status: formData.status,
      startDate: formData.startDate, // วันที่เริ่มงาน
      // ข้อมูลผู้ติดต่อฉุกเฉิน
      emergencyContact: formData.emergencyContactName ? {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relation: formData.emergencyContactRelation
      } : null,
      // ประวัติการทำงาน
      workHistory: formData.workHistory.length > 0 ? formData.workHistory : undefined,
      // การศึกษา
      education: formData.education.length > 0 ? formData.education : undefined,
      // ทักษะ
      skills: formData.skills.length > 0 ? formData.skills : undefined,
      createdAt: new Date().toISOString(),
    };

    // ถ้าเป็น admin หรือ superadmin ให้สร้าง admin account ด้วย
    if (formData.role === 'admin' || formData.role === 'superadmin') {
      newUser.adminAccount = `ADM${previewEmployeeId}`;
      newUser.adminPassword = formData.role === 'superadmin' 
        ? 'SuperAdmin@GGS2024!' 
        : 'Admin@GGS2024!';
    }

    onSubmit(newUser);
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    // Reset form data
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: 'user',
      position: '',
      nationalId: '',
      provinceCode: '',
      branchCode: '',
      birthDate: '',
      address: '',
      bloodType: '',
      age: '',
      salary: '',
      status: 'active',
      startDate: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      workHistory: [],
      education: [],
      skills: []
    });
    
    // Reset dynamic field states
    setCurrentWorkHistory({ position: '', company: '', period: '' });
    setCurrentEducation('');
    setCurrentSkill('');
    
    // Reset other states
    setErrors({});
    setPreviewEmployeeId('');
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-sm w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary via-orange-700 to-orange-600 px-6 py-5 flex justify-between items-center relative overflow-hidden flex-shrink-0">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-md">เพิ่มผู้ใช้ใหม่</h2>
              <p className="text-white/80 text-sm">เพิ่มข้อมูลพนักงานเข้าสู่ระบบ</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="relative text-white hover:bg-white/20 rounded-xl transition-all p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ชื่อ-นามสกุล */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="เช่น นายสมชาย ใจดี"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* จังหวัด */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                จังหวัด <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.provinceCode}
                onChange={(e) => handleInputChange('provinceCode', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                  errors.provinceCode ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                ))}
              </select>
              {errors.provinceCode && <p className="text-red-500 text-sm mt-1">{errors.provinceCode}</p>}
            </div>

            {/* สาขา */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                สาขา <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.branchCode}
                onChange={(e) => handleInputChange('branchCode', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                  errors.branchCode ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกสาขา</option>
                {branches.map(b => (
                  <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                ))}
              </select>
              {errors.branchCode && <p className="text-red-500 text-sm mt-1">{errors.branchCode}</p>}
            </div>

            {/* Preview รหัสพนักงาน */}
            {previewEmployeeId && (
              <div className="md:col-span-2">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-orange-700 mb-1"> รหัสพนักงานที่จะได้รับ:</p>
                  <p className="text-2xl font-bold text-orange-900">{previewEmployeeId}</p>
                </div>
              </div>
            )}

            {/* อีเมล */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@company.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* เบอร์โทร */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0812345678"
                maxLength={10}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* เลขบัตรประชาชน */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เลขบัตรประชาชน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => handleInputChange('nationalId', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                  errors.nationalId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234567890123"
                maxLength={13}
              />
              {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4 fill-brand-primary flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                รหัสผ่านเริ่มต้นจะเป็นเลขบัตรประชาชน
              </p>
            </div>

            {/* แผนก */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                แผนก <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกแผนก</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>

            {/* ตำแหน่ง */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ตำแหน่ง <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกตำแหน่ง</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
            </div>

            {/* สิทธิ์การใช้งาน */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                สิทธิ์การใช้งาน
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="user">ผู้ใช้ทั่วไป (User)</option>
                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                <option value="superadmin">ผู้ดูแลระบบสูงสุด (Super Admin)</option>
              </select>
              {(formData.role === 'admin' || formData.role === 'superadmin') && (
                <p className="text-sm text-brand-primary mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
                  จะสร้างบัญชี Admin แยกต่างหาก (ADM{previewEmployeeId})
                </p>
              )}
            </div>

            {/* สถานะ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                สถานะ
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="active">ใช้งาน (Active)</option>
                <option value="inactive">ไม่ใช้งาน (Inactive)</option>
              </select>
            </div>

            {/* วันเกิด */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                วันเกิด
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            {/* อายุ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                อายุ
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="อายุจะคำนวณอัตโนมัติจากวันเกิด"
                readOnly={formData.birthDate ? true : false}
              />
            </div>

            {/* กรุ๊ปเลือด */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                กรุ๊ปเลือด
              </label>
              <select
                value={formData.bloodType}
                onChange={(e) => handleInputChange('bloodType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="">เลือกกรุ๊ปเลือด</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* เงินเดือน */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เงินเดือน
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* วันที่เริ่มงาน */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                วันที่เริ่มงาน
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* ข้อมูลผู้ติดต่อฉุกเฉิน */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ข้อมูลผู้ติดต่อฉุกเฉิน
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ชื่อผู้ติดต่อฉุกเฉิน */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อผู้ติดต่อฉุกเฉิน
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>

              {/* เบอร์โทรผู้ติดต่อฉุกเฉิน */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="0812345678"
                  maxLength={10}
                />
              </div>

              {/* ความสัมพันธ์ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ความสัมพันธ์
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="เช่น บิดา มารดา พี่ น้อง"
                />
              </div>
            </div>
          </div>

          {/* ที่อยู่ */}
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ที่อยู่
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  rows={3}
                  placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                />
              </div>
            </div>
          </div>

          {/* ประวัติการทำงาน */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ประวัติการทำงาน
            </h3>
            
            {/* แสดงรายการประวัติที่เพิ่มแล้ว */}
            {formData.workHistory.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.workHistory.map((work, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{work.position}</div>
                      <div className="text-sm text-gray-600">{work.company}</div>
                      <div className="text-xs text-gray-500">{work.period}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWorkHistory(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ฟอร์มเพิ่มประวัติการทำงาน */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <input
                  type="text"
                  value={currentWorkHistory.position}
                  onChange={(e) => setCurrentWorkHistory({ ...currentWorkHistory, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  placeholder="ตำแหน่ง"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={currentWorkHistory.company}
                  onChange={(e) => setCurrentWorkHistory({ ...currentWorkHistory, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  placeholder="บริษัท/หน่วยงาน"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={currentWorkHistory.period}
                  onChange={(e) => setCurrentWorkHistory({ ...currentWorkHistory, period: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  placeholder="ช่วงเวลา (เช่น 2020-2023)"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addWorkHistory}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  + เพิ่ม
                </button>
              </div>
            </div>
          </div>

          {/* การศึกษา */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              การศึกษา
            </h3>
            
            {/* แสดงรายการการศึกษาที่เพิ่มแล้ว */}
            {formData.education.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.education.map((edu, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1 text-gray-700">{edu}</div>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ฟอร์มเพิ่มการศึกษา */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={currentEducation}
                  onChange={(e) => setCurrentEducation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addEducation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  placeholder="เช่น ปริญญาตรี บริหารธุรกิจ มหาวิทยาลัย..."
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addEducation}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  + เพิ่ม
                </button>
              </div>
            </div>
          </div>

          {/* ทักษะ */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ทักษะ
            </h3>
            
            {/* แสดงรายการทักษะที่เพิ่มแล้ว */}
            {formData.skills.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-orange-500 hover:text-orange-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ฟอร์มเพิ่มทักษะ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  placeholder="เช่น Microsoft Office, การบริหารจัดการ, ภาษาอังกฤษ..."
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addSkill}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  + เพิ่ม
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Buttons */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all font-medium flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-primary via-orange-700 to-orange-600 text-white rounded-xl hover:from-orange-700 hover:via-orange-800 hover:to-orange-700 transition-all shadow-sm hover:shadow-sm transform hover:scale-105 font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            เพิ่มผู้ใช้
          </button>
        </div>
      </div>
    </div>
  );
});

UserCreateModal.displayName = 'UserCreateModal';

export default UserCreateModal;
