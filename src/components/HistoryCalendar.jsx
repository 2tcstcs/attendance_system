import React, { useState } from 'react';

export default function HistoryCalendar({ punchLogs, userRoster }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayLogs, setSelectedDayLogs] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar days
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add empty cells for previous month's padding
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: '', isPadding: true });
    }
    
    // Add current month days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toLocaleDateString('zh-TW');
      days.push({ day: d, dateStr, isPadding: false });
    }
    
    return days;
  };

  const days = getDaysInMonth();

  // Get status for a specific day
  const getDayStatus = (dateStr) => {
    if (!dateStr) return null;
    const dayLogs = punchLogs.filter(l => l.dateStr === dateStr);
    
    if (dayLogs.length === 0) {
      // Check if roster has work
      const roster = userRoster.find(r => r.dateStr === dateStr);
      if (roster && roster.shift !== 'rest') {
        // If it's a past workday and no punches exist
        const today = new Date();
        const date = new Date(dateStr);
        if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
          return 'absent';
        }
      }
      return null;
    }

    const hasIn = dayLogs.some(l => l.type === 'in');
    if (hasIn) {
      const inLog = dayLogs.find(l => l.type === 'in');
      const dt = new Date(inLog.timestamp * 1000);
      if (dt.getHours() > 9 || (dt.getHours() === 9 && dt.getMinutes() > 0)) {
        return 'late';
      }
      return 'normal';
    }
    
    return 'normal';
  };

  const getPunchesSummaryText = (dateStr) => {
    if (!dateStr) return '';
    const dayLogs = punchLogs.filter(l => l.dateStr === dateStr);
    if (dayLogs.length === 0) return '';
    
    // Get first IN and last OUT
    const inLogs = dayLogs.filter(l => l.type === 'in');
    const outLogs = dayLogs.filter(l => l.type === 'out');
    
    if (inLogs.length > 0 && outLogs.length > 0) {
      const firstIn = new Date(inLogs[inLogs.length - 1].timestamp * 1000);
      const lastOut = new Date(outLogs[0].timestamp * 1000);
      return `${firstIn.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${lastOut.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    } else if (inLogs.length > 0) {
      const firstIn = new Date(inLogs[inLogs.length - 1].timestamp * 1000);
      return `⏰ ${firstIn.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })} 上班`;
    }
    return '已下班';
  };

  const handleDayClick = (dayObj) => {
    if (dayObj.isPadding) return;
    const dayLogs = punchLogs.filter(l => l.dateStr === dayObj.dateStr);
    setSelectedDayLogs(dayLogs);
    setSelectedDateStr(dayObj.dateStr);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
    setSelectedDayLogs([]);
    setSelectedDateStr(null);
  };

  // Export functions
  const exportCSV = () => {
    const headers = '日期,打卡類型,打卡時間,定位\n';
    const rows = punchLogs.map(l => {
      const timeStr = new Date(l.timestamp * 1000).toLocaleTimeString('zh-TW', { hour12: false });
      let typeText = '上班';
      if (l.type === 'out') typeText = '下班';
      if (l.type === 'break') typeText = '開始休息';
      if (l.type === 'resume') typeText = '結束休息';
      return `"${l.dateStr}","${typeText}","${timeStr}","${l.location}"`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `出勤記錄_${year}_${month + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(punchLogs, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.setAttribute('download', `出勤記錄_${year}_${month + 1}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="fade-in">
      <div className="title-meta">
        <h2>出勤記錄日曆</h2>
        <p className="title-meta-desc">檢視歷史打卡明細與數據匯出</p>
      </div>

      <div className="calendar-layout">
        {/* Calendar View */}
        <div className="history-section glass-panel">
          <div className="section-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="export-btn" onClick={() => changeMonth(-1)}>◀</button>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{year}年 {month + 1}月</span>
              <button className="export-btn" onClick={() => changeMonth(1)}>▶</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="export-btn" onClick={exportCSV}>匯出 CSV</button>
              <button className="export-btn" onClick={exportJSON}>匯出 JSON</button>
            </div>
          </div>

          <div className="calendar-grid">
            {weekdays.map((w, i) => (
              <div className="calendar-header-day" key={i}>{w}</div>
            ))}
            
            {days.map((d, i) => {
              const status = getDayStatus(d.dateStr);
              const summary = getPunchesSummaryText(d.dateStr);
              const isToday = d.dateStr === new Date().toLocaleDateString('zh-TW');
              
              return (
                <div 
                  className={`calendar-cell ${d.isPadding ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  key={i}
                  onClick={() => handleDayClick(d)}
                >
                  <span className="day-number">{d.day}</span>
                  {status && <div className={`day-status ${status}`}></div>}
                  {summary && <span className="cell-time">{summary}</span>}
                </div>
              );
            })}
          </div>

          {/* Color legends */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
              <span>正常</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></div>
              <span>遲到</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></div>
              <span>缺勤</span>
            </div>
          </div>
        </div>

        {/* Selected Day Logs Detail */}
        <div className="history-section glass-panel" style={{ height: 'fit-content' }}>
          <div className="section-title">
            <span>打卡詳情：{selectedDateStr || '未選擇日期'}</span>
          </div>

          {!selectedDateStr ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}><circle cx="12" cy="12" r="10"/><path d="M8 12h8m-4-4v8"/></svg>
              <p>請點選左側日曆查看當天詳細打卡流水帳</p>
            </div>
          ) : selectedDayLogs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              <p>當日無任何打卡記錄</p>
            </div>
          ) : (
            <div className="timeline-list">
              {selectedDayLogs.map((log, index) => {
                const logTime = new Date(log.timestamp * 1000);
                const isIn = log.type === 'in';
                const isOut = log.type === 'out';
                const isBreak = log.type === 'break';
                const isResume = log.type === 'resume';
                
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
                          {isIn && '上班打卡'}
                          {isOut && '下班打卡'}
                          {isBreak && '開始休息'}
                          {isResume && '結束休息'}
                        </span>
                        <span className="timeline-time">
                          {logTime.toLocaleTimeString('zh-TW', { hour12: false })}
                        </span>
                      </div>
                      <div className="timeline-desc">
                        位置：{log.location}
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
