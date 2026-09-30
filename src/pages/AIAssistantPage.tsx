import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FilePlus,
  Trash2,
  Loader2,
  Lightbulb,
  BookOpen,
  Code,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface AIAssistantPageProps {
  initialPrompt?: string;
  onNavigateToNotes?: () => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  initialPrompt,
  onNavigateToNotes,
}) => {
  const { user, awardXP } = useAuth();
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputQuery, setInputQuery] = useState(initialPrompt || '');
  const [selectedMode, setSelectedMode] = useState<string>('Explain simply');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteNotice, setSavedNoteNotice] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptModes = [
    { id: 'Explain simply', label: t('explainSimply') },
    { id: 'Explain in detail', label: t('explainInDetail') },
    { id: 'Give examples', label: t('giveExamples') },
    { id: 'Summarize', label: t('summarize') },
    { id: 'Generate exam answer', label: t('generateExamAnswer') },
    { id: 'Generate important points', label: t('generateImportantPoints') },
  ];

  const suggestedQuestions = [
    'Explain Polymorphism in Java with real-world analogies',
    'What is the difference between TCP and UDP? 10-mark exam answer',
    'How does BCNF normalization eliminate database anomalies?',
    'Explain Dynamic Programming memoization vs tabulation in Python',
  ];

  const fetchChatHistory = async () => {
    try {
      const res = await api.ai.getChatHistory();
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        setMessages([
          {
            id: 'init_welcome',
            sender: 'assistant',
            text: `Hello ${user?.name || 'there'}! 🧞 I am **Genie AI**, your personalized learning companion.

I can explain concepts simply, generate exam-ready 10-mark answers, help with programming & math problems, or extract important revision notes.

Pick a study mode above and ask any question!`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: 'local_user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
      mode: selectedMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.ai.chat({
        message: textToSend,
        mode: selectedMode,
        language,
      });

      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
        awardXP(res.xpEarned || 10, res.badgeUnlocked ? res.unlockedBadgeName : undefined);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error_' + Date.now(),
          sender: 'assistant',
          text: 'Oops! I encountered a slight hiccup answering that. Please try asking again!',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveAsNote = async (text: string, index: number) => {
    try {
      const firstLine = text.split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Genie Study Note';
      const res = await api.notes.create({
        title: firstLine.slice(0, 50),
        subject: user?.selectedSubjects?.[0] || 'Academic Studies',
        topic: firstLine,
        lengthType: selectedMode,
        content: {
          summary: text.slice(0, 200) + '...',
          definitions: ['Extracted directly from Genie AI discussion.'],
          detailedNotes: text,
          importantPoints: ['Generated via EduGenie AI Study Companion.'],
          practicalExamples: [],
          examReadyAnswer: text,
        },
      });

      awardXP(30, res.badgeUnlocked ? res.unlockedBadgeName : undefined);
      setSavedNoteNotice('Successfully saved to your Study Notes! 📝');
      setTimeout(() => setSavedNoteNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all conversation history with Genie AI?')) {
      await api.ai.clearChat();
      fetchChatHistory();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-5xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t('aiAssistantTitle')}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                Online 🧞
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('aiAssistantSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedNoteNotice && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
              {savedNoteNotice}
            </span>
          )}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Chips Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 no-scrollbar">
        {promptModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedMode === mode.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 my-2">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md'
                }`}
              >
                {isUser ? user?.name?.[0] || 'U' : '🧞'}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800'
                }`}
              >
                {/* Assistant Mode Tag */}
                {!isUser && msg.mode && (
                  <div className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold mb-2">
                    Mode: {msg.mode}
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Assistant Action Buttons */}
                {!isUser && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t('copyAnswer')}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSaveAsNote(msg.text, index)}
                      className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
                      title="Save as Study Note"
                    >
                      <FilePlus className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('saveAsNote')}</span>
                    </button>

                    <button
                      onClick={() => handleSpeak(msg.text, msg.id)}
                      className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
                      title="Listen to audio explanation"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-500 font-semibold">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t('readAloud')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
              🧞
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Genie is formulating a crystal-clear explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (shown when chat is quiet) */}
      {messages.length <= 2 && (
        <div className="mb-2 shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Suggested academic questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative shrink-0"
      >
        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t('typeYourQuestion')}
            className="w-full text-xs sm:text-sm pl-4 pr-12 py-3.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
