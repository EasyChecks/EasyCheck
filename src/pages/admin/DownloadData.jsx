import React, { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AlertDialog from '../../components/common/AlertDialog';

// Import Thai font if available
// import { thaiFont } from '../../utils/thaiFont';

function DownloadData() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({
    attendanceData: true,
    personalData: true,
    gpsTracking: false,
    photoAttendance: false,
    eventStats: false
  });
  const [selectedFormat, setSelectedFormat] = useState('excel'); // excel, pdf, csv
  
  // Alert Dialog States
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Mock branches data for SuperAdmin
  const branches = [
    { id: 'BKK101', name: 'กรุงเทพ สาขา 101', provinceCode: 'BKK' },
    { id: 'BKK102', name: 'กรุงเทพ สาขา 102', provinceCode: 'BKK' },
    { id: 'CNX201', name: 'เชียงใหม่ สาขา 201', provinceCode: 'CNX' },
    { id: 'PKT301', name: 'ภูเก็ต สาขา 301', provinceCode: 'PKT' },
  ];

  const reports = [
    {
      id: 1,
      title: 'รายงาน',
      subtitle: 'ข้อมูลแบบวันต่อวัน',
      description: 'ดาวน์โหลดข้อมูล',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      title: 'รายงาน2',
      subtitle: 'ข้อมูลแบบเดือน',
      description: 'ดาวน์โหลดข้อมูล',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  const dataOptions = [
    {
      id: 'attendanceData',
      label: 'ข้อมูลเวลาเข้า/ออก',
      description: 'เวลาเข้า-ออก, ขาด, ลา, มาสาย',
      color: 'blue'
    },
    {
      id: 'personalData',
      label: 'ข้อมูลส่วนตัว/งาน',
      description: 'ข้อมูลส่วนตัว, ตำแหน่งงาน',
      color: 'purple'
    },
    {
      id: 'gpsTracking',
      label: 'GPS Tracking',
      description: 'สถานะอยู่ในหรือนอกระยะ',
      color: 'green'
    },
    {
      id: 'photoAttendance',
      label: 'ข้อมูลภาพถ่าย',
      description: 'รูปถ่าย Check-in, Check-out',
      color: 'pink'
    },
    {
      id: 'eventStats',
      label: 'สถิติการเข้าร่วมกิจกรรม',
      description: 'จำนวนกิจกรรมที่เข้าร่วม',
      color: 'orange'
    }
  ];

  const openModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
    // Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    
    // Reset branch selection
    setSelectedBranches([]);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setSelectedBranches([]);
  };

  const handleOptionToggle = (optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  const handleBranchToggle = (branchId) => {
    setSelectedBranches(prev => {
      if (prev.includes(branchId)) {
        return prev.filter(id => id !== branchId);
      } else {
        return [...prev, branchId];
      }
    });
  };

  // Generate mock data based on selected options
  const generateMockData = () => {
    const data = [];
    
    // Generate 10 mock records
    for (let i = 1; i <= 10; i++) {
      const record = {
        'ลำดับ': i,
        'รหัสพนักงาน': `EMP${String(i).padStart(4, '0')}`,
        'ชื่อ-นามสกุล': `พนักงาน ${i}`,
      };

      if (selectedOptions.attendanceData) {
        record['เวลาเข้างาน'] = '09:00';
        record['เวลาออกงาน'] = '18:00';
        record['สถานะ'] = i % 5 === 0 ? 'มาสาย' : 'ปกติ';
      }

      if (selectedOptions.personalData) {
        record['แผนก'] = ['การเงิน', 'ไอที', 'การตลาด'][i % 3];
        record['ตำแหน่ง'] = ['พนักงาน', 'หัวหน้าทีม', 'ผู้จัดการ'][i % 3];
        record['อีเมล'] = `employee${i}@example.com`;
      }

      if (selectedOptions.gpsTracking) {
        record['GPS Status'] = i % 3 === 0 ? 'อยู่นอกระยะ' : 'อยู่ในระยะ';
        record['ระยะห่าง'] = i % 3 === 0 ? '250 ม.' : '15 ม.';
      }

      if (selectedOptions.photoAttendance) {
        record['รูปภาพ Check-in'] = `photo_checkin_${i}.jpg`;
        record['รูปภาพ Check-out'] = `photo_checkout_${i}.jpg`;
      }

      if (selectedOptions.eventStats) {
        record['กิจกรรมที่เข้าร่วม'] = Math.floor(Math.random() * 10);
        record['กิจกรรมทั้งหมด'] = 12;
        record['เปอร์เซ็นต์'] = `${Math.floor((record['กิจกรรมที่เข้าร่วม'] / 12) * 100)}%`;
      }

      data.push(record);
    }

    return data;
  };

  // Download as Excel (CSV format)
  const downloadExcel = (data) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      '\uFEFF' + headers.join(','), // Add BOM for Thai characters
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงาน_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download as PDF (Real PDF using jsPDF)
  const downloadPDF = (data) => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Add Thai font if available
      // Uncomment when thaiFont is ready:
      // if (typeof thaiFont !== 'undefined') {
      //   doc.addFileToVFS('THSarabun.ttf', thaiFont);
      //   doc.addFont('THSarabun.ttf', 'THSarabun', 'normal');
      //   doc.setFont('THSarabun');
      // }
      
      // Header
      doc.setFontSize(16);
      doc.text(`Report: ${selectedReport.title}`, 14, 15);
      doc.setFontSize(12);
      doc.text(`Date: ${startDate} to ${endDate}`, 14, 22);
      
      if (isSuperAdmin && selectedBranches.length > 0) {
        const branchNames = selectedBranches.map(id => 
          branches.find(b => b.id === id)?.name || id
        ).join(', ');
        doc.text(`Branch: ${branchNames}`, 14, 28);
      }
      
      // Prepare table data
      const headers = [Object.keys(data[0])];
      const body = data.map(row => Object.values(row));
      
      // Add table
      autoTable(doc, {
        startY: isSuperAdmin && selectedBranches.length > 0 ? 32 : 28,
        head: headers,
        body: body,
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [8, 94, 197],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          0: { cellWidth: 15 }
        }
      });

      doc.save(`รายงาน_${startDate}_${endDate}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('ไม่สามารถสร้าง PDF ได้');
    }
  };

  // Download as CSV (same as Excel but different extension)
  const downloadCSV = (data) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      '\uFEFF' + headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงาน_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    // Check if SuperAdmin has selected branches
    if (isSuperAdmin && selectedBranches.length === 0) {
      setAlertDialog({
        isOpen: true,
        type: 'warning',
        title: 'กรุณาเลือกสาขา',
        message: 'กรุณาเลือกสาขาที่ต้องการดาวน์โหลดข้อมูลอย่างน้อย 1 สาขา',
        autoClose: true
      });
      return;
    }

    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount === 0) {
      setAlertDialog({
        isOpen: true,
        type: 'warning',
        title: 'กรุณาเลือกข้อมูล',
        message: 'กรุณาเลือกข้อมูลที่ต้องการดาวน์โหลดอย่างน้อย 1 รายการ',
        autoClose: true
      });
      return;
    }

    // Generate mock data
    const data = generateMockData();

    // Download based on selected format
    try {
      switch (selectedFormat) {
        case 'excel':
          downloadExcel(data);
          break;
        case 'pdf':
          downloadPDF(data);
          break;
        case 'csv':
          downloadCSV(data);
          break;
        default:
          downloadExcel(data);
      }

      const branchInfo = isSuperAdmin && selectedBranches.length > 0 
        ? `\nสาขา: ${selectedBranches.length} สาขา`
        : '';

      setAlertDialog({
        isOpen: true,
        type: 'success',
        title: 'ดาวน์โหลดสำเร็จ',
        message: `ดาวน์โหลด ${selectedReport.title} ในรูปแบบ ${selectedFormat.toUpperCase()} เรียบร้อยแล้ว\nวันที่: ${startDate} ถึง ${endDate}${branchInfo}\nจำนวนข้อมูล: ${selectedCount} รายการ`,
        autoClose: true
      });
      
      closeModal();
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: `ไม่สามารถดาวน์โหลดไฟล์ได้: ${error.message}`,
        autoClose: true
      });
    }
  };

  const closeAlertDialog = () => {
    setAlertDialog({ ...alertDialog, isOpen: false });
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      pink: 'bg-pink-100 text-pink-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  // SVG Icons
  const icons = {
    report: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    chart: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    clock: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    location: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    camera: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    activity: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ดาวน์โหลดข้อมูล
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isSuperAdmin ? 'เลือกสาขาและข้อมูลที่ต้องการดาวน์โหลด' : 'เลือกข้อมูลที่ต้องการดาวน์โหลด'}
              </p>
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${report.color} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      {report.id === 1 ? icons.report : icons.chart}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-md">{report.title}</h2>
                      <p className="text-white/90 text-sm">{report.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">{report.description}</p>
                
                <button
                  onClick={() => openModal(report)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel (.xlsx), PDF, CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transform animate-slideUp max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                    {selectedReport.id === 1 ? icons.report : icons.chart}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">
                      ดาวน์โหลดรวมข้อมูลพนักงานทั้งหมด
                    </h2>
                    <p className="text-white/90 text-sm">เลือกช่วงเวลาและประเภทข้อมูลที่ต้องการ</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all duration-200 transform hover:scale-110"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Branch Selection (SuperAdmin Only) */}
              {isSuperAdmin && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    เลือกสาขา
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {branches.map((branch) => (
                      <label
                        key={branch.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedBranches.includes(branch.id)
                            ? 'bg-blue-50 border-blue-300 shadow-md'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBranches.includes(branch.id)}
                          onChange={() => handleBranchToggle(branch.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm">{branch.name}</div>
                          <div className="text-xs text-gray-500">{branch.id}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  ช่วงเวลา
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">วันที่เริ่มต้น</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Data Options */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ประเภทข้อมูลที่ต้องการ
                </h3>
                <div className="space-y-3">
                  {dataOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedOptions[option.id]
                          ? 'bg-blue-50 border-blue-300 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOptions[option.id]}
                        onChange={() => handleOptionToggle(option.id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(option.color)}`}>
                        {option.id === 'attendanceData' && icons.clock}
                        {option.id === 'personalData' && icons.user}
                        {option.id === 'gpsTracking' && icons.location}
                        {option.id === 'photoAttendance' && icons.camera}
                        {option.id === 'eventStats' && icons.activity}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* File Format Selection */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  รูปแบบไฟล์
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedFormat('excel')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedFormat === 'excel'
                        ? 'bg-green-50 border-green-400 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedFormat === 'excel' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${selectedFormat === 'excel' ? 'text-green-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-sm ${
                        selectedFormat === 'excel' ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        Excel
                      </span>
                      <span className="text-xs text-gray-500">.xlsx</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedFormat('pdf')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedFormat === 'pdf'
                        ? 'bg-red-50 border-red-400 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedFormat === 'pdf' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${selectedFormat === 'pdf' ? 'text-red-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-sm ${
                        selectedFormat === 'pdf' ? 'text-red-700' : 'text-gray-700'
                      }`}>
                        PDF
                      </span>
                      <span className="text-xs text-gray-500">.pdf</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedFormat('csv')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedFormat === 'csv'
                        ? 'bg-blue-50 border-blue-400 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedFormat === 'csv' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${selectedFormat === 'csv' ? 'text-blue-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-sm ${
                        selectedFormat === 'csv' ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        CSV
                      </span>
                      <span className="text-xs text-gray-500">.csv</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  ดาวน์โหลด {selectedFormat.toUpperCase()}
                </button>
              </div>
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

export default DownloadData;
