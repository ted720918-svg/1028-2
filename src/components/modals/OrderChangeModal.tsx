import React, { useState } from 'react';
import { CustomerOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Calendar, AlertTriangle, History, ArrowRight } from 'lucide-react';

interface OrderChangeModalProps {
  order: CustomerOrder;
  onClose: () => void;
}

export const OrderChangeModal: React.FC<OrderChangeModalProps> = ({ order, onClose }) => {
  const { registerDeliveryChange } = useApp();
  const [newDate, setNewDate] = useState(order.requestedDeliveryDate);
  const [reason, setReason] = useState('');
  const [noticeTime, setNoticeTime] = useState(
    new Date().toISOString().replace('T', ' ').substring(0, 16)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    registerDeliveryChange(order.id, newDate, reason || '客戶專案時程調整', noticeTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              F02 客戶交期變更登錄
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              訂單號：{order.orderNumber} · 客戶：{order.customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-md p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              登錄新交期後，系統將自動儲存變更紀錄，並將狀態標記為<strong>「待評估 (R02)」</strong>，即時推播通知生管與採購啟動產能與物料會審。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                原需求交期
              </label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono tabular-nums text-slate-600">
                {order.requestedDeliveryDate}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                目前內部承諾交期
              </label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono tabular-nums text-slate-600">
                {order.promisedDeliveryDate}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                客戶要求新交期 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                收到客戶通知時間 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noticeTime}
                onChange={(e) => setNoticeTime(e.target.value)}
                placeholder="2026-10-26 14:30"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              變更原因說明 <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例如：客戶端產線建置提前，請求縮短 5 天；或專案規格變更需順延等..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          {/* Change History Trail */}
          {order.changeLogs.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>變更歷史紀錄 ({order.changeLogs.length} 筆)</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {order.changeLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-50 border border-slate-200/80 rounded text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-mono tabular-nums">{log.timestamp}</span>
                      <span>{log.changedBy} ({log.role})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums text-slate-800">
                      <span className="text-slate-500 line-through">{log.oldDate}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-rose-600 font-semibold">{log.newDate}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.reason}</p>
                    <div className="text-[11px] text-slate-500">
                      生管評估狀態：
                      {log.isEvaluatedByPPC ? (
                        <span className="text-emerald-600 ml-1">已評估完成 ({log.evaluationNote})</span>
                      ) : (
                        <span className="text-amber-600 ml-1">待生管評估排程中</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              確認登錄變更並通知生管
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
