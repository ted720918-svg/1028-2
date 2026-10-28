import React, { useState } from 'react';
import { OutsourcingOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  Truck,
  Search,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface OutsourcingViewProps {
  onOpenOutsourcingModal: (po: OutsourcingOrder) => void;
}

export const OutsourcingView: React.FC<OutsourcingViewProps> = ({ onOpenOutsourcingModal }) => {
  const { outsourcing } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');

  const vendors = Array.from(new Set(outsourcing.map((p) => p.vendorName)));

  const filteredPOs = outsourcing.filter((p) => {
    if (vendorFilter !== 'ALL' && p.vendorName !== vendorFilter) return false;
    if (
      searchQuery &&
      !p.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
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
            F03 採購與協力廠商進度協同
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            外包進度與到料管理
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            更新外包廠商承諾日、預計到料日及延遲原因；當預計到料日晚於物料需求日 (MBD) 時自動標示缺料風險 (R01)
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
            placeholder="搜尋外包單號、協力廠商、料號..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">外包廠商：</span>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">全部外包廠商 ({vendors.length})</option>
            {vendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Outsourcing High Density Grid */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium">
                <th className="py-3 px-4">外包單號 (PO)</th>
                <th className="py-3 px-4">協力廠商</th>
                <th className="py-3 px-4">委外加工料號與工藝</th>
                <th className="py-3 px-4 text-right">數量</th>
                <th className="py-3 px-4 font-mono">廠商承諾日</th>
                <th className="py-3 px-4 font-mono">最新預計到料日</th>
                <th className="py-3 px-4 font-mono">工單需求日 (MBD)</th>
                <th className="py-3 px-4">在製進度</th>
                <th className="py-3 px-4">風險狀態</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.map((po) => {
                const isShortage = new Date(po.expectedDate) > new Date(po.materialNeededDate);
                return (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-900">
                        {po.poNumber}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {po.orderNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {po.vendorName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-900">{po.partNumber}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {po.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900">
                      {po.quantity.toLocaleString()} pcs
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      {po.promisedDate}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold">
                      <span className={isShortage ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                        {po.expectedDate}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700 bg-slate-50/50">
                      {po.materialNeededDate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              po.progressPercent === 100
                                ? 'bg-emerald-500'
                                : isShortage
                                ? 'bg-rose-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${po.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-[11px] text-slate-600">
                          {po.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isShortage ? (
                        <RiskBadge code="R01" label="R01 缺料風險" />
                      ) : po.status === 'DELIVERED_FULL' ? (
                        <span className="text-emerald-700 font-medium">已到廠入庫</span>
                      ) : (
                        <span className="text-slate-600">排程正常</span>
                      )}
                      {po.delayReason && (
                        <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                          原因：{po.delayReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenOutsourcingModal(po)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                      >
                        更新到料 / AI 預測
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
