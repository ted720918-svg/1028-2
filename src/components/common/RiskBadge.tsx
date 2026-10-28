import React from 'react';
import { RiskCode, RiskSeverity } from '../../types';
import { AlertTriangle, Clock, AlertOctagon, HelpCircle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  code?: RiskCode;
  severity?: RiskSeverity;
  label?: string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ code, severity, label, showIcon = true }) => {
  // Clean unboxed metadata with subtle color and icon - adhering to zero-pill discipline
  let colorClass = 'text-slate-600';
  let Icon = HelpCircle;
  let defaultLabel = label;

  switch (code) {
    case 'R01':
      colorClass = 'text-rose-600 font-medium';
      Icon = AlertOctagon;
      defaultLabel = defaultLabel || 'R01 缺料風險';
      break;
    case 'R02':
      colorClass = 'text-amber-600 font-medium';
      Icon = Clock;
      defaultLabel = defaultLabel || 'R02 待評估';
      break;
    case 'R03':
      colorClass = 'text-amber-500 font-medium';
      Icon = AlertTriangle;
      defaultLabel = defaultLabel || 'R03 待檢可能影響投產';
      break;
    case 'R04':
      colorClass = 'text-rose-600 font-medium';
      Icon = AlertOctagon;
      defaultLabel = defaultLabel || 'R04 交期風險';
      break;
    case 'R05':
      colorClass = 'text-rose-700 font-medium';
      Icon = AlertOctagon;
      defaultLabel = defaultLabel || 'R05 異常逾期';
      break;
    default:
      if (severity === 'HIGH') {
        colorClass = 'text-rose-600 font-medium';
        Icon = AlertOctagon;
      } else if (severity === 'MEDIUM') {
        colorClass = 'text-amber-600 font-medium';
        Icon = AlertTriangle;
      } else {
        colorClass = 'text-emerald-600 font-medium';
        Icon = CheckCircle2;
      }
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${colorClass}`}>
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="whitespace-nowrap">{defaultLabel}</span>
    </span>
  );
};
