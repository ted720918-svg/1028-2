import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  CustomerOrder,
  OutsourcingOrder,
  MaterialLot,
  WorkOrder,
  ExceptionTicket,
  CustomerReplyRecord,
  AuditLog,
  UserProfile,
  UserRole,
  RiskAlert,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_OUTSOURCING,
  INITIAL_MATERIALS,
  INITIAL_WORK_ORDERS,
  INITIAL_EXCEPTIONS,
  INITIAL_REPLY_RECORDS,
  INITIAL_AUDIT_LOGS,
} from '../mock/initialData';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  users: UserProfile[];
  orders: CustomerOrder[];
  outsourcing: OutsourcingOrder[];
  materials: MaterialLot[];
  workOrders: WorkOrder[];
  exceptions: ExceptionTicket[];
  replies: CustomerReplyRecord[];
  auditLogs: AuditLog[];
  riskAlerts: RiskAlert[];
  
  // Actions
  addOrder: (order: Omit<CustomerOrder, 'id' | 'updatedAt' | 'updatedBy' | 'changeLogs' | 'relatedWorkOrderIds' | 'relatedOutsourcingIds'>) => void;
  registerDeliveryChange: (orderId: string, newDate: string, reason: string, noticeReceivedTime: string) => void;
  updateOutsourcingExpectedDate: (poId: string, newExpectedDate: string, delayReason: string) => void;
  updateMaterialStatus: (lotId: string, status: MaterialLot['status'], defectNotes?: string) => void;
  updateWorkOrderSchedule: (woId: string, newStartDate: string, newEndDate: string, overtime?: boolean, note?: string) => void;
  createExceptionTicket: (ticket: Omit<ExceptionTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateExceptionTicket: (id: string, updates: Partial<ExceptionTicket>) => void;
  recordCustomerReply: (reply: Omit<CustomerReplyRecord, 'id' | 'createdAt' | 'recordedBy'>) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // default to PPC (陳建銘)

  // LocalStorage state initialization
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem('aps_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [outsourcing, setOutsourcing] = useState<OutsourcingOrder[]>(() => {
    const saved = localStorage.getItem('aps_outsourcing');
    return saved ? JSON.parse(saved) : INITIAL_OUTSOURCING;
  });

  const [materials, setMaterials] = useState<MaterialLot[]>(() => {
    const saved = localStorage.getItem('aps_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('aps_work_orders');
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  const [exceptions, setExceptions] = useState<ExceptionTicket[]>(() => {
    const saved = localStorage.getItem('aps_exceptions');
    return saved ? JSON.parse(saved) : INITIAL_EXCEPTIONS;
  });

  const [replies, setReplies] = useState<CustomerReplyRecord[]>(() => {
    const saved = localStorage.getItem('aps_replies');
    return saved ? JSON.parse(saved) : INITIAL_REPLY_RECORDS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('aps_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem('aps_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('aps_outsourcing', JSON.stringify(outsourcing));
  }, [outsourcing]);

  useEffect(() => {
    localStorage.setItem('aps_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('aps_work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem('aps_exceptions', JSON.stringify(exceptions));
  }, [exceptions]);

  useEffect(() => {
    localStorage.setItem('aps_replies', JSON.stringify(replies));
  }, [replies]);

  useEffect(() => {
    localStorage.setItem('aps_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper: append audit log
  const addAuditLog = (module: string, action: string, targetIdentifier: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      operator: currentUser.name,
      operatorRole: currentUser.role,
      module,
      action,
      targetIdentifier,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Reactive Risk Engine: dynamically recalculates R01 ~ R05
  const riskAlerts = useMemo<RiskAlert[]>(() => {
    const alerts: RiskAlert[] = [];
    const now = new Date('2026-10-26T20:54:00'); // simulated anchor datetime

    // R01: 外包預計到料日 晚於 工單物料需求日
    outsourcing.forEach((po) => {
      if (po.status !== 'DELIVERED_FULL') {
        const expected = new Date(po.expectedDate);
        const needed = new Date(po.materialNeededDate);
        if (expected > needed) {
          alerts.push({
            id: `risk-r01-${po.id}`,
            code: 'R01',
            severity: 'HIGH',
            title: `【R01 缺料風險】外包預計到料日晚於工單物料需求日`,
            description: `外包單 ${po.poNumber} (${po.vendorName}) 預計到料日 ${po.expectedDate} 已晚於工單物料需求日 ${po.materialNeededDate}。若未處置將衝擊後續組裝。`,
            relatedOrderNumber: po.orderNumber,
            relatedPoNumber: po.poNumber,
            triggerCondition: `預計到料日 (${po.expectedDate}) > 物料需求日 (${po.materialNeededDate})`,
            actionRequired: `採購確認廠商交期並協調加急；生管評估是否調整排程。`,
            targetRoles: ['PURCHASING', 'PPC'],
            detectedAt: po.updatedAt,
            isResolved: false,
          });
        }
      }
    });

    // R02: 客戶交期變更後，案件尚未完成排程評估
    orders.forEach((ord) => {
      const hasPendingEvaluation = ord.changeLogs.some((c) => !c.isEvaluatedByPPC);
      if (ord.status === 'PENDING_EVALUATION' || hasPendingEvaluation) {
        const latestChange = ord.changeLogs[0];
        alerts.push({
          id: `risk-r02-${ord.id}`,
          code: 'R02',
          severity: 'HIGH',
          title: `【R02 待評估】客戶交期變更後尚未完成排程評估`,
          description: `訂單 ${ord.orderNumber} (${ord.customerName}) 收到交期變更由 ${latestChange?.oldDate || '原交期'} 調整為 ${latestChange?.newDate || ord.requestedDeliveryDate}，生管尚未確認產能與排程可行性。`,
          relatedOrderNumber: ord.orderNumber,
          triggerCondition: `客戶於 ${latestChange?.noticeReceivedTime || ord.updatedAt} 提出交期變更，排程評估尚未發布。`,
          actionRequired: `生管確認物料、產能與其他訂單影響，完成排程調整與方案發布。`,
          targetRoles: ['PPC'],
          detectedAt: latestChange?.timestamp || ord.updatedAt,
          isResolved: false,
        });
      }
    });

    // R03: 物料已到廠，但接近需求日仍為「待檢」
    materials.forEach((mat) => {
      if (mat.arrivalDate && mat.status === 'PENDING_INSPECTION') {
        const relatedWo = workOrders.find((w) => w.id === mat.workOrderId);
        const neededDateStr = relatedWo ? relatedWo.materialNeededDate : '2026-10-28';
        const neededDate = new Date(neededDateStr);
        const arrival = new Date(mat.arrivalDate);
        const diffDays = Math.ceil((neededDate.getTime() - arrival.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays <= 3) {
          alerts.push({
            id: `risk-r03-${mat.id}`,
            code: 'R03',
            severity: 'MEDIUM',
            title: `【R03 待檢可能影響投產】進料已到廠但尚在庫存待檢中`,
            description: `批號 ${mat.lotNumber} (${mat.description}) 已於 ${mat.arrivalDate} 到廠，但仍處於待檢狀態，距離預計投產物料需求日僅約 ${diffDays} 天。`,
            relatedWoNumber: relatedWo?.woNumber,
            triggerCondition: `已到廠且狀態為「待檢」，距離物料需求日 ≤ 3 天。`,
            actionRequired: `品保儘速確認檢驗安排、優先放行或安排抽檢判定。`,
            targetRoles: ['QA', 'WAREHOUSE'],
            detectedAt: mat.updatedAt,
            isResolved: false,
          });
        }
      }
    });

    // R04: 工單預計完工日晚於客戶承諾交期
    workOrders.forEach((wo) => {
      const parentOrder = orders.find((o) => o.orderNumber === wo.orderNumber);
      if (parentOrder && wo.status !== 'COMPLETED') {
        const woEnd = new Date(wo.scheduledEndDate);
        const promisedEnd = new Date(parentOrder.promisedDeliveryDate);
        if (woEnd > promisedEnd) {
          alerts.push({
            id: `risk-r04-${wo.id}`,
            code: 'R04',
            severity: 'HIGH',
            title: `【R04 交期風險】工單預計完工日晚於客戶承諾交期`,
            description: `工單 ${wo.woNumber} (${wo.partDescription}) 預計完工日為 ${wo.scheduledEndDate}，晚於客戶承諾交期 ${parentOrder.promisedDeliveryDate}。`,
            relatedOrderNumber: wo.orderNumber,
            relatedWoNumber: wo.woNumber,
            triggerCondition: `工單完工日 (${wo.scheduledEndDate}) > 承諾交期 (${parentOrder.promisedDeliveryDate})`,
            actionRequired: `生管與製造確認排產方案（加班/插單/調機）；業務視需要與客戶協調交期展延。`,
            targetRoles: ['PPC', 'MFG', 'SALES'],
            detectedAt: wo.updatedAt,
            isResolved: false,
          });
        }
      }
    });

    // R05: 異常案件超過預計處理完成時間
    exceptions.forEach((exp) => {
      if (exp.status !== 'RESOLVED') {
        const targetDate = new Date(exp.targetCompletionDate);
        if (now > targetDate) {
          alerts.push({
            id: `risk-r05-${exp.id}`,
            code: 'R05',
            severity: 'HIGH',
            title: `【R05 異常處理逾期】異常案件已超過預計完成時間`,
            description: `異常單 ${exp.ticketNumber} (${exp.reasonCategory}) 預計完成時間為 ${exp.targetCompletionDate}，責任人為 ${exp.ownerName} (${exp.ownerDepartment})，目前仍未結案。`,
            relatedOrderNumber: exp.relatedOrderNumber,
            triggerCondition: `當前時間已超過對策預計完成時間 (${exp.targetCompletionDate}) 且狀態未結案。`,
            actionRequired: `責任人立即更新原因、處理進度與新的預計完成時間；主管介入督導。`,
            targetRoles: ['PPC', 'MANAGEMENT'],
            detectedAt: exp.updatedAt,
            isResolved: false,
          });
        }
      }
    });

    return alerts;
  }, [orders, outsourcing, materials, workOrders, exceptions]);

  // F01: Add Customer Order
  const addOrder = (orderData: Omit<CustomerOrder, 'id' | 'updatedAt' | 'updatedBy' | 'changeLogs' | 'relatedWorkOrderIds' | 'relatedOutsourcingIds'>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newOrder: CustomerOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      status: 'NORMAL',
      updatedBy: currentUser.name,
      updatedAt: timestamp,
      changeLogs: [],
      relatedWorkOrderIds: [],
      relatedOutsourcingIds: [],
    };
    setOrders((prev) => [newOrder, ...prev]);
    addAuditLog('訂單管理', '新增客戶訂單', newOrder.orderNumber, `建立訂單 ${newOrder.orderNumber}，客戶: ${newOrder.customerName}，料號: ${newOrder.partNumber}`);
  };

  // F02: Customer delivery date change
  const registerDeliveryChange = (orderId: string, newDate: string, reason: string, noticeReceivedTime: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const changeLog = {
          id: `cl-${Date.now()}`,
          timestamp,
          changedBy: currentUser.name,
          role: currentUser.role,
          oldDate: ord.requestedDeliveryDate,
          newDate,
          reason,
          noticeReceivedTime,
          isEvaluatedByPPC: false,
        };
        return {
          ...ord,
          requestedDeliveryDate: newDate,
          status: 'PENDING_EVALUATION',
          updatedBy: currentUser.name,
          updatedAt: timestamp,
          changeLogs: [changeLog, ...ord.changeLogs],
        };
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      addAuditLog(
        '客戶交期登錄',
        '登錄客戶交期變更',
        targetOrder.orderNumber,
        `原交期 ${targetOrder.requestedDeliveryDate} 變更為 ${newDate}，原因: ${reason}，系統標註待評估 (R02)`
      );
    }
  };

  // F03: Outsourcing expected date update
  const updateOutsourcingExpectedDate = (poId: string, newExpectedDate: string, delayReason: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setOutsourcing((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        const oldVal = po.expectedDate;
        const isDelayed = new Date(newExpectedDate) > new Date(po.materialNeededDate);
        const newStatus = isDelayed ? 'DELAYED' : po.status;
        const newLog = {
          timestamp,
          updatedBy: currentUser.name,
          field: '預計到料日',
          oldVal,
          newVal: newExpectedDate,
          reason: delayReason,
        };
        return {
          ...po,
          expectedDate: newExpectedDate,
          delayReason: delayReason || po.delayReason,
          status: newStatus,
          updatedBy: currentUser.name,
          updatedAt: timestamp,
          historyLogs: [newLog, ...po.historyLogs],
        };
      })
    );

    const targetPo = outsourcing.find((p) => p.id === poId);
    if (targetPo) {
      const isLate = new Date(newExpectedDate) > new Date(targetPo.materialNeededDate);
      addAuditLog(
        '外包管理',
        '更新預計到料日',
        targetPo.poNumber,
        `廠商: ${targetPo.vendorName}，預計到料日由 ${targetPo.expectedDate} 更新為 ${newExpectedDate}。${isLate ? '【警示：已晚於物料需求日觸發 R01】' : '排程正常'}。原因: ${delayReason}`
      );
    }
  };

  // F04: Material Status Update (QA inspection or Warehouse)
  const updateMaterialStatus = (lotId: string, status: MaterialLot['status'], defectNotes?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setMaterials((prev) =>
      prev.map((mat) => {
        if (mat.id !== lotId) return mat;
        return {
          ...mat,
          status,
          inspector: currentUser.name,
          inspectedAt: timestamp,
          defectNotes: defectNotes || mat.defectNotes,
          updatedBy: currentUser.name,
          updatedAt: timestamp,
        };
      })
    );

    const targetMat = materials.find((m) => m.id === lotId);
    if (targetMat) {
      addAuditLog(
        '物料品管',
        '更新物料可用狀態',
        targetMat.lotNumber,
        `狀態更新為「${status}」，判定人員: ${currentUser.name}${defectNotes ? `，備註: ${defectNotes}` : ''}`
      );
    }
  };

  // F05: Work Order Reschedule
  const updateWorkOrderSchedule = (woId: string, newStartDate: string, newEndDate: string, overtime?: boolean, note?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let targetOrderNumber = '';

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== woId) return wo;
        targetOrderNumber = wo.orderNumber;
        const [major, minor] = wo.version.replace('v', '').split('.').map(Number);
        const newVersion = `v${major}.${(minor || 0) + 1}`;
        return {
          ...wo,
          scheduledStartDate: newStartDate,
          scheduledEndDate: newEndDate,
          overtimeScheduled: overtime !== undefined ? overtime : wo.overtimeScheduled,
          version: newVersion,
          plannerName: currentUser.name,
          updatedAt: timestamp,
        };
      })
    );

    // If order was in PENDING_EVALUATION, mark evaluated and sync promisedDeliveryDate if needed
    if (targetOrderNumber) {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.orderNumber !== targetOrderNumber) return ord;
          const updatedChangeLogs = ord.changeLogs.map((c) => ({
            ...c,
            isEvaluatedByPPC: true,
            evaluationNote: note || `生管完成排程評估，完工日修訂為 ${newEndDate}`,
          }));
          return {
            ...ord,
            promisedDeliveryDate: newEndDate, // updated promised delivery commitment
            status: 'RESCHEDULED',
            updatedBy: currentUser.name,
            updatedAt: timestamp,
            changeLogs: updatedChangeLogs,
          };
        })
      );
    }

    const targetWo = workOrders.find((w) => w.id === woId);
    if (targetWo) {
      addAuditLog(
        '生產排程',
        '更新排程完工日',
        targetWo.woNumber,
        `開完工日調整為 ${newStartDate} ~ ${newEndDate}${overtime ? ' (啟動加班模式)' : ''}，關聯訂單 ${targetOrderNumber} 完成評估。`
      );
    }
  };

  // F07: Exception tickets
  const createExceptionTicket = (ticket: Omit<ExceptionTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const count = exceptions.length + 1;
    const ticketNumber = `EXP-2026-${count.toString().padStart(3, '0')}`;
    const newTicket: ExceptionTicket = {
      ...ticket,
      id: `exp-${Date.now()}`,
      ticketNumber,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setExceptions((prev) => [newTicket, ...prev]);
    addAuditLog('異常追蹤', '開立異常處理單', ticketNumber, `責任人: ${newTicket.ownerName}，原因: ${newTicket.reasonCategory}，對策: ${newTicket.countermeasure}`);
  };

  const updateExceptionTicket = (id: string, updates: Partial<ExceptionTicket>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setExceptions((prev) =>
      prev.map((exp) => {
        if (exp.id !== id) return exp;
        return {
          ...exp,
          ...updates,
          updatedAt: timestamp,
        };
      })
    );
    const exp = exceptions.find((e) => e.id === id);
    if (exp) {
      addAuditLog('異常追蹤', '更新異常進度', exp.ticketNumber, `狀態: ${updates.status || exp.status}，對策調整或結案確認`);
    }
  };

  // F08: Customer Delivery Reply Records
  const recordCustomerReply = (replyData: Omit<CustomerReplyRecord, 'id' | 'createdAt' | 'recordedBy'>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRecord: CustomerReplyRecord = {
      ...replyData,
      id: `rep-${Date.now()}`,
      recordedBy: currentUser.name,
      createdAt: timestamp,
    };
    setReplies((prev) => [newRecord, ...prev]);
    addAuditLog(
      '客戶交期回覆',
      '記錄客戶溝通結果',
      replyData.orderNumber,
      `建議交期: ${replyData.proposedDeliveryDate}，確認人: ${replyData.confirmedBy}，客戶回應: ${replyData.customerResponse}`
    );
  };

  // Reset all to clean initial demo state
  const resetAllData = () => {
    setOrders(INITIAL_ORDERS);
    setOutsourcing(INITIAL_OUTSOURCING);
    setMaterials(INITIAL_MATERIALS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setExceptions(INITIAL_EXCEPTIONS);
    setReplies(INITIAL_REPLY_RECORDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        orders,
        outsourcing,
        materials,
        workOrders,
        exceptions,
        replies,
        auditLogs,
        riskAlerts,
        addOrder,
        registerDeliveryChange,
        updateOutsourcingExpectedDate,
        updateMaterialStatus,
        updateWorkOrderSchedule,
        createExceptionTicket,
        updateExceptionTicket,
        recordCustomerReply,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
