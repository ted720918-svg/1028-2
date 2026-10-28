import React, { useState } from 'react';
import { WorkOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  CalendarDays,
  Search,
  Sliders,
  Sparkles,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Layers,
  Zap,
} from 'lucide-react';

interface SchedulingViewProps {
  onOpenRescheduleModal: (wo: WorkOrder) => void;
}

export const SchedulingView: React.FC<SchedulingViewProps> = ({ onOpenRescheduleModal }) => {
  const { workOrders, orders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('ALL');

  const equipments = Array.from(new Set(workOrders.map((w) => w.equipment)));

  const filteredWorkOrders = workOrders.filter((wo) => {
    if (equipmentFilter !== 'ALL' && wo.equipment !== equipmentFilter) return false;
    if (
      searchQuery &&
      !wo.woNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !wo.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !wo.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Timeline Date Range (e.g. 2026-10-26 ~ 2026-11-20, 26 days)
  const startDateMs = new Date('2026-10-26').getTime();
  const endDateMs = new Date('2026-11-21').getTime();
  const totalDays = 26;

  const calculateTimelinePosition = (startStr: string, endStr: string) => {
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    const oneDay = 24 * 3600 * 1000;

    const leftPercent = Math.max(0, Math.min(100, ((s - startDateMs) / (totalDays * oneDay)) * 100));
    const widthPercent = Math.max(4, Math.min(100 - leftPercent, ((e - s + oneDay) / (totalDays * oneDay)) * 100));

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            F05 生管與製造排產協同
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            生產排程管理與甘特時間軸 (APS Visualizer)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            建立或更新工單優先順序及預計開完工日，支援最新版本追溯、加班標註與 AI 3組排程方案推演
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋工單號、訂單號、設備..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">產線設備：</span>
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">全部機台產線 ({equipments.length})</option>
            {equipments.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Gantt Timeline Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <span>工單甘特時程軸 (2026/10/26 ~ 2026/11/20)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-indigo-600 rounded-xs" /> 正常排產
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-amber-500 rounded-xs" /> 加班急件
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-rose-500 rounded-xs" /> R04 交期延誤
            </span>
          </div>
        </div>

        {/* Date Headers */}
        <div className="grid grid-cols-4 sm:grid-cols-8 text-[11px] font-mono text-slate-400 border-b border-slate-100 pb-2">
          <span>10/26 (今日)</span>
          <span>10/29</span>
          <span>11/02</span>
          <span>11/05</span>
          <span>11/08</span>
          <span>11/12</span>
          <span>11/16</span>
          <span className="text-right">11/20</span>
        </div>

        {/* Gantt Rows */}
        <div className="space-y-3 pt-1">
          {filteredWorkOrders.map((wo) => {
            const parentOrder = orders.find((o) => o.orderNumber === wo.orderNumber);
            const isLate = parentOrder && new Date(wo.scheduledEndDate) > new Date(parentOrder.promisedDeliveryDate);
            const { left, width } = calculateTimelinePosition(wo.scheduledStartDate, wo.scheduledEndDate);

            return (
              <div key={wo.id} className="group relative flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900">{wo.woNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-700 font-medium">{wo.equipment}</span>
                    <span className="text-[11px] text-slate-500 font-mono">({wo.version})</span>
                    {wo.overtimeScheduled && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-medium">
                        加開二班
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">
                      開完工：<span className="font-mono text-slate-700">{wo.scheduledStartDate} ~ {wo.scheduledEndDate}</span>
                    </span>
                    {isLate && (
                      <span className="text-rose-600 font-bold">【R04 晚於承諾交期】</span>
                    )}
                    <button
                      onClick={() => onOpenRescheduleModal(wo)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium ml-2 underline"
                    >
                      調程 / AI方案
                    </button>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="h-6 bg-slate-100 rounded relative overflow-hidden">
                  <div
                    className={`absolute h-full rounded transition-all flex items-center px-2 text-[11px] text-white font-medium truncate ${
                      isLate
                        ? 'bg-rose-500'
                        : wo.overtimeScheduled
                        ? 'bg-amber-600'
                        : 'bg-indigo-600'
                    }`}
                    style={{ left, width }}
                  >
                    <span className="truncate">{wo.processName} ({wo.quantity} pcs)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Orders Detailed Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            工單生產排程維護總表
          </h3>
          <span className="text-xs text-slate-500">最後生管發布時間：2026-10-26 17:00</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium">
                <th className="py-3 px-4">工單編號 (WO)</th>
                <th className="py-3 px-4">關聯訂單</th>
                <th className="py-3 px-4">製程站別與產線設備</th>
                <th className="py-3 px-4 text-right">數量</th>
                <th className="py-3 px-4 font-mono">預計開工日</th>
                <th className="py-3 px-4 font-mono">預計完工日</th>
                <th className="py-3 px-4 font-mono">物料需求日 (MBD)</th>
                <th className="py-3 px-4">排程版本</th>
                <th className="py-3 px-4">狀態</th>
                <th className="py-3 px-4 text-right">動作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkOrders.map((wo) => {
                const parentOrder = orders.find((o) => o.orderNumber === wo.orderNumber);
                const isLate = parentOrder && new Date(wo.scheduledEndDate) > new Date(parentOrder.promisedDeliveryDate);
                return (
                  <tr key={wo.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {wo.woNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 font-medium">{wo.orderNumber}</div>
                      <div className="text-[11px] text-slate-500">{parentOrder?.customerName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{wo.processName}</div>
                      <div className="text-[11px] text-slate-500">{wo.equipment}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {wo.quantity.toLocaleString()} pcs
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {wo.scheduledStartDate}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold">
                      <span className={isLate ? 'text-rose-600' : 'text-slate-900'}>
                        {wo.scheduledEndDate}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 bg-slate-50/50">
                      {wo.materialNeededDate}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {wo.version}
                    </td>
                    <td className="py-3 px-4">
                      {isLate ? (
                        <RiskBadge code="R04" label="R04 完工晚於承諾日" />
                      ) : wo.overtimeScheduled ? (
                        <span className="text-amber-700 font-medium">二班趕工中</span>
                      ) : (
                        <span className="text-slate-600">正常排產</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenRescheduleModal(wo)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap shadow-xs"
                      >
                        調整排程 / AI 方案
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
