import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Category, TransactionType } from '../types';
import { formatCurrency, parseYearMonthDay } from '../utils/formatters';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from './CategoryIcon';
import { Plus, Edit2, Trash2, X, Check, Target, AlertTriangle } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const {
    categories,
    budgets,
    transactions,
    addCategory,
    updateCategory,
    deleteCategory,
    saveBudget,
    selectedMonth,
    selectedYear,
  } = useFinance();

  const [activeTabType, setActiveTabType] = useState<TransactionType>('expense');

  // Modal State for Add / Edit Category
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);

  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<TransactionType>('expense');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catColor, setCatColor] = useState('#10b981');
  const [catIsEssential, setCatIsEssential] = useState(false);
  const [catBudget, setCatBudget] = useState('');

  // Filter current month transactions
  const currentMonthTx = transactions.filter(t => {
    const { month, year } = parseYearMonthDay(t.date);
    return month === selectedMonth && year === selectedYear;
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setCatType(activeTabType);
    setCatIcon('Tag');
    setCatColor('#10b981');
    setCatIsEssential(false);
    setCatBudget('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setCatIsEssential(!!cat.isEssential);

    const b = budgets.find(
      b => b.categoryId === cat.id && b.month === selectedMonth && b.year === selectedYear
    );
    setCatBudget(b ? b.amount.toString() : '');

    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: catName.trim(),
        type: catType,
        icon: catIcon,
        color: catColor,
        isEssential: catIsEssential,
      });

      if (catType === 'expense' && catBudget.trim()) {
        const amt = parseFloat(catBudget);
        if (!isNaN(amt)) {
          saveBudget(editingCategory.id, amt);
        }
      }
    } else {
      addCategory({
        userId: 'user_1',
        name: catName.trim(),
        type: catType,
        icon: catIcon,
        color: catColor,
        isEssential: catIsEssential,
      });

      if (catType === 'expense' && catBudget.trim()) {
        const amt = parseFloat(catBudget);
        if (!isNaN(amt)) {
          // Note: new cat ID handled via callback if needed, or saveBudget after update
        }
      }
    }

    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter(c => c.type === activeTabType);

  const COLOR_PALETTE = [
    '#f97316',
    '#16a34a',
    '#0284c7',
    '#8b5cf6',
    '#eab308',
    '#ef4444',
    '#06b6d4',
    '#ec4899',
    '#a855f7',
    '#14b8a6',
    '#6366f1',
    '#f43f5e',
    '#10b981',
    '#64748b',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Category & Budget Setup</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage spending categories, icons, colors, and monthly budget limits
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTabType('expense')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTabType === 'expense'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Expense Categories ({categories.filter(c => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTabType('income')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTabType === 'income'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Income Categories ({categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(cat => {
          // Calculate current spent
          const spent = currentMonthTx
            .filter(t => t.type === cat.type && t.categoryId === cat.id)
            .reduce((sum, t) => sum + t.amount, 0);

          // Get budget
          const b = budgets.find(
            b => b.categoryId === cat.id && b.month === selectedMonth && b.year === selectedYear
          );
          const budgetAmount = b ? b.amount : 0;
          const remaining = budgetAmount - spent;
          const pctUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4 relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      {cat.name}
                      {cat.isEssential && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">
                          Essential
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {cat.type === 'expense' ? 'Expense' : 'Income'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingCat(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expense Category Budget Progress Bar */}
              {cat.type === 'expense' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(spent)}</strong>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Budget: {budgetAmount > 0 ? formatCurrency(budgetAmount) : 'Not Set'}
                    </span>
                  </div>

                  {budgetAmount > 0 ? (
                    <>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pctUsed >= 100
                              ? 'bg-rose-600'
                              : pctUsed >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, pctUsed)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span
                          className={`${
                            pctUsed >= 100
                              ? 'text-rose-600 font-bold'
                              : pctUsed >= 75
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {pctUsed.toFixed(0)}% used
                        </span>
                        <span className="text-slate-500">
                          {remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No budget set for this month.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingCategory ? 'Edit Category' : 'Create Custom Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dining Out, Gym, Investment"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Type */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCatType('expense')}
                  className={`py-1.5 rounded-lg font-semibold text-xs transition-all ${
                    catType === 'expense' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Expense Category
                </button>
                <button
                  type="button"
                  onClick={() => setCatType('income')}
                  className={`py-1.5 rounded-lg font-semibold text-xs transition-all ${
                    catType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Income Category
                </button>
              </div>

              {/* Monthly Budget Limit (For expense categories) */}
              {catType === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Monthly Budget Limit (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 6000"
                    value={catBudget}
                    onChange={e => setCatBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Select Icon
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                  {AVAILABLE_CATEGORY_ICONS.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setCatIcon(iconName)}
                      className={`p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all ${
                        catIcon === iconName ? 'bg-emerald-500 text-white shadow-xs' : ''
                      }`}
                    >
                      <CategoryIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Accent Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCatColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        catColor === color ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Essential Checkbox */}
              {catType === 'expense' && (
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={catIsEssential}
                    onChange={e => setCatIsEssential(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Essential Expense (Rent, Groceries, Bills, Healthcare, etc.)
                  </span>
                </label>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete category <strong className="text-slate-900 dark:text-white">{deletingCat.name}</strong>? Associated budgets will also be removed.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCat(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCategory(deletingCat.id);
                  setDeletingCat(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
