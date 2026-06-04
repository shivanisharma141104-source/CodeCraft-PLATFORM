import React, { useState } from "react";
import { 
  GraduationCap, User, LogOut, Bell, Menu, X, 
  Terminal, Sparkles, BookOpen, Settings, AlertCircle,
  Sun, Moon, Globe, Building2
} from "lucide-react";
import { UserRole } from "../types.js";
import { LANGUAGES, TRANSLATIONS } from "../lib/locales.js";

interface HeaderProps {
  currentUser: any;
  onLogout: () => void;
  onSwitchView: (view: string) => void;
  activeView: string;
  onOpenAuth: () => void;
  notifications: Array<{ id: string; title: string; message: string; read: boolean }>;
  onMarkNotificationRead: (id: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  currentLanguage: string;
  onSetLanguage: (lang: string) => void;
}

export default function Header({
  currentUser,
  onLogout,
  onSwitchView,
  activeView,
  onOpenAuth,
  notifications,
  onMarkNotificationRead,
  theme,
  onToggleTheme,
  currentLanguage,
  onSetLanguage
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS["en"];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Brand */}
        <div 
          onClick={() => onSwitchView("browse")} 
          className="flex cursor-pointer items-center space-x-3 transition-transform duration-200 hover:scale-[1.01]"
          id="brand-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-150">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-sans text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              CodeCraft
            </h1>
            <p className="font-mono text-[9px] font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase mt-1">
              Academic E-Learning
            </p>
          </div>
        </div>

        {/* Desktop Core Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1" id="desktop-nav">
          <button
            onClick={() => onSwitchView("browse")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeView === "browse" || activeView === "course-detail" || activeView === "learn"
                ? "text-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t.programmingCourses}
            </span>
          </button>

          <button
            onClick={() => onSwitchView("practice")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeView === "practice"
                ? "text-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              {t.codingPracticeSandbox}
            </span>
          </button>

          <button
            onClick={() => onSwitchView("notes")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeView === "notes"
                ? "text-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {t.studyNotes}
          </button>

          <button
            onClick={() => onSwitchView("papers")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeView === "papers"
                ? "text-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {t.questionPapers}
          </button>

          <button
            onClick={() => onSwitchView("institutions")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeView === "institutions"
                ? "text-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t.institutions}
            </span>
          </button>
        </nav>

        {/* Actions Menu */}
        <div className="flex items-center space-x-3.5">
          {/* Language Switcher */}
          <div className="relative flex items-center gap-1 bg-white dark:bg-slate-805 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 shadow-2xs">
            <Globe className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <select
              value={currentLanguage}
              onChange={(e) => onSetLanguage(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold text-slate-705 dark:text-slate-300 focus:outline-none focus:ring-0 cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Light / Dark Mode Toggle button */}
          <button
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-705 dark:text-slate-300 transition-colors cursor-pointer"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="h-4.5 w-4.5 text-slate-600" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-amber-405 animate-pulse" />
            )}
          </button>
          {currentUser ? (
            <>
              {/* Dynamic Dashboard Quick Link */}
              <button
                onClick={() => {
                  if (currentUser.role === UserRole.ADMIN) onSwitchView("admin-dashboard");
                  else if (currentUser.role === UserRole.INSTRUCTOR) onSwitchView("instructor-dashboard");
                  else onSwitchView("student-dashboard");
                }}
                className="hidden lg:flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/40 px-3.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} {t.dashboard}
              </button>

              {/* Notifications bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-705 transition-colors cursor-pointer"
                  id="notifications-bell"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xl ring-1 ring-black/5 dark:ring-white/5" id="notifications-box">
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-1.5">
                      <h3 className="font-semibold text-slate-950 dark:text-white text-sm">{t.notifications}</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">{t.noNotifications}</p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-2.5">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => onMarkNotificationRead(notif.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              notif.read 
                                ? "bg-white border-slate-100 text-slate-500 dark:bg-slate-855 dark:border-slate-800 dark:text-slate-400" 
                                : "bg-indigo-50/50 border-indigo-100 text-slate-900 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-slate-200"
                            }`}
                          >
                            <p className="font-bold">{notif.title}</p>
                            <p className="mt-0.5 text-slate-600 dark:text-slate-350">{notif.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile dropdown menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-1 pr-2.5 hover:bg-slate-50 dark:hover:bg-slate-705 transition-colors cursor-pointer"
                  id="profile-dropdown-btn"
                >
                  <img
                    src={currentUser.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=guest"}
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-md bg-slate-100 dark:bg-slate-705 object-cover"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/5" id="profile-dropdown-box">
                    <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2.5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (currentUser.role === UserRole.ADMIN) onSwitchView("admin-dashboard");
                          else if (currentUser.role === UserRole.INSTRUCTOR) onSwitchView("instructor-dashboard");
                          else onSwitchView("student-dashboard");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Settings className="h-4 w-4" />
                        My {t.dashboard}
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-650 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        {t.signOut}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 active:bg-indigo-700 transition cursor-pointer"
              id="header-sign-in-button"
            >
              {t.signInSignUp}
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-705 cursor-pointer"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-inner" id="mobile-navigation-drawer">
          <button
            onClick={() => {
              onSwitchView("browse");
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 p-2.5 text-xs font-medium rounded-lg ${
              activeView === "browse" 
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" 
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="h-4 w-4 text-indigo-500" />
            {t.programmingCourses}
          </button>

          <button
            onClick={() => {
              onSwitchView("practice");
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 p-2.5 text-xs font-medium rounded-lg ${
              activeView === "practice" 
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" 
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Terminal className="h-4 w-4 text-indigo-500" />
            {t.codingPracticeSandbox}
          </button>

          <button
            onClick={() => {
              onSwitchView("notes");
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 p-2.5 text-xs font-medium rounded-lg ${
              activeView === "notes" 
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" 
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
             <BookOpen className="h-4 w-4 text-indigo-500" />
            {t.studyNotes}
          </button>

          <button
            onClick={() => {
              onSwitchView("papers");
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 p-2.5 text-xs font-medium rounded-lg ${
              activeView === "papers" 
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" 
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
             <BookOpen className="h-4 w-4 text-indigo-500" />
            {t.questionPapers}
          </button>

          <button
            onClick={() => {
              onSwitchView("institutions");
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 p-2.5 text-xs font-medium rounded-lg ${
              activeView === "institutions" 
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" 
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
             <Building2 className="h-4 w-4 text-indigo-500" />
            {t.institutions}
          </button>

          {currentUser && (
            <button
              onClick={() => {
                if (currentUser.role === UserRole.ADMIN) onSwitchView("admin-dashboard");
                else if (currentUser.role === UserRole.INSTRUCTOR) onSwitchView("instructor-dashboard");
                else onSwitchView("student-dashboard");
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 p-2.5 text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white rounded-lg"
            >
              <Sparkles className="h-4 w-4 text-violet-400" />
              My {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} {t.dashboard}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
