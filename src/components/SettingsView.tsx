import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Settings, User, Database, RotateCcw, Download, Upload, Moon, Sun, Check, Trash2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateUser,
    darkMode,
    toggleDarkMode,
    resetToSeedData,
    clearAllData,
    transactions,
    categories,
    budgets,
  } = useFinance();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportJSON = () => {
    const backup = {
      user,
      categories,
      budgets,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings & Preferences</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage profile details, currency, theme preferences, and data backups
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-500" />
          User Profile
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-400">
              Currency: <strong>Indian Rupee (₹ INR)</strong>
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              {saved && <Check className="w-3.5 h-3.5 text-white" />}
              {saved ? 'Saved!' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Appearance Theme Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-500" />}
          Theme Preference
        </h3>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Dark Mode</div>
            <p className="text-slate-400">Toggle between light and dark fintech UI themes</p>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              darkMode ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Backup & Reset Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          Data Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 font-semibold text-left flex items-center justify-between text-slate-900 dark:text-white transition-all cursor-pointer"
          >
            <div>
              <div className="font-bold flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" /> Export Backup (JSON)
              </div>
              <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                Download your local financial records
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 font-semibold text-left flex items-center justify-between text-rose-700 dark:text-rose-300 transition-all cursor-pointer"
          >
            <div>
              <div className="font-bold flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" /> Delete Example Data
              </div>
              <p className="text-[11px] text-rose-400 font-normal mt-0.5">
                Wipe all sample transactions & start clean
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 font-semibold text-left flex items-center justify-between text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer"
          >
            <div>
              <div className="font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-500" /> Restore Sample Data
              </div>
              <p className="text-[11px] text-indigo-400 font-normal mt-0.5">
                Reset default Indian sample transactions
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Clear All Data Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete All Data?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete all existing transactions and budgets from the web app? This will clear all example data.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Sample Data Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Restore Sample Data?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will overwrite your current dataset with default sample financial records.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToSeedData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-900/20 transition-all cursor-pointer"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
