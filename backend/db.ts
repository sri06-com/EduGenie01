import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Types corresponding to database collections
export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  educationLevel: string;
  course: string;
  department: string;
  semester: string;
  profileImage: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  selectedSubjects: string[];
  createdAt: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  course: string;
  semester: string;
  icon: string;
  color: string;
  totalTopics: number;
  completedTopics: number;
}

export interface Material {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  type: 'Notes' | 'PDF' | 'Video' | 'PYQ' | 'Reference';
  fileUrl?: string;
  description: string;
  durationOrPages: string;
  tags: string[];
  createdAt: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  subject: string;
  topic: string;
  lengthType: string;
  content: {
    summary: string;
    definitions: string[];
    detailedNotes: string;
    importantPoints: string[];
    practicalExamples: string[];
    examReadyAnswer: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  questions: QuizQuestion[];
  isAIGenerated?: boolean;
}

export interface QuizResult {
  _id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  percentage: number;
  xpEarned: number;
  recommendedTopics: string[];
  completedAt: string;
}

export interface StudyPlan {
  _id: string;
  userId: string;
  subject: string;
  topic: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  createdAt: string;
}

export interface SubjectProgress {
  subject: string;
  percentage: number;
  studyTimeMinutes: number;
  topicsCompleted: number;
  totalTopics: number;
  quizAverage: number;
}

export interface Badge {
  _id: string;
  id: string;
  badgeName: string;
  description: string;
  icon: string;
  category: string;
  earnedAt?: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'task' | 'quiz' | 'material' | 'achievement';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: string;
}

class EduGenieDatabase {
  users: Map<string, User> = new Map();
  subjects: Map<string, Subject> = new Map();
  materials: Map<string, Material> = new Map();
  notes: Map<string, Note> = new Map();
  quizzes: Map<string, Quiz> = new Map();
  quizResults: Map<string, QuizResult> = new Map();
  studyPlans: Map<string, StudyPlan> = new Map();
  notifications: Map<string, NotificationItem> = new Map();
  badgesDefinition: Badge[] = [];
  userBadges: Map<string, Set<string>> = new Map(); // userId -> Set of badgeIds
  userChatHistory: Map<string, ChatMessage[]> = new Map(); // userId -> messages
  userStudyLogs: Map<string, { date: string; minutes: number }[]> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Badges definitions
    this.badgesDefinition = [
      { _id: 'b1', id: 'first_quiz', badgeName: 'First Quiz', description: 'Completed your very first interactive practice quiz', icon: '🎯', category: 'Quiz' },
      { _id: 'b2', id: 'streak_7', badgeName: '7 Day Streak', description: 'Studied consistently for 7 straight days', icon: '🔥', category: 'Consistency' },
      { _id: 'b3', id: 'q_100', badgeName: '100 Questions Completed', description: 'Solved over 100 questions on EduGenie', icon: '💯', category: 'Mastery' },
      { _id: 'b4', id: 'study_master', badgeName: 'Study Master', description: 'Completed 20+ study planner milestones', icon: '🎓', category: 'Study' },
      { _id: 'b5', id: 'perfect_score', badgeName: 'Perfect Score', description: 'Achieved 100% accuracy in a challenging quiz', icon: '🌟', category: 'Quiz' },
      { _id: 'b6', id: 'note_crafter', badgeName: 'Note Crafter', description: 'Generated and organized 5+ smart revision notes', icon: '📝', category: 'Notes' },
      { _id: 'b7', id: 'curious_mind', badgeName: 'Curious Mind', description: 'Asked Genie AI 10 thoughtful academic questions', icon: '💡', category: 'AI' },
      { _id: 'b8', id: 'night_owl', badgeName: 'Dedicated Learner', description: 'Logged focused study sessions beyond 2 hours', icon: '⚡', category: 'Focus' },
    ];

