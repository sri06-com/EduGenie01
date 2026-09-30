import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Languages,
  Bell,
  Shield,
  LogOut,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useLanguage, Language } from '../context/LanguageContext.js';

interface SettingsPageProps {
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [studyReminders, setStudyReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [quizSuggestions, setQuizSuggestions] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSavePreferences = () => {
    setSavedNotice('Settings saved successfully! ✨');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Application Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize appearance, language, notification alerts, and account preferences
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 1. Appearance / Theme */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Appearance & Theme
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <span className="font-bold text-xs block">Light Mode</span>
                <span className="text-[11px] text-slate-400">Crisp daytime learning</span>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="font-bold text-xs block">Dark Mode</span>
                <span className="text-[11px] text-slate-400">Easy on the eyes for night study</span>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* 2. Language Selection */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-indigo-500" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Language & Localization
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
              language === 'en'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div>
              <span className="font-bold text-xs block">English (Default)</span>
              <span className="text-[11px] text-slate-400">International academic standard</span>
            </div>
            {language === 'en' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => setLanguage('ta')}
            className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
              language === 'ta'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div>
              <span className="font-bold text-xs block">தமிழ் (Tamil)</span>
              <span className="text-[11px] text-slate-400">தமிழ் வழிக் கற்றல் மற்றும் விளக்கங்கள்</span>
            </div>
            {language === 'ta' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* 3. Notification Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-500" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Notifications & Study Reminders
          </h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Study Planner Reminders
              </span>
              <span className="text-[11px] text-slate-400">
                Receive alerts 15 minutes before scheduled revision sessions
              </span>
            </div>
            <input
              type="checkbox"
              checked={studyReminders}
              onChange={(e) => setStudyReminders(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Daily Streak Protector
              </span>
              <span className="text-[11px] text-slate-400">
                Daily reminder at 7:00 PM if learning streak has not been completed
              </span>
            </div>
            <input
              type="checkbox"
              checked={streakAlerts}
              onChange={(e) => setStreakAlerts(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Weak Topic Practice Suggestions
              </span>
              <span className="text-[11px] text-slate-400">
                Smart quiz recommendations on topics where accuracy was below 85%
              </span>
            </div>
            <input
              type="checkbox"
              checked={quizSuggestions}
              onChange={(e) => setQuizSuggestions(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
          </label>
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
        >
          Save Notification Settings
        </button>
      </div>

      {/* 4. Account & Logout */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Account & Session
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 gap-4">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Signed in as {user?.email}
            </span>
            <span className="text-[11px] text-slate-400">
              Account created on {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              onLogout();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of EduGenie</span>
          </button>
        </div>
      </div>
    </div>
  );
};
