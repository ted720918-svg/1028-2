import React, { useState } from 'react';
import { ExceptionTicket } from '../../types';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  AlertTriangle,
  PlusCircle,
  Search,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface RiskExceptionsViewProps {
  onOpenCreateException: () => void;
  onOpenEditException: (ticket: ExceptionTicket) => void;
  onNavigateTab: (tabId: string) => void;
}

export const RiskExceptionsView: React.FC<RiskExceptionsViewProps> = ({
  onOpenCreateException,
  onOpenEditException,
  onNavigateTab,
}) => {
  const { riskAlerts, exceptions, orders } = useApp();
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'TICKETS'>('ALERTS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = exceptions.filter((t) => {
    if (
      searchQuery &&
      !t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.relatedOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            F06 · F07 跨部門風險防堵與異常處置
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            缺料與交期風險提醒 · 異常處置追蹤 (CAPA)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            5大系統規則即時辨識交期與缺料風險，並追蹤異常原因、責任人、處置方案對策與預計完成時限
          </p>
        </div>

        <button
          onClick={onOpenCreateException}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>＋ 開立異常處理單 (F07)</span>
        </button>
      </div>

      {/* Tabs Switcher: Rule Alerts vs Tickets */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`pb-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ALERTS'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>F06 即時風險警示雷達 (R01~R05)</span>
            <span className="text-[11px] font-mono text-rose-600 font-bold">
              ({riskAlerts.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('TICKETS')}
            className={`pb-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'TICKETS'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span>F07 異常處置追蹤單 (CAPA Tickets)</span>
            <span className="text-[11px] font-mono text-slate-600">
              ({exceptions.length})
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'ALERTS' ? (
        /* Alerts Tab: Showing R01 to R05 in high-density cards */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="text-[11px] font-mono text-slate-400">R01 規則</span>
              <div className="font-semibold text-slate-900">外包預計到料 &gt; 物料需求日</div>
              <p className="text-[11px] text-slate-500">觸發「外包缺料風險」，通知採購確認、生管評估排程。</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="text-[11px] font-mono text-slate-400">R02 規則</span>
              <div className="font-semibold text-slate-900">交期變更未完成排程評估</div>
              <p className="text-[11px] text-slate-500">顯示「待評估」，生管核定物料產能與重排方案。</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="text-[11px] font-mono text-slate-400">R03 規則</span>
              <div className="font-semibold text-slate-900">到料逼近需求日仍為待檢</div>
              <p className="text-[11px] text-slate-500">標示「待檢影響投產」，品保啟動急件檢驗放行。</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="text-[11px] font-mono text-slate-400">R04 規則</span>
              <div className="font-semibold text-slate-900">工單完工日 &gt; 承諾交期</div>
              <p className="text-[11px] text-slate-500">標示「交期風險」，生管製造協調加班插單或業務談判。</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="text-[11px] font-mono text-slate-400">R05 規則</span>
              <div className="font-semibold text-slate-900">異常案件超過預計完成時間</div>
              <p className="text-[11px] text-slate-500">通知責任人與主管，要求即刻更新原因與新預定期限。</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs divide-y divide-slate-100">
            {riskAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <RiskBadge code={alert.code} label={alert.title} />
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {alert.relatedOrderNumber}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span><strong>觸發條件：</strong>{alert.triggerCondition}</span>
                      <span><strong>行動方針：</strong>{alert.actionRequired}</span>
                      <span><strong>通報部門：</strong>{alert.targetRoles.join('、')}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                    {alert.code === 'R01' && (
                      <button
                        onClick={() => onNavigateTab('outsourcing')}
                        className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors whitespace-nowrap"
                      >
                        前往外包單處理
                      </button>
                    )}
                    {alert.code === 'R02' && (
                      <button
                        onClick={() => onNavigateTab('scheduling')}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
                      >
                        前往排程重排評估
                      </button>
                    )}
                    {alert.code === 'R03' && (
                      <button
                        onClick={() => onNavigateTab('materials')}
                        className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors whitespace-nowrap"
                      >
                        前往品檢放行
                      </button>
                    )}
                    {alert.code === 'R04' && (
                      <button
                        onClick={() => onNavigateTab('scheduling')}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
                      >
                        調整產線工單
                      </button>
                    )}
                    {alert.code === 'R05' && (
                      <button
                        onClick={() => setActiveTab('TICKETS')}
                        className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors whitespace-nowrap"
                      >
                        更新對策時限
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {riskAlerts.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                無待處理之風險規則警示，所有單據排程與進料皆順暢運轉。
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tickets Tab: CAPA table */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium">
                  <th className="py-3 px-4">異常單號 (EXP)</th>
                  <th className="py-3 px-4">關聯規則 / 訂單</th>
                  <th className="py-3 px-4">異常類型與根本原因</th>
                  <th className="py-3 px-4">責任人 / 部門</th>
                  <th className="py-3 px-4">處置對策方案 (CAPA)</th>
                  <th className="py-3 px-4 font-mono">預計完成時間</th>
                  <th className="py-3 px-4">狀態</th>
                  <th className="py-3 px-4 text-right">動作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{t.riskCode}</div>
                      <div className="font-mono text-[11px] text-slate-500">{t.relatedOrderNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{t.reasonCategory}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{t.rootCause}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{t.ownerName}</div>
                      <div className="text-[11px] text-slate-500">{t.ownerDepartment}</div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-700 truncate max-w-sm">{t.countermeasure}</p>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <span className={t.isOverdue && t.status !== 'RESOLVED' ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {t.targetCompletionDate}
                      </span>
                      {t.isOverdue && t.status !== 'RESOLVED' && (
                        <span className="block text-[10px] text-rose-500 font-medium">已逾期 (R05)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {t.status === 'RESOLVED' ? (
                        <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          已結案
                        </span>
                      ) : t.status === 'IN_PROGRESS' ? (
                        <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          處理中
                        </span>
                      ) : (
                        <span className="text-rose-800 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          待處理
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenEditException(t)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                      >
                        更新進度
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
