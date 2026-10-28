import React, { useState } from 'react';
import { OutsourcingOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, AlertOctagon, Sparkles, History, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface OutsourcingModalProps {
  po: OutsourcingOrder;
  onClose: () => void;
}

export const OutsourcingModal: React.FC<OutsourcingModalProps> = ({ po, onClose }) => {
  const { updateOutsourcingExpectedDate } = useApp();
  const [expectedDate, setExpectedDate] = useState(po.expectedDate);
  const [delayReason, setDelayReason] = useState(po.delayReason || '');
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<any>(null);

  const isShortage = new Date(expectedDate) > new Date(po.materialNeededDate);

  const handlePredictDelay = async () => {
    setIsPredicting(true);
    try {
      const res = await fetch('/api/ai/predict-delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor: po.vendorName,
          poNumber: po.poNumber,
          partNumber: po.partNumber,
          promisedDate: po.promisedDate,
          expectedDate,
          delayReason,
          vendorHistory: {
            onTimeRate: '88%',
            avgDelayDays: 2.4,
            criticalProcess: '熱處理/精密多軸加工',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiPrediction(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOutsourcingExpectedDate(po.id, expectedDate, delayReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              F03 外包進度與到料管理
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              外包單號：{po.poNumber} · 協力廠商：{po.vendorName}
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
          {/* Risk Rule R01 Alert Preview */}
          {isShortage ? (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">【R01 缺料風險預警觸發】</span>
                <p className="mt-0.5">
                  預計到料日 ({expectedDate}) 晚於工單物料需求日 ({po.materialNeededDate})。儲存後系統將自動標示缺料風險，並推播通知採購與生管。
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-2.5 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                目前預計到料日 ({expectedDate}) 早於或符合物料需求日 ({po.materialNeededDate})，備料時程正常。
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                外包加工項目 / 料號
              </label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono text-slate-800">
                {po.partNumber}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{po.description}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                下游工單物料需求日 (MBD)
              </label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono tabular-nums text-slate-800">
                {po.materialNeededDate}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">產線開工前最遲入庫日</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                廠商原承諾日
              </label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono tabular-nums text-slate-600">
                {po.promisedDate}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                最新預計到料日 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              延遲或調整原因說明
            </label>
            <input
              type="text"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              placeholder="例如：熱處理設備校溫排程順延、表面處理夾具微調、原廠產能排擠..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          {/* AI Advance Delay Prediction Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI 外包延遲風險預測與備案輔助</span>
              </div>
              <button
                type="button"
                onClick={handlePredictDelay}
                disabled={isPredicting}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>分析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>執行 AI 風險預測</span>
                  </>
                )}
              </button>
            </div>

            {aiPrediction ? (
              <div className="space-y-2 text-xs pt-2 border-t border-slate-200 text-slate-700">
                <div className="flex items-center justify-between">
                  <span>
                    風險評級：
                    <strong className={aiPrediction.riskLevel === '高' ? 'text-rose-600' : 'text-amber-600'}>
                      {aiPrediction.riskLevel} 風險 ({aiPrediction.riskScore} 分)
                    </strong>
                  </span>
                  <span className="text-[11px] text-slate-500">{aiPrediction.primaryRiskFactor}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200/80 text-[11px] leading-relaxed">
                  <span className="font-medium text-slate-800">後續衝擊分析：</span>
                  {aiPrediction.impactAnalysis}
                </div>
                <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100 text-[11px] leading-relaxed">
                  <span className="font-medium text-indigo-900">採購對策建議：</span>
                  {aiPrediction.recommendedAction}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                分析廠商歷史履約交期、製程瓶頸與在製品進度，提供提前預警與供應商分流備案建議。
              </p>
            )}
          </div>

          {/* History Logs */}
          {po.historyLogs.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>變更歷史紀錄 ({po.historyLogs.length} 筆)</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {po.historyLogs.map((log, i) => (
                  <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs space-y-0.5">
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span className="font-mono tabular-nums">{log.timestamp}</span>
                      <span>{log.updatedBy}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-slate-500 line-through">{log.oldVal}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-rose-600 font-semibold">{log.newVal}</span>
                    </div>
                    {log.reason && <p className="text-[11px] text-slate-600">{log.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
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
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
          >
            更新到料狀態並發布通知
          </button>
        </div>
      </div>
    </div>
  );
};
