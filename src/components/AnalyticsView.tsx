import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercentage, parseYearMonthDay } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Store,
  Flame,
  PieChartIcon,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Tag,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    categories,
    budgets,
    selectedMonth,
    selectedYear,
    totalExpenses,
    previousMonthExpenses,
  } = useFinance();

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Current Month Expenses
  const currentMonthTx = useMemo(() => {
    return transactions.filter(t => {
      const { month, year } = parseYearMonthDay(t.date);
      return month === selectedMonth && year === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Previous Month Expenses
  const prevMonthTx = useMemo(() => {
    return transactions.filter(t => {
      const { month, year } = parseYearMonthDay(t.date);
      return month === prevMonth && year === prevYear;
    });
  }, [transactions, prevMonth, prevYear]);

  // 1. Highest Spending Category
  const categoryTotals = useMemo(() => {
    const map: Record<string, { catId: string; name: string; amount: number; color: string; icon: string }> = {};

    currentMonthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = catMap.get(t.categoryId);
        const catId = t.categoryId;
        const name = cat ? cat.name : 'Other';
        const color = cat ? cat.color : '#64748b';
        const icon = cat ? cat.icon : 'Tag';

        if (!map[catId]) {
          map[catId] = { catId, name, amount: 0, color, icon };
        }
        map[catId].amount += t.amount;
      });

    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [currentMonthTx, catMap]);

  const topCategory = categoryTotals[0];

  // 2. Top Merchants
  const topMerchants = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const m = t.merchant || 'General';
        map[m] = (map[m] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [currentMonthTx]);

  // 3. Most Expensive Transactions
  const largestTransactions = useMemo(() => {
    return [...currentMonthTx]
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [currentMonthTx]);

  // 4. Tag Cloud Data
  const tagTotals = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (t.tags) {
          t.tags.forEach(tag => {
            const tLower = tag.toLowerCase();
            map[tLower] = (map[tLower] || 0) + t.amount;
          });
        }
      });
    
    const tagsArr = Object.entries(map).map(([tag, amount]) => ({ tag, amount }));
    // Sort alphabetically for a better mixed cloud look, but keep amounts for scaling
    return tagsArr.sort((a, b) => a.tag.localeCompare(b.tag));
  }, [currentMonthTx]);

  // Helper for tag cloud font size scaling
  const maxTagAmount = useMemo(() => {
    return tagTotals.length > 0 ? Math.max(...tagTotals.map(t => t.amount)) : 1;
  }, [tagTotals]);

  // 5. Category Spending Comparison (This Month vs Last Month)
  const categoryComparison = useMemo(() => {
    return categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const thisMonthAmt = currentMonthTx
          .filter(t => t.type === 'expense' && t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthAmt = prevMonthTx
          .filter(t => t.type === 'expense' && t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);

        const diff = thisMonthAmt - lastMonthAmt;
        const pctChange = lastMonthAmt > 0 ? (diff / lastMonthAmt) * 100 : thisMonthAmt > 0 ? 100 : 0;

        const b = budgets.find(
          b => b.categoryId === cat.id && b.month === selectedMonth && b.year === selectedYear
        );

        return {
          catId: cat.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          thisMonthAmt,
          lastMonthAmt,
          diff,
          pctChange,
          budgetAmt: b ? b.amount : 0,
        };
      })
      .filter(c => c.thisMonthAmt > 0 || c.lastMonthAmt > 0)
      .sort((a, b) => b.thisMonthAmt - a.thisMonthAmt);
  }, [categories, currentMonthTx, prevMonthTx, budgets, selectedMonth, selectedYear]);

  // Recharts data for MoM comparison
  const momBarChartData = useMemo(() => {
    return categoryComparison.slice(0, 6).map(c => ({
      name: c.name,
      'This Month': c.thisMonthAmt,
      'Last Month': c.lastMonthAmt,
    }));
  }, [categoryComparison]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Spending Analytics & Deep Insights</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          In-depth breakdown of merchant habits, category growth rates, and MoM trends
        </p>
      </div>

      {/* Top Cards: Key Analytics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highest Category */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Highest Expense Category
          </div>
          {topCategory ? (
            <div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {topCategory.name}
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {formatCurrency(topCategory.amount)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Accounts for {((topCategory.amount / totalExpenses) * 100).toFixed(1)}% of total August spending
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-4">No data</div>
          )}
        </div>

        {/* Top Merchant */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Store className="w-4 h-4 text-purple-500" />
            Top Merchant Spent
          </div>
          {topMerchants.length > 0 ? (
            <div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {topMerchants[0].merchant}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(topMerchants[0].amount)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Highest single vendor expenditure
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-4">No data</div>
          )}
        </div>

        {/* MoM Expense Change */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            Overall MoM Spending Shift
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs">
            {totalExpenses > previousMonthExpenses ? (
              <span className="flex items-center text-rose-600 font-bold">
                <ArrowUpRight className="w-4 h-4" />
                +{(((totalExpenses - previousMonthExpenses) / (previousMonthExpenses || 1)) * 100).toFixed(1)}% vs Last Month
              </span>
            ) : (
              <span className="flex items-center text-emerald-600 font-bold">
                <ArrowDownRight className="w-4 h-4" />
                -{(((previousMonthExpenses - totalExpenses) / (previousMonthExpenses || 1)) * 100).toFixed(1)}% vs Last Month
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Chart: This Month vs Last Month per Category */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Comparison (August vs July)
            </h3>
            <p className="text-xs text-slate-500">Comparing current spending against previous period</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={momBarChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val), 'Amount']}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="This Month" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Last Month" fill="#94a3b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Category Comparison Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Category Shift Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">This Month</th>
                <th className="py-3 px-4 text-right">Last Month</th>
                <th className="py-3 px-4 text-right">Change</th>
                <th className="py-3 px-4 text-right">Budget Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryComparison.map(c => (
                <tr key={c.catId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: c.color }}
                    >
                      <CategoryIcon name={c.icon} className="w-3 h-3" />
                    </div>
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(c.thisMonthAmt)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">{formatCurrency(c.lastMonthAmt)}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        c.pctChange > 0
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : c.pctChange < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {c.pctChange > 0 ? '+' : ''}
                      {c.pctChange.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-500">
                    {c.budgetAmt > 0 ? formatCurrency(c.budgetAmt) : 'Unset'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Merchants, Most Expensive Transactions, and Tag Cloud Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Merchants */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Top Spending Merchants</h3>
          <div className="space-y-3">
            {topMerchants.map((m, idx) => (
              <div key={m.merchant} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-[11px]">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{m.merchant}</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Expensive Transactions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Most Expensive Single Transactions</h3>
          <div className="space-y-3">
            {largestTransactions.map(t => {
              const cat = catMap.get(t.categoryId);
              return (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{t.merchant}</div>
                    <div className="text-[10px] text-slate-400">{cat?.name} • {t.paymentMethod}</div>
                  </div>
                  <div className="font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(t.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tag Cloud */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-500" />
            Spending by Tags
          </h3>
          <div className="flex-1 flex flex-wrap content-start gap-2">
            {tagTotals.length > 0 ? (
              tagTotals.map(tagData => {
                const ratio = tagData.amount / maxTagAmount; // 0 to 1
                const size = 11 + ratio * 14; // Between 11px and 25px
                const opacity = 0.6 + ratio * 0.4; // Between 0.6 and 1
                return (
                  <span
                    key={tagData.tag}
                    className="inline-block px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer border border-indigo-200/50 dark:border-indigo-800/30 font-semibold"
                    style={{ fontSize: `${size}px`, opacity }}
                    title={`${formatCurrency(tagData.amount)} spent on #${tagData.tag}`}
                  >
                    #{tagData.tag}
                  </span>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 w-full text-center py-8">
                No tags found in expenses this month.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
