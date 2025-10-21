import React, { useState, useEffect, useRef } from 'react';

// --- Toast Notification Component ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        error: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        success: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    };

    const styles = {
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-orange-50 border-orange-200 text-orange-800',
        success: 'bg-green-50 border-green-200 text-green-800'
    };

    const iconColors = {
        error: 'text-red-500',
        warning: 'text-orange-500',
        success: 'text-green-500'
    };

    return (
        <div className="fixed top-6 right-6 z-[60] animate-slideInRight">
            <div className={`${styles[type]} border-2 rounded-xl shadow-2xl p-4 pr-12 min-w-[320px] max-w-md`}>
                <div className="flex items-start gap-3">
                    <div className={iconColors[type]}>
                        {icons[type]}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm leading-relaxed">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Modal สำหรับดูรายละเอียดประวัติการแจ้งเตือน ---
const HistoryDetailModal = ({ notification, onClose }) => {
    const recipientOptions = [
        { value: 'all', label: 'ทั้งหมด' },
        { value: 'managers', label: 'หัวหน้า' },
        { value: 'hr', label: 'HR' },
        { value: 'admin', label: 'Admin' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'finance', label: 'Finance' },
    ];

    const getRecipientText = () => {
        if (notification.recipients.includes('all')) return 'ทั้งหมด';
        return notification.recipients
            .map(value => recipientOptions.find(opt => opt.value === value)?.label)
            .join(', ');
    };

    const getChannelIcons = () => {
        const channels = [];
        if (notification.channels.line) channels.push({ name: 'LINE', icon: '💬', color: 'bg-green-500' });
        if (notification.channels.sms) channels.push({ name: 'SMS', icon: '📱', color: 'bg-blue-500' });
        if (notification.channels.email) channels.push({ name: 'Email', icon: '📧', color: 'bg-red-500' });
        return channels;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">รายละเอียดการแจ้งเตือน</h2>
                            <p className="text-blue-100 text-sm mt-1">{notification.timestamp}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Title */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-600 mb-2">หัวข้อ</p>
                        <p className="text-gray-800 font-semibold text-lg">{notification.title}</p>
                    </div>

                    {/* Recipients */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-600 mb-2">ผู้รับ</p>
                        <p className="text-gray-800">{getRecipientText()}</p>
                        <p className="text-sm text-gray-500 mt-1">จำนวน {notification.recipientCount} คน</p>
                    </div>

                    {/* Channels */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-600 mb-3">ช่องทางการส่ง</p>
                        <div className="flex flex-wrap gap-2">
                            {getChannelIcons().map((channel, index) => (
                                <div key={index} className={`${channel.color} text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium`}>
                                    <span className="text-xl">{channel.icon}</span>
                                    <span>{channel.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-600 mb-2">ข้อความ</p>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{notification.message}</p>
                    </div>

                    {/* Status */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-800 font-semibold">ส่งสำเร็จ</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Modal สำหรับยืนยันการส่ง ---
const ConfirmSendModal = ({ data, channels, onConfirm, onClose }) => {
    const recipientOptions = [
        { value: 'all', label: 'ทั้งหมด' },
        { value: 'managers', label: 'หัวหน้า' },
        { value: 'hr', label: 'HR' },
        { value: 'admin', label: 'Admin' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'finance', label: 'Finance' },
    ];

    const getRecipientText = () => {
        if (data.recipientGroups.includes('all')) return 'ทั้งหมด';
        return data.recipientGroups
            .map(value => recipientOptions.find(opt => opt.value === value)?.label)
            .join(', ');
    };

    const getSelectedChannels = () => {
        const selected = [];
        if (channels.line) selected.push('LINE');
        if (channels.sms) selected.push('SMS');
        if (channels.email) selected.push('Email');
        return selected;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                    <h3 className="text-xl font-bold">ยืนยันการส่งแจ้งเตือน</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-orange-800">คุณกำลังจะส่งแจ้งเตือนไปยัง</p>
                                <p className="text-orange-700 mt-1"><strong>{getRecipientText()}</strong></p>
                                <p className="text-sm text-orange-600 mt-2">ผ่านช่องทาง: <strong>{getSelectedChannels().join(', ')}</strong></p>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm">การแจ้งเตือนจะถูกส่งไปยังผู้รับทุกคนในกลุ่มที่เลือกทันที</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                    >
                        ยืนยันและส่ง
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Success Modal ---
const SuccessModal = ({ onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 2000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">ส่งสำเร็จ!</h3>
                <p className="text-gray-600">แจ้งเตือนถูกส่งเรียบร้อยแล้ว</p>
            </div>
        </div>
    );
};

// --- Card สำหรับแสดงประวัติ ---
const NotificationHistoryCard = ({ notification, onClick }) => {
    const getChannelIcons = () => {
        const icons = [];
        if (notification.channels.line) icons.push('💬');
        if (notification.channels.sms) icons.push('📱');
        if (notification.channels.email) icons.push('📧');
        return icons.join(' ');
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{notification.timestamp}</p>
                </div>
                <div className="text-2xl">{getChannelIcons()}</div>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{notification.message}</p>
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    ส่งถึง {notification.recipientCount} คน
                </span>
                <span className="text-green-600 text-xs font-semibold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ส่งแล้ว
                </span>
            </div>
        </div>
    );
};

// --- คอมโพเนนต์หลักของหน้าจอ ---
function GroupNotificationScreen() {
    const [title, setTitle] = useState('');
    const [recipientGroups, setRecipientGroups] = useState([]);
    const [message, setMessage] = useState('');
    const [sendChannels, setSendChannels] = useState({ line: false, sms: false, email: false });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [notificationHistory, setNotificationHistory] = useState([]);
    const [toast, setToast] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const dropdownRef = useRef(null);

    // โหลดประวัติการแจ้งเตือนจาก localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('notificationHistory');
        if (savedHistory) {
            setNotificationHistory(JSON.parse(savedHistory));
        }
    }, []);

    // ฟังก์ชันแสดง Toast
    const showToast = (message, type = 'error') => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    const recipientOptions = [
        { value: 'all', label: 'ทั้งหมด', count: 150 },
        { value: 'managers', label: 'หัวหน้าทีม', count: 25 },
        { value: 'hr', label: 'ฝ่ายบุคคล', count: 8 },
        { value: 'admin', label: 'ผู้ดูแลระบบ', count: 5 },
        { value: 'marketing', label: 'ฝ่ายการตลาด', count: 20 },
        { value: 'finance', label: 'ฝ่ายการเงิน', count: 12 },
    ];

    // คำนวณจำนวนผู้รับทั้งหมด
    const calculateRecipientCount = () => {
        if (recipientGroups.includes('all')) {
            return recipientOptions.find(opt => opt.value === 'all')?.count || 0;
        }
        return recipientGroups.reduce((total, group) => {
            const option = recipientOptions.find(opt => opt.value === group);
            return total + (option?.count || 0);
        }, 0);
    };

    const handleRecipientChange = (value) => {
        setRecipientGroups(prevSelected => {
            if (value === 'all') {
                return prevSelected.includes('all') ? [] : ['all'];
            }
            let newSelection = prevSelected.filter(item => item !== 'all');
            if (newSelection.includes(value)) {
                return newSelection.filter(item => item !== value);
            } else {
                newSelection.push(value);
                return newSelection;
            }
        });
    };

    const getDropdownButtonText = () => {
        if (recipientGroups.includes('all')) return 'ทั้งหมด';
        if (recipientGroups.length === 0) return 'เลือกผู้รับ';
        if (recipientGroups.length === 1) {
            return recipientOptions.find(opt => opt.value === recipientGroups[0])?.label || 'เลือกผู้รับ';
        }
        return `${recipientGroups.length} กลุ่มที่เลือก`;
    };

    const toggleChannel = (channel) => {
        setSendChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
    };

    const hasSelectedChannel = () => {
        return sendChannels.line || sendChannels.sms || sendChannels.email;
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // ตรวจสอบหัวข้อ
        if (!title.trim()) {
            errors.title = true;
            showToast('กรุณากรอกหัวข้อการแจ้งเตือน', 'error');
            isValid = false;
        }
        // ตรวจสอบผู้รับ
        else if (recipientGroups.length === 0) {
            errors.recipients = true;
            showToast('กรุณาเลือกกลุ่มผู้รับอย่างน้อย 1 กลุ่ม', 'error');
            isValid = false;
        }
        // ตรวจสอบข้อความ
        else if (!message.trim()) {
            errors.message = true;
            showToast('กรุณากรอกข้อความที่ต้องการส่ง', 'error');
            isValid = false;
        }
        // ตรวจสอบข้อความสั้นเกินไป
        else if (message.trim().length < 10) {
            errors.message = true;
            showToast('ข้อความควรมีความยาวอย่างน้อย 10 ตัวอักษร', 'warning');
            isValid = false;
        }
        // ตรวจสอบช่องทางการส่ง
        else if (!hasSelectedChannel()) {
            errors.channels = true;
            showToast('กรุณาเลือกช่องทางการส่งอย่างน้อย 1 ช่องทาง', 'error');
            isValid = false;
        }

        setFieldErrors(errors);
        
        // ล้าง error หลัง 3 วินาที
        if (!isValid) {
            setTimeout(() => setFieldErrors({}), 3000);
        }

        return isValid;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        setShowConfirmModal(true);
    };

    const confirmSendNotification = async () => {
        setShowConfirmModal(false);

        // สร้างข้อมูลการแจ้งเตือน
        const notification = {
            id: Date.now(),
            title: title.trim(),
            message: message.trim(),
            recipients: [...recipientGroups],
            recipientCount: calculateRecipientCount(),
            channels: { ...sendChannels },
            timestamp: new Date().toLocaleString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            status: 'success'
        };

        // บันทึกประวัติ
        const updatedHistory = [notification, ...notificationHistory];
        setNotificationHistory(updatedHistory);
        localStorage.setItem('notificationHistory', JSON.stringify(updatedHistory));

        // จำลองการส่งผ่าน LINE API, SMS Gateway, Email Service
        try {
            if (sendChannels.line) {
                console.log('📤 Sending to LINE:', {
                    recipients: recipientGroups,
                    message: `${title}\n\n${message}`
                });
                // await sendLineNotification(notification);
            }
            if (sendChannels.sms) {
                console.log('📤 Sending SMS:', {
                    recipients: recipientGroups,
                    message: `${title}\n${message}`
                });
                // await sendSMSNotification(notification);
            }
            if (sendChannels.email) {
                console.log('📤 Sending Email:', {
                    recipients: recipientGroups,
                    subject: title,
                    body: message
                });
                // await sendEmailNotification(notification);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }

        // แสดง success modal และรีเซ็ตฟอร์ม
        setShowSuccessModal(true);
        setTimeout(() => {
            setTitle('');
            setMessage('');
            setRecipientGroups([]);
            setSendChannels({ line: false, sms: false, email: false });
        }, 2000);
    };

    // จัดการ modal overlay
    useEffect(() => {
        if (showConfirmModal || showSuccessModal || selectedHistory) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showConfirmModal, showSuccessModal, selectedHistory]);

    // จัดการคลิกนอก dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <>
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 md:p-8 font-prompt">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">การแจ้งเตือนแบบกลุ่ม</h1>
                            <p className="text-gray-600 mt-1">ส่งข้อความแจ้งเตือนไปยังกลุ่มเป้าหมายผ่าน LINE, SMS และ Email</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ฟอร์มส่งแจ้งเตือน */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card หลัก */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                    สร้างข้อความแจ้งเตือน
                                </h2>
                                <p className="text-blue-100 text-sm mt-1">กรอกข้อมูลและเลือกกลุ่มเป้าหมาย</p>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* หัวข้อ */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                        หัวข้อ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: false }));
                                        }}
                                        placeholder="เช่น ประกาศด่วนสำหรับทีมช่าง"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                                            fieldErrors.title 
                                                ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-500 shake' 
                                                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    />
                                    {fieldErrors.title && (
                                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            กรุณากรอกหัวข้อ
                                        </p>
                                    )}
                                </div>

                                {/* เลือกผู้รับ */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        เลือกผู้รับ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className={`flex items-center justify-between w-full px-4 py-3 text-left bg-white border-2 rounded-xl transition-all ${
                                                fieldErrors.recipients
                                                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-500 shake'
                                                    : 'border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            }`}
                                        >
                                            <span className={recipientGroups.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                                                {getDropdownButtonText()}
                                                {recipientGroups.length > 0 && (
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        ({calculateRecipientCount()} คน)
                                                    </span>
                                                )}
                                            </span>
                                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {fieldErrors.recipients && (
                                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                กรุณาเลือกผู้รับ
                                            </p>
                                        )}
                                        {isDropdownOpen && (
                                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl">
                                                <ul className="p-2 space-y-1 max-h-64 overflow-y-auto">
                                                    {recipientOptions.map(option => (
                                                        <li key={option.value}>
                                                            <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors group">
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={recipientGroups.includes(option.value)}
                                                                        onChange={() => {
                                                                            handleRecipientChange(option.value);
                                                                            if (fieldErrors.recipients) setFieldErrors(prev => ({ ...prev, recipients: false }));
                                                                        }}
                                                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                    />
                                                                    <span className="ml-3 text-gray-800 font-medium group-hover:text-blue-600">
                                                                        {option.label}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                                    {option.count} คน
                                                                </span>
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ข้อความ */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                        ข้อความแจ้งเตือน <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            if (fieldErrors.message) setFieldErrors(prev => ({ ...prev, message: false }));
                                        }}
                                        rows="6"
                                        placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all resize-none ${
                                            fieldErrors.message
                                                ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-500 shake'
                                                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    ></textarea>
                                    <div className="flex items-center justify-between mt-1">
                                        <div>
                                            {fieldErrors.message && (
                                                <p className="text-red-600 text-xs flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    กรุณากรอกข้อความ
                                                </p>
                                            )}
                                        </div>
                                        <p className={`text-sm ${message.length < 10 && message.length > 0 ? 'text-orange-500 font-semibold' : 'text-gray-500'}`}>
                                            {message.length} ตัวอักษร
                                            {message.length > 0 && message.length < 10 && ' (ต้องการอย่างน้อย 10)'}
                                        </p>
                                    </div>
                                </div>

                                {/* เลือกช่องทางการส่ง */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        เลือกช่องทางการส่ง <span className="text-red-500">*</span>
                                    </label>
                                    {fieldErrors.channels && (
                                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm shake">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            กรุณาเลือกช่องทางการส่งอย่างน้อย 1 ช่องทาง
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                toggleChannel('line');
                                                if (fieldErrors.channels) setFieldErrors(prev => ({ ...prev, channels: false }));
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                sendChannels.line
                                                    ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                                                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-3xl">💬</span>
                                            <span className={`font-semibold ${sendChannels.line ? 'text-green-700' : 'text-gray-700'}`}>
                                                LINE
                                            </span>
                                            {sendChannels.line && (
                                                <div className="flex items-center gap-1 text-green-600 text-xs">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    เลือกแล้ว
                                                </div>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                toggleChannel('sms');
                                                if (fieldErrors.channels) setFieldErrors(prev => ({ ...prev, channels: false }));
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                sendChannels.sms
                                                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-3xl">📱</span>
                                            <span className={`font-semibold ${sendChannels.sms ? 'text-blue-700' : 'text-gray-700'}`}>
                                                SMS
                                            </span>
                                            {sendChannels.sms && (
                                                <div className="flex items-center gap-1 text-blue-600 text-xs">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    เลือกแล้ว
                                                </div>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                toggleChannel('email');
                                                if (fieldErrors.channels) setFieldErrors(prev => ({ ...prev, channels: false }));
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                sendChannels.email
                                                    ? 'border-red-500 bg-red-50 shadow-lg scale-105'
                                                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-3xl">📧</span>
                                            <span className={`font-semibold ${sendChannels.email ? 'text-red-700' : 'text-gray-700'}`}>
                                                Email
                                            </span>
                                            {sendChannels.email && (
                                                <div className="flex items-center gap-1 text-red-600 text-xs">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    เลือกแล้ว
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* ปุ่มส่ง */}
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    ส่งแจ้งเตือน
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ประวัติการแจ้งเตือน */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 sticky top-6">
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 text-white">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    ประวัติการส่ง
                                </h2>
                            </div>

                            <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {notificationHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 text-sm">ยังไม่มีประวัติการส่ง</p>
                                    </div>
                                ) : (
                                    notificationHistory.map((notification) => (
                                        <NotificationHistoryCard
                                            key={notification.id}
                                            notification={notification}
                                            onClick={() => setSelectedHistory(notification)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showConfirmModal && (
                <ConfirmSendModal
                    data={{ title, recipientGroups, message }}
                    channels={sendChannels}
                    onConfirm={confirmSendNotification}
                    onClose={() => setShowConfirmModal(false)}
                />
            )}

            {showSuccessModal && (
                <SuccessModal onClose={() => setShowSuccessModal(false)} />
            )}

            {selectedHistory && (
                <HistoryDetailModal
                    notification={selectedHistory}
                    onClose={() => setSelectedHistory(null)}
                />
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
                .animate-slideInRight {
                    animation: slideInRight 0.3s ease-out;
                }
                .shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </>
    );
}

export default GroupNotificationScreen;

