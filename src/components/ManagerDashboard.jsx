import React, { useState } from 'react';

export default function ManagerDashboard({ requests, setRequests, currentStatus, punchLogs }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle approvals
  const handleApproval = (id, newStatus) => {
    const updated = requests.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    });
    setRequests(updated);
    alert(`申請單 [${id.substring(4)}] 已${newStatus === 'approved' ? '核准' : '駁回'}！`);
  };

  // Get current user's last punch time
  const getLastPunchTimeStr = (logs) => {
    if (logs.length === 0) return '--:--';
    const lastLog = logs[0];
    const dt = new Date(lastLog.timestamp * 1000);
    return dt.toLocaleTimeString('zh-TW', { hour12: false });
  };

  // Team attendance status tracker list
  const getTeamStatus = () => {
    // Current user dynamic status
    let userStatus = 'checkout';
    if (currentStatus === 'in' || currentStatus === 'resume') userStatus = 'active';
    else if (currentStatus === 'break') userStatus = 'break';
    
    const employees = [
      { id: 'EMP001', name: '蔡宜真', shift: '日班 (09:00 - 18:00)', status: userStatus, lastPunch: getLastPunchTimeStr(punchLogs) },
      { id: 'EMP002', name: '林國強', shift: '日班 (09:00 - 18:00)', status: 'active', lastPunch: '08:52:12' },
      { id: 'EMP003', name: '張雅婷', shift: '日班 (09:00 - 18:00)', status: 'break', lastPunch: '12:05:44' },
      { id: 'EMP004', name: '陳明哲', shift: '夜班 (18:00 - 02:00)', status: 'checkout', lastPunch: '02:04:19' },
      { id: 'EMP005', name: '黃小莉', shift: '日班 (09:00 - 18:00)', status: 'absent', lastPunch: '--:--' }
    ];

    return employees.filter(emp => emp.name.includes(searchTerm) || emp.id.includes(searchTerm));
  };

  const team = getTeamStatus();
  const pendingRequests = requests.filter(req => req.status === 'pending');

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
        <h2>主管管理中心</h2>
        <p className="title-meta-desc">審核同仁請假/加班單，並監控今日出勤狀態</p>
      </div>

      <div className="manager-layout">
        {/* Approvals Grid */}
        <div className="history-section glass-panel">
          <div className="section-title">
            <span>待處理申請表單 ({pendingRequests.length})</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
              <p>目前尚無待審核的請假或加班申請</p>
            </div>
          ) : (
            <div className="approval-grid">
              {pendingRequests.map((req, index) => (
                <div className="approval-card glass-panel" key={index}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {req.type === 'leave' ? `請假 (${getLeaveLabel(req.leaveCategory)})` : '加班'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        ID: {req.id.substring(4)}
                      </span>
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>
                      {req.employeeName} ({req.employeeId})
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      日期：{req.date} ({req.hours} 小時)
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', padding: '6px', background: 'var(--bg-primary)', borderRadius: '4px', fontStyle: 'italic' }}>
                      事由：{req.reason}
                    </p>
                  </div>
                  
                  <div className="approval-actions">
                    <button 
                      type="button" 
                      className="btn-approve"
                      onClick={() => handleApproval(req.id, 'approved')}
                    >
                      核准
                    </button>
                    <button 
                      type="button" 
                      className="btn-reject"
                      onClick={() => handleApproval(req.id, 'rejected')}
                    >
                      駁回
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Attendance Tracker Grid */}
        <div className="history-section glass-panel">
          <div className="section-title">
            <span>同仁今日打卡狀況</span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="搜尋同仁姓名或編號..."
              style={{ width: '240px', padding: '6px 12px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="team-grid">
            {team.map((emp, index) => {
              const isActive = emp.status === 'active';
              const isBreak = emp.status === 'break';
              const isAbsent = emp.status === 'absent';
              
              let statusLabel = '未打卡';
              let statusColor = 'var(--text-tertiary)';
              if (isActive) { statusLabel = '上班中'; statusColor = 'var(--success)'; }
              if (isBreak) { statusLabel = '休息中'; statusColor = 'var(--warning)'; }
              if (isAbsent) { statusLabel = '缺勤'; statusColor = 'var(--danger)'; }

              return (
                <div className="team-card glass-panel" key={index}>
                  <div className="employee-profile">
                    <div className="employee-avatar">
                      {emp.name.substring(0, 1)}
                    </div>
                    <div className="employee-details">
                      <h4>{emp.name}</h4>
                      <p>編號：{emp.id}</p>
                      <p>班別：{emp.shift}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="status-dot-label">
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }}></div>
                      <span style={{ color: statusColor }}>{statusLabel}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      今日打卡: {emp.lastPunch}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
