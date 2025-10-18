import React, { useState, useMemo } from 'react';
import AlertDialog from '../../components/common/AlertDialog';

const sampleUsers = [
  { 
    id: 1, 
    name: 'นายอภิชาติ รัตนา', 
    email: 'apichart@ggs.co.th', 
    role: 'หัวหน้าทีม', 
    status: 'Active', 
    phone: '081-234-5678', 
    department: 'ฝ่ายพัฒนา',
    birthDate: '8 ตุลาคม 2568',
    time: '06:32',
    position: 'เข้าทำงานตรงเวลา',
    workHistory: [
      { period: '2018 - ปัจจุบัน', position: 'หัวหน้าทีมพัฒนาซอฟต์แวร์ (Senior Software Engineer)', company: 'บริษัท GGS จำกัด' },
      { period: '2016 - 2018', position: 'นักพัฒนาซอฟต์แวร์อาวุโส (Senior Software Developer)', company: 'บริษัท ABC Tech จำกัด' },
      { period: '2014 - 2016', position: 'นักพัฒนาซอฟต์แวร์ (Software Developer)', company: 'บริษัท XYZ Solutions จำกัด' }
    ],
    education: [
      'ปริญญาโท วิทยาศาสตรมหาบัณฑิต (M.Sc. in Computer Science)',
      'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
      'สาขา วิทยาการคอมพิวเตอร์',
      'เกรดเฉลี่ย 3.75'
    ],
    certifications: [
      'AWS Certified Solutions Architect',
      'Google Cloud Professional Developer',
      'Certified Scrum Master (CSM)'
    ],
    skills: ['React', 'Node.js', 'Python', 'Docker', 'AWS'],
    address: '123/45 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    timeSummary: {
      totalWorkDays: 245,
      onTime: 220,
      late: 15,
      absent: 5,
      leave: 5,
      totalHours: '1,960 ชม.',
      avgCheckIn: '07:45',
      avgCheckOut: '17:30'
    },
    activities: [
      { date: '17 ต.ค. 2568', time: '14:30', action: 'แก้ไขข้อมูลโปรไฟล์', icon: 'edit' },
      { date: '16 ต.ค. 2568', time: '08:15', action: 'ลงเวลาเข้างาน', icon: 'clock' },
      { date: '15 ต.ค. 2568', time: '09:00', action: 'ส่งคำขออนุมัติลา', icon: 'calendar' },
      { date: '14 ต.ค. 2568', time: '17:45', action: 'ลงเวลาออกงาน', icon: 'logout' }
    ],
    attendanceRecords: [
      {
        date: '17 ต.ค. 2568',
        checkIn: { time: '07:32', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1a', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' },
        checkOut: { time: '17:45', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1b', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' }
      },
      {
        date: '16 ต.ค. 2568',
        checkIn: { time: '07:45', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1c', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' },
        checkOut: { time: '17:30', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1d', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' }
      },
      {
        date: '15 ต.ค. 2568',
        checkIn: { time: '08:15', status: 'มาสาย', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1e', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' },
        checkOut: { time: '17:50', status: 'ตรงเวลา', location: 'อยู่ในพื้นที่', photo: 'https://i.pravatar.cc/200?u=1f', gps: '13.7563,100.5018', address: 'บริษัท GGS จำกัด' }
      }
    ]
  },
  { 
    id: 2, 
    name: 'นางพรทิพย์ ภักดี', 
    email: 'porntip@ggs.co.th', 
    role: 'พนักงาน', 
    status: 'leave', 
    phone: '082-345-6789', 
    department: 'ฝ่ายการตลาด',
    birthDate: '15 มีนาคม 2565',
    time: '07:03',
    position: 'เข้าทำงานสาย',
    workHistory: [
      { period: '2019 - 2024', position: 'นักการตลาดดิจิทัล (Digital Marketing Specialist)', company: 'บริษัท GGS จำกัด' }
    ],
    education: [
      'ปริญญาตรี บริหารธุรกิจบัณฑิต (B.B.A)',
      'มหาวิทยาลัยธรรมศาสตร์',
      'สาขา การตลาด',
      'เกรดเฉลี่ย 3.42'
    ],
    certifications: ['Google Ads Certified', 'Facebook Blueprint Certified'],
    skills: ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media'],
    address: '456/78 ถ.สุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110'
  },
  { 
    id: 3, 
    name: 'นายนันทกร ทูนแก้ว', 
    email: 'nantakorn@ggs.co.th', 
    role: 'พนักงาน', 
    status: 'Suspended', 
    phone: '083-456-7890', 
    department: 'ฝ่ายบุคคล',
    birthDate: '22 พฤษภาคม 2566',
    time: '08:15',
    position: 'เข้าทำงานสาย',
    workHistory: [
      { period: '2020 - ปัจจุบัน', position: 'เจ้าหน้าที่ทรัพยากรบุคคล (HR Officer)', company: 'บริษัท GGS จำกัด' }
    ],
    education: [
      'ปริญญาตรี รัฐศาสตรบัณฑิต',
      'มหาวิทยาลัยรามคำแหง',
      'สาขา การบริหารทรัพยากรมนุษย์',
      'เกรดเฉลี่ย 3.15'
    ],
    certifications: ['SHRM-CP Certified'],
    skills: ['Recruitment', 'Employee Relations', 'HR Management'],
    address: '789/12 ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400'
  },
  { 
    id: 4, 
    name: 'นายเทวราช วงค์ษาจันทร์', 
    email: 'tavarach@ggs.co.th', 
    role: 'พนักงาน', 
    status: 'Pending', 
    phone: '084-567-8901', 
    department: 'ฝ่ายการเงิน',
    birthDate: '10 กันยายน 2567',
    time: '06:45',
    position: 'เข้าทำงานตรงเวลา',
    workHistory: [
      { period: '2021 - ปัจจุบัน', position: 'นักบัญชี (Accountant)', company: 'บริษัท GGS จำกัด' }
    ],
    education: [
      'ปริญญาตรี บัญชีบัณฑิต (B.Acc.)',
      'มหาวิทยาลัยหอการค้าไทย',
      'สาขา การบัญชี',
      'เกรดเฉลี่ย 3.58'
    ],
    certifications: ['CPA Thailand'],
    skills: ['Accounting', 'Financial Reporting', 'Tax Planning'],
    address: '321/65 ถ.วิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900'
  }
];

