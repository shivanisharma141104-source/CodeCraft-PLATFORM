/**
 * Shared Type Definitions for the Coding E-learning Platform
 */

export enum UserRole {
  STUDENT = "student",
  INSTRUCTOR = "instructor",
  ADMIN = "admin"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approved: boolean; // Instructors need admin approval
  avatar?: string;
  createdAt: string;
  blocked?: boolean; // Student blocked by instructor
  institutionId?: string;
  isAcademicAffiliated?: boolean;
  institutionName?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string; // e.g., "12 hours"
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  thumbnail: string;
  instructorId: string;
  authorName: string;
  createdAt: string;
  isAcademicInstructor?: boolean;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
}

export interface VideoLesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  videoUrl: string; // YouTube URL
  youtubeId: string; // Extracted YouTube ID
  orderIndex: number;
  duration: string;
  notesUrl?: string; // PDF/PPT/DOC download link
  notesName?: string;
  sourceCodeUrl?: string; // ZIP/text file
  sourceCode?: string; // Real code content for practice editor
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  quizId?: string;
  negativeMarking?: boolean;
  negativeMarkValue?: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number; // 0 to 3 or corresponding selection
  explanation: string;
  type?: string; // e.g. "mcq", "tf", "fitb", "coding"
  correctAnswerText?: string; // used for fill in the blanks
  startingCode?: string; // used for code sandbox questions
  solutionCode?: string; // used for verification in sandbox
  language?: string; // language used in code runner
  testCases?: { input: string; expectedOutput: string }[];
}

export interface StudyNote {
  id: string;
  title: string;
  category: string;
  content: string; // Markdown formatted syntax / content
  fileUrl?: string;
  fileType?: "pdf" | "ppt" | "doc" | "code";
  fileName?: string;
  downloadsCount: number;
}

export interface QuestionPaper {
  id: string;
  title: string;
  category: string;
  year: number;
  examType: "Previous Year" | "Model Paper" | "MCQ Bank";
  fileUrl: string;
  content: string; // Summary / explanations
  answerKeys: { [key: string]: string }; // Q1 => A, etc
}

export interface ProgressTracking {
  id: string;
  userId: string;
  courseId: string;
  completedLessonIds: string[]; // List of finished lessonIds
  quizAttempts: { [quizId: string]: { score: number; total: number; date: string } };
  lastWatchedLessonId?: string;
  watchPositions?: { [lessonId: string]: number };
  updatedAt: string;
}

export interface Comment {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface CodingExercise {
  id: string;
  title: string;
  description: string;
  category: string;
  startingCode: string;
  solutionCode: string;
  language: string; // e.g., "javascript" or "python"
  testCases: { input: string; expectedOutput: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  problem: string;
  category: string;
  startingCode: string;
  solutionCode: string;
  testCases: { input: string; expectedOutput: string }[];
  date: string; // YYYY-MM-DD
}

export interface RegisteredInstitution {
  id: string;
  name: string;
  type: "school" | "college" | "university" | "bootcamp" | "studyclub" | "other";
  category: "academic" | "non-academic";
  location: string;
  website: string;
  contactEmail: string;
  contactPhone?: string;
  enrollmentSize?: number;
  description: string;
  registeredByUserId?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}
