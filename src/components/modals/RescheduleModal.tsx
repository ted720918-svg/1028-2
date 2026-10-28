import React, { useState } from 'react';
import { WorkOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Sparkles, Loader2, Check, ArrowRight, AlertTriangle, Layers } from 'lucide-react';

interface RescheduleModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ workOrder, onClose }) => {
  const { updateWorkOrderSchedule, orders } = useApp();
  const parentOrder = orders.find((o) => o.orderNumber === workOrder.orderNumber);

  const [startDate, setStartDate] = useState(workOrder.scheduledStartDate);
  const [endDate, setEndDate] = useState(workOrder.scheduledEndDate);
  const [overtime, setOvertime] = useState(workOrder.overtimeScheduled || false);
  const [note, setNote] = useState('');

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiScenarios, setAiScenarios] = useState<any>(null);

  const handleFetchAiScenarios = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/schedule-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: parentOrder,
          workOrder,
          delayDays: 3,
          materialAvailableDate: workOrder.materialNeededDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiScenarios(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const applyScenario = (sc: any) => {
    setEndDate(sc.adjustedEndDate);
    if (sc.id === 'A') setOvertime(true);
    setNote(`採納【${sc.name}】：${sc.advantages}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkOrderSchedule(workOrder.id, startDate, endDate, overtime, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              F05 生產排程調整與方案評估
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              工單號：{workOrder.woNumber} · 製程：{workOrder.processName} · 目前版本：{workOrder.version}
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
          {/* Order & Schedule Reference Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs grid grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block">關聯訂單與客戶</span>
              <span className="font-semibold text-slate-800">
                {workOrder.orderNumber} ({parentOrder?.customerName || '專案訂單'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">客戶需求 / 承諾交期</span>
              <span className="font-mono tabular-nums text-slate-800">
                {parentOrder?.requestedDeliveryDate} / {parentOrder?.promisedDeliveryDate}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">物料需求日 (MBD)</span>
              <span className="font-mono tabular-nums text-slate-800 font-semibold">
                {workOrder.materialNeededDate}
              </span>
            </div>
          </div>

          {/* AI Advance Scheduling Assistant */}
          <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI 生產排程方案輔助 (3組方案比對)</span>
              </div>
              <button
                type="button"
                onClick={handleFetchAiScenarios}
                disabled={isGeneratingAi}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-xs"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>模擬產能排程中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>生成排程因應方案</span>
                  </>
                )}
              </button>
            </div>

            {aiScenarios ? (
              <div className="space-y-3 pt-2 border-t border-indigo-100">
                <p className="text-xs text-indigo-900 bg-white/80 p-2 rounded border border-indigo-100">
                  <strong>生管決策建議：</strong> {aiScenarios.plannerAdvice}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {aiScenarios.scenarios.map((sc: any) => (
                    <div
                      key={sc.id}
                      className={`p-2.5 rounded border text-xs flex flex-col justify-between transition-all ${
                        sc.recommended
                          ? 'bg-white border-indigo-300 ring-1 ring-indigo-200'
                          : 'bg-white/70 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                          <span>{sc.name}</span>
                          {sc.recommended && (
                            <span className="text-[10px] text-indigo-700 bg-indigo-100 px-1 rounded">
                              推薦
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 space-y-1 mb-2">
                          <div>
                            完工日：<strong className="font-mono text-slate-900">{sc.adjustedEndDate}</strong>
                          </div>
                          <div>可行性：{sc.feasibility}% · 成本：{sc.costImpact}</div>
                          <div className="text-emerald-700">優點：{sc.advantages}</div>
                          <div className="text-amber-700">注意：{sc.risks}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyScenario(sc)}
                        className="w-full mt-2 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-center transition-colors"
                      >
                        套用此方案參數
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-indigo-800/80">
                AI 根據訂單交期、目前物料可用日、設備負荷與優先規則，即時推演「產線加班插單」、「分批出貨」與「設備調度」三組可行方案與受影響訂單。
              </p>
            )}
          </div>

          <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  預計開工日 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  預計完工日 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-md border border-slate-200 text-xs">
              <input
                type="checkbox"
                id="overtime-check"
                checked={overtime}
                onChange={(e) => setOvertime(e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="overtime-check" className="cursor-pointer font-medium text-slate-800">
                啟動急件加班模式 (平日延長二班或週末加開產線)
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                排程調整說明 / 會審結論
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="說明此次排程調整原因（例如配合外包物料到廠時間延後2日、或為滿足客戶提前交期加開二班）..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <span className="text-xs text-slate-500">
            確認後將產生新排程版本 (v1.{Number(workOrder.version.replace('v1.', '')) + 1}) 並解除 R02 待評估
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
              type="submit"
              form="reschedule-form"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              發布最新排程並記錄版本
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
