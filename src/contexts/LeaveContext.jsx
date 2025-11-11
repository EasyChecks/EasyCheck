import React, { createContext, useContext, useState, useEffect } from 'react';
import { leaveData as initialLeaveList } from '../data/usersData'; // Import from centralized data

const LeaveContext = createContext();

export const useLeave = () => {
    const context = useContext(LeaveContext);
    if (!context) {
        throw new Error('useLeave must be used within a LeaveProvider');
    }
    return context;
};

export const LeaveProvider = ({ children }) => {
    // Load from localStorage or use initial data
    const [leaveList, setLeaveList] = useState(() => {
        const saved = localStorage.getItem('leaveList');
        return saved ? JSON.parse(saved) : initialLeaveList;
    });

    // Leave quota data
    const [leaveQuota] = useState({
        'ลาป่วย': { totalDays: 60 },
        'ลากิจ': { totalDays: 45 },
        'ลาพักร้อน': { totalDays: 10 },
        'ลาคลอด': { totalDays: 90 }
    });

    // Late arrival list - separate from leave list
    const [lateArrivalList, setLateArrivalList] = useState(() => {
        const saved = localStorage.getItem('lateArrivalList');
        return saved ? JSON.parse(saved) : [];
    });

    // Save late arrival list to localStorage
    useEffect(() => {
        localStorage.setItem('lateArrivalList', JSON.stringify(lateArrivalList));
    }, [lateArrivalList]);

    // Save to localStorage whenever leaveList changes
    useEffect(() => {
        localStorage.setItem('leaveList', JSON.stringify(leaveList));
    }, [leaveList]);

    // 🔥 Real-time sync - Listen to storage changes from other tabs/components
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'leaveList' && e.newValue) {
                console.log('📢 LeaveContext: Storage changed, syncing leaveList...');
                const newList = JSON.parse(e.newValue);
                setLeaveList(newList);
            }
        };

        const handleLeaveRequestCreated = () => {
            console.log('📢 LeaveContext: New leave request, reloading from localStorage...');
            const saved = localStorage.getItem('leaveList');
            if (saved) {
                setLeaveList(JSON.parse(saved));
            }
        };

        const handleLeaveStatusUpdated = () => {
            console.log('📢 LeaveContext: Leave status updated, reloading from localStorage...');
            const saved = localStorage.getItem('leaveList');
            if (saved) {
                setLeaveList(JSON.parse(saved));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('leaveRequestCreated', handleLeaveRequestCreated);
        window.addEventListener('leaveStatusUpdated', handleLeaveStatusUpdated);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('leaveRequestCreated', handleLeaveRequestCreated);
            window.removeEventListener('leaveStatusUpdated', handleLeaveStatusUpdated);
        };
    }, []);

    // Calculate days used for each leave type
    const getUsedDays = (leaveType) => {
        return leaveList
            .filter(leave => leave.leaveType === leaveType && leave.status === 'อนุมัติ')
            .reduce((total, leave) => {
                const days = parseInt(leave.days) || 0;
                return total + days;
            }, 0);
    };

    // Calculate number of days between two dates
    const calculateDays = (startDate, endDate) => {
        const start = new Date(startDate.split('/').reverse().join('-'));
        const end = new Date(endDate.split('/').reverse().join('-'));
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Format period string
    const formatPeriod = (startDate, endDate, startTime, endTime) => {
        if (startTime && endTime) {
            // Hourly leave format
            return `${startDate} (${startTime} - ${endTime})`;
        }
        if (startDate === endDate) {
            return startDate;
        }
        return `${startDate} → ${endDate}`;
    };

    // Add new leave request
    const addLeave = (leaveData) => {
        let days, period;
        
        if (leaveData.leaveMode === 'hourly') {
            // Hourly leave
            const [startHour, startMin] = leaveData.startTime.split(':').map(Number);
            const [endHour, endMin] = leaveData.endTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            const diffMinutes = endMinutes - startMinutes;
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            
            days = minutes > 0 ? `${hours} ชม. ${minutes} นาที` : `${hours} ชั่วโมง`;
            period = formatPeriod(leaveData.startDate, leaveData.endDate, leaveData.startTime, leaveData.endTime);
        } else {
            // Full day leave
            days = `${calculateDays(leaveData.startDate, leaveData.endDate)} วัน`;
            period = formatPeriod(leaveData.startDate, leaveData.endDate);
        }
        
        const newLeave = {
            id: Date.now(),
            leaveType: leaveData.leaveType,
            days: days,
            category: leaveData.leaveType,
            period: period,
            startDate: leaveData.startDate,
            endDate: leaveData.endDate,
            startTime: leaveData.startTime || null,
            endTime: leaveData.endTime || null,
            leaveMode: leaveData.leaveMode || 'fullday',
            reason: leaveData.reason,
            status: 'รออนุมัติ',
            statusColor: 'yellow',
            documents: leaveData.documents || []
        };
        setLeaveList(prev => [newLeave, ...prev]);
        
        // 🔥 Real-time notification - Trigger event ทันทีที่มีการขอลา
        window.dispatchEvent(new CustomEvent('leaveRequestCreated', {
            detail: { leave: newLeave }
        }));
        
        // 🔥 Trigger storage event สำหรับ cross-tab
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'leaveList',
            newValue: JSON.stringify([newLeave, ...leaveList]),
            url: window.location.href
        }));
        
        return newLeave;
    };

    // Add late arrival request
    const addLateArrival = (lateArrivalData) => {
        const [startHour, startMin] = lateArrivalData.startTime.split(':').map(Number);
        const [endHour, endMin] = lateArrivalData.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const diffMinutes = endMinutes - startMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        const duration = minutes > 0 ? `${hours} ชม. ${minutes} นาที` : `${hours} ชั่วโมง`;
        const period = formatPeriod(lateArrivalData.date, lateArrivalData.date, lateArrivalData.startTime, lateArrivalData.endTime);

        const newLateArrival = {
            id: Date.now(),
            leaveType: 'ขอเข้างานสาย',
            days: duration,
            category: 'ขอเข้างานสาย',
            period: period,
            startDate: lateArrivalData.date,
            endDate: lateArrivalData.date,
            startTime: lateArrivalData.startTime,
            endTime: lateArrivalData.endTime,
            reason: lateArrivalData.reason,
            status: 'รออนุมัติ',
            statusColor: 'yellow',
            documents: lateArrivalData.documents || []
        };
        
        setLateArrivalList(prev => [newLateArrival, ...prev]);
        return newLateArrival;
    };

    // Update leave request
    const updateLeave = (id, updates) => {
        setLeaveList(prev => prev.map(leave => 
            leave.id === id ? { ...leave, ...updates } : leave
        ));
    };

    // Delete leave request
    const deleteLeave = (id) => {
        setLeaveList(prev => prev.filter(leave => leave.id !== id));
    };

    // Cancel leave request (only for pending status)
    const cancelLeave = (id) => {
        const leave = leaveList.find(l => l.id === id);
        if (leave && leave.status === 'รออนุมัติ') {
            deleteLeave(id);
            return true;
        }
        // Also check in late arrival list
        const lateArrival = lateArrivalList.find(l => l.id === id);
        if (lateArrival && lateArrival.status === 'รออนุมัติ') {
            setLateArrivalList(prev => prev.filter(item => item.id !== id));
            return true;
        }
        return false;
    };

    // Get leave summary for dashboard
    const getLeaveSummary = () => {
        return Object.keys(leaveQuota).map(type => ({
            title: type,
            description: getLeaveDescription(type),
            daysUsed: getUsedDays(type),
            totalDays: leaveQuota[type].totalDays,
            rules: getLeaveRules(type)
        }));
    };

    // Get leave description
    const getLeaveDescription = (type) => {
        const descriptions = {
            'ลาป่วย': 'ลาป่วยไม่เกิน 60 วัน/ปี กรณีลาป่วยตั้งแต่ 3 วันขึ้นไป จำเป็นต้องมีใบรับรองแพทย์',
            'ลากิจ': 'ปีแรกลาได้ไม่เกิน 15 วัน/ปี ปีถัดไปลาได้ไม่เกิน 45 วัน/ปี ต้องได้รับอนุมัติก่อน',
            'ลาพักร้อน': 'ลาได้ไม่เกิน 10 วัน/ปี สะสมได้ไม่เกิน 20 วัน',
            'ลาคลอด': 'ลาคลอดบุตรได้ไม่เกิน 90 วัน ไม่จำเป็นต้องมีใบรับรองแพทย์'
        };
        return descriptions[type] || '';
    };

    // Get leave rules
    const getLeaveRules = (type) => {
        const rules = {
            'ลาป่วย': [
                'ลาป่วยได้ไม่เกิน 60 วัน/ปี',
                'กรณีลาป่วยตั้งแต่ 3 วันขึ้นไป จำเป็นต้องมีใบรับรองแพทย์',
                'ยื่นใบลาป่วยทันทีที่กลับมาทำงานวันแรก',
                'กรณีแพทย์นัดล่วงหน้า ให้ยื่นใบลาป่วยก่อนถึงวันนัดหมาย'
            ],
            'ลากิจ': [
                'สำหรับปีแรกที่เข้ารับราชการ ลากิจได้ไม่เกิน 15 วัน/ปี',
                'ในปีถัดๆ ไป ลากิจได้ไม่เกิน 45 วัน/ปี',
                'ในกรณีลาเพื่อเลี้ยงบุตร สามารถใช้สิทธิต่อจากการลาคลอดบุตร ได้ไม่เกิน 150 วัน',
                'จำเป็นต้องได้รับการอนุมัติจากผู้บังคับบัญชาก่อน จึงจะสามารถใช้วันลากิจส่วนตัวได้',
                'กรณีงานมีเหตุฉุกเฉิน สามารถเรียกตัวกลับได้ทุกเมื่อ'
            ],
            'ลาพักร้อน': [
                'ลาได้ไม่เกิน 10 วัน/ปี หากบรรจุเป็นราชการไม่ครบ 6 เดือน ไม่ได้รับสิทธิ์ลาพักผ่อน',
                'สะสมวันลาได้ไม่เกิน 20 วัน',
                'จำเป็นต้องได้รับการอนุมัติจากผู้บังคับบัญชาก่อน จึงจะสามารถใช้วันลาพักผ่อนได้',
                'กรณีงานมีเหตุฉุกเฉิน สามารถเรียกตัวกลับได้ทุกเมื่อ'
            ],
            'ลาคลอด': [
                'ลาคลอดบุตรได้ไม่เกิน 90 วัน',
                'ไม่จำเป็นต้องมีใบรับรองแพทย์',
                'ยื่นใบลาคลอดบุตรล่วงหน้า หรือในวันลา เพื่อเสนอต่อผู้บังคับบัญชาให้ทำการอนุมัติตามลำดับ'
            ],
            'ขอเข้างานสาย': [
                'สามารถขอเข้างานสายได้เฉพาะกรณีเจอเหตุสุดวิสัยในระหว่างมาทำงาน',
                'ต้องระบุเหตุผลที่ชัดเจนและสมเหตุสมผล',
                'ควรแนบรูปภาพหลักฐานประกอบการพิจารณา (ถ้ามี)',
                'วันที่ขอจะถูกล็อคเป็นวันปัจจุบันเท่านั้น',
                'ต้องได้รับการอนุมัติจากผู้บังคับบัญชา'
            ]
        };
        return rules[type] || [];
    };

    // Get leaves by type
    const getLeavesByType = (leaveType) => {
        if (!leaveType) return leaveList;
        return leaveList.filter(leave => leave.leaveType === leaveType);
    };

    // ฟังก์ชันสำหรับ Manager - เปลี่ยนสถานะลาโดยตรง
    const updateLeaveStatus = (id, newStatus) => {
        console.log('LeaveContext - Updating leave status:', { id, newStatus })
        
        const statusColors = {
            'รออนุมัติ': 'yellow',
            'อนุมัติ': 'green',
            'ไม่อนุมัติ': 'red'
        };
        
        setLeaveList(prev => {
            const updated = prev.map(leave => {
                if (leave.id === id) {
                    const updatedLeave = {
                        ...leave,
                        status: newStatus,
                        statusColor: statusColors[newStatus] || 'yellow'
                    };
                    console.log('Updated leave:', updatedLeave)
                    
                    // 🔥 Real-time notification - Trigger event ทันทีที่มีการอนุมัติ/ไม่อนุมัติ
                    window.dispatchEvent(new CustomEvent('leaveStatusUpdated', {
                        detail: { leave: updatedLeave, oldStatus: leave.status, newStatus }
                    }));
                    
                    return updatedLeave;
                }
                return leave;
            });
            console.log('All leaves after update:', updated)
            
            // 🔥 Trigger storage event สำหรับ cross-tab
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'leaveList',
                newValue: JSON.stringify(updated),
                url: window.location.href
            }));
            
            return updated;
        });
    };

    // Validate leave request against rules
    const validateLeaveRequest = (leaveData) => {
        const { leaveType, startDate, endDate, documents, leaveMode } = leaveData;
        const errors = [];

        // Calculate days for validation
        let totalDays = 0;
        if (leaveMode === 'fullday') {
            totalDays = calculateDays(startDate, endDate);
        }

        switch (leaveType) {
            case 'ลาป่วย':
                // ลาป่วยตั้งแต่ 3 วันขึ้นไป ต้องมีใบรับรองแพทย์
                if (totalDays >= 3 && (!documents || documents.length === 0)) {
                    errors.push('กรณีลาป่วยตั้งแต่ 3 วันขึ้นไป จำเป็นต้องแนบใบรับรองแพทย์');
                }
                
                // ตรวจสอบวันลาที่เหลือ
                const sickDaysUsed = getUsedDays('ลาป่วย');
                const sickDaysAvailable = leaveQuota['ลาป่วย'].totalDays - sickDaysUsed;
                if (totalDays > sickDaysAvailable) {
                    errors.push(`คุณมีสิทธิ์ลาป่วยเหลืออีก ${sickDaysAvailable} วัน (ลาได้ไม่เกิน 60 วัน/ปี)`);
                }
                break;

            case 'ลากิจ':
                // ลากิจต้องได้รับการอนุมัติก่อน (เตือนผู้ใช้)
                // Note: การตรวจสอบนี้เป็นแค่การแจ้งเตือน ไม่บล็อก
                
                // ตรวจสอบวันลาที่เหลือ
                const personalDaysUsed = getUsedDays('ลากิจ');
                const personalDaysAvailable = leaveQuota['ลากิจ'].totalDays - personalDaysUsed;
                if (totalDays > personalDaysAvailable) {
                    errors.push(`คุณมีสิทธิ์ลากิจเหลืออีก ${personalDaysAvailable} วัน`);
                }
                break;

            case 'ลาพักร้อน':
                // ลาพักร้อนต้องได้รับการอนุมัติก่อน (เตือนผู้ใช้)
                
                // ตรวจสอบวันลาที่เหลือ
                const vacationDaysUsed = getUsedDays('ลาพักร้อน');
                const vacationDaysAvailable = leaveQuota['ลาพักร้อน'].totalDays - vacationDaysUsed;
                if (totalDays > vacationDaysAvailable) {
                    errors.push(`คุณมีสิทธิ์ลาพักร้อนเหลืออีก ${vacationDaysAvailable} วัน (ลาได้ไม่เกิน 10 วัน/ปี)`);
                }
                break;

            case 'ลาคลอด':
                // ตรวจสอบวันลาที่เหลือ
                const maternityDaysUsed = getUsedDays('ลาคลอด');
                const maternityDaysAvailable = leaveQuota['ลาคลอด'].totalDays - maternityDaysUsed;
                if (totalDays > maternityDaysAvailable) {
                    errors.push(`คุณมีสิทธิ์ลาคลอดเหลืออีก ${maternityDaysAvailable} วัน (ลาได้ไม่เกิน 90 วัน)`);
                }
                break;

            default:
                errors.push('ประเภทการลาไม่ถูกต้อง');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };

    const value = {
        leaveList,
        lateArrivalList,
        leaveQuota,
        addLeave,
        addLateArrival,
        updateLeave,
        deleteLeave,
        cancelLeave,
        getUsedDays,
        getLeaveSummary,
        getLeavesByType,
        calculateDays,
        updateLeaveStatus,
        validateLeaveRequest,
        getLeaveRules
    };

    return (
        <LeaveContext.Provider value={value}>
            {children}
        </LeaveContext.Provider>
    );
};
