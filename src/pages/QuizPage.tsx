import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Clock,
  Play,
  Filter,
  CheckCircle,
  Loader2,
  Award,
  Zap,
} from 'lucide-react';
import { api } from '../services/api.js';
import { QuizPlayerModal } from '../components/QuizPlayerModal.js';
import { useLanguage } from '../context/LanguageContext.js';

interface QuizPageProps {
  initialQuizId?: string;
  onNavigateToNotes?: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ initialQuizId, onNavigateToNotes }) => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'catalog' | 'ai-generator'>('catalog');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // AI Quiz Generator inputs
  const [aiTopic, setAiTopic] = useState('Java Polymorphism');
  const [aiSubject, setAiSubject] = useState('Java Programming');
  const [aiDifficulty, setAiDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [aiNumQuestions, setAiNumQuestions] = useState<number>(5);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const subjectsList = [
    'All',
    'Java Programming',
    'Python for Data Science',
    'Engineering Mathematics',
    'Database Management Systems',
    'Data Structures & Algorithms',
    'Professional English & Communication',
  ];

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.quizzes.getAll();
      setQuizzes(res.quizzes || []);

      if (initialQuizId) {
        handleStartQuiz(initialQuizId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleStartQuiz = async (quizId: string) => {
    try {
      const res = await api.quizzes.getById(quizId);
      if (res.quiz) {
        setActiveQuiz(res.quiz);
        setIsPlayerOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateAIQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setGeneratingQuiz(true);
    try {
      const res = await api.ai.generateQuiz({
        topic: aiTopic,
        subject: aiSubject,
        difficulty: aiDifficulty,
        numQuestions: aiNumQuestions,
      });

      if (res.quiz && res.quiz.questions) {
        // Save to backend catalog
        const savedRes = await api.quizzes.saveAIQuiz({
          title: res.quiz.title || `${aiTopic} AI Mastery Quiz`,
          subject: aiSubject,
          topic: aiTopic,
          difficulty: aiDifficulty,
          questions: res.quiz.questions,
        });

        const newQuiz = savedRes.quiz;
        setActiveQuiz(newQuiz);
        setIsPlayerOpen(true);
        fetchQuizzes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (selectedSubject !== 'All' && q.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header & Tabs */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {t('quizTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test your grasp with timed MCQs, instant explanations, and on-demand AI quizzes
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('allQuizzes')}
          </button>
          <button
            onClick={() => setActiveTab('ai-generator')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'ai-generator'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{t('aiQuizGenerator')}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Difficulty:
              </span>
              {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedDifficulty === d
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Subjects' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quizzes List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuizzes.map((q) => (
              <div
                key={q._id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                      {q.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-1">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Topic: {q.topic}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-4">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{q.questionCount} {t('questionsCount')}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{q.durationMinutes} {t('minutesCount')}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartQuiz(q._id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t('startQuiz')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Quiz Generator */}
      {activeTab === 'ai-generator' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Instant AI Quiz Generator</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter any topic from your textbook or lecture. Genie AI will synthesize realistic multiple-choice questions with 4 options and detailed explanations!
            </p>
          </div>

          <form onSubmit={handleGenerateAIQuiz} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Topic
              </label>
              <input
                type="text"
                required
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. Java Polymorphism, Calculus Limits, Database Joins"
                className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Domain
                </label>
                <select
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {subjectsList.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Easy">Easy (Beginner)</option>
                  <option value="Medium">Medium (University Standard)</option>
                  <option value="Hard">Hard (Competitive / Tricky)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Questions
                </label>
                <select
                  value={aiNumQuestions}
                  onChange={(e) => setAiNumQuestions(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={5}>5 Questions (Quick Check)</option>
                  <option value={10}>10 Questions (Standard Test)</option>
                  <option value={20}>20 Questions (Full Mock Exam)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generatingQuiz || !aiTopic.trim()}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {generatingQuiz ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Questions with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>Generate & Launch Quiz Now</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Interactive Quiz Player Modal */}
      {activeQuiz && (
        <QuizPlayerModal
          quiz={activeQuiz}
          isOpen={isPlayerOpen}
          onClose={() => {
            setIsPlayerOpen(false);
            setActiveQuiz(null);
          }}
          onRetake={() => {
            // Re-trigger player with clean state
            const current = activeQuiz;
            setActiveQuiz(null);
            setTimeout(() => {
              setActiveQuiz(current);
              setIsPlayerOpen(true);
            }, 100);
          }}
          onNavigateToNotes={onNavigateToNotes}
        />
      )}
    </div>
  );
};
