import React, { useState } from 'react';
import { CustomerReplyRecord, CustomerReplyResult } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, MessageSquare, Loader2, Copy, Check } from 'lucide-react';

interface CustomerReplyModalProps {
  orderNumber?: string;
  onClose: () => void;
}

export const CustomerReplyModal: React.FC<CustomerReplyModalProps> = ({ orderNumber, onClose }) => {
  const { orders, recordCustomerReply, currentUser } = useApp();

  const selectedOrder = orders.find((o) => o.orderNumber === orderNumber) || orders[0];

  const [targetOrderNo, setTargetOrderNo] = useState(selectedOrder?.orderNumber || '');
  const [proposedDeliveryDate, setProposedDeliveryDate] = useState(
    selectedOrder?.promisedDeliveryDate || '2026-11-06'
  );
  const [confirmedBy, setConfirmedBy] = useState('陳建銘 (Ken, 生管主管)');
  const [replyTime, setReplyTime] = useState(
    new Date().toISOString().replace('T', ' ').substring(0, 16)
  );
  const [customerResponse, setCustomerResponse] = useState<CustomerReplyResult>('ACCEPTED');
  const [feedbackNotes, setFeedbackNotes] = useState(
    '客戶專案主管已同意採行此最新排程方案，已由業務發布內部會議備忘錄。'
  );

  // AI Draft Feature
  const [recipientType, setRecipientType] = useState<'client' | 'internal'>('client');
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const currentOrderObj = orders.find((o) => o.orderNumber === targetOrderNo) || selectedOrder;

  const handleGenerateAiDraft = async () => {
    setIsDrafting(true);
    try {
      const res = await fetch('/api/ai/draft-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: currentOrderObj.orderNumber,
          customerName: currentOrderObj.customerName,
          partNumber: currentOrderObj.partNumber,
          originalDate: currentOrderObj.changeLogs[0]?.oldDate || currentOrderObj.requestedDeliveryDate,
          newDate: proposedDeliveryDate,
          reason: currentOrderObj.changeLogs[0]?.reason || '配合外包進料與產線急件二班調度',
          confirmedScheduleDate: proposedDeliveryDate,
          recipientType: recipientType === 'internal' ? 'internal' : 'client',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiDraft(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyDraft = () => {
    if (!aiDraft?.content) return;
    navigator.clipboard.writeText(`${aiDraft.subject}\n\n${aiDraft.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordCustomerReply({
      orderNumber: currentOrderObj.orderNumber,
      customerName: currentOrderObj.customerName,
      proposedDeliveryDate,
      confirmedBy,
      replyTime,
      customerResponse,
      customerFeedbackNotes: feedbackNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              F08 客戶交期回覆紀錄與溝通信函
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              記錄內部確認交期、業務與客戶溝通結果，並可生成正式回覆草稿
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Order Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                關聯客戶訂單 <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetOrderNo}
                onChange={(e) => {
                  setTargetOrderNo(e.target.value);
                  const ord = orders.find((o) => o.orderNumber === e.target.value);
                  if (ord) setProposedDeliveryDate(ord.promisedDeliveryDate);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white font-mono focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.orderNumber}>
                    {o.orderNumber} ({o.customerName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                客戶名稱
              </label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-800 font-medium truncate">
                {currentOrderObj?.customerName}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                內部確認建議交期 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={proposedDeliveryDate}
                onChange={(e) => setProposedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                內部交期確認人 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={confirmedBy}
                onChange={(e) => setConfirmedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                回覆客戶時間 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={replyTime}
                onChange={(e) => setReplyTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>
          </div>

          {/* AI Communication Draft Generator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI 異常摘要與客戶回覆公文草稿</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 bg-slate-200 rounded text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRecipientType('client')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      recipientType === 'client' ? 'bg-white font-medium text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    對外客戶公函
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientType('internal')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      recipientType === 'internal' ? 'bg-white font-medium text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    內部跨部門決策
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={isDrafting}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
                >
                  {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>生成草稿</span>
                </button>
              </div>
            </div>

            {aiDraft ? (
              <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{aiDraft.subject}</span>
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-2 py-0.5 rounded"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? '已複製' : '複製內文'}</span>
                  </button>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-sans text-slate-700 text-[11px] leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">
                  {aiDraft.content}
                </div>
                {aiDraft.actionChecklist?.length > 0 && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-medium text-slate-700">核對檢核表：</span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                      {aiDraft.actionChecklist.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                點擊「生成草稿」，系統將依據訂單狀態、異動原因與生管確認完工日，自動撰擬專業的對外信函或內部會簽公文。
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              客戶溝通結果 / 回覆態度 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs ${
                  customerResponse === 'ACCEPTED'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="custResponse"
                  value="ACCEPTED"
                  checked={customerResponse === 'ACCEPTED'}
                  onChange={() => setCustomerResponse('ACCEPTED')}
                />
                <span>客戶接受新交期</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs ${
                  customerResponse === 'NEGOTIATING'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="custResponse"
                  value="NEGOTIATING"
                  checked={customerResponse === 'NEGOTIATING'}
                  onChange={() => setCustomerResponse('NEGOTIATING')}
                />
                <span>協商中 (要求分批/再提前)</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs ${
                  customerResponse === 'REJECTED'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="custResponse"
                  value="REJECTED"
                  checked={customerResponse === 'REJECTED'}
                  onChange={() => setCustomerResponse('REJECTED')}
                />
                <span>客戶拒絕 (需升級主管會商)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              客戶回饋備註 / 協議細節 <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="記錄客戶窗口姓名、談判重點、分批交貨協議或後續出貨安排..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <span className="text-xs text-slate-500">
            登記業務：{currentUser.name} ({currentUser.department})
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>儲存客戶溝通回覆紀錄</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
