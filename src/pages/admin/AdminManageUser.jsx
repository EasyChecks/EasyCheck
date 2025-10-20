import React, { useState, useMemo, useEffect } from 'react';
import AlertDialog from '../../components/common/AlertDialog';
import { useAuth } from '../../contexts/useAuth';
import UserDetailModal from '../../components/admin/UserDetailModal';
import UserEditModal from '../../components/admin/UserEditModal';
import UserTable from '../../components/admin/UserTable';
import UserCreateModal from '../../components/admin/UserCreateModal';
import CsvImportModal from '../../components/admin/CsvImportModal';
import { usersData as importedUsersData } from '../../data/usersData';
import { 
  generateEmployeeId, 
  validateUserData, 
  parseCsvData, 
  processCsvUsers
  // exportToCSV - will be used for export feature later
} from '../../utils/adminUserUtils'; // Import utility functions
import { generateUserPDF } from '../../utils/userPDFGenerator';

function AdminManageUser() {
  const { user: currentUser } = useAuth();
  
  // Initialize users from localStorage if available, otherwise use imported data
  const [users, setUsers] = useState(() => {
    try {
      const storedUsers = localStorage.getItem('usersData');
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
    } catch (e) {
      console.warn('Failed to load users from localStorage:', e);
    }
    return importedUsersData;
  });
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // CSV Import States
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [_csvFile, setCsvFile] = useState(null); // Re-enable for CSV file upload feature
  
  // User Create Modal States
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  // Debounce search term - รอ 300ms หลังจากพิมพ์เสร็จค่อยค้นหา
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Attendance verification states
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedDate, setSelectedDate] = useState(''); // Empty = show all (last 3 days)
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({});

  // Edit User States
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Alert Dialog States
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Filter and search users - ใช้ debouncedSearchTerm แทน searchTerm
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           user.employeeId?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           user.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [users, debouncedSearchTerm, filterStatus]); // ใช้ debouncedSearchTerm แทน searchTerm

  const openDetail = (user) => {
    setSelectedUser(user);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedUser(null);
  };

  // Open edit user modal
  const openEditUser = (user) => {
    // ถ้าไม่ได้ส่ง user มา ให้ใช้ selectedUser (กรณีกดแก้ไขจาก Detail Modal)
    const userToEdit = user || selectedUser;
    
    if (!userToEdit) {
      return;
    }
    
    setEditingUser(userToEdit);
    const formData = {
      name: userToEdit.name || '',
      email: userToEdit.email || '',
      phone: userToEdit.phone || '',
      department: userToEdit.department || '',
      role: userToEdit.role || '',
      birthDate: userToEdit.birthDate || '',
      status: userToEdit.status || '',
      address: userToEdit.address || '',
      position: userToEdit.position || '',
      nationalId: userToEdit.nationalId || '',
      age: userToEdit.age || '',
      employeeId: userToEdit.employeeId || userToEdit.username || '', // แสดงแต่แก้ไม่ได้
      bloodType: userToEdit.bloodType || '',
      salary: userToEdit.salary || '',
      idCardNumber: userToEdit.idCardNumber || '',
      passportNumber: userToEdit.passportNumber || '',
      password: userToEdit.password || '', // แสดงรหัสผ่านได้
      username: userToEdit.username || '',
      profileImage: userToEdit.profileImage || '',
      emergencyContactName: userToEdit.emergencyContact?.name || '',
      emergencyContactPhone: userToEdit.emergencyContact?.phone || '',
      emergencyContactRelation: userToEdit.emergencyContact?.relation || '',
      startDate: userToEdit.startDate || '',
      workPeriod: userToEdit.workPeriod || '',
      // ประวัติการทำงาน, การศึกษา, ทักษะ
      workHistory: userToEdit.workHistory || [],
      education: userToEdit.education || [],
      skills: userToEdit.skills || []
    };
    
    setEditForm(formData);
    setShowEditUser(true);
  };

  // Close edit user modal
  const closeEditUser = () => {
    setShowEditUser(false);
    setEditingUser(null);
    setEditForm({});
  };

  // Save edited user
  const saveEditUser = () => {
    // Validation
    if (!editForm.name || !editForm.email || !editForm.phone) {
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'ข้อมูลไม่ครบ',
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, อีเมล, เบอร์โทร)',
        autoClose: true
      });
      return;
    }

    // Guard: Admin cannot change the role of a SuperAdmin
    if (currentUser?.role === 'admin' && editingUser.role === 'superadmin') {
      const attemptedRole = editForm.role ?? editingUser.role
      if (attemptedRole !== editingUser.role) {
        setAlertDialog({
          isOpen: true,
          type: 'error',
          title: 'ไม่มีสิทธิ์',
          message: 'Admin ไม่สามารถปรับ Role ของ Super Admin ได้',
          autoClose: true
        })
        return
      }
    }

    // Prepare updated user data
    const updatedUserData = {
      ...editForm,
      emergencyContact: {
        name: editForm.emergencyContactName,
        phone: editForm.emergencyContactPhone,
        relation: editForm.emergencyContactRelation
      },
      // เก็บ workHistory, education, skills ถ้ามี
      workHistory: editForm.workHistory && editForm.workHistory.length > 0 ? editForm.workHistory : undefined,
      education: editForm.education && editForm.education.length > 0 ? editForm.education : undefined,
      skills: editForm.skills && editForm.skills.length > 0 ? editForm.skills : undefined
    };

    // Remove temporary fields
    delete updatedUserData.emergencyContactName;
    delete updatedUserData.emergencyContactPhone;
    delete updatedUserData.emergencyContactRelation;

    const updatedUsers = users.map(user => {
      if (user.id !== editingUser.id) return user
      // If editing target is SuperAdmin and current user is admin, freeze role
      if (currentUser?.role === 'admin' && editingUser.role === 'superadmin') {
        const { role: _ignoredRole, ...rest } = updatedUserData
        return { ...user, ...rest, role: user.role }
      }
      return { ...user, ...updatedUserData }
    });

    setUsers(updatedUsers);
    
    // Save updated users to localStorage for persistence across login
    localStorage.setItem('usersData', JSON.stringify(updatedUsers));
    
    // Update selectedUser if it's the one being edited
    if (selectedUser && selectedUser.id === editingUser.id) {
      setSelectedUser({ ...selectedUser, ...updatedUserData });
    }

    // Sync with logged-in user in localStorage if editing current user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.id === editingUser.id) {
        // Update the logged-in user's data in localStorage
        const updatedLoggedInUser = { ...parsedUser, ...updatedUserData };
        localStorage.setItem('user', JSON.stringify(updatedLoggedInUser));
      }
    }

    // Sync password to admin account if user is admin/superadmin and password was changed
    if (editForm.password && editForm.password !== editingUser.password) {
      if (editingUser.role === 'admin' || editingUser.role === 'superadmin') {
        const storedPasswords = JSON.parse(localStorage.getItem('mockUserPasswords') || '{}');
        const adminUsername = `ADM${editingUser.employeeId}`;
        storedPasswords[adminUsername.toLowerCase()] = editForm.password;
        localStorage.setItem('mockUserPasswords', JSON.stringify(storedPasswords));
      }
    }

    setAlertDialog({
      isOpen: true,
      type: 'success',
      title: 'บันทึกสำเร็จ',
      message: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว',
      autoClose: true
    });

    closeEditUser();
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md',
      'leave': 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md',
      'suspended': 'bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-md',
      'pending': 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
    };
    return badges[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const downloadPDF = async () => {
    if (!selectedUser) {
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'ข้อผิดพลาด',
        message: 'ไม่พบข้อมูลผู้ใช้ที่ต้องการดาวน์โหลด',
        autoClose: true
      });
      return;
    }

    try {
      setAlertDialog({
        isOpen: true,
        type: 'info',
        title: 'กำลังสร้าง PDF',
        message: 'กรุณารอสักครู่...',
        autoClose: false
      });

      await generateUserPDF(selectedUser);
      
      setAlertDialog({
        isOpen: true,
        type: 'success',
        title: 'สำเร็จ',
        message: 'ดาวน์โหลด PDF เรียบร้อยแล้ว',
        autoClose: true
      });
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: `ไม่สามารถสร้าง PDF ได้: ${error.message}`,
        autoClose: true
      });
    }
  };

  // Handle create new user
  const handleCreateUser = (newUser) => {
    setUsers([...users, newUser]);
    
    setAlertDialog({
      isOpen: true,
      type: 'success',
      title: 'เพิ่มผู้ใช้สำเร็จ',
      message: `เพิ่ม ${newUser.name} เข้าระบบเรียบร้อยแล้ว\n\nรหัสพนักงาน: ${newUser.employeeId}\nรหัสผ่าน: ${newUser.password}${
        newUser.adminAccount ? `\n\n🔐 Admin Account:\nUsername: ${newUser.adminAccount}\nPassword: ${newUser.adminPassword}` : ''
      }`,
      autoClose: false // ไม่ปิดอัตโนมัติเพื่อให้ admin อ่านรหัส
    });
  };

  // CSV Import Functions
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'ไฟล์ไม่ถูกต้อง',
        message: 'กรุณาเลือกไฟล์ .csv เท่านั้น'
      });
      // Reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้
      e.target.value = '';
      return;
    }

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      handleParseCsvData(text);
      // Reset input หลังอ่านไฟล์เสร็จ เพื่อให้เลือกไฟล์เดิมซ้ำได้
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleParseCsvData = (csvText) => {
    try {
      const data = parseCsvData(csvText);
      
      if (data.length === 0) {
        setAlertDialog({
          isOpen: true,
          type: 'error',
          title: 'ไฟล์ว่างเปล่า',
          message: 'ไม่พบข้อมูลในไฟล์ CSV'
        });
        return;
      }

      // Validate headers
      const requiredHeaders = ['name', 'email', 'provinceCode', 'branchCode', 'role', 'department', 'position', 'nationalId'];
      const firstRow = data[0];
      const missingHeaders = requiredHeaders.filter(h => !(h in firstRow));
      
      if (missingHeaders.length > 0) {
        setAlertDialog({
          isOpen: true,
          type: 'error',
          title: 'รูปแบบไฟล์ไม่ถูกต้อง',
          message: `ไม่พบคอลัมน์: ${missingHeaders.join(', ')}\n\nคอลัมน์ที่ต้องมี: ${requiredHeaders.join(', ')}`
        });
        return;
      }

      setCsvData(data);
      setShowCsvModal(true);
    } catch {
      // Error handling
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถอ่านไฟล์ CSV ได้ กรุณาตรวจสอบรูปแบบไฟล์'
      });
    }
  };

  const confirmCsvImport = () => {
    // Process CSV data using utility function
    const processedUsers = processCsvUsers(csvData, users);

    // Validate ข้อมูลก่อนนำเข้า
    const validationErrors = validateUserData(processedUsers, users);
    
    if (validationErrors.length > 0) {
      // แยก error เป็นประเภท
      const uniqueErrors = [...new Set(validationErrors)]; // Remove duplicates
      const errorCount = uniqueErrors.length;
      const errorMessage = uniqueErrors.slice(0, 10).join('\n'); // แสดงแค่ 10 รายการแรก
      const moreErrors = errorCount > 10 ? `\n... และอีก ${errorCount - 10} รายการ` : '';
      
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: `พบข้อมูลซ้ำ (${errorCount} รายการ)`,
        message: `${errorMessage}${moreErrors}\n\n💡 คำแนะนำ:\n- ตรวจสอบเลขบัตรประชาชนซ้ำกับข้อมูลเดิม\n- ลบข้อมูลเก่าออกก่อนนำเข้าใหม่\n- หรือแก้ไขข้อมูลใน CSV ให้ไม่ซ้ำ`
      });
      return;
    }

    setUsers([...users, ...processedUsers]);
    setShowCsvModal(false);
    setCsvData([]);
    setCsvFile(null);

    setAlertDialog({
      isOpen: true,
      type: 'success',
      title: 'นำเข้าสำเร็จ',
      message: `นำเข้าข้อมูลพนักงาน ${processedUsers.length} บัญชี เรียบร้อยแล้ว`,
      autoClose: true
    });
  };

  const closeCsvModal = () => {
    setShowCsvModal(false);
    setCsvData([]);
    setCsvFile(null);
  };

  // Convert date input (yyyy-mm-dd) to Thai format for comparison
  const convertInputDateToThai = (inputDate) => {
    if (!inputDate) return '';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const [year, month, day] = inputDate.split('-');
    const buddhistYear = parseInt(year) + 543;
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${buddhistYear}`;
  };

  const handleAttendanceEdit = (record, type) => {
    setEditingAttendance({ record, type });
    setAttendanceForm(type === 'checkIn' ? record.checkIn : record.checkOut);
  };

  const saveAttendanceEdit = () => {
    // Update attendance record
    setAlertDialog({
      isOpen: true,
      type: 'success',
      title: 'บันทึกสำเร็จ!',
      message: 'บันทึกการแก้ไขข้อมูลการเข้า-ออกงานเรียบร้อยแล้ว',
      autoClose: true
    });
    setEditingAttendance(null);
  };

  const closeAlertDialog = () => {
    setAlertDialog({ ...alertDialog, isOpen: false });
  };

  // Filter attendance records by selected date
  const getFilteredAttendanceRecords = () => {
    if (!selectedUser || !selectedUser.attendanceRecords) return [];
    
    if (selectedDate) {
      // Convert input date to Thai format for comparison
      const thaiDate = convertInputDateToThai(selectedDate);
      // If date selected, show only that date
      return selectedUser.attendanceRecords.filter(record => record.date === thaiDate);
    } else {
      // If no date selected, show last 3 records
      return selectedUser.attendanceRecords.slice(0, 3);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-[#0E315D] bg-clip-text text-transparent flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0E315D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              จัดการผู้ใช้
            </h1>
            <p className="text-gray-500 text-sm mt-1">จัดการสิทธิ์การใช้งานและข้อมูลผู้ใช้ในระบบ</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              นำเข้าไฟล์ csv
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleCsvFileChange}
                className="hidden"
              />
            </label>
            <button 
              onClick={() => setShowCreateUser(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              เพิ่มผู้ใช้งาน
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#0E315D] focus:outline-none transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#0E315D] focus:outline-none transition-colors bg-white"
          >
            <option value="all">ทั้งหมด</option>
            <option value="active">Active</option>
            <option value="leave">Leave</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* User Table Component */}
        <UserTable 
          users={filteredUsers}
          onSelectUser={openDetail}
          getStatusBadge={getStatusBadge}
        />

        {/* Footer legend */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            คำอธิบายสถานะ
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"></span>
              <span className="text-emerald-600 font-semibold">Active</span>
              <span className="text-gray-500">: ยังคงทำงานอยู่</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-rose-500"></span>
              <span className="text-red-600 font-semibold">leave</span>
              <span className="text-gray-500">: ลาออกแล้ว</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-slate-500"></span>
              <span className="text-gray-700 font-semibold">Suspended</span>
              <span className="text-gray-500">: โดนพักงาน</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"></span>
              <span className="text-amber-700 font-semibold">Pending</span>
              <span className="text-gray-500">: รอโปรโมท</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal Component */}
      <UserDetailModal
        user={selectedUser}
        showDetail={showDetail}
        showAttendance={showAttendance}
        selectedDate={selectedDate}
        onClose={closeDetail}
        onEdit={openEditUser}
        onDownloadPDF={downloadPDF}
        onToggleAttendance={() => setShowAttendance(!showAttendance)}
        getStatusBadge={getStatusBadge}
        getFilteredAttendanceRecords={getFilteredAttendanceRecords}
        editingAttendance={editingAttendance}
        attendanceForm={attendanceForm}
        onSetSelectedDate={setSelectedDate}
        onAttendanceEdit={handleAttendanceEdit}
        onSaveAttendanceEdit={saveAttendanceEdit}
        onAttendanceFormChange={setAttendanceForm}
      />

      {/* User Edit Modal Component */}
      <UserEditModal
        show={showEditUser}
        editingUser={editingUser}
        editForm={editForm}
        currentUser={currentUser}
        onClose={closeEditUser}
        onSave={saveEditUser}
        onChange={setEditForm}
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={closeAlertDialog}
        type={alertDialog.type}
        title={alertDialog.title}
        message={alertDialog.message}
        autoClose={alertDialog.autoClose}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={showCsvModal}
        csvData={csvData}
        generateEmployeeId={(provinceCode, branchCode) => generateEmployeeId(provinceCode, branchCode, users)}
        onConfirm={confirmCsvImport}
        onClose={closeCsvModal}
      />

      {/* User Create Modal */}
      <UserCreateModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSubmit={handleCreateUser}
        generateEmployeeId={(provinceCode, branchCode) => generateEmployeeId(provinceCode, branchCode, users)}
        users={users}
      />
    </div>
  );
}

export default AdminManageUser;

