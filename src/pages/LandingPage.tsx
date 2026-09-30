import React from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileEdit,
  Calendar,
  Flame,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { demoLogin } = useAuth();
  const { t } = useLanguage();

  const handleInstantDemo = async () => {
    await demoLogin();
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 text-[#1E293B] dark:text-slate-100 transition-colors">
      {/* Top Hero Nav */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              EduGenie
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1">
              AI Learning
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('auth')}
            className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition"
          >
            Sign In
          </button>
          <button
            onClick={handleInstantDemo}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Demo Student</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin-slow" />
            <span>AI Powered Personalized Learning Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Learn Smarter.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Grow Faster.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            EduGenie is the all-in-one educational platform for college, school, and competitive exam
            students. Master syllabus topics with Genie AI, generate structured revision notes, test your skills
            with interactive quizzes, and conquer your study goals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('auth')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Get Started Free</span>
            </button>

            <button
              onClick={handleInstantDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Explore Demo Account (1-Click)</span>
            </button>
          </div>

          {/* Key Value Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Gemini Powered Genie AI
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              English & Tamil Support
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Exam-Ready Notes & Quizzes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Gamified XP & Streaks
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Genie AI Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ask doubts, request analogies, generate 10-mark standard exam answers, or summarize complex topics in seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <FileEdit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Smart Notes Generator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate structured definitions, detailed conceptual notes, important exam formulas, and download them for revision.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Interactive Quiz System</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Subject & topic-wise quizzes with timer, live score calculation, answer explanations, plus on-demand AI quiz generation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Study Planner & XP</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Organize daily & weekly tasks, track focus study time with built-in Pomodoro, and earn badges as you level up.
            </p>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold block">72%+</span>
              <span className="text-xs text-indigo-100">Avg. Subject Mastery</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold block">50,000+</span>
              <span className="text-xs text-indigo-100">Questions Practiced</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold block">10,000+</span>
              <span className="text-xs text-indigo-100">AI Notes Crafted</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold block">4.9 / 5</span>
              <span className="text-xs text-indigo-100">Student Satisfaction</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
