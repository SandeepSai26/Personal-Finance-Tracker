import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Receipt,
  Grid,
  PieChart,
  BarChart3,
  HeartPulse,
  FileSpreadsheet,
  Settings,
  X,
} from 'lucide-react';

interface NavigationProps {
  desktopOpen: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onCloseDesktop: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ desktopOpen, mobileOpen, onCloseMobile, onCloseDesktop }) => {
  const { activeTab, setActiveTab, healthScore } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {
      id: 'health',
      label: 'Spending Health',
      icon: HeartPulse,
      badge: `${healthScore.score}/100`,
    },
    { id: 'summary', label: 'Monthly Summary', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
    // Only auto-close on desktop if the window is below a massive ultra-wide screen,
    // or just always auto-close since the user explicitly requested it.
    if (window.innerWidth >= 1024) {
      onCloseDesktop();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <nav className="space-y-1 p-3">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    healthScore.status === 'healthy'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : healthScore.status === 'attention'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Promo Card from Elegant Dark theme */}
      <div className="p-3 mt-auto">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Smart Financial Health</p>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Algorithmic Insights Active</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden ${desktopOpen ? 'lg:block' : ''} w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto shrink-0 transition-all duration-300`}>
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white text-base">Navigation</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
