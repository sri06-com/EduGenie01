import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Award,
  RotateCcw,
  BookOpen,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface QuizPlayerModalProps {
  quiz: any;
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
  onNavigateToNotes?: () => void;
}

export const QuizPlayerModal: React.FC<QuizPlayerModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onRetake,
  onNavigateToNotes,
}) => {
  const { awardXP } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>((quiz?.durationMinutes || 10) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTimeLeft((quiz?.durationMinutes || 10) * 60);
      setResult(null);
    }
  }, [isOpen, quiz]);

  // Timer
  useEffect(() => {
    if (!isOpen || result || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, result, timeLeft]);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optIndex: number) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      let res;
      if (quiz._id && !quiz._id.startsWith('ai_tmp_')) {
        res = await api.quizzes.submit(quiz._id, selectedAnswers);
      } else {
        // Calculate locally if preview generated
        let correct = 0;
        quiz.questions.forEach((q: any) => {
          if (selectedAnswers[q.id] === q.correctIndex) correct++;
        });
        const pct = Math.round((correct / totalQuestions) * 100);
        res = {
          result: {
            totalQuestions,
            correctAnswers: correct,
            wrongAnswers: totalQuestions - correct,
            percentage: pct,
            xpEarned: correct * 15 + 25,
            recommendedTopics: [quiz.topic + ' Edge Cases', 'Review Definitions'],
          },
          performanceMessage:
            pct >= 80 ? 'Outstanding mastery of this topic! 🌟' : 'Good practice! Review explanations to improve.',
          badgesEarned: pct === 100 ? ['Perfect Score'] : [],
        };
      }

      setResult(res);

      if (res.result) {
        awardXP(
          res.result.xpEarned || 50,
          res.badgesEarned?.[0] || (res.result.percentage === 100 ? 'Perfect Score' : undefined)
        );

        if (res.result.percentage >= 80) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const hasSelectedCurrent = selectedAnswers[currentQuestion?.id] !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 p-6 max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold text-xs">
              {currentIndex + 1}/{totalQuestions}
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                {quiz.title}
              </h3>
              <p className="text-[11px] text-slate-500">{quiz.subject} • {quiz.difficulty}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            {!result && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold border border-amber-200/50">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question View Mode */}
        {!result ? (
          <div className="space-y-6 my-2">
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 block">
                Question {currentIndex + 1}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQuestion?.question}
              </h4>
            </div>

            {/* 4 Options */}
            <div className="space-y-2.5">
              {currentQuestion?.options.map((opt: string, optIndex: number) => {
                const isSelected = selectedAnswers[currentQuestion.id] === optIndex;
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelectOption(optIndex)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {optionLetters[optIndex]}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Next / Prev / Submit controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                Previous
              </button>

              {isLast ? (
                <button
                  disabled={!hasSelectedCurrent || isSubmitting}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Final Quiz</span>
                </button>
              ) : (
                <button
                  disabled={!hasSelectedCurrent}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition active:scale-95 flex items-center gap-1"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Final Results Screen */
          <div className="space-y-6 my-2 animate-fade-in text-center">
            {/* Score circle */}
            <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/30">
              <span className="text-2xl font-extrabold">{result.result?.percentage}%</span>
              <span className="text-[10px] uppercase font-bold text-indigo-200">Score</span>
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {result.performanceMessage || 'Quiz Finished!'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                You earned <strong className="text-indigo-600 dark:text-indigo-400">+{result.result?.xpEarned || 50} XP</strong> for this practice session!
              </p>
            </div>

            {/* Score breakdown metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                  {result.result?.totalQuestions}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-500 font-bold uppercase block">Correct</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {result.result?.correctAnswers}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rose-500 font-bold uppercase block">Wrong</span>
                <span className="text-base font-extrabold text-rose-600">
                  {result.result?.wrongAnswers}
                </span>
              </div>
            </div>

            {/* Recommended topics to revise */}
            {result.result?.recommendedTopics?.length > 0 && (
              <div className="text-left p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Recommended Revision Topics:</span>
                </span>
                <ul className="text-xs text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                  {result.result.recommendedTopics.map((top: string, i: number) => (
                    <li key={i}>{top}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Question by question explanation review */}
            <div className="text-left space-y-3 pt-2">
              <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                Detailed Answer Review & Explanations:
              </h5>
              <div className="space-y-2.5 max-h-52 overflow-y-auto">
                {questions.map((q: any, i: number) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctIndex;
                  return (
                    <div
                      key={q.id || i}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-rose-200 bg-rose-50/40 dark:bg-rose-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="text-slate-900 dark:text-white">
                          Q{i + 1}: {q.question}
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                      </p>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1 bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg">
                        💡 {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onRetake}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
