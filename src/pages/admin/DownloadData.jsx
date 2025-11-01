import React, { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AlertDialog from '../../components/common/AlertDialog';
import { mockBranches, mockReports, mockDataOptions, generateMockReportData } from '../../data/usersData';

// นำเข้าฟอนต์ภาษาไทย (ถ้ามี)
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
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // Alert Dialog States
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // ใช้ Mock Data จาก usersData.js
  const branches = mockBranches;
  const reports = mockReports;
  const dataOptions = mockDataOptions;

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
    setShowPreview(false);
    setPreviewData(null);
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

  // สร้างข้อมูล Mock สำหรับรายงาน (ใช้ฟังก์ชันจาก usersData.js)
  const generateMockData = () => {
    return generateMockReportData(selectedOptions);
  };

  // จัดการการแสดงตัวอย่าง
  const handlePreview = () => {
    // ตรวจสอบความถูกต้องก่อน
    if (isSuperAdmin && selectedBranches.length === 0) {
      setAlertDialog({
        isOpen: true,
        type: 'warning',
        title: 'กรุณาเลือกสาขา',
        message: 'กรุณาเลือกสาขาที่ต้องการดูตัวอย่างข้อมูลอย่างน้อย 1 สาขา',
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
        message: 'กรุณาเลือกข้อมูลที่ต้องการดูตัวอย่างอย่างน้อย 1 รายการ',
        autoClose: true
      });
      return;
    }

    // Generate preview data
    const data = generateMockData();
    setPreviewData(data);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
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

  // Download as PDF using html2canvas (supports Thai language)
  const downloadPDF = async (data) => {
    try {
      // Create a temporary container for the table
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.background = 'white';
      container.style.padding = '40px';
      container.style.width = '1400px';
      document.body.appendChild(container);

      // Build HTML content with proper Thai font
      let tableHTML = `
        <div style="font-family: 'Sarabun', 'Prompt', 'Noto Sans Thai', sans-serif; background: white;">
          <!-- Header -->
          <div style="margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold; color: #0f172a;">
              รายงาน: ${selectedReport.title}
            </h1>
            <p style="margin: 5px 0; font-size: 16px; color: #64748b;">
              วันที่: ${startDate} ถึง ${endDate}
            </p>
      `;

      if (isSuperAdmin && selectedBranches.length > 0) {
        const branchNames = selectedBranches.map(id => 
          branches.find(b => b.id === id)?.name || id
        ).join(', ');
        tableHTML += `
            <p style="margin: 5px 0; font-size: 16px; color: #64748b;">
              สาขา: ${branchNames}
            </p>
        `;
      }

      tableHTML += `
          </div>
          
          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: linear-gradient(to right, #0ea5e9, #06b6d4);">
      `;

      // Add headers
      Object.keys(data[0]).forEach(header => {
        tableHTML += `
                <th style="padding: 12px 8px; text-align: center; color: white; font-weight: bold; border: 1px solid #0284c7; font-size: 14px;">
                  ${header}
                </th>
        `;
      });

      tableHTML += `
              </tr>
            </thead>
            <tbody>
      `;

      // Add data rows
      data.forEach((row, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f0f9ff';
        tableHTML += `<tr style="background-color: ${bgColor};">`;
        
        Object.values(row).forEach(value => {
          tableHTML += `
                <td style="padding: 10px 8px; text-align: left; border: 1px solid #e2e8f0; color: #0f172a; font-size: 13px;">
                  ${value}
                </td>
          `;
        });
        
        tableHTML += `</tr>`;
      });

      tableHTML += `
            </tbody>
          </table>
          
          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
            สร้างเมื่อ: ${new Date().toLocaleString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      `;

      container.innerHTML = tableHTML;

      // Wait for fonts to load
      await document.fonts.ready;

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1400
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const imgWidth = 297; // A4 width in mm (landscape)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 210; // A4 height in mm (landscape)
      
      const doc = new jsPDF('l', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF (first page)
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      doc.save(`รายงาน_${startDate}_${endDate}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('ไม่สามารถสร้าง PDF ได้: ' + error.message);
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

  const handleDownload = async () => {
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
          await downloadPDF(data);
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
      blue: 'bg-accent dark:bg-accent-orange text-primary dark:text-primary',
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
    <div className="min-h-screen bg-accent dark:bg-secondary transition-colors duration-300">
      <div className="max-w-7xl px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary dark:text-white">
                ดาวน์โหลดข้อมูล
              </h1>
              <p className="text-gray-500 dark:text-white/70 text-sm mt-1">
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
              className="bg-white dark:bg-secondary/95 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden hover:border-primary transition-colors"
            >
              {/* Card Header */}
              <div className={`bg-primary dark:bg-primary/90 p-6 relative overflow-hidden`}>
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
                <p className="text-gray-600 dark:text-white/70 mb-4">{report.description}</p>
                
                <button
                  onClick={() => openModal(report)}
                  className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold"
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
      {showModal && selectedReport && !showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-white dark:bg-secondary/95 rounded-3xl overflow-hidden transform animate-slideUp max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-primary dark:bg-primary/90 p-6 relative overflow-hidden">
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
                  className="w-10 h-10 bg-white/20 hover:bg-accent/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-colors"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    เลือกสาขา
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {branches.map((branch) => (
                      <label
                        key={branch.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                          selectedBranches.includes(branch.id)
                            ? 'bg-accent dark:bg-accent-orange border-gray-200 dark:border-white/10 shadow-md'
                            : 'bg-accent dark:bg-accent-orange border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary hover:shadow-sm'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBranches.includes(branch.id)}
                          onChange={() => handleBranchToggle(branch.id)}
                          className="w-5 h-5 text-primary dark:text-primary border-gray-300 dark:border-white/20 rounded focus:ring-primary focus:ring-2 cursor-pointer"
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-xl focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 dark:border-white/10 rounded-xl focus:border-primary dark:focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Data Options */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ประเภทข้อมูลที่ต้องการ
                </h3>
                <div className="space-y-3">
                  {dataOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedOptions[option.id]
                          ? 'bg-accent dark:bg-accent-orange border-gray-200 dark:border-white/10 shadow-md'
                          : 'bg-accent dark:bg-accent-orange border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOptions[option.id]}
                        onChange={() => handleOptionToggle(option.id)}
                        className="w-5 h-5 text-primary dark:text-primary border-gray-300 dark:border-white/20 rounded focus:ring-primary focus:ring-2 cursor-pointer"
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  รูปแบบไฟล์
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedFormat('excel')}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      selectedFormat === 'excel'
                        ? 'bg-green-50 border-green-400 shadow-md'
                        : 'bg-accent dark:bg-accent-orange border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary'
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
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      selectedFormat === 'pdf'
                        ? 'bg-red-50 border-red-400 shadow-md'
                        : 'bg-accent dark:bg-accent-orange border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary'
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
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      selectedFormat === 'csv'
                        ? 'bg-accent dark:bg-accent-orange border-primary dark:border-primary shadow-md'
                        : 'bg-accent dark:bg-accent-orange border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedFormat === 'csv' ? 'bg-accent dark:bg-accent-orange' : 'bg-gray-100'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${selectedFormat === 'csv' ? 'text-primary dark:text-primary' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-sm ${
                        selectedFormat === 'csv' ? 'text-primary dark:text-primary' : 'text-gray-700'
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
                  className="px-6 py-3 bg-gray-200 dark:bg-accent hover:bg-gray-300 dark:hover:bg-primary/80 text-gray-700 dark:text-white rounded-xl font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handlePreview}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  ดูตัวอย่าง
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
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

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Preview Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    ตัวอย่างข้อมูล - {selectedFormat.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    แสดง {previewData.length} รายการ • {startDate} ถึง {endDate}
                  </p>
                </div>
                <button
                  onClick={closePreview}
                  className="w-10 h-10 bg-accent dark:bg-accent-orange hover:bg-accent/80 dark:hover:bg-accent-orange/80 rounded-lg flex items-center justify-center text-secondary dark:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Preview Body - Table View */}
            <div className="flex-1 overflow-auto p-6">
              <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0]).map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {Object.values(row).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Format-specific preview info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent dark:bg-accent-orange rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      รูปแบบไฟล์: {selectedFormat.toUpperCase()}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {selectedFormat === 'excel' && 'ไฟล์ Excel (.xlsx) สามารถเปิดด้วย Microsoft Excel, Google Sheets หรือโปรแกรมแผ่นงานอื่นๆ'}
                      {selectedFormat === 'pdf' && 'ไฟล์ PDF (.pdf) เหมาะสำหรับการพิมพ์และแชร์ สามารถเปิดด้วย Adobe Reader หรือโปรแกรมอ่าน PDF อื่นๆ'}
                      {selectedFormat === 'csv' && 'ไฟล์ CSV (.csv) เป็นรูปแบบข้อมูลธรรมดา สามารถนำเข้าระบบอื่นได้ง่าย'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-white hover:bg-accent dark:hover:bg-accent-orange text-secondary dark:text-white rounded-lg font-medium border border-gray-300 dark:border-white/20 transition-colors text-sm"
                >
                  ปิด
                </button>
                <button
                  onClick={() => {
                    closePreview();
                    handleDownload();
                  }}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  ดาวน์โหลดเลย
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
