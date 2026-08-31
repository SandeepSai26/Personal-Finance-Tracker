import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, parseYearMonthDay } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  PieChart,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const {
    categories,
    budgets,
    transactions,
    saveBudget,
    deleteBudget,
    selectedMonth,
    selectedYear,
  } = useFinance();

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [budgetAmountInput, setBudgetAmountInput] = useState<string>('');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Filter current month transactions
  const currentMonthTx = transactions.filter(t => {
    const { month, year } = parseYearMonthDay(t.date);
    return month === selectedMonth && year === selectedYear;
  });

  // Category map
  const catMap = new Map(categories.map(c => [c.id, c]));

  // Calculate totals
  const totalBudgeted = budgets
    .filter(b => b.month === selectedMonth && b.year === selectedYear)
    .reduce((sum, b) => sum + b.amount, 0);

  const totalSpentInBudgetedCategories = budgets
    .filter(b => b.month === selectedMonth && b.year === selectedYear)
    .reduce((sum, b) => {
      const catSpent = currentMonthTx
        .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
        .reduce((acc, t) => acc + t.amount, 0);
      return sum + catSpent;
    }, 0);

  const totalRemaining = totalBudgeted - totalSpentInBudgetedCategories;
  const totalPct = totalBudgeted > 0 ? (totalSpentInBudgetedCategories / totalBudgeted) * 100 : 0;

  const handleSaveBudget = (categoryId: string) => {
    const amt = parseFloat(budgetAmountInput);
    if (!isNaN(amt) && amt >= 0) {
      saveBudget(categoryId, amt);
    }
    setEditingCategoryId(null);
    setBudgetAmountInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Monthly Budget Planner</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set and monitor monthly category budgets with automated threshold warnings
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              August 2026 Budget Overview
            </span>
            <div className="text-3xl font-black">{formatCurrency(totalBudgeted)}</div>
            <p className="text-xs text-slate-400">Total Allocated Monthly Budget</p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-slate-400 font-medium">Spent So Far</div>
              <div className="text-lg font-bold text-rose-400">
                {formatCurrency(totalSpentInBudgetedCategories)}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700" />

            <div>
              <div className="text-xs text-slate-400 font-medium">Remaining Pool</div>
              <div
                className={`text-lg font-bold ${
                  totalRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(totalRemaining)}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block" />

            <div className="hidden sm:block">
              <div className="text-xs text-slate-400 font-medium">Utilization</div>
              <div className="text-lg font-bold text-purple-400">{totalPct.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-slate-700/60 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalPct >= 100
                ? 'bg-rose-500'
                : totalPct >= 90
                ? 'bg-amber-500'
                : totalPct >= 75
                ? 'bg-yellow-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, totalPct)}%` }}
          />
        </div>
      </div>

      {/* Categories Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenseCategories.map(cat => {
          const b = budgets.find(
            b => b.categoryId === cat.id && b.month === selectedMonth && b.year === selectedYear
          );
          const budgetAmt = b ? b.amount : 0;

          const spent = currentMonthTx
            .filter(t => t.type === 'expense' && t.categoryId === cat.id)
            .reduce((sum, t) => sum + t.amount, 0);

          const remaining = budgetAmt - spent;
          const pct = budgetAmt > 0 ? (spent / budgetAmt) * 100 : 0;

          const isEditing = editingCategoryId === cat.id;

          // Threshold Warnings:
          // 75% -> Attention (Yellow)
          // 90% -> Warning (Amber)
          // 100%+ -> Over budget (Red)
          let statusColor = 'emerald';
          let statusBadge = '🟢 Within Budget';
          if (budgetAmt > 0) {
            if (pct >= 100) {
              statusColor = 'rose';
              statusBadge = '🔴 Over Budget (100%+)';
            } else if (pct >= 90) {
              statusColor = 'amber';
              statusBadge = '🟠 Warning (90%+)';
            } else if (pct >= 75) {
              statusColor = 'yellow';
              statusBadge = '🟡 Attention (75%+)';
            }
          }

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {statusBadge}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingCategoryId(cat.id);
                    setBudgetAmountInput(budgetAmt > 0 ? budgetAmt.toString() : '');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  title="Edit Budget"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Form Inline */}
              {isEditing ? (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Set Monthly Budget (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 6000"
                      value={budgetAmountInput}
                      onChange={e => setBudgetAmountInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleSaveBudget(cat.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCategoryId(null)}
                      className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Budget Info */
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">
                      Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(spent)}</strong>
                    </span>
                    <span className="text-slate-500">
                      Limit: <strong className="text-slate-900 dark:text-white">{budgetAmt > 0 ? formatCurrency(budgetAmt) : 'Unset'}</strong>
                    </span>
                  </div>

                  {budgetAmt > 0 ? (
                    <>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 100
                              ? 'bg-rose-600'
                              : pct >= 90
                              ? 'bg-amber-500'
                              : pct >= 75
                              ? 'bg-yellow-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span
                          className={`${
                            pct >= 100
                              ? 'text-rose-600 font-extrabold'
                              : pct >= 90
                              ? 'text-amber-600'
                              : pct >= 75
                              ? 'text-yellow-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {pct.toFixed(0)}% used
                        </span>
                        <span className="text-slate-500">
                          {remaining >= 0
                            ? `${formatCurrency(remaining)} left`
                            : `${formatCurrency(Math.abs(remaining))} over budget`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCategoryId(cat.id);
                        setBudgetAmountInput('');
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Set budget limit
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
