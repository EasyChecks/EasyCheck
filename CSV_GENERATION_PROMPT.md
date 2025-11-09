# CSV Generation Prompt for ChatGPT

## คำแนะนำสำหรับการสร้างไฟล์ CSV พนักงาน

### โครงสร้างข้อมูล CSV ที่ต้องการ

กรุณาสร้างไฟล์ CSV สำหรับระบบ EasyCheck ตามโครงสร้างดังนี้:

```csv
name,email,phone,department,role,birthDate,status,address,position,nationalId,age,employeeId,bloodType,salary,idCardNumber,passportNumber,password,username,branch,emergencyContactName,emergencyContactPhone,emergencyContactRelation
```

### คำอธิบายแต่ละ Field:

1. **name** - ชื่อ-นามสกุล (เช่น "สมชาย ใจดี")
2. **email** - อีเมล์ (เช่น "somchai@example.com")
3. **phone** - เบอร์โทร (เช่น "081-234-5678")
4. **department** - แผนก (เช่น "HR", "IT", "Marketing", "Finance", "Operations")
5. **role** - บทบาท (user, manager, admin, superadmin)
6. **birthDate** - วันเกิด (รูปแบบ DD/MM/YYYY เช่น "15/03/1990")
7. **status** - สถานะพนักงาน (active, leave, suspended, pending)
8. **address** - ที่อยู่เต็มรูปแบบ
9. **position** - ตำแหน่งงาน (เช่น "Developer", "Manager", "HR Specialist")
10. **nationalId** - รหัสบัตรประชาชน (13 หลัก)
11. **age** - อายุ (ตัวเลข)
12. **employeeId** - รหัสพนักงาน (รูปแบบ: [สาขา][เลข 6 หลัก] เช่น "BKK101001")
13. **bloodType** - กรุ๊ปเลือด (A, B, AB, O)
14. **salary** - เงินเดือน (ตัวเลข)
15. **idCardNumber** - หมายเลขบัตรประชาชน (13 หลัก)
16. **passportNumber** - หมายเลข passport (ถ้ามี)
17. **password** - รหัสผ่าน (ค่าเริ่มต้นแนะนำ "password123")
18. **username** - ชื่อผู้ใช้ (ค่าเริ่มต้นใช้ employeeId)
19. **branch** - **สาขา (สำคัญ!) ต้องเป็นหนึ่งใน: BKK, CNX, PKT เท่านั้น**
20. **emergencyContactName** - ชื่อผู้ติดต่อฉุกเฉิน
21. **emergencyContactPhone** - เบอร์ผู้ติดต่อฉุกเฉิน
22. **emergencyContactRelation** - ความสัมพันธ์ (เช่น "พ่อ", "แม่", "คู่สมรส", "พี่ชาย")

### ⚠️ ข้อกำหนดสำคัญ - สาขา (Branch)

**สาขาที่อนุญาต (เท่านั้น):**
- **BKK** - กรุงเทพมหานคร
- **CNX** - เชียงใหม่
- **PKT** - ภูเก็ต

**หากใส่รหัสสาขาที่ไม่ถูกต้อง:**
```
❌ ERROR: ไม่พบสาขา "[ชื่อสาขาที่ผิด]"
✅ กรุณาใช้เฉพาะ: BKK, CNX, PKT
```

### รูปแบบรหัสพนักงาน (employeeId):

- **BKK** + 6 หลัก เช่น BKK101001, BKK101002
- **CNX** + 6 หลัก เช่น CNX201001, CNX201002
- **PKT** + 6 หลัก เช่น PKT301001, PKT301002

### ตัวอย่างข้อมูล CSV:

```csv
name,email,phone,department,role,birthDate,status,address,position,nationalId,age,employeeId,bloodType,salary,idCardNumber,passportNumber,password,username,branch,emergencyContactName,emergencyContactPhone,emergencyContactRelation
สมชาย ใจดี,somchai@example.com,081-234-5678,IT,user,15/03/1990,active,"123 ถนนสุขุมวิท แขวงคลองเตย กรุงเทพฯ 10110",Senior Developer,1234567890123,34,BKK101001,O,45000,1234567890123,AB1234567,password123,BKK101001,BKK,นางสาว จันทร์ ใจดี,081-111-2222,แม่
สมหญิง รักสันติ,somying@example.com,082-345-6789,HR,manager,20/07/1988,active,"456 ถนนนิมมานเหมินทร์ เชียงใหม่ 50200",HR Manager,9876543210987,36,CNX201001,A,50000,9876543210987,CD9876543,password123,CNX201001,CNX,นาย ดี รักสันติ,082-222-3333,สามี
ประยุทธ์ มั่นคง,prayut@example.com,083-456-7890,Finance,user,10/12/1992,active,"789 ถนนราษฎร์อุทิศ ภูเก็ต 83000",Accountant,1122334455667,31,PKT301001,B,40000,1122334455667,,password123,PKT301001,PKT,นาง สมจิตร มั่นคง,083-333-4444,คู่สมรส
```

### วิธีใช้ Prompt นี้:

1. คัดลอก prompt ทั้งหมด
2. ส่งให้ ChatGPT พร้อมระบุจำนวนพนักงานที่ต้องการ
3. ตรวจสอบว่าทุก record มี **branch เป็น BKK, CNX, หรือ PKT** เท่านั้น
4. Save ไฟล์เป็น `.csv` encoding UTF-8
5. Import เข้าระบบผ่านหน้า "จัดการผู้ใช้"

### Validation Rules:

- ✅ branch ต้องเป็น BKK, CNX, PKT เท่านั้น
- ✅ employeeId ต้องขึ้นต้นด้วยรหัสสาขาที่ถูกต้อง
- ✅ email ต้องมีรูปแบบที่ถูกต้อง
- ✅ phone ต้องเป็นเบอร์โทรศัพท์ไทย
- ✅ nationalId และ idCardNumber ต้องเป็น 13 หลัก
- ✅ age ต้องสอดคล้องกับ birthDate

---

## ตัวอย่างคำสั่งส่งไปยัง ChatGPT:

```
สร้างไฟล์ CSV สำหรับพนักงาน 20 คน โดยใช้โครงสร้างตาม CSV_GENERATION_PROMPT.md
- สาขา BKK: 10 คน
- สาขา CNX: 5 คน
- สาขา PKT: 5 คน
- มีทั้ง role: user, manager, admin
- status ส่วนใหญ่เป็น active
```
