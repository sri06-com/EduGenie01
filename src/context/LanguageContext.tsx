import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    brandName: 'EduGenie',
    brandTagline: 'Learn Smarter. Grow Faster.',

    // Navigation
    navDashboard: 'Dashboard',
    navAIAssistant: 'Genie AI',
    navMaterials: 'Materials',
    navQuizzes: 'Quizzes',
    navPlanner: 'Study Planner',
    navNotes: 'Notes Generator',
    navProgress: 'Progress',
    navProfile: 'Profile',
    navSettings: 'Settings',

    // Quick Actions
    askAI: 'Ask AI',
    studyMaterials: 'Study Materials',
    takeQuiz: 'Take Quiz',
    generateNotes: 'Generate Notes',
    studyPlanner: 'Study Planner',

    // Dashboard
    welcomeBack: 'Welcome back',
    todaysStudyGoal: "Today's Study Goal",
    minsRemaining: 'mins remaining',
    continueLearning: 'Continue Learning',
    recentActivity: 'Recent Activity',
    mySubjects: 'My Subjects',
    upcomingTasks: 'Upcoming Tasks',
    overallProgress: 'Overall Progress',
    resumeLearning: 'Resume',

    // AI Assistant
    aiAssistantTitle: 'Genie AI Study Companion',
    aiAssistantSubtitle: 'Ask anything about your syllabus, exam doubts, code, or math!',
    explainSimply: 'Explain simply',
    explainInDetail: 'Explain in detail',
    giveExamples: 'Give examples',
    summarize: 'Summarize',
    generateExamAnswer: 'Generate exam answer',
    generateImportantPoints: 'Generate important points',
    typeYourQuestion: 'Type your academic question or doubt here...',
    copyAnswer: 'Copy',
    saveAsNote: 'Save as Note',
    readAloud: 'Read Aloud',
    clearChat: 'Clear Chat',

    // Notes
    notesGeneratorTitle: 'AI Smart Notes Generator',
    enterTopic: 'Enter Topic (e.g. Dynamic Programming, Normalization, Photosynthesis)',
    selectSubject: 'Select Subject',
    noteLength: 'Note Depth',
    shortNote: 'Short Revision (2 mins)',
    detailedNote: 'Detailed Comprehensive',
    examReadyNote: 'Exam Ready (10-Marker)',
    generateNoteBtn: 'Generate Study Notes',
    savedNotes: 'Saved Notes',
    noNotesYet: 'No study notes saved yet. Generate one now!',

    // Quizzes
    quizTitle: 'Practice & Master Quizzes',
    allQuizzes: 'All Quizzes',
    aiQuizGenerator: 'AI Quiz Generator',
    difficulty: 'Difficulty',
    allDifficulties: 'All Difficulties',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    startQuiz: 'Start Quiz',
    questionsCount: 'Questions',
    minutesCount: 'mins',

    // Planner
    plannerTitle: 'Personalized Study Planner',
    addTask: 'Schedule Study Session',
    dailyView: 'Daily',
    weeklyView: 'Weekly',
    calendarView: 'Calendar',
    completed: 'Completed',
    pending: 'Pending',
    priority: 'Priority',
    high: 'High',
    low: 'Low',

    // Progress
    progressAnalytics: 'Study Progress & Mastery',
    studyTime: 'Study Time',
    quizAccuracy: 'Quiz Accuracy',
    tasksFinished: 'Tasks Completed',
    badgesTitle: 'Achievement Badges',
    weeklyStudyHours: 'Weekly Study Hours',
    startFocusSession: 'Start Focus Timer',

    // Gamification
    level: 'Level',
    xpPoints: 'XP',
    dayStreak: 'Day Streak',

    // Common
    search: 'Search anything (Ctrl+K)...',
    notifications: 'Notifications',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    download: 'Download',
  },
  ta: {
    // Brand
    brandName: 'EduGenie',
    brandTagline: 'புத்திசாலித்தனமாகப் படியுங்கள். வேகமாக வளருங்கள்.',

    // Navigation
    navDashboard: 'முகப்பு பலகை',
    navAIAssistant: 'ஜினி AI',
    navMaterials: 'பாடக் குறிப்புகள்',
    navQuizzes: 'வினாடி வினா',
    navPlanner: 'படிப்புத் திட்டம்',
    navNotes: 'குறிப்புகள் உருவாக்கி',
    navProgress: 'முன்னேற்றம்',
    navProfile: 'சுயவிவரம்',
    navSettings: 'அமைப்புகள்',

    // Quick Actions
    askAI: 'AI-யிடம் கேட்கவும்',
    studyMaterials: 'பாடக் குறிப்புகள்',
    takeQuiz: 'வினாடி வினா எடு',
    generateNotes: 'குறிப்பு உருவாக்கு',
    studyPlanner: 'படிப்புத் திட்டம்',

    // Dashboard
    welcomeBack: 'மீண்டும் நல்வரவு',
    todaysStudyGoal: 'இன்றைய படிப்பு இலக்கு',
    minsRemaining: 'நிமிடங்கள் மீதமுள்ளன',
    continueLearning: 'தொடர்ந்து கற்கவும்',
    recentActivity: 'சமீபத்திய செயல்பாடுகள்',
    mySubjects: 'என் பாடங்கள்',
    upcomingTasks: 'வரவிருக்கும் பணிகள்',
    overallProgress: 'ஒட்டுமொத்த முன்னேற்றம்',
    resumeLearning: 'தொடரவும்',

    // AI Assistant
    aiAssistantTitle: 'ஜினி AI கற்றல் வழிகாட்டி',
    aiAssistantSubtitle: 'பாடங்கள், தேர்வு சந்தேகங்கள், குறியீடுகள் பற்றி எதையும் கேளுங்கள்!',
    explainSimply: 'எளிமையாக விளக்குங்கள்',
    explainInDetail: 'விளக்கமாக விளக்குங்கள்',
    giveExamples: 'உதாரணங்கள் தருக',
    summarize: 'சுருக்கமாகத் தருக',
    generateExamAnswer: 'தேர்வுக்கான பதில் தருக',
    generateImportantPoints: 'முக்கிய குறிப்புகள் தருக',
    typeYourQuestion: 'உங்கள் கேள்வியை அல்லது சந்தேகத்தை இங்கு தட்டச்சு செய்யவும்...',
    copyAnswer: 'நகலெடு',
    saveAsNote: 'குறிப்பாக சேமி',
    readAloud: 'வாசிக்கவும்',
    clearChat: 'அரட்டையை அழிக்கவும்',

    // Notes
    notesGeneratorTitle: 'AI பாடக் குறிப்புகள் உருவாக்கி',
    enterTopic: 'தலைப்பை உள்ளிடவும் (எ.கா: ஜாவா, டேட்டாபேஸ், கால்குலஸ்)',
    selectSubject: 'பாடத்தைத் தேர்ந்தெடுக்கவும்',
    noteLength: 'குறிப்பின் அளவு',
    shortNote: 'குறுகிய மறுஆய்வு',
    detailedNote: 'முழுமையான விளக்கம்',
    examReadyNote: 'தேர்வுக்கான விரிவான பதில்',
    generateNoteBtn: 'குறிப்புகளை உருவாக்கு',
    savedNotes: 'சேமிக்கப்பட்ட குறிப்புகள்',
    noNotesYet: 'இன்னும் குறிப்புகள் இல்லை. இப்போது ஒன்றை உருவாக்குங்கள்!',

    // Quizzes
    quizTitle: 'பயிற்சி வினாடி வினாக்கள்',
    allQuizzes: 'அனைத்து வினாடி வினாக்கள்',
    aiQuizGenerator: 'AI வினாடி வினா உருவாக்கி',
    difficulty: 'சிரம நிலை',
    allDifficulties: 'அனைத்து நிலைகளும்',
    easy: 'எளிதானது',
    medium: 'நடுத்தரமானது',
    hard: 'கடினமானது',
    startQuiz: 'தொடங்கு',
    questionsCount: 'கேள்விகள்',
    minutesCount: 'நிமிடம்',

    // Planner
    plannerTitle: 'தனிப்பயன் படிப்புத் திட்டம்',
    addTask: 'படிப்பு நேரத்தை திட்டமிடு',
    dailyView: 'தினசரி',
    weeklyView: 'வாராந்திர',
    calendarView: 'நாட்காட்டி',
    completed: 'முடிந்தது',
    pending: 'நிலுவையில்',
    priority: 'முன்னுரிமை',
    high: 'அதிகம்',
    low: 'குறைவு',

    // Progress
    progressAnalytics: 'படிப்பு முன்னேற்றம் மற்றும் திறன்கள்',
    studyTime: 'படிப்பு நேரம்',
    quizAccuracy: 'வினாடி வினா துல்லியம்',
    tasksFinished: 'முடிக்கப்பட்ட பணிகள்',
    badgesTitle: 'சாதனைப் பதக்கங்கள்',
    weeklyStudyHours: 'வாராந்திர படிப்பு நேரம்',
    startFocusSession: 'கவனம் டைமர் தொடங்கு',

    // Gamification
    level: 'நிலை',
    xpPoints: 'XP',
    dayStreak: 'நாள் தொடர்ச்சி',

    // Common
    search: 'தேடவும் (Ctrl+K)...',
    notifications: 'அறிவிப்புகள்',
    logout: 'வெளியேறு',
    save: 'சேமி',
    cancel: 'ரத்து',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    download: 'பதிவிறக்கு',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('edugenie_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('edugenie_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
