export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'UPI' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Other';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO format YYYY-MM-DD
  categoryId: string;
  subcategory?: string;
  paymentMethod: PaymentMethod;
  merchant: string;
  description?: string;
  tags?: string[];
  isRecurring?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  icon: string; // Lucide icon identifier
  color: string; // Tailwind color hex or class name
  isEssential?: boolean; // Used for good vs bad spending analysis
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number; // Monthly budget limit in INR
  month: number; // 1-12
  year: number; // e.g. 2026
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  monthlyIncomeTarget?: number;
}

export type HealthStatus = 'healthy' | 'attention' | 'high_spending';

export interface SpendingInsight {
  id: string;
  title: string;
  description: string;
  status: HealthStatus;
  category?: string;
  amount?: number;
  percentageChange?: number;
  reason: string;
}

export interface SpendingHealthScore {
  score: number; // 0 to 100
  status: HealthStatus;
  summary: string;
  insights: SpendingInsight[];
  healthyCount: number;
  attentionCount: number;
  highCount: number;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'categories' | 'budgets' | 'analytics' | 'health' | 'summary' | 'settings';
