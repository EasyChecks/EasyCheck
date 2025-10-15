import React, { useState } from 'react';
import { IoClose, IoCalendarOutline } from 'react-icons/io5';
import { FiUploadCloud, FiFileText } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


function LeaveForm({ closeModal }) {

  const [leaveType, setLeaveType] = useState('');
  const [durationType, setDurationType] = useState('day');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);

  const handleSave = () => {
    console.log("Saving data:", { leaveType, durationType, startDate, endDate, reason, file });
    closeModal(); 
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
   
    <div className="w-full max-w-md p-4 m-4 overflow-y-auto bg-white rounded-xl shadow-lg max-h-[90vh]">
      <header className="flex items-center justify-between pb-4 mb-4 border-b">
        <h1 className="text-xl font-bold text-blue-800">เอกสารการลา</h1>
        <button onClick={closeModal} className="text-2xl text-gray-500 hover:text-gray-800">
          <IoClose />
        </button>
      </header>

      <main>
        
        <div className="mb-4">
          <label className="block mb-1 text-sm font-bold text-red-600">ประเภทการลา</label>
          <input
            type="text"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            placeholder="ระบุระยะการลา"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-blue-800">ช่วงเวลา</label>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <button
              onClick={() => setDurationType('day')}
              className={`py-2 border rounded-md transition duration-200 ${durationType === 'day' ? 'bg-sky-100 border-sky-500 text-sky-600' : 'bg-gray-100 hover:border-sky-400'}`}
            >
              ลาเป็นวัน
            </button>
            <button
              onClick={() => setDurationType('hour')}
              className={`py-2 border rounded-md transition duration-200 ${durationType === 'hour' ? 'bg-sky-100 border-sky-500 text-sky-600' : 'bg-gray-100 hover:border-sky-400'}`}
            >
              ลาเป็นชั่วโมง
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <IoCalendarOutline className="absolute text-gray-400 -translate-y-1/2 pointer-events-none top-1/2 right-3" />
            </div>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <IoCalendarOutline className="absolute text-gray-400 -translate-y-1/2 pointer-events-none top-1/2 right-3" />
            </div>
          </div>
        </div>
        {/* เหตุผลการลา */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-bold text-red-600">เหตุผลการลา</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="ระบุเหตุผล"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* รูปภาพเพิ่มเติม */}
        <div className="mb-6">
          <label className="block mb-1 text-sm font-bold text-blue-800">รูปภาพเพิ่มเติม</label>
          {!file ? (
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full p-6 mt-2 text-gray-400 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-sky-500">
              <FiUploadCloud className="w-10 h-10 mb-2" />
              <span className="text-sm">แตะเพื่ออัพโหลด</span>
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="flex items-center justify-between w-full p-3 mt-2 bg-gray-100 border rounded-lg">
              <div className="flex items-center min-w-0">
                <FiFileText className="flex-shrink-0 w-6 h-6 mr-3 text-gray-600" />
                <span className="text-sm text-gray-800 truncate">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="flex-shrink-0 ml-4 text-sm font-medium text-red-500 hover:text-red-700">ลบ</button>
            </div>
          )}
        </div>
      </main>

      <footer>
        <button
          onClick={handleSave}
          className="w-full py-3 font-bold text-white transition duration-300 rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-700"
        >
          บันทึกการลา
        </button>
      </footer>
    </div>
  );
}

export default LeaveForm;