import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateUserPDF = async (user, getStatusBadge) => {
  // สร้าง HTML element ชั่วคราวสำหรับแปลงเป็น PDF
  const element = document.createElement('div');
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.width = '210mm';
  element.style.padding = '20px';
  element.style.backgroundColor = '#ffffff';
  element.style.fontFamily = 'Arial, sans-serif';
  
  // สร้างเนื้อหา HTML
  element.innerHTML = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <!-- Header -->
      <div style="background: linear-gradient(to right, #0ea5e9, #06b6d4); padding: 30px 20px; margin: -20px -20px 20px -20px; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: bold;">ข้อมูลพนักงาน</h1>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Employee Information</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
      
      <!-- Profile Section -->
      <div style="display: flex; gap: 20px; margin-bottom: 20px; align-items: center; background: #f0f9ff; padding: 20px; border-radius: 10px; border: 2px solid #0ea5e9;">
        <img src="${user.profileImage || `https://i.pravatar.cc/150?u=${user.id}`}" 
             style="width: 120px; height: 120px; border-radius: 10px; object-fit: cover; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" 
             crossorigin="anonymous" />
        <div style="flex: 1;">
          <h2 style="margin: 0 0 5px 0; font-size: 24px; color: #0f172a;">${user.name}</h2>
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 16px;">${user.position || 'ไม่ระบุตำแหน่ง'}</p>
          <div style="display: inline-block; padding: 6px 16px; background: #0ea5e9; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ${user.status}
          </div>
          <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">รหัสพนักงาน: ${user.employeeId}</p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- ข้อมูลส่วนตัว -->
        <div>
          <div style="background: #e0f2fe; padding: 12px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
            <h3 style="margin: 0; font-size: 18px; color: #0369a1; display: flex; align-items: center;">
              <span style="margin-right: 8px;">👤</span> ข้อมูลส่วนตัว
            </h3>
          </div>
          <div style="background: white; padding: 20px; border: 2px solid #e0f2fe; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 45%;">วันเกิด</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${user.birthDate || 'ไม่ระบุ'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">อายุ</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.age} ปี</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">เลขบัตรประชาชน</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0; font-size: 12px;">${user.nationalId || 'ไม่ระบุ'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">หมู่เลือด</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.bloodType || 'ไม่ระบุ'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">อีเมล</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0; font-size: 12px;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">เบอร์โทรศัพท์</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.phone}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- ข้อมูลการทำงาน -->
        <div>
          <div style="background: #e0f2fe; padding: 12px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
            <h3 style="margin: 0; font-size: 18px; color: #0369a1; display: flex; align-items: center;">
              <span style="margin-right: 8px;">💼</span> ข้อมูลการทำงาน
            </h3>
          </div>
          <div style="background: white; padding: 20px; border: 2px solid #e0f2fe; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 45%;">ตำแหน่ง</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${user.position || 'ไม่ระบุ'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">แผนก</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.department || 'ไม่ระบุ'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">วันเริ่มงาน</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.startDate || 'ไม่ระบุ'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">ประเภทการจ้าง</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.employmentType || 'ไม่ระบุ'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">เงินเดือน</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.salary ? user.salary.toLocaleString() + ' บาท' : 'ไม่ระบุ'}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      
      ${user.address ? `
      <!-- ที่อยู่ -->
      <div style="margin-top: 20px;">
        <div style="background: #e0f2fe; padding: 12px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
          <h3 style="margin: 0; font-size: 18px; color: #0369a1; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📍</span> ที่อยู่
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #e0f2fe; border-radius: 0 0 8px 8px; font-size: 14px; color: #0f172a; line-height: 1.6;">
          ${user.address}
        </div>
      </div>
      ` : ''}
      
      ${user.emergencyContact?.name || user.emergencyContact?.phone ? `
      <!-- ข้อมูลผู้ติดต่อฉุกเฉิน -->
      <div style="margin-top: 20px;">
        <div style="background: #fef3c7; padding: 12px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
          <h3 style="margin: 0; font-size: 18px; color: #92400e; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🚨</span> ข้อมูลผู้ติดต่อฉุกเฉิน
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #fef3c7; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 30%;">ชื่อ-นามสกุล</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${user.emergencyContact?.name || 'ไม่ระบุ'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">เบอร์โทรศัพท์</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.emergencyContact?.phone || 'ไม่ระบุ'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">ความสัมพันธ์</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px solid #e2e8f0;">${user.emergencyContact?.relationship || 'ไม่ระบุ'}</td>
            </tr>
          </table>
        </div>
      </div>
      ` : ''}
      
      ${user.workHistory && user.workHistory.length > 0 ? `
      <!-- ประวัติการทำงาน -->
      <div style="margin-top: 20px; page-break-inside: avoid;">
        <div style="background: #e0f2fe; padding: 12px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
          <h3 style="margin: 0; font-size: 18px; color: #0369a1; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📋</span> ประวัติการทำงาน
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #e0f2fe; border-radius: 0 0 8px 8px;">
          ${user.workHistory.map((work, index) => `
            <div style="margin-bottom: ${index < user.workHistory.length - 1 ? '20px' : '0'}; padding-bottom: ${index < user.workHistory.length - 1 ? '20px' : '0'}; border-bottom: ${index < user.workHistory.length - 1 ? '1px solid #e2e8f0' : 'none'};">
              <div style="color: #0ea5e9; font-weight: 700; font-size: 16px; margin-bottom: 8px;">${index + 1}. ${work.position || '-'}</div>
              <div style="color: #64748b; font-size: 14px; margin-bottom: 4px;">
                <span style="font-weight: 600;">บริษัท:</span> ${work.company || '-'}
              </div>
              <div style="color: #64748b; font-size: 14px;">
                <span style="font-weight: 600;">ช่วงเวลา:</span> ${work.period || '-'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${user.education && user.education.length > 0 ? `
      <!-- การศึกษา -->
      <div style="margin-top: 20px; page-break-inside: avoid;">
        <div style="background: #e0f2fe; padding: 12px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
          <h3 style="margin: 0; font-size: 18px; color: #0369a1; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🎓</span> การศึกษา
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #e0f2fe; border-radius: 0 0 8px 8px;">
          <ul style="margin: 0; padding-left: 20px; color: #0f172a; font-size: 14px; line-height: 1.8;">
            ${user.education.map(edu => `<li style="margin-bottom: 8px;">${edu}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}
      
      ${user.skills && user.skills.length > 0 ? `
      <!-- ทักษะ -->
      <div style="margin-top: 20px; page-break-inside: avoid;">
        <div style="background: #e0f2fe; padding: 12px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
          <h3 style="margin: 0; font-size: 18px; color: #0369a1; display: flex; align-items: center;">
            <span style="margin-right: 8px;">⚡</span> ทักษะ
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #e0f2fe; border-radius: 0 0 8px 8px;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${user.skills.map(skill => `
              <span style="display: inline-block; padding: 8px 16px; background: linear-gradient(to right, #e0f2fe, #cffafe); color: #0369a1; border-radius: 20px; font-size: 13px; font-weight: 600;">
                ${skill}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
      ` : ''}
      
      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">เอกสารนี้สร้างโดยระบบ EasyCheck</p>
        <p style="margin: 5px 0 0 0;">วันที่พิมพ์: ${new Date().toLocaleString('th-TH')}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(element);
  
  try {
    // รอให้รูปภาพโหลดเสร็จ
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // แปลง HTML เป็น canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // สร้าง PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // คำนวณจำนวนหน้า
    let heightLeft = imgHeight;
    let position = 0;
    const pageHeight = 297; // A4 height in mm
    
    // หน้าแรก
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // หน้าถัดไป (ถ้ามี)
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // บันทึกไฟล์
    doc.save(`${user.employeeId}_${user.name.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('เกิดข้อผิดพลาดในการสร้าง PDF: ' + error.message);
  } finally {
    // ลบ element ชั่วคราว
    document.body.removeChild(element);
  }
};
  
  yPos = 50;
  
  // ข้อมูลส่วนตัว
  doc.setFillColor(14, 165, 233, 0.1);
  doc.rect(leftMargin - 5, yPos - 5, 170, 10, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text('ข้อมูลส่วนตัว', leftMargin, yPos);
  yPos += lineHeight + 3;
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  
  const personalInfo = [
    { label: 'ชื่อ-นามสกุล', value: user.name },
    { label: 'รหัสพนักงาน', value: user.employeeId },
    { label: 'วันเกิด', value: user.birthDate || 'ไม่ระบุ' },
    { label: 'อายุ', value: `${user.age} ปี` },
    { label: 'เลขบัตรประชาชน', value: user.nationalId || 'ไม่ระบุ' },
    { label: 'หมู่เลือด', value: user.bloodType || 'ไม่ระบุ' },
    { label: 'อีเมล', value: user.email },
    { label: 'เบอร์โทรศัพท์', value: user.phone },
    { label: 'สถานะ', value: user.status }
  ];
  
  personalInfo.forEach(info => {
    doc.setTextColor(100, 100, 100);
    doc.text(`${info.label}:`, leftMargin, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(info.value || '-', leftMargin + 50, yPos);
    yPos += lineHeight;
  });
  
  yPos += 5;
  
  // ข้อมูลการทำงาน
  doc.setFillColor(14, 165, 233, 0.1);
  doc.rect(leftMargin - 5, yPos - 5, 170, 10, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text('ข้อมูลการทำงาน', leftMargin, yPos);
  yPos += lineHeight + 3;
  
  doc.setFontSize(12);
  
  const workInfo = [
    { label: 'ตำแหน่ง', value: user.position },
    { label: 'แผนก', value: user.department },
    { label: 'วันเริ่มงาน', value: user.startDate || 'ไม่ระบุ' },
    { label: 'ประเภทการจ้าง', value: user.employmentType || 'ไม่ระบุ' },
    { label: 'เงินเดือน', value: user.salary ? `${user.salary.toLocaleString()} บาท` : 'ไม่ระบุ' }
  ];
  
  workInfo.forEach(info => {
    doc.setTextColor(100, 100, 100);
    doc.text(`${info.label}:`, leftMargin, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(info.value || '-', leftMargin + 50, yPos);
    yPos += lineHeight;
  });
  
  yPos += 5;
  
  // ที่อยู่
  if (user.address) {
    doc.setFillColor(14, 165, 233, 0.1);
    doc.rect(leftMargin - 5, yPos - 5, 170, 10, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('ที่อยู่', leftMargin, yPos);
    yPos += lineHeight + 3;
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    const addressLines = doc.splitTextToSize(user.address, 150);
    addressLines.forEach(line => {
      doc.text(line, leftMargin, yPos);
      yPos += lineHeight;
    });
    
    yPos += 5;
  }
  
  // ข้อมูลผู้ติดต่อฉุกเฉิน
  if (user.emergencyContact?.name || user.emergencyContact?.phone || user.emergencyContact?.relationship) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(14, 165, 233, 0.1);
    doc.rect(leftMargin - 5, yPos - 5, 170, 10, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('ข้อมูลผู้ติดต่อฉุกเฉิน', leftMargin, yPos);
    yPos += lineHeight + 3;
    
    doc.setFontSize(12);
    
    const emergencyInfo = [
      { label: 'ชื่อ-นามสกุล', value: user.emergencyContact?.name || 'ไม่ระบุ' },
      { label: 'เบอร์โทรศัพท์', value: user.emergencyContact?.phone || 'ไม่ระบุ' },
      { label: 'ความสัมพันธ์', value: user.emergencyContact?.relationship || 'ไม่ระบุ' }
    ];
    
    emergencyInfo.forEach(info => {
      doc.setTextColor(100, 100, 100);
      doc.text(`${info.label}:`, leftMargin, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(info.value, leftMargin + 50, yPos);
      yPos += lineHeight;
    });
    
    yPos += 5;
  }
  
  // ประวัติการทำงาน
  if (user.workHistory && user.workHistory.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(14, 165, 233, 0.1);
    doc.rect(leftMargin - 5, yPos - 5, 170, 10, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('ประวัติการทำงาน', leftMargin, yPos);
    yPos += lineHeight + 3;
    
    doc.setFontSize(12);
    
    user.workHistory.forEach((work, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(14, 165, 233);
      doc.text(`${index + 1}.`, leftMargin, yPos);
      
      doc.setTextColor(100, 100, 100);
      doc.text('ตำแหน่ง:', leftMargin + 7, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(work.position || '-', leftMargin + 30, yPos);
      yPos += lineHeight;
      
      doc.setTextColor(100, 100, 100);
      doc.text('บริษัท:', leftMargin + 7, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(work.company || '-', leftMargin + 30, yPos);
      yPos += lineHeight;
      
      doc.setTextColor(100, 100, 100);
      doc.text('ช่วงเวลา:', leftMargin + 7, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(work.period || '-', leftMargin + 30, yPos);
      yPos += lineHeight + 3;
    });
    
    yPos += 2;
  }
  
  // การศึกษา
  if (user.education && user.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(14, 165, 233, 0.1);
    doc.rect(leftMargin - 5, yPos - 5, 170, 10, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('การศึกษา', leftMargin, yPos);
    yPos += lineHeight + 3;
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    user.education.forEach((edu, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(14, 165, 233);
      doc.text('•', leftMargin, yPos);
      doc.setTextColor(0, 0, 0);
      
      const eduLines = doc.splitTextToSize(edu, 150);
      eduLines.forEach(line => {
        doc.text(line, leftMargin + 7, yPos);
        yPos += lineHeight;
      });
    });
    
    yPos += 3;
  }
  
  // ทักษะ
  if (user.skills && user.skills.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(14, 165, 233, 0.1);
    doc.rect(leftMargin - 5, yPos - 5, 170, 10, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('ทักษะ', leftMargin, yPos);
    yPos += lineHeight + 3;
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    // แสดงทักษะแบบหลายคอลัมน์
    let xPos = leftMargin;
    let skillCount = 0;
    
    user.skills.forEach((skill, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
        xPos = leftMargin;
      }
      
      doc.setTextColor(14, 165, 233);
      doc.text('•', xPos, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(skill, xPos + 7, yPos);
      
      skillCount++;
      
      // สลับคอลัมน์
      if (skillCount % 2 === 1 && index < user.skills.length - 1) {
        xPos = 110;
      } else {
        xPos = leftMargin;
        yPos += lineHeight;
      }
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `หน้า ${i} จาก ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // บันทึกไฟล์
  doc.save(`${user.employeeId}_${user.name.replace(/\s+/g, '_')}.pdf`);
};
