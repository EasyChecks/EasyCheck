# ตัวอย่างเอกสาร SRS (Software Requirements Specification)
## EasyCheck Frontend Application

---

## Table of Contents
1. Introduction
   - 1.1 Purpose
   - 1.2 Scope
   - 1.3 Definitions, acronyms, and abbreviations
   - 1.4 References
   - 1.5 Overview
2. Overall description
   - 2.1 Product perspective
   - 2.2 Product functions
   - 2.3 User characteristics
   - 2.4 Constraints
   - 2.5 Assumptions and dependencies
3. Specific requirements
4. Appendices

---

## 1. Introduction

### 1.1 Purpose
เอกสารนี้ประกอบด้วยข้อกำหนดทางเทคนิคสำหรับระบบจัดการสำเร็จรูป EasyCheck Frontend Application ซึ่งเป็นแอปพลิเคชัน React ที่ใช้สำหรับจัดการข้อมูลการเข้าออกงาน (Attendance) การลาหยุด (Leave Management) การจัดการอนุมัติ (Approval Workflow) และการส่งการแจ้งเตือนกลุ่ม

### 1.2 Scope
ระบบนี้ครอบคลุมฟังก์ชันการทำงานดังนี้:
- **Authentication & Authorization**: การตรวจสอบตัวตนและการอนุญาต
- **User Dashboard**: แดชบอร์ดสำหรับผู้ใช้ทั่วไป
- **Admin Dashboard**: แดชบอร์ดสำหรับผู้บริหารระบบ
- **Attendance Management**: จัดการการเข้าออกงาน
- **Leave Management**: ระบบจัดการการลาหยุด
- **Event Management**: จัดการกิจกรรม/ประชุม
- **Team Management**: จัดการทีมและสถิติ
- **Location Mapping**: แสดงพื้นที่เช็คอิน/เช็คเอาท์
- **Notifications**: ระบบการแจ้งเตือนกลุ่ม

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS**: Software Requirements Specification
- **UI/UX**: User Interface/User Experience
- **API**: Application Programming Interface
- **JWT**: JSON Web Token (สำหรับ Authentication)
- **React**: JavaScript library สำหรับสร้าง UI
- **Leaflet**: Library สำหรับแสดงแผนที่
- **Tailwind CSS**: Framework สำหรับ styling
- **Admin**: ผู้ดูแลระบบ
- **SuperAdmin**: ผู้ดูแลระบบสูงสุด
- **Manager**: หัวหน้างาน
- **User**: พนักงาน

### 1.4 References
- React 19.1.1 Documentation
- React Router 6.30.1 Documentation
- Tailwind CSS 3.4.18 Documentation
- Leaflet 1.9.4 Documentation
- jsPDF 3.0.3 Documentation

### 1.5 Overview
ระบบ EasyCheck เป็นแอปพลิเคชัน Web ที่พัฒนาโดยใช้ React และ Vite ซึ่งมีเป้าหมายในการจัดการข้อมูลการเข้าออกงาน การลาหยุด และการสื่อสารกับพนักงานภายในองค์กร

---

## 2. Overall Description

### 2.1 Product Perspective
ระบบ EasyCheck Frontend เป็นแอปพลิเคชันเว็บสำหรับจัดการข้อมูลการเข้าออกงาน ปัจจุบันอยู่ในช่วง **Development Phase 1** โดยเน้นการพัฒนา Frontend เรียบร้อยก่อน

**สถานะปัจจุบัน (Current State):**
- ✅ Frontend Development กำลังดำเนินการ
- ⏳ Backend API Server - จะพัฒนาในระยะต่อไป
- ⏳ Database Integration - จะติดตั้งหลังจากเสร็จ Backend

**แผนอนาคต (Future Integration):**
- 🔗 **Line LIFF** - สำหรับการใช้งานแอปพลิเคชันผ่าน Line Official Account
- 📨 **Line Message API** - สำหรับส่งแจ้งเตือนและข้อมูลไปยังผู้ใช้ผ่าน Line
- 📱 **Mobile App** - สำหรับแอปพลิเคชัน iOS/Android
- ☁️ **Cloud Backend** - สำหรับเก็บข้อมูลและ API Services

**Current Architecture:**
- **Frontend**: React 19.1.1 + Vite
- **Styling**: Tailwind CSS 3.4.18 + DaisyUI
- **State Management**: React Context API (Mock Data สำหรับพัฒนา)
- **Routing**: React Router 6.30.1
- **Charting**: Recharts 3.3.0
- **Mapping**: React Leaflet 5.0.0
- **PDF Generation**: jsPDF 3.0.3

**Planned Backend Architecture (Future):**
- **Framework**: Node.js + Express.js หรือ Django
- **Database**: MySQL/PostgreSQL
- **Authentication**: JWT Tokens
- **API Documentation**: Swagger/OpenAPI
- **Message Queue**: RabbitMQ หรือ Kafka สำหรับ Notifications

### 2.2 Product Functions

#### 2.2.1 Authentication System
- **ฟังก์ชัน**: ตรวจสอบตัวตน ผ่าน JWT Token
- **ไฟล์เกี่ยวข้อง**: 
  - `src/pages/Auth/Auth.jsx` - หน้าเข้าสู่ระบบ
  - `src/contexts/AuthContext.jsx` - Context จัดการ Auth State
  - `src/contexts/AuthProvider.jsx` - Provider สำหรับ Auth
  - `src/components/ProtectedRoute.jsx` - Component สำหรับป้องกันเส้นทาง
- **Roles Supported**: admin, superadmin, manager, user

#### 2.2.2 User Dashboard
- **ฟังก์ชัน**: แสดงแดชบอร์ดสำหรับผู้ใช้ทั่วไป
- **ไฟล์**: `src/pages/user/UserDashboard.jsx`
- **Features**:
  - แสดงสถิติการเข้าออกงาน
  - แสดงวันลาคงเหลือ
  - แสดงเหตุการณ์ที่กำลังจะมาถึง
  - ตรวจสอบพื้นที่เช็คอิน
  - ปุ่มลงเวลาเข้า/ออก

#### 2.2.3 Admin Dashboard
- **ฟังก์ชัน**: แสดงแดชบอร์ดสำหรับผู้บริหาร
- **ไฟล์**: `src/pages/admin/AdminDashboard.jsx`
- **Features**:
  - แสดงแผนที่พื้นที่เช็คอิน
  - แสดงกราฟสถิติการเข้าออกงาน
  - แสดงรายละเอียดตำแหน่งต่างๆ
  - ตรวจสอบรัศมีและเวลาเช็คอิน

