import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client with aistudio-build user agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface GenieChatOptions {
  message: string;
  history?: { role: 'user' | 'model'; parts: [{ text: string }] }[];
  mode?: 'Explain simply' | 'Explain in detail' | 'Give examples' | 'Summarize' | 'Generate exam answer' | 'Generate important points';
  language?: 'en' | 'ta';
  educationLevel?: string;
  course?: string;
}

export async function askGenieAI({
  message,
  mode = 'Explain simply',
  language = 'en',
  educationLevel = 'College / University',
  course = 'Computer Science',
}: GenieChatOptions): Promise<string> {
  const languageInstruction = language === 'ta'
    ? 'Respond in Tamil (தமிழ்) with clear explanations, retaining standard technical terms in English where helpful.'
    : 'Respond in clear, engaging English.';

  let modeInstruction = '';
  switch (mode) {
    case 'Explain simply':
      modeInstruction = 'Explain this concept in a very simple, beginner-friendly way using everyday analogies and minimal jargon.';
      break;
    case 'Explain in detail':
      modeInstruction = 'Provide an in-depth, rigorous academic breakdown covering principles, architecture, underlying mechanics, and trade-offs.';
      break;
    case 'Give examples':
      modeInstruction = 'Focus on concrete, practical examples, clear code snippets (if technical), or step-by-step mathematical problems.';
      break;
    case 'Summarize':
      modeInstruction = 'Provide a punchy, executive summary with key definitions and 5 bullet points that highlight the essence.';
      break;
    case 'Generate exam answer':
      modeInstruction = 'Format as a standard 10-mark university/college exam response with: 1. Definition/Introduction, 2. Key Concepts & Diagram Description, 3. Detailed Mechanism, 4. Real-world Example, 5. Conclusion.';
      break;
    case 'Generate important points':
      modeInstruction = 'List the high-yield exam takeaways, key formulas/rules, common pitfalls to avoid, and probable viva/test questions.';
      break;
  }

  const systemInstruction = `You are "Genie AI", an empathetic, brilliant, and patient AI study companion for students in "${course}" at "${educationLevel}" level.
Your goal is to make learning crystal-clear, enjoyable, and confidence-boosting.
Rules:
1. Always format responses cleanly with markdown headings (###), bold text, bullet points, and code blocks where applicable.
2. Maintain a warm, encouraging, student-friendly tone.
3. ${languageInstruction}
4. Adhere closely to the selected study mode: "${mode}". ${modeInstruction}`;

  try {
    if (!apiKey) {
      return getFallbackChatResponse(message, mode, language);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text || text.trim() === '') {
      return getFallbackChatResponse(message, mode, language);
    }
    return text;
  } catch (error) {
    console.error('Error in askGenieAI:', error);
    return getFallbackChatResponse(message, mode, language);
  }
}

export interface GenerateNotesOptions {
  topic: string;
  subject: string;
  lengthType: 'Short' | 'Detailed' | 'Exam Ready';
  language?: 'en' | 'ta';
}

export interface GeneratedNoteData {
  title: string;
  summary: string;
  definitions: string[];
  detailedNotes: string;
  importantPoints: string[];
  practicalExamples: string[];
  examReadyAnswer: string;
}

export async function generateAINotes({
  topic,
  subject,
  lengthType,
  language = 'en',
}: GenerateNotesOptions): Promise<GeneratedNoteData> {
  const prompt = `Generate comprehensive, exam-ready study notes for:
Subject: ${subject}
Topic: ${topic}
Depth: ${lengthType}
Language: ${language === 'ta' ? 'Tamil' : 'English'}

Provide a well-structured response that covers definitions, detailed explanation, high-yield bullet points, real-world examples, and an exam-style answer.`;

  try {
    if (!apiKey) {
      return getFallbackNotes(topic, subject, lengthType);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            definitions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            detailedNotes: { type: Type.STRING },
            importantPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            practicalExamples: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examReadyAnswer: { type: Type.STRING },
          },
          required: ['title', 'summary', 'definitions', 'detailedNotes', 'importantPoints', 'practicalExamples', 'examReadyAnswer'],
        },
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return parsed;
    }
    return getFallbackNotes(topic, subject, lengthType);
  } catch (error) {
    console.error('Error generating notes with Gemini:', error);
    return getFallbackNotes(topic, subject, lengthType);
  }
}

