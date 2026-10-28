import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  AlertOctagon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenOrderChange: (order: any) => void;
  onOpenReschedule: (wo: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenOrderChange,
  onOpenReschedule,
}) => {
  const { orders, outsourcing, workOrders, riskAlerts, exceptions, replies } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (selectedCustomer !== 'ALL' && o.customerName !== selectedCustomer) return false;
    return true;
  });

  // Calculate KPIs
  const totalOrders = filteredOrders.length;
  const highRiskOrders = filteredOrders.filter((o) => o.status === 'PENDING_EVALUATION' || o.status === 'MATERIAL_SHORTAGE').length;
  
  // Inbound On-time rate
  const deliveredOutsourcing = outsourcing.filter((p) => p.status === 'DELIVERED_FULL' || p.actualArrivalDate);
  const onTimeInboundCount = deliveredOutsourcing.filter(
    (p) => p.actualArrivalDate && new Date(p.actualArrivalDate) <= new Date(p.promisedDate)
  ).length;
  const inboundOTIF = deliveredOutsourcing.length > 0
    ? Math.round((onTimeInboundCount / deliveredOutsourcing.length) * 100)
    : 92;

  // Finished Goods On-Time Delivery rate (OTD)
  const otdRate = Math.round(((totalOrders - highRiskOrders) / (totalOrders || 1)) * 100);

  // Average exception resolution hours
  const avgResolutionHours = '3.8 小時';

  const customerList = Array.from(new Set(orders.map((o) => o.customerName)));

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            F09 管理看板與改善成效
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            生產排單與外包進料即時監控中心
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">客戶篩選:</span>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">全部試行客戶</option>
              {customerList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">時程期間:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">全部排程期間</option>
              <option value="CURRENT_WEEK">本週交期</option>
              <option value="CURRENT_MONTH">近一個月</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>訂單準時交貨率 (OTD)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {otdRate}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">+2.4% vs 上季</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            目標 95.0% · 當前高風險受測訂單 {highRiskOrders} 筆
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>外包準時到料率 (OTIF Inbound)</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {inboundOTIF}%
            </span>
            <span className="text-xs text-slate-500">共 {outsourcing.length} 批採購單</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            富強熱處理等 1 批延遲中，已觸發 R01
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>異常平均處置時效 (MTTR)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {avgResolutionHours}
            </span>
            <span className="text-xs text-emerald-600 font-medium">優於 KPI 4hr</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            跨部門聯合排程會審平均於 2.5 小時內完成方案發布
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>即時待處理風險警示</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">
              {riskAlerts.length}
            </span>
            <span className="text-xs text-slate-500">件即時待審查</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            包含缺料預警、排程待評估與處置逾期
          </p>
        </div>
      </div>

      {/* Main Grid: Active Risk Alerts & Orders Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): High Risk Orders & Work Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Risk Alerts Panel */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>即時風險提醒雷達 (R01~R05 規則驅動)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  系統自動依「到料日 vs 物料需求日」、「交期變更評估」等規則即時計算
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('risks')}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <span>查看所有異常單</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {riskAlerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <RiskBadge code={alert.code} label={alert.title} />
                        {alert.relatedOrderNumber && (
                          <span className="text-xs font-mono font-medium text-slate-700">
                            {alert.relatedOrderNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span>觸發條件: {alert.triggerCondition}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-700 font-medium">建議行動: {alert.actionRequired}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col gap-1.5 items-end">
                      {alert.code === 'R02' && (
                        <button
                          onClick={() => onNavigateTab('scheduling')}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
                        >
                          啟動排程評估
                        </button>
                      )}
                      {alert.code === 'R01' && (
                        <button
                          onClick={() => onNavigateTab('outsourcing')}
                          className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors whitespace-nowrap"
                        >
                          追蹤外包進度
                        </button>
                      )}
                      {alert.code === 'R03' && (
                        <button
                          onClick={() => onNavigateTab('materials')}
                          className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors whitespace-nowrap"
                        >
                          品保放行檢驗
                        </button>
                      )}
                      {alert.code === 'R05' && (
                        <button
                          onClick={() => onNavigateTab('risks')}
                          className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors whitespace-nowrap"
                        >
                          督導異常結案
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {riskAlerts.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  目前所有訂單交期、外包到料與檢驗排程皆正常運作無風險。
                </div>
              )}
            </div>
          </div>

          {/* Customer Orders Overview Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  試行專案訂單交期與排程狀態
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  顯示目前納管之精密模組訂單、需求交期與承諾交期
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <span>訂單管理總表</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium">
                    <th className="py-2.5 px-4">訂單號</th>
                    <th className="py-2.5 px-4">客戶名稱</th>
                    <th className="py-2.5 px-4">產品料號 / 規格</th>
                    <th className="py-2.5 px-4 text-right">數量</th>
                    <th className="py-2.5 px-4 font-mono">需求交期</th>
                    <th className="py-2.5 px-4 font-mono">承諾交期</th>
                    <th className="py-2.5 px-4">狀態</th>
                    <th className="py-2.5 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">{ord.customerName}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-mono text-slate-900">{ord.partNumber}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {ord.partDescription}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                        {ord.quantity.toLocaleString()} {ord.unit}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700">
                        {ord.requestedDeliveryDate}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums font-medium text-slate-900">
                        {ord.promisedDeliveryDate}
                      </td>
                      <td className="py-2.5 px-4">
                        {ord.status === 'PENDING_EVALUATION' ? (
                          <RiskBadge code="R02" label="交期待評估" />
                        ) : ord.status === 'MATERIAL_SHORTAGE' ? (
                          <RiskBadge code="R01" label="外包缺料" />
                        ) : ord.status === 'RESCHEDULED' ? (
                          <span className="text-emerald-700 font-medium">排程已重排</span>
                        ) : (
                          <span className="text-slate-600">正常排產中</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => onOpenOrderChange(ord)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                        >
                          變更交期
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Cross-Department Sync & Recent Actions */}
        <div className="space-y-6">
          {/* Recent Exceptions Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                異常案件對策追蹤 (CAPA)
              </h3>
              <button
                onClick={() => onNavigateTab('risks')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                全部 ({exceptions.length})
              </button>
            </div>

            <div className="space-y-3">
              {exceptions.slice(0, 3).map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{exp.ticketNumber}</span>
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                        exp.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : exp.isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {exp.status === 'RESOLVED' ? '已結案' : exp.isOverdue ? '逾期處理中' : '處理中'}
                    </span>
                  </div>
                  <div className="text-slate-800 font-medium">{exp.reasonCategory}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>對策：</strong>{exp.countermeasure}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>責任人：{exp.ownerName}</span>
                    <span className="font-mono tabular-nums">預定完成：{exp.targetCompletionDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Collaboration Guide Box */}
          <div className="bg-slate-900 text-slate-200 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>協同作業決策原則</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              系統提供自動化規則提醒與 AI 輔助試算；<strong>排程調整及客戶交期承諾必須由生管與業務專人確認</strong>，並自動保留完整稽核變更歷程。
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>業務收到客戶異動 → 立即於 F02 登錄</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>採購更新外包預計到料日 → 系統連動 R01</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>生管評估排程並發布 → 業務回覆客戶確認函</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
