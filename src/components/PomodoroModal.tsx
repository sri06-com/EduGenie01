import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose, defaultSubject = 'Java Programming' }) => {
  const { awardXP } = useAuth();
  const [mode, setMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>(defaultSubject);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [loggedNotice, setLoggedNotice] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const durationMap = {
    study: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    setTimeLeft(durationMap[mode]);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleSessionCompleted();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Ambient sound synthesizer using Web Audio API
  useEffect(() => {
    if (soundEnabled && isRunning) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(196, audioContextRef.current.currentTime); // G3 warm calm drone
        gain.gain.setValueAtTime(0.04, audioContextRef.current.currentTime);
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        oscillatorRef.current = osc;
      } catch (e) {
        console.warn('Audio not available', e);
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (_) {}
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (_) {}
        audioContextRef.current = null;
      }
    }
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (_) {}
      }
    };
  }, [soundEnabled, isRunning]);

  const handleSessionCompleted = async () => {
    setIsRunning(false);
    if (mode === 'study') {
      setCompletedSessions((prev) => prev + 1);
      try {
        const res = await api.progress.logSession(25, subject);
        awardXP(res.xpEarned || 30, res.badgeUnlocked ? 'Dedicated Learner' : undefined);
        setLoggedNotice('Focus goal achieved! +30 XP added to your student profile! 🎉');
        setTimeout(() => setLoggedNotice(null), 5000);
      } catch (err) {
        console.error('Failed to log study session', err);
      }
    }
  };

  const handleManualLogNow = async () => {
    const minutesStudied = Math.max(5, Math.round((durationMap[mode] - timeLeft) / 60));
    try {
      const res = await api.progress.logSession(minutesStudied, subject);
      awardXP(res.xpEarned || 20, res.badgeUnlocked ? 'Dedicated Learner' : undefined);
      setLoggedNotice(`Logged ${minutesStudied} mins! +${res.xpEarned || 20} XP earned! ✨`);
      setTimeout(() => setLoggedNotice(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((durationMap[mode] - timeLeft) / durationMap[mode]) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Study Focus Session</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pomodoro & Flow Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          <button
            onClick={() => setMode('study')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'study'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Focus 25m
          </button>
          <button
            onClick={() => setMode('shortBreak')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Short Break 5m
          </button>
          <button
            onClick={() => setMode('longBreak')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Long Break 15m
          </button>
        </div>

        {/* Subject Tag */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Studying Subject:
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Java Programming">Java Programming</option>
            <option value="Python for Data Science">Python for Data Science</option>
            <option value="Engineering Mathematics">Engineering Mathematics</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Professional English & Communication">Professional English & Communication</option>
          </select>
        </div>

        {/* Circular Display */}
        <div className="relative my-6 flex flex-col items-center justify-center">
          <div className="w-48 h-48 rounded-full border-8 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative shadow-inner">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-linear"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white z-10 font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 z-10 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {mode === 'study' ? 'Deep Focus' : 'Recharge Time'}
            </span>
          </div>
        </div>

        {/* Notice feedback */}
        {loggedNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{loggedNotice}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Mute ambient sound' : 'Turn on calm focus tone'}
            className={`p-3 rounded-2xl border transition ${
              soundEnabled
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400'
                : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsRunning((prev) => !prev)}
            className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition transform active:scale-95"
          >
            {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(durationMap[mode]);
            }}
            title="Reset timer"
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Footer info & log button */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <span>Sessions completed: <strong className="text-slate-800 dark:text-slate-200">{completedSessions}</strong></span>
          <button
            onClick={handleManualLogNow}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            Save progress now
          </button>
        </div>
      </div>
    </div>
  );
};
