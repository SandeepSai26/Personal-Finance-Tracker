import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { CategoriesView } from './components/CategoriesView';
import { BudgetsView } from './components/BudgetsView';
import { AnalyticsView } from './components/AnalyticsView';
import { GoodVsBadView } from './components/GoodVsBadView';
import { SummaryView } from './components/SummaryView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';

const MainContent: React.FC = () => {
  const { activeTab, isAddModalOpen, setIsAddModalOpen, editingTransaction, setEditingTransaction } = useFinance();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleNav = () => {
    // For mobile it opens the drawer, for desktop it toggles the sidebar
    if (window.innerWidth >= 1024) {
      setSidebarOpen(prev => !prev);
    } else {
      setMobileNavOpen(prev => !prev);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'categories':
        return <CategoriesView />;
      case 'budgets':
        return <BudgetsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'health':
        return <GoodVsBadView />;
      case 'summary':
        return <SummaryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Header */}
      <Header onToggleMobileNav={toggleNav} />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Navigation 
          desktopOpen={sidebarOpen}
          mobileOpen={mobileNavOpen} 
          onCloseMobile={() => setMobileNavOpen(false)} 
          onCloseDesktop={() => setSidebarOpen(false)}
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* Add / Edit Transaction Global Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        editingTransaction={editingTransaction}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}