export interface GenerateQuizOptions {
  topic: string;
  subject?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  numQuestions: number;
}

export interface GeneratedQuizData {
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export async function generateAIQuiz({
  topic,
  subject = 'General Academic',
  difficulty = 'Medium',
  numQuestions = 5,
}: GenerateQuizOptions): Promise<GeneratedQuizData> {
  const prompt = `Create an interactive multiple-choice quiz of ${numQuestions} questions on the topic "${topic}" (Subject: "${subject}").
Difficulty level: ${difficulty}.
Requirements:
1. Each question must have exactly 4 plausible options.
2. Specify the correct 0-based option index (0, 1, 2, or 3).
3. Provide a clear pedagogical explanation for why the correct option is right.`;

  try {
    if (!apiKey) {
      return getFallbackQuiz(topic, subject, difficulty, numQuestions);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'topic', 'difficulty', 'questions'],
        },
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        difficulty,
      };
    }
    return getFallbackQuiz(topic, subject, difficulty, numQuestions);
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    return getFallbackQuiz(topic, subject, difficulty, numQuestions);
  }
}

// Educational Fallback generators when API key is not present or offline
function getFallbackChatResponse(query: string, mode: string, language: string): string {
  if (language === 'ta') {
    return `### 🧞 Genie AI - கற்றல் வழிகாட்டி

உங்கள் கேள்வி: **"${query}"**

1. **சுருக்கம்**: "${query}" பற்றிய அடிப்படையான கருத்துக்கள் மற்றும் அதன் நடைமுறை பயன்பாடுகள் இங்கு விளக்கப்பட்டுள்ளன.
2. **முக்கிய கோட்பாடுகள்**:
   - எளிமையான அணுகுமுறை மூலம் புரிந்து கொள்ளுதல்
   - தேர்வுக்கான முக்கிய குறிப்புகள்
   - அன்றாட உதாரணங்களுடன் ஒப்பிடுதல்
3. **தேர்வு குறிப்பு**: முக்கிய சூத்திரங்கள் மற்றும் வரைபடங்களை நினைவில் வைத்துக் கொண்டு பதிலளிக்கவும்!`;
  }

  return `### 🧞 Genie AI Response (${mode})

Here is a structured breakdown regarding **"${query}"**:

1. **Core Concept Overview**:
   Understanding "${query}" revolves around fundamental principles that allow students to break complex systems into manageable building blocks.

2. **Key Mechanisms**:
   - **Foundational Logic**: Core concepts always rely on clear definitions and consistent rules.
   - **Real-World Intuition**: Think of how this operates in modern industry applications and everyday scenarios.
   - **Exam Advantage**: Examiners prioritize conceptual clarity, structured headings, and practical illustrations.

3. **Key Takeaway**:
   Keep practicing with interactive quizzes and structured notes to solidify this topic! If you need deeper explanations or code examples, feel free to ask me with another prompt!`;
}