#### 2.2.4 Attendance Management
- **ฟังก์ชัน**: จัดการข้อมูลการเข้าออกงาน
- **ไฟล์**:
  - `src/pages/admin/Attendance/Attendance.jsx` - หน้าจัดการการเข้าออกงาน
  - `src/pages/admin/Attendance/CreateAttendance.jsx` - สร้างการเข้าออกงาน
  - `src/pages/admin/Attendance/DataAttendance.jsx` - ดูข้อมูลการเข้าออกงาน
- **Features**:
  - ดูข้อมูลการเข้าออกงานของพนักงาน
  - ป้อนข้อมูลการเข้าออกงานด้วยตนเอง
  - ตรวจสอบสถิติการเข้าออกงาน

#### 2.2.5 Leave Management
- **ฟังก์ชัน**: จัดการการลาหยุด
- **ไฟล์**:
  - `src/pages/user/Leave/LeaveScreen.jsx` - หน้าสมัครลา
  - `src/pages/user/Leave/LeaveForm.jsx` - แบบฟอร์มสมัครลา
  - `src/pages/user/Leave/ListLeave.jsx` - รายการสมัครลา
  - `src/pages/user/Leave/LeaveDetail.jsx` - รายละเอียดการลา
  - `src/pages/user/Leave/LeaveApproval.jsx` - อนุมัติการลา
- **Leave Types**:
  - ลาป่วย (Sick Leave)
  - ลากิจ (Personal Leave)
  - ลาพักร้อน (Vacation)
  - ลาคลอด (Maternity Leave)

#### 2.2.6 Event Management
- **ฟังก์ชัน**: จัดการเหตุการณ์/ประชุม
- **ไฟล์**:
  - `src/pages/user/Event/EventRouter.jsx` - Routing สำหรับ Event
  - `src/pages/user/Event/EventList.jsx` - รายการเหตุการณ์
  - `src/pages/user/Event/EventDetails.jsx` - รายละเอียดเหตุการณ์
  - `src/pages/admin/EventManagement.jsx` - จัดการเหตุการณ์ (Admin)
- **Features**:
  - แสดงรายการเหตุการณ์ที่กำลังจะมา
  - แสดงรายละเอียดเหตุการณ์
  - ลงทะเบียนเหตุการณ์

#### 2.2.8 Location/Mapping
- **ฟังก์ชัน**: แสดงพื้นที่เช็คอิน
- **ไฟล์**:
  - `src/pages/admin/Mapping.jsx` - หน้าจัดการพื้นที่เช็คอิน
  - `src/contexts/LocationContext.jsx` - Context จัดการข้อมูลพื้นที่
- **Features**:
  - แสดงแผนที่ด้วย Leaflet
  - แสดงรัศมีเช็คอิน
  - แสดงประวัติการเข้าออกงานตามพื้นที่

#### 2.2.9 Notifications
- **ฟังก์ชัน**: ส่งการแจ้งเตือน
- **ไฟล์**:
  - `src/pages/admin/GroupNotification/GroupNotificationScreen.jsx` - ส่งการแจ้งเตือนกลุ่ม
- **Features**:
  - ส่งการแจ้งเตือนไปยังทีม
  - ดูประวัติการแจ้งเตือน

#### 2.2.10 Photo Taking
- **ฟังก์ชัน**: บันทึกภาพเมื่อลงเวลา
- **ไฟล์**: `src/pages/user/takept/takept.jsx`
- **Features**:
  - ใช้กล้องเว็บเพื่อบันทึกภาพ
  - อัพโหลดภาพไปยัง Server

#### 2.2.11 Profile Management
- **ฟังก์ชัน**: จัดการโปรไฟล์ผู้ใช้
- **ไฟล์**: `src/pages/user/Profile/ProfileScreen.jsx`
- **Features**:
  - แสดงข้อมูลส่วนบุคคล
  - แสดงข้อมูลการทำงาน
  - แก้ไขข้อมูลโปรไฟล์

#### 2.2.13 Download Data
- **ฟังก์ชัน**: ดาวน์โหลดข้อมูล
- **ไฟล์**: `src/pages/admin/DownloadData.jsx`
- **Libraries**: jsPDF, html2canvas
- **Features**:
  - ดาวน์โหลดข้อมูลเป็น PDF
  - ดาวน์โหลดข้อมูลเป็น Excel (บางฟีเจอร์)

#### 2.2.14 Warning Management
- **ฟังก์ชัน**: จัดการการเตือน
- **ไฟล์**:
  - `src/pages/admin/Warning/Warning.jsx` - หน้าเตือน
- **Features**:
  - ดูรายการเตือนพนักงาน
  - บันทึกเตือน

#### 2.2.15 Settings
- **ฟังก์ชัน**: ตั้งค่าแอปพลิเคชัน
- **ไฟล์**: `src/pages/user/Settings/SettingsScreen.jsx`
- **Features**:
  - เปลี่ยนรหัสผ่าน
  - ตั้งค่าการแจ้งเตือน
  - ตั้งค่าแอปพลิเคชัน

#### 2.2.16 Group Notice
- **ฟังก์ชัน**: ส่งประกาศกลุ่ม
- **ไฟล์**:
  - `src/pages/admin/GroupNotice/GroupNotice.jsx` - ประกาศ (Admin)
  - `src/pages/common/GroupNotice/GroupNotice.jsx` - ประกาศ (Common)

### 2.3 User Characteristics

#### User Types:
1. **SuperAdmin**
   - สิทธิ์: สูงสุด
   - ฟังก์ชัน: จัดการทั้งระบบ
   - Username: ADMBKK1010002
   - Password: SuperAdmin@GGS2024!

2. **Admin**
   - สิทธิ์: จัดการระบบ
   - ฟังก์ชัน: จัดการผู้ใช้, ข้อมูลการเข้าออกงาน, ตำแหน่ง
   - Username: ADMBKK1010001
   - Password: Admin@GGS2024!

3. **Manager**
   - สิทธิ์: อนุมัติ, ดูสถิติทีม
   - ฟังก์ชัน: อนุมัติการลา, ดูสถิติทีม
   - Username: BKK1010003
   - Password: 1100243657224

4. **   **
   - สิทธิ์: ลงเวลา, สมัครลา, ดูข้อมูล
   - ฟังก์ชัน: ลงเวลา, สมัครลา, ดูประวัติ
   - Username: BKK1010001
   - Password: 1209876543210

### 2.4 Constraints
- ต้องใช้ React 19.1.1 ขึ้นไป
- ต้องใช้ Browser ที่รองรับ ES6+
- ต้องเชื่อมต่อกับ Backend API Server (อนาคต)
- ต้องมีการเชื่อมต่อ Internet
- ต้องมี GPS Location Service สำหรับบางฟีเจอร์
- ต้องมีสิทธิ์เข้าใช้งาน Camera สำหรับการถ่ายภาพ และ location

