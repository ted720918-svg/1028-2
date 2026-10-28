import React, { useState } from 'react';
import { CustomerReplyRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  FileText,
} from 'lucide-react';

interface CustomerRepliesViewProps {
  onOpenReplyModal: (orderNumber?: string) => void;
}

export const CustomerRepliesView: React.FC<CustomerRepliesViewProps> = ({ onOpenReplyModal }) => {
  const { replies, orders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReplies = replies.filter((r) => {
    if (
      searchQuery &&
      !r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.confirmedBy.toLowerCase().includes(searchQuery.toLowerCase())
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
            F08 業務客戶溝通與承諾存證
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            客戶交期回覆紀錄與公文存證
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            記錄內部生管確認後之建議交期、正式回覆客戶時限與客戶接受狀態；支援 AI 一鍵產出正式溝通信函草稿
          </p>
        </div>

        <button
          onClick={() => onOpenReplyModal()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>＋ 登記客戶交期回覆 (F08)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋訂單號、客戶、確認人..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500">
          已歸檔回覆紀錄：<span className="font-mono font-semibold text-slate-900">{replies.length}</span> 筆
        </div>
      </div>

      {/* Reply Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium">
                <th className="py-3 px-4">訂單號 (SO)</th>
                <th className="py-3 px-4">客戶名稱</th>
                <th className="py-3 px-4 font-mono">建議/承諾交期</th>
                <th className="py-3 px-4">內部交期確認人</th>
                <th className="py-3 px-4 font-mono">回覆客戶時間</th>
                <th className="py-3 px-4">客戶回應結果</th>
                <th className="py-3 px-4">溝通協議細節 / 備註</th>
                <th className="py-3 px-4">登錄業務</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReplies.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {r.orderNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {r.customerName}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                    {r.proposedDeliveryDate}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {r.confirmedBy}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                    {r.replyTime}
                  </td>
                  <td className="py-3 px-4">
                    {r.customerResponse === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        客戶已接受
                      </span>
                    ) : r.customerResponse === 'NEGOTIATING' ? (
                      <span className="inline-flex items-center gap-1 text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        協商中
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-800 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        客戶拒絕
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {r.customerFeedbackNotes}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium text-[11px]">
                    {r.recordedBy}
                  </td>
                </tr>
              ))}

              {filteredReplies.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    暫無客戶交期回覆紀錄。可點擊上方按鈕記錄業務與客戶之溝通進度。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
