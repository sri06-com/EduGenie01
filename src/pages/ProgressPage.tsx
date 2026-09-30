import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  HelpCircle,
  CheckCircle2,
  Flame,
  Calendar,
  Sparkles,
  BarChart3,
  Play,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface ProgressPageProps {
  onOpenPomodoro: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onOpenPomodoro }) => {
  const { user, badges } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [weeklyLogs, setWeeklyLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await api.progress.getStats();
      setStats(res.stats || null);
      setSubjects(res.subjects || []);
      setWeeklyLogs(res.weeklyStudyLogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const overallProgress = stats?.overallProgress || 72;
  const maxWeeklyMinutes = Math.max(...weeklyLogs.map((l) => l.minutes), 120);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {t('progressAnalytics')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track study hours, subject mastery, quiz accuracy, and earned gamification badges
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPomodoro}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{t('startFocusSession')}</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Total Study Time</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats?.totalStudyHours || '7.5'} hrs
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
            +2.4 hrs this week
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>Quiz Accuracy</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats?.averageQuizScore || 80}%
          </span>
          <span className="text-[11px] text-purple-600 font-semibold block mt-0.5">
            Across {stats?.totalQuizzesTaken || 4} practice sets
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tasks Completed</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats?.totalTasksCompleted || 8}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
            100% on-time pace
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Learning Streak</span>
          </div>
          <span className="text-2xl font-extrabold text-amber-500">
            {stats?.streak || 7} Days
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Consecutive study streak 🔥
          </span>
        </div>
      </div>

      {/* Subject Performance & Weekly Hours Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject Breakdown */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Subject Performance & Mastery
              </h3>
              <p className="text-xs text-slate-400">
                Calculated from completed topics, practice quizzes, and study tasks
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block">Overall Mastery</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {overallProgress}%
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {subjects.map((sub) => (
              <div key={sub._id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">
                    {sub.name} <span className="text-slate-400 font-normal">({sub.code})</span>
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                    {sub.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${sub.percentage}%`,
                      backgroundColor: sub.color || '#4F46E5',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{sub.completedTopics} of {sub.totalTopics} topics mastered</span>
                  <span>Quiz Avg: {sub.quizAverage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Weekly Hours Bar Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
              Weekly Study Hours
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Daily minutes logged through study sessions
            </p>

            <div className="flex items-end justify-between gap-2 h-44 pt-4 px-2 border-b border-slate-100 dark:border-slate-800">
              {weeklyLogs.map((log, i) => {
                const heightPct = Math.max(15, Math.round((log.minutes / maxWeeklyMinutes) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      {log.minutes}m
                    </span>
                    <div
                      className="w-full max-w-[28px] bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {log.date.slice(-3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 text-center">
            <span className="text-xs text-slate-500 block">
              Most productive day: <strong className="text-indigo-600 dark:text-indigo-400">Friday (120 mins)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Gamification Badges Showcase */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{t('badgesTitle')} ({badges.filter((b) => b.isUnlocked).length}/{badges.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete quizzes, maintain streaks, and craft smart notes to unlock badges
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Total {user?.xp || 1250} XP
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between ${
                b.isUnlocked
                  ? 'border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-800/80 dark:to-slate-800/40 dark:border-slate-700'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 opacity-50 grayscale'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl mb-2">
                {b.icon}
              </div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-0.5">
                {b.badgeName}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {b.description}
              </p>
              <span
                className={`text-[9px] font-bold uppercase mt-2 px-2 py-0.5 rounded-full ${
                  b.isUnlocked
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                }`}
              >
                {b.isUnlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
