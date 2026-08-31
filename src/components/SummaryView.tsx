import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonthYear, formatPercentage, parseYearMonthDay } from '../utils/formatters';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Award,
  Hash,
  PieChart,
  Zap,
} from 'lucide-react';

export const SummaryView: React.FC = () => {
  const {
    transactions,
    categories,
    budgets,
    selectedMonth,
    selectedYear,
  } = useFinance();

  const [copied, setCopied] = React.useState(false);

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Current Month Tx
  const currentMonthTx = useMemo(() => {
    return transactions.filter(t => {
      const { month, year } = parseYearMonthDay(t.date);
      return month === selectedMonth && year === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Previous Month Tx
  const prevMonthTx = useMemo(() => {
    return transactions.filter(t => {
      const { month, year } = parseYearMonthDay(t.date);
      return month === prevMonth && year === prevYear;
    });
  }, [transactions, prevMonth, prevYear]);

  const totalIncome = currentMonthTx
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTx
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const prevTotalExpenses = prevMonthTx
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  // Highest Category
  const categoryTotals: Record<string, number> = {};
  currentMonthTx
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
    });

  let topCategoryId = '';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([catId, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategoryId = catId;
    }
  });

  const topCategoryName = catMap.get(topCategoryId)?.name || 'N/A';

  // Biggest Transaction
  const biggestTx = [...currentMonthTx]
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0];

  // Budget Utilization
  const monthBudgets = budgets.filter(b => b.month === selectedMonth && b.year === selectedYear);
  const totalAllocatedBudget = monthBudgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetUtilizationPct =
    totalAllocatedBudget > 0 ? (totalExpenses / totalAllocatedBudget) * 100 : 0;

  // Key Changes Text
  const spendingChangePct =
    prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0;

  const reportTitle = `${formatMonthYear(selectedMonth, selectedYear)} Financial Summary`;

  const summaryText = `
📊 ${reportTitle}
----------------------------------
💰 Total Income: ${formatCurrency(totalIncome)}
💸 Total Expenses: ${formatCurrency(totalExpenses)}
🐷 Total Savings: ${formatCurrency(totalSavings)}
📈 Savings Rate: ${savingsRate.toFixed(1)}%

🏆 Top Category: ${topCategoryName} — ${formatCurrency(topCategoryAmount)}
⚡ Biggest Expense: ${biggestTx ? `${biggestTx.merchant} (${formatCurrency(biggestTx.amount)})` : 'None'}
🔢 Total Transactions: ${currentMonthTx.length}
🎯 Budget Utilization: ${budgetUtilizationPct.toFixed(0)}%
📊 Overall Shift vs Previous Month: ${spendingChangePct > 0 ? '+' : ''}${spendingChangePct.toFixed(1)}%
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Merchant', 'Amount', 'Notes'];
    const rows = currentMonthTx.map(t => {
      const categoryName = catMap.get(t.categoryId)?.name || 'Uncategorized';
      return [
        t.date,
        t.type,
        `"${categoryName.replace(/"/g, '""')}"`,
        `"${t.merchant.replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Monthly Financial Summary</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consolidated monthly report, key metrics, and shareable financial statement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Summary' : 'Copy Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Printable / Clean Financial Report Sheet */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-5 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Financial Report Statement
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{reportTitle}</h3>
          </div>

          <div className="text-right text-xs text-slate-400">
            Generated for <strong>Rahul Sharma</strong>
            <br />
            Currency: INR (₹)
          </div>
        </div>

        {/* 4 Primary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 text-xs font-semibold mb-1">Total Income</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 text-xs font-semibold mb-1">Total Expenses</div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpenses)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 text-xs font-semibold mb-1">Total Savings</div>
            <div className="text-xl font-black text-purple-600 dark:text-purple-400">
              {formatCurrency(totalSavings)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 text-xs font-semibold mb-1">Savings Rate</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Key Metrics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Highlights & Statistics
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Highest Expense Category:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {topCategoryName} ({formatCurrency(topCategoryAmount)})
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Biggest Single Transaction:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {biggestTx ? `${biggestTx.merchant} (${formatCurrency(biggestTx.amount)})` : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-500" />
                  Total Number of Transactions:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentMonthTx.length}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-500" />
                  Budget Utilization Rate:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {budgetUtilizationPct.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Text Summary Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Formatted Text Report
            </h4>
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {summaryText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
