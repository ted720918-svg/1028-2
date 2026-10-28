import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PlusCircle } from 'lucide-react';

interface AddOrderModalProps {
  onClose: () => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ onClose }) => {
  const { addOrder } = useApp();
  const [customerName, setCustomerName] = useState('研華科技 (Advantech)');
  const [orderNumber, setOrderNumber] = useState(`SO-2026-${Math.floor(810 + Math.random() * 80)}`);
  const [partNumber, setPartNumber] = useState('ADV-MOD-8800');
  const [partDescription, setPartDescription] = useState('次世代高效邊緣 AI 工業推論卡');
  const [quantity, setQuantity] = useState(600);
  const [unit, setUnit] = useState('組');
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('2026-11-25');
  const [promisedDeliveryDate, setPromisedDeliveryDate] = useState('2026-11-25');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOrder({
      orderNumber,
      customerName,
      partNumber,
      partDescription,
      quantity: Number(quantity),
      unit,
      requestedDeliveryDate,
      promisedDeliveryDate,
      status: 'NORMAL',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              F01 新增客戶訂單
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              建立試行專案範圍內之客戶生產排單資料
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                客戶名稱 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                訂單號 (SO No.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                產品料號 (Part No.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                數量與單位 <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-2/3 px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-1/3 px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              品名規格說明
            </label>
            <input
              type="text"
              value={partDescription}
              onChange={(e) => setPartDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                客戶需求交期 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={requestedDeliveryDate}
                onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                預估承諾交期 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={promisedDeliveryDate}
                onChange={(e) => setPromisedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono tabular-nums focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>
          </div>

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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>建立訂單</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
