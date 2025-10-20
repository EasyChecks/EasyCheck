import React, { useState, useEffect, useRef } from 'react';

// --- คอมโพเนนต์สำหรับ Modal ดูตัวอย่าง ---
const PreviewModal = ({ data, onClose }) => {
    const recipientOptions = [
        { value: 'all', label: 'ทั้งหมด' },
        { value: 'managers', label: 'เฉพาะหัวหน้า' },
        { value: 'hr', label: 'HR' },
        { value: 'admin', label: 'Admin' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'finance', label: 'Finance' },
    ];

    // แปลงค่า recipientGroups array เป็นข้อความที่ต้องการแสดงผล
    const getRecipientText = () => {
        if (data.recipientGroups.includes('all')) {
            return 'ทั้งหมด';
        }
        if (data.recipientGroups.length === 0) {
            return '(ยังไม่ได้เลือกผู้รับ)';
        }
        return data.recipientGroups
            .map(value => recipientOptions.find(opt => opt.value === value)?.label)
            .join(', ');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="w-full max-w-2xl p-6 text-white bg-blue-600 rounded-lg shadow-xl">
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-blue-600 bg-white rounded-full hover:bg-gray-200"
                    >
                        ปิดตัวอย่าง <span className="text-lg">×</span>
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-700 rounded-lg">
                        <p className="mb-1 text-sm font-semibold text-blue-200">หัวข้อ:</p>
                        <p>{data.title || '(ยังไม่ได้กรอกหัวข้อ)'}</p>
                    </div>
                    <div className="p-4 bg-blue-700 rounded-lg">
                        <p className="mb-1 text-sm font-semibold text-blue-200">ผู้รับ:</p>
                        <p>{getRecipientText()}</p>
                    </div>
                    <div className="p-4 bg-blue-700 rounded-lg">
                        <p className="mb-1 text-sm font-semibold text-blue-200">ข้อความ:</p>
                        <p className="whitespace-pre-wrap">{data.message || '(ยังไม่ได้กรอกข้อความ)'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- คอมโพเนนต์ย่อยสำหรับแสดงประวัติ ---
const NotificationHistoryCard = ({ time, title, channels }) => (
    <div className="p-4 transition-colors bg-blue-600 rounded-lg hover:bg-blue-500">
        <p className="text-sm font-semibold text-white">{time}</p>
        <p className="mt-1 text-white truncate">{title}</p>
        <p className="mt-1 text-xs text-blue-200">ส่งผ่าน {channels}</p>
    </div>
);

// --- คอมโพเนนต์หลักของหน้าจอ ---
function GroupNotificationScreen() {
    const [title, setTitle] = useState('ประกาศด่วนสำหรับทีมช่าง');
    const [recipientGroups, setRecipientGroups] = useState(['all']);
    const [message, setMessage] = useState('เรียนทีมงาน\nโปรดเข้าร่วมประชุมสรุปงานที่ห้อง Conference A เวลา 16.00 น.\nหากมีข้อสงสัยติดต่อฝ่ายปฏิบัติการ');
    const [sendChannels, setSendChannels] = useState({ app: true, sms: false, email: false });
    const [showPreview, setShowPreview] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const recipientOptions = [
        { value: 'all', label: 'ทั้งหมด' },
        { value: 'managers', label: 'หัวหน้า' },
        { value: 'hr', label: 'HR' },
        { value: 'admin', label: 'Admin' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'finance', label: 'Finance' },
    ];

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

    useEffect(() => {
        if (showPreview) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPreview]);

    const historyData = [
        { time: '15 นาทีแล้ว', title: 'แจ้งเตือนทีมติดตั้ง', channels: 'แอป + SMS' },
        { time: '1 ชั่วโมงที่แล้ว', title: 'สรุปงานประจำวัน', channels: 'เฉพาะหัวหน้า' },
    ];

    const handleSubmit = () => {
        if (!title || !message || recipientGroups.length === 0) {
            return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        }
        console.log("ส่งแจ้งเตือน:", { title, recipientGroups, message, channels: sendChannels });
        alert('ส่งแจ้งเตือนเรียบร้อยแล้ว');
    };
    
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
            <div className="flex-1 p-6 overflow-y-auto bg-gray-100 md:p-8 font-prompt">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">แจ้งเตือนแบบกลุ่ม</h1>
                        <p className="mt-1 text-gray-500">แจ้งเตือนทีมงาน/สิทธิ์การเข้าถึง พร้อมเลือกรูปแบบการส่ง</p>
                    </div>
                    <button 
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600"
                    >
                        ดูตัวอย่างข้อความ
                    </button>
                </header>

                <div className="flex flex-col space-y-6">
                    <div className="p-6 text-white bg-blue-600 rounded-lg shadow-md">
                        <div className="mb-4">
                            <label htmlFor="title" className="block mb-1 text-sm font-medium text-blue-100">หัวข้อ</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น ประกาศด่วนสำหรับทีมช่าง"
                                className="w-full px-4 py-2 text-gray-800 placeholder-blue-300 bg-blue-700 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-blue-100">เลือกผู้รับ</label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-left text-white bg-blue-700 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <span>{getDropdownButtonText()}</span>
                                    <svg className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="p-2 space-y-1">
                                            {recipientOptions.map(option => (
                                                <li key={option.value}>
                                                    <label className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100">
                                                        <input
                                                            type="checkbox"
                                                            checked={recipientGroups.includes(option.value)}
                                                            onChange={() => handleRecipientChange(option.value)}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="ml-3 text-gray-800">{option.label}</span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="message" className="block mb-1 text-sm font-medium text-blue-100">ข้อความแจ้งเตือน</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="5"
                                className="w-full px-4 py-2 text-white bg-blue-700 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                            ></textarea>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button onClick={handleSubmit} className="px-5 py-2 text-sm font-semibold text-white transition-colors bg-blue-400 rounded-md hover:bg-blue-300">ส่งผ่านแอป</button>
                             <button onClick={handleSubmit} className="px-5 py-2 text-sm font-semibold text-blue-200 transition-colors bg-blue-500 rounded-md hover:bg-blue-400">ส่ง SMS</button>
                             <button onClick={handleSubmit} className="px-5 py-2 text-sm font-semibold text-blue-200 transition-colors bg-blue-500 rounded-md hover:bg-blue-400">ส่งอีเมล</button>
                        </div>
                    </div>

                    <div className="p-6 text-white bg-blue-800 rounded-lg shadow-md">
                        <h2 className="mb-4 text-lg font-bold">บันทึกการแจ้งเตือนล่าสุด</h2>
                        <div className="space-y-3">
                            {historyData.map((item, index) => (
                                <NotificationHistoryCard 
                                    key={index}
                                    time={item.time}
                                    title={item.title}
                                    channels={item.channels}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showPreview && (
                <PreviewModal 
                    data={{ title, recipientGroups: recipientGroups, message }}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </>
    );
}

export default GroupNotificationScreen;