### 2.5 Assumptions and Dependencies
- Backend API Server ต้องพร้อมใช้งาน
- Database ต้องมีข้อมูลที่ถูกต้อง
- Network connectivity ต้องเสถียร
- Browser ต้องรองรับ Geolocation API
- ผู้ใช้ต้องมี Browser ที่ทันสมัย

---

## 3. Specific Requirements

### 3.0.1 Future Integration - Line Platform (FI-LINE)

**FR-LINE-001**: ระบบต้องสามารถใช้งานผ่าน Line LIFF (Line Front-end Framework)
- ผู้ใช้สามารถเข้าถึงแอปพลิเคชันผ่าน Line Official Account
- เข้ากับระบบ Line Login สำหรับ Authentication
- ใช้ Line User ID สำหรับ Identification

**FR-LINE-002**: ระบบต้องส่งแจ้งเตือนผ่าน Line Message API
- ส่งการแจ้งเตือนการลาถูกอนุมัติ/ปฏิเสธ
- ส่งการแจ้งเตือนการเข้าออกงาน
- ส่งการแจ้งเตือนเหตุการณ์ที่กำลังจะมา
- ส่งรายงานสัปดาห์/เดือน

**FR-LINE-003**: ระบบต้องรองรับ Rich Message Format
- แสดง Flex Message สำหรับข้อมูลที่ซับซ้อน
- แสดงปุ่ม Action สำหรับการโต้ตอบ
- แสดงภาพและข้อมูลประจำวัน

**Implementation Plan (Phase 2-3):**
```
Phase 2: Backend API Development
├── Develop REST API for all functions
├── Setup Database (MySQL/PostgreSQL)
├── Implement JWT Authentication
└── Setup API Server (Node.js/Python)

Phase 3: Line Integration
├── Setup Line Official Account
├── Implement Line LIFF SDK
├── Setup Line Message API
├── Implement Rich Message Templates
└── Setup Webhook for Line events
```

### 3.1 Functional Requirements

#### 3.1.1 Authentication & Authorization (FR-AUTH)
**FR-AUTH-001**: ระบบต้องให้ผู้ใช้สามารถเข้าสู่ระบบได้ด้วย Username และ Password

**FR-AUTH-002**: ระบบต้องเก็บ JWT Token สำหรับการตรวจสอบตัวตนในแต่ละ Request

**FR-AUTH-003**: ระบบต้องป้องกันการเข้าถึงหน้าโดยตรวจสอบ Token

**FR-AUTH-004**: ระบบต้องมี Role-based Access Control (RBAC) สำหรับการอนุญาต

**Implementation Files**:
- `src/pages/Auth/Auth.jsx`
- `src/contexts/AuthContext.jsx`
- `src/contexts/AuthProvider.jsx`
- `src/components/ProtectedRoute.jsx`

#### 3.1.2 User Dashboard (FR-UDASH)
**FR-UDASH-001**: ระบบต้องแสดงแดชบอร์ดประจำวัน

**FR-UDASH-002**: ระบบต้องแสดงสถิติการเข้าออกงาน (เวลา, ความล่าช้า, ความเร็ว)

**FR-UDASH-003**: ระบบต้องแสดงวันลาคงเหลือ

**FR-UDASH-004**: ระบบต้องแสดงเหตุการณ์ที่กำลังจะมา

**FR-UDASH-005**: ระบบต้องให้ผู้ใช้ลงเวลาเข้า/ออกผ่านปุ่ม

**FR-UDASH-006**: ระบบต้องแสดงสถานะการตรวจสอบพื้นที่เช็คอิน

**Implementation Files**:
- `src/pages/user/UserDashboard.jsx`
- `src/components/common/AttendanceStatsCard.jsx`

#### 3.1.3 Admin Dashboard (FR-ADASH)
**FR-ADASH-001**: ระบบต้องแสดงแผนที่พื้นที่เช็คอิน

**FR-ADASH-002**: ระบบต้องแสดงรัศมีเช็คอิน

**FR-ADASH-003**: ระบบต้องแสดงกราฟสถิติการเข้าออกงาน

**FR-ADASH-004**: ระบบต้องให้เลือกประเภทกราฟ (ประจำสัปดาห์, เดือน, ปี)

**FR-ADASH-005**: ระบบต้องแสดงรายละเอียดตำแหน่งขณะคลิก

**Implementation Files**:
- `src/pages/admin/AdminDashboard.jsx`

#### 3.1.4 Attendance Management (FR-ATT)
**FR-ATT-001**: ระบบต้องบันทึกการเข้าออกงาน

**FR-ATT-002**: ระบบต้องแสดงประวัติการเข้าออกงาน

**FR-ATT-003**: ระบบต้องคำนวณความล่าช้า

**FR-ATT-004**: ระบบต้องคำนวณเวลาทำงานทั้งหมด

**FR-ATT-005**: ระบบต้องจัดการการเข้าออกงานด้วยตนเองได้ (Admin)

**Implementation Files**:
- `src/pages/admin/Attendance/Attendance.jsx`
- `src/pages/admin/Attendance/CreateAttendance.jsx`
- `src/pages/admin/Attendance/DataAttendance.jsx`

#### 3.1.5 Leave Management (FR-LEAVE)
**FR-LEAVE-001**: ระบบต้องให้ผู้ใช้สมัครลาได้

**FR-LEAVE-002**: ระบบต้องแสดงวันลาที่สมัครไปแล้ว

**FR-LEAVE-003**: ระบบต้องแสดงวันลาคงเหลือ

**FR-LEAVE-004**: ระบบต้องให้หัวหน้างาน/Admin อนุมัติการลา

**FR-LEAVE-005**: ระบบต้องส่งการแจ้งเตือนเมื่อการลาถูกอนุมัติ/ปฏิเสธ

**FR-LEAVE-006**: ระบบต้องรองรับหลายประเภทของการลา

**Implementation Files**:
- `src/pages/user/Leave/LeaveScreen.jsx`
- `src/pages/user/Leave/LeaveForm.jsx`
- `src/pages/user/Leave/LeaveDetail.jsx`
- `src/pages/user/Leave/LeaveApproval.jsx`
- `src/contexts/LeaveContext.jsx`

#### 3.1.6 Event Management (FR-EVENT)
**FR-EVENT-001**: ระบบต้องแสดงรายการเหตุการณ์

**FR-EVENT-002**: ระบบต้องให้ผู้ใช้ลงทะเบียนเหตุการณ์

**FR-EVENT-003**: ระบบต้องแสดงรายละเอียดเหตุการณ์