    // Seed Subjects
    const initialSubjects: Subject[] = [
      {
        _id: 'sub_1',
        name: 'Java Programming',
        code: 'CS301',
        description: 'Object-Oriented Programming, Polymorphism, Collections & Multithreading',
        course: 'B.Tech / B.E',
        semester: 'Semester 4',
        icon: 'Coffee',
        color: '#4F46E5',
        totalTopics: 15,
        completedTopics: 12,
      },
      {
        _id: 'sub_2',
        name: 'Python for Data Science',
        code: 'CS304',
        description: 'NumPy, Pandas, Data Wrangling, Scikit-Learn & Machine Learning',
        course: 'B.Tech / B.E',
        semester: 'Semester 5',
        icon: 'Code2',
        color: '#0284C7',
        totalTopics: 14,
        completedTopics: 9,
      },
      {
        _id: 'sub_3',
        name: 'Engineering Mathematics',
        code: 'MA201',
        description: 'Linear Algebra, Calculus, Differential Equations & Probability',
        course: 'B.Tech / B.E',
        semester: 'Semester 3',
        icon: 'Calculator',
        color: '#7C3AED',
        totalTopics: 16,
        completedTopics: 12,
      },
      {
        _id: 'sub_4',
        name: 'Database Management Systems',
        code: 'CS402',
        description: 'Relational Model, SQL, Normalization, Transactions & NoSQL',
        course: 'B.Tech / B.E',
        semester: 'Semester 4',
        icon: 'Database',
        color: '#059669',
        totalTopics: 12,
        completedTopics: 8,
      },
      {
        _id: 'sub_5',
        name: 'Data Structures & Algorithms',
        code: 'CS202',
        description: 'Arrays, Trees, Graphs, Sorting, Dynamic Programming & Graph Theory',
        course: 'B.Tech / B.E',
        semester: 'Semester 3',
        icon: 'Binary',
        color: '#EA580C',
        totalTopics: 18,
        completedTopics: 14,
      },
      {
        _id: 'sub_6',
        name: 'Professional English & Communication',
        code: 'HS101',
        description: 'Academic Writing, Technical Presentations, Vocabulary & Soft Skills',
        course: 'All Courses',
        semester: 'Semester 1',
        icon: 'BookOpen',
        color: '#DB2777',
        totalTopics: 10,
        completedTopics: 9,
      },
    ];

    initialSubjects.forEach((s) => this.subjects.set(s._id, s));

    // Seed Study Materials
    const initialMaterials: Material[] = [
      {
        _id: 'mat_1',
        title: 'Java OOPs & Polymorphism Comprehensive Guide',
        subject: 'Java Programming',
        topic: 'Polymorphism & Abstraction',
        type: 'Notes',
        durationOrPages: '18 Pages',
        tags: ['OOP', 'Inheritance', 'Method Overriding', 'Interfaces'],
        description: 'Step-by-step illustrated notes covering method overloading vs overriding, dynamic method dispatch, and abstract classes with code snippets.',
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      },
      {
        _id: 'mat_2',
        title: 'Complete SQL & Normalization Cheat Sheet',
        subject: 'Database Management Systems',
        topic: '1NF, 2NF, 3NF & BCNF Normalization',
        type: 'PDF',
        durationOrPages: '12 Pages PDF',
        tags: ['SQL', 'ACID', 'Normalization', 'Joins'],
        description: 'Concise visual guide explaining database anomaly elimination, functional dependencies, and lossless joins with realistic table examples.',
        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      },
      {
        _id: 'mat_3',
        title: 'Dynamic Programming Patterns in Python',
        subject: 'Data Structures & Algorithms',
        topic: 'Memoization & Tabulation Patterns',
        type: 'Video',
        durationOrPages: '42 mins Video',
        tags: ['DP', 'Knapsack', 'LCS', 'Optimization'],
        description: 'Interactive video walkthrough analyzing the top 5 dynamic programming patterns with visual recursion trees and time complexity analysis.',
        createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      },
      {
        _id: 'mat_4',
        title: 'Engineering Mathematics Solved PYQ 2021-2025',
        subject: 'Engineering Mathematics',
        topic: 'Eigenvalues & Differential Equations',
        type: 'PYQ',
        durationOrPages: '35 Pages Solved',
        tags: ['Previous Year', 'Exam Ready', 'Formulas'],
        description: 'Solved university question papers with mark distributions, standard solutions, and key calculation shortcuts for upcoming exams.',
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      },
      {
        _id: 'mat_5',
        title: 'Python NumPy & Pandas Quick Reference Handbook',
        subject: 'Python for Data Science',
        topic: 'Vectorized Arrays & DataFrame Operations',
        type: 'Reference',
        durationOrPages: '24 Pages Handbook',
        tags: ['NumPy', 'Pandas', 'Data Science', 'Reference'],
        description: 'High-yield reference manual covering indexing, reshaping, filtering, groupby, and merge operations used in modern data workflows.',
        createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      },
      {
        _id: 'mat_6',
        title: 'Technical Report Writing & Vocabulary Blueprint',
        subject: 'Professional English & Communication',
        topic: 'Formal Communication & Presentations',
        type: 'Notes',
        durationOrPages: '14 Pages',
        tags: ['Grammar', 'Reports', 'Presentations'],
        description: 'Essential vocabulary, structure guidelines, and common grammatical mistakes to avoid in academic research papers and engineering reports.',
        createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      },
    ];

