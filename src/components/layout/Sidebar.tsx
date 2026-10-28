import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Truck,
  Boxes,
  CalendarDays,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { currentUser, riskAlerts, orders, outsourcing, exceptions } = useApp();

  const r01Count = riskAlerts.filter((r) => r.code === 'R01').length;
  const r02Count = riskAlerts.filter((r) => r.code === 'R02').length;
  const r03Count = riskAlerts.filter((r) => r.code === 'R03').length;
  const r04Count = riskAlerts.filter((r) => r.code === 'R04').length;
  const r05Count = riskAlerts.filter((r) => r.code === 'R05').length;

  const totalRisks = riskAlerts.length;

  const navItems = [
    {
      id: 'dashboard',
      label: '管理看板與 KPI',
      spec: 'F09',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders',
      label: '訂單資料與交期',
      spec: 'F01 · F02',
      icon: FileSpreadsheet,
      badge: r02Count > 0 ? `${r02Count} 待評估` : null,
      badgeColor: 'text-amber-600 font-semibold',
    },
    {
      id: 'outsourcing',
      label: '外包進度與到料',
      spec: 'F03 · AI預警',
      icon: Truck,
      badge: r01Count > 0 ? `${r01Count} 缺料預警` : null,
      badgeColor: 'text-rose-600 font-semibold',
    },
    {
      id: 'materials',
      label: '物料可用與品管',
      spec: 'F04 · 檢驗',
      icon: Boxes,
      badge: r03Count > 0 ? `${r03Count} 待檢` : null,
      badgeColor: 'text-amber-600',
    },
    {
      id: 'scheduling',
      label: '生產排程與甘特',
      spec: 'F05 · AI方案',
      icon: CalendarDays,
      badge: r04Count > 0 ? `${r04Count} 交期風險` : null,
      badgeColor: 'text-rose-600',
    },
    {
      id: 'risks',
      label: '風險提醒與異常',
      spec: 'F06 · F07',
      icon: AlertTriangle,
      badge: totalRisks > 0 ? `${totalRisks} 待辦` : null,
      badgeColor: 'text-rose-600 font-bold',
    },
    {
      id: 'replies',
      label: '客戶交期回覆紀錄',
      spec: 'F08 · 溝通草稿',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'audit',
      label: '操作稽核與權限',
      spec: 'F10 · Audit Log',
      icon: ShieldAlert,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Current Workspace Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 font-medium">試行範圍專案</div>
          <div className="text-sm font-semibold text-white tracking-wide">高階工業與通訊模組</div>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
          v1.0 穩定版
        </span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          核心協同模組
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <div className="truncate">
                  <div className="truncate text-slate-200">{item.label}</div>
                  <div className="text-[10px] text-slate-500">{item.spec}</div>
                </div>
              </div>
              {item.badge && (
                <span className={`text-[10px] tabular-nums whitespace-nowrap ml-2 ${item.badgeColor || 'text-slate-400'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Real-time Risk Rule Monitor Box */}
      <div className="p-3 mx-2 mb-2 bg-slate-950/60 rounded-md border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-300 font-medium pb-2 border-b border-slate-800/80 mb-2">
          <span>5大風險規則監控 (R01~R05)</span>
          <span className="font-mono text-rose-400 tabular-nums">{totalRisks} 警示</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">R01 外包缺料</span>
            <span className={`tabular-nums font-mono ${r01Count > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
              {r01Count} 筆
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">R02 變更待評估</span>
            <span className={`tabular-nums font-mono ${r02Count > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}`}>
              {r02Count} 筆
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">R03 待檢逼近需求日</span>
            <span className={`tabular-nums font-mono ${r03Count > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}`}>
              {r03Count} 筆
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">R04 完工晚於承諾日</span>
            <span className={`tabular-nums font-mono ${r04Count > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
              {r04Count} 筆
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">R05 異常對策逾期</span>
            <span className={`tabular-nums font-mono ${r05Count > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
              {r05Count} 筆
            </span>
          </div>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          <div className="text-slate-200 font-medium">{currentUser.name}</div>
          <div className="text-[11px] text-slate-500">{currentUser.department}</div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
          {currentUser.role}
        </span>
      </div>
    </aside>
  );
};
