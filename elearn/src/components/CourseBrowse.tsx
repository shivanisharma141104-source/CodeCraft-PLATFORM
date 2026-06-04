import React, { useState } from "react";
import { 
  Search, BookOpen, Layers, Clock, Flame, 
  ArrowRight, Sparkles, AlertCircle, Bookmark, Heart
} from "lucide-react";
import { Course } from "../types.js";
import { TRANSLATIONS } from "../lib/locales.js";

const CATEGORIES = [
  "All",
  "Python",
  "Java",
  "JavaScript",
  "C",
  "C++",
  "React.js",
  "Node.js",
  "Full Stack Development",
  "Data Structures & Algorithms",
  "Database & SQL",
  "AI & Machine Learning",
  "Web Development",
  "App Development"
];

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

interface CourseBrowseProps {
  courses: Course[];
  onSelectCourse: (id: string) => void;
  currentUser: any;
  onOpenAuth: () => void;
  bookmarkedCourseIds: string[];
  onToggleBookmark: (courseId: string) => void;
  currentLanguage: string;
}

export default function CourseBrowse({
  courses,
  onSelectCourse,
  currentUser,
  onOpenAuth,
  bookmarkedCourseIds,
  onToggleBookmark,
  currentLanguage
}: CourseBrowseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS["en"];

  // Filter courses based on search text, selected category, and difficulty
  const isStudentIndividual = currentUser?.role === "student" && !currentUser?.isAcademicAffiliated;

  const visibleCourses = courses.filter((course: any) => {
    // If student is registered independently, they cannot find other Academic Institutions teachers
    if (isStudentIndividual && course.isAcademicInstructor !== false) {
      return false; // hide academic instructors' courses
    }
    return true;
  });

  const filteredCourses = visibleCourses.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || course.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesDifficulty = 
      selectedDifficulty === "All" || course.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const recommendedCourses = visibleCourses.slice(0, 2);
  const trendingCourses = visibleCourses.slice().reverse().slice(0, 2);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="course-browse-container">
      
      {/* Hero Header Area */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-slate-900 px-8 py-12 text-white shadow-xl sm:px-14 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(67,56,202,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-505/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            {t.vettedClasses}
          </div>
          <h2 className="mt-5 font-sans text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
            {t.elevateProficiency}
          </h2>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-xl">
            {t.heroSub}
          </p>
        </div>
      </div>

      {/* Main Browse Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6" id="filters-sidebar">
          
          {/* Search bar */}
          <div className="relative rounded-xl shadow-xs">
            <Search className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600/35 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-550 shadow-xs"
            />
          </div>

          {/* Difficulty Selection */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">{t.difficultyLevel}</h3>
            <div className="flex flex-col gap-1.5" id="difficulty-filters">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedDifficulty === diff 
                      ? "bg-slate-950 dark:bg-slate-800 text-white shadow-xs" 
                      : "text-slate-605 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {diff === "All" ? t.all : diff}
                </button>
              ))}
            </div>
          </div>

          {/* Categories List */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">{t.categories}</h3>
            <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-1" id="category-filters">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all truncate cursor-pointer ${
                    selectedCategory === cat 
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100 dark:shadow-none" 
                      : "text-slate-605 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {cat === "All" ? t.all : cat}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Content Listings Grid */}
        <div className="lg:col-span-3">
          
          {/* 1. RECOMMENDED COURSES & TRENDING HIGHLIGHTS LAYOUT */}
          {searchQuery === "" && selectedCategory === "All" && selectedDifficulty === "All" && visibleCourses.length > 0 && (
            <div className="mb-10 space-y-8" id="personalized-learning-showcase">
              
              {/* Recommended Coding Courses section */}
              {recommendedCourses.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-sans text-sm font-extrabold text-slate-900 dark:text-white">
                      {t.recommendedForYou}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.recommendedSub}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendedCourses.map((course) => (
                      <div
                        key={`rec-${course.id}`}
                        onClick={() => onSelectCourse(course.id)}
                        className="group relative flex flex-col rounded-xl border border-amber-100 dark:border-amber-955 bg-gradient-to-br from-amber-50/20 to-white dark:from-amber-955/5 dark:to-slate-900 p-4 transition-all hover:border-amber-300 dark:hover:border-amber-900 shadow-2xs hover:shadow-sm cursor-pointer"
                      >
                        <span className="absolute top-3 right-3 rounded-full bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 text-[8px] font-black text-amber-700 dark:text-amber-400 tracking-wider uppercase">
                          AI BEST MATCH
                        </span>
                        <h4 className="font-sans text-xs font-black text-slate-900 dark:text-white line-clamp-1 mt-1 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-405">
                          {course.title}
                        </h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 line-clamp-2 mt-1 min-h-[30px] leading-relaxed">
                          {course.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                          <span>{course.category} {course.isAcademicInstructor ? "• Academic" : "• Individual"}</span>
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-bold">
                            Let's Begin <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending courses section */}
              {trendingCourses.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-sans text-sm font-extrabold text-slate-900 dark:text-white">
                      {t.trendingCourses}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.trendingSub}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {trendingCourses.map((course) => (
                      <div
                        key={`trend-${course.id}`}
                        onClick={() => onSelectCourse(course.id)}
                        className="group relative flex flex-col rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/20 to-white dark:from-indigo-955/5 dark:to-slate-900 p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-850 shadow-2xs hover:shadow-sm cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                          <Flame className="h-3 w-3 text-orange-500 fill-orange-500" />
                          <span>1.4k+ students this week</span>
                        </div>
                        <h4 className="font-sans text-xs font-black text-slate-900 dark:text-white line-clamp-1 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-405">
                          {course.title}
                        </h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 line-clamp-2 mt-1 min-h-[30px] leading-relaxed">
                          {course.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                          <span>{course.category} {course.isAcademicInstructor ? "• Academic" : "• Individual"}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 font-bold">
                            {t.learnClass} <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Main List directory title */}
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-3">
            <p className="text-xs font-bold text-slate-450 dark:text-slate-400">
              {t.showingCourses.replace("{count}", filteredCourses.length.toString())}
            </p>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center py-20 px-6 max-w-lg mx-auto" id="results-empty">
              <AlertCircle className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">{t.noCoursesFound}</h3>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {t.noCoursesSub}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                }}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2" id="courses-grid">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course.id)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 shadow-2xs transition-all duration-350 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-150 dark:hover:border-indigo-900 cursor-pointer"
                  id={`course-card-${course.id}`}
                >
                  {/* Thumbnail Cover */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-50 dark:border-slate-805">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 bg-white/95 dark:bg-slate-905/95 backdrop-blur-xs px-3 py-1.5 text-[10px] font-bold text-slate-900 dark:text-slate-100 rounded-lg shadow-sm border border-slate-50 dark:border-slate-800">
                      {course.category}
                    </span>

                    {/* Bookmarking Star Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(course.id);
                      }}
                      className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 dark:bg-slate-905/95 backdrop-blur-xs shadow-md border border-slate-50 dark:border-slate-800 transition-all text-slate-550 hover:text-amber-500 hover:scale-110 active:scale-95 cursor-pointer"
                      title="Bookmark Favorite Course"
                    >
                      <Bookmark 
                        className={`h-4 w-4 transition-colors ${
                          bookmarkedCourseIds.includes(course.id) 
                            ? "fill-amber-400 text-amber-505" 
                            : "text-slate-400 hover:text-amber-500"
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-3.5 mb-3.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
                        course.difficulty === "Beginner" 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 ring-emerald-600/10 dark:ring-emerald-500/20"
                          : course.difficulty === "Intermediate"
                          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 ring-blue-600/10 dark:ring-blue-500/20"
                          : "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 ring-purple-600/10 dark:ring-purple-500/20"
                      }`}>
                        {course.difficulty}
                      </span>
                      <span className="flex items-center text-[10px] font-semibold text-slate-450 dark:text-slate-400 gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {course.duration}
                      </span>
                    </div>

                    <h4 className="font-sans text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
                      {course.title}
                    </h4>
                    
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {course.description}
                    </p>

                    {/* Footer Row */}
                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(course.authorName)}`} 
                          className="h-6 w-6 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800"
                          alt="instructor"
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{course.authorName}</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                        {t.learnClass}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
