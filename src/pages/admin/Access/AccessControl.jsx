// นำเข้า React และคอมโพเนนต์/ฮุกที่ทีมใช้อยู่
import React from "react";
import Button from "@/components/ui/button"; // ปุ่มกลางของระบบ (มี variant ให้เลือก)
import useAuth from "@/contexts/useAuth"; // ฮุกดึงข้อมูลจาก AuthContext กลางของแอป
import { useNavigate } from "react-router-dom"; // ใช้สำหรับนำทางหลัง login/logout

function AccessControl() {
  // ดึงสถานะและเมธอดจาก AuthContext
  // - user: ข้อมูลผู้ใช้ปัจจุบัน (เช่น name, role)
  // - isAuthenticated: true/false ว่าล็อกอินอยู่ไหม
  // - login(userData): ฟังก์ชันตั้งค่าผู้ใช้และบันทึกลง localStorage
  // - logout(): ฟังก์ชันล้างสถานะผู้ใช้
  const { user, isAuthenticated, login, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  // ฟังก์ชันตัวอย่างสำหรับเข้าสู่ระบบด้วย role ต่าง ๆ
  // หมายเหตุ: ProtectedRoute จะใช้ role นี้เพื่ออนุญาต/ปฏิเสธการเข้าถึงหน้า
  const handleLoginAdmin = () => {
    const role = "admin";
    login({ id: "demo-admin", name: "Demo Admin", role });
    // นำทางไปยัง dashboard ตาม role
    const to = getDashboardPath ? getDashboardPath(role) : "/admin";
    navigate(to, { replace: true });
  };

  const handleLoginUser = () => {
    const role = "user";
    login({ id: "demo-user", name: "Demo User", role });
    // นำทางไปยัง dashboard ตาม role
    const to = getDashboardPath ? getDashboardPath(role) : "/user/dashboard";
    navigate(to, { replace: true });
  };

  const handleLogout = () => {
    logout();
    // หลังออกจากระบบ พากลับไปหน้าเข้าสู่ระบบ
    navigate("/auth", { replace: true });
  };

  return (
    // การ์ดหลักของหน้า (ให้สอดคล้องกับสไตล์ส่วนอื่น ๆ ของแอป)
    <div className="font-prompt max-w-md mx-auto bg-white rounded-2xl shadow-md p-6">
      {/* หัวข้อหน้าและไอคอน */}
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span>🔐</span>
        ระบบควบคุมสิทธิ์การเข้าถึง
      </h2>

      {/* ส่วนแสดงสถานะการเข้าสู่ระบบปัจจุบัน */}
      <div className="mt-3 text-gray-700">
        <span>สถานะปัจจุบัน: </span>
        {isAuthenticated ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-700 px-3 py-1 text-sm font-medium">
            ✅ {user?.name || "ผู้ใช้"} ({user?.role})
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            ยังไม่ได้เข้าสู่ระบบ
          </span>
        )}
      </div>

      {/* ปุ่มควบคุมการเข้าถึง: เลือกล็อกอินเป็น Admin/User หรือออกจากระบบ */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={handleLoginAdmin}
          aria-label="login-admin"
          disabled={isAuthenticated} // ปิดปุ่มเมื่อกำลังล็อกอินแล้ว
        >
          เข้าสู่ระบบ (Admin)
        </Button>
        <Button
          variant="primary"
          onClick={handleLoginUser}
          aria-label="login-user"
          disabled={isAuthenticated} // ปิดปุ่มเมื่อกำลังล็อกอินแล้ว
        >
          เข้าสู่ระบบ (User)
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          aria-label="logout"
          disabled={!isAuthenticated} // ปิดปุ่มเมื่อยังไม่ได้ล็อกอิน
          className="text-red-600 hover:text-red-700" // สีแดงเพื่อเน้นการออกจากระบบ
        >
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}

export default AccessControl;