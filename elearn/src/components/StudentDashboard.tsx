import React, { useState, useEffect } from "react";
import { 
  FolderCheck, PlayCircle, Trophy, BookOpen, Clock, 
  Sparkles, CheckCircle, Flame, ArrowRight, BookMarked,
  Download, Trash2, Eye, Milestone, FileText, ChevronRight, Bookmark
} from "lucide-react";
import { Course } from "../types.js";
import { TRANSLATIONS } from "../lib/locales.js";

interface StudentDashboardProps {
  courses: Course[];
  token: string | null;
  onSelectCourse: (id: string) => void;
  onSwitchView: (view: string) => void;
  currentUser: any;
  bookmarkedCourseIds: string[];
  onToggleBookmark: (courseId: string) => void;
  currentLanguage: string;
}

export default function StudentDashboard({
  courses,
  token,
  onSelectCourse,
  onSwitchView,
  currentUser,
  bookmarkedCourseIds,
  onToggleBookmark,
  currentLanguage
}: StudentDashboardProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [completeMap, setCompleteMap] = useState<{ [courseId: string]: number }>({});
  const [quizzesReport, setQuizzesReport] = useState<any[]>([]);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS["en"];

  // Fetch local items and backend progress metrics on login
  useEffect(() => {
    if (currentUser) {
      // 1. Fetch saved notes from localStorage
      const notesKey = `codecraft_saved_notes_${currentUser.id}`;
      const notesExisting = localStorage.getItem(notesKey);
      if (notesExisting) {
        try {
          setSavedNotes(JSON.parse(notesExisting));
        } catch (e) {
          console.error("Failed parsing saved notes to dashboard", e);
        }
      }

      // 2. Fetch recently watched videos from localStorage
      const watchedKey = `codecraft_recently_watched_${currentUser.id}`;
      const watchedExisting = localStorage.getItem(watchedKey);
      if (watchedExisting) {
        try {
          setRecentlyWatched(JSON.parse(watchedExisting));
        } catch (e) {
          console.error("Failed parsing watched lessons to dashboard", e);
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!token) return;

    // Load progress for all courses to deduce enrollments
    const fetchAllProgress = async () => {
      try {
        let matched: Course[] = [];
        let cMap: { [courseId: string]: number } = {};
        let quizzesList: any[] = [];

        for (const c of courses) {
          const res = await fetch(`/api/progress/${c.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.progress) {
            const completedCount = data.progress.completedLessonIds?.length || 0;
            const quizAttempts = data.progress.quizAttempts || {};
            
            // Deduce enrollment if they either watched a lesson or attempted a quiz
            if (completedCount > 0 || Object.keys(quizAttempts).length > 0) {
              matched.push(c);
              
              // We mimic pre-calculating dynamic completion percentage
              // Let's assume each course has 3 default lectures for grading
              cMap[c.id] = Math.min(100, Math.floor((completedCount / 3) * 100));

              Object.keys(quizAttempts).forEach((qId) => {
                quizzesList.push({
                  courseId: c.id,
                  courseTitle: c.title,
                  quizId: qId,
                  score: quizAttempts[qId].score,
                  total: quizAttempts[qId].total,
                  date: quizAttempts[qId].date
                });
              });
            }
          }
        }

        // Default seed enrollment if fresh login
        if (matched.length === 0 && courses.length > 0) {
          matched = [courses[0], courses[1]];
          cMap[courses[0].id] = 33;
          cMap[courses[1].id] = 0;
        }

        setEnrolledCourses(matched);
        setCompleteMap(cMap);
        setQuizzesReport(quizzesList);
      } catch (err) {
        console.error("Dashboard calculation failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProgress();
  }, [courses, token]);

  const handleRemoveSavedNote = (noteId: string) => {
    if (!currentUser) return;
    const notesKey = `codecraft_saved_notes_${currentUser.id}`;
    const updated = savedNotes.filter(n => n.id !== noteId);
    setSavedNotes(updated);
    localStorage.setItem(notesKey, JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (!currentUser) return;
    const watchedKey = `codecraft_recently_watched_${currentUser.id}`;
    setRecentlyWatched([]);
    localStorage.removeItem(watchedKey);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500 font-mono">Synthesizing learning analytics...</p>
      </div>
    );
  }

  // Calculate learning progress overview stats
  const totalCoursesCount = enrolledCourses.length;
  const completedCoursesCount = Object.values(completeMap).filter(pct => pct === 100).length;
  const averageCompletionPct = totalCoursesCount > 0 
    ? Math.floor((Object.values(completeMap) as number[]).reduce((sum: number, val: number) => sum + val, 0) / totalCoursesCount)
    : 0;

  // Derive bookmarked courses objects
  const bookmarkedCourses = courses.filter((c) => bookmarkedCourseIds.includes(c.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="student-dashboard">
      
      {/* Banner */}
      <div className="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            {t.classroomPortalActive}
          </div>
          <h2 className="font-sans text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            {t.welcomeBack.replace("{name}", currentUser?.name || "Developer")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.studentDashboardSub}
          </p>
        </div>

        {/* Daily challenges link banner */}
        <button
          onClick={() => onSwitchView("practice")}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 border border-transparent px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
        >
          {t.dailyChallengeTitle}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Stats Cards Dashboard Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8" id="student-summary-widgets">
        <div className="rounded-xl border border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{t.enrolledCourses}</p>
          <div className="mt-2 text-baseline flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalCoursesCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">enrolled</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{t.averageProgress}</p>
          <div className="mt-2 text-baseline flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{averageCompletionPct}%</span>
            <span className="text-[10px] text-slate-400 font-mono">completion</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{t.quizScorecards}</p>
          <div className="mt-2 text-baseline flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{quizzesReport.length}</span>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">attempts</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{t.savedHandouts}</p>
          <div className="mt-2 text-baseline flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{savedNotes.length}</span>
            <span className="text-[10px] text-slate-400 font-mono">cheat sheets</span>
          </div>
        </div>
      </div>

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* LEFT COLUMN: Course Progress and Gradebook (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Bookmarked & Favorite Courses */}
          <div className="space-y-4 mb-6">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
              <BookMarked className="h-4 w-4 text-indigo-650" />
              {t.bookmarksAndFavorites}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.bookmarksSub}
            </p>

            {bookmarkedCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 py-8 text-center bg-slate-50/50 dark:bg-slate-950/20">
                <p className="text-[11px] text-slate-450 italic">{t.bookmarkEmpty}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bookmarkedCourses.map((c) => (
                  <div
                    key={`fav-${c.id}`}
                    onClick={() => onSelectCourse(c.id)}
                    className="p-4 rounded-xl border border-slate-150 bg-white shadow-2xs hover:border-indigo-305 transition cursor-pointer flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[8px] font-bold text-indigo-705 dark:text-indigo-400 uppercase font-mono">
                          {c.category}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(c.id);
                          }}
                          className="text-amber-500 hover:text-slate-400 p-0.5 cursor-pointer"
                          title="Remove favorite"
                        >
                          <Bookmark className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate mt-1">{c.title}</h4>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      <span>{c.duration}</span>
                      <span className="flex items-center gap-0.5">{t.learnClass} <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section A: Enrolled Courses & Learning Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-3">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Milestone className="h-4 w-4 text-indigo-500" />
                {t.enrolledCourses} & Learning Progress
              </h3>
              <button
                onClick={() => onSwitchView("browse")}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                {t.exploreCatalog} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            {enrolledCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 py-12 text-center bg-slate-50">
                <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-xs text-slate-500">{t.noEnrolledCourses}</p>
                <button
                  onClick={() => onSwitchView("browse")}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  {t.exploreCatalog}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="enrolled-courses-panel">
                {enrolledCourses.map((c) => {
                  const percentage = completeMap[c.id] || 0;
                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectCourse(c.id)}
                      className="rounded-xl border border-slate-150 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800"
                      id={`enrollment-card-${c.id}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
                            {c.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{c.duration}</span>
                        </div>
                        <h4 className="font-sans text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">{c.title}</h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                      </div>

                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>Syllabus Completion</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                          <span>{percentage === 100 ? "Class fully mastered!" : "In progress"}</span>
                          <span>Click to resume</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Gradebook & Quiz scoreboard */}
          <div className="space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              Gradebook & Quiz Scorecard
            </h3>
            
            <div className="rounded-xl border border-slate-150 bg-white overflow-hidden shadow-xs" id="grades-scorecard">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500">
                    <th className="p-3">Curriculum / Class</th>
                    <th className="p-3">Assessment Code</th>
                    <th className="p-3">Obtained Grade</th>
                    <th className="p-3">Submission Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {quizzesReport.map((rep, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-900 font-bold">{rep.courseTitle}</td>
                      <td className="p-3 text-slate-450 font-mono">Quiz Ref: {rep.quizId}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {rep.score} / {rep.total} Correct
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[10px]">
                        {new Date(rep.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}

                  {quizzesReport.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-450 italic">No quizzes submitted during this semester session.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Saved Notes and Recently Watched lists (4 Cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section C: Saved Study Notes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-amber-500" />
                Saved Crib Sheets ({savedNotes.length})
              </h3>
              <button
                onClick={() => onSwitchView("notes")}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Study Room
              </button>
            </div>

            <div className="space-y-3" id="saved-notes-panel">
              {savedNotes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center bg-slate-50">
                  <FileText className="mx-auto h-6 w-6 text-slate-400 mb-1" />
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                    No bookmarked cheat sheets. Save notes in the Study Room to buffer them here.
                  </p>
                  <button 
                    onClick={() => onSwitchView("notes")}
                    className="mt-3 text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Open Study Notes
                  </button>
                </div>
              ) : (
                savedNotes.map((note) => (
                  <div 
                    key={note.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-150 transition-all flex items-start justify-between gap-2.5"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="font-mono text-[8px] font-extrabold tracking-wide text-indigo-600 uppercase">
                        {note.category}
                      </span>
                      <h4 className="font-sans font-bold text-slate-900 text-xs truncate leading-snug">{note.title}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">Saved on: {new Date(note.savedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Read button */}
                      <button
                        onClick={() => onSwitchView("notes")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition"
                        title="Read Note"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      
                      {/* Download Link */}
                      <a
                        href={note.fileUrl || "/api/downloads/handout.pdf"}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition"
                        title="Download Note"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveSavedNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition cursor-pointer"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section D: Recently Watched Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-emerald-500" />
                Recently Watched Lessons
              </h3>
              {recentlyWatched.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="space-y-3" id="recently-watched-panel">
              {recentlyWatched.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center bg-slate-50">
                  <PlayCircle className="mx-auto h-6 w-6 text-slate-400 mb-1" />
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                    No recently watched videos. Start watching lectures inside your courses to track history.
                  </p>
                </div>
              ) : (
                recentlyWatched.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-150 transition flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0 flex-grow">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 font-mono">
                          {item.duration || "10 mins"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">
                          {item.courseTitle}
                        </span>
                      </div>
                      <h4 className="font-sans font-bold text-slate-900 text-xs truncate leading-snug">{item.lessonTitle}</h4>
                      <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3 inline text-slate-400" />
                        Watched {new Date(item.watchedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectCourse(item.courseId)}
                      className="inline-flex h-8 items-center gap-1 px-3 rounded-lg bg-slate-900 text-[10px] font-bold text-white hover:bg-slate-800 transition shadow-xs whitespace-nowrap cursor-pointer shrink-0"
                    >
                      Resume
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
