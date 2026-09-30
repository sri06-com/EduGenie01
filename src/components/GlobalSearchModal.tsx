import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileText, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    subjects: any[];
    materials: any[];
    notes: any[];
    quizzes: any[];
  }>({ subjects: [], materials: [], notes: [], quizzes: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ subjects: [], materials: [], notes: [], quizzes: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.search(query);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults =
    results.subjects.length + results.materials.length + results.notes.length + results.quizzes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-indigo-100 dark:border-slate-800 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search subjects, notes, quizzes, questions, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin mr-2 shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-3 px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Polymorphism', 'DBMS Normalization', 'Python Pandas', 'Calculus', 'ACID Properties'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 && !isLoading ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              No direct matches found for "{query}". You can ask Genie AI directly!
              <div className="mt-3">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('ai-assistant', { prompt: query });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Ask Genie AI about "{query}" 🧞
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Subjects */}
              {results.subjects.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Subjects
                  </h4>
                  <div className="space-y-1">
                    {results.subjects.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => {
                          onClose();
                          onNavigate('dashboard');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {s.code}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                              {s.name}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{s.description}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Materials */}
              {results.materials.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Study Materials & Notes
                  </h4>
                  <div className="space-y-1">
                    {results.materials.map((m) => (
                      <div
                        key={m._id}
                        onClick={() => {
                          onClose();
                          onNavigate('materials', { selectedId: m._id });
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                              {m.title}
                            </span>
                            <span className="text-[11px] text-slate-500">{m.subject} • {m.type}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quizzes */}
              {results.quizzes.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Quizzes & Practice
                  </h4>
                  <div className="space-y-1">
                    {results.quizzes.map((qz) => (
                      <div
                        key={qz._id}
                        onClick={() => {
                          onClose();
                          onNavigate('quizzes', { quizId: qz._id });
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <HelpCircle className="w-4 h-4 text-purple-500" />
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                              {qz.title}
                            </span>
                            <span className="text-[11px] text-slate-500">{qz.subject} • {qz.difficulty}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {results.notes.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    My Saved Notes
                  </h4>
                  <div className="space-y-1">
                    {results.notes.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          onClose();
                          onNavigate('notes');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-amber-500" />
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                              {n.title}
                            </span>
                            <span className="text-[11px] text-slate-500">{n.subject}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
