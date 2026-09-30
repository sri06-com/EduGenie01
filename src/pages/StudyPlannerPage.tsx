import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  X,
  Loader2,
  Bell,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

export const StudyPlannerPage: React.FC = () => {
  const { user, awardXP } = useAuth();
  const { t } = useLanguage();

  const [plans, setPlans] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'daily' | 'weekly' | 'calendar'>('daily');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [subject, setSubject] = useState('Java Programming');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('16:00');
  const [duration, setDuration] = useState(45);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [notice, setNotice] = useState<string | null>(null);

  const subjectsList = [
    'Java Programming',
    'Python for Data Science',
    'Engineering Mathematics',
    'Database Management Systems',
    'Data Structures & Algorithms',
    'Professional English & Communication',
  ];

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.planner.getTasks();
      setPlans(res.plans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      const res = await api.planner.addTask({
        subject,
        topic,
        date,
        time,
        duration: Number(duration),
        priority,
      });

      if (res.plan) {
        setPlans((prev) => [...prev, res.plan]);
        setIsAddModalOpen(false);
        setTopic('');
        setNotice('Study session scheduled successfully! 🎯');
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const res = await api.planner.toggleTask(id);
      setPlans((prev) =>
        prev.map((p) => (p._id === id ? { ...p, completed: !p.completed } : p))
      );

      if (res.xpEarned) {
        awardXP(res.xpEarned, res.badgeUnlocked ? 'Study Master' : undefined);
        setNotice(`Goal completed! +${res.xpEarned} XP awarded! 🎉`);
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Delete this scheduled study session?')) {
      try {
        await api.planner.deleteTask(id);
        setPlans((prev) => prev.filter((p) => p._id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filter tasks
  const filteredPlans = plans.filter((p) => {
    if (filterStatus === 'pending') return !p.completed;
    if (filterStatus === 'completed') return p.completed;
    return true;
  });

  const nextUpcomingTask = plans.find((p) => !p.completed);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {t('plannerTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set deadlines, timetable study intervals, and maintain your learning consistency
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addTask')}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Next Upcoming Reminder Banner */}
      {nextUpcomingTask && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Next Scheduled Session
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {nextUpcomingTask.topic} ({nextUpcomingTask.subject})
              </h4>
              <p className="text-[11px] text-slate-500">
                Date: {nextUpcomingTask.date} at {nextUpcomingTask.time} • Duration: {nextUpcomingTask.duration} mins
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleTask(nextUpcomingTask._id)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
          >
            Mark Done
          </button>
        </div>
      )}

      {/* Views & Status Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* View Switcher: Daily, Weekly, Calendar */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveView('daily')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeView === 'daily'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('dailyView')}
          </button>
          <button
            onClick={() => setActiveView('weekly')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeView === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('weeklyView')}
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeView === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('calendarView')}
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          {['all', 'pending', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                filterStatus === st
                  ? 'bg-slate-900 dark:bg-slate-700 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Task List / View Display */}
      {activeView === 'calendar' ? (
        /* Calendar Grid View */
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span>Study Calendar Overview (Upcoming 7 Days)</span>
            </span>
            <span className="text-xs text-slate-400 font-normal">Active schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {[0, 1, 2, 3].map((offset) => {
              const d = new Date(Date.now() + 86400000 * offset).toISOString().split('T')[0];
              const dayTasks = plans.filter((p) => p.date === d);
              return (
                <div
                  key={d}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 block mb-2">
                      {offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d}
                    </span>
                    <div className="space-y-2">
                      {dayTasks.length === 0 ? (
                        <p className="text-[11px] text-slate-400">No scheduled sessions</p>
                      ) : (
                        dayTasks.map((t) => (
                          <div
                            key={t._id}
                            className={`p-2 rounded-xl text-xs ${
                              t.completed
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 line-through'
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <span className="font-bold block">{t.topic}</span>
                            <span className="text-[10px] text-slate-400">{t.time} • {t.duration}m</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Daily / Weekly Task Cards List */
        <div className="space-y-3">
          {filteredPlans.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 space-y-2">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No study tasks found for this view</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Schedule a Task Now
              </button>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className={`p-4 sm:p-5 rounded-3xl border transition flex items-center justify-between gap-4 ${
                  plan.completed
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => handleToggleTask(plan._id)}
                    className={`w-6 h-6 rounded-xl border flex items-center justify-center transition ${
                      plan.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600'
                    }`}
                  >
                    {plan.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div>
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        plan.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {plan.topic}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {plan.subject}
                      </span>
                      <span>•</span>
                      <span>{plan.date} at {plan.time}</span>
                      <span>•</span>
                      <span>{plan.duration} mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      plan.priority === 'High'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : plan.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}
                  >
                    {plan.priority} Priority
                  </span>

                  <button
                    onClick={() => handleDeleteTask(plan._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Remove task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Schedule Study Session
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Study Topic / Goal
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Master Binary Tree Traversals"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    step={5}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
                >
                  Schedule Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