**FR-EVENT-004**: ระบบต้องแสดงเหตุการณ์ในปฏิทิน

**FR-EVENT-005**: ระบบต้องให้ Admin สร้างเหตุการณ์

**Implementation Files**:
- `src/pages/user/Event/EventRouter.jsx`
- `src/pages/user/Event/EventList.jsx`
- `src/pages/user/Event/EventDetails.jsx`
- `src/pages/admin/EventManagement.jsx`
- `src/contexts/EventContext.jsx`

#### 3.1.7 Team Management (FR-TEAM)
**FR-TEAM-001**: ระบบต้องแสดงสมาชิกทีม

**FR-TEAM-002**: ระบบต้องแสดงสถิติการเข้าออกงานของทีม

**FR-TEAM-003**: ระบบต้องให้ Admin เพิ่ม/แก้ไข/ลบผู้ใช้

**FR-TEAM-004**: ระบบต้องเก็บข้อมูลรายการแจ้งเตือนที่ยังไม่ได้อ่าน

**Implementation Files**:
- `src/pages/user/Team/TeamAttendance.jsx`
- `src/pages/admin/AdminManageUser.jsx`
- `src/contexts/TeamContext.jsx`

#### 3.1.8 Location Management (FR-LOC)
**FR-LOC-001**: ระบบต้องแสดงแผนที่พื้นที่เช็คอิน

**FR-LOC-002**: ระบบต้องแสดงรัศมีเช็คอิน

**FR-LOC-003**: ระบบต้องตรวจสอบว่าผู้ใช้อยู่ในพื้นที่เช็คอิน

**FR-LOC-004**: ระบบต้องบันทึกตำแหน่งการเข้าออกงาน

**Implementation Files**:
- `src/pages/admin/Mapping.jsx`
- `src/contexts/LocationContext.jsx`

#### 3.1.9 Notifications (FR-NOTIF)
**FR-NOTIF-001**: ระบบต้องให้ Admin ส่งการแจ้งเตือนกลุ่ม

**FR-NOTIF-002**: ระบบต้องให้ผู้ใช้ดูประวัติการแจ้งเตือน

**FR-NOTIF-003**: ระบบต้องแสดงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน

**Implementation Files**:
- `src/pages/admin/GroupNotification/GroupNotificationScreen.jsx`
- `src/components/user/nav/Nav.jsx`

#### 3.1.10 Photo Taking (FR-PHOTO)
**FR-PHOTO-001**: ระบบต้องให้ผู้ใช้ถ่ายภาพเมื่อลงเวลา

**FR-PHOTO-002**: ระบบต้องบันทึกภาพ

**FR-PHOTO-003**: ระบบต้องให้ผู้ใช้เลือกภาพก่อนอัพโหลด

**Implementation Files**:
- `src/pages/user/takept/takept.jsx`

```

#### 7.9.1 Send Leave Approval Notification
```
POST /api/notifications/send-leave-approval
- Body: {
    userId: "string",
    leaveId: "string",
    approvalStatus: "approved|rejected",
    approverName: "string",
    leaveType: "string",
    startDate: "date",
    endDate: "date"
  }
- Channels: [Email, Line Message, In-app Notification]
```

#### 7.9.2 Send Daily Attendance Report
```
POST /api/notifications/send-daily-report
- Body: {
    userId: "string",
    reportDate: "date",
    checkInTime: "time",
    checkOutTime: "time",
    workHours: "number"
  }
- Channels: [Line Message, In-app Notification]
```

#### 7.9.3 Send Event Reminder
```
POST /api/notifications/send-event-reminder
- Body: {
    userId: "string",
    eventId: "string",
    eventName: "string",
    eventTime: "datetime",
    location: "string"
  }