    initialMaterials.forEach((m) => this.materials.set(m._id, m));

    // Seed Quizzes
    const initialQuizzes: Quiz[] = [
      {
        _id: 'quiz_1',
        title: 'Java Polymorphism & OOP Concepts Mastery',
        subject: 'Java Programming',
        topic: 'Polymorphism & Interfaces',
        difficulty: 'Medium',
        durationMinutes: 10,
        questions: [
          {
            id: 'q1_1',
            question: 'Which of the following is an example of compile-time polymorphism in Java?',
            options: ['Method overriding', 'Method overloading', 'Dynamic method dispatch', 'Interface implementation'],
            correctIndex: 1,
            explanation: 'Method overloading is resolved at compile time because the compiler knows which method signature to invoke based on argument types.',
          },
          {
            id: 'q1_2',
            question: 'What happens if a subclass overrides a method and changes its access modifier from public to protected?',
            options: ['Code compiles normally', 'Compilation error occurs', 'Runtime exception is thrown', 'Method becomes static'],
            correctIndex: 1,
            explanation: 'In Java, an overriding method cannot assign weaker access privileges than the overridden method in the superclass.',
          },
          {
            id: 'q1_3',
            question: 'Can you achieve runtime polymorphism using private methods in Java?',
            options: ['Yes, always', 'No, private methods cannot be overridden', 'Only within the same package', 'Only if the class is abstract'],
            correctIndex: 1,
            explanation: 'Private methods are bound during compile time using static binding because they are not inherited by subclasses.',
          },
          {
            id: 'q1_4',
            question: 'Which keyword prevents a class from being inherited in Java?',
            options: ['abstract', 'static', 'final', 'const'],
            correctIndex: 2,
            explanation: 'The final keyword when applied to a class declaration prevents any class from subclassing or extending it.',
          },
          {
            id: 'q1_5',
            question: 'What is Dynamic Method Dispatch in Java?',
            options: [
              'Mechanism by which a call to an overridden method is resolved at runtime',
              'Mechanism to call overloaded static methods',
              'Process of loading classes dynamically via reflection',
              'Compilation technique for optimizing loops',
            ],
            correctIndex: 0,
            explanation: 'Dynamic method dispatch is the mechanism by which a call to an overridden method is resolved at runtime rather than compile time.',
          },
        ],
      },
      {
        _id: 'quiz_2',
        title: 'DBMS Normalization & Relational Transactions',
        subject: 'Database Management Systems',
        topic: 'Normalization (1NF-BCNF) & ACID Properties',
        difficulty: 'Medium',
        durationMinutes: 12,
        questions: [
          {
            id: 'q2_1',
            question: 'A relation is said to be in 2NF if it is in 1NF and:',
            options: [
              'Every non-prime attribute is fully functionally dependent on the primary key',
              'There are no transitive dependencies',
              'Every determinant is a candidate key',
              'All attributes are numeric',
            ],
            correctIndex: 0,
            explanation: 'Second Normal Form (2NF) requires that no non-prime attribute has a partial dependency on any candidate key.',
          },
          {
            id: 'q2_2',
            question: 'Which ACID property ensures that either all operations of a transaction take effect or none do?',
            options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
            correctIndex: 0,
            explanation: 'Atomicity treats all operations within a database transaction as a single indivisible atomic unit (All-or-Nothing).',
          },
          {
            id: 'q2_3',
            question: 'Boyce-Codd Normal Form (BCNF) is strictly stronger than which normal form?',
            options: ['1NF only', '2NF only', '3NF', '4NF'],
            correctIndex: 2,
            explanation: 'BCNF is a stricter version of 3NF where for every functional dependency X -> Y, X must be a super key.',
          },
          {
            id: 'q2_4',
            question: 'Which SQL statement undoes all changes made during the current transaction?',
            options: ['COMMIT', 'ROLLBACK', 'SAVEPOINT', 'REVOKE'],
            correctIndex: 1,
            explanation: 'ROLLBACK restores the database state to the beginning of the transaction or to a designated SAVEPOINT.',
          },
        ],
      },
      {
        _id: 'quiz_3',
        title: 'Python Data Science Fundamentals',
        subject: 'Python for Data Science',
        topic: 'NumPy Arrays & Pandas DataFrames',
        difficulty: 'Easy',
        durationMinutes: 8,
        questions: [
          {
            id: 'q3_1',
            question: 'What is the primary advantage of NumPy arrays over Python built-in lists?',
            options: [
              'Contiguous memory allocation and vectorized SIMD performance',
              'Support for arbitrary mixed types without memory overhead',
              'Automatic database persistence',
              'Built-in web server support',
            ],
            correctIndex: 0,
            explanation: 'NumPy arrays store homogeneous items in contiguous memory blocks, enabling ultra-fast C-speed vectorized mathematical computations.',
          },
          {
            id: 'q3_2',
            question: 'In Pandas, which method is used to inspect summary statistics of numerical columns?',
            options: ['df.info()', 'df.describe()', 'df.head()', 'df.shape()'],
            correctIndex: 1,
            explanation: 'df.describe() generates descriptive statistics that summarize the central tendency, dispersion and shape of a dataset distribution.',
          },
          {
            id: 'q3_3',
            question: 'Which function handles missing values by filling them with a specific value in Pandas?',
            options: ['df.dropna()', 'df.fillna()', 'df.replace_null()', 'df.impute()'],
            correctIndex: 1,
            explanation: 'df.fillna(value) replaces NaN and missing values across columns or rows with the provided scalar or series value.',
          },
        ],
      },
    ];

