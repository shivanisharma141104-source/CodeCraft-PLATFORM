import React, { useState, useEffect } from "react";
import { 
  Plus, Upload, Trash2, Edit2, PlayCircle, FileText, 
  BookOpen, HelpCircle, User, Check, Sparkles, AlertCircle, Database, UserX,
  Search, BarChart2, Award
} from "lucide-react";
import { UserRole, Course } from "../types.js";

interface InstructorDashboardProps {
  token: string | null;
  onRefreshCourses: () => void;
  onAddNotification: (title: string, message: string) => void;
}

export default function InstructorDashboard({
  token,
  onRefreshCourses,
  onAddNotification
}: InstructorDashboardProps) {
  const [stats, setStats] = useState<any>({
    coursesCount: 0,
    studentsCount: 0,
    quizSubmissions: 0,
    recentCourses: []
  });

  const [view, setView] = useState<"list" | "add-course">("list");
  
  // New Course Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Python");
  const [duration, setDuration] = useState("5 hours");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [thumbnail, setThumbnail] = useState("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Module lesson attachment states
  const [courseIdForModules, setCourseIdForModules] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState("");
  const [lessonNotesName, setLessonNotesName] = useState("");
  const [lessonSourceCode, setLessonSourceCode] = useState("");
  const [activeCourseModules, setActiveCourseModules] = useState<any[]>([]);

  // New Quiz States
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDurationMinutes, setQuizDurationMinutes] = useState(10);
  const [quizNegativeMarking, setQuizNegativeMarking] = useState(false);
  const [quizNegativeMarkValue, setQuizNegativeMarkValue] = useState(0.25);
  const [quizQuestionsList, setQuizQuestionsList] = useState<any[]>([]);
  // Individual Question Editor States
  const [tempQuestionType, setTempQuestionType] = useState<"mcq" | "coding" | "tf" | "fitb">("mcq");
  const [tempQuestionText, setTempQuestionText] = useState("");
  const [tempOptions, setTempOptions] = useState<string[]>(["", "", "", ""]);
  const [tempCorrectAnswerIndex, setTempCorrectAnswerIndex] = useState<number>(0);
  const [tempCorrectAnswerText, setTempCorrectAnswerText] = useState("");
  const [tempExplanation, setTempExplanation] = useState("");
  
  // Coding Specific inputs
  const [tempStartingCode, setTempStartingCode] = useState("");
  const [tempSolutionCode, setTempSolutionCode] = useState("");
  const [tempLanguage, setTempLanguage] = useState("javascript");
  const [tempTestInput, setTempTestInput] = useState("");
  const [tempTestExpected, setTempTestExpected] = useState("");
  const [tempTestCases, setTempTestCases] = useState<{ input: string; expectedOutput: string }[]>([]);

  // Upload Notes Form States
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("Python");
  const [noteContent, setNoteContent] = useState("");
  const [noteFileName, setNoteFileName] = useState("");
  const [generalNotesList, setGeneralNotesList] = useState<any[]>([]);

  // Upload Papers Form States
  const [paperTitle, setPaperTitle] = useState("");
  const [paperCategory, setPaperCategory] = useState("Python");
  const [paperYear, setPaperYear] = useState(2026);
  const [paperType, setPaperType] = useState("Model Paper");
  const [paperContent, setPaperContent] = useState("");
  const [generalPapersList, setGeneralPapersList] = useState<any[]>([]);

  // Tab & analytics search states
  const [activeTab, setActiveTab] = useState<"courses" | "analytics" | "quizzes" | "moderation" | "upload-notes" | "upload-papers">("courses");
  const [analyticsSearch, setAnalyticsSearch] = useState("");
  const [quizzesSearch, setQuizzesSearch] = useState("");

  // Student moderation list states
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const fetchStudents = async () => {
    if (!token) return;
    setLoadingStudents(true);
    try {
      const res = await fetch("/api/instructor/students", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Failed to load students roster", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleToggleBlockStudent = async (studentId: string, currentlyBlocked: boolean) => {
    const actionWord = currentlyBlocked ? "Unblock" : "Block";
    if (!window.confirm(`Warning: Are you sure you want to ${actionWord.toLowerCase()} this student registration?`)) return;

    try {
      const res = await fetch("/api/instructor/toggle-block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, blocked: !currentlyBlocked })
      });
      const data = await res.json();
      if (res.ok) {
        onAddNotification(
          currentlyBlocked ? "Access Restored" : "Student Blocked",
          data.message || `Student state set successfully.`
        );
        fetchStudents();
      } else {
        alert(data.error || "Failed to update student state");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshNotesAndPapers = () => {
    fetch("/api/notes")
      .then(res => res.json())
      .then(data => {
        if (data.notes) setGeneralNotesList(data.notes);
      })
      .catch(err => console.error(err));

    fetch("/api/papers")
      .then(res => res.json())
      .then(data => {
        if (data.papers) setGeneralPapersList(data.papers);
      })
      .catch(err => console.error(err));
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/courses/${courseIdForModules}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category, duration, difficulty, thumbnail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to edit course.");

      onAddNotification("Course Updated", `Course metadata for "${title}" saved successfully.`);
      onRefreshCourses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetch("/api/instructor/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setStats(data);
        })
        .catch(err => console.error("Stats fetching failed", err));

      fetchStudents();
      refreshNotesAndPapers();
    }
  }, [token, view]);

  const loadModulesForCourse = (cId: string) => {
    fetch(`/api/courses/${cId}`)
      .then(res => res.json())
      .then(data => {
        if (data.modules) {
          setActiveCourseModules(data.modules);
          if (data.modules.length > 0) {
            setSelectedModuleForLesson(data.modules[0].id);
          }
        }
      });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category, duration, difficulty, thumbnail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course module.");

      onAddNotification("Course Created", `Course "${title}" added successfully to the catalog.`);
      setCourseIdForModules(data.course.id);
      loadModulesForCourse(data.course.id);
      onRefreshCourses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateModule = async () => {
    if (!moduleTitle.trim() || !courseIdForModules) return;
    try {
      const res = await fetch(`/api/courses/${courseIdForModules}/modules`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: moduleTitle })
      });
      const data = await res.json();
      if (res.ok) {
        onAddNotification("Module Created", `Module section "${moduleTitle}" added.`);
        setModuleTitle("");
        loadModulesForCourse(courseIdForModules);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLesson = async () => {
    if (!lessonTitle.trim() || !lessonYoutubeUrl.trim() || !selectedModuleForLesson) return;
    try {
      const res = await fetch(`/api/modules/${selectedModuleForLesson}/lessons`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: lessonTitle, 
          videoUrl: lessonYoutubeUrl,
          notesName: lessonNotesName || undefined,
          sourceCode: lessonSourceCode || undefined
        })
      });
      if (res.ok) {
        onAddNotification("Lesson Added", `YouTube lesson "${lessonTitle}" associated to syllabus module.`);
        setLessonTitle("");
        setLessonYoutubeUrl("");
        setLessonNotesName("");
        setLessonSourceCode("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCourse = async (cId: string) => {
    if(!window.confirm("Are you sure you want to delete this course from catalog?")) return;
    try {
      const res = await fetch(`/api/courses/${cId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        onAddNotification("Course Deleted", "Course module purged successfully.");
        onRefreshCourses();
        // Reload stats
        const rStats = await fetch("/api/instructor/stats", { headers: { "Authorization": `Bearer ${token}` } });
        const dStats = await rStats.json();
        setStats(dStats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddQuizQuestion = () => {
    if (!tempQuestionText.trim()) {
      alert("Please write the question text.");
      return;
    }

    let optionsToSave: string[] = [];
    let correctIdx = tempCorrectAnswerIndex;
    let correctText = tempCorrectAnswerText.trim();

    if (tempQuestionType === "mcq") {
      if (tempOptions.some(o => !o.trim())) {
        alert("Please fill in all 4 MCQ options.");
        return;
      }
      optionsToSave = [...tempOptions];
    } else if (tempQuestionType === "tf") {
      optionsToSave = ["True", "False"];
      if (correctIdx !== 0 && correctIdx !== 1) {
        correctIdx = 0;
      }
    } else if (tempQuestionType === "fitb") {
      if (!correctText) {
        alert("Please write the correct blank answer string.");
        return;
      }
    } else if (tempQuestionType === "coding") {
      if (tempTestCases.length === 0) {
        alert("Please add at least one test case for your coding evaluation question.");
        return;
      }
    }

    const newQ = {
      type: tempQuestionType,
      questionText: tempQuestionText,
      options: optionsToSave,
      correctAnswerIndex: correctIdx,
      correctAnswerText: correctText,
      explanation: tempExplanation,
      startingCode: tempStartingCode,
      solutionCode: tempSolutionCode,
      language: tempLanguage,
      testCases: tempTestCases
    };

    setQuizQuestionsList(prev => [...prev, newQ]);

    // Clear question builder specific fields
    setTempQuestionText("");
    setTempOptions(["", "", "", ""]);
    setTempCorrectAnswerIndex(0);
    setTempCorrectAnswerText("");
    setTempExplanation("");
    setTempStartingCode("");
    setTempSolutionCode("");
    setTempTestCases([]);
    setTempTestInput("");
    setTempTestExpected("");
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || !courseIdForModules) return;
    if (quizQuestionsList.length === 0) {
      alert("Please add at least one question to the quiz before publishing.");
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseIdForModules}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          durationMinutes: quizDurationMinutes,
          negativeMarking: quizNegativeMarking,
          negativeMarkValue: quizNegativeMarkValue,
          questions: quizQuestionsList
        })
      });
      const data = await res.json();
      if (res.ok) {
        onAddNotification("Quiz Created", `Syllabus evaluation "${quizTitle}" was published!`);
        setQuizTitle("");
        setQuizDurationMinutes(10);
        setQuizNegativeMarking(false);
        setQuizNegativeMarkValue(0.25);
        setQuizQuestionsList([]);
        // Reload modules/lessons/quizzes list
        loadModulesForCourse(courseIdForModules);
      } else {
        alert(data.error || "Failed to publish quiz");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateStudyNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: noteTitle,
          category: noteCategory,
          content: noteContent,
          fileName: noteFileName || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        onAddNotification("Study Note Published", `Handout reference card "${noteTitle}" added to Study Room.`);
        setNoteTitle("");
        setNoteContent("");
        setNoteFileName("");
        refreshNotesAndPapers();
      } else {
        alert(data.error || "Failed to publish note");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateQuestionPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle.trim() || !paperContent.trim()) return;
    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: paperTitle,
          category: paperCategory,
          year: paperYear,
          examType: paperType,
          content: paperContent
        })
      });
      const data = await res.json();
      if (res.ok) {
        onAddNotification("Exam Paper Added", `Question paper series "${paperTitle}" added with answer references.`);
        setPaperTitle("");
        setPaperContent("");
        setPaperYear(2026);
        refreshNotesAndPapers();
      } else {
        alert(data.error || "Failed to publish question paper");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="instructor-dashboard">
      
      {/* Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-extrabold tracking-tight text-slate-900">
            Instructor Console & Curriculum Editor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage course paths, publish syllabus segments, add quiz tasks, and audit performance metrics.
          </p>
        </div>

        <div>
          {view === "list" ? (
            <button
              onClick={() => {
                setView("add-course");
                setCourseIdForModules(null);
                setTitle("");
                setDescription("");
                setModuleTitle("");
                setLessonTitle("");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-100 transition"
              id="add-new-course-btn"
            >
              <Plus className="h-4.5 w-4.5" />
              Upload Course Module
            </button>
          ) : (
            <button
              onClick={() => setView("list")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              Back to Catalog list
            </button>
          )}
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-8" id="instructor-panel-summary">
          
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Courses</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.coursesCount}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.studentsCount}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Grades Logged</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.quizSubmissions}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total CodeCraft Users</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.platformUsersCount || 4}</p>
            </div>

          </div>

          {/* Navigation Tab Bar */}
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex flex-wrap gap-x-6">
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === "courses"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Course Catalog ({stats.recentCourses?.length || 0})
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === "analytics"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                Student Analytics ({stats.studentAnalytics?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("quizzes")}
                className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === "quizzes"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Award className="h-4 w-4" />
                Quiz Performance ({stats.quizzesPerformance?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("moderation")}
                className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === "moderation"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <UserX className="h-4 w-4" />
                Student Moderation & Blocklist
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("upload-notes");
                  refreshNotesAndPapers();
                }}
                className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === "upload-notes"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                Upload Study Handouts ({generalNotesList.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("upload-papers");
                  refreshNotesAndPapers();
                }}
                className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === "upload-papers"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Award className="h-4 w-4" />
                Upload Exam Papers ({generalPapersList.length})
              </button>
            </nav>
          </div>

          {/* Active Tab Panel Content */}
          {activeTab === "courses" && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
                    My Published Curriculum Course Catalog
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Maintain syllabus content, add chapters/modules, and manage course settings.</p>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-150 bg-white overflow-hidden shadow-xs" id="instructor-courses-table">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 font-extrabold text-slate-500">
                      <th className="p-3.5">Course Path</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Difficulty</th>
                      <th className="p-3.5">Credit Hours</th>
                      <th className="p-3.5 text-right">Inventory Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stats.recentCourses && stats.recentCourses.map((c: Course) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 text-slate-900 font-bold">{c.title}</td>
                        <td className="p-3.5 text-slate-500 font-semibold">{c.category}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
                            {c.difficulty}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-450">{c.duration}</td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setCourseIdForModules(c.id);
                              setTitle(c.title);
                              setDescription(c.description);
                              setCategory(c.category);
                              setDuration(c.duration);
                              setDifficulty(c.difficulty);
                              setThumbnail(c.thumbnail);
                              loadModulesForCourse(c.id);
                              setView("add-course");
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer transition"
                            title="Edit details, chapters & quizzes"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(c.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-150 text-red-650 hover:bg-rose-50 cursor-pointer transition"
                            title="Delete Course Module"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {(!stats.recentCourses || stats.recentCourses.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">No courses created yet under your faculty credentials.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BarChart2 className="h-4.5 w-4.5 text-teal-650" />
                    Direct Course Enrollment & Progress Analytics
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Audit student learning, video completions inside courses, and study timestamps.</p>
                </div>
                
                {/* Search */}
                <div className="max-w-xs w-full flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white px-2.5 py-1.5 shadow-2xs focus-within:border-indigo-500">
                  <Search className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by student or course..."
                    value={analyticsSearch}
                    onChange={(e) => setAnalyticsSearch(e.target.value)}
                    className="w-full text-xs text-slate-900 border-0 bg-transparent p-0 focus:outline-hidden focus:ring-0"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-150 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 font-extrabold text-slate-500">
                      <th className="p-3.5">Enrolled Student</th>
                      <th className="p-3.5">Course Path</th>
                      <th className="p-3.5">Videos Finished</th>
                      <th className="p-3.5">Syllabus Completion %</th>
                      <th className="p-3.5">Last Active Study</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stats.studentAnalytics && stats.studentAnalytics
                      .filter((item: any) => {
                        const search = analyticsSearch.toLowerCase();
                        return (
                          item.studentName.toLowerCase().includes(search) ||
                          item.studentEmail.toLowerCase().includes(search) ||
                          item.courseTitle.toLowerCase().includes(search)
                        );
                      })
                      .map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{item.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.studentEmail}</div>
                          </td>
                          <td className="p-3.5 text-slate-700 font-semibold">{item.courseTitle}</td>
                          <td className="p-3.5 text-slate-500 font-mono">
                            {item.lessonsCompleted} / {item.totalLessons} videos
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${item.progressPercentage}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-slate-800 text-[10px]">
                                {item.progressPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-450 font-mono text-[10px]">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "Recently active"}
                          </td>
                        </tr>
                      ))}

                    {(!stats.studentAnalytics || stats.studentAnalytics.filter((i: any) => {
                      const search = analyticsSearch.toLowerCase();
                      return i.studentName.toLowerCase().includes(search) || i.courseTitle.toLowerCase().includes(search);
                    }).length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">No student enrollments registered yet matching standard filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-amber-600" />
                    Quiz Performance & Grade Sheets
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Evaluate score results and success percentages of student answer completions.</p>
                </div>

                {/* Search */}
                <div className="max-w-xs w-full flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white px-2.5 py-1.5 shadow-2xs focus-within:border-indigo-500">
                  <Search className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by student or course..."
                    value={quizzesSearch}
                    onChange={(e) => setQuizzesSearch(e.target.value)}
                    className="w-full text-xs text-slate-900 border-0 bg-transparent p-0 focus:outline-hidden focus:ring-0"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-150 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 font-extrabold text-slate-500">
                      <th className="p-3.5">Student identity</th>
                      <th className="p-3.5">Course Segment</th>
                      <th className="p-3.5">Quiz Code</th>
                      <th className="p-3.5">Score Achieved</th>
                      <th className="p-3.5">Academic Status</th>
                      <th className="p-3.5">Attempt Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stats.quizzesPerformance && stats.quizzesPerformance
                      .filter((item: any) => {
                        const search = quizzesSearch.toLowerCase();
                        return (
                          item.studentName.toLowerCase().includes(search) ||
                          item.studentEmail.toLowerCase().includes(search) ||
                          item.courseTitle.toLowerCase().includes(search)
                        );
                      })
                      .map((item: any, idx: number) => {
                        const pct = item.total > 0 ? Math.floor((item.score / item.total) * 100) : 0;
                        const isPassed = pct >= 60;
                        
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900">{item.studentName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.studentEmail}</div>
                            </td>
                            <td className="p-3.5 text-slate-700 font-semibold">{item.courseTitle}</td>
                            <td className="p-3.5 font-mono text-slate-500 uppercase">{item.quizId}</td>
                            <td className="p-3.5 font-mono font-bold text-slate-900">
                              {item.score} / {item.total} <span className="text-[10px] text-indigo-600">({pct}%)</span>
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-flex rounded-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                                isPassed 
                                  ? "bg-emerald-55 text-emerald-800 border border-emerald-100" 
                                  : "bg-rose-55 text-rose-800 border border-rose-100"
                              }`}>
                                {isPassed ? "Syllabus Passed" : "Needs Review"}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-450 font-mono text-[10px]">
                              {item.date ? new Date(item.date).toLocaleDateString() : "Historical Log"}
                            </td>
                          </tr>
                        );
                      })}

                    {(!stats.quizzesPerformance || stats.quizzesPerformance.filter((i: any) => {
                      const search = quizzesSearch.toLowerCase();
                      return i.studentName.toLowerCase().includes(search) || i.courseTitle.toLowerCase().includes(search);
                    }).length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">No quiz logs recorded yet matching specified filter conditions.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "moderation" && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <UserX className="h-4.5 w-4.5 text-rose-500" />
                    Academic Student Roster & Moderation Controls
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Enforce platform regulations and syllabus adherence by restricting or lifting student account locks.</p>
                </div>

                <div className="max-w-xs w-full flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white px-2.5 py-1.5 shadow-2xs focus-within:border-indigo-500">
                  <Search className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full text-xs text-slate-900 border-0 bg-transparent p-0 focus:outline-hidden focus:ring-0"
                  />
                </div>
              </div>

              {loadingStudents ? (
                <div className="py-8 text-center text-slate-400 italic text-xs">Loading active enrollments...</div>
              ) : (
                <div className="rounded-xl border border-slate-150 bg-white overflow-hidden shadow-xs" id="instructor-student-roster-table">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 font-extrabold text-slate-500">
                        <th className="p-3.5">Student identity</th>
                        <th className="p-3.5">Email handle</th>
                        <th className="p-3.5">Enrolled Semester Date</th>
                        <th className="p-3.5">Operational State</th>
                        <th className="p-3.5 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {students
                        .filter(st => {
                          if (!studentSearch) return true;
                          return st.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                 st.email.toLowerCase().includes(studentSearch.toLowerCase());
                        })
                        .map((st) => (
                          <tr 
                            key={st.id} 
                            className={`hover:bg-slate-50/50 transition ${
                              st.blocked ? "bg-rose-50/20 hover:bg-rose-50/35" : ""
                            }`}
                            id={`instructor-student-row-${st.id}`}
                          >
                            <td className="p-3.5 flex items-center gap-2.5">
                              <img 
                                src={st.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${st.id}`}
                                className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100"
                                alt="avatar"
                              />
                              <div>
                                <div className="text-slate-900 font-extrabold flex items-center gap-1.5">
                                  {st.name}
                                  {st.blocked && (
                                    <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[8px] font-bold text-rose-700 font-mono tracking-wide">
                                      SUSPENDED
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-slate-550 font-mono">{st.email}</td>

                            <td className="p-3.5 text-slate-450 font-mono text-[10px]">
                              {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : "Cohort Season"}
                            </td>

                            <td className="p-3.5">
                              {st.blocked ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] text-rose-600 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                                  Blocked from Portal
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                  Active Student
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleToggleBlockStudent(st.id, !!st.blocked)}
                                className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold cursor-pointer transition border ${
                                  st.blocked
                                    ? "bg-emerald-600 text-white border-transparent hover:bg-emerald-500 hover:shadow-md"
                                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                }`}
                              >
                                {st.blocked ? "Unblock Student Account" : "Block Student Access"}
                              </button>
                            </td>

                          </tr>
                        ))}

                      {students.filter(st => {
                        if (!studentSearch) return true;
                        return st.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                               st.email.toLowerCase().includes(studentSearch.toLowerCase());
                      }).length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 italic">No registered student cohorts match filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "upload-notes" && (
            <div className="space-y-6 pt-2" id="instructor-study-notes-tab">
              <div className="border-b border-slate-150 pb-3">
                <h3 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                  Syllabus Study Room Handouts Editor
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create and manage downloadable syntax crib sheets, programming cheatcharts, and study materials that students can access globally in the Study Room.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Form: Create Handout */}
                <div className="lg:col-span-6 rounded-xl border border-slate-150 bg-white p-5 shadow-2xs">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-50">
                    Publish Study Cheat-Sheet
                  </h4>
                  <form onSubmit={handleCreateStudyNote} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Handout Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Python Advanced Multithreading Reference Guide"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Category Domain</label>
                        <select
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden transition"
                        >
                          <option value="Python">Python Core</option>
                          <option value="Java">Java OOP</option>
                          <option value="JavaScript">JavaScript ES6</option>
                          <option value="C++">C++ Standard Library</option>
                          <option value="React.js">React.js Components</option>
                          <option value="Node.js">Node.js Express</option>
                          <option value="Database & SQL">Databases & SQL</option>
                          <option value="Data Structures & Algorithms">Data Structures & Algos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Attachment FileName (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. py-multithread.pdf"
                          value={noteFileName}
                          onChange={(e) => setNoteFileName(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Handout Materials Content (Markdown Supported)</label>
                      <textarea
                        required
                        rows={7}
                        placeholder="Write dynamic explanations, reference tables, snippet solutions, etc..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-900 font-mono focus:bg-white focus:border-indigo-600 focus:outline-hidden transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs"
                    >
                      Publish to Student Study Room List
                    </button>
                  </form>
                </div>

                {/* Right Lists: Existing Handouts */}
                <div className="lg:col-span-6 rounded-xl border border-slate-150 bg-white p-5 shadow-2xs overflow-hidden flex flex-col">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-50 flex items-center justify-between">
                    <span>Uploaded Resources Ledger</span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">Total: {generalNotesList.length}</span>
                  </h4>

                  <div className="max-h-[460px] overflow-y-auto space-y-3.5 pr-1">
                    {generalNotesList.map((n) => (
                      <div key={n.id} className="rounded-lg border border-slate-100 bg-slate-50/30 p-3 hover:bg-slate-50 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[8px] font-extrabold text-indigo-700 uppercase tracking-widest mb-1.5">
                              {n.category}
                            </span>
                            <h5 className="font-bold text-slate-900 text-xs leading-snug">{n.title}</h5>
                            <p className="text-[10px] font-mono text-slate-400 font-semibold mt-1">FileName: {n.fileName}</p>
                          </div>
                          <span className="font-mono text-[9px] text-indigo-650 bg-white border border-slate-100 px-2 py-0.5 rounded-sm shrink-0">
                            ID: {n.id}
                          </span>
                        </div>
                        <div className="mt-2.5 border-t border-slate-100 pt-2 text-[11px] text-slate-500 line-clamp-3">
                          {n.content}
                        </div>
                      </div>
                    ))}

                    {generalNotesList.length === 0 && (
                      <p className="text-center text-slate-400 italic py-12 text-xs">No general study handouts have been uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "upload-papers" && (
            <div className="space-y-6 pt-2" id="instructor-exam-papers-tab">
              <div className="border-b border-slate-150 pb-3">
                <h3 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-amber-600" />
                  Syllabus Exam Papers & Solutions Manager
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload previous year exam papers, mock testing banks, or midterm questionnaires along with their answer references or solutions keys for student auditing.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Form: Create Paper */}
                <div className="lg:col-span-6 rounded-xl border border-slate-150 bg-white p-5 shadow-2xs">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-50">
                    Publish Exam Paper with Answers
                  </h4>
                  <form onSubmit={handleCreateQuestionPaper} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Exam / Paper Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CSE 401: Data Structures Midsemester Examination"
                        value={paperTitle}
                        onChange={(e) => setPaperTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Category Domain</label>
                        <select
                          value={paperCategory}
                          onChange={(e) => setPaperCategory(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden transition"
                        >
                          <option value="Python">Python Core</option>
                          <option value="Java">Java OOP</option>
                          <option value="JavaScript">JavaScript ES6</option>
                          <option value="C++">C++ Standard Library</option>
                          <option value="React.js">React.js Components</option>
                          <option value="Node.js">Node.js Express</option>
                          <option value="Database & SQL">Databases & SQL</option>
                          <option value="Data Structures & Algorithms">Data Structures & Algos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Exam Year</label>
                        <input
                          type="number"
                          value={paperYear}
                          onChange={(e) => setPaperYear(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Exam Type</label>
                        <select
                          value={paperType}
                          onChange={(e) => setPaperType(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden transition"
                        >
                          <option value="Previous Year">Previous Year</option>
                          <option value="Model Paper">Model Paper</option>
                          <option value="MCQ Bank">MCQ Bank</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Paper Questions & Answer Solutions</label>
                      <textarea
                        required
                        rows={7}
                        placeholder="Write down exam questions along with step-by-step verified core answers or solution references..."
                        value={paperContent}
                        onChange={(e) => setPaperContent(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-900 font-mono focus:bg-white focus:border-indigo-600 focus:outline-hidden transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs"
                    >
                      Publish Exam Solutions to Portal
                    </button>
                  </form>
                </div>

                {/* Right List: Existing Papers */}
                <div className="lg:col-span-6 rounded-xl border border-slate-150 bg-white p-5 shadow-2xs overflow-hidden flex flex-col">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-50 flex items-center justify-between">
                    <span>Published Exams Catalog</span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">Total: {generalPapersList.length}</span>
                  </h4>

                  <div className="max-h-[460px] overflow-y-auto space-y-3.5 pr-1">
                    {generalPapersList.map((p) => (
                      <div key={p.id} className="rounded-lg border border-slate-100 bg-slate-50/30 p-3 hover:bg-slate-50 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[8px] font-extrabold text-amber-700 uppercase tracking-widest">
                                {p.category}
                              </span>
                              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[8px] font-extrabold text-slate-600 font-mono">
                                {p.examType} ({p.year})
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-xs leading-snug">{p.title}</h5>
                          </div>
                          <span className="font-mono text-[9px] text-indigo-655 bg-white border border-slate-100 px-2 py-0.5 rounded-sm shrink-0">
                            ID: {p.id}
                          </span>
                        </div>
                        <div className="mt-2.5 border-t border-slate-100 pt-2 text-[11px] text-slate-500 line-clamp-3">
                          {p.content}
                        </div>
                      </div>
                    ))}

                    {generalPapersList.length === 0 && (
                      <p className="text-center text-slate-400 italic py-12 text-xs">No examination papers have been published yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12" id="course-creation-form-panel">
          
          {/* Column 1: Core metadata creation */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-indigo-600" />
                1. Faculty course Metadata Details
              </h3>

              {error && (
                <div className="mb-4 text-xs bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {courseIdForModules ? (
                <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50/50 p-4 mb-4 text-xs text-green-800">
                  <Check className="h-4.5 w-4.5 shrink-0 bg-green-600 text-white rounded-full p-0.5" />
                  <div>
                    <p className="font-bold">Course Meta Created Successfully!</p>
                    <p className="text-[11px] text-green-700 font-mono mt-0.5">Syllabus Class ID: {courseIdForModules}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Course Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., C++ Advanced Memory Allocations"
                      className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Course summary / syllabus Description</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Discuss pointer safety, constructors, concurrency..."
                      className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Programming Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700"
                      >
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="C++">C++</option>
                        <option value="React.js">React.js</option>
                        <option value="Node.js">Node.js</option>
                        <option value="Data Structures & Algorithms">DSA</option>
                        <option value="Database & SQL">Database & SQL</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Difficulty level</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Credit Duration</label>
                      <input
                        type="text"
                        required
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g., 10 hours"
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Cover Thumbnail Url</label>
                      <input
                        type="text"
                        required
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        placeholder="URL path"
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-950 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 font-bold text-white shadow-xs hover:bg-indigo-500"
                  >
                    Save & Next: Set Up Module Parts
                  </button>
                </form>
              )}

            </div>

          </div>

          {/* Column 2: syllabus, lessons modules and quiz attachment */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* syllabus modules creation */}
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-violet-600" />
                2. Setup Modules & Lecture Segments
              </h3>

              {!courseIdForModules ? (
                <p className="text-xs text-slate-400 italic">Please complete course description and metadata first to unlock modules configurations.</p>
              ) : (
                <div className="space-y-4">
                  
                  {/* Module setup */}
                  <div className="border-b border-slate-100 pb-4 space-y-2.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Module / Segment Title</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={moduleTitle}
                        onChange={(e) => setModuleTitle(e.target.value)}
                        placeholder="e.g., Chapter 1: Introduction"
                        className="flex-1 rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleCreateModule}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Create Module
                      </button>
                    </div>
                  </div>

                  {/* Lecture additions */}
                  <div className="space-y-3 pt-1">
                    <h4 className="text-xs font-bold text-slate-950">Add Lecture / Video Lesson To Module:</h4>
                    
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Syllabus Module Part</label>
                      <select
                        value={selectedModuleForLesson}
                        onChange={(e) => setSelectedModuleForLesson(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                      >
                        {activeCourseModules.map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-455 mb-1">Lecture Title</label>
                        <input
                          type="text"
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          placeholder="Understanding structures"
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-455 mb-1">Video Link (YouTube, Vimeo, MP4)</label>
                        <input
                          type="text"
                          value={lessonYoutubeUrl}
                          onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or custom URL"
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-455 mb-1">Notes Document (Optional)</label>
                        <input
                          type="text"
                          value={lessonNotesName}
                          onChange={(e) => setLessonNotesName(e.target.value)}
                          placeholder="Chapter1_Allocations.pdf"
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-455 mb-1">SandBox Source Snippet (Optional)</label>
                        <input
                          type="text"
                          value={lessonSourceCode}
                          onChange={(e) => setLessonSourceCode(e.target.value)}
                          placeholder="let score = 90; console.log(score);"
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateLesson}
                      className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      Publish Lesson & Video Link
                    </button>
                    
                  </div>

                </div>
              )}

            </div>

            {/* syllabus quizzes creation */}
            {courseIdForModules && (
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs">
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-amber-500" />
                  3. Create Course Quiz & Evaluations
                </h3>

                <form onSubmit={handleCreateQuiz} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                       <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Quiz Title</label>
                      <input
                        type="text"
                        required
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        placeholder="e.g. Memory Allocations Test"
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-505 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        required
                        value={quizDurationMinutes}
                        onChange={(e) => setQuizDurationMinutes(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-505 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Negative Marking</label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="checkbox"
                          checked={quizNegativeMarking}
                          onChange={(e) => setQuizNegativeMarking(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-semibold text-slate-700">Enable</span>
                        {quizNegativeMarking && (
                          <input
                            type="number"
                            step="0.05"
                            placeholder="0.25"
                            value={quizNegativeMarkValue}
                            onChange={(e) => setQuizNegativeMarkValue(Number(e.target.value))}
                            className="w-16 rounded border border-slate-200 p-1 text-[10px] font-bold text-center"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Individual Question Builder Box */}
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/50 pb-2">
                      <h4 className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <span>Add Individual Question Card</span>
                        <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded-sm">Question #{quizQuestionsList.length + 1}</span>
                      </h4>
                      
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="font-bold text-slate-500">Type:</span>
                        <div className="flex rounded-md bg-slate-100 p-0.5">
                          {(["mcq", "tf", "fitb", "coding"] as const).map((typeVal) => (
                            <button
                              type="button"
                              key={typeVal}
                              onClick={() => setTempQuestionType(typeVal)}
                              className={`rounded px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider transition-all ${
                                tempQuestionType === typeVal
                                  ? "bg-white text-indigo-600 shadow-xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              {typeVal === "tf" ? "T/F" : typeVal === "fitb" ? "Fill Blank" : typeVal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455 mb-1">Question Text</label>
                      <input
                        type="text"
                        value={tempQuestionText}
                        onChange={(e) => setTempQuestionText(e.target.value)}
                        placeholder={
                          tempQuestionType === "coding"
                            ? "e.g. Implement a solution() function returning the sum of two digits."
                            : tempQuestionType === "fitb"
                            ? "e.g. Which OOP paradigm focuses on data encapsulation with private keywords?"
                            : "Which keyword allocates memory on heap in C++?"
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    {/* DYNAMIC FORM SEGMENTS PER TYPE */}
                    {tempQuestionType === "mcq" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tempOptions.map((opt, oIdx) => (
                          <div key={oIdx}>
                            <label className="block text-[8px] font-extrabold uppercase text-slate-400 mb-0.5">Option {oIdx + 1}</label>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...tempOptions];
                                updated[oIdx] = e.target.value;
                                setTempOptions(updated);
                              }}
                              placeholder={`MCQ choice option ${oIdx + 1}`}
                              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {tempQuestionType === "tf" && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 flex items-center justify-between">
                        <span>True/False Mode Active:</span>
                        <span className="italic text-[11px] text-slate-400">Locked Options: ["True", "False"]</span>
                      </div>
                    )}

                    {tempQuestionType === "fitb" && (
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455 mb-1">Expected Answer (Case Insensitive exact match)</label>
                        <input
                          type="text"
                          value={tempCorrectAnswerText}
                          onChange={(e) => setTempCorrectAnswerText(e.target.value)}
                          placeholder="e.g. encapsulation"
                          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-905"
                        />
                      </div>
                    )}

                    {tempQuestionType === "coding" && (
                      <div className="space-y-2 border-t border-indigo-50/50 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-extrabold uppercase text-slate-500 mb-1">Language Domain</label>
                            <select
                              value={tempLanguage}
                              onChange={(e) => setTempLanguage(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold"
                            >
                              <option value="javascript">JavaScript (Real Run VM)</option>
                              <option value="python">Python (Analytical Trace)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] font-extrabold uppercase text-slate-500 mb-1">Starter Boilerplate Code for student</label>
                          <textarea
                            rows={3}
                            value={tempStartingCode}
                            onChange={(e) => setTempStartingCode(e.target.value)}
                            placeholder="function solution(n) {&#10;  // Write code here&#10;}"
                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-extrabold uppercase text-slate-500 mb-1">Verified Reference Solution</label>
                          <textarea
                            rows={3}
                            value={tempSolutionCode}
                            onChange={(e) => setTempSolutionCode(e.target.value)}
                            placeholder="function solution(n) {&#10;  return n * 2;&#10;}"
                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono"
                          />
                        </div>

                        {/* TEST CASES BUILDER */}
                        <div className="bg-slate-100/50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                          <span className="text-[9px] font-extrabold uppercase text-indigo-900 block border-b border-indigo-100 pb-1">Automated Evaluation Suites</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-1">
                              <label className="block text-[8px] font-extrabold uppercase text-slate-400">Input args (CSV)</label>
                              <input
                                type="text"
                                value={tempTestInput}
                                onChange={(e) => setTempTestInput(e.target.value)}
                                placeholder="5, 3"
                                className="w-full rounded border border-slate-200 p-1 text-xs"
                              />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="block text-[8px] font-extrabold uppercase text-slate-400">Expected Result</label>
                              <input
                                type="text"
                                value={tempTestExpected}
                                onChange={(e) => setTempTestExpected(e.target.value)}
                                placeholder="8"
                                className="w-full rounded border border-slate-200 p-1 text-xs"
                              />
                            </div>
                            <div className="flex items-end justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!tempTestInput.trim() || !tempTestExpected.trim()) return;
                                  setTempTestCases(prev => [...prev, { input: tempTestInput, expectedOutput: tempTestExpected }]);
                                  setTempTestInput("");
                                  setTempTestExpected("");
                                }}
                                className="bg-indigo-600 text-white rounded px-3 py-1.5 text-xs hover:bg-indigo-500 font-bold transition w-full"
                              >
                                + Add TestCase
                              </button>
                            </div>
                          </div>

                          {tempTestCases.length > 0 && (
                            <div className="max-h-20 overflow-y-auto space-y-1 bg-white p-1.5 rounded border border-slate-200">
                              {tempTestCases.map((tc, tcIdx) => (
                                <div key={tcIdx} className="flex justify-between text-[9px] font-mono p-1 bg-slate-50 border border-slate-100 rounded">
                                  <span>Args: <strong className="text-amber-700">{tc.input}</strong></span>
                                  <span>Expected: <strong className="text-emerald-700">{tc.expectedOutput}</strong></span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1 border-t border-indigo-10s0/40">
                      {(tempQuestionType === "mcq" || tempQuestionType === "tf") && (
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455 mb-1">Correct Choice</label>
                          <select
                            value={tempCorrectAnswerIndex}
                            onChange={(e) => setTempCorrectAnswerIndex(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold text-indigo-750"
                          >
                            {tempQuestionType === "mcq" ? (
                              <>
                                <option value={0}>Option 1 (Correct)</option>
                                <option value={1}>Option 2 (Correct)</option>
                                <option value={2}>Option 3 (Correct)</option>
                                <option value={3}>Option 4 (Correct)</option>
                              </>
                            ) : (
                              <>
                                <option value={0}>True (Correct)</option>
                                <option value={1}>False (Correct)</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}

                      <div className={(tempQuestionType === "fitb" || tempQuestionType === "coding") ? "sm:col-span-2" : ""}>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455 mb-1">Solution Explanation (Optional)</label>
                        <input
                          type="text"
                          value={tempExplanation}
                          onChange={(e) => setTempExplanation(e.target.value)}
                          placeholder="e.g. Allocating using new gets a heap pointer, whereas local structures allocate stack variables."
                          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuizQuestion}
                      className="w-full rounded bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-850 transition"
                    >
                      + Store Quest Card to List
                    </button>
                  </div>

                  {/* Added Questions Counts Preview list */}
                  {quizQuestionsList.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Draft Questions ({quizQuestionsList.length})</p>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {quizQuestionsList.map((q, qIdx) => (
                          <div key={qIdx} className="text-[10px] rounded border border-slate-200 bg-slate-100/50 p-2 flex justify-between font-mono font-semibold items-center">
                            <span className="truncate flex items-center gap-1.5">
                              <span className="text-[8px] px-1 rounded bg-indigo-200 text-indigo-800 uppercase font-bold shrink-0">{q.type || "mcq"}</span>
                              <span className="text-slate-800">{qIdx + 1}. {q.questionText}</span>
                            </span>
                            <span className="text-indigo-650 shrink-0 font-bold ml-2">
                              {q.type === "coding" ? "Code Test" : q.type === "fitb" ? `Ans: "${q.correctAnswerText}"` : `Ans index: ${q.correctAnswerIndex + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-500 shadow-md transition"
                  >
                    🚀 Publish Completed Quiz to Course
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
