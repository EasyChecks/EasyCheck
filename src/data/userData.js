// Shared User Data
const userData = {
  // ข้อมูลพื้นฐาน
  id: 1,
  name: "เอกชาติ รัตนา (Mr. Apichart Rattana)",
  position: "เจ้าหน้าที่คนดำ",
  department: "JUBJUB",
  profilePic: "/images/niggatron.jpg",
  status: "ปฏิบัติงาน",
  // Get role from logged in user
  get role() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.role || 'user';
    } catch {
      return 'user';
    }
  },

  // ข้อมูลส่วนตัว
  personalInfo: {
    birthDate: "2 ธันวาคม 2530",
    age: "38 ปี",
    address: "18/25 หมู่ 10 ตำบลบุรมณฑ์ 77 แขวงคลองขาน กรุงเทพฯ 10250",
    phone: "091-432-5643",
    email: "apichart.rat@email.com",
    maritalStatus: "โสด",
    idCard: "1-1002-43657-22-4"
  },

  // ข้อมูลการทำงาน
  workInfo: {
    position: "พัฒนากร วิศวกรรมคอมพิวเตอร์สาขาจุดใจ (Senior Software Engineer)",
    workplace: "AE 0478",
    employeeId: "AR0478 Apichart",
    department: "แผนกพัฒนาซอฟต์แวร์ (Software Development)",
    startDate: "1 ตุลาคม 2568",
    education: "ปริญญาตรี วิชาวิศวกรรมซอฟต์แวร์คอมพิวเตอร์ จากมหาวิทยาลัย K",
    workHistory: "U. ABC Tech (2560-2568) ตำแหน่ง Software Developer",
    skills: "ทักษะด้านทำงานระยะมาว",
    benefits: "ประกันสังคม, กองทุนสำรองเลี้ยงชีพ (ส่ง 5%)"
  },

  // ข้อมูลสุขภาพ
  healthInfo: {
    medicalHistory: "ปกติ (ตรวจล่าสุด 2568)",
    bloodType: "B",
    socialSecurity: "123-4-XXXXX-9 สบทร M",
    salary: "65,000 บาท (เมื่อทุกเดือน)"
  },

  // ข้อมูลเพิ่มเติม
  additionalInfo: {
    attendance: "ลาป่วย 4 วัน / ลากิจ 0 วัน / มาสาย 1 ครั้ง (ตรวจล่าสุด)",
    performance: "ผ่านการประเมินงาน : ระดับดีมาก (A)",
    disciplinary: "ไม่เคยมีประวัติการลงโทษ"
  },

  // ข้อมูลบริษัท
  companyInfo: {
    name: "Pineapple Solutions Co., Ltd.",
    address: "88 อาคารดีทัค ทาวเวอร์ 2 ยูนิต 1507 ชั้น 15 ถ.เทคโนโลยี แขวง บางเขน เขตบางเขน กรุงเทพมหานคร 10220",
    callCenter: "02-456-7890",
    email: "contact@pineapplesolutions.com"
  }
};

export default userData;
