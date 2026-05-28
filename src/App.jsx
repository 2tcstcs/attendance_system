import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import HistoryCalendar from './components/HistoryCalendar';
import Requests from './components/Requests';
import Roster from './components/Roster';
import ManagerDashboard from './components/ManagerDashboard';

// Generate mock roster for the current week
const generateWeeklyRoster = () => {
  const roster = [];
  const startOfWeek = new Date();
  const currentDay = startOfWeek.getDay();
  // Set to Monday of this week
  const diff = startOfWeek.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toLocaleDateString('zh-TW');
    const dayOfWeek = date.getDay();
    
    // Day shift for weekdays, rest for weekend
    const shift = (dayOfWeek === 0 || dayOfWeek === 6) ? 'rest' : 'day';
    roster.push({ dateStr, shift });
  }
  return roster;
};

export default function App() {
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || 'employee');
  const [theme, setTheme] = useState(() => localStorage.getItem('userTheme') || 'light');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Core Database States synced with localStorage
  const [punchLogs, setPunchLogs] = useState(() => {
    const saved = localStorage.getItem('punchLogs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentStatus, setCurrentStatus] = useState(() => {
    const saved = localStorage.getItem('currentStatus');
    return saved || '';
  });
  
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('requests');
    // Pre-populate some dummy requests if empty
    return saved ? JSON.parse(saved) : [
      {
        id: 'REQ_000001',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
        employeeId: 'EMP001',
        employeeName: '蔡宜真',
        type: 'leave',
        leaveCategory: 'annual',
        date: new Date(Date.now() - 86400 * 1000).toLocaleDateString('zh-TW'),
        hours: 8,
        reason: '家庭聚餐與個人休假',
        status: 'approved'
      },
      {
        id: 'REQ_000002',
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        employeeId: 'EMP001',
        employeeName: '蔡宜真',
        type: 'overtime',
        leaveCategory: null,
        date: new Date(Date.now()).toLocaleDateString('zh-TW'),
        hours: 3,
        reason: '處理端午專案部署上線',
        status: 'pending'
      }
    ];
  });

  const [userRoster] = useState(generateWeeklyRoster);

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('punchLogs', JSON.stringify(punchLogs));
  }, [punchLogs]);

  useEffect(() => {
    localStorage.setItem('currentStatus', currentStatus);
  }, [currentStatus]);

  useEffect(() => {
    localStorage.setItem('requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  // Dark/Light Theme Handler
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('userTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleRoleToggle = () => {
    const newRole = role === 'employee' ? 'manager' : 'employee';
    setRole(newRole);
    // If switching to manager, activate manager tab
    if (newRole === 'manager') {
      setActiveTab('manager');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">🕦</div>
          <div className="logo-text">
            <h1>智勤雲</h1>
            <p>Smart Attendance Hub</p>
          </div>
        </div>

        <div className="nav-controls">
          {/* Role switcher badge */}
          <div 
            className={`role-badge ${role}`} 
            onClick={handleRoleToggle}
            title="點擊切換角色模擬"
          >
            <span>{role === 'employee' ? '👤 員工模式' : '🔑 主管模式'}</span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>[切換]</span>
          </div>

          {/* Theme toggler */}
          <button 
            type="button" 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="切換深淺色模式"
            title="切換深淺色模式"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="tab-nav">
        {role === 'employee' ? (
          <>
            <button 
              type="button"
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 打卡主頁
            </button>
            <button 
              type="button"
              className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              📅 出勤月曆
            </button>
            <button 
              type="button"
              className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              📝 差勤申請
            </button>
            <button 
              type="button"
              className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
              onClick={() => setActiveTab('roster')}
            >
              💼 我的班表
            </button>
          </>
        ) : (
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'manager' ? 'active' : ''}`}
            onClick={() => setActiveTab('manager')}
          >
            🔑 審核與管理中心
          </button>
        )}
      </nav>

      {/* Render Active Tab */}
      <main style={{ flex: 1 }}>
        {role === 'employee' && activeTab === 'dashboard' && (
          <Dashboard 
            punchLogs={punchLogs}
            setPunchLogs={setPunchLogs}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            userRoster={userRoster}
          />
        )}
        {role === 'employee' && activeTab === 'calendar' && (
          <HistoryCalendar 
            punchLogs={punchLogs}
            userRoster={userRoster}
          />
        )}
        {role === 'employee' && activeTab === 'requests' && (
          <Requests 
            requests={requests}
            setRequests={setRequests}
          />
        )}
        {role === 'employee' && activeTab === 'roster' && (
          <Roster 
            userRoster={userRoster}
          />
        )}
        {role === 'manager' && activeTab === 'manager' && (
          <ManagerDashboard 
            requests={requests}
            setRequests={setRequests}
            currentStatus={currentStatus}
            punchLogs={punchLogs}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '24px 0', 
        borderTop: '1px solid var(--border-color)', 
        fontSize: '13px', 
        color: 'var(--text-tertiary)',
        marginTop: '40px'
      }}>
        智勤雲差勤打卡管理系統 &copy; {new Date().getFullYear()} &bull; 卓越出勤體驗
      </footer>
    </div>
  );
}
