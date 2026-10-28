import React, { useState } from 'react';
import { ExceptionTicket, RiskCode, ExceptionStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface ExceptionModalProps {
  ticket?: ExceptionTicket;
  onClose: () => void;
}

export const ExceptionModal: React.FC<ExceptionModalProps> = ({ ticket, onClose }) => {
  const { createExceptionTicket, updateExceptionTicket, orders } = useApp();

  const [riskCode, setRiskCode] = useState<RiskCode>(ticket?.riskCode || 'R01');
  const [relatedOrderNumber, setRelatedOrderNumber] = useState(
    ticket?.relatedOrderNumber || orders[0]?.orderNumber || 'SO-2026-801'
  );
  const [relatedEntity, setRelatedEntity] = useState(ticket?.relatedEntity || 'PO-EXT-402 (富強熱處理)');
  const [reasonCategory, setReasonCategory] = useState(ticket?.reasonCategory || '外包廠商產能排擠與設備故障');
  const [rootCause, setRootCause] = useState(ticket?.rootCause || '');
  const [ownerName, setOwnerName] = useState(ticket?.ownerName || '張國豪 (David)');
  const [ownerDepartment, setOwnerDepartment] = useState(ticket?.ownerDepartment || '採購部');
  const [countermeasure, setCountermeasure] = useState(ticket?.countermeasure || '');
  const [targetCompletionDate, setTargetCompletionDate] = useState(
    ticket?.targetCompletionDate || '2026-10-27 17:00'
  );
  const [status, setStatus] = useState<ExceptionStatus>(ticket?.status || 'IN_PROGRESS');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticket) {
      updateExceptionTicket(ticket.id, {
        riskCode,
        relatedOrderNumber,
        relatedEntity,
        reasonCategory,
        rootCause,
        ownerName,
        ownerDepartment,
        countermeasure,
        targetCompletionDate,
        status,
        actualCompletionDate: status === 'RESOLVED' ? new Date().toISOString().substring(0, 16) : undefined,
      });
    } else {
      createExceptionTicket({
        riskCode,
        relatedOrderNumber,
        relatedEntity,
        reasonCategory,
        rootCause,
        ownerName,
        ownerDepartment,
        countermeasure,
        targetCompletionDate,
        status,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {ticket ? `F07 異常處理追蹤 (${ticket.ticketNumber})` : 'F07 開立新異常追蹤單 (CAPA)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              登錄風險原因、責任人、處置對策與預計完成時程
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                關聯風險規則 <span className="text-rose-500">*</span>
              </label>
              <select
                value={riskCode}
                onChange={(e) => setRiskCode(e.target.value as RiskCode)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              >
                <option value="R01">R01 外包到料晚於物料需求日 (缺料風險)</option>
                <option value="R02">R02 客戶交期變更未評估 (待評估)</option>
                <option value="R03">R03 物料在庫待檢逼近需求日</option>
                <option value="R04">R04 工單完工日晚於承諾交期</option>
                <option value="R05">R05 異常處理逾期未完成</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                關聯客戶訂單 <span className="text-rose-500">*</span>
              </label>
              <select
                value={relatedOrderNumber}
                onChange={(e) => setRelatedOrderNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white font-mono focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.orderNumber}>
                    {o.orderNumber} ({o.customerName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                關聯單據或實體 (PO / WO)
              </label>
              <input
                type="text"
                required
                value={relatedEntity}
                onChange={(e) => setRelatedEntity(e.target.value)}
                placeholder="例如：PO-EXT-402 (富強金屬)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                異常類型簡述 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                責任人 / 承辦人 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                責任部門 <span className="text-rose-500">*</span>
              </label>
              <select
                value={ownerDepartment}
                onChange={(e) => setOwnerDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              >
                <option value="採購部">採購部 (Procurement)</option>
                <option value="生管處">生管處 (PPC)</option>
                <option value="製造處">製造處 (Manufacturing)</option>
                <option value="品質保證部">品質保證部 (QA/QC)</option>
                <option value="業務部">業務部 (Sales)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              根本原因分析 (Root Cause)
            </label>
            <input
              type="text"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="說明引發延遲或變更之深層根本原因..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              處置對策方案 (Countermeasure / CAPA) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={countermeasure}
              onChange={(e) => setCountermeasure(e.target.value)}
              placeholder="具體行動步驟：例如派員駐廠、拆批送貨、啟用備援廠商、開立急件快速檢驗通道..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                預計完成時間 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={targetCompletionDate}
                onChange={(e) => setTargetCompletionDate(e.target.value)}
                placeholder="2026-10-27 17:00"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">若逾期未結案系統將觸發 R05 告警通知主管</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                處理狀態 <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ExceptionStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              >
                <option value="PENDING">待處理 (Pending)</option>
                <option value="IN_PROGRESS">處理中 (In Progress)</option>
                <option value="RESOLVED">已完成結案 (Resolved)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              {ticket ? '更新對策進度' : '開立異常單並列管'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
