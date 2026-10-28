import React, { useState } from 'react';
import { CustomerOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  Search,
  PlusCircle,
  History,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface OrdersViewProps {
  onOpenAddOrder: () => void;
  onOpenOrderChange: (order: CustomerOrder) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOpenAddOrder, onOpenOrderChange }) => {
  const { orders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<CustomerOrder | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (
      searchQuery &&
      !o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !o.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            F01 · F02 業務與生管訂單協同
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            客戶訂單資料與交期變更管理
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            提供訂單查詢、需求交期登錄、承諾交期比對，並完整保留每次交期異動原因與負責人
          </p>
        </div>

        <button
          onClick={onOpenAddOrder}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>＋ 新增客戶訂單 (F01)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋訂單號、客戶、料號..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">狀態篩選：</span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING_EVALUATION')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                statusFilter === 'PENDING_EVALUATION' ? 'bg-white text-amber-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              待生管評估
            </button>
            <button
              onClick={() => setStatusFilter('MATERIAL_SHORTAGE')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                statusFilter === 'MATERIAL_SHORTAGE' ? 'bg-white text-rose-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              外包缺料
            </button>
            <button
              onClick={() => setStatusFilter('NORMAL')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                statusFilter === 'NORMAL' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              正常進行中
            </button>
          </div>
        </div>
      </div>

      {/* Orders High Density Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium">
                <th className="py-3 px-4">訂單編號 (SO)</th>
                <th className="py-3 px-4">客戶名稱</th>
                <th className="py-3 px-4">產品料號 / 規格品名</th>
                <th className="py-3 px-4 text-right">數量</th>
                <th className="py-3 px-4 font-mono">客戶需求交期</th>
                <th className="py-3 px-4 font-mono">承諾完工交期</th>
                <th className="py-3 px-4">系統狀態與風險</th>
                <th className="py-3 px-4">最後更新</th>
                <th className="py-3 px-4 text-right">動作操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-slate-900">
                      {ord.orderNumber}
                    </span>
                    {ord.changeLogs.length > 0 && (
                      <span className="ml-1.5 text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                        變更 {ord.changeLogs.length} 次
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {ord.customerName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-900">{ord.partNumber}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                      {ord.partDescription}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900">
                    {ord.quantity.toLocaleString()} {ord.unit}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                    {ord.requestedDeliveryDate}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900">
                    {ord.promisedDeliveryDate}
                  </td>
                  <td className="py-3 px-4">
                    {ord.status === 'PENDING_EVALUATION' ? (
                      <RiskBadge code="R02" label="R02 變更待評估" />
                    ) : ord.status === 'MATERIAL_SHORTAGE' ? (
                      <RiskBadge code="R01" label="R01 外包缺料預警" />
                    ) : ord.status === 'RESCHEDULED' ? (
                      <span className="text-emerald-700 font-medium">排程已評估修訂</span>
                    ) : (
                      <span className="text-slate-600">正常生產排程中</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">
                    <div>{ord.updatedBy}</div>
                    <div className="font-mono text-slate-400">{ord.updatedAt}</div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => onOpenOrderChange(ord)}
                      className="px-2 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                      title="登錄客戶交期變更"
                    >
                      變更交期 (F02)
                    </button>
                    {ord.changeLogs.length > 0 && (
                      <button
                        onClick={() => setSelectedHistoryOrder(ord)}
                        className="px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
                        title="查看歷史變更紀錄"
                      >
                        歷史歷程
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    查無符合條件之客戶訂單。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Drawer Modal if opened */}
      {selectedHistoryOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  訂單交期變更歷史歷程 (Audit Trail)
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedHistoryOrder.orderNumber} · {selectedHistoryOrder.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistoryOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                關閉
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {selectedHistoryOrder.changeLogs.map((log, idx) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span className="font-mono tabular-nums">{log.timestamp}</span>
                    <span className="font-medium text-slate-700">{log.changedBy} ({log.role})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-slate-500 line-through">{log.oldDate}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-rose-600 font-semibold">{log.newDate}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    <strong>變更原因：</strong>{log.reason}
                  </p>
                  <div className="text-[11px] text-slate-500">
                    收到客戶通知時間：<span className="font-mono">{log.noticeReceivedTime}</span>
                  </div>
                  <div className="text-[11px] pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span>生管評估：</span>
                    {log.isEvaluatedByPPC ? (
                      <span className="text-emerald-700 font-medium">{log.evaluationNote || '已完成排程'}</span>
                    ) : (
                      <span className="text-amber-600 font-medium">尚未完成評估 (待排程)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
