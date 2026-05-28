import React from 'react';

export default function Roster({ userRoster }) {
  const getShiftLabel = (shift) => {
    switch (shift) {
      case 'day': return '日班 (09:00 - 18:00)';
      case 'night': return '晚班 (18:00 - 02:00)';
      case 'rest': return '例假日 / 休息';
      default: return '未排班';
    }
  };

  const getWeekDayName = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return date.toLocaleDateString('zh-TW', { weekday: 'short' });
    }
    return '';
  };

  return (
    <div className="fade-in">
      <div className="title-meta">
        <h2>個人排班表</h2>
        <p className="title-meta-desc">檢視本週排班與休假狀態安排</p>
      </div>

      <div className="history-section glass-panel">
        <div className="section-title">
          <span>本週班表</span>
        </div>

        <div className="roster-grid">
          {/* Header Row */}
          <div className="roster-header">同仁</div>
          {userRoster.map((item, index) => (
            <div className="roster-header" key={index}>
              {item.dateStr.substring(5)} ({getWeekDayName(item.dateStr)})
            </div>
          ))}

          {/* Employee Row */}
          <div className="roster-row-header">
            <span style={{ fontWeight: 'bold' }}>蔡宜真</span>
          </div>
          {userRoster.map((item, index) => (
            <div className="roster-shift-cell" key={index}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {item.shift === 'rest' ? '💤' : '💼'}
              </span>
              <span className={`shift-tag ${item.shift}`}>
                {item.shift === 'day' && '日班'}
                {item.shift === 'night' && '夜班'}
                {item.shift === 'rest' && '休'}
              </span>
              <span style={{ fontSize: '10px', marginTop: '6px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                {item.shift === 'day' && '09:00-18:00'}
                {item.shift === 'night' && '18:00-02:00'}
                {item.shift === 'rest' && '休息日'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
