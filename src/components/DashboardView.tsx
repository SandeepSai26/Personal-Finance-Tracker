import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercentage, formatDateShort, parseYearMonthDay, parseLocalDate, getMonthName } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Calendar,
  CreditCard,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CategoryIcon } from './CategoryIcon';

export const DashboardView: React.FC = () => {
  const {
    totalBalance,
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    currentMonthExpenses,
    previousMonthExpenses,
    spendingChangePercent,
    healthScore,
    transactions,
    categories,
    selectedMonth,
    selectedYear,
    setActiveTab,
    setIsAddModalOpen,
    setEditingTransaction,
  } = useFinance();

  // Category map for quick lookups
  const catMap = useMemo(() => {
    const map = new Map<string, typeof categories[0]>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Current Month Expenses Filtered
  const currentMonthTx = useMemo(() => {
    return transactions.filter(t => {
      const { month, year } = parseYearMonthDay(t.date);
      return month === selectedMonth && year === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // 1. Expense by Category (Donut Chart Data)
  const categoryChartData = useMemo(() => {
    const expTx = currentMonthTx.filter(t => t.type === 'expense');
    const totals: Record<string, { name: string; value: number; color: string }> = {};

    expTx.forEach(t => {
      const cat = catMap.get(t.categoryId);
      const name = cat ? cat.name : 'Other';
      const color = cat ? cat.color : '#64748b';

      if (!totals[name]) {
        totals[name] = { name, value: 0, color };
      }
      totals[name].value += t.amount;
    });

    return Object.values(totals).sort((a, b) => b.value - a.value);
  }, [currentMonthTx, catMap]);

  // 2. Top Spending Categories List
  const topCategories = useMemo(() => {
    if (totalExpenses === 0) return [];
    return categoryChartData.slice(0, 4).map(c => ({
      ...c,
      percentage: (c.value / totalExpenses) * 100,
    }));
  }, [categoryChartData, totalExpenses]);

  // 3. Daily Spending Trend (Line Chart Data)
  const dailyTrendData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daysMap: Record<number, number> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      daysMap[i] = 0;
    }

    const monthAbbr = getMonthName(selectedMonth).slice(0, 3);

    currentMonthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const day = parseYearMonthDay(t.date).day;
        if (daysMap[day] !== undefined) {
          daysMap[day] += t.amount;
        }
      });

    return Object.keys(daysMap).map(day => ({
      day: `${monthAbbr} ${day}`,
      amount: daysMap[Number(day)],
    }));
  }, [currentMonthTx, selectedMonth, selectedYear]);

  // 4. Income vs Expenses Comparison (Bar Chart Data)
  const barChartData = useMemo(() => {
    return [
      {
        name: 'Current Month',
        Income: totalIncome,
        Expenses: totalExpenses,
      },
    ];
  }, [totalIncome, totalExpenses]);

  // 5. Recent 5 Transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Net Balance</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-slate-900 dark:text-white">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cumulative net funds</p>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Income</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">August earnings</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Expenses</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs">
            {spendingChangePercent > 0 ? (
              <span className="flex items-center text-rose-600 dark:text-rose-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {formatPercentage(spendingChangePercent)} vs last month
              </span>
            ) : (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {formatPercentage(spendingChangePercent)} vs last month
              </span>
            )}
          </div>
        </div>

        {/* Savings & Savings Rate */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Savings Rate</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black font-display text-indigo-600 dark:text-indigo-400">
              {savingsRate.toFixed(1)}%
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {formatCurrency(totalSavings)}
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Expenses by Category */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Expenses by Category
            </h3>
            <span className="text-xs text-slate-500">August 2026</span>
          </div>

          {categoryChartData.length > 0 ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number, name: string) => [formatCurrency(val), name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-slate-400">
              No expenses recorded this month.
            </div>
          )}
        </div>

        {/* Daily Spending Trend Line Chart */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Spending Trend
              </h3>
              <p className="text-xs text-slate-500">Daily expense velocity across August</p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-slate-600 dark:text-slate-300">
              Total: {formatCurrency(totalExpenses)}
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Top Spending Categories & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories List */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Top Spending Categories
            </h3>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {topCategories.map(cat => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <div className="text-slate-900 dark:text-white font-bold">
                    {formatCurrency(cat.value)}{' '}
                    <span className="text-slate-400 font-normal">({cat.percentage.toFixed(0)}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, cat.percentage)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {topCategories.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No expense categories yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map(tx => {
              const cat = catMap.get(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    setEditingTransaction(tx);
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#10b981'}15`,
                        color: cat?.color || '#10b981',
                      }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {tx.merchant}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span>{cat?.name || 'General'}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">{formatDateShort(tx.date)}</div>
                  </div>
                </div>
              );
            })}

            {recentTransactions.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Banner: Financial Health Score */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          healthScore.status === 'healthy'
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
            : healthScore.status === 'attention'
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 text-amber-900 dark:text-amber-200'
            : 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 text-rose-900 dark:text-rose-200'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-xl shrink-0 ${
                healthScore.status === 'healthy'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : healthScore.status === 'attention'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              }`}
            >
              {healthScore.status === 'healthy' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : healthScore.status === 'attention' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  Financial Health Score
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 shadow-xs">
                  {healthScore.score} / 100
                </span>
              </div>
              <h2 className="text-base font-bold mt-0.5">{healthScore.summary}</h2>
              {healthScore.insights.length > 0 && (
                <p className="text-xs mt-1 opacity-90 font-medium max-w-2xl line-clamp-1">
                  {healthScore.insights[0].reason}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('health')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200"
          >
            <span>Full Health Report</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
