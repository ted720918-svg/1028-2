import React, { useState } from 'react';
import { MaterialLot, MaterialInspectionStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, AlertTriangle, ShieldCheck, Box } from 'lucide-react';

interface MaterialInspectionModalProps {
  lot: MaterialLot;
  onClose: () => void;
}

export const MaterialInspectionModal: React.FC<MaterialInspectionModalProps> = ({ lot, onClose }) => {
  const { updateMaterialStatus, currentUser } = useApp();
  const [status, setStatus] = useState<MaterialInspectionStatus>(lot.status);
  const [defectNotes, setDefectNotes] = useState(lot.defectNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMaterialStatus(lot.id, status, defectNotes);
    onClose();
  };

  const statusOptions: { value: MaterialInspectionStatus; label: string; desc: string }[] = [
    { value: 'NOT_ARRIVED', label: '未到料', desc: '物料仍在供應商端或物流途中' },
    { value: 'PENDING_INSPECTION', label: '待檢', desc: '已進廠抵達收料碼頭，等待品保驗收 (若逼近需求日觸發 R03)' },
    { value: 'PASSED_PENDING_IN', label: '合格待入庫', desc: '品檢通過，等待倉儲完成入庫上架' },
    { value: 'AVAILABLE', label: '可領用', desc: '已完全入庫上架，生管與製造產線可直接開立領料' },
    { value: 'REJECTED', label: '不合格', desc: '檢驗未通過，退回供應商或判定特採重工' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              F04 物料可用狀態與品管檢驗
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              進料批號：{lot.lotNumber} · 料號：{lot.partNumber}
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
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500">品名規格：</span>
              <span className="font-medium text-slate-800 ml-1">{lot.description}</span>
            </div>
            <div>
              <span className="text-slate-500">進貨數量：</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800 ml-1">
                {lot.quantity.toLocaleString()} pcs
              </span>
            </div>
            <div>
              <span className="text-slate-500">供料廠商：</span>
              <span className="font-medium text-slate-800 ml-1">{lot.vendorName}</span>
            </div>
            <div>
              <span className="text-slate-500">存放位置：</span>
              <span className="font-mono text-slate-800 ml-1">{lot.storageLocation || '待指派儲位'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              選擇物料流轉與可用狀態 <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-2.5 rounded-md border cursor-pointer transition-colors ${
                    status === opt.value
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-medium text-slate-900">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              品檢結果備註 / 缺陷紀錄
            </label>
            <textarea
              rows={2}
              value={defectNotes}
              onChange={(e) => setDefectNotes(e.target.value)}
              placeholder="記錄檢驗報告單號、抽檢良率、外觀尺寸測量或特採說明..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>檢驗操作人：{currentUser.name} ({currentUser.department})</span>
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
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
              >
                儲存狀態判定
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
