import React from 'react';
import { useApp } from '../../context/AppContext';
import { PlayCircle, RotateCcw, UserCheck, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  onOpenWorkflowWizard: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange, onOpenWorkflowWizard }) => {
  const { currentUser, setCurrentUser, users, resetAllData, riskAlerts } = useApp();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = users.find((u) => u.id === e.target.value);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const highRiskCount = riskAlerts.filter((r) => r.severity === 'HIGH').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 shrink-0 z-30">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('dashboard');
          }}
          className="text-base font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
        >
          生產排程與外包進料協同管理系統
        </a>
        <span className="text-slate-300" aria-hidden="true">|</span>
        <span className="text-xs text-slate-500 whitespace-nowrap">APS & Inbound Sync</span>
      </div>

      {/* Zone 2: 4-5 single-line clean nav links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'dashboard' ? 'text-slate-950 font-semibold' : ''
          }`}
        >
          綜合看板
        </button>
        <button
          onClick={() => onTabChange('orders')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'orders' ? 'text-slate-950 font-semibold' : ''
          }`}
        >
          訂單與交期
        </button>
        <button
          onClick={() => onTabChange('outsourcing')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'outsourcing' ? 'text-slate-950 font-semibold' : ''
          }`}
        >
          外包進度
        </button>
        <button
          onClick={() => onTabChange('scheduling')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'scheduling' ? 'text-slate-950 font-semibold' : ''
          }`}
        >
          生產排程甘特
        </button>
        <button
          onClick={() => onTabChange('risks')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'risks' ? 'text-slate-950 font-semibold' : ''
          }`}
        >
          <span>風險與異常</span>
          {highRiskCount > 0 && (
            <span className="text-xs text-rose-600 font-bold tabular-nums">({highRiskCount})</span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action + role switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role Selector with department indicator */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-700">
          <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-400">目前角色:</span>
          <select
            value={currentUser.id}
            onChange={handleRoleChange}
            className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer pr-1"
            title="切換協同部門角色"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} · {u.department.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action Button: 5-step Acceptance Walkthrough Wizard */}
        <button
          onClick={onOpenWorkflowWizard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors whitespace-nowrap shrink-0"
          title="執行第一版驗收：客戶交期變更→風險提醒→生管評估→排程更新→業務回覆"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>全流程實境演練</span>
        </button>

        {/* Data Reset */}
        <button
          onClick={() => {
            if (window.confirm('確定要重設為初始示範資料嗎？')) {
              resetAllData();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
          title="重設示範資料"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
