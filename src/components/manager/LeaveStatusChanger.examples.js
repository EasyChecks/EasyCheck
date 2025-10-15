/**
 * LeaveStatusChanger Component - Usage Examples
 * 
 * Component สำหรับเปลี่ยนสถานะการลา พร้อม dropdown menu
 * เหมาะสำหรับ Manager Dashboard หรือหน้าที่ต้องการจัดการสถานะการลา
 */

// ====================================
// Example 1: Basic Usage
// ====================================
import LeaveStatusChanger from '@/components/manager/LeaveStatusChanger'

function LeaveDetailPage() {
    const leaveData = {
        id: 1,
        leaveType: 'ลาป่วย',
        status: 'รออนุมัติ',
        statusColor: 'yellow',
        // ... other fields
    }

    return (
        <div>
            <LeaveStatusChanger leaveData={leaveData} />
        </div>
    )
}

// ====================================
// Example 2: With Callback Function
// ====================================
function LeaveDetailWithCallback() {
    const [leaveData, setLeaveData] = useState({
        id: 1,
        status: 'รออนุมัติ',
        statusColor: 'yellow',
    })

    const handleStatusChanged = (newStatus, newStatusColor) => {
        console.log('Status changed to:', newStatus)
        
        // Update local state
        setLeaveData(prev => ({
            ...prev,
            status: newStatus,
            statusColor: newStatusColor
        }))
        
        // You can also navigate or do other things
        // navigate('/manager/dashboard')
    }

    return (
        <div>
            <LeaveStatusChanger 
                leaveData={leaveData}
                onStatusChanged={handleStatusChanged}
            />
        </div>
    )
}

// ====================================
// Example 3: With Cancel Button
// ====================================
function LeaveDetailWithCancel() {
    const leaveData = {
        id: 1,
        status: 'รออนุมัติ',
        // ... other fields
    }

    const handleStatusChanged = (newStatus, newStatusColor) => {
        if (newStatus === 'cancelled') {
            // Leave was cancelled, navigate back
            navigate(-1)
        } else {
            // Status was changed
            console.log('New status:', newStatus)
        }
    }

    return (
        <div>
            <LeaveStatusChanger 
                leaveData={leaveData}
                onStatusChanged={handleStatusChanged}
                showCancelButton={true}  // Show cancel button
            />
        </div>
    )
}

// ====================================
// Example 4: In Manager Dashboard
// ====================================
function ManagerDashboard() {
    const { leaveList } = useLeave()
    const [selectedLeave, setSelectedLeave] = useState(null)

    return (
        <div>
            {/* Leave List */}
            {leaveList.map(leave => (
                <div key={leave.id} onClick={() => setSelectedLeave(leave)}>
                    {leave.leaveType} - {leave.status}
                </div>
            ))}

            {/* Modal with Status Changer */}
            {selectedLeave && (
                <div className="modal">
                    <h2>จัดการการลา</h2>
                    <LeaveStatusChanger 
                        leaveData={selectedLeave}
                        onStatusChanged={(status) => {
                            console.log('Status updated:', status)
                            setSelectedLeave(null) // Close modal
                        }}
                    />
                </div>
            )}
        </div>
    )
}

// ====================================
// Example 5: With Custom CSS
// ====================================
function CustomStyledPage() {
    return (
        <div className="p-4">
            <LeaveStatusChanger 
                leaveData={leaveData}
                className="max-w-md mx-auto"  // Add custom classes
            />
        </div>
    )
}

// ====================================
// Props Reference
// ====================================
/**
 * @param {Object} leaveData - ข้อมูลการลา (required)
 *   - id: number (required) - ID ของการลา
 *   - status: string - สถานะปัจจุบัน
 *   - statusColor: string - สีของสถานะ
 *   - ... other fields
 * 
 * @param {Function} onStatusChanged - Callback เมื่อเปลี่ยนสถานะสำเร็จ (optional)
 *   - Parameters: (newStatus: string, newStatusColor: string)
 *   - newStatus: 'รออนุมัติ' | 'อนุมัติ' | 'ไม่อนุมัติ' | 'cancelled'
 *   - newStatusColor: 'yellow' | 'green' | 'red' | 'gray'
 * 
 * @param {string} className - CSS classes เพิ่มเติม (optional)
 * 
 * @param {boolean} showCancelButton - แสดงปุ่มยกเลิกการลาหรือไม่ (optional, default: false)
 *   - จะแสดงเฉพาะเมื่อ status === 'รออนุมัติ'
 */

export default LeaveStatusChanger
