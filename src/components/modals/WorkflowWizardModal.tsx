import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  FileCheck,
  RotateCcw,
} from 'lucide-react';

interface WorkflowWizardModalProps {
  onClose: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const WorkflowWizardModal: React.FC<WorkflowWizardModalProps> = ({ onClose, onNavigateToTab }) => {
  const {
    orders,
    outsourcing,
    workOrders,
    registerDeliveryChange,
    updateWorkOrderSchedule,
    recordCustomerReply,
    setCurrentUser,
    users,
    auditLogs,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Find demo order (SO-2026-801 Advantech)
  const targetOrder = orders.find((o) => o.orderNumber === 'SO-2026-801') || orders[0];
  const targetWo = workOrders.find((w) => w.woNumber === 'WO-2026-102') || workOrders[0];

  const steps = [
    {
      num: 1,
      title: '客戶交期變更登錄',
      role: '業務 (林雅婷 Tina)',
      desc: '客戶研華科技因晶圓廠提前上線，緊急提出交期由 2026-11-15 壓縮至 2026-11-06 (提前 9 天)。',
      actionText: '模擬業務登錄交期提前',
      runAction: () => {
        // Switch to Sales role
        const salesUser = users.find((u) => u.role === 'SALES') || users[1];
        setCurrentUser(salesUser);
        registerDeliveryChange(
          targetOrder.id,
          '2026-11-06',
          '客戶晶圓廠設備擴建上線時程提前，業務登錄急件申請',
          new Date().toISOString().replace('T', ' ').substring(0, 16)
        );
        setCompletedSteps((prev) => [...prev, 1]);
        setCurrentStep(2);
      },
    },
    {
      num: 2,
      title: '系統規則引擎觸發風險提醒',
      role: '系統核心引擎 (R01~R05)',
      desc: '系統自動比對交期與排程，標示【R02 待評估】並通知生管處，同時外包 PO-EXT-401 到料緊貼需求日。',
      actionText: '查看即時風險提醒並切換至生管',
      runAction: () => {
        const ppcUser = users.find((u) => u.role === 'PPC') || users[0];
        setCurrentUser(ppcUser);
        setCompletedSteps((prev) => [...prev, 2]);
        setCurrentStep(3);
      },
    },
    {
      num: 3,
      title: '生管評估與 AI 排程方案推薦',
      role: '生管 (陳建銘 Ken)',
      desc: '生管檢視物料可用日與組裝線產能，AI 提供方案 A（加班插單）、方案 B（分批交貨）、方案 C（設備調度）。決議採行方案 A。',
      actionText: '確認採行方案 A (產線加班急件)',
      runAction: () => {
        setCompletedSteps((prev) => [...prev, 3]);
        setCurrentStep(4);
      },
    },
    {
      num: 4,
      title: '排程更新與版本正式發布',
      role: '生管主管 / 製造處',
      desc: '工單 WO-2026-102 完工日正式修訂為 2026-11-06，標註加班，系統版本升級為 v1.1，解除 R02 待評估。',
      actionText: '發布最新生產排程',
      runAction: () => {
        const ppcUser = users.find((u) => u.role === 'PPC') || users[0];
        setCurrentUser(ppcUser);
        updateWorkOrderSchedule(
          targetWo.id,
          '2026-11-02',
          '2026-11-06',
          true,
          '採行 AI 方案 A：組裝二線平日加開二班，完工日如期鎖定 2026-11-06'
        );
        setCompletedSteps((prev) => [...prev, 4]);
        setCurrentStep(5);
      },
    },
    {
      num: 5,
      title: '業務正式回覆客戶與記錄存證',
      role: '業務 (林雅婷 Tina)',
      desc: '業務生成正式交期確認函，向客戶確認 11/06 準時交付。客戶代表確認接受，寫入回覆歷程與稽核日誌。',
      actionText: '完成業務回覆與存證結案',
      runAction: () => {
        const salesUser = users.find((u) => u.role === 'SALES') || users[1];
        setCurrentUser(salesUser);
        recordCustomerReply({
          orderNumber: targetOrder.orderNumber,
          customerName: targetOrder.customerName,
          proposedDeliveryDate: '2026-11-06',
          confirmedBy: '陳建銘 (Ken, 生管主管)',
          replyTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
          customerResponse: 'ACCEPTED',
          customerFeedbackNotes: '客戶採購主管對本公司 2 小時內完成排程因應並承諾 11/06 交貨表達高度肯定。',
        });
        setCompletedSteps((prev) => [...prev, 5]);
      },
    },
  ];

  const recentLogs = auditLogs.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                第一版驗收標準演練
              </span>
              <h3 className="text-base font-semibold">
                「交期變更 → 風險提醒 → 生管評估 → 排程更新 → 業務回覆」實境全流程
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              每一步驟均嚴格對應規格表之負責人、操作時間與不可篡改之稽核紀錄 (Audit Trail)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((st, i) => {
              const isDone = completedSteps.includes(st.num);
              const isCurrent = currentStep === st.num;
              return (
                <div key={st.num} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-slate-900 text-white ring-2 ring-indigo-500'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap hidden sm:inline ${
                        isCurrent ? 'font-bold text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 ${
                        completedSteps.includes(st.num) ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Active Step Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                步驟 0{currentStep} / 05 · {steps[currentStep - 1]?.role}
              </span>
              <span className="text-xs text-slate-500">
                演練單據：{targetOrder.orderNumber} ({targetOrder.customerName})
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-2">
              {steps[currentStep - 1]?.title}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {steps[currentStep - 1]?.desc}
            </p>

            {/* Context details per step */}
            {currentStep === 1 && (
              <div className="bg-white p-3 rounded border border-slate-200 text-xs space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">訂單料號：</span>
                  <span className="font-mono text-slate-800">{targetOrder.partNumber} ({targetOrder.partDescription})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">原約定交期：</span>
                  <span className="font-mono tabular-nums text-slate-600">2026-11-15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">客戶新需求交期：</span>
                  <span className="font-mono tabular-nums text-rose-600 font-bold">2026-11-06 (提前 9 天)</span>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-amber-50/80 border border-amber-200 p-3 rounded text-xs space-y-1.5 mb-4 text-amber-900">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>觸發規則：R02 客戶交期變更後尚未完成排程評估</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  系統自動將訂單狀態更新為「待評估」，並推播通知生管處「陳建銘 (Ken)」。採購與製造主管儀表板同步亮起黃色預警。
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded text-xs space-y-2 mb-4">
                <div className="flex items-center gap-1.5 font-semibold text-indigo-950">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI 產能排程推演結果</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded border border-indigo-200 font-medium">
                    <div className="text-indigo-900 font-semibold">方案 A (推薦)</div>
                    <div className="text-slate-600 mt-1">產線加開二班</div>
                    <div className="text-emerald-600 font-mono mt-0.5">11/06 完工 (100% 準時)</div>
                  </div>
                  <div className="bg-white/60 p-2 rounded border border-slate-200">
                    <div className="text-slate-800 font-semibold">方案 B</div>
                    <div className="text-slate-600 mt-1">首批交貨 50%</div>
                    <div className="text-slate-500 font-mono mt-0.5">11/06 首批 + 11/10 尾批</div>
                  </div>
                  <div className="bg-white/60 p-2 rounded border border-slate-200">
                    <div className="text-slate-800 font-semibold">方案 C</div>
                    <div className="text-slate-600 mt-1">設備跨廠調度</div>
                    <div className="text-slate-500 font-mono mt-0.5">11/07 完工 (逾期1天)</div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded text-xs space-y-1.5 mb-4 text-emerald-900">
                <div className="font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>生管發布排程：工單 WO-2026-102 (v1.1)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  完工日正式鎖定為 <strong>2026-11-06</strong>，訂單解除待評估狀態，承諾交期同步更新，解除系統 R02 警戒。
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded text-xs space-y-2 mb-4 text-emerald-900">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>全流程驗收圓滿完成！</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  業務林雅婷已向研華科技專案經理回覆建議交期 11/06，客戶正式接受。全流程包含「變更人、評估人、新舊交期、排程版本、回覆記錄」皆可於稽核日誌 (Audit Log) 隨時追溯。
                </p>
              </div>
            )}

            {/* Action Execution Button */}
            <div className="flex items-center gap-3">
              {currentStep <= 5 && !completedSteps.includes(5) ? (
                <button
                  onClick={steps[currentStep - 1]?.runAction}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
                >
                  <span>{steps[currentStep - 1]?.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                >
                  驗收完成，關閉演練視窗
                </button>
              )}

              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  檢視上一階段
                </button>
              )}
            </div>
          </div>

          {/* Real-time Audit Trail for Verification */}
          <div className="border border-slate-200 rounded-md p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>即時產生的操作稽核軌跡 (Audit Log)</span>
              </span>
              <span className="text-[11px] text-slate-400">嚴格存證不可竄改</span>
            </div>
            <div className="space-y-1.5">
              {recentLogs.map((log) => (
                <div key={log.id} className="text-[11px] flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 tabular-nums">{log.timestamp.substring(11)}</span>
                    <span className="font-medium text-slate-800">{log.operator}</span>
                    <span className="text-slate-500">[{log.module}]</span>
                    <span className="text-slate-700">{log.action}: {log.targetIdentifier}</span>
                  </div>
                  <span className="text-slate-400 truncate max-w-xs">{log.details}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 shrink-0 text-xs">
          <span className="text-slate-500">
            第一版驗收目標：跨部門協同閉環 · 實時風險防堵 · 資料不可否認
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            離開引導
          </button>
        </div>
      </div>
    </div>
  );
};
