import React, { useState, useEffect } from "react";
import Header from "./components/Header.tsx";
import AuthView from "./components/AuthView.tsx";
import CourseBrowse from "./components/CourseBrowse.tsx";
import CourseLearn from "./components/CourseLearn.tsx";
import PracticeArena from "./components/PracticeArena.tsx";
import StudyRoom from "./components/StudyRoom.tsx";
import PapersPortal from "./components/PapersPortal.tsx";
import StudentDashboard from "./components/StudentDashboard.tsx";
import InstructorDashboard from "./components/InstructorDashboard.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import AiBotButton from "./components/AiBotButton.tsx";
import InstitutionRegister from "./components/InstitutionRegister.tsx";
import { User, UserRole, Course } from "./types.ts";
import { Sparkles, Terminal, Bell, X } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeView, setActiveView] = useState("browse"); // "browse" | "practice" | "notes" | "papers" | "learn" | "student-dashboard" | "instructor-dashboard" | "admin-dashboard"
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("codecraft_theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("codecraft_theme", theme);
  }, [theme]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [arenaInitialCode, setArenaInitialCode] = useState("");

  // Localization State
  const [locale, setLocale] = useState<string>(() => {
    return localStorage.getItem("codecraft_locale") || "en";
  });

  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem("codecraft_locale", newLocale);
  };

  // Course Bookmarking Favorites State
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`codecraft_bookmarks_${currentUser?.id || "guest"}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Keep bookmarks updated when user logs in/out or switches
  useEffect(() => {
    const userId = currentUser ? currentUser.id : "guest";
    const saved = localStorage.getItem(`codecraft_bookmarks_${userId}`);
    setBookmarkedCourseIds(saved ? JSON.parse(saved) : []);
  }, [currentUser]);

  const toggleBookmarkCourse = (courseId: string) => {
    const userId = currentUser ? currentUser.id : "guest";
    const updated = bookmarkedCourseIds.includes(courseId)
      ? bookmarkedCourseIds.filter(id => id !== courseId)
      : [...bookmarkedCourseIds, courseId];
    
    setBookmarkedCourseIds(updated);
    localStorage.setItem(`codecraft_bookmarks_${userId}`, JSON.stringify(updated));
    
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const isAdded = updated.includes(courseId);
      addNotification(
        isAdded ? "Course Bookmarked" : "Bookmark Removed",
        isAdded 
          ? `Added "${course.title}" to your favorites directory.` 
          : `Removed "${course.title}" from your favorites directory.`
      );
    }
  };

  // Load all course listings on start
  const fetchCoursesList = () => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => {
        if (data.courses) setCourses(data.courses);
      })
      .catch(err => console.error("Could not fetch courses list", err));
  };

  useEffect(() => {
    fetchCoursesList();

    // Recover login session from localStorage if present
    const savedToken = localStorage.getItem("codecraft_token");
    const savedUser = localStorage.getItem("codecraft_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }

    // Seed default academic notification messages
    setNotifications([
      {
        id: "notif-1",
        title: "Semester Workspace Open",
        message: "CodeCraft full catalog revision handouts have synced successfully.",
        read: false
      }
    ]);
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setCurrentUser(newUser);
    localStorage.setItem("codecraft_token", newToken);
    localStorage.setItem("codecraft_user", JSON.stringify(newUser));
    
    addNotification(
      "Signed In",
      `Welcome, ${newUser.name}! Authorized classroom path access established.`
    );

    // Switch view to their relative dashboard automatically upon login
    if (newUser.role === UserRole.ADMIN) setActiveView("admin-dashboard");
    else if (newUser.role === UserRole.INSTRUCTOR) setActiveView("instructor-dashboard");
    else setActiveView("student-dashboard");
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("codecraft_token");
    localStorage.removeItem("codecraft_user");
    setActiveView("browse");
    addNotification("Logged Out", "Signed out successfully. Session state closed.");
  };

  const addNotification = (title: string, message: string) => {
    const newAlert = {
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      title,
      message,
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    
    // Fetch course details, modules and lessons
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.course) {
          setSelectedCourseDetail(data);
          setActiveView("learn");
        }
      })
      .catch(err => console.error("Failed loading course lecture specifics", err));
  };

  const handlePracticeCodeInArena = (startingCode: string) => {
    setArenaInitialCode(startingCode);
    setActiveView("practice");
  };

  // Trigger quiz submission on lecture learn page
  const handleAttemptQuizInLearn = async (quizId: string) => {
    if (!currentUser || !selectedCourseId) return;
    
    // Build quick options attempt map
    // We simulate starting an MCQ evaluation and answering options
    const dummyAnswers: { [qId: string]: number } = {
      "qq-py-1": 1, // Correct Option (print)
      "qq-py-2": 2, // Correct Option (x = 5)
      "qq-js-1": 0  // Correct Option (let block-scoped)
    };

    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          answers: dummyAnswers
        })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(
          "Quiz Completed",
          `Attempt logged! Score received: ${data.score} out of ${data.total} targets.`
        );
        // Refresh learn specifics to show scoreboard grade
        handleSelectCourse(selectedCourseId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200" id="codecraft-root-app">
      
      {/* Top Navbar */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchView={(v) => {
          setActiveView(v);
          setArenaInitialCode(""); // Reset initial practice arena code if they just clicked sandbox tab
        }}
        activeView={activeView}
        onOpenAuth={() => setShowAuthModal(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentLanguage={locale}
        onSetLanguage={handleSetLocale}
      />

      {/* Toast Notification Broadcaster Banner */}
      {notifications.length > 0 && !notifications[0].read && (
        <div className="bg-indigo-605 text-white py-2 px-4 text-xs font-semibold flex items-center justify-between shadow-inner" id="notification-alert-header">
          <div className="mx-auto max-w-7xl flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-200 animate-bounce" />
            <span>
              <strong>Latest Update:</strong> {notifications[0].title} — {notifications[0].message}
            </span>
            <button 
              onClick={() => handleMarkNotificationRead(notifications[0].id)}
              className="ml-3 text-indigo-200 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main workspace section */}
      <main className="flex-grow">
        
        {activeView === "browse" && (
          <CourseBrowse
            courses={courses}
            onSelectCourse={handleSelectCourse}
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
            bookmarkedCourseIds={bookmarkedCourseIds}
            onToggleBookmark={toggleBookmarkCourse}
            currentLanguage={locale}
          />
        )}

        {activeView === "learn" && selectedCourseDetail && (
          <CourseLearn
            courseId={selectedCourseId!}
            course={selectedCourseDetail.course}
            modules={selectedCourseDetail.modules}
            lessons={selectedCourseDetail.lessons}
            quizzes={selectedCourseDetail.quizzes}
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
            token={token}
            onBack={() => setActiveView("browse")}
            onAttemptQuiz={handleAttemptQuizInLearn}
            onPracticeCode={handlePracticeCodeInArena}
            onAddNotification={addNotification}
          />
        )}

        {activeView === "practice" && (
          <PracticeArena
            initialCode={arenaInitialCode}
            onAddNotification={addNotification}
            currentLanguage={locale}
          />
        )}

        {activeView === "notes" && (
          <StudyRoom 
            onAddNotification={addNotification} 
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {activeView === "papers" && (
          <PapersPortal onAddNotification={addNotification} />
        )}

        {activeView === "student-dashboard" && (
          <StudentDashboard
            courses={courses}
            token={token}
            onSelectCourse={handleSelectCourse}
            onSwitchView={setActiveView}
            currentUser={currentUser}
            bookmarkedCourseIds={bookmarkedCourseIds}
            onToggleBookmark={toggleBookmarkCourse}
            currentLanguage={locale}
          />
        )}

        {activeView === "instructor-dashboard" && (
          <InstructorDashboard
            token={token}
            onRefreshCourses={fetchCoursesList}
            onAddNotification={addNotification}
          />
        )}

        {activeView === "admin-dashboard" && (
          <AdminDashboard
            token={token}
            onAddNotification={addNotification}
          />
        )}

        {activeView === "institutions" && (
          <InstitutionRegister
            currentUser={currentUser}
            token={token}
            currentLanguage={locale}
            onAddNotification={addNotification}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

      </main>

      {/* Floating AI chat Bot and companion panel */}
      <AiBotButton currentLanguage={locale} />

      {/* Sign-In Modal */}
      {showAuthModal && (
        <AuthView
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Custom footer conforming to visual guidelines */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 text-center mt-12 transition-colors duration-200" id="platform-footer">
        <p className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          CodeCraft Academic Learning System © 2026
        </p>
      </footer>

    </div>
  );
}
