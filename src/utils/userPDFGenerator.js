import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย (พ.ศ.)
const formatThaiDate = (dateString) => {
  if (!dateString) return 'ไม่ระบุ';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'ไม่ระบุ';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    return `${day}/${month}/${year}`;
  } catch {
    return 'ไม่ระบุ';
  }
};

// ฟังก์ชันโหลดรูปภาพและแปลงเป็น base64
const loadImageAsBase64 = async (imageUrl) => {
  return new Promise((resolve) => {
    // ถ้าเป็น base64 อยู่แล้ว
    if (imageUrl && imageUrl.startsWith('data:image')) {
      console.log('Image is already base64');
      resolve(imageUrl);
      return;
    }

    // ถ้าไม่มี URL ให้ส่ง null กลับไปใช้ placeholder
    if (!imageUrl) {
      console.log('No image URL provided');
      resolve(null);
      return;
    }

    // ถ้าเป็น URL ภายนอก ให้ใช้ placeholder เลย (เพราะ CORS จะ block)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.warn('External URL detected, will use placeholder:', imageUrl);
      resolve(null);
      return;
    }

    // สำหรับ local path หรือ blob URL
    try {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 200;
          canvas.height = img.naturalHeight || img.height || 200;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const base64 = canvas.toDataURL('image/png');
          console.log('Image converted to base64 successfully');
          resolve(base64);
        } catch (error) {
          console.error('Canvas conversion error:', error);
          resolve(null);
        }
      };
      
      img.onerror = (error) => {
        console.error('Image load failed:', imageUrl, error);
        resolve(null);
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Image loading error:', error);
      resolve(null);
    }
  });
};

// ฟังก์ชันสร้าง placeholder avatar
const createPlaceholderAvatar = (name) => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  // วาดพื้นหลังสีส้ม
  ctx.fillStyle = '#F26623';
  ctx.fillRect(0, 0, 200, 200);
  
  // เขียนตัวอักษรสีขาว
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 80px Prompt';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // ดึงอักษรตัวแรกของชื่อ
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  ctx.fillText(initial, 100, 100);
  
  return canvas.toDataURL('image/png');
};

// ฟังก์ชันกำหนดสีและข้อความ status
const getStatusInfo = (status) => {
  const statusLower = (status || '').toLowerCase();
  const statusMap = {
    'active': { bg: '#22C55E', text: 'Active' },
    'inactive': { bg: '#6b7280', text: 'Inactive' },
    'suspended': { bg: '#ef4444', text: 'Suspended' },
    'pending': { bg: '#f59e0b', text: 'Pending' }
  };
  return statusMap[statusLower] || { bg: '#6b7280', text: status || 'N/A' };
};

