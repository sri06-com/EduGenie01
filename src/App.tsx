import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { LanguageProvider } from './context/LanguageContext.js';

import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { BottomNavigation } from './components/BottomNavigation.js';
import { GlobalSearchModal } from './components/GlobalSearchModal.js';
import { PomodoroModal } from './components/PomodoroModal.js';
import { BadgeUnlockModal } from './components/BadgeUnlockModal.js';

import { LandingPage } from './pages/LandingPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AIAssistantPage } from './pages/AIAssistantPage.js';
import { NotesGeneratorPage } from './pages/NotesGeneratorPage.js';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage.js';
import { QuizPage } from './pages/QuizPage.js';
import { StudyPlannerPage } from './pages/StudyPlannerPage.js';
import { ProgressPage } from './pages/ProgressPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';

function MainApp() {
  const { user, isLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navParams, setNavParams] = useState<any>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setNavParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center text-white text-xl font-bold">
            🧞
          </div>
          <span className="text-xs font-semibold tracking-wide text-slate-500">
            Waking up EduGenie...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in: Show Landing or Auth page
  if (!user) {
    if (currentPage === 'auth') {
      return <AuthPage onSuccess={() => setCurrentPage('dashboard')} />;
    }
    return <LandingPage onNavigate={(page) => setCurrentPage(page)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-[#1E293B] dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar currentPage={currentPage} onNavigate={navigateTo} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 min-w-0">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={navigateTo}
              onOpenPomodoro={() => setIsPomodoroOpen(true)}
            />
          )}

          {currentPage === 'ai-assistant' && (
            <AIAssistantPage
              initialPrompt={navParams?.prompt}
              onNavigateToNotes={() => navigateTo('notes')}
            />
          )}

          {currentPage === 'notes' && <NotesGeneratorPage />}

          {currentPage === 'materials' && (
            <StudyMaterialsPage
              initialSubject={navParams?.subject}
              initialSelectedId={navParams?.selectedId}
              onNavigateToQuiz={(quizId) => navigateTo('quizzes', { quizId })}
              onNavigateToAI={(topic) => navigateTo('ai-assistant', { prompt: `Explain ${topic} in detail` })}
            />
          )}

          {currentPage === 'quizzes' && (
            <QuizPage
              initialQuizId={navParams?.quizId}
              onNavigateToNotes={() => navigateTo('notes')}
            />
          )}

          {currentPage === 'planner' && <StudyPlannerPage />}

          {currentPage === 'progress' && (
            <ProgressPage onOpenPomodoro={() => setIsPomodoroOpen(true)} />
          )}

          {currentPage === 'profile' && <ProfilePage />}

          {currentPage === 'settings' && (
            <SettingsPage onLogout={() => setCurrentPage('landing')} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation currentPage={currentPage} onNavigate={navigateTo} />

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigateTo}
      />

      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        defaultSubject={user?.selectedSubjects?.[0] || 'Java Programming'}
      />

      <BadgeUnlockModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
