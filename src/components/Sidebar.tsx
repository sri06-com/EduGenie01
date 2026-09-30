import React from 'react';
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  HelpCircle,
  Calendar,
  FileEdit,
  TrendingUp,
  User,
  Settings,
  Sparkles,
  Award,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'ai-assistant', label: t('navAIAssistant'), icon: Bot, badge: 'AI' },
    { id: 'materials', label: t('navMaterials'), icon: BookOpen },
    { id: 'quizzes', label: t('navQuizzes'), icon: HelpCircle },
    { id: 'planner', label: t('navPlanner'), icon: Calendar },
    { id: 'notes', label: t('navNotes'), icon: FileEdit },
    { id: 'progress', label: t('navProgress'), icon: TrendingUp },
    { id: 'profile', label: t('navProfile'), icon: User },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 200;
  const xpInCurrentLevel = currentXP % 400;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 400) * 100));

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-4 shrink-0 transition-colors justify-between h-[calc(100vh-4rem)] sticky top-16">
      {/* Navigation List */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Academic Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Student Level & Genie Banner */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {user && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Award className="w-4 h-4 text-amber-500" />
                Level {currentLevel} Scholar
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px]">
                {currentXP} XP
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              <span>{400 - xpInCurrentLevel} XP to Level {currentLevel + 1}</span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        )}

        <button
          onClick={() => onNavigate('ai-assistant')}
          className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ask Genie AI</span>
        </button>
      </div>
    </aside>
  );
};
