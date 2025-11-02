import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import AlertDialog from '../../components/common/AlertDialog';
import { useAuth } from '../../contexts/useAuth';
import UserTable from '../../components/admin/UserTable';
import { usersData as importedUsersData } from '../../data/usersData';
import { 
  generateEmployeeId, 
  validateUserData, 
  parseCsvData, 
  processCsvUsers
} from '../../utils/adminUserUtils';
import { generateUserPDF } from '../../utils/userPDFGenerator';

// Lazy load heavy components เพื่อลดเวลา initial load
const UserDetailModal = lazy(() => import('../../components/admin/UserDetailModal'));
const UserEditModal = lazy(() => import('../../components/admin/UserEditModal'));
const UserCreateModal = lazy(() => import('../../components/admin/UserCreateModal'));
const CsvImportModal = lazy(() => import('../../components/admin/CsvImportModal'));

function AdminManageUser() {
  const { user: currentUser } = useAuth();
  
  // เริ่มต้นข้อมูลผู้ใช้จาก localStorage หรือข้อมูล default
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
  // ✅ ข้อ 3: ฟังการเปลี่ยนแปลง usersData จาก tab อื่น (User/Manager แก้ไข → Admin เห็น)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'usersData' && e.newValue) {
        try {
          const updatedUsers = JSON.parse(e.newValue);
          setUsers(updatedUsers);
          
          // ถ้ากำลังเปิด detail modal อยู่ ให้อัปเดต selectedUser ด้วย
          if (selectedUser) {
            const updatedSelectedUser = updatedUsers.find(u => u.id === selectedUser.id);
            if (updatedSelectedUser) {
              setSelectedUser(updatedSelectedUser);
            }
          }
        } catch (e) {
          console.warn('Failed to parse updated users:', e);
        }
      }
    };

    const handleAttendanceUpdate = (event) => {
      // ✅ ฟังการอัพเดต attendance แบบ real-time
      if (event.detail && event.detail.userId) {
        try {
          const storedUsers = localStorage.getItem('usersData');
          if (storedUsers) {
            const updatedUsers = JSON.parse(storedUsers);
            setUsers(updatedUsers);
            
            // อัพเดต selectedUser ถ้าเปิดอยู่
            if (selectedUser && selectedUser.id === event.detail.userId) {
              const updatedSelectedUser = updatedUsers.find(u => u.id === event.detail.userId);
              if (updatedSelectedUser) {
                setSelectedUser(updatedSelectedUser);
              }
            }
          }
        } catch (e) {
          console.warn('Failed to update users from attendance event:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('attendanceUpdated', handleAttendanceUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate);
    };
  }, [selectedUser]);
  

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
    
    // Update selectedUser if it's the one being edited - find the updated user from updatedUsers
    if (selectedUser && selectedUser.id === editingUser.id) {
      const updatedUser = updatedUsers.find(u => u.id === editingUser.id);
      setSelectedUser(updatedUser);
    }

    // Sync with logged-in user in localStorage if editing current user
    const tabId = window.name // ใช้ window.name แทน sessionStorage
    if (tabId) {
      const storedUser = localStorage.getItem(`user_${tabId}`)
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id === editingUser.id) {
          // Update the logged-in user's data in localStorage
          const updatedLoggedInUser = { ...parsedUser, ...updatedUserData };
          localStorage.setItem(`user_${tabId}`, JSON.stringify(updatedLoggedInUser));
        }
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

  // Delete user function
  const handleDeleteUser = (userToDelete) => {
    // Prevent deleting superadmin if current user is admin
    if (currentUser?.role === 'admin' && userToDelete.role === 'superadmin') {
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'ไม่มีสิทธิ์',
        message: 'Admin ไม่สามารถลบ Super Admin ได้',
        autoClose: true
      });
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      `คุณแน่ใจหรือไม่ที่จะลบ "${userToDelete.name}"?\n\n` +
      `การดำเนินการนี้จะลบข้อมูลต่อไปนี้:\n` +
      `• ข้อมูลพนักงาน\n` +
      `• บัญชีผู้ใช้งาน (${userToDelete.username})\n` +
      (userToDelete.adminAccount ? `• บัญชี Admin (${userToDelete.adminAccount})\n` : '') +
      `• ประวัติการเข้างาน\n` +
      `• ข้อมูลการลา\n\n` +
      `⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้!`
    );

    if (!confirmDelete) return;

    try {
      // 1. Remove from users array
      const updatedUsers = users.filter(u => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      
      // 2. Update localStorage - usersData
      localStorage.setItem('usersData', JSON.stringify(updatedUsers));
      
      // 3. Remove from logged-in user if it's the same user (localStorage + tabId)
      const tabId = window.name // ใช้ window.name แทน sessionStorage
      if (tabId) {
        const storedUser = localStorage.getItem(`user_${tabId}`)
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.id === userToDelete.id) {
            localStorage.removeItem(`user_${tabId}`);
          }
        }
      }

      // 4. Remove admin password if user is admin/superadmin
      if (userToDelete.role === 'admin' || userToDelete.role === 'superadmin') {
        const storedPasswords = JSON.parse(localStorage.getItem('mockUserPasswords') || '{}');
        const adminUsername = userToDelete.adminAccount;
        if (adminUsername && storedPasswords[adminUsername.toLowerCase()]) {
          delete storedPasswords[adminUsername.toLowerCase()];
          localStorage.setItem('mockUserPasswords', JSON.stringify(storedPasswords));
        }
      }

      // 5. Remove attendance records (if stored separately)
      const attendanceKey = `attendanceRecords_${userToDelete.username}`;
      localStorage.removeItem(attendanceKey);

      // 6. Remove leave records (if stored separately)
      const leaveKey = `leaveRecords_${userToDelete.username}`;
      localStorage.removeItem(leaveKey);

      // Close detail modal if it's open
      if (selectedUser && selectedUser.id === userToDelete.id) {
        closeDetail();
      }

      // Show success message
      setAlertDialog({
        isOpen: true,
        type: 'success',
        title: 'ลบสำเร็จ',
        message: `ลบ ${userToDelete.name} และข้อมูลที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว`,
        autoClose: true
      });

    } catch (error) {
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: `ไม่สามารถลบผู้ใช้ได้: ${error.message}`,
        autoClose: true
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'bg-green-500 text-white shadow-sm',
      'leave': 'bg-red-500 text-white shadow-sm',
      'suspended': 'bg-gray-500 text-white shadow-sm',
      'pending': 'bg-amber-500 text-white shadow-sm'
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
    // 1. เพิ่มเข้า state
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // 2. บันทึกลง localStorage เพื่อให้ user ใหม่สามารถ login ได้ทันที
    localStorage.setItem('usersData', JSON.stringify(updatedUsers));
    
    // 3. บันทึกรหัสผ่าน user account ลง localStorage
    const storedPasswords = JSON.parse(localStorage.getItem('mockUserPasswords') || '{}');
    
    // บันทึกรหัสผ่านสำหรับ user account (username/employeeId)
    if (newUser.username) {
      storedPasswords[newUser.username.toLowerCase()] = newUser.password;
    }
    if (newUser.employeeId) {
      storedPasswords[newUser.employeeId.toLowerCase()] = newUser.password;
    }
    
    // 4. ถ้าเป็น admin/superadmin ให้บันทึกรหัสผ่าน admin account ด้วย
    if ((newUser.role === 'admin' || newUser.role === 'superadmin') && newUser.adminAccount) {
      storedPasswords[newUser.adminAccount.toLowerCase()] = newUser.adminPassword || newUser.password;
    }
    
    // 5. บันทึก passwords ทั้งหมดลง localStorage
    localStorage.setItem('mockUserPasswords', JSON.stringify(storedPasswords));
    
    setAlertDialog({
      isOpen: true,
      type: 'success',
      title: 'เพิ่มผู้ใช้สำเร็จ',
      message: `เพิ่ม ${newUser.name} เข้าระบบเรียบร้อยแล้ว\n\n✅ สามารถ Login ได้ทันที!\n\nรหัสพนักงาน: ${newUser.employeeId}\nรหัสผ่าน: ${newUser.password}${
        newUser.adminAccount ? `\n\n� Admin Account:\nUsername: ${newUser.adminAccount}\nPassword: ${newUser.adminPassword}` : ''
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
        message: `${errorMessage}${moreErrors}\n\nℹ️ คำแนะนำ:\n- ตรวจสอบเลขบัตรประชาชนซ้ำกับข้อมูลเดิม\n- ลบข้อมูลเก่าออกก่อนนำเข้าใหม่\n- หรือแก้ไขข้อมูลใน CSV ให้ไม่ซ้ำ`
      });
      return;
    }

    // 1. เพิ่ม users เข้า state
    const updatedUsers = [...users, ...processedUsers];
    setUsers(updatedUsers);
    
    // 2. บันทึกลง localStorage เพื่อให้ user ที่ import มาสามารถ login ได้
    localStorage.setItem('usersData', JSON.stringify(updatedUsers));
    
    // 3. บันทึกรหัสผ่านของทุกคนที่ import มา
    const storedPasswords = JSON.parse(localStorage.getItem('mockUserPasswords') || '{}');
    processedUsers.forEach(user => {
      // บันทึกรหัสผ่าน user account
      if (user.username) {
        storedPasswords[user.username.toLowerCase()] = user.password;
      }
      if (user.employeeId) {
        storedPasswords[user.employeeId.toLowerCase()] = user.password;
      }
      
      // ถ้าเป็น admin/superadmin ให้บันทึกรหัสผ่าน admin account ด้วย
      if ((user.role === 'admin' || user.role === 'superadmin') && user.adminAccount) {
        storedPasswords[user.adminAccount.toLowerCase()] = user.adminPassword || user.password;
      }
    });
    localStorage.setItem('mockUserPasswords', JSON.stringify(storedPasswords));
    
    setShowCsvModal(false);
    setCsvData([]);
    setCsvFile(null);

    setAlertDialog({
      isOpen: true,
      type: 'success',
      title: 'นำเข้าสำเร็จ',
      message: `นำเข้าข้อมูลพนักงาน ${processedUsers.length} บัญชี เรียบร้อยแล้ว\n\n✅ ทุกคนสามารถ Login ได้ทันที!`,
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
    <div className="min-h-screen p-4 sm:p-6 bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-orange-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--gray-900, #111827)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              จัดการผู้ใช้
            </h1>
            <p className="text-gray-500 text-sm mt-1">จัดการสิทธิ์การใช้งานและข้อมูลผู้ใช้ในระบบ</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-sm hover:shadow-sm transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold cursor-pointer">
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
              className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-sm hover:shadow-sm transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold"
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
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[var(--gray-900, #111827)] focus:outline-none transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[var(--gray-900, #111827)] focus:outline-none transition-colors bg-white"
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
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            คำอธิบายสถานะ
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-green-600 font-semibold">Active</span>
              <span className="text-gray-500">: ยังคงทำงานอยู่</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-red-600 font-semibold">leave</span>
              <span className="text-gray-500">: ลาออกแล้ว</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span className="text-gray-700 font-semibold">Suspended</span>
              <span className="text-gray-500">: โดนพักงาน</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-amber-700 font-semibold">Pending</span>
              <span className="text-gray-500">: รอโปรโมท</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lazy-loaded Modals พร้อม Suspense fallback */}
      <Suspense fallback={<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>}>
        {/* User Detail Modal Component */}
        {showDetail && selectedUser && (
          <UserDetailModal
            user={selectedUser}
            showDetail={showDetail}
            showAttendance={showAttendance}
            selectedDate={selectedDate}
            currentUser={currentUser}
            onClose={closeDetail}
            onEdit={openEditUser}
            onDownloadPDF={downloadPDF}
            onDelete={handleDeleteUser}
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
        )}

        {/* User Edit Modal Component */}
        {showEditUser && editingUser && (
          <UserEditModal
            show={showEditUser}
            editingUser={editingUser}
            editForm={editForm}
            currentUser={currentUser}
            onClose={closeEditUser}
            onSave={saveEditUser}
            onChange={setEditForm}
          />
        )}

        {/* CSV Import Modal */}
        {showCsvModal && (
          <CsvImportModal
            isOpen={showCsvModal}
            csvData={csvData}
            generateEmployeeId={(provinceCode, branchCode) => generateEmployeeId(provinceCode, branchCode, users)}
            onConfirm={confirmCsvImport}
            onClose={closeCsvModal}
          />
        )}

        {/* User Create Modal */}
        {showCreateUser && (
          <UserCreateModal
            isOpen={showCreateUser}
            onClose={() => setShowCreateUser(false)}
            onSubmit={handleCreateUser}
            generateEmployeeId={(provinceCode, branchCode) => generateEmployeeId(provinceCode, branchCode, users)}
            users={users}
          />
        )}
      </Suspense>

      {/* Alert Dialog - ไม่ต้อง lazy load เพราะเบา */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={closeAlertDialog}
        type={alertDialog.type}
        title={alertDialog.title}
        message={alertDialog.message}
        autoClose={alertDialog.autoClose}
      />
    </div>
  );
}

export default AdminManageUser;