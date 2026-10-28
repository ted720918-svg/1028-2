/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { OrdersView } from './components/views/OrdersView';
import { OutsourcingView } from './components/views/OutsourcingView';
import { MaterialView } from './components/views/MaterialView';
import { SchedulingView } from './components/views/SchedulingView';
import { RiskExceptionsView } from './components/views/RiskExceptionsView';
import { CustomerRepliesView } from './components/views/CustomerRepliesView';
import { AuditLogView } from './components/views/AuditLogView';

// Modals
import { OrderChangeModal } from './components/modals/OrderChangeModal';
import { AddOrderModal } from './components/modals/AddOrderModal';
import { OutsourcingModal } from './components/modals/OutsourcingModal';
import { MaterialInspectionModal } from './components/modals/MaterialInspectionModal';
import { RescheduleModal } from './components/modals/RescheduleModal';
import { ExceptionModal } from './components/modals/ExceptionModal';
import { CustomerReplyModal } from './components/modals/CustomerReplyModal';
import { WorkflowWizardModal } from './components/modals/WorkflowWizardModal';

import { CustomerOrder, OutsourcingOrder, MaterialLot, WorkOrder, ExceptionTicket } from './types';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Modal states
  const [orderToChange, setOrderToChange] = useState<CustomerOrder | null>(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [poToEdit, setPoToEdit] = useState<OutsourcingOrder | null>(null);
  const [lotToInspect, setLotToInspect] = useState<MaterialLot | null>(null);
  const [woToReschedule, setWoToReschedule] = useState<WorkOrder | null>(null);
  const [ticketToEdit, setTicketToEdit] = useState<ExceptionTicket | null>(null);
  const [isCreateExceptionOpen, setIsCreateExceptionOpen] = useState(false);
  const [replyOrderNumber, setReplyOrderNumber] = useState<string | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isWorkflowWizardOpen, setIsWorkflowWizardOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header Contract */}
        <Header
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenWorkflowWizard={() => setIsWorkflowWizardOpen(true)}
        />

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={setCurrentTab}
                onOpenOrderChange={setOrderToChange}
                onOpenReschedule={setWoToReschedule}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersView
                onOpenAddOrder={() => setIsAddOrderOpen(true)}
                onOpenOrderChange={setOrderToChange}
              />
            )}

            {currentTab === 'outsourcing' && (
              <OutsourcingView onOpenOutsourcingModal={setPoToEdit} />
            )}

            {currentTab === 'materials' && (
              <MaterialView onOpenInspectionModal={setLotToInspect} />
            )}

            {currentTab === 'scheduling' && (
              <SchedulingView onOpenRescheduleModal={setWoToReschedule} />
            )}

            {currentTab === 'risks' && (
              <RiskExceptionsView
                onOpenCreateException={() => setIsCreateExceptionOpen(true)}
                onOpenEditException={setTicketToEdit}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'replies' && (
              <CustomerRepliesView
                onOpenReplyModal={(ordNo) => {
                  setReplyOrderNumber(ordNo || null);
                  setIsReplyModalOpen(true);
                }}
              />
            )}

            {currentTab === 'audit' && <AuditLogView />}
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      {orderToChange && (
        <OrderChangeModal order={orderToChange} onClose={() => setOrderToChange(null)} />
      )}

      {isAddOrderOpen && <AddOrderModal onClose={() => setIsAddOrderOpen(false)} />}

      {poToEdit && <OutsourcingModal po={poToEdit} onClose={() => setPoToEdit(null)} />}

      {lotToInspect && (
        <MaterialInspectionModal lot={lotToInspect} onClose={() => setLotToInspect(null)} />
      )}

      {woToReschedule && (
        <RescheduleModal workOrder={woToReschedule} onClose={() => setWoToReschedule(null)} />
      )}

      {ticketToEdit && (
        <ExceptionModal ticket={ticketToEdit} onClose={() => setTicketToEdit(null)} />
      )}

      {isCreateExceptionOpen && (
        <ExceptionModal onClose={() => setIsCreateExceptionOpen(false)} />
      )}

      {isReplyModalOpen && (
        <CustomerReplyModal
          orderNumber={replyOrderNumber || undefined}
          onClose={() => {
            setIsReplyModalOpen(false);
            setReplyOrderNumber(null);
          }}
        />
      )}

      {isWorkflowWizardOpen && (
        <WorkflowWizardModal
          onClose={() => setIsWorkflowWizardOpen(false)}
          onNavigateToTab={setCurrentTab}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
