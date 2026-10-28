import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Search,
  Download,
  Users,
  Check,
  Minus,
  Lock,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const modules = Array.from(new Set(auditLogs.map((l) => l.module)));

  const filteredLogs = auditLogs.filter((log) => {
    if (moduleFilter !== 'ALL' && log.module !== moduleFilter) return false;
    if (
      searchQuery &&
      !log.operator.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.targetIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.details.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['時間', '操作者', '角色', '模組', '動作', '單號/對象', '異動明細'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.operator,
      l.operatorRole,
      l.module,
      l.action,
      l.targetIdentifier,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `APS_Audit_Trail_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            F10 資訊安全與跨部門權限合規
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            操作稽核軌跡 (Audit Trail) 與部門權限管理
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            重要資料變更須嚴格記錄操作者、時間、模組與前後異動內容，符合 ISO/TS 體系追溯標準
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>匯出稽核報表 (CSV)</span>
        </button>
      </div>

      {/* Role & Permissions Matrix Overview Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <span>跨部門角色權限配置規範表 (RBAC Matrix)</span>
          </h3>
          <span className="text-[11px] text-slate-500">依據第一版功能規格草案授權</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-2 px-3">功能模組</th>
                <th className="py-2 px-3 text-center">業務 (Sales)</th>
                <th className="py-2 px-3 text-center">生管 (PPC)</th>
                <th className="py-2 px-3 text-center">採購 (Procurement)</th>
                <th className="py-2 px-3 text-center">製造 (Mfg)</th>
                <th className="py-2 px-3 text-center">倉儲 (Warehouse)</th>
                <th className="py-2 px-3 text-center">品保 (QA)</th>
                <th className="py-2 px-3 text-center">主管 (Management)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">F01 訂單資料管理</td>
                <td className="text-center text-emerald-600 font-bold">新增/編輯</td>
                <td className="text-center text-slate-700">查詢/審核</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-700">查詢</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">F02 客戶交期變更</td>
                <td className="text-center text-emerald-600 font-bold">登錄變更</td>
                <td className="text-center text-indigo-600 font-bold">排程評估</td>
                <td className="text-center text-slate-400">通知</td>
                <td className="text-center text-slate-400">通知</td>
                <td className="text-center text-slate-400">通知</td>
                <td className="text-center text-slate-400">通知</td>
                <td className="text-center text-slate-700">查詢</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">F03 外包進度到料</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-700">查詢/連動</td>
                <td className="text-center text-emerald-600 font-bold">更新到料日</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-700">入廠核對</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-700">查詢</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">F04 物料可用狀態</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-700">開立領料</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-700">投產領用</td>
                <td className="text-center text-emerald-600 font-bold">進出庫更新</td>
                <td className="text-center text-emerald-600 font-bold">檢驗判定</td>
                <td className="text-center text-slate-700">查詢</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">F05 生產排程管理</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-emerald-600 font-bold">調整與發布</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-emerald-600 font-bold">機台指派</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-700">核准</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">F07 異常處理追蹤</td>
                <td className="text-center text-slate-700">會簽</td>
                <td className="text-center text-emerald-600 font-bold">主辦列管</td>
                <td className="text-center text-emerald-600 font-bold">主辦列管</td>
                <td className="text-center text-emerald-600 font-bold">主辦列管</td>
                <td className="text-center text-slate-700">協同</td>
                <td className="text-center text-emerald-600 font-bold">品管判定</td>
                <td className="text-center text-rose-600 font-bold">逾期督導</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">F08 客戶交期回覆</td>
                <td className="text-center text-emerald-600 font-bold">回覆記錄</td>
                <td className="text-center text-slate-700">交期確認人</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-400">查詢</td>
                <td className="text-center text-slate-700">備查</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter and Search Bar for Logs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋操作者、單號、動作、異動明細..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">模組篩選：</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">全部模組日誌 ({auditLogs.length})</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium">
                <th className="py-3 px-4 font-mono">時間戮記 (Timestamp)</th>
                <th className="py-3 px-4">操作人員</th>
                <th className="py-3 px-4">角色與部門</th>
                <th className="py-3 px-4">業務模組</th>
                <th className="py-3 px-4">動作行為</th>
                <th className="py-3 px-4 font-mono">對象單號</th>
                <th className="py-3 px-4">異動內容與系統動作詳情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {log.operator}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {log.operatorRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {log.module}
                  </td>
                  <td className="py-3 px-4 font-medium text-indigo-700">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {log.targetIdentifier}
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
