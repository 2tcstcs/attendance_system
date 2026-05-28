import React, { useState } from 'react';

export default function Requests({ requests, setRequests }) {
  const [reqType, setReqType] = useState('leave'); // 'leave' or 'overtime'
  const [leaveType, setLeaveType] = useState('annual'); // 'annual', 'sick', 'personal'
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('8');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !hours || !reason) {
      alert('請填寫所有欄位');
      return;
    }

    const newRequest = {
      id: 'REQ_' + Math.floor(Math.random() * 1000000),
      timestamp: Math.floor(Date.now() / 1000),
      employeeId: 'EMP001',
      employeeName: '蔡宜真',
      type: reqType,
      leaveCategory: reqType === 'leave' ? leaveType : null,
      date,
      hours: parseFloat(hours),
      reason,
      status: 'pending' // pending, approved, rejected
    };

    setRequests([newRequest, ...requests]);
    setDate('');
    setReason('');
    alert('申請提交成功，等待主管審核！');
  };

  const getLeaveLabel = (cat) => {
    switch (cat) {
      case 'annual': return '特休';
      case 'sick': return '病假';
      case 'personal': return '事假';
      default: return '假別';
    }
  };

  return (
    <div className="fade-in">
      <div className="title-meta">
        <h2>請假與加班申請中心</h2>
        <p className="title-meta-desc">在線上提交簽核表單並追蹤審核進度</p>
      </div>

      <div className="requests-layout">
        {/* Form panel */}
        <div className="history-section glass-panel">
          <div className="section-title">
            <span>填寫申請單</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>申請類型</label>
              <select 
                className="form-control" 
                value={reqType} 
                onChange={(e) => setReqType(e.target.value)}
              >
                <option value="leave">請假申請</option>
                <option value="overtime">加班申請</option>
              </select>
            </div>

            {reqType === 'leave' && (
              <div className="form-group">
                <label>假別</label>
                <select 
                  className="form-control" 
                  value={leaveType} 
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="annual">特休 (Annual Leave)</option>
                  <option value="sick">病假 (Sick Leave)</option>
                  <option value="personal">事假 (Personal Leave)</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>日期</label>
              <input 
                type="date" 
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>{reqType === 'leave' ? '時數 (小時)' : '加班時數 (小時)'}</label>
              <input 
                type="number" 
                className="form-control"
                min="0.5" 
                max="24" 
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>申請事由 / 原因</label>
              <textarea 
                className="form-control"
                rows="4"
                placeholder="請輸入詳細事由..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn-submit">
              提交簽核申請
            </button>
          </form>
        </div>

        {/* Requests tracker list */}
        <div className="history-section glass-panel">
          <div className="section-title">
            <span>申請進度追蹤</span>
          </div>

          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '50px 0' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
              <p>目前尚無任何請假或加班申請記錄</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map((req, index) => (
                <div className="request-card glass-panel" key={index}>
                  <div className="request-card-info">
                    <h4>
                      {req.type === 'leave' 
                        ? `請假 (${getLeaveLabel(req.leaveCategory)}) - ${req.hours} 小時` 
                        : `加班申請 - ${req.hours} 小時`}
                    </h4>
                    <p>日期：{req.date}</p>
                    <p style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      原因：{req.reason}
                    </p>
                  </div>
                  <div>
                    <span className={`status-badge ${req.status}`}>
                      {req.status === 'pending' && '待審核'}
                      {req.status === 'approved' && '已核准'}
                      {req.status === 'rejected' && '已駁回'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