function getFallbackNotes(topic: string, subject: string, lengthType: string): GeneratedNoteData {
  return {
    title: `${topic} Master Study Notes`,
    summary: `${topic} is a cornerstone concept in ${subject}. It provides the theoretical framework and practical methodology required for deep subject comprehension and exam success.`,
    definitions: [
      `${topic}: The fundamental principle governing how components interact within ${subject}.`,
      `Core Invariant: The steady-state condition that remains consistent across all variations of this topic.`,
      `Application Interface: The point of interaction between theoretical models and real-world implementations.`,
    ],
    detailedNotes: `In ${subject}, studying "${topic}" requires analyzing both foundational principles and practical constraints. When designing solutions or answering exam questions, students must structure their thought process sequentially: First, identify the core problem domain; second, evaluate algorithmic or conceptual trade-offs; and third, apply standard verified techniques. Master this progression to solve even challenging university or competitive exam problems with confidence.`,
    importantPoints: [
      `Always state clear assumptions before applying formulas or algorithms related to ${topic}.`,
      `Be mindful of edge cases and boundary conditions in practical implementations.`,
      `Use visual diagrams or structural flowcharts to guarantee maximum marks in subjective tests.`,
      `Review related solved past papers to identify standard recurring question variations.`,
    ],
    practicalExamples: [
      `Practical Scenario 1: Applying ${topic} to optimize performance in high-throughput enterprise systems.`,
      `Practical Scenario 2: Step-by-step problem solving showcasing standard formulas and intermediate steps.`,
    ],
    examReadyAnswer: `Q: Discuss "${topic}" in detail with its importance in ${subject}.\n\nAnswer:\n1. Introduction: ${topic} plays a vital role by establishing clear boundaries and rules.\n2. Key Architecture: The system is categorized into core principles and execution steps.\n3. Practical Significance: It directly influences efficiency, maintainability, and scalability.\n4. Conclusion: A solid grasp of ${topic} ensures both practical competency and top-tier academic marks.`,
  };
}

function getFallbackQuiz(topic: string, subject: string, difficulty: 'Easy' | 'Medium' | 'Hard', count: number): GeneratedQuizData {
  const sampleQuestions = [
    {
      question: `What is the primary objective of studying "${topic}" in ${subject}?`,
      options: [
        'To establish a systematic and structured problem-solving methodology',
        'To bypass all fundamental testing procedures',
        'To increase complexity without tangible benefits',
        'To limit scalability across systems',
      ],
      correctIndex: 0,
      explanation: `Studying "${topic}" provides students with a foundational, structured approach to analyzing problems efficiently.`,
    },
    {
      question: `Which of the following is considered best practice when applying "${topic}"?`,
      options: [
        'Ignoring boundary conditions and assumptions',
        'Validating inputs and verifying edge cases consistently',
        'Skipping modular design principles',
        'Hardcoding variable values directly into logic',
      ],
      correctIndex: 1,
      explanation: 'Consistently validating inputs and considering edge cases is the hallmark of robust academic and professional work.',
    },
    {
      question: `Under standard conditions, how does "${topic}" affect overall operational efficiency?`,
      options: [
        'It degrades performance by introducing redundant steps',
        'It optimizes resource utilization and ensures deterministic behavior',
        'It has zero measurable impact on system behavior',
        'It only works for small toy datasets',
      ],
      correctIndex: 1,
      explanation: 'Proper application ensures deterministic outcomes and optimized resource management.',
    },
    {
      question: `In an exam setting, which component is most critical when explaining "${topic}"?`,
      options: [
        'Clear definitions, step-by-step reasoning, and visual illustrations',
        'Lengthy irrelevant historical trivia',
        'Omitting formulas and practical code snippets',
        'Leaving out final conclusions and trade-offs',
      ],
      correctIndex: 0,
      explanation: 'University examiners look for concise definitions, structured mechanisms, and practical diagrams.',
    },
    {
      question: `What is the expected outcome when analyzing edge cases in "${topic}"?`,
      options: [
        'Unpredictable termination without error messages',
        'Graceful handling of boundary limits without unexpected failures',
        'Total disregard for constraint enforcement',
        'Infinite recursion loops',
      ],
      correctIndex: 1,
      explanation: 'Analyzing edge cases guarantees that edge-condition inputs are processed gracefully without crashes.',
    },
  ];

  return {
    title: `${topic} (${difficulty} Challenge)`,
    topic,
    difficulty,
    questions: sampleQuestions.slice(0, Math.min(count, sampleQuestions.length)),
  };
}