    initialQuizzes.forEach((q) => this.quizzes.set(q._id, q));

    // Seed Demo User
    const demoSalt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('student123', demoSalt);
    const demoUserId = 'user_demo_101';

    const demoUser: User = {
      _id: demoUserId,
      name: 'Adithya Kumar',
      email: 'student@edugenie.ai',
      passwordHash: demoPasswordHash,
      educationLevel: 'College / University',
      course: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science',
      semester: 'Semester 4',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      xp: 1250,
      level: 4,
      streak: 7,
      lastActiveDate: new Date().toISOString().split('T')[0],
      selectedSubjects: ['Java Programming', 'Python for Data Science', 'Engineering Mathematics', 'Database Management Systems', 'Data Structures & Algorithms', 'Professional English & Communication'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    };

    this.users.set(demoUserId, demoUser);

    // Give demo user earned badges
    const userBadgesSet = new Set<string>();
    userBadgesSet.add('first_quiz');
    userBadgesSet.add('streak_7');
    userBadgesSet.add('note_crafter');
    userBadgesSet.add('curious_mind');
    this.userBadges.set(demoUserId, userBadgesSet);

    // Seed Study Plans for Demo User
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const initialPlans: StudyPlan[] = [
      {
        _id: 'plan_1',
        userId: demoUserId,
        subject: 'Java Programming',
        topic: 'Polymorphism & Abstract Class Hierarchy',
        date: today,
        time: '16:00',
        duration: 45,
        priority: 'High',
        completed: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'plan_2',
        userId: demoUserId,
        subject: 'Database Management Systems',
        topic: 'BCNF Decompositions & Transaction Schedules',
        date: today,
        time: '18:30',
        duration: 60,
        priority: 'High',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'plan_3',
        userId: demoUserId,
        subject: 'Engineering Mathematics',
        topic: 'Eigenvectors & Cayley-Hamilton Theorem',
        date: tomorrow,
        time: '10:00',
        duration: 60,
        priority: 'Medium',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'plan_4',
        userId: demoUserId,
        subject: 'Python for Data Science',
        topic: 'Pandas Vectorized Feature Engineering',
        date: tomorrow,
        time: '15:00',
        duration: 30,
        priority: 'Low',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    initialPlans.forEach((p) => this.studyPlans.set(p._id, p));

    // Seed Notes for Demo User
    const initialNotes: Note[] = [
      {
        _id: 'note_1',
        userId: demoUserId,
        title: 'Java Polymorphism & Method Dispatch',
        subject: 'Java Programming',
        topic: 'Compile-time vs Runtime Polymorphism',
        lengthType: 'Detailed',
        content: {
          summary: 'Polymorphism in Java allows one interface with multiple implementations. It is split into Compile-time (Overloading) and Runtime (Overriding with Dynamic Method Dispatch).',
          definitions: [
            'Polymorphism: The ability of a message or method call to be processed in more than one form.',
            'Dynamic Method Dispatch: The mechanism where an overridden method call is resolved dynamically at runtime rather than compile-time.',
            'Upcasting: Treating an instance of a subclass as an instance of its parent superclass.',
          ],
          detailedNotes: 'Method Overriding requires identical method name, return type (or covariant return type), and exact parameter signature. The @Override annotation informs the compiler to verify this contract. Subclass methods cannot restrict access privileges (e.g. public cannot become protected). Private, static, and final methods cannot be overridden because static binding applies during compilation.',
          importantPoints: [
            'Overloading happens in the same class (or inheritance tree) with different signatures.',
            'Overriding happens across superclass and subclass with identical signatures.',
            'Constructors cannot be overridden, but can be overloaded.',
            'Reference type determines what can be accessed; object type determines which overridden method executes.',
          ],
          practicalExamples: [
            'class Animal { void makeSound() { System.out.println("Animal sound"); } }\nclass Dog extends Animal { void makeSound() { System.out.println("Bark"); } }\nAnimal a = new Dog(); a.makeSound(); // Prints "Bark"',
          ],
          examReadyAnswer: 'Q: Explain Dynamic Method Dispatch with an example.\nAnswer: Dynamic Method Dispatch is runtime polymorphism wherein a call to an overridden method is resolved at runtime based on the actual object instance rather than the reference type. In Animal a = new Dog(); a.makeSound(), the compiler checks Animal class for makeSound(), but JVM executes Dog\'s version at runtime. Key advantages include extensibility, clean abstraction, and adherence to the Open-Closed Principle.',
        },
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      },
      {
        _id: 'note_2',
        userId: demoUserId,
        title: 'ACID Properties in Relational Databases',
        subject: 'Database Management Systems',
        topic: 'Transaction Management & Concurrency',
        lengthType: 'Exam Ready',
        content: {
          summary: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. These properties ensure database transactions are processed reliably in multi-user concurrent systems.',
          definitions: [
            'Transaction: A single logical unit of work that accesses and possibly modifies the contents of a database.',
            'Atomicity: All-or-nothing execution of statements within a transaction block.',
            'Isolation: Guarantee that concurrently executing transactions do not interfere with each other.',
          ],
          detailedNotes: 'The Recovery Manager guarantees Atomicity using write-ahead logs (WAL). Consistency is maintained by database constraints (Foreign keys, check constraints). Isolation is enforced by the Concurrency Control manager using protocols such as Two-Phase Locking (2PL) and multi-version concurrency control (MVCC). Durability ensures committed updates persist across power failures using non-volatile storage.',
          importantPoints: [
            'Atomicity prevents partial state updates during failures.',
            'Consistency preserves system integrity invariants before and after commit.',
            'Isolation levels range from Read Uncommitted to Serializable.',
            'Durability relies on checkpoints and redo/undo logs.',
          ],
          practicalExamples: [
            'Bank Fund Transfer: Deducting $100 from Account A and crediting $100 to Account B must be atomic. If server crashes after debit, rollback restores Account A.',
          ],
          examReadyAnswer: 'Q: What are ACID properties? Explain with an example.\nAnswer: ACID properties govern transactional reliability in DBMS. 1) Atomicity: Entire transaction completes or aborts cleanly. 2) Consistency: Transitions database from one valid state to another. 3) Isolation: Interleaved transactions yield the same result as serial execution. 4) Durability: Once committed, updates are permanently preserved.',
        },
        createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      },
    ];

    initialNotes.forEach((n) => this.notes.set(n._id, n));

    // Seed Quiz Result for Demo User
    const initialResult: QuizResult = {
      _id: 'res_1',
      userId: demoUserId,
      quizId: 'quiz_1',
      quizTitle: 'Java Polymorphism & OOP Concepts Mastery',
      subject: 'Java Programming',
      totalQuestions: 5,
      correctAnswers: 4,
      wrongAnswers: 1,
      score: 4,
      percentage: 80,
      xpEarned: 80,
      recommendedTopics: ['Dynamic Method Dispatch in Abstract Classes', 'Covariant Return Types'],
      completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    };

    this.quizResults.set(initialResult._id, initialResult);

    // Seed Notifications for Demo User
    const initialNotifs: NotificationItem[] = [
      {
        _id: 'notif_1',
        userId: demoUserId,
        title: '🔥 7 Day Streak Unlocked!',
        message: 'Incredible dedication! You have maintained your daily learning streak for 7 consecutive days.',
        type: 'achievement',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        link: '/profile',
      },
      {
        _id: 'notif_2',
        userId: demoUserId,
        title: '⏰ Upcoming Study Session',
        message: 'Database Management Systems: BCNF Decompositions scheduled today at 18:30.',
        type: 'reminder',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        link: '/planner',
      },
      {
        _id: 'notif_3',
        userId: demoUserId,
        title: '📚 New Study Material Added',
        message: 'Check out the new solved Engineering Mathematics PYQ 2021-2025 in Materials.',
        type: 'material',
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        link: '/materials',
      },
    ];

    initialNotifs.forEach((n) => this.notifications.set(n._id, n));

    // Seed Study Logs (for weekly activity charts)
    const logs: { date: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - 86400000 * i).toISOString().split('T')[0];
      const mins = [45, 60, 90, 75, 120, 50, 85][6 - i];
      logs.push({ date: d, minutes: mins });
    }
    this.userStudyLogs.set(demoUserId, logs);

    // Seed initial Genie AI Chat History
    const demoMessages: ChatMessage[] = [
      {
        id: 'msg_1',
        sender: 'assistant',
        text: 'Hello Adithya! 🧞 I am **Genie AI**, your personalized learning companion. How can I help you today? You can ask me to explain concepts, generate exam answers, solve programming doubts, or create high-yield study notes!',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
      {
        id: 'msg_2',
        sender: 'user',
        text: 'Can you explain the difference between method overloading and overriding in simple terms?',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'msg_3',
        sender: 'assistant',
        text: `### 🎯 Quick Difference: Overloading vs Overriding

Here is a super simple way to remember it:

1. **Method Overloading (Compile-Time Polymorphism)**
   - **Where**: Happens in the *same class*.
   - **What**: Same method name, but **different arguments** (different number, types, or order).
   - **Real Life**: A printer button: press once to print black & white; hold to print color. Same button name, different inputs!
   - **Binding**: Handled during compile time.

2. **Method Overriding (Runtime Polymorphism)**
   - **Where**: Happens across *subclass and superclass* (inheritance).
   - **What**: Exactly the **same method signature** and return type, but the child class provides its own specific implementation.
   - **Real Life**: An \`Animal\` makes sound. A \`Dog\` overrides it to \`"Bark!"\` while a \`Cat\` overrides it to \`"Meow!"\`.
   - **Binding**: Handled dynamically at runtime!`,
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        mode: 'Explain simply',
      },
    ];
    this.userChatHistory.set(demoUserId, demoMessages);
  }
}

export const db = new EduGenieDatabase();