function AdminManageUser() {
  const [users, setUsers] = useState(sampleUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
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

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filterStatus]);

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
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      role: user.role,
      birthDate: user.birthDate,
      status: user.status,
      address: user.address || ''
    });
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

    const updatedUsers = users.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...editForm }
        : user
    );

    setUsers(updatedUsers);
    
    // Update selectedUser if it's the one being edited
    if (selectedUser && selectedUser.id === editingUser.id) {
      setSelectedUser({ ...selectedUser, ...editForm });
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
      'Active': 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md',
      'leave': 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md',
      'Suspended': 'bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-md',
      'Pending': 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const downloadPDF = () => {
    setAlertDialog({
      isOpen: true,
      type: 'info',
      title: 'กำลังดาวน์โหลด PDF',
      message: 'กำลังดาวน์โหลดข้อมูลเป็น PDF...\n(ฟีเจอร์นี้ต้องใช้ library เช่น jsPDF หรือ react-pdf)',
      autoClose: true
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateStr) => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${parseInt(year) + 543}`;
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              จัดการผู้ใช้
            </h1>
            <p className="text-gray-500 text-sm mt-1">จัดการสิทธิ์การใช้งานและข้อมูลผู้ใช้ในระบบ</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              นำเข้าไฟล์ csv
            </button>
            <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold">
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
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors bg-white"
          >
            <option value="all">ทั้งหมด</option>
            <option value="Active">Active</option>
            <option value="leave">Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                <th className="p-4 text-left font-semibold">ชื่อ-นามสกุล</th>
                <th className="p-4 text-left font-semibold">อีเมล</th>
                <th className="p-4 text-left font-semibold">สิทธิ์</th>
                <th className="p-4 text-left font-semibold">สถานะ</th>
                <th className="p-4 text-center font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user.name.charAt(3)}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => openDetail(user)} 
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm font-medium"
                    >
                      ตรวจสอบข้อมูล
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Detail Panel */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden transform animate-slideUp max-h-[90vh] flex flex-col">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">ข้อมูลผู้ใช้</h2>
                    <p className="text-white/80 text-sm">ตรวจสอบข้อมูลผู้ใช้งานและประวัติการเข้า-ออกงาน</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditUser(selectedUser)} 
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
                    title="แก้ไขข้อมูลผู้ใช้"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไขข้อมูล
                  </button>
                  <button 
                    onClick={downloadPDF} 
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
                    title="ดาวน์โหลดข้อมูลเป็น PDF"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                  </button>
                  <button 
                    onClick={() => setShowAttendance(!showAttendance)} 
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showAttendance ? 'ซ่อน' : 'เช็คอิน/เอาต์'}
                  </button>
                  <button 
                    onClick={closeDetail} 
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Attendance Verification Section - Collapsible */}
              {showAttendance && selectedUser.attendanceRecords && (
                <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ตรวจสอบการเข้า-ออกงาน
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input 
                          type="date" 
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-3 py-2 pr-8 border-2 border-purple-300 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                          placeholder="กรองตามวันที่"
                        />
                        {selectedDate && (
                          <button
                            onClick={() => setSelectedDate('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title="ยกเลิกการเลือก (แสดง 3 วันล่าสุด)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        {selectedDate ? '1 วัน' : '3 วันล่าสุด'}
                      </div>
                    </div>
                  </div>

                  {getFilteredAttendanceRecords().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      ไม่พบข้อมูลการเข้า-ออกงานในวันที่เลือก
                    </div>
                  ) : (
                    getFilteredAttendanceRecords().map((record, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-md border border-purple-100">
                      <div className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {record.date}
                      </div>
                      
                      {/* Check-in & Check-out Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Check In */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-green-700 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                              </svg>
                              เข้างาน
                            </h4>
                            {editingAttendance?.record === record && editingAttendance?.type === 'checkIn' ? (
                              <button onClick={saveAttendanceEdit} className="text-xs px-2 py-1 bg-green-500 text-white rounded">บันทึก</button>
                            ) : (
                              <button onClick={() => handleAttendanceEdit(record, 'checkIn')} className="text-xs px-2 py-1 bg-white border border-green-300 rounded hover:bg-green-100">แก้ไข</button>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <img src={record.checkIn.photo} alt="check-in" className="w-16 h-16 rounded-lg object-cover border-2 border-green-300" />
                              <div className="flex-1">
                                <div className="text-xs text-gray-500">เวลา</div>
                                {editingAttendance?.record === record && editingAttendance?.type === 'checkIn' ? (
                                  <input type="time" value={attendanceForm.time} onChange={(e) => setAttendanceForm({...attendanceForm, time: e.target.value})} className="text-base font-bold border rounded px-2 py-1 w-full" />
                                ) : (
                                  <div className="text-base font-bold text-gray-800">{record.checkIn.time}</div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-gray-500">สถานะ</div>
                              {editingAttendance?.record === record && editingAttendance?.type === 'checkIn' ? (
                                <select value={attendanceForm.status} onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})} className="text-sm border rounded px-2 py-1 w-full">
                                  <option value="ตรงเวลา">ตรงเวลา</option>
                                  <option value="มาสาย">มาสาย</option>
                                  <option value="ขาด">ขาด</option>
                                  <option value="ลา">ลา</option>
                                </select>
                              ) : (
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.checkIn.status === 'ตรงเวลา' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {record.checkIn.status}
                                </span>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-xs text-gray-500">ตำแหน่ง</div>
                              {editingAttendance?.record === record && editingAttendance?.type === 'checkIn' ? (
                                <select value={attendanceForm.location} onChange={(e) => setAttendanceForm({...attendanceForm, location: e.target.value})} className="text-sm border rounded px-2 py-1 w-full">
                                  <option value="อยู่ในพื้นที่">อยู่ในพื้นที่</option>
                                  <option value="อยู่นอกพื้นที่">อยู่นอกพื้นที่</option>
                                </select>
                              ) : (
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.checkIn.location === 'อยู่ในพื้นที่' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {record.checkIn.location}
                                </span>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-xs text-gray-500">GPS</div>
                              <a href={`https://maps.google.com/?q=${record.checkIn.gps}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{record.checkIn.gps}</a>
                            </div>
                          </div>
                        </div>

                        {/* Check Out */}
                        {record.checkOut && (
                          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-red-700 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                ออกงาน
                              </h4>
                              {editingAttendance?.record === record && editingAttendance?.type === 'checkOut' ? (
                                <button onClick={saveAttendanceEdit} className="text-xs px-2 py-1 bg-red-500 text-white rounded">บันทึก</button>
                              ) : (
                                <button onClick={() => handleAttendanceEdit(record, 'checkOut')} className="text-xs px-2 py-1 bg-white border border-red-300 rounded hover:bg-red-100">แก้ไข</button>
                              )}
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <img src={record.checkOut.photo} alt="check-out" className="w-16 h-16 rounded-lg object-cover border-2 border-red-300" />
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500">เวลา</div>
                                  {editingAttendance?.record === record && editingAttendance?.type === 'checkOut' ? (
                                    <input type="time" value={attendanceForm.time} onChange={(e) => setAttendanceForm({...attendanceForm, time: e.target.value})} className="text-base font-bold border rounded px-2 py-1 w-full" />
                                  ) : (
                                    <div className="text-base font-bold text-gray-800">{record.checkOut.time}</div>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-500">สถานะ</div>
                                {editingAttendance?.record === record && editingAttendance?.type === 'checkOut' ? (
                                  <select value={attendanceForm.status} onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})} className="text-sm border rounded px-2 py-1 w-full">
                                    <option value="ตรงเวลา">ตรงเวลา</option>
                                    <option value="มาสาย">มาสาย</option>
                                    <option value="ขาด">ขาด</option>
                                    <option value="ลา">ลา</option>
                                  </select>
                                ) : (
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.checkOut.status === 'ตรงเวลา' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {record.checkOut.status}
                                  </span>
                                )}
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-500">ตำแหน่ง</div>
                                {editingAttendance?.record === record && editingAttendance?.type === 'checkOut' ? (
                                  <select value={attendanceForm.location} onChange={(e) => setAttendanceForm({...attendanceForm, location: e.target.value})} className="text-sm border rounded px-2 py-1 w-full">
                                    <option value="อยู่ในพื้นที่">อยู่ในพื้นที่</option>
                                    <option value="อยู่นอกพื้นที่">อยู่นอกพื้นที่</option>
                                  </select>
                                ) : (
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.checkOut.location === 'อยู่ในพื้นที่' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {record.checkOut.location}
                                  </span>
                                )}
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-500">GPS</div>
                                <a href={`https://maps.google.com/?q=${record.checkOut.gps}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{record.checkOut.gps}</a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    ))
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Profile Summary */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Profile Card */}
                  <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border-2 border-sky-100 shadow-sm">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white">
                          <img src={`https://i.pravatar.cc/300?u=${selectedUser.id}`} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center w-full">
                        <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
                        <div className="mt-3">
                          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(selectedUser.status)}`}>
                            {selectedUser.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Summary Card */}
                  {selectedUser.timeSummary && (
                    <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        สรุปเวลาทำงาน
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">วันทำงานทั้งหมด</span>
                          <span className="font-semibold text-gray-800">{selectedUser.timeSummary.totalWorkDays} วัน</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">เข้าตรงเวลา</span>
                          <span className="font-semibold text-green-600">{selectedUser.timeSummary.onTime} วัน</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">มาสาย</span>
                          <span className="font-semibold text-orange-600">{selectedUser.timeSummary.late} วัน</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ขาดงาน</span>
                          <span className="font-semibold text-red-600">{selectedUser.timeSummary.absent} วัน</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ลา</span>
                          <span className="font-semibold text-blue-600">{selectedUser.timeSummary.leave} วัน</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="text-gray-600">ชั่วโมงรวม</span>
                          <span className="font-bold text-gray-800">{selectedUser.timeSummary.totalHours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">เฉลี่ยเข้างาน</span>
                          <span className="font-semibold text-gray-800">{selectedUser.timeSummary.avgCheckIn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">เฉลี่ยออกงาน</span>
                          <span className="font-semibold text-gray-800">{selectedUser.timeSummary.avgCheckOut}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Info Card */}
                  <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm space-y-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ข้อมูลพื้นฐาน
                    </h4>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-500 text-xs">วันเกิด</div>
                          <div className="text-gray-800 font-medium">{selectedUser.birthDate || 'ไม่ระบุ'}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-500 text-xs">เวลา</div>
                          <div className="text-gray-800 font-medium">{selectedUser.time || 'ไม่ระบุ'}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-500 text-xs">สถานะ</div>
                          <div className="text-gray-800 font-medium">{selectedUser.position || 'ไม่ระบุ'}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-500 text-xs">เบอร์โทร</div>
                          <div className="text-gray-800 font-medium">{selectedUser.phone || 'ไม่ระบุ'}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-500 text-xs">แผนก</div>
                          <div className="text-gray-800 font-medium">{selectedUser.department || 'ไม่ระบุ'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activities Timeline Card */}
                  {selectedUser.activities && selectedUser.activities.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        กิจกรรมล่าสุด
                      </h4>
                      <div className="space-y-3">
                        {selectedUser.activities.map((activity, idx) => (
                          <div key={idx} className="flex gap-3 items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.icon === 'edit' ? 'bg-blue-100' :
                              activity.icon === 'clock' ? 'bg-green-100' :
                              activity.icon === 'calendar' ? 'bg-purple-100' :
                              'bg-gray-100'
                            }`}>
                              {activity.icon === 'edit' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              )}
                              {activity.icon === 'clock' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {activity.icon === 'calendar' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                              {activity.icon === 'logout' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 font-medium">{activity.action}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.date} เวลา {activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Detailed Information */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Work History Section */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      ประวัติการทำงาน
                    </h3>
                    {selectedUser.workHistory && selectedUser.workHistory.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.workHistory.map((job, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border border-sky-100">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{job.position}</div>
                              <div className="text-sm text-gray-600 mt-1">{job.company}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {job.period}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">ไม่มีข้อมูลประวัติการทำงาน</p>
                    )}
                  </div>

                  {/* Education Section */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                      การศึกษา
                    </h3>
                    {selectedUser.education && selectedUser.education.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {selectedUser.education.map((edu, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{edu}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">ไม่มีข้อมูลการศึกษา</p>
                    )}
                  </div>

                  {/* Certifications & Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Certifications */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        ใบรับรอง
                      </h3>
                      {selectedUser.certifications && selectedUser.certifications.length > 0 ? (
                        <div className="space-y-2">
                          {selectedUser.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                              <span className="text-gray-700">{cert}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">ไม่มีข้อมูล</p>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        ทักษะ
                      </h3>
                      {selectedUser.skills && selectedUser.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">ไม่มีข้อมูล</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {selectedUser.address && (
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        ที่อยู่
                      </h3>
                      <p className="text-sm text-gray-700">{selectedUser.address}</p>
                    </div>
                  )}


                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-500 to-cyan-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                แก้ไขข้อมูลผู้ใช้
              </h2>
              <button
                onClick={closeEditUser}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ข้อมูลส่วนตัว
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อ-นามสกุล <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="0812345678"
                        pattern="[0-9]{10}"
                      />
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วันเกิด
                      </label>
                      <input
                        type="date"
                        value={editForm.birthDate}
                        onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    ข้อมูลการทำงาน
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        แผนก
                      </label>
                      <select
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
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
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        <option value="">เลือกบทบาท</option>
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        สถานะ
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ที่อยู่
                  </h3>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    rows="3"
                    placeholder="กรอกที่อยู่"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeEditUser}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEditUser}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Dialog */}
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
