import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, PaymentMethod, TransactionType } from '../types';
import { formatCurrency, formatDate, parseLocalDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  Eye,
  X,
  Calendar,
  CreditCard,
  Tag,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    categories,
    deleteTransaction,
    clearAllTransactions,
    setIsAddModalOpen,
    setEditingTransaction,
    searchQuery,
    setSearchQuery,
  } = useFinance();

  // Filters State
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  // Sorting State
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Transaction Detail & Delete Modal
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);

  // Category map
  const catMap = useMemo(() => {
    const map = new Map<string, typeof categories[0]>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filtered and Sorted list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const cat = catMap.get(tx.categoryId);
          const matchesMerchant = tx.merchant.toLowerCase().includes(q);
          const matchesDesc = tx.description?.toLowerCase().includes(q);
          const matchesCategory = cat?.name.toLowerCase().includes(q);
          const matchesSubcat = tx.subcategory?.toLowerCase().includes(q);
          const matchesTags = tx.tags?.some(t => t.toLowerCase().includes(q));

          if (!matchesMerchant && !matchesDesc && !matchesCategory && !matchesSubcat && !matchesTags) {
            return false;
          }
        }

        // Type filter
        if (filterType !== 'all' && tx.type !== filterType) {
          return false;
        }

        // Category filter
        if (filterCategory !== 'all' && tx.categoryId !== filterCategory) {
          return false;
        }

        // Payment Method filter
        if (filterPaymentMethod !== 'all' && tx.paymentMethod !== filterPaymentMethod) {
          return false;
        }

        // Date range
        if (startDate && tx.date < startDate) return false;
        if (endDate && tx.date > endDate) return false;

        // Amount range
        if (minAmount && tx.amount < parseFloat(minAmount)) return false;
        if (maxAmount && tx.amount > parseFloat(maxAmount)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          const timeA = parseLocalDate(a.date).getTime();
          const timeB = parseLocalDate(b.date).getTime();
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        } else if (sortBy === 'amount') {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        } else if (sortBy === 'category') {
          const catA = catMap.get(a.categoryId)?.name || '';
          const catB = catMap.get(b.categoryId)?.name || '';
          return sortOrder === 'asc' ? catA.localeCompare(catB) : catB.localeCompare(catA);
        }
        return 0;
      });
  }, [
    transactions,
    searchQuery,
    filterType,
    filterCategory,
    filterPaymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy,
    sortOrder,
    catMap,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterPaymentMethod('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, search, filter and manage all financial records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Delete all transactions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Top Search & Primary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant, notes, tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types (Income & Expense)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={filterPaymentMethod}
              onChange={e => setFilterPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters (Date & Amount Ranges) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Min Amount (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={e => setMinAmount(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Max Amount (₹)</label>
              <input
                type="number"
                placeholder="100000"
                value={maxAmount}
                onChange={e => setMaxAmount(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold underline underline-offset-2 shrink-0"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Sorting Controls & Stats Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredTransactions.length}</span> of {transactions.length} transactions
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white font-semibold cursor-pointer"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            title={`Order: ${sortOrder}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Merchant / Payer</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(tx => {
                const cat = catMap.get(tx.categoryId);
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 font-medium whitespace-nowrap text-slate-900 dark:text-white">
                      {formatDate(tx.date)}
                    </td>

                    {/* Merchant / Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {tx.merchant}
                      </div>
                      {tx.description && (
                        <div className="text-[11px] text-slate-400 line-clamp-1">{tx.description}</div>
                      )}
                      {tx.tags && tx.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tx.tags.map(t => (
                            <span key={t} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-semibold rounded-md lowercase">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${cat?.color || '#10b981'}15`,
                            color: cat?.color || '#10b981',
                          }}
                        >
                          <CategoryIcon name={cat?.icon || 'Tag'} className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold">{cat?.name || 'General'}</span>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-500">
                      {tx.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => setViewingTx(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingTx(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-500">No transactions match your criteria.</p>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction View Details Modal */}
      {viewingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md my-8 overflow-hidden animate-in fade-in zoom-in duration-200 flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Transaction Details</h3>
              <button
                onClick={() => setViewingTx(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center py-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    viewingTx.type === 'income'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                  }`}
                >
                  {viewingTx.type}
                </span>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {viewingTx.type === 'income' ? '+' : '-'}{formatCurrency(viewingTx.amount)}
                </div>
                <div className="text-xs text-slate-500 mt-1">{formatDate(viewingTx.date)}</div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-medium">Merchant / Person:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingTx.merchant}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {catMap.get(viewingTx.categoryId)?.name || 'General'}
                  </span>
                </div>

                {viewingTx.subcategory && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">Subcategory:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {viewingTx.subcategory}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-medium">Payment Method:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewingTx.paymentMethod}
                  </span>
                </div>

                {viewingTx.description && (
                  <div className="py-1">
                    <span className="text-slate-400 font-medium block mb-1">Description:</span>
                    <p className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                      {viewingTx.description}
                    </p>
                  </div>
                )}

                {viewingTx.tags && viewingTx.tags.length > 0 && (
                  <div className="py-1">
                    <span className="text-slate-400 font-medium block mb-1">Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingTx.tags.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-semibold"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    const tx = viewingTx;
                    setViewingTx(null);
                    setEditingTransaction(tx);
                    setIsAddModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    const tx = viewingTx;
                    setViewingTx(null);
                    setDeletingTx(tx);
                  }}
                  className="px-4 py-2 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/80 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => setViewingTx(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm my-8 overflow-hidden p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Transaction</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deletingTx.merchant}</strong> ({formatCurrency(deletingTx.amount)})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTx(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTransaction(deletingTx.id);
                  setDeletingTx(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Transactions Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm my-8 overflow-hidden p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Clear All Transactions?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will delete all {transactions.length} transactions from the application. You can always restore the default sample data later from Settings.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllTransactions();
                  setShowClearAllConfirm(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
