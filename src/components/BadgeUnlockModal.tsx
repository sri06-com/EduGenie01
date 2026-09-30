import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const BadgeUnlockModal: React.FC = () => {
  const { unlockedBadge, clearUnlockedBadge, badges } = useAuth();

  useEffect(() => {
    if (unlockedBadge) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#7C3AED', '#22C55E', '#F59E0B'],
      });
    }
  }, [unlockedBadge]);

  if (!unlockedBadge) return null;

  const badgeInfo = badges.find((b) => b.badgeName.toLowerCase() === unlockedBadge.toLowerCase()) || {
    badgeName: unlockedBadge,
    description: 'You unlocked a new academic milestone on EduGenie!',
    icon: '🏆',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 p-6 text-center transform transition-all scale-100">
        <button
          onClick={clearUnlockedBadge}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-4xl">
            {badgeInfo.icon}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Achievement Unlocked!</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          {badgeInfo.badgeName}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {badgeInfo.description}
        </p>

        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-slate-800/60 border border-indigo-100/60 dark:border-slate-700/50 mb-5 flex items-center justify-around text-xs font-medium text-slate-700 dark:text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Reward</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">+50 XP</span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Unlocked</span>
          </div>
        </div>

        <button
          onClick={clearUnlockedBadge}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition active:scale-98"
        >
          Keep Learning 🚀
        </button>
      </div>
    </div>
  );
};
