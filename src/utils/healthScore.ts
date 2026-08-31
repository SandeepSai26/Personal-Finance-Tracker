import { Transaction, Category, Budget, SpendingHealthScore, SpendingInsight, HealthStatus } from '../types';
import { parseYearMonthDay } from './formatters';

export const calculateSpendingHealth = (
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  currentMonth: number = 8,
  currentYear: number = 2026
): SpendingHealthScore => {
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Filter current month transactions
  const currentMonthTx = transactions.filter(t => {
    const { month, year } = parseYearMonthDay(t.date);
    return month === currentMonth && year === currentYear;
  });

  // Filter prev month transactions
  const prevMonthTx = transactions.filter(t => {
    const { month, year } = parseYearMonthDay(t.date);
    return month === prevMonth && year === prevYear;
  });

  const totalIncome = currentMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const prevTotalIncome = prevMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const prevTotalExpense = prevMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const insights: SpendingInsight[] = [];
  let scoreDeductions = 0;

  // Category map
  const catMap = new Map<string, Category>();
  categories.forEach(c => catMap.set(c.id, c));

  // 1. Budget Overruns Analysis
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  currentMonthBudgets.forEach(b => {
    const cat = catMap.get(b.categoryId);
    const catName = cat ? cat.name : 'Category';
    const spent = currentMonthTx
      .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((acc, t) => acc + t.amount, 0);

    const pctUsed = b.amount > 0 ? (spent / b.amount) * 100 : 0;

    // Previous month spending for this category
    const prevSpent = prevMonthTx
      .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((acc, t) => acc + t.amount, 0);

    const pctChange = prevSpent > 0 ? ((spent - prevSpent) / prevSpent) * 100 : 0;

    if (pctUsed >= 100) {
      scoreDeductions += 20;
      insights.push({
        id: `insight_over_${b.categoryId}`,
        title: `${catName} Exceeded Budget`,
        description: `Exceeded monthly budget limit of ₹${b.amount.toLocaleString('en-IN')}`,
        status: 'high_spending',
        category: catName,
        amount: spent,
        percentageChange: pctChange,
        reason: `🔴 Your ${catName} spending of ₹${spent.toLocaleString('en-IN')} has exceeded your monthly budget of ₹${b.amount.toLocaleString('en-IN')} (${pctUsed.toFixed(0)}% used).`,
      });
    } else if (pctUsed >= 85) {
      scoreDeductions += 10;
      const changeText = pctChange > 0 ? ` and is ${pctChange.toFixed(0)}% higher than last month` : '';
      insights.push({
        id: `insight_attn_${b.categoryId}`,
        title: `${catName} Near Budget Limit`,
        description: `Approaching monthly budget threshold`,
        status: 'attention',
        category: catName,
        amount: spent,
        percentageChange: pctChange,
        reason: `⚠️ Your ${catName} spending is ${pctUsed.toFixed(0)}% of your monthly budget (₹${spent.toLocaleString('en-IN')} of ₹${b.amount.toLocaleString('en-IN')})${changeText}.`,
      });
    } else if (pctUsed > 0 && pctUsed <= 70) {
      insights.push({
        id: `insight_good_${b.categoryId}`,
        title: `${catName} Well Within Budget`,
        description: `Spending is under control`,
        status: 'healthy',
        category: catName,
        amount: spent,
        reason: `🟢 Your ${catName} spending is sitting comfortably at ${pctUsed.toFixed(0)}% of budget.`,
      });
    }
  });

  // 2. Savings Rate Analysis
  if (savingsRate >= 30) {
    insights.push({
      id: 'insight_savings_great',
      title: 'Strong Savings Rate',
      description: `Saving ${savingsRate.toFixed(1)}% of your income`,
      status: 'healthy',
      reason: `🟢 Excellent discipline: You are saving ${savingsRate.toFixed(1)}% of your total income this month (₹${savings.toLocaleString('en-IN')}).`,
    });
  } else if (savingsRate >= 15) {
    insights.push({
      id: 'insight_savings_moderate',
      title: 'Moderate Savings Rate',
      description: `Saving ${savingsRate.toFixed(1)}% of your income`,
      status: 'attention',
      reason: `🟡 Your savings rate is ${savingsRate.toFixed(1)}%. Aiming for 20%+ will help build a stronger emergency fund.`,
    });
  } else if (totalIncome > 0 && savingsRate < 15) {
    scoreDeductions += 15;
    insights.push({
      id: 'insight_savings_low',
      title: 'Low Savings Rate',
      description: `Only saving ${savingsRate.toFixed(1)}% of income`,
      status: 'high_spending',
      reason: `🔴 Expenses represent ${(100 - savingsRate).toFixed(1)}% of your earnings this month, leaving limited savings.`,
    });
  }

  // 3. Month-over-Month Expense Spike Check
  if (prevTotalExpense > 0) {
    const overallMoM = ((totalExpense - prevTotalExpense) / prevTotalExpense) * 100;
    if (overallMoM > 25) {
      scoreDeductions += 15;
      insights.push({
        id: 'insight_mom_spike',
        title: 'Significant Monthly Spending Increase',
        description: `Overall expenses rose by ${overallMoM.toFixed(1)}% vs last month`,
        status: 'high_spending',
        percentageChange: overallMoM,
        reason: `🔴 Total monthly expenses grew from ₹${prevTotalExpense.toLocaleString('en-IN')} last month to ₹${totalExpense.toLocaleString('en-IN')} this month (${overallMoM.toFixed(1)}% spike).`,
      });
    } else if (overallMoM < 0) {
      insights.push({
        id: 'insight_mom_drop',
        title: 'Reduced Monthly Spending',
        description: `Expenses decreased by ${Math.abs(overallMoM).toFixed(1)}%`,
        status: 'healthy',
        percentageChange: overallMoM,
        reason: `🟢 Great job! Total expenses dropped by ${Math.abs(overallMoM).toFixed(1)}% compared to last month.`,
      });
    }
  }

  // 4. Discretionary vs Essential Spending Ratio
  let essentialSpent = 0;
  let discretionarySpent = 0;

  currentMonthTx.filter(t => t.type === 'expense').forEach(t => {
    const cat = catMap.get(t.categoryId);
    if (cat?.isEssential || t.categoryId === 'cat_rent' || t.categoryId === 'cat_groceries' || t.categoryId === 'cat_investments') {
      essentialSpent += t.amount;
    } else {
      discretionarySpent += t.amount;
    }
  });

  if (discretionarySpent > essentialSpent && essentialSpent > 0) {
    scoreDeductions += 10;
    insights.push({
      id: 'insight_discretionary_high',
      title: 'High Discretionary Spending',
      description: 'Discretionary purchases exceed essential needs',
      status: 'attention',
      reason: `🟡 Discretionary spending (₹${discretionarySpent.toLocaleString('en-IN')}) is higher than essential living expenses (₹${essentialSpent.toLocaleString('en-IN')}).`,
    });
  }

  // Calculate final score
  const rawScore = Math.max(10, Math.min(100, 100 - scoreDeductions));
  let overallStatus: HealthStatus = 'healthy';
  if (rawScore < 60) {
    overallStatus = 'high_spending';
  } else if (rawScore < 80) {
    overallStatus = 'attention';
  }

  let summary = 'Your finances are in great shape! You maintain a strong savings rate and keep expenses well balanced.';
  if (overallStatus === 'attention') {
    summary = 'Your spending is generally reasonable, but a few categories are approaching their budget limits.';
  } else if (overallStatus === 'high_spending') {
    summary = 'Your spending requires attention. Several budget limits were exceeded or overall expenses surged.';
  }

  const healthyCount = insights.filter(i => i.status === 'healthy').length;
  const attentionCount = insights.filter(i => i.status === 'attention').length;
  const highCount = insights.filter(i => i.status === 'high_spending').length;

  return {
    score: rawScore,
    status: overallStatus,
    summary,
    insights,
    healthyCount,
    attentionCount,
    highCount,
  };
};
