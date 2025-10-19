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
