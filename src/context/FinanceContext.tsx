import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { get, set, del } from 'idb-keyval';
import { Transaction, Category, Budget, UserProfile, ActiveTab, SpendingHealthScore } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_CATEGORIES, INITIAL_BUDGETS, INITIAL_USER } from '../data/seedData';
import { calculateSpendingHealth } from '../utils/healthScore';
import { parseYearMonthDay } from '../utils/formatters';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  user: UserProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // Modal states
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  
  // Month selector
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (m: number) => void;
  setSelectedYear: (y: number) => void;

  // CRUD Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  
  saveBudget: (categoryId: string, amount: number, month?: number, year?: number) => void;
  deleteBudget: (id: string) => void;
  
  updateUser: (user: Partial<UserProfile>) => void;
  resetToSeedData: () => void;
  clearAllTransactions: () => void;
  clearAllData: () => void;

  // Derived Analytics & Calculated Values
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  currentMonthExpenses: number;
  previousMonthExpenses: number;
  spendingChangePercent: number;
  healthScore: SpendingHealthScore;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TX = 'pft_transactions_v1';
const LOCAL_STORAGE_KEY_CAT = 'pft_categories_v1';
const LOCAL_STORAGE_KEY_BUDGET = 'pft_budgets_v1';
const LOCAL_STORAGE_KEY_USER = 'pft_user_v1';
const LOCAL_STORAGE_KEY_THEME = 'pft_theme_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Default to August 2026 (matching our rich dataset)
  const [selectedMonth, setSelectedMonth] = useState<number>(8);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Load state asynchronously from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const txSaved = await get(LOCAL_STORAGE_KEY_TX) ?? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TX) || 'null');
        if (txSaved) setTransactions(txSaved);

        const catSaved = await get(LOCAL_STORAGE_KEY_CAT) ?? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CAT) || 'null');
        if (catSaved) setCategories(catSaved);

        const budgetSaved = await get(LOCAL_STORAGE_KEY_BUDGET) ?? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET) || 'null');
        if (budgetSaved) setBudgets(budgetSaved);

        const userSaved = await get(LOCAL_STORAGE_KEY_USER) ?? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_USER) || 'null');
        if (userSaved) setUser(userSaved);

        const themeSaved = await get(LOCAL_STORAGE_KEY_THEME) ?? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_THEME) || 'null');
        if (themeSaved !== null) setDarkMode(themeSaved);
      } catch (e) {
        console.error("Failed to load data from IndexedDB", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // Sync state to IndexedDB
  useEffect(() => {
    if (!isLoaded) return;
    set(LOCAL_STORAGE_KEY_TX, transactions).catch(console.error);
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    set(LOCAL_STORAGE_KEY_CAT, categories).catch(console.error);
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    set(LOCAL_STORAGE_KEY_BUDGET, budgets).catch(console.error);
  }, [budgets, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    set(LOCAL_STORAGE_KEY_USER, user).catch(console.error);
  }, [user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    set(LOCAL_STORAGE_KEY_THEME, darkMode).catch(console.error);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, isLoaded]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // CRUD Functions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);

    // Automatically switch selected month/year to match newly added transaction date
    const { month, year } = parseYearMonthDay(newTx.date);
    if (month && year) {
      setSelectedMonth(month);
      setSelectedYear(year);
    }
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));

    // Automatically switch selected month/year to match updated transaction date
    const { month, year } = parseYearMonthDay(updatedTx.date);
    if (month && year) {
      setSelectedMonth(month);
      setSelectedYear(year);
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Also remove associated budgets
    setBudgets(prev => prev.filter(b => b.categoryId !== id));
  };

  const saveBudget = (categoryId: string, amount: number, month = selectedMonth, year = selectedYear) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === categoryId && b.month === month && b.year === year);
      if (existing) {
        return prev.map(b => (b.id === existing.id ? { ...b, amount } : b));
      } else {
        const newBudget: Budget = {
          id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: user.id,
          categoryId,
          amount,
          month,
          year,
        };
        return [...prev, newBudget];
      }
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const updateUser = (fields: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...fields }));
  };

  const resetToSeedData = async () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    setBudgets(INITIAL_BUDGETS);
    setUser(INITIAL_USER);
    await del(LOCAL_STORAGE_KEY_TX);
    await del(LOCAL_STORAGE_KEY_CAT);
    await del(LOCAL_STORAGE_KEY_BUDGET);
    await del(LOCAL_STORAGE_KEY_USER);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TX);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CAT);
    localStorage.removeItem(LOCAL_STORAGE_KEY_BUDGET);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
  };

  const clearAllTransactions = async () => {
    setTransactions([]);
    await set(LOCAL_STORAGE_KEY_TX, []);
    localStorage.setItem(LOCAL_STORAGE_KEY_TX, JSON.stringify([]));
  };

  const clearAllData = async () => {
    setTransactions([]);
    setBudgets([]);
    await set(LOCAL_STORAGE_KEY_TX, []);
    await set(LOCAL_STORAGE_KEY_BUDGET, []);
    localStorage.setItem(LOCAL_STORAGE_KEY_TX, JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_KEY_BUDGET, JSON.stringify([]));
  };

  // --- Derived Calculations ---
  // All-time Total Balance = All Income - All Expenses
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  // Selected Month Transactions
  const currentMonthTx = useMemo(() => {
    return transactions.filter(t => {
      const { month, year } = parseYearMonthDay(t.date);
      return month === selectedMonth && year === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Previous Month Transactions
  const previousMonthTx = useMemo(() => {
    const prevM = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    return transactions.filter(t => {
      const { month, year } = parseYearMonthDay(t.date);
      return month === prevM && year === prevY;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncome = useMemo(() => {
    return currentMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTx]);

  const currentMonthExpenses = useMemo(() => {
    return currentMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTx]);

  const previousMonthExpenses = useMemo(() => {
    return previousMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [previousMonthTx]);

  const totalExpenses = currentMonthExpenses;

  const totalSavings = useMemo(() => {
    return Math.max(0, totalIncome - currentMonthExpenses);
  }, [totalIncome, currentMonthExpenses]);

  const savingsRate = useMemo(() => {
    return totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  }, [totalIncome, totalSavings]);

  const spendingChangePercent = useMemo(() => {
    if (previousMonthExpenses === 0) return 0;
    return ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
  }, [currentMonthExpenses, previousMonthExpenses]);

  const healthScore = useMemo(() => {
    return calculateSpendingHealth(transactions, categories, budgets, selectedMonth, selectedYear);
  }, [transactions, categories, budgets, selectedMonth, selectedYear]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        user,
        activeTab,
        setActiveTab,
        darkMode,
        toggleDarkMode,
        searchQuery,
        setSearchQuery,
        isAddModalOpen,
        setIsAddModalOpen,
        editingTransaction,
        setEditingTransaction,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        saveBudget,
        deleteBudget,
        updateUser,
        resetToSeedData,
        clearAllTransactions,
        clearAllData,
        totalBalance,
        totalIncome,
        totalExpenses,
        totalSavings,
        savingsRate,
        currentMonthExpenses,
        previousMonthExpenses,
        spendingChangePercent,
        healthScore,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
