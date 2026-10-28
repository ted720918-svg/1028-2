export type UserRole = 
  | 'PPC'         // 生管
  | 'SALES'       // 業務
  | 'PURCHASING'  // 採購
  | 'MFG'         // 製造
  | 'WAREHOUSE'   // 倉儲
  | 'QA'          // 品保
  | 'MANAGEMENT'  // 管理階層
  | 'ADMIN';      // 系統管理員

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  department: string;
}

export type OrderStatus = 'NORMAL' | 'PENDING_EVALUATION' | 'MATERIAL_SHORTAGE' | 'RESCHEDULED' | 'COMPLETED';

export interface DeliveryChangeLog {
  id: string;
  timestamp: string;
  changedBy: string;
  role: UserRole;
  oldDate: string;
  newDate: string;
  reason: string;
  noticeReceivedTime: string;
  isEvaluatedByPPC: boolean;
  evaluationNote?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;        // 訂單號 (e.g., SO-2026-801)
  customerName: string;       // 客戶
  partNumber: string;         // 料號
  partDescription: string;    // 品名規格
  quantity: number;           // 數量
  unit: string;               // 單位 (pcs, sets)
  requestedDeliveryDate: string; // 需求交期
  promisedDeliveryDate: string;  // 承諾交期
  status: OrderStatus;
  updatedBy: string;
  updatedAt: string;
  changeLogs: DeliveryChangeLog[];
  relatedWorkOrderIds: string[];
  relatedOutsourcingIds: string[];
}

export type OutsourcingStatus = 'SCHEDULED' | 'IN_PRODUCTION' | 'DELAYED' | 'DELIVERED_PARTIAL' | 'DELIVERED_FULL';

export interface OutsourcingOrder {
  id: string;
  poNumber: string;           // 外包單號 (e.g., PO-EXT-401)
  orderNumber: string;        // 關聯客戶訂單
  partNumber: string;         // 外包料號
  description: string;        // 外包製程/零件 (e.g., CNC精密銑削、陽極氧化硬化)
  vendorName: string;         // 廠商
  quantity: number;
  promisedDate: string;       // 廠商承諾日
  expectedDate: string;       // 預計到料日
  actualArrivalDate?: string; // 實際到料日
  delayReason?: string;       // 延遲原因
  progressPercent: number;    // 進度 %
  status: OutsourcingStatus;
  materialNeededDate: string; // 下游工單物料需求日 (MBD)
  updatedBy: string;
  updatedAt: string;
  historyLogs: {
    timestamp: string;
    updatedBy: string;
    field: string;
    oldVal: string;
    newVal: string;
    reason?: string;
  }[];
}

export type MaterialInspectionStatus = 
  | 'NOT_ARRIVED'       // 未到料
  | 'PENDING_INSPECTION'// 待檢
  | 'PASSED_PENDING_IN' // 合格待入庫
  | 'AVAILABLE'         // 可領用
  | 'REJECTED';         // 不合格

export interface MaterialLot {
  id: string;
  lotNumber: string;
  partNumber: string;
  description: string;
  vendorName: string;
  quantity: number;
  arrivalDate?: string;
  status: MaterialInspectionStatus;
  inspector?: string;
  inspectedAt?: string;
  defectNotes?: string;
  workOrderId?: string;
  storageLocation?: string;
  updatedBy: string;
  updatedAt: string;
}

export type WorkOrderStatus = 'DRAFT' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';

export interface WorkOrder {
  id: string;
  woNumber: string;           // 工單號 (e.g., WO-2026-101)
  orderNumber: string;        // 關聯訂單
  partNumber: string;
  partDescription: string;
  quantity: number;
  processName: string;        // 製程 (SMT表面貼焊、CNC精密加工、潔淨室組裝、出貨FQC)
  equipment: string;          // 設備/產線 (Line-A, CNC-04, Assembly-02)
  scheduledStartDate: string; // 預計開工日
  scheduledEndDate: string;   // 預計完工日
  materialNeededDate: string; // 物料需求日
  priority: number;           // 1(高), 2(中), 3(低)
  status: WorkOrderStatus;
  version: string;            // 排程版本 e.g. v1.0, v1.2
  plannerName: string;
  updatedAt: string;
  overtimeScheduled?: boolean;// 是否安排加班
}

export type RiskCode = 'R01' | 'R02' | 'R03' | 'R04' | 'R05';
export type RiskSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskAlert {
  id: string;
  code: RiskCode;
  severity: RiskSeverity;
  title: string;
  description: string;
  relatedOrderNumber?: string;
  relatedWoNumber?: string;
  relatedPoNumber?: string;
  triggerCondition: string;
  actionRequired: string;
  targetRoles: UserRole[];
  detectedAt: string;
  isResolved: boolean;
}

export type ExceptionStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface ExceptionTicket {
  id: string;
  ticketNumber: string;       // EXP-2026-001
  riskCode: RiskCode;
  relatedOrderNumber: string;
  relatedEntity: string;      // 例如 PO-EXT-401 或 WO-2026-102
  reasonCategory: string;     // 廠商交期延宕 / 客戶突發變更 / 品檢異常 / 機台負荷超載
  rootCause: string;
  ownerName: string;          // 責任人
  ownerDepartment: string;    // 責任部門
  countermeasure: string;     // 處置對策
  targetCompletionDate: string; // 預計完成時間
  actualCompletionDate?: string;
  status: ExceptionStatus;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

export type CustomerReplyResult = 'ACCEPTED' | 'NEGOTIATING' | 'REJECTED';

export interface CustomerReplyRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  proposedDeliveryDate: string; // 內部確認後建議交期
  confirmedBy: string;          // 內部確認人 (生管主管)
  replyTime: string;            // 回覆客戶時間
  customerResponse: CustomerReplyResult; // 客戶回覆
  customerFeedbackNotes: string; // 客戶備註
  recordedBy: string;           // 業務負責人
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  operatorRole: UserRole;
  module: string;             // 訂單管理, 外包到料, 物料檢驗, 生產排程, 異常追蹤, 系統設定
  action: string;             // 新增, 變更交期, 調整排程, 放行入庫, 結案
  targetIdentifier: string;   // 單號
  details: string;
}