// ฟังก์ชันสร้าง HTML สำหรับหน้า 1
const createPage1HTML = (user, profileImageBase64, statusInfo) => {
  return `
    <div style="font-family: 'Prompt', sans-serif; width: 800px; background: white; color: #000;">
      <!-- Header -->
      <div style="background: #F26623; padding: 30px; margin: -40px -40px 30px -40px; color: white;">
        <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold;">ข้อมูลพนักงาน</h1>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Employee Information</p>
        <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.8;">สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <!-- Profile Section -->
      <div style="background: #FFF2EC; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #F26623;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 150px; vertical-align: top; padding-right: 20px;">
              <img src="${profileImageBase64}" 
                   style="width: 130px; height: 130px; border-radius: 8px; border: 3px solid white; display: block; object-fit: cover;" 
                   onerror="this.style.display='none'" />
            </td>
            <td style="vertical-align: top;">
              <h2 style="margin: 0 0 8px 0; font-size: 26px; color: #000000; font-weight: bold;">${user.name || 'ไม่ระบุชื่อ'}</h2>
              <p style="margin: 0 0 12px 0; color: #4B5563; font-size: 16px; font-weight: 500;">${user.position || 'ไม่ระบุตำแหน่ง'}</p>
              <div style="display: inline-block; color: ${statusInfo.bg}; font-size: 14px; font-weight: bold; margin-bottom: 12px;">
                ${statusInfo.text}
              </div>
              <p style="margin: 0; color: #4B5563; font-size: 14px; font-weight: 600;">รหัสพนักงาน: ${user.employeeId || 'ไม่ระบุ'}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- ข้อมูลส่วนตัวและการทำงาน -->
      <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 10px;">
            <!-- ข้อมูลส่วนตัว -->
            <div style="background: #FFE4D0; padding: 12px 20px; border-radius: 8px 8px 0 0;">
              <h3 style="margin: 0; font-size: 18px; color: #F26623; font-weight: bold;">
                <svg style="width: 18px; height: 18px; display: inline; fill: #F26623; margin-right: 8px;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                ข้อมูลส่วนตัว
              </h3>
            </div>
            <div style="background: white; padding: 20px; border: 2px solid #FFE4D0; border-top: none; border-radius: 0 0 8px 8px;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">วันเกิด</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${formatThaiDate(user.birthDate)}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">อายุ</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${user.age || '-'} ปี</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">บัตรประชาชน</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right; font-size: 12px;">${user.nationalId || 'ไม่ระบุ'}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">หมู่เลือด</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${user.bloodType || 'ไม่ระบุ'}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">อีเมล</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right; font-size: 12px;">${user.email || 'ไม่ระบุ'}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">เบอร์โทร</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${user.phone || 'ไม่ระบุ'}</td>
                </tr>
              </table>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 10px;">
            <!-- ข้อมูลการทำงาน -->
            <div style="background: #FFE4D0; padding: 12px 20px; border-radius: 8px 8px 0 0;">
              <h3 style="margin: 0; font-size: 18px; color: #F26623; font-weight: bold;">
                <svg style="width: 18px; height: 18px; display: inline; fill: #F26623; margin-right: 8px;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                ข้อมูลการทำงาน
              </h3>
            </div>
            <div style="background: white; padding: 20px; border: 2px solid #FFE4D0; border-top: none; border-radius: 0 0 8px 8px;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">ตำแหน่ง</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${user.position || 'ไม่ระบุ'}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">แผนก</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${user.department || 'ไม่ระบุ'}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">วันเริ่มงาน</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${formatThaiDate(user.startDate)}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">ประเภทการจ้าง</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${user.employmentType || 'ไม่ระบุ'}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">เงินเดือน</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold; text-align: right;">${user.salary ? user.salary.toLocaleString() + ' บาท' : 'ไม่ระบุ'}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

      ${user.address ? `
      <!-- ที่อยู่ -->
      <div style="margin-bottom: 20px;">
        <div style="background: #FFF2EC; padding: 12px 20px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; font-size: 18px; color: #F26623; font-weight: bold;">
            <svg style="width: 18px; height: 18px; display: inline; fill: #F26623; margin-right: 8px;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            ที่อยู่
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #FFF2EC; border-top: none; border-radius: 0 0 8px 8px; font-size: 14px; color: #000000; line-height: 1.6;">
          ${user.address}
        </div>
      </div>
      ` : ''}

      ${user.emergencyContact?.name || user.emergencyContact?.phone ? `
      <!-- ผู้ติดต่อฉุกเฉิน -->
      <div>
        <div style="background: #fef3c7; padding: 12px 20px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; font-size: 18px; color: #92400e; font-weight: bold;">⚠️ ผู้ติดต่อฉุกเฉิน</h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #fef3c7; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #4B5563; width: 35%; font-weight: 500;">ชื่อ-นามสกุล</td>
              <td style="padding: 8px 0; color: #000000; font-weight: bold;">${user.emergencyContact?.name || 'ไม่ระบุ'}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">เบอร์โทร</td>
              <td style="padding: 8px 0; color: #000000; font-weight: bold;">${user.emergencyContact?.phone || 'ไม่ระบุ'}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #4B5563; font-weight: 500;">ความสัมพันธ์</td>
              <td style="padding: 8px 0; color: #000000; font-weight: bold;">${user.emergencyContact?.relationship || 'ไม่ระบุ'}</td>
            </tr>
          </table>
        </div>
      </div>
      ` : ''}
    </div>
  `;
};

