import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const GoodVsBadView: React.FC = () => {
  const { healthScore, totalIncome, totalExpenses, savingsRate, totalSavings } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Spending Health & Good vs Bad Analysis</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Automated algorithmic classification of expenses based on essential vs discretionary habits, budgets, and savings velocity
        </p>
      </div>

      {/* Main Score Hero Card */}
      <div
        className={`p-6 rounded-2xl border shadow-md transition-all ${
          healthScore.status === 'healthy'
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 border-emerald-500/30 text-white'
            : healthScore.status === 'attention'
            ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 border-amber-500/30 text-white'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 border-rose-500/30 text-white'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Spending Health Score
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-white/10 backdrop-blur-xs">
                {healthScore.score} / 100
              </span>
            </div>

            <h3 className="text-2xl font-extrabold">{healthScore.summary}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculated using spending ratio (Essential vs Discretionary), budget adherence, savings rate ({savingsRate.toFixed(1)}%), and month-over-month trend analysis.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div className="text-xl font-bold text-emerald-400">🟢 {healthScore.healthyCount}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Healthy</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <div className="text-xl font-bold text-amber-400">🟡 {healthScore.attentionCount}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Needs Attention</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <div className="text-xl font-bold text-rose-400">🔴 {healthScore.highCount}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">High Spending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Insights Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          Data-Driven Spending Classifications & Explanations
        </h3>

        <div className="space-y-3">
          {healthScore.insights.map(insight => {
            let badgeBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300';
            let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;

            if (insight.status === 'attention') {
              badgeBg = 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300';
              icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            } else if (insight.status === 'high_spending') {
              badgeBg = 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300';
              icon = <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />;
            }

            return (
              <div
                key={insight.id}
                className={`p-4 rounded-2xl border transition-all ${badgeBg}`}
              >
                <div className="flex items-start gap-3">
                  {icon}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold">{insight.title}</h4>
                      {insight.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-800/60">
                          {insight.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold leading-relaxed">{insight.reason}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {healthScore.insights.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No active spending warnings or insights for this period.
            </div>
          )}
        </div>
      </div>

      {/* Educational Classification Criteria Guide */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-500" />
          How Spending Health is Analyzed
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
              🟢 Healthy Spending
            </span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Essential living expenses (Rent, Groceries) within budget</li>
              <li>Savings rate maintained at 20%+</li>
              <li>Planned investments and moderate discretionary expenses</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm">
              🟡 Needs Attention
            </span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Category spent reaches 75% to 90% of budget limit</li>
              <li>Discretionary spending exceeds essential living costs</li>
              <li>Noticeable increase compared to previous month</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-sm">
              🔴 High / Excessive Spending
            </span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Category spent exceeds 100% of budget limit</li>
              <li>Month-over-month expenses surge by 25%+</li>
              <li>Savings rate falls below 15% threshold</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-slate-400" />
          <span>
            <strong>Note:</strong> These insights represent budget and algorithmic spending pattern alerts generated directly from your entered transactions, rather than professional financial advice.
          </span>
        </div>
      </div>
    </div>
  );
};
