import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  BookOpen,
  HelpCircle,
  FileEdit,
  Calendar,
  Flame,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Play,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';

interface DashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenPomodoro: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenPomodoro }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, plansRes, progressRes, recRes] = await Promise.all([
        api.subjects.getAll(),
        api.planner.getTasks(),
        api.progress.getStats(),
        api.ai.getRecommendations(),
      ]);

      setSubjects(subjectsRes.subjects || []);
      setPlans(plansRes.plans || []);
      setStats(progressRes.stats || null);
      setRecommendations(recRes.recommendations || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.planner.toggleTask(taskId);
      setPlans((prev) =>
        prev.map((p) => (p._id === taskId ? { ...p, completed: !p.completed } : p))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const pendingTasks = plans.filter((p) => !p.completed);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Welcome Banner & Student Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{user?.streak || 7} Day Learning Streak! Keep it going 🔥</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('welcomeBack')}, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              You are enrolled in <strong className="text-white">{user?.course || 'Engineering'}</strong> ({user?.semester || 'Semester 4'}).
              Ready to learn smarter today?
            </p>
          </div>

          {/* Quick Study Focus Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Ask Genie AI</span>
            </button>
            <button
              onClick={onOpenPomodoro}
              className="px-5 py-3 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/40 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-sm transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-white" />
              <span>Focus Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Study Goal & Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Goal Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {t('todaysStudyGoal')}
              </h3>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              65 / 90 mins
            </span>
          </div>

          <div className="space-y-2 my-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: '72%' }}
              />
            </div>
            <p className="text-[11px] text-slate-500 flex justify-between">
              <span>72% of daily target reached</span>
              <span>25 {t('minsRemaining')}</span>
            </p>
          </div>

          <button
            onClick={onOpenPomodoro}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Complete 25m Focus Block</span>
          </button>
        </div>

        {/* Overall Progress Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {t('overallProgress')}
              </h3>
            </div>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              {stats?.overallProgress || 72}%
            </span>
          </div>

          <div className="space-y-2 my-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${stats?.overallProgress || 72}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 flex justify-between">
              <span>{stats?.totalQuizzesTaken || 4} Quizzes Taken</span>
              <span>{stats?.averageQuizScore || 80}% Avg Score</span>
            </p>
          </div>

          <button
            onClick={() => onNavigate('progress')}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>View Detailed Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gamification Level & XP Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Level {user?.level || 4} Scholar
              </h3>
            </div>
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
              {user?.xp || 1250} XP
            </span>
          </div>

          <div className="space-y-2 my-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: '65%' }}
              />
            </div>
            <p className="text-[11px] text-slate-500 flex justify-between">
              <span>150 XP to Level {(user?.level || 4) + 1}</span>
              <span>Next reward: Bronze Cup</span>
            </p>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 hover:bg-purple-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>View Achievement Badges</span>
            <Award className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              {t('askAI')}
            </span>
            <span className="text-[10px] text-slate-400">Ask Genie doubts</span>
          </button>

          <button
            onClick={() => onNavigate('materials')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              {t('studyMaterials')}
            </span>
            <span className="text-[10px] text-slate-400">Notes, PDFs & PYQs</span>
          </button>

          <button
            onClick={() => onNavigate('quizzes')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              {t('takeQuiz')}
            </span>
            <span className="text-[10px] text-slate-400">Test knowledge</span>
          </button>

          <button
            onClick={() => onNavigate('notes')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <FileEdit className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              {t('generateNotes')}
            </span>
            <span className="text-[10px] text-slate-400">Smart exam notes</span>
          </button>

          <button
            onClick={() => onNavigate('planner')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              {t('studyPlanner')}
            </span>
            <span className="text-[10px] text-slate-400">Schedule & timetable</span>
          </button>
        </div>
      </div>

      {/* 4. Continue Learning Hero Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 border border-indigo-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {t('continueLearning')}
              </span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Java Polymorphism & Method Overriding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Topic 4 of 15 in Java Programming • 80% Complete
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('quizzes', { quizId: 'quiz_1' })}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>{t('resumeLearning')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('notes')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold transition"
            >
              View Notes
            </button>
          </div>
        </div>
      </div>

      {/* 5. Subjects Grid & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Subjects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('mySubjects')} ({subjects.length})
            </h3>
            <button
              onClick={() => onNavigate('materials')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Materials
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjects.map((sub) => {
              const progressPct = Math.round((sub.completedTopics / sub.totalTopics) * 100);
              return (
                <div
                  key={sub._id}
                  onClick={() => onNavigate('materials', { subject: sub.name })}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {sub.code}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {progressPct}%
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {sub.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 mb-3">
                    {sub.description}
                  </p>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{sub.completedTopics} / {sub.totalTopics} topics</span>
                    <span>{sub.semester}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Upcoming Tasks & Study Schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('upcomingTasks')} ({pendingTasks.length})
            </h3>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Planner
            </button>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                All study tasks completed! Good work! 🌟
              </div>
            ) : (
              pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => handleToggleTask(task._id)}
                      className="mt-0.5 w-4 h-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-emerald-50 text-emerald-600"
                    >
                      {task.completed && <Check className="w-3 h-3" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {task.topic}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {task.subject} • {task.time} ({task.duration}m)
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      task.priority === 'High'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : task.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}

            <button
              onClick={() => onNavigate('planner')}
              className="w-full py-2.5 rounded-xl border border-dashed border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              + Add Study Session
            </button>
          </div>

          {/* AI Recommendation Widget */}
          <div className="p-4 rounded-3xl bg-gradient-to-tr from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30 border border-indigo-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Genie Recommendation
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              "You scored 80% on Java Polymorphism. Practice 5 questions on Dynamic Method Dispatch to achieve a perfect 100%!"
            </p>
            <button
              onClick={() => onNavigate('quizzes', { quizId: 'quiz_1' })}
              className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Practice now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
