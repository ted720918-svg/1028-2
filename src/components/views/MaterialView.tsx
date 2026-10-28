import React, { useState } from 'react';
import { MaterialLot } from '../../types';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  Boxes,
  Search,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
} from 'lucide-react';

interface MaterialViewProps {
  onOpenInspectionModal: (lot: MaterialLot) => void;
}

export const MaterialView: React.FC<MaterialViewProps> = ({ onOpenInspectionModal }) => {
  const { materials, workOrders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredMaterials = materials.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (
      searchQuery &&
      !m.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusDisplay = (lot: MaterialLot) => {
    switch (lot.status) {
      case 'NOT_ARRIVED':
        return <span className="text-slate-500">未到料</span>;
      case 'PENDING_INSPECTION':
        return <RiskBadge code="R03" label="待檢 (可能影響投產)" />;
      case 'PASSED_PENDING_IN':
        return <span className="text-indigo-600 font-medium">合格待入庫</span>;
      case 'AVAILABLE':
        return <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />可領用</span>;
      case 'REJECTED':
        return <span className="text-rose-600 font-medium">不合格 (退貨/特採)</span>;
      default:
        return <span>{lot.status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            F04 倉儲與品保物料流轉協同
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            物料可用狀態與進料檢驗 (IQC / FAI)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            更新物料從「未到料 → 待檢 → 合格待入庫 → 可領用」之狀態；當物料到廠但接近投產日仍處待檢時，觸發 R03 警示
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
            placeholder="搜尋進料批號、料號、供應商..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部 ({materials.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING_INSPECTION')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              statusFilter === 'PENDING_INSPECTION' ? 'bg-white text-amber-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            待檢
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              statusFilter === 'AVAILABLE' ? 'bg-white text-emerald-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            可領用
          </button>
        </div>
      </div>

      {/* Material Lots Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium">
                <th className="py-3 px-4">進料批號 (Lot No.)</th>
                <th className="py-3 px-4">零件料號與品名</th>
                <th className="py-3 px-4">供料廠商</th>
                <th className="py-3 px-4 text-right">數量</th>
                <th className="py-3 px-4 font-mono">進廠到貨日</th>
                <th className="py-3 px-4">目前物料可用狀態</th>
                <th className="py-3 px-4">儲位 / 關聯工單</th>
                <th className="py-3 px-4">檢驗人 / 備註</th>
                <th className="py-3 px-4 text-right">品檢操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((mat) => {
                const relatedWo = workOrders.find((w) => w.id === mat.workOrderId);
                return (
                  <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {mat.lotNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-900">{mat.partNumber}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {mat.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {mat.vendorName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {mat.quantity.toLocaleString()} pcs
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      {mat.arrivalDate || '尚未抵達'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusDisplay(mat)}
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div className="font-mono text-slate-700">{mat.storageLocation || '暫存區'}</div>
                      {relatedWo && (
                        <div className="text-slate-400 font-mono">需求單: {relatedWo.woNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {mat.inspector ? (
                        <div>
                          <span>{mat.inspector}</span>
                          <span className="text-slate-400 block font-mono">{mat.inspectedAt}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">尚未指派</span>
                      )}
                      {mat.defectNotes && (
                        <div className="text-slate-500 truncate max-w-xs">{mat.defectNotes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenInspectionModal(mat)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                      >
                        檢驗判定 / 狀態變更
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