- Channels: [Line Message, Email, In-app Notification]
```

---

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance (NFR-PERF)
**NFR-PERF-001**: ระบบต้องโหลดหน้าเว็บภายใน 3 วินาที

**NFR-PERF-002**: ระบบต้องรองรับผู้ใช้พร้อมกัน 500 คน

**NFR-PERF-003**: ระบบต้องใช้ Lazy Loading สำหรับหน้าที่ใช้น้อย

**NFR-PERF-004**: ระบบต้องจัดการ Chunk Size เพื่อให้เหมาะสมกับ Browser

**Implementation**:
- Vite เพื่อการ Build ที่เร็ว
- Code Splitting ใน `src/main.jsx`
- Lazy Loading ใน Router

#### 3.2.2 Security (NFR-SEC)
**NFR-SEC-001**: ระบบต้องใช้ HTTPS

**NFR-SEC-002**: ระบบต้องป้องกัน XSS (Cross-Site Scripting)

**NFR-SEC-003**: ระบบต้องป้องกัน CSRF (Cross-Site Request Forgery)

**NFR-SEC-004**: ระบบต้องเก็บ JWT Token ปลอดภัย

**NFR-SEC-005**: ระบบต้องตรวจสอบสิทธิ์ (Authorization) สำหรับทุก Action

**Implementation**:
- ProtectedRoute Component
- JWT Token Validation
- RBAC (Role-Based Access Control)

#### 3.2.3 Usability (NFR-USAB)
**NFR-USAB-001**: ระบบต้องรองรับ Mobile Responsive Design

**NFR-USAB-002**: ระบบต้องใช้ UI Component ที่สอดคล้องกัน

**NFR-USAB-003**: ระบบต้องรองรับภาษาไทย

**NFR-USAB-004**: ระบบต้องให้ Feedback ชัดเจนต่อการกระทำของผู้ใช้

**Implementation**:
- Tailwind CSS สำหรับ Responsive Design
- DaisyUI Components
- Custom Components สำหรับ Dialogs และ Alerts

#### 3.2.4 Maintainability (NFR-MAINT)
**NFR-MAINT-001**: ระบบต้องมีการเก็บรหัสให้เป็นระเบียบ

**NFR-MAINT-002**: ระบบต้องมี Component Reusable

**NFR-MAINT-003**: ระบบต้องมี Context ที่เป็นระเบียบ

**NFR-MAINT-004**: ระบบต้องมี Error Handling ที่ดี

**Implementation**:
- Component Structure แยกตามประเภท
- Context API สำหรับ State Management
- Error Handling ใน Components

#### 3.2.5 Compatibility (NFR-COMPAT)
**NFR-COMPAT-001**: ระบบต้องรองรับ Chrome, Firefox, Safari, Edge

**NFR-COMPAT-002**: ระบบต้องรองรับ iOS และ Android

**NFR-COMPAT-003**: ระบบต้องรองรับ Desktop และ Tablet

**Implementation**:
- Responsive Design
- Cross-browser Testing

### 3.3 Data Requirements

#### 3.3.1 User Data
```
- userId: string (ID ของผู้ใช้)
- username: string (ชื่อผู้ใช้)
- email: string (อีเมล)
- firstName: string (ชื่อ)
- lastName: string (นามสกุล)
- role: enum (admin, superadmin, manager, user)
- department: string (แผนก)
- position: string (ตำแหน่ง)
- managerId: string (ID ของหัวหน้างาน)
- phoneNumber: string (เบอร์โทรศัพท์)
- profileImageUrl: string (URL ของรูปโปรไฟล์)
- startDate: date (วันเริ่มงาน)
- status: enum (active, inactive, leave)
- createdAt: datetime
- updatedAt: datetime
```

#### 3.3.2 Attendance Data
```
- attendanceId: string
- userId: string
- checkInTime: datetime
- checkOutTime: datetime
- locationId: string
- latitude: number
- longitude: number
- checkInPhoto: string (URL)
- checkOutPhoto: string (URL)
- status: enum (present, late, absent, leave)
- workHours: number
- overtimeHours: number
- notes: string
- createdAt: datetime
- updatedAt: datetime
```

#### 3.3.3 Leave Data
```
- leaveId: string
- userId: string
- leaveType: enum (sick, personal, vacation, maternity)
- startDate: date
- endDate: date
- numberOfDays: number
- reason: string
- approverIds: array of string
- status: enum (pending, approved, rejected, cancelled)
- approvalNotes: array of string
- attachments: array of string (URLs)
- createdAt: datetime
- updatedAt: datetime
```

#### 3.3.4 Event Data
```
- eventId: string
- eventName: string
- description: string
- startDateTime: datetime
- endDateTime: datetime
- location: string
- eventType: enum (meeting, training, conference, other)
- attendees: array of userId
- registeredUsers: array of userId
- createdBy: string (userId)
- createdAt: datetime
- updatedAt: datetime
```

#### 3.3.5 Location Data
```
- locationId: string
- locationName: string
- latitude: number
- longitude: number
- radius: number (in meters)
- department: string
- team: string
- description: string
- checkInTime: string (HH:mm)
- checkOutTime: string (HH:mm)
- createdAt: datetime
- updatedAt: datetime
```

### 3.4 UI/UX Requirements

#### 3.4.1 Color Scheme
- **Primary**: #48CBFF (Cyan)
- **Secondary**: #3AB4E8 (Sky Blue)
- **Success**: #22C55E (Green)
- **Warning**: #EAB308 (Yellow)
- **Danger**: #EF4444 (Red)
- **Background**: #F8FAFC (Light Gray)

#### 3.4.2 Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'
- **Heading Size**: 24px - 32px
- **Body Size**: 14px - 16px

#### 3.4.3 Layout
- **Max Width**: 1280px (7xl)
- **Padding**: 16px - 24px
- **Spacing**: 8px, 12px, 16px, 24px

#### 3.4.4 Components
- **Buttons**: Primary, Secondary, Ghost variants
- **Modals**: Page Modal, Alert Dialog, Confirm Dialog
- **Forms**: Input, Select, Textarea, Checkbox, Radio
- **Navigation**: Top Navigation, Bottom Navigation for Mobile
- **Cards**: Attendance Stats Card, Leave Card, Event Card

---

## 4. Component Structure

### 4.1 Common Components
```
src/components/common/
├── AlertDialog.jsx - Modal สำหรับ Alert
├── AttendanceStatsCard.jsx - Card แสดงสถิติการเข้าออกงาน
├── ConfirmDialog.jsx - Modal สำหรับยืนยัน
├── EmptyState.jsx - แสดงเมื่อไม่มีข้อมูล
├── ErrorMessage.jsx - แสดงข้อความข้อผิดพลาด
├── LoadingSpinner.jsx - แสดงจุดระหว่างโหลด
├── PageModal.jsx - Modal ทั่วไป
├── PuffLoader.jsx - Loading Animation
├── RouteLoader.jsx - Route Loading
└── SuccessDialog.jsx - Modal สำหรับความสำเร็จ
```

### 4.2 Admin Components
```
src/components/admin/
├── CsvImportModal.jsx - Modal สำหรับ Import CSV
├── UserCreateModal.jsx - Modal สำหรับสร้างผู้ใช้
├── UserDetailModal.jsx - Modal แสดงรายละเอียดผู้ใช้
├── UserEditModal.jsx - Modal สำหรับแก้ไขผู้ใช้
└── UserTable.jsx - ตารางแสดงผู้ใช้
```

### 4.3 UI Components
```
src/components/ui/
├── button.jsx - Button Component
└── calendar.jsx - Calendar Component
```

---

## 5. Context Structure

```
src/contexts/
├── AuthContext.jsx - Context สำหรับ Authentication
├── AuthContextValue.js - Type/Value สำหรับ Auth
├── AuthProvider.jsx - Provider สำหรับ Auth
├── EventContext.jsx - Context สำหรับ Events
├── LeaveContext.jsx - Context สำหรับ Leave
├── LoadingContext.jsx - Context สำหรับ Loading State
├── LocationContext.jsx - Context สำหรับ Locations
├── TeamContext.jsx - Context สำหรับ Team
├── useAuth.js - Custom Hook สำหรับ Auth
├── useLoading.js - Custom Hook สำหรับ Loading
├── useLocation.js - Custom Hook สำหรับ Location
└── useTeam.js - Custom Hook สำหรับ Team
```

---

## 6. Routing Structure

```
/                           - Redirect to /auth
├── /auth                   - Login Page
├── /admin                  - Admin Layout (Protected)
│   ├── /admin/dashboard    - Admin Dashboard
│   ├── /admin/manage-users - Manage Users
│   ├── /admin/download     - Download Data
│   ├── /admin/mapping      - Location Mapping
│   ├── /admin/notifications - Group Notifications
│   ├── /admin/event-management - Event Management
│   ├── /admin/attendance   - Attendance Management
│   └── /admin/warning      - Warning Management
├── /user                   - User Layout (Protected)
│   ├── /user/dashboard     - User Dashboard
│   ├── /user/take-photo    - Take Photo
│   ├── /user/leave         - Leave Management
│   ├── /user/leave/list    - Leave List
│   ├── /user/leave/detail/:id - Leave Detail
│   ├── /user/calendar      - Calendar View
│   ├── /user/event/*       - Event Management
│   ├── /user/profile       - Profile
│   ├── /user/settings      - Settings
│   ├── /user/team-attendance - Team Attendance
│   └── /user/leave-approval - Leave Approval
└── /superadmin             - Redirect to /admin
```

---

## 7. API Integration

### 7.1 Authentication API
```
POST /api/auth/login
- Request: { username, password }
- Response: { token, user }

POST /api/auth/logout
- Response: { success: true }

GET /api/auth/profile
- Headers: { Authorization: "Bearer token" }
- Response: { user }

POST /api/auth/refresh
- Response: { token }
```

### 7.2 User API
```
GET /api/users
- Query: { page, limit, search }
- Response: { users, total }

GET /api/users/:id
- Response: { user }

POST /api/users
- Body: { userData }
- Response: { user }

PUT /api/users/:id
- Body: { userData }
- Response: { user }

DELETE /api/users/:id
- Response: { success: true }
```

### 7.3 Attendance API
```
GET /api/attendance
- Query: { userId, startDate, endDate }
- Response: { attendance }

POST /api/attendance/check-in
- Body: { locationId, latitude, longitude, photo }
- Response: { attendance }

POST /api/attendance/check-out
- Body: { photo }
- Response: { attendance }

POST /api/attendance
- Body: { attendanceData }
- Response: { attendance }

PUT /api/attendance/:id
- Body: { attendanceData }
- Response: { attendance }

DELETE /api/attendance/:id
- Response: { success: true }
```

### 7.4 Leave API
```
GET /api/leave
- Query: { userId, status, startDate, endDate }
- Response: { leaves }

GET /api/leave/:id
- Response: { leave }

POST /api/leave
- Body: { leaveData }
- Response: { leave }

PUT /api/leave/:id
- Body: { leaveData }
- Response: { leave }

PUT /api/leave/:id/approve
- Body: { approverNotes }
- Response: { leave }

PUT /api/leave/:id/reject
- Body: { rejectionReason }
- Response: { leave }

DELETE /api/leave/:id
- Response: { success: true }
```

### 7.5 Event API
```
GET /api/events
- Query: { page, limit }
- Response: { events, total }

GET /api/events/:id
- Response: { event }

POST /api/events
- Body: { eventData }
- Response: { event }

PUT /api/events/:id
- Body: { eventData }
- Response: { event }

DELETE /api/events/:id
- Response: { success: true }

POST /api/events/:id/register
- Response: { event }

DELETE /api/events/:id/register
- Response: { event }
```

### 7.6 Location API
```
GET /api/locations
- Response: { locations }

GET /api/locations/:id
- Response: { location }

POST /api/locations
- Body: { locationData }
- Response: { location }

PUT /api/locations/:id
- Body: { locationData }
- Response: { location }

DELETE /api/locations/:id
- Response: { success: true }
```

### 7.7 Notification API
```
GET /api/notifications
- Query: { userId, unread }
- Response: { notifications }

POST /api/notifications
- Body: { notificationData }
- Response: { notification }

PUT /api/notifications/:id/read
- Response: { notification }

DELETE /api/notifications/:id
- Response: { success: true }
```

---

## 8. Dependencies & Libraries

### 8.1 Core Dependencies
- **react**: ^19.1.1 - UI Library
- **react-dom**: ^19.1.1 - React DOM Rendering
- **react-router-dom**: ^6.30.1 - Routing Library
- **react-icons**: ^5.5.0 - Icon Library

### 8.2 UI & Styling
- **tailwindcss**: ^3.4.18 - Utility-first CSS Framework
- **tailwind-merge**: ^3.3.1 - Merge Tailwind Classes
- **tailwindcss-animate**: ^1.0.7 - Animation Utilities
- **class-variance-authority**: ^0.7.1 - Component Variant Management
- **clsx**: ^2.1.1 - Conditional Classname
- **@radix-ui/react-slot**: ^1.2.3 - Radix UI Slot Component

### 8.3 Data & Charts
- **recharts**: ^3.3.0 - Charting Library
- **date-fns**: ^4.1.0 - Date Manipulation
- **react-datepicker**: ^8.7.0 - Date Picker Component
- **react-day-picker**: ^9.11.1 - Day Picker Component
- **cally**: ^0.8.0 - Calendar Library

### 8.4 Mapping
- **leaflet**: ^1.9.4 - Mapping Library
- **react-leaflet**: ^5.0.0 - React Wrapper for Leaflet

### 8.5 PDF & Export
- **jspdf**: ^3.0.3 - PDF Generation
- **jspdf-autotable**: ^5.0.2 - PDF Table Generation
- **html2canvas**: ^1.4.1 - HTML to Canvas

### 8.6 Other
- **react-markdown**: ^10.1.0 - Markdown Rendering

### 8.7 Future Dependencies (Phase 2-3)
- **@line/liff**: ^3.0.0 - Line LIFF SDK (เมื่อเชื่อมต่อกับ Line)
- **axios**: ^1.0.0 - HTTP Client สำหรับ API Calls
- **jsonwebtoken**: ^9.0.0 - JWT Token Generation/Verification (Backend)
- **dotenv**: ^16.0.0 - Environment Variables Management
- **cors**: ^2.8.0 - CORS Middleware (Backend)

### 8.8 Dev Dependencies
- **vite**: ^7.1.10 - Build Tool
- **@vitejs/plugin-react**: ^5.0.4 - React Plugin for Vite
- **@vitejs/plugin-basic-ssl**: ^2.1.0 - SSL Plugin for Vite
- **tailwindcss**: ^3.4.18 - Tailwind CSS
- **autoprefixer**: ^10.4.21 - PostCSS Plugin
- **postcss**: ^8.5.6 - CSS Processing
- **eslint**: ^9.36.0 - Code Linting
- **eslint-plugin-react-hooks**: ^5.2.0 - React Hooks Linting
- **eslint-plugin-react-refresh**: ^0.4.22 - React Refresh Linting

---

## 9. File Structure Summary

### 9.1 Project Root Files
```
components.json - Component UI Configuration
eslint.config.js - ESLint Configuration
index.html - HTML Entry Point
jsconfig.json - JavaScript Configuration
package.json - Dependencies & Scripts
postcss.config.js - PostCSS Configuration
README.md - Project Documentation
tailwind.config.js - Tailwind CSS Configuration
vite.config.js - Vite Configuration
```

### 9.2 Public Assets
```
public/images/Logo/ - Logo Images
```

### 9.3 Source Directory
```
src/
├── main.jsx - Entry Point
├── App.jsx - Root Component
├── App.css - Global Styles
├── index.css - Global CSS
├── assets/ - Static Assets
├── components/ - Reusable Components
├── contexts/ - React Contexts
├── data/ - Static Data
├── lib/ - Utility Functions
├── pages/ - Page Components
├── utils/ - Utility Functions
```

### 9.4 Utils Files
```
src/utils/
├── adminUserUtils.js - Admin User Utilities
├── attendanceCalculator.js - Attendance Calculation
├── pdfGenerator.js - PDF Generation
├── thaiFont.js - Thai Font Configuration
└── userPDFGenerator.js - User PDF Generation
```

---

## 10. Development Guidelines

### 10.1 Component Naming
- ใช้ PascalCase สำหรับ Component Name
- ใช้ descriptive names (e.g., UserDashboard, LeaveForm)
- เพิ่ม suffix ตามประเภท (e.g., Screen, Form, Card, Modal)

### 10.2 File Organization
- จัดระเบียบ Components ตามประเภท (admin, user, common, ui)
- จัดระเบียบ Pages ตามเส้นทาง (admin, user, common)
- เก็บ Contexts รวมกันใน contexts folder
- เก็บ Utilities รวมกันใน utils folder

### 10.3 State Management
- ใช้ React Context สำหรับ Global State
- ใช้ useState สำหรับ Local Component State
- สร้าง Custom Hooks เพื่อให้ Code Reusable

### 10.4 Styling
- ใช้ Tailwind CSS Classes เป็นหลัก
- ใช้ responsive prefixes (sm, md, lg, xl)
- ใช้ DaisyUI Components สำหรับ Pre-built Components
- เพิ่ม Custom CSS ใน App.css หากจำเป็น

### 10.5 Error Handling
- ใช้ try-catch สำหรับ API Calls
- แสดง Error Messages ชัดเจน
- ใช้ AlertDialog Component สำหรับ Errors

### 10.6 Performance
- ใช้ Lazy Loading สำหรับ Components ที่หนัก
- ใช้ useMemo สำหรับ Expensive Calculations
- ใช้ useCallback สำหรับ Event Handlers

---

## 11. Testing Requirements

### 11.1 Unit Testing
- Test Components ที่สำคัญ
- Test Utility Functions
- Test Context Providers

### 11.2 Integration Testing
- Test API Integration
- Test User Flows
- Test Routing

### 11.3 E2E Testing
- Test Login Flow
- Test Leave Request Flow
- Test Attendance Check-in Flow

---

## 12. Deployment

### 12.1 Build Process
```bash
npm run build
```
- ใช้ Vite Build Tool
- Output ไปยัง `dist` folder

### 12.2 Environment Variables
```
VITE_API_URL=https://api.easycheck.com
VITE_ENVIRONMENT=production
```

### 12.3 Hosting
- สามารถ Deploy ไปยัง Netlify, Vercel, AWS S3
- ต้องเปิดใช้ HTTPS
- ต้องตั้งค่า CORS ให้ถูกต้อง

---

## 13. Security Considerations

### 13.1 Authentication
- เก็บ JWT Token ใน localStorage หรือ sessionStorage
- ส่ง Token ในทุก API Request
- Refresh Token เมื่อ Token หมดอายุ

### 13.2 Authorization
- ตรวจสอบ Role ก่อน Render Component
- ตรวจสอบ Permissions ก่อน Allow Action
- ใช้ ProtectedRoute Component

### 13.3 Data Protection
- ไม่เก็บข้อมูลที่ละเอียดในหน้า HTML
- ไม่ Log Sensitive Information
- ใช้ HTTPS เสมอ

### 13.4 XSS Prevention
- Sanitize User Input
- Escape HTML Characters
- ใช้ Content Security Policy (CSP)

---

## 14. Known Issues & Future Enhancements

### 14.1 Current Status
- ⚠️ Backend API Server: Not Yet Developed (Planned Phase 2)
- ⚠️ Database: Not Yet Connected (Mock Data Used)
- ⚠️ Line LIFF Integration: Not Yet Integrated (Planned Phase 3)
- ⚠️ Line Message API: Not Yet Integrated (Planned Phase 3)

### 14.2 Known Issues
- Frontend uses Mock/Static Data (ตัวอย่างข้อมูล)
- Authentication currently uses dummy tokens
- No real-time data synchronization
- No offline support yet

### 14.3 Development Roadmap

#### Phase 1: Frontend Development (Current) ✅ In Progress
- Build React Components
- Design UI/UX with Tailwind CSS
- Setup Routing and Navigation
- Mock API Integration
- Testing and Bug Fixes

#### Phase 2: Backend Development (Next) ⏳ Planned
- Design Database Schema
- Develop Node.js/Python Backend
- Implement REST APIs
- Setup JWT Authentication
- Implement Business Logic
- Deploy Backend Server
- Integration Testing

#### Phase 3: Line Integration ⏳ Planned
- Setup Line Official Account
- Implement Line LIFF SDK
- Setup Line Message API
- Create Rich Message Templates
- Webhook Implementation
- Line Payment Integration (Optional)

#### Phase 4: Mobile App Development ⏳ Planned
- React Native or Flutter Development
- Native Features Integration (Camera, GPS)
- App Store/Play Store Deployment

### 14.4 Future Enhancements
- ✨ Line LIFF Integration - เข้าถึงแอปผ่าน Line
- ✨ Line Message API - ส่งแจ้งเตือนผ่าน Line
- ✨ PWA Support - Progressive Web App
- ✨ Offline Mode - ใช้งานแบบ Offline
- ✨ Biometric Authentication - สแกนนิ้วมือ/ใบหน้า
- ✨ Push Notifications - แจ้งเตือนแบบ Push
- ✨ Multi-language Support - รองรับหลายภาษา (ปัจจุบันเป็นภาษาไทยเท่านั้น)
- ✨ Dark Mode - โหมดมืด
- ✨ Advanced Reporting - รายงานเบิกรายได้
- ✨ HR System Integration - เชื่อมต่อกับระบบ HR
- ✨ Mobile App - แอปพลิเคชันบน iOS/Android
- ✨ Real-time Notifications - แจ้งเตือนแบบ Real-time
- ✨ Geofencing - ตรวจสอบพื้นที่อัตโนมัติ

---

## 15. References & Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vite.dev)
- [Leaflet Documentation](https://leafletjs.com)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)

---

**Document Version**: 1.0
**Last Updated**: October 24, 2025
**Author**: Development Team
**Status**: Active

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| JWT | JSON Web Token - เครื่องมือสำหรับ Authentication |
| RBAC | Role-Based Access Control - ระบบควบคุมการเข้าถึงตามบทบาท |
| API | Application Programming Interface - อินเตอร์เฟซสำหรับสื่อสารระหว่างแอปพลิเคชัน |
| Component | ส่วนของ React ที่ทำซ้ำได้ |
| Context | React API สำหรับจัดการ Global State |
| Router | ระบบจัดการเส้นทาง (Routes) ในแอปพลิเคชัน |
| Hook | ฟังก์ชัน React ที่ใช้ในการจัดการ State และ Effects |

---

## Appendix B: Acronyms

| Acronym | Full Form |
|---------|-----------|
| SRS | Software Requirements Specification |
| UI | User Interface |
| UX | User Experience |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| PERF | Performance |
| SEC | Security |
| USAB | Usability |
| MAINT | Maintainability |
| COMPAT | Compatibility |
| XSS | Cross-Site Scripting |
| CSRF | Cross-Site Request Forgery |
| HTTPS | Hypertext Transfer Protocol Secure |
| CORS | Cross-Origin Resource Sharing |
| HTML | Hypertext Markup Language |
| CSS | Cascading Style Sheets |
| PDF | Portable Document Format |
| CSV | Comma-Separated Values |
| PWA | Progressive Web App |

---

## Appendix C: Line Integration Details

### Line LIFF (Line Front-end Framework) Integration

#### C.1 Line LIFF Setup Overview
```javascript
// ตัวอย่างการใช้งาน Line LIFF (ในอนาคต)
import liff from '@line/liff';

// Initialize LIFF
liff.init({
  liffId: 'YOUR_LIFF_ID_HERE'
}).then(() => {
  if (liff.isLoggedIn()) {
    // Get user profile
    liff.getProfile().then(profile => {
      console.log(profile.userId);
      console.log(profile.displayName);
      console.log(profile.pictureUrl);
    });
  } else {
    // Redirect to Line Login
    liff.login();
  }
});
```

#### C.2 Line Message API Integration
```javascript
// ตัวอย่างการส่ง Push Message (Backend)
const sendNotification = async (userId, message) => {
  await lineClient.pushMessage(userId, {
    type: 'flex',
    altText: 'Notification from EasyCheck',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'EasyCheck Notification',
            weight: 'bold',
            size: 'xl'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: message,
            wrap: true
          }
        ]
      }
    }
  });
};
```

#### C.3 Line Webhook Configuration (Backend)
```
POST /webhook
Content-Type: application/json

{
  "events": [
    {
      "type": "message",
      "timestamp": 1234567890,
      "source": {
        "type": "user",
        "userId": "U1234567890abcdef1234567890abcdef"
      },
      "replyToken": "nHuyWiB7yP5Zw52FIkcQT",
      "message": {
        "type": "text",
        "id": "1234567890",
        "text": "Hello, world!"
      }
    }
  ]
}
```

#### C.4 Line Rich Message Templates

**Template 1: Leave Approval Notification**
```json
{
  "type": "bubble",
  "header": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "ผลการอนุมัติการลา",
        "weight": "bold",
        "size": "xl",
        "color": "#22C55E"
      }
    ]
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "ประเภท: ลาพักร้อน",
        "size": "sm"
      },
      {
        "type": "text",
        "text": "วันที่: 2025-10-25 ถึง 2025-10-27",
        "size": "sm"
      },
      {
        "type": "text",
        "text": "จำนวนวัน: 3 วัน",
        "size": "sm"
      },
      {
        "type": "text",
        "text": "สถานะ: อนุมัติแล้ว ✓",
        "size": "sm",
        "color": "#22C55E",
        "weight": "bold"
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "button",
        "action": {
          "type": "uri",
          "label": "ดูรายละเอียด",
          "uri": "https://easycheck.com/user/leave/detail/123"
        }
      }
    ]
  }
}
```

**Template 2: Daily Attendance Report**
```json
{
  "type": "bubble",
  "header": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "รายงานการเข้าออกงาน",
        "weight": "bold",
        "size": "xl",
        "color": "#48CBFF"
      }
    ]
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "วันที่: 25 ตุลาคม 2568",
        "size": "sm",
        "weight": "bold"
      },
      {
        "type": "separator"
      },
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "text": "เช็คอิน:",
            "size": "sm",
            "flex": 3
          },
          {
            "type": "text",
            "text": "08:45 AM",
            "size": "sm",
            "flex": 2,
            "color": "#22C55E",
            "weight": "bold"
          }
        ]
      },
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "text": "เช็คเอาท์:",
            "size": "sm",
            "flex": 3
          },
          {
            "type": "text",
            "text": "17:30 PM",
            "size": "sm",
            "flex": 2,
            "color": "#3AB4E8",
            "weight": "bold"
          }
        ]
      },
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "text": "ชั่วโมงการทำงาน:",
            "size": "sm",
            "flex": 3
          },
          {
            "type": "text",
            "text": "8 ชั่วโมง 45 นาที",
            "size": "sm",
            "flex": 2,
            "weight": "bold"
          }
        ]
      }
    ]
  }
}
```

#### C.5 Line Login Configuration
```javascript
// Line Login with Redirect
const lineLoginURL = `https://access.line.me/oauth2/v2.1/authorization?
  response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://easycheck.com/callback
  &state=RANDOM_STATE
  &scope=profile%20openid`;
```

#### C.6 Notification Types via Line
1. **Leave Request Status** - ส่งเมื่อการลาถูกอนุมัติ/ปฏิเสธ
2. **Daily Report** - ส่งทุกเย็น 5 โมง
3. **Event Reminder** - ส่ง 1 ชั่วโมงก่อนเหตุการณ์
4. **Late Warning** - ส่งเมื่อพบว่าพนักงานมาสายกว่า 15 นาที
5. **Absent Alert** - ส่งเมื่อพนักงานไม่มาโดยไม่ลา
6. **Announcement** - ส่งประกาศทั่วไปจาก Admin
7. **Team Report** - ส่งรายงานทีมประจำสัปดาห์
8. **Birthday Reminder** - ส่งเตือนวันเกิดของสมาชิกทีม

---

## Appendix D: Implementation Timeline

### Phase 1: Frontend Development (Now - November 2025)
- ✅ Component Development
- ✅ UI/UX Design Implementation
- ✅ Routing Setup
- ✅ Mock Data Integration
- 🔄 Testing & Bug Fixes

### Phase 2: Backend Development (December 2025 - February 2026)
- 🔄 Database Design
- 🔄 API Development
- 🔄 Authentication Implementation
- 🔄 Integration Testing
- 🔄 Deployment

### Phase 3: Line Integration (March 2026 - April 2026)
- ⏳ Line Official Account Setup
- ⏳ LIFF Integration
- ⏳ Message API Setup
- ⏳ Rich Template Development
- ⏳ UAT Testing

### Phase 4: Production Deployment (May 2026+)
- ⏳ Performance Optimization
- ⏳ Security Audit
- ⏳ Documentation
- ⏳ User Training
- ⏳ Go-Live

---

**Document Version**: 1.1
**Last Updated**: October 24, 2025
**Author**: Development Team
**Status**: Active (Phase 1 - In Progress)

---

**End of Document**
