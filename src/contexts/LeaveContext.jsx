import React, { createContext, useContext, useState, useEffect } from 'react';

const LeaveContext = createContext();

export const useLeave = () => {
    const context = useContext(LeaveContext);
    if (!context) {
        throw new Error('useLeave must be used within a LeaveProvider');
    }
    return context;
};

export const LeaveProvider = ({ children }) => {
    // Initial leave data
    const initialLeaveList = [
        {
            id: 1,
            leaveType: 'ลาป่วย',
            days: '4 วัน',
            category: 'ลาป่วย',
            period: '23/09/2025 → 26/09/2025',
            startDate: '23/09/2025',
            endDate: '26/09/2025',
            reason: 'test',
            status: 'รออนุมัติ',
            statusColor: 'yellow',
            documents: []
        },
        {
            id: 2,
            leaveType: 'ลากิจ',
            days: '2 วัน',
            category: 'ลากิจ',
            period: '15/10/2025 → 16/10/2025',
            startDate: '15/10/2025',
            endDate: '16/10/2025',
            reason: 'ธุระส่วนตัว',
            status: 'อนุมัติ',
            statusColor: 'green',
            documents: []
        },
        {
            id: 3,
            leaveType: 'ลาพักร้อน',
            days: '5 วัน',
            category: 'ลาพักร้อน',
            period: '01/11/2025 → 05/11/2025',
            startDate: '01/11/2025',
            endDate: '05/11/2025',
            reason: 'เที่ยวกับครอบครัว',
            status: 'อนุมัติ',
            statusColor: 'green',
            documents: []
        },
        {
            id: 4,
            leaveType: 'ลาป่วย',
            days: '1 วัน',
            category: 'ลาป่วย',
            period: '10/09/2025',
            startDate: '10/09/2025',
            endDate: '10/09/2025',
            reason: 'ไข้หวัด',
            status: 'ไม่อนุมัติ',
            statusColor: 'red',
            documents: []
        },
        {
            id: 5,
            leaveType: 'ลาป่วย',
            days: '2 วัน',
            category: 'ลาป่วย',
            period: '05/08/2025 → 06/08/2025',
            startDate: '05/08/2025',
            endDate: '06/08/2025',
            reason: 'ป่วยไข้หวัด',
            status: 'อนุมัติ',
            statusColor: 'green',
            documents: []
        },
        {
            id: 6,
            leaveType: 'ลากิจ',
            days: '1 วัน',
            category: 'ลากิจ',
            period: '20/09/2025',
            startDate: '20/09/2025',
            endDate: '20/09/2025',
            reason: 'ติดธุระส่วนตัว',
            status: 'รออนุมัติ',
            statusColor: 'yellow',
            documents: []
        }
    ];

    // Load from localStorage or use initial data
    const [leaveList, setLeaveList] = useState(() => {
        const saved = localStorage.getItem('leaveList');
        return saved ? JSON.parse(saved) : initialLeaveList;
    });

    // Leave quota data
    const [leaveQuota] = useState({
        'ลาป่วย': { totalDays: 100 },
        'ลากิจ': { totalDays: 5 },
        'ลาพักร้อน': { totalDays: 6 },
        'ลาคลอด': { totalDays: 90 }
    });

    // Save to localStorage whenever leaveList changes
    useEffect(() => {
        localStorage.setItem('leaveList', JSON.stringify(leaveList));
    }, [leaveList]);

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
    const formatPeriod = (startDate, endDate) => {
        if (startDate === endDate) {
            return startDate;
        }
        return `${startDate} → ${endDate}`;
    };

    // Add new leave request
    const addLeave = (leaveData) => {
        const days = calculateDays(leaveData.startDate, leaveData.endDate);
        const newLeave = {
            id: Date.now(),
            leaveType: leaveData.leaveType,
            days: `${days} วัน`,
            category: leaveData.leaveType,
            period: formatPeriod(leaveData.startDate, leaveData.endDate),
            startDate: leaveData.startDate,
            endDate: leaveData.endDate,
            reason: leaveData.reason,
            status: 'รออนุมัติ',
            statusColor: 'yellow',
            documents: leaveData.documents || []
        };
        setLeaveList(prev => [newLeave, ...prev]);
        return newLeave;
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
        return false;
    };

    // Get leave summary for dashboard
    const getLeaveSummary = () => {
        return Object.keys(leaveQuota).map(type => ({
            title: type,
            description: getLeaveDescription(type),
            daysUsed: getUsedDays(type),
            totalDays: leaveQuota[type].totalDays
        }));
    };

    // Get leave description
    const getLeaveDescription = (type) => {
        const descriptions = {
            'ลาป่วย': 'ต้องยื่นใบลาในวันที่ลา...',
            'ลากิจ': 'ต้องลาล่วงหน้าไม่น้อยกว่า 3 วัน...',
            'ลาพักร้อน': 'สามารถลาพักร้อนได้ปีละ 6 วัน...',
            'ลาคลอด': 'สำหรับพนักงานหญิงที่มีบุตร...'
        };
        return descriptions[type] || '';
    };

    // Get leaves by type
    const getLeavesByType = (leaveType) => {
        if (!leaveType) return leaveList;
        return leaveList.filter(leave => leave.leaveType === leaveType);
    };

    // ฟังก์ชันสำหรับ Manager - เปลี่ยนสถานะลาโดยตรง
    const updateLeaveStatus = (id, newStatus) => {
        const statusColors = {
            'รออนุมัติ': 'yellow',
            'อนุมัติ': 'green',
            'ไม่อนุมัติ': 'red'
        };
        
        setLeaveList(prev => prev.map(leave => {
            if (leave.id === id) {
                return {
                    ...leave,
                    status: newStatus,
                    statusColor: statusColors[newStatus] || 'yellow'
                };
            }
            return leave;
        }));
    };

    const value = {
        leaveList,
        leaveQuota,
        addLeave,
        updateLeave,
        deleteLeave,
        cancelLeave,
        getUsedDays,
        getLeaveSummary,
        getLeavesByType,
        calculateDays,
        updateLeaveStatus
    };

    return (
        <LeaveContext.Provider value={value}>
            {children}
        </LeaveContext.Provider>
    );
};
