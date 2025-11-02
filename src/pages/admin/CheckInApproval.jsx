import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { usersData } from '../../data/usersData';

export default function CheckInApproval() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('checkInRequests') || '[]');
    
    // กรองคำขอที่ user นี้ต้องอนุมัติ
    const myRequests = allRequests.filter(req => {
      if (user.role === 'superadmin') {
        return req.approver === 'superadmin';
      } else if (user.role === 'admin') {
        return req.approver === 'admin';
      } else if (user.role === 'manager') {
        return req.approver === 'manager';
      }
      return false;
    });

    setRequests(myRequests);
  };

  const handleApprove = (requestId) => {
    const allRequests = JSON.parse(localStorage.getItem('checkInRequests') || '[]');
    const updatedRequests = allRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved',
          approvedBy: user.name,
          approvedAt: new Date().toISOString()
        };
      }
      return req;
    });

    localStorage.setItem('checkInRequests', JSON.stringify(updatedRequests));
    loadRequests();
    setShowDetailModal(false);
  };

  const handleReject = (requestId, rejectReason) => {
    const allRequests = JSON.parse(localStorage.getItem('checkInRequests') || '[]');
    const updatedRequests = allRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rejected',
          rejectedBy: user.name,
          rejectedAt: new Date().toISOString(),
          rejectReason: rejectReason || 'ไม่ระบุเหตุผล'
        };
      }
      return req;
    });

    localStorage.setItem('checkInRequests', JSON.stringify(updatedRequests));
    loadRequests();
    setShowDetailModal(false);
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'รออนุมัติ' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'อนุมัติ' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'ปฏิเสธ' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="h-full bg-accent dark:bg-secondary transition-colors duration-300 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-secondary transition-colors duration-300 border-b border-gray-200 dark:border-white/10 p-6 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-bold text-secondary dark:text-white font-prompt">อนุมัติคำขอเช็คชื่อแทน</h1>
        <p className="text-sm text-gray-600 mt-1 font-prompt">จัดการคำขอเช็คชื่อแทน</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-secondary transition-colors duration-300 border-b border-gray-200 dark:border-white/10 px-6 sticky top-[88px] z-30">
        <div className="flex gap-4 -mb-px overflow-x-auto">
          {[
            { key: 'pending', label: 'รออนุมัติ' },
            { key: 'approved', label: 'อนุมัติแล้ว' },
            { key: 'rejected', label: 'ปฏิเสธ' },
            { key: 'all', label: 'ทั้งหมด' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-3 font-medium font-prompt transition-colors border-b-2 whitespace-nowrap ${
                filter === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-accent dark:bg-accent-orange rounded-full text-xs">
                {requests.filter(r => tab.key === 'all' ? true : r.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="p-6 max-w-7xl mx-auto">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-secondary transition-colors duration-300 rounded-2xl shadow-sm p-12 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="text-gray-500 font-prompt text-lg">ไม่มีคำขอในขณะนี้</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map(request => (
              <div 
                key={request.id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-secondary font-prompt">
                        {request.requesterName}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 font-prompt">
                      ขอเช็คชื่อแทน: <span className="font-medium text-secondary">{request.targetUserName}</span>
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-prompt">เหตุผล</p>
                    <p className="font-medium text-secondary font-prompt">{request.reason}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-prompt">วันที่ยื่นคำขอ</p>
                    <p className="font-medium text-secondary font-prompt">
                      {new Date(request.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-secondary font-prompt">รายละเอียดคำขอ</h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-accent dark:hover:bg-accent-orange rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 font-prompt">สถานะ</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-prompt mb-2">ผู้ยื่นคำขอ</p>
                <p className="text-lg font-medium text-secondary font-prompt">{selectedRequest.requesterName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-prompt mb-2">ขอเช็คชื่อแทน</p>
                <p className="text-lg font-medium text-secondary font-prompt">{selectedRequest.targetUserName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-prompt mb-2">เหตุผล</p>
                <p className="text-base text-secondary font-prompt">{selectedRequest.reason}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-prompt mb-2">หลักฐานแนบ</p>
                <img 
                  src={selectedRequest.evidence} 
                  alt="Evidence" 
                  className="w-full h-auto rounded-xl shadow-md"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 font-prompt mb-2">วันที่ยื่นคำขอ</p>
                <p className="text-base text-secondary font-prompt">
                  {new Date(selectedRequest.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {selectedRequest.status === 'approved' && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-700 font-prompt">
                    อนุมัติโดย: {selectedRequest.approvedBy} <br />
                    เมื่อ: {new Date(selectedRequest.approvedAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {selectedRequest.status === 'rejected' && (
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-700 font-prompt">
                    ปฏิเสธโดย: {selectedRequest.rejectedBy} <br />
                    เหตุผล: {selectedRequest.rejectReason} <br />
                    เมื่อ: {new Date(selectedRequest.rejectedAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer - Actions */}
            {selectedRequest.status === 'pending' && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
                <button
                  onClick={() => {
                    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
                    if (reason !== null) {
                      handleReject(selectedRequest.id, reason);
                    }
                  }}
                  className="flex-1 py-3 px-6 bg-red-500 text-white rounded-xl font-prompt font-medium hover:bg-red-600 transition-colors"
                >
                  ปฏิเสธ
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 py-3 px-6 bg-primary text-white rounded-xl font-prompt font-medium hover:bg-primary/90 transition-colors"
                >
                  อนุมัติ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
