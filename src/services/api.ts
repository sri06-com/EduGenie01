// Centralized API client for EduGenie

const TOKEN_KEY = 'edugenie_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      fetchWithAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    demoLogin: () =>
      fetchWithAuth('/api/auth/demo-login', {
        method: 'POST',
      }),
    me: () => fetchWithAuth('/api/auth/me'),
    updateProfile: (profileData: any) =>
      fetchWithAuth('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    forgotPassword: (email: string) =>
      fetchWithAuth('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  // Subjects
  subjects: {
    getAll: () => fetchWithAuth('/api/subjects'),
    getById: (id: string) => fetchWithAuth(`/api/subjects/${id}`),
  },

  // Materials
  materials: {
    getAll: (params?: { subject?: string; type?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.subject) query.append('subject', params.subject);
      if (params?.type) query.append('type', params.type);
      if (params?.search) query.append('search', params.search);
      return fetchWithAuth(`/api/materials?${query.toString()}`);
    },
    getById: (id: string) => fetchWithAuth(`/api/materials/${id}`),
  },

  // Notes
  notes: {
    getAll: () => fetchWithAuth('/api/notes'),
    create: (note: any) =>
      fetchWithAuth('/api/notes', {
        method: 'POST',
        body: JSON.stringify(note),
      }),
    update: (id: string, note: any) =>
      fetchWithAuth(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(note),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/api/notes/${id}`, {
        method: 'DELETE',
      }),
  },

  // Quizzes
  quizzes: {
    getAll: () => fetchWithAuth('/api/quizzes'),
    getById: (id: string) => fetchWithAuth(`/api/quizzes/${id}`),
    submit: (id: string, answers: Record<string, number>) =>
      fetchWithAuth(`/api/quizzes/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
    saveAIQuiz: (quizData: any) =>
      fetchWithAuth('/api/quizzes/save-ai-quiz', {
        method: 'POST',
        body: JSON.stringify(quizData),
      }),
  },

  // Planner
  planner: {
    getTasks: () => fetchWithAuth('/api/planner'),
    addTask: (task: any) =>
      fetchWithAuth('/api/planner', {
        method: 'POST',
        body: JSON.stringify(task),
      }),
    toggleTask: (id: string) =>
      fetchWithAuth(`/api/planner/${id}/toggle`, {
        method: 'PATCH',
      }),
    deleteTask: (id: string) =>
      fetchWithAuth(`/api/planner/${id}`, {
        method: 'DELETE',
      }),
  },

  // Progress
  progress: {
    getStats: () => fetchWithAuth('/api/progress'),
    logSession: (minutes: number, subject?: string) =>
      fetchWithAuth('/api/progress/log-session', {
        method: 'POST',
        body: JSON.stringify({ minutes, subject }),
      }),
  },

  // Notifications
  notifications: {
    getAll: () => fetchWithAuth('/api/notifications'),
    markRead: (id: string) =>
      fetchWithAuth(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllRead: () =>
      fetchWithAuth('/api/notifications/mark-all-read', {
        method: 'PATCH',
      }),
    delete: (id: string) =>
      fetchWithAuth(`/api/notifications/${id}`, {
        method: 'DELETE',
      }),
  },

  // AI Assistant
  ai: {
    chat: (data: { message: string; mode?: string; language?: string }) =>
      fetchWithAuth('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getChatHistory: () => fetchWithAuth('/api/ai/chat-history'),
    clearChat: () =>
      fetchWithAuth('/api/ai/clear-chat', {
        method: 'DELETE',
      }),
    generateNotes: (data: { topic: string; subject: string; lengthType?: string; language?: string }) =>
      fetchWithAuth('/api/ai/generate-notes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    generateQuiz: (data: { topic: string; subject?: string; difficulty?: string; numQuestions?: number }) =>
      fetchWithAuth('/api/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getRecommendations: () => fetchWithAuth('/api/ai/recommendations'),
  },

  // Global search
  search: (query: string) => fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}`),
};