// ฟังก์ชันสร้าง HTML สำหรับหน้า 2
const createPage2HTML = (user) => {
  const hasWorkHistory = user.workHistory && user.workHistory.length > 0;
  const hasEducation = user.education && user.education.length > 0;
  const hasSkills = user.skills && user.skills.length > 0;

  return `
    <div style="font-family: 'Prompt', sans-serif; width: 800px; background: white; color: #000;">
      <!-- Header หน้า 2 -->
      <div style="background: #F26623; padding: 25px; margin: -40px -40px 30px -40px; color: white;">
        <h2 style="margin: 0; font-size: 28px; font-weight: bold;">ข้อมูลเพิ่มเติม</h2>
        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">${user.name || ''} - ${user.employeeId || ''}</p>
      </div>

      ${hasWorkHistory ? `
      <!-- ประวัติการทำงาน -->
      <div style="margin-bottom: 20px;">
        <div style="background: #FFF2EC; padding: 12px 20px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; font-size: 18px; color: #F26623; font-weight: bold;">
            <svg style="width: 18px; height: 18px; display: inline; fill: #F26623; margin-right: 8px;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
            ประวัติการทำงาน
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #FFF2EC; border-top: none; border-radius: 0 0 8px 8px;">
          ${user.workHistory.map((work, index) => `
            <div style="margin-bottom: ${index < user.workHistory.length - 1 ? '16px' : '0'}; padding-bottom: ${index < user.workHistory.length - 1 ? '16px' : '0'}; ${index < user.workHistory.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
              <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #000000;">${work.position || 'ไม่ระบุตำแหน่ง'}</p>
              <p style="margin: 0 0 6px 0; font-size: 14px; color: #4B5563; font-weight: 500;">${work.company || 'ไม่ระบุบริษัท'}</p>
              <p style="margin: 0 0 ${work.description ? '8px' : '0'}; font-size: 13px; color: #94a3b8;">${work.period || 'ไม่ระบุช่วงเวลา'}</p>
              ${work.description ? `<p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">${work.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${hasEducation ? `
      <!-- การศึกษา -->
      <div style="margin-bottom: 20px;">
        <div style="background: #FFF2EC; padding: 12px 20px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; font-size: 18px; color: #F26623; font-weight: bold;">
            <svg style="width: 18px; height: 18px; display: inline; fill: #F26623; margin-right: 8px;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 13.18c0 .897.563 1.68 1.403 2.043C7.622 15.743 9.267 16 12 16s4.378-.257 5.597-.777c.84-.363 1.403-1.146 1.403-2.043 0-.672-.416-1.253-1.007-1.566.251.413.39.867.39 1.356 0 1.245-1.305 2.271-3.021 2.271-.929 0-1.79-.334-2.374-.879-1.294-1.18-3.556-1.18-4.85 0-.584.545-1.445.879-2.374.879-1.716 0-3.021-1.026-3.021-2.271 0-.489.139-.943.39-1.356-.591.313-1.007.894-1.007 1.566zm12.348-2.211l-3.536.954-1.605-1.605 3.536-.954c.151.041.298.112.432.207.134-.096.281-.166.432-.207zm0-1.414l-3.536.954-1.605-1.605 3.536-.954c.151.041.298.112.432.207.134-.096.281-.166.432-.207zm-17.068-1.105l3.536.954-1.605 1.605-3.536-.954c-.151-.041-.298-.112-.432-.207-.134.096-.281.166-.432.207zm8.534-3.596V2c-.405 0-.788.062-1.159.159.371.097.742.159 1.159.159s.788-.062 1.159-.159c-.371-.097-.754-.159-1.159-.159v3.086z"/></svg>
            การศึกษา
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #FFF2EC; border-top: none; border-radius: 0 0 8px 8px;">
          ${user.education.map((edu, index) => {
            // รองรับทั้ง object และ string
            let degree, institution, year, gpa, field;
            
            if (typeof edu === 'string') {
              // ถ้าเป็น string ให้แสดงทั้งบรรทัด
              degree = edu;
              institution = '';
              year = '';
              gpa = '';
              field = '';
            } else {
              // ถ้าเป็น object ให้ดึงข้อมูลตามปกติ
              degree = edu.degree || edu.level || edu.educationLevel || 'ไม่ระบุระดับการศึกษา';
              institution = edu.institution || edu.school || edu.university || '';
              year = edu.year || edu.graduationYear || edu.endYear || '';
              gpa = edu.gpa || '';
              field = edu.field || edu.major || '';
            }
            
            return `
            <div style="margin-bottom: ${index < user.education.length - 1 ? '16px' : '0'}; padding-bottom: ${index < user.education.length - 1 ? '16px' : '0'}; ${index < user.education.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
              <p style="margin: 0 0 ${institution ? '6px' : '0'}; font-size: 16px; font-weight: bold; color: #000000;">${degree}</p>
              ${institution ? `<p style="margin: 0 0 6px 0; font-size: 14px; color: #4B5563; font-weight: 500;">${institution}</p>` : ''}
              ${year ? `<p style="margin: 0 0 ${gpa ? '6px' : '0'}; font-size: 13px; color: #94a3b8;">${year}</p>` : ''}
              ${gpa ? `<p style="margin: 0 0 ${field ? '6px' : '0'}; font-size: 13px; color: #475569;">เกรดเฉลี่ย: ${gpa}</p>` : ''}
              ${field ? `<p style="margin: 0; font-size: 13px; color: #475569;">สาขา: ${field}</p>` : ''}
            </div>
            `;
          }).join('')}
        </div>
      </div>
      ` : ''}

      ${hasSkills ? `
      <!-- ทักษะ -->
      <div>
        <div style="background: #FFF2EC; padding: 12px 20px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; font-size: 18px; color: #F26623; font-weight: bold;">
            <svg style="width: 18px; height: 18px; display: inline; fill: #F26623; margin-right: 8px;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21 12 17.27z"/></svg>
            ทักษะ
          </h3>
        </div>
        <div style="background: white; padding: 20px; border: 2px solid #FFF2EC; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            ${user.skills.map((skill) => `
              <span style="font-size: 13px; font-weight: 500; color: #000000;">
                ${skill}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
      ` : ''}
    </div>
  `;
};

// ฟังก์ชันแปลง HTML เป็น Canvas
const htmlToCanvas = async (htmlString, width = 800) => {
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: ${width}px;
    background: white;
    padding: 40px;
    font-family: 'Prompt', sans-serif;
  `;
  container.innerHTML = htmlString;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: width + 80,
      windowWidth: width + 80,
    });
    
    document.body.removeChild(container);
    return canvas;
  } catch (error) {
    document.body.removeChild(container);
    throw error;
  }
};

// ฟังก์ชันหลักสำหรับสร้าง PDF
export const generateUserPDF = async (user) => {
  try {
    console.log('=== Starting PDF Generation ===');
    console.log('User:', user.name);
    console.log('Profile Image URL:', user.profileImage);

    // โหลดรูปภาพโปรไฟล์
    let profileImageBase64 = null;
    
    if (user.profileImage) {
      console.log('Loading profile image...');
      profileImageBase64 = await loadImageAsBase64(user.profileImage);
    }
    
    // ถ้าโหลดไม่สำเร็จ ใช้ placeholder
    if (!profileImageBase64) {
      console.log('Creating placeholder avatar...');
      profileImageBase64 = createPlaceholderAvatar(user.name || 'User');
    }
    
    console.log('Image ready:', profileImageBase64 ? 'Yes' : 'No');

    // ข้อมูล status
    const statusInfo = getStatusInfo(user.status);
    
    console.log('User data check:');
    console.log('- Work History:', user.workHistory ? user.workHistory.length : 0);
    console.log('- Education:', user.education ? user.education.length : 0);
    console.log('- Skills:', user.skills ? user.skills.length : 0);
    
    if (user.education && user.education.length > 0) {
      console.log('Education data sample:', JSON.stringify(user.education[0], null, 2));
    }

    // สร้าง PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();

    // สร้างและแปลงหน้า 1
    console.log('Generating page 1...');
    const page1HTML = createPage1HTML(user, profileImageBase64, statusInfo);
    const canvas1 = await htmlToCanvas(page1HTML);
    
    const imgData1 = canvas1.toDataURL('image/png');
    const imgWidth1 = pdfWidth;
    const imgHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
    
    pdf.addImage(imgData1, 'PNG', 0, 0, imgWidth1, imgHeight1);
    console.log('Page 1 complete');

    // ตรวจสอบว่ามีข้อมูลหน้า 2 หรือไม่
    const hasWorkHistory = user.workHistory && user.workHistory.length > 0;
    const hasEducation = user.education && user.education.length > 0;
    const hasSkills = user.skills && user.skills.length > 0;

    if (hasWorkHistory || hasEducation || hasSkills) {
      console.log('Generating page 2...');
      
      // สร้างและแปลงหน้า 2
      const page2HTML = createPage2HTML(user);
      const canvas2 = await htmlToCanvas(page2HTML);
      
      pdf.addPage();
      const imgData2 = canvas2.toDataURL('image/png');
      const imgWidth2 = pdfWidth;
      const imgHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
      
      pdf.addImage(imgData2, 'PNG', 0, 0, imgWidth2, imgHeight2);
      console.log('Page 2 complete');
    }

    // บันทึก PDF
    const fileName = `${user.name || 'employee'}_${user.employeeId || 'unknown'}.pdf`;
    pdf.save(fileName);
    
    console.log('=== PDF Generated Successfully ===');
    console.log('File name:', fileName);
    
    return true;
  } catch (error) {
    console.error('=== PDF Generation Error ===');
    console.error('Error:', error);
    throw error;
  }
};
