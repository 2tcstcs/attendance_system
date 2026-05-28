import React, { useState, useEffect } from 'react';

export default function Dashboard({ punchLogs, setPunchLogs, currentStatus, setCurrentStatus, userRoster }) {
  const [time, setTime] = useState(new Date());
  const [gpsSimulated, setGpsSimulated] = useState(true);
  const [coords, setCoords] = useState({ lat: 25.0339, lng: 121.5645 }); // Taipei 101 coords as default
  const [locName, setLocName] = useState('台北市信義區 (台北 101)');
  
  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Geolocation simulation or browser detection
  useEffect(() => {
    if (!gpsSimulated) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocName(`緯度: ${pos.coords.latitude.toFixed(4)}, 經度: ${pos.coords.longitude.toFixed(4)}`);
          },
          (err) => {
            console.error(err);
            setGpsSimulated(true);
            setLocName('無法取得真實定位，自動切換至模擬定位');
          }
        );
      } else {
        setGpsSimulated(true);
      }
    } else {
      setCoords({ lat: 25.0339, lng: 121.5645 });
      setLocName('台北市信義區 (台北 101) [模擬]');
    }
  }, [gpsSimulated]);

  // Actions
  const handlePunch = (actionType) => {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    
    const newLog = {
      timestamp,
      type: actionType,
      lat: coords.lat,
      lng: coords.lng,
      location: locName,
      dateStr: now.toLocaleDateString('zh-TW')
    };

    setPunchLogs([newLog, ...punchLogs]);
    setCurrentStatus(actionType);
  };

  const getStatusLabel = () => {
    switch (currentStatus) {
      case 'in': return '上班中';
      case 'break': return '休息中';
      case 'resume': return '上班中 (休息結束)';
      case 'out': return '已下班';
      default: return '未打卡';
    }
  };

  const getStatusClass = () => {
    switch (currentStatus) {
      case 'in':
      case 'resume':
        return 'checkin';
      case 'break':
        return 'break';
      default:
        return 'checkout';
    }
  };

  // KPI Calculations
  const getWeeklyHours = () => {
    // Basic calculation for work hours
    let totalSec = 0;
    let lastIn = null;
    let lastBreak = null;
    let breakSec = 0;
    
    // Sort logs ascending for calculation
    const sorted = [...punchLogs].sort((a, b) => a.timestamp - b.timestamp);
    
    sorted.forEach(log => {
      if (log.type === 'in' || log.type === 'resume') {
        lastIn = log.timestamp;
      } else if (log.type === 'break') {
        lastBreak = log.timestamp;
      } else if (log.type === 'out' && lastIn) {
        let work = log.timestamp - lastIn;
        totalSec += work;
        lastIn = null;
      }
      
      // Calculate break time
      if (log.type === 'resume' && lastBreak) {
        breakSec += (log.timestamp - lastBreak);
        lastBreak = null;
      }
    });

    // If currently clocked in, add duration up to now
    if ((currentStatus === 'in' || currentStatus === 'resume') && lastIn) {
      const nowTs = Math.floor(Date.now() / 1000);
      totalSec += (nowTs - lastIn);
    }
    
    // Deduct active break time
    if (currentStatus === 'break' && lastBreak) {
      const nowTs = Math.floor(Date.now() / 1000);
      breakSec += (nowTs - lastBreak);
    }

    const netWorkSec = totalSec - breakSec;
    const hours = netWorkSec / 3600;
    return Math.max(0, hours).toFixed(1);
  };

  const getAttendanceRate = () => {
    // Roster scheduled days vs punched days
    const uniquePunchDays = new Set(punchLogs.map(l => l.dateStr)).size;
    const rosterWorkDays = userRoster.filter(r => r.shift !== 'rest').length;
    if (rosterWorkDays === 0) return '100%';
    const rate = Math.min(100, (uniquePunchDays / rosterWorkDays) * 100);
    return `${rate.toFixed(0)}%`;
  };

  const getLateCount = () => {
    // Late count (clock in after 09:00:00)
    let late = 0;
    punchLogs.forEach(log => {
      if (log.type === 'in') {
        const dt = new Date(log.timestamp * 1000);
        if (dt.getHours() > 9 || (dt.getHours() === 9 && dt.getMinutes() > 0)) {
          late++;
        }
      }
    });
    return late;
  };

  return (
    <div className="fade-in">
      <div className="title-meta">
        <h2>個人打卡主頁</h2>
        <p className="title-meta-desc">即時上班/下班打卡與出勤狀況摘要</p>
      </div>

      {/* KPI summaries */}
      <div className="kpi-deck">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="kpi-info">
            <p>本週工時</p>
            <h3>{getWeeklyHours()} 小時</h3>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          </div>
          <div className="kpi-info">
            <p>出勤率</p>
            <h3>{getAttendanceRate()}</h3>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon orange">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div className="kpi-info">
            <p>遲到次數</p>
            <h3>{getLateCount()} 次</h3>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon red">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
          </div>
          <div className="kpi-info">
            <p>特休剩餘</p>
            <h3>14 天</h3>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="dashboard-grid">
        {/* Punch controls */}
        <div className="punch-card glass-panel">
          <div className="time-display">
            <div className="live-time">{time.toLocaleTimeString('zh-TW', { hour12: false })}</div>
            <div className="live-date">{time.toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div className={`current-status ${getStatusClass()}`}>
            目前狀態：{getStatusLabel()}
          </div>

          <div className="gps-badge">
            <div className={`gps-dot ${gpsSimulated ? 'active' : 'active'}`}></div>
            <span>定位: {locName}</span>
            <button 
              type="button" 
              style={{
                marginLeft: '8px', 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--primary)', 
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600'
              }}
              onClick={() => setGpsSimulated(!gpsSimulated)}
            >
              [切換{gpsSimulated ? '真實' : '模擬'}]
            </button>
          </div>

          <div className="punch-actions">
            <div className="action-row">
              <button
                type="button"
                className="btn-punch in"
                disabled={currentStatus === 'in' || currentStatus === 'break' || currentStatus === 'resume'}
                onClick={() => handlePunch('in')}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                上班打卡
              </button>

              <button
                type="button"
                className="btn-punch out"
                disabled={currentStatus === 'out' || currentStatus === ''}
                onClick={() => handlePunch('out')}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM6 10l4 4 4-4M10 6v8"/></svg>
                下班打卡
              </button>
            </div>

            <div className="action-row">
              <button
                type="button"
                className="btn-punch break-start"
                disabled={currentStatus !== 'in' && currentStatus !== 'resume'}
                onClick={() => handlePunch('break')}
              >
                開始休息
              </button>

              <button
                type="button"
                className="btn-punch break-end"
                disabled={currentStatus !== 'break'}
                onClick={() => handlePunch('resume')}
              >
                結束休息
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Punch Log Timeline */}
        <div className="history-section glass-panel">
          <div className="section-title">
            <span>今日打卡流水帳</span>
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
              顯示最新打卡記錄
            </span>
          </div>

          {punchLogs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <p>今日尚無任何打卡記錄</p>
            </div>
          ) : (
            <div className="timeline-list">
              {punchLogs.slice(0, 5).map((log, index) => {
                const logTime = new Date(log.timestamp * 1000);
                const isBreak = log.type === 'break';
                const isResume = log.type === 'resume';
                const isIn = log.type === 'in';
                const isOut = log.type === 'out';
                
                return (
                  <div className="timeline-item" key={index}>
                    <div className={`timeline-badge ${log.type}`}>
                      {isIn && '入'}
                      {isOut && '出'}
                      {isBreak && '休'}
                      {isResume && '續'}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className="timeline-title">
                          {isIn && '上班打卡成功'}
                          {isOut && '下班打卡成功'}
                          {isBreak && '開始休息'}
                          {isResume && '結束休息，返回工作'}
                        </span>
                        <span className="timeline-time">
                          {logTime.toLocaleTimeString('zh-TW', { hour12: false })}
                        </span>
                      </div>
                      <div className="timeline-desc">
                        定位：{log.location}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
