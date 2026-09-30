import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Sparkles,
  Save,
  Download,
  Trash2,
  Edit3,
  Copy,
  Check,
  BookOpen,
  CheckCircle2,
  Loader2,
  FolderOpen,
  X,
  FileText,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

export const NotesGeneratorPage: React.FC = () => {
  const { user, awardXP } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Java Programming');
  const [lengthType, setLengthType] = useState<'Short' | 'Detailed' | 'Exam Ready'>('Detailed');
  const [generating, setGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any | null>(null);

  // Saved Notes state
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const subjectsList = [
    'Java Programming',
    'Python for Data Science',
    'Engineering Mathematics',
    'Database Management Systems',
    'Data Structures & Algorithms',
    'Professional English & Communication',
  ];

  const fetchSavedNotes = async () => {
    try {
      setLoadingNotes(true);
      const res = await api.notes.getAll();
      setSavedNotes(res.notes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchSavedNotes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setStatusNotice(null);
    try {
      const res = await api.ai.generateNotes({
        topic,
        subject,
        lengthType,
        language,
      });

      if (res.noteData) {
        setGeneratedNote({
          ...res.noteData,
          subject,
          lengthType,
          topic,
        });
      }
    } catch (err) {
      console.error(err);
      setStatusNotice('Error generating notes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGeneratedNote = async () => {
    if (!generatedNote) return;
    try {
      const res = await api.notes.create({
        title: generatedNote.title || `${generatedNote.topic} Notes`,
        subject: generatedNote.subject || subject,
        topic: generatedNote.topic || topic,
        lengthType: generatedNote.lengthType || lengthType,
        content: {
          summary: generatedNote.summary,
          definitions: generatedNote.definitions,
          detailedNotes: generatedNote.detailedNotes,
          importantPoints: generatedNote.importantPoints,
          practicalExamples: generatedNote.practicalExamples,
          examReadyAnswer: generatedNote.examReadyAnswer,
        },
      });

      awardXP(30, res.badgeUnlocked ? res.unlockedBadgeName : undefined);
      setStatusNotice('Note saved to library! +30 XP gained! 🎉');
      fetchSavedNotes();
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this study note?')) {
      try {
        await api.notes.delete(id);
        setSavedNotes((prev) => prev.filter((n) => n._id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDownloadNote = (note: any) => {
    const textContent = `=====================================================
${note.title || note.topic}
Subject: ${note.subject} | Type: ${note.lengthType || 'Detailed'}
Generated with EduGenie - AI Powered Learning Assistant
=====================================================

--- 1. SUMMARY ---
${note.content?.summary || ''}

--- 2. KEY DEFINITIONS ---
${(note.content?.definitions || []).map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}

--- 3. DETAILED NOTES ---
${note.content?.detailedNotes || ''}

--- 4. IMPORTANT POINTS ---
${(note.content?.importantPoints || []).map((p: string, i: number) => `• ${p}`).join('\n')}

--- 5. PRACTICAL EXAMPLES ---
${(note.content?.practicalExamples || []).map((ex: string, i: number) => `Example ${i + 1}:\n${ex}`).join('\n\n')}

--- 6. EXAM-READY SAMPLE ANSWER ---
${note.content?.examReadyAnswer || ''}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(note.title || note.topic).replace(/[^a-zA-Z0-9]/g, '_')}_EduGenie_Notes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    try {
      await api.notes.update(editingNote._id, {
        title: editingNote.title,
        subject: editingNote.subject,
        content: editingNote.content,
      });

      setSavedNotes((prev) =>
        prev.map((n) => (n._id === editingNote._id ? editingNote : n))
      );
      setEditingNote(null);
      setStatusNotice('Note updated successfully!');
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
            <FileEdit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {t('notesGeneratorTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate structured exam-ready revision notes, definitions & examples with Genie AI
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'generate'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Create Notes
          </button>
          <button
            onClick={() => {
              setActiveTab('saved');
              fetchSavedNotes();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Saved Library ({savedNotes.length})
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Tab 1: Generate Notes */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <form
            onSubmit={handleGenerate}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Chapter to Master
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t('enterTopic')}
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('selectSubject')}
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Depth Radio Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('noteLength')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Short', title: t('shortNote'), desc: 'Quick formulas, definitions & 5 points' },
                  { id: 'Detailed', title: t('detailedNote'), desc: 'Comprehensive depth, concepts & diagrams' },
                  { id: 'Exam Ready', title: t('examReadyNote'), desc: 'Structured 10-mark standard response' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setLengthType(item.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      lengthType === item.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="font-bold text-xs block">{item.title}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating || !topic.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-98 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Academic Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('generateNoteBtn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Result Preview */}
          {generatedNote && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              {/* Note Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                      {generatedNote.subject}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Depth: {generatedNote.lengthType}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {generatedNote.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveGeneratedNote}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Notes (+30 XP)</span>
                  </button>

                  <button
                    onClick={() => handleDownloadNote(generatedNote)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    title="Download Note (.txt)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 1. Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                  1. Executive Summary
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl leading-relaxed">
                  {generatedNote.summary}
                </p>
              </div>

              {/* 2. Key Definitions */}
              {generatedNote.definitions?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                    2. Key Definitions & Terminology
                  </h4>
                  <div className="space-y-2">
                    {generatedNote.definitions.map((def: string, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                      >
                        {def}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Detailed Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  3. In-Depth Concepts & Mechanics
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {generatedNote.detailedNotes}
                </div>
              </div>

              {/* 4. Important Points */}
              {generatedNote.importantPoints?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                    4. High-Yield Exam Points & Pitfalls
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    {generatedNote.importantPoints.map((pt: string, i: number) => (
                      <li key={i} className="leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. Practical Examples */}
              {generatedNote.practicalExamples?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                    5. Practical Examples & Code
                  </h4>
                  <div className="space-y-2">
                    {generatedNote.practicalExamples.map((ex: string, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap overflow-x-auto shadow-inner"
                      >
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Exam-Ready Answer */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                  6. Standard 10-Mark Exam Answer
                </h4>
                <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {generatedNote.examReadyAnswer}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Notes Library */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {loadingNotes ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading saved notes...</span>
            </div>
          ) : savedNotes.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 space-y-3">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">{t('noNotesYet')}</p>
              <button
                onClick={() => setActiveTab('generate')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Create My First Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedNotes.map((n) => (
                <div
                  key={n._id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                        {n.subject}
                      </span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 mb-2">
                      {n.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {n.content?.summary || n.content?.detailedNotes || 'No summary available.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => setEditingNote(n)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('edit')}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadNote(n)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Download Note"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteNote(n._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Edit Study Note
              </h3>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={editingNote.subject}
                  onChange={(e) => setEditingNote({ ...editingNote, subject: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Notes / Content
                </label>
                <textarea
                  rows={8}
                  value={editingNote.content?.detailedNotes || ''}
                  onChange={(e) =>
                    setEditingNote({
                      ...editingNote,
                      content: {
                        ...editingNote.content,
                        detailedNotes: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
