import React, { useState, useEffect, useRef } from "react";
import { 
  Play, BookOpen, CheckCircle, Download, BookMarked, 
  MessageSquare, User, ArrowLeft, ArrowRight, PlayCircle, Lock, Trophy, NotebookTabs,
  Clock, Sparkles, AlertTriangle, Code2, XCircle, RotateCcw, Award, Maximize, Minimize
} from "lucide-react";
import { Course, CourseModule, VideoLesson, Comment, ProgressTracking } from "../types.js";

interface CourseLearnProps {
  courseId: string;
  course: Course;
  modules: CourseModule[];
  lessons: VideoLesson[];
  quizzes: any[];
  currentUser: any;
  onOpenAuth: () => void;
  token: string | null;
  onBack: () => void;
  onAttemptQuiz: (quizId: string) => void;
  onPracticeCode: (sourceCode: string) => void;
  onAddNotification: (title: string, message: string) => void;
}

export default function CourseLearn({
  courseId,
  course,
  modules,
  lessons,
  quizzes,
  currentUser,
  onOpenAuth,
  token,
  onBack,
  onAttemptQuiz,
  onPracticeCode,
  onAddNotification
}: CourseLearnProps) {
  const [selectedLesson, setSelectedLesson] = useState<VideoLesson | null>(null);

  // Video Player & Fullscreen/Watch Progress Refs & States
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const html5VideoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const lastSavedTimeRef = useRef<number>(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResumeIndicator, setShowResumeIndicator] = useState(false);
  const [resumedPosition, setResumedPosition] = useState(0);
  const [hasSeeked, setHasSeeked] = useState<{ [lessonId: string]: boolean }>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [progress, setProgress] = useState<ProgressTracking | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"discussion" | "notes" | "quizzes">("discussion");
  const [bookmarked, setBookmarked] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  // Quiz Player States
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizTakingQuiz, setQuizTakingQuiz] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: any }>({});
  const [quizFeedback, setQuizFeedback] = useState<any | null>(null);
  const [quizSecondsLeft, setQuizSecondsLeft] = useState<number | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const fetchCourseProgress = () => {
    if (courseId && token) {
      fetch(`/api/progress/${courseId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.progress) {
            setProgress(data.progress);
          }
        })
        .catch(err => console.error("Failed loading course lecture specifics", err));
    }
  };

  const handleLocalBeginQuiz = async (quizId: string) => {
    setQuizError(null);
    setQuizFeedback(null);
    setQuizAnswers({});
    const quizItem = quizzes.find(q => q.id === quizId);
    if (!quizItem) {
      setQuizError("Quiz configuration not found.");
      return;
    }
    setQuizTakingQuiz(quizItem);
    setActiveQuizId(quizId);
    
    try {
      const res = await fetch(`/api/quizzes/${quizId}/questions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQuizQuestions(data.questions || []);
        // Initialize default answers: e.g. code starter template or empty
        const defaults: { [qId: string]: any } = {};
        (data.questions || []).forEach((q: any) => {
          if (q.type === "coding") {
            defaults[q.id] = q.startingCode || "";
          } else {
            defaults[q.id] = "";
          }
        });
        setQuizAnswers(defaults);
        // Set seconds remaining
        const mins = Number(quizItem.durationMinutes) || 10;
        setQuizSecondsLeft(mins * 60);
      } else {
        setQuizError(data.error || "Failed to load quiz questions.");
      }
    } catch (err: any) {
      setQuizError(err.message || "Network Error");
    }
  };

  const handleForceSubmitQuiz = async () => {
    if (!activeQuizId) return;
    setIsSubmittingQuiz(true);
    setQuizError(null);
    try {
      const res = await fetch(`/api/quizzes/${activeQuizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          answers: quizAnswers
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuizFeedback(data);
        onAddNotification("Quiz Graded (Auto-Submitted)", `Time is up! Your score: ${data.score} / ${data.total}`);
        fetchCourseProgress();
      } else {
        setQuizError(data.error || "Time expired - failed auto-submission.");
      }
    } catch (err: any) {
      setQuizError(err.message || "Time expired - network submit failure");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleSubmitQuizAnswers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeQuizId) return;
    setIsSubmittingQuiz(true);
    setQuizError(null);
    try {
      const res = await fetch(`/api/quizzes/${activeQuizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          answers: quizAnswers
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuizFeedback(data);
        onAddNotification("Quiz Graded Successfully", `Answers graded! Score: ${data.score} out of ${data.total} possible points.`);
        fetchCourseProgress();
      } else {
        setQuizError(data.error || "Failed to submit answers.");
      }
    } catch (err: any) {
      setQuizError(err.message || "Network Error");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (quizSecondsLeft === null || quizSecondsLeft <= 0 || quizFeedback || !activeQuizId) return;
    const interval = setInterval(() => {
      setQuizSecondsLeft(p => {
        if (p !== null && p <= 1) {
          clearInterval(interval);
          handleForceSubmitQuiz();
          return 0;
        }
        return p !== null ? p - 1 : null;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizSecondsLeft, quizFeedback, activeQuizId, quizAnswers]);

  // Set initial selected lesson
  useEffect(() => {
    if (lessons.length > 0 && !selectedLesson) {
      setSelectedLesson(lessons[0]);
    }
  }, [lessons]);

  // Fetch progress and comments for this lesson
  useEffect(() => {
    if (courseId && token) {
      fetch(`/api/progress/${courseId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.progress) {
            setProgress(data.progress);
            // If there's a last watched lesson, set it
            if (data.progress.lastWatchedLessonId) {
              const matched = lessons.find(l => l.id === data.progress.lastWatchedLessonId);
              if (matched) setSelectedLesson(matched);
            }
          }
        })
        .catch(err => console.error("Failed to load progress tracking", err));
    }
  }, [courseId, token, lessons]);

  useEffect(() => {
    if (selectedLesson) {
      fetch(`/api/lessons/${selectedLesson.id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (data.comments) setComments(data.comments);
        })
        .catch(err => console.error("Failed to load comments", err));
    }
  }, [selectedLesson]);

  // Save to recently watched in localStorage
  useEffect(() => {
    if (selectedLesson && currentUser) {
      const key = `codecraft_recently_watched_${currentUser.id}`;
      try {
        const existing = localStorage.getItem(key);
        let list = existing ? JSON.parse(existing) : [];
        // Avoid duplicate lesson ids
        list = list.filter((item: any) => item.lessonId !== selectedLesson.id);
        list.unshift({
          lessonId: selectedLesson.id,
          lessonTitle: selectedLesson.title,
          courseId: courseId,
          courseTitle: course.title,
          duration: selectedLesson.duration,
          watchedAt: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(list.slice(0, 6)));
      } catch (err) {
        console.error("Failed to persist watched lesson log", err);
      }
    }
  }, [selectedLesson, currentUser, courseId, course.title]);

  // Save position to server
  const savePositionToServer = async (lessonId: string, seconds: number) => {
    if (!token || !courseId || !lessonId) return;
    try {
      const res = await fetch(`/api/progress/${courseId}/position`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ lessonId, position: Math.floor(seconds) })
      });
      const data = await res.json();
      if (res.ok && data.progress) {
        setProgress(data.progress);
      }
    } catch (err) {
      console.error("Failed to auto-save watch position", err);
    }
  };

  // Helper formatting seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Handle HTML5 Video event listeners
  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const curTime = video.currentTime;
    if (Math.abs(curTime - lastSavedTimeRef.current) >= 4) {
      lastSavedTimeRef.current = curTime;
      if (selectedLesson) {
        savePositionToServer(selectedLesson.id, curTime);
      }
    }
  };

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (selectedLesson && progress) {
      const savedProg = progress.watchPositions?.[selectedLesson.id] || 0;
      if (savedProg > 0 && !hasSeeked[selectedLesson.id]) {
        video.currentTime = savedProg;
        setResumedPosition(savedProg);
        setShowResumeIndicator(true);
        setHasSeeked(prev => ({ ...prev, [selectedLesson.id]: true }));
        setTimeout(() => {
          setShowResumeIndicator(false);
        }, 4500);
      }
    }
  };

  const handleVideoEnded = () => {
    if (selectedLesson && token && courseId) {
      if (!progress?.completedLessonIds.includes(selectedLesson.id)) {
        handleToggleComplete(selectedLesson.id);
      }
    }
  };

  // Reset watch position tracking on lesson switch
  useEffect(() => {
    if (selectedLesson) {
      lastSavedTimeRef.current = 0;
    }
  }, [selectedLesson?.id]);

  // Handle YouTube Iframe Player generation and seek hook
  useEffect(() => {
    if (!selectedLesson || !selectedLesson.youtubeId) return;

    // Load YouTube API script if not loaded
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let isDestroyed = false;

    const initYTPlayer = () => {
      if (isDestroyed) return;
      
      // Clear any existing player
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying player:", e);
        }
        playerRef.current = null;
      }

      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div id="yt-player-element" class="absolute inset-0 h-full w-full"></div>';
        }

        playerRef.current = new (window as any).YT.Player("yt-player-element", {
          videoId: selectedLesson.youtubeId,
          playerVars: {
            autoplay: 0,
            rel: 0,
            controls: 1,
            modestbranding: 1,
            showinfo: 0,
            fs: 1 // Fullscreen support enabled
          },
          events: {
            onReady: (event: any) => {
              // Attempt to seek to saved position
              if (selectedLesson && progress) {
                const savedProg = progress.watchPositions?.[selectedLesson.id] || 0;
                if (savedProg > 0 && !hasSeeked[selectedLesson.id]) {
                  event.target.seekTo(savedProg, true);
                  setResumedPosition(savedProg);
                  setShowResumeIndicator(true);
                  setHasSeeked(prev => ({ ...prev, [selectedLesson.id]: true }));
                  setTimeout(() => {
                    setShowResumeIndicator(false);
                  }, 4500);
                }
              }
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                if (selectedLesson && !progress?.completedLessonIds.includes(selectedLesson.id)) {
                  handleToggleComplete(selectedLesson.id);
                }
              }
            }
          }
        });
      } catch (err) {
        console.error("Failed to construct YT player", err);
      }
    };

    const checkAndInit = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        initYTPlayer();
      } else {
        const checkInterval = setInterval(() => {
          if ((window as any).YT && (window as any).YT.Player) {
            clearInterval(checkInterval);
            initYTPlayer();
          }
        }, 150);
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 5000);
      }
    };

    checkAndInit();

    return () => {
      isDestroyed = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [selectedLesson?.id]);

  // Separate effect to handle seeking YouTube player if progress was fetched late
  useEffect(() => {
    if (selectedLesson && selectedLesson.youtubeId && progress) {
      const savedProg = progress.watchPositions?.[selectedLesson.id] || 0;
      if (savedProg > 0 && !hasSeeked[selectedLesson.id]) {
        if (playerRef.current && typeof playerRef.current.seekTo === "function") {
          try {
            playerRef.current.seekTo(savedProg, true);
            setResumedPosition(savedProg);
            setShowResumeIndicator(true);
            setHasSeeked(prev => ({ ...prev, [selectedLesson.id]: true }));
            setTimeout(() => {
              setShowResumeIndicator(false);
            }, 4500);
          } catch (e) {
            // Player is not completely ready, will retry on next render or event
          }
        }
      }
    }
  }, [selectedLesson?.id, progress, hasSeeked]);

  // YouTube auto-save watchdog checker
  useEffect(() => {
    let timer: any = null;
    if (selectedLesson && selectedLesson.youtubeId) {
      timer = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function" && typeof playerRef.current.getPlayerState === "function") {
          try {
            const state = playerRef.current.getPlayerState();
            if (state === 1) { // 1 means PLAYING
              const curTime = playerRef.current.getCurrentTime();
              if (Math.abs(curTime - lastSavedTimeRef.current) >= 4) {
                lastSavedTimeRef.current = curTime;
                savePositionToServer(selectedLesson.id, curTime);
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedLesson?.id]);

  // Monitor browser fullscreen event to maintain sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => {
          console.error("Error enabling fullscreen", err);
        });
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => {
          console.error("Error exiting fullscreen", err);
        });
    }
  };

  const handleToggleComplete = async (lessonId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await fetch(`/api/progress/${courseId}/toggle`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ lessonId })
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(data.progress);
        onAddNotification(
          "Progress updated", 
          `Registered checklist completion for lesson "${selectedLesson?.title}"`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newCommentText.trim() || !selectedLesson) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: newCommentText })
      });
      const data = await res.json();
      if (res.ok) {
        setComments([data.comment, ...comments]);
        setNewCommentText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleSendReport = async (commentId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        onAddNotification("Report Submitted", "Your complaint has been forwarded to the Platform Directorate.");
        setReportingCommentId(null);
        setReportReason("");
      } else {
        const d = await res.json();
        onAddNotification("Error", d.error || "Unable to submit report");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setBookmarked(!bookmarked);
    onAddNotification(
      bookmarked ? "Bookmark removed" : "Bookmark saved",
      bookmarked 
        ? `Removed lesson "${selectedLesson?.title}" from bookmarks`
        : `Saved lesson "${selectedLesson?.title}" to bookmarks`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="course-learn-workspace">
      
      {/* Return button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          id="back-to-browse-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course Catalogue
        </button>
      </div>

      {/* Main Study Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Side: Video Player, Title, Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedLesson ? (
            <div className="space-y-5" id="video-workspace">
              {/* YouTube Iframe Embed Wrapper or HTML5 Video fall-through */}
              <div 
                ref={playerContainerRef} 
                className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg border border-slate-900 group"
              >
                {/* Resume Position Toast */}
                {showResumeIndicator && resumedPosition > 0 && (
                  <div className="absolute top-4 left-4 right-4 z-10 bg-slate-900/95 text-white px-4 py-2.5 rounded-lg border border-indigo-500/30 backdrop-blur-xs flex items-center justify-between shadow-lg text-xs leading-none transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <Play className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
                      <span>
                        Resumed watch position: <strong>{formatTime(resumedPosition)}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedLesson.id) {
                          if (selectedLesson.youtubeId && playerRef.current && typeof playerRef.current.seekTo === "function") {
                            playerRef.current.seekTo(0, true);
                          } else if (html5VideoRef.current) {
                            html5VideoRef.current.currentTime = 0;
                          }
                          setShowResumeIndicator(false);
                          savePositionToServer(selectedLesson.id, 0);
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[10px] font-bold text-white transition cursor-pointer"
                    >
                      Start Over
                    </button>
                  </div>
                )}

                {/* Main player elements */}
                {selectedLesson.youtubeId ? (
                  <div ref={containerRef} className="absolute inset-0 h-full w-full">
                    <div id="yt-player-element" className="absolute inset-0 h-full w-full"></div>
                  </div>
                ) : (
                  <video
                    ref={html5VideoRef}
                    src={selectedLesson.videoUrl}
                    controls
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onEnded={handleVideoEnded}
                    className="absolute inset-0 h-full w-full border-0 bg-black object-contain"
                  />
                )}

                {/* Custom Fullscreen Trigger Overlay for Premium Look */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="absolute bottom-4 right-4 z-10 p-2 rounded-lg bg-slate-900/80 text-white border border-slate-700/50 hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>

              {/* Sequential Navigation Control Bar */}
              {(() => {
                const currentLessonIndex = lessons.findIndex(l => l.id === selectedLesson.id);
                const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
                const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

                return (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl p-3 shadow-xs">
                    <button 
                      type="button"
                      onClick={() => {
                        if (prevLesson) {
                          setSelectedLesson(prevLesson);
                        }
                      }}
                      disabled={!prevLesson}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-45 disabled:hover:bg-white disabled:hover:text-slate-700 transition cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Prev Lesson
                    </button>
                    
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Lesson {currentLessonIndex + 1} of {lessons.length}
                    </span>

                    <button 
                      type="button"
                      onClick={() => {
                        if (nextLesson) {
                          setSelectedLesson(nextLesson);
                        }
                      }}
                      disabled={!nextLesson}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                    >
                      Next Lesson
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })()}

              {/* Lesson Controls & Info */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5">
                <div>
                  <span className="font-mono text-[9px] font-extrabold tracking-widest text-indigo-600 uppercase">
                    Lesson Reference: {selectedLesson.id}
                  </span>
                  <h2 className="font-sans text-xl font-extrabold text-slate-900 mt-1">
                    {selectedLesson.title}
                  </h2>
                  <p className="text-xs text-slate-450 mt-1.5 font-medium">
                    Syllabus Handout Unit • Lecture Duration: {selectedLesson.duration}
                  </p>
                </div>

                {/* Actions / Complete Checklist / practice */}
                <div className="flex items-center gap-2.5 shrink-0">
                  
                  {/* Bookmark Button */}
                  <button
                    onClick={handleToggleBookmark}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                      bookmarked 
                        ? "bg-amber-50 border-amber-200 text-amber-600 shadow-xs" 
                        : "border-slate-150 text-slate-500 hover:bg-slate-50"
                    }`}
                    title="Bookmark Lesson"
                  >
                    <BookMarked className="h-4.5 w-4.5" />
                  </button>

                  {/* Mark complete checkbox */}
                  <button
                    onClick={() => handleToggleComplete(selectedLesson.id)}
                    className={`inline-flex h-10 items-center gap-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                      progress?.completedLessonIds.includes(selectedLesson.id)
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs"
                        : "border-slate-150 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle className={`h-4.5 w-4.5 ${
                      progress?.completedLessonIds.includes(selectedLesson.id) ? "fill-emerald-600 text-white stroke-[1.5]" : ""
                    }`} />
                    {progress?.completedLessonIds.includes(selectedLesson.id) ? "Completed" : "Mark Complete"}
                  </button>

                  {/* SandBox link if sourceCode is present */}
                  {selectedLesson.sourceCode && (
                    <button
                      onClick={() => onPracticeCode(selectedLesson.sourceCode || "")}
                      className="inline-flex h-10 items-center gap-2 px-4 rounded-xl bg-slate-900 border border-transparent text-xs font-bold text-white hover:bg-slate-800 transition shadow-md shadow-slate-100"
                    >
                      Practice in Sandbox
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="border border-slate-100 bg-white p-16 text-center rounded-2xl">
              <Play className="mx-auto h-12 w-12 text-indigo-100 animate-pulse" />
              <p className="mt-3 text-xs text-slate-450 font-bold font-mono">Initializing course syllabus tracks...</p>
            </div>
          )}

          {/* Tab Selection Row */}
          <div className="border-b border-slate-150">
            <nav className="flex space-x-6" aria-label="Tabs" id="lesson-tab-navbar">
              <button
                onClick={() => setActiveTab("discussion")}
                className={`border-b-2 py-3 px-1 text-xs font-extrabold transition-all ${
                  activeTab === "discussion"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:border-slate-350 hover:text-slate-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Cohort Discussion ({comments.length})
                </span>
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`border-b-2 py-3 px-1 text-xs font-extrabold transition-all ${
                  activeTab === "notes"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:border-slate-350 hover:text-slate-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <NotebookTabs className="h-4 w-4" />
                  Notes & Downloads
                </span>
              </button>

              <button
                onClick={() => setActiveTab("quizzes")}
                className={`border-b-2 py-3 px-1 text-xs font-extrabold transition-all ${
                  activeTab === "quizzes"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:border-slate-350 hover:text-slate-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Coding Quizzes ({quizzes.length})
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Contents */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs" id="lesson-tabs-container">
            
            {activeTab === "discussion" && (
              <div className="space-y-5" id="discussion-tab-content">
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">Lesson Forum</h3>
                
                {/* Forum Form Input */}
                <form onSubmit={handlePostComment} className="flex gap-3">
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={currentUser ? "Post code notes, bugs, or reviews..." : "Please log in to join lesson discussions."}
                      disabled={!currentUser}
                      className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={commentLoading || !currentUser || !newCommentText.trim()}
                    className="self-end inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition"
                  >
                    Comment
                  </button>
                </form>

                {/* Comment Lists */}
                <div className="space-y-4 pt-2">
                  {comments.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">Be the first to publish observations or questions for this lecture.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 items-start border-b border-slate-50 pb-3" id={`comment-${comment.id}`}>
                        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs shrink-0 uppercase">
                          {comment.userName.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{comment.userName}</span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500">
                              {comment.userRole}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-sans">{comment.text}</p>
                          
                          {/* Inline Report Controls */}
                          {reportingCommentId === comment.id ? (
                            <div className="mt-2 rounded-lg bg-rose-50/50 border border-rose-100 p-2.5 max-w-md">
                              <label className="block text-[9px] font-extrabold uppercase text-rose-800 tracking-wider">Reason for report</label>
                              <input
                                type="text"
                                placeholder="Explain why this content needs review..."
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                className="mt-1 w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                              />
                              <div className="mt-2 flex gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReportingCommentId(null);
                                    setReportReason("");
                                  }}
                                  className="rounded px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendReport(comment.id)}
                                  disabled={!reportReason.trim()}
                                  className="rounded px-2.5 py-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition cursor-pointer"
                                >
                                  Submit Report
                                </button>
                              </div>
                            </div>
                          ) : (
                            currentUser && currentUser.id !== comment.userId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReportingCommentId(comment.id);
                                  setReportReason("");
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer transition mt-1 bg-transparent border-0"
                                id={`report-btn-${comment.id}`}
                              >
                                🚩 Report Comment
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4" id="notes-tab-content">
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">Lesson References</h3>
                
                {selectedLesson?.notesName ? (
                  <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-indigo-200 text-indigo-600 font-mono text-[10px] font-bold">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{selectedLesson.notesName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Academic Revision Handbook and Setup Keys</p>
                      </div>
                    </div>
                    
                    <a
                      href={selectedLesson.notesUrl || "#"}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      id="download-lesson-notes-link"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">No PDF textbooks published for this module file.</p>
                )}

                {/* Source Code Section */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Practice Material Output Snippet</h4>
                  {selectedLesson?.sourceCode ? (
                    <div className="rounded-lg border border-slate-100 bg-slate-950 p-4 font-mono text-[11px] text-slate-300">
                      <pre className="overflow-x-auto whitespace-pre-wrap">{selectedLesson.sourceCode}</pre>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold italic">This lesson relies entirely on visual slideshows.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "quizzes" && (
              <div className="space-y-4" id="quizzes-tab-content">
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">Auto-Graded Quizzes</h3>
                
                {quizzes.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No evaluations published for this catalog chapter.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {quizzes.map((q) => {
                      const completed = progress?.quizAttempts[q.id];
                      return (
                        <div key={q.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0" id={`quiz-item-${q.id}`}>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{q.title}</p>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Duration Allowed: {q.durationMinutes} mins • MCQ Grading
                            </span>
                          </div>

                          <div>
                            {completed ? (
                              <div className="text-right flex items-center gap-3">
                                <div>
                                  <span className="inline-flex gap-1.5 items-center text-xs font-bold text-emerald-600">
                                    Grade: {completed.score} / {completed.total}
                                  </span>
                                  <p className="text-[9px] text-slate-400 mt-0.5">Attempted successfully</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!currentUser) onOpenAuth();
                                    else handleLocalBeginQuiz(q.id);
                                  }}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer transition"
                                  title="Retake Quiz & Check Analytics"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!currentUser) onOpenAuth();
                                  else handleLocalBeginQuiz(q.id);
                                }}
                                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                              >
                                Begin Test
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Modules Panel & Playlists style navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm" id="playlist-nav-box">
            <h3 className="font-sans text-[11px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-3.5 mb-4">
              Course Syllabus
            </h3>

            {/* Custom module expansion structure */}
            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1" id="syllabus-modules">
              {modules.map((mod) => {
                const modLessons = lessons.filter(l => l.moduleId === mod.id).sort((a,b) => a.orderIndex - b.orderIndex);
                return (
                  <div key={mod.id} className="space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Mod {mod.orderIndex}: {mod.title}
                    </p>
                    <div className="space-y-1.5">
                      {modLessons.map((les) => {
                        const isCurrent = selectedLesson?.id === les.id;
                        const complete = progress?.completedLessonIds.includes(les.id);
                        return (
                          <div
                            key={les.id}
                            onClick={() => setSelectedLesson(les)}
                            className={`flex items-center justify-between rounded-xl p-3 text-xs cursor-pointer transition-all duration-200 border ${
                              isCurrent 
                                ? "bg-indigo-650 border-indigo-600 text-white font-semibold shadow-xs" 
                                : "text-slate-700 bg-slate-50/70 border-slate-50 hover:bg-slate-100/80 hover:border-slate-100"
                            }`}
                            id={`syllabus-lesson-${les.id}`}
                          >
                            <span className="flex items-center gap-2.5 truncate pr-2">
                              <PlayCircle className={`h-4.5 w-4.5 shrink-0 ${isCurrent ? "text-white" : "text-indigo-500"}`} />
                              <span className="truncate font-semibold">{les.title}</span>
                            </span>

                            {complete && (
                              <CheckCircle className={`h-4 w-4 shrink-0 ${isCurrent ? "text-indigo-200" : "text-emerald-500 fill-emerald-100"}`} />
                            )}
                          </div>
                        );
                      })}
                      {modLessons.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic pl-6">No lectures uploaded yet.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* SMART DYNAMIC QUIZ PLAYER MODAL OVERLAY */}
      {activeQuizId && quizTakingQuiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-xs flex items-center justify-center p-4" id="quiz-immersive-player">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header segment */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block leading-none mb-1">Interactive Quiz Evaluation</span>
                <h2 className="text-sm font-extrabold text-white leading-tight">{quizTakingQuiz.title}</h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Visual countdown ticking timer */}
                {quizSecondsLeft !== null && !quizFeedback && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 bg-slate-800 border rounded-lg text-xs font-mono font-bold leading-none ${
                    quizSecondsLeft < 60 ? "text-red-400 border-red-500/50 animate-pulse" : "text-amber-400 border-amber-500/30"
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {`${String(Math.floor(quizSecondsLeft / 60)).padStart(2, "0")}:${String(quizSecondsLeft % 60).padStart(2, "0")}`}
                    </span>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to exit the quiz? Any unsaved progress will be discarded.")) {
                      setActiveQuizId(null);
                      setQuizTakingQuiz(null);
                      setQuizFeedback(null);
                      setQuizSecondsLeft(null);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Negative marking warning header */}
            {quizTakingQuiz.negativeMarking && !quizFeedback && (
              <div className="bg-rose-50 border-b border-rose-100 px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-rose-700 uppercase shrink-0">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Negative Marking is Active: -{quizTakingQuiz.negativeMarkValue || 0.25} pts per incorrect; +1.00 per correct answer. Passed answers get 0.</span>
              </div>
            )}

            {/* Main scrollable workspace */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
              
              {/* Load error state */}
              {quizError && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>{quizError}</span>
                </div>
              )}

              {/* Loader placeholder */}
              {quizQuestions.length === 0 && !quizError && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing Sandbox Environment...</p>
                </div>
              )}

              {/* ACTIVE TAKING SCREEN */}
              {quizQuestions.length > 0 && !quizFeedback && (
                <form onSubmit={handleSubmitQuizAnswers} className="space-y-6" id="immersive-quiz-form">
                  {quizQuestions.map((q, idx) => {
                    const type = q.type || "mcq";
                    const isCoding = type === "coding";
                    const isTF = type === "tf";
                    const isFITB = type === "fitb";

                    return (
                      <div key={q.id} className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Question {idx + 1} of {quizQuestions.length}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase font-bold tracking-wider">{type === "tf" ? "True/False" : type === "fitb" ? "Fill Blank" : type}</span>
                        </div>

                        <p className="text-xs font-bold text-slate-900 leading-relaxed font-sans">{q.questionText}</p>

                        {/* MCQ SELECT CONTAINER */}
                        {type === "mcq" && q.options && (
                          <div className="grid grid-cols-1 gap-2.5">
                            {q.options.map((optionText: string, oIdx: number) => {
                              const isSelected = quizAnswers[q.id] === oIdx;
                              return (
                                <button
                                  type="button"
                                  key={oIdx}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                                  className={`w-full text-left rounded-xl p-3.5 text-xs font-semibold border flex items-center gap-3 transition-all ${
                                    isSelected
                                      ? "bg-indigo-50/75 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/15"
                                      : "bg-white border-slate-200 text-slate-705 hover:bg-slate-50 hover:border-slate-300"
                                  }`}
                                >
                                  <span className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border transition ${
                                    isSelected
                                      ? "bg-indigo-650 text-white border-indigo-600"
                                      : "bg-slate-50 text-slate-400 border-slate-200"
                                  }`}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{optionText}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* TRUE FALSE OPTION CONTAINER */}
                        {isTF && (
                          <div className="grid grid-cols-2 gap-3">
                            {["True", "False"].map((tfValue, oIdx) => {
                              const isSelected = quizAnswers[q.id] === oIdx;
                              return (
                                <button
                                  type="button"
                                  key={tfValue}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                                  className={`rounded-xl p-4 text-xs font-bold border flex flex-col items-center justify-center gap-2 transition-all ${
                                    isSelected
                                      ? "bg-indigo-50/75 border-indigo-550 text-indigo-900 ring-2 ring-indigo-500/15"
                                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                  }`}
                                >
                                  <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-[9px] ${
                                    isSelected ? "bg-indigo-600 text-white border-indigo-650" : "bg-slate-50 border-slate-200"
                                  }`}>
                                    ✓
                                  </span>
                                  <span>{tfValue}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* FILL IN THE BLANK INPUT FIELD */}
                        {isFITB && (
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Write absolute matching string</label>
                            <input
                              type="text"
                              value={quizAnswers[q.id] || ""}
                              onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                              placeholder="e.g. encapsulation"
                              className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 p-3.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-hidden transition"
                            />
                          </div>
                        )}

                        {/* CODING MINI-IDE CONTAINER */}
                        {isCoding && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] bg-slate-100 p-2 rounded-lg border border-slate-200 font-mono">
                              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                                <Code2 className="h-3.5 w-3.5 text-indigo-650" />
                                Interactive Code Sandbox ({q.language || "javascript"})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Reset editor prompt to boilerplate starter template?")) {
                                    setQuizAnswers({ ...quizAnswers, [q.id]: q.startingCode || "" });
                                  }
                                }}
                                className="text-indigo-600 hover:text-indigo-800 bg-white font-bold border border-slate-200 px-2 py-0.5 rounded cursor-pointer transition"
                              >
                                Reset Template
                              </button>
                            </div>

                            <textarea
                              rows={8}
                              value={quizAnswers[q.id] === undefined ? (q.startingCode || "") : quizAnswers[q.id]}
                              onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-indigo-200 focus:outline-hidden focus:border-indigo-500 shadow-inner"
                              placeholder="// write your function code here"
                            />
                            
                            <p className="text-[10px] text-slate-400 leading-normal bg-amber-50 border border-amber-100/50 p-2.5 rounded-lg font-semibold">
                              💡 <strong>Format Tip:</strong> Make sure you define your function as an entrypoint (e.g. <code>function solution()</code> or <code>function main()</code>). The sandbox evaluates these function blocks with custom test-case arguments automatically!
                            </p>

                            {q.testCases && q.testCases.length > 0 && (
                              <div className="space-y-1">
                                <span className="block text-[9px] font-extrabold uppercase text-slate-450 tracking-wider">Evaluation Assertions Required</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-20 overflow-y-auto">
                                  {q.testCases.map((tc: any, tcIdx: number) => (
                                    <div key={tcIdx} className="text-[9px] font-mono border border-slate-100 bg-slate-50 p-1.5 rounded flex justify-between font-semibold">
                                      <span>Input args: <strong className="text-amber-800">{tc.input}</strong></span>
                                      <span>Output constraint: <strong className="text-emerald-700">{tc.expectedOutput}</strong></span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-[9px] italic text-slate-400 font-medium">Auto-graded on submission block.</p>
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingQuiz}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:shadow-indigo-500/20 transition cursor-pointer flex items-center gap-2 disabled:bg-slate-350"
                    >
                      {isSubmittingQuiz ? (
                        <>
                          <div className="h-3.5 w-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                          <span>Grading Submissions...</span>
                        </>
                      ) : (
                        <>
                          🚀 Publish Final Answers for Auto-Grading
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* GRADED DETAILED PERFORMANCE ANALYTICS SCREEN */}
              {quizQuestions.length > 0 && quizFeedback && (
                <div className="space-y-6" id="quiz-performance-analytics">
                  
                  {/* Hero score panel */}
                  <div className="rounded-2xl bg-indigo-900 p-6 text-white text-center space-y-4 shadow-lg border border-indigo-805 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-12 bg-indigo-700/20 rounded-full h-40 w-40" />
                    
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                      <Trophy className="h-6 w-6 stroke-2" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Score Rating Compiled</span>
                      <p className="text-3xl font-black mt-1 leading-none">{quizFeedback.score} <span className="text-xs text-indigo-300 font-semibold">out of {quizFeedback.total}</span></p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-indigo-800 pt-4 text-xs font-semibold text-indigo-200">
                      <div className="border-r border-indigo-800">
                        <span className="block text-[10px] uppercase font-bold text-slate-200">Correct</span>
                        <strong className="text-emerald-400 block text-sm font-bold mt-0.5">{quizFeedback.correctCount || 0}</strong>
                      </div>
                      <div className="border-r border-indigo-800">
                        <span className="block text-[10px] uppercase font-bold text-slate-200">Incorrect</span>
                        <strong className="text-red-400 block text-sm font-bold mt-0.5">{quizFeedback.incorrectCount || 0}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-200">Skipped</span>
                        <strong className="text-slate-350 block text-sm font-bold mt-0.5">{quizFeedback.skippedCount || 0}</strong>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[11px] text-indigo-200 leading-normal italic">
                        {quizFeedback.score >= (quizFeedback.total * 0.7) 
                          ? "🎉 Excellent job! You represent the upper quartile class average."
                          : "📚 Keep practicing! Re-read the source snippets and notes docs to improve your core score."}
                      </p>
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                      Detailed Solutions & Explanation Feedbacks
                    </h3>
                  </div>

                  {/* Question solutions list */}
                  <div className="space-y-4">
                    {quizFeedback.feedback && quizFeedback.feedback.map((item: any, fIdx: number) => {
                      const isCorrect = item.isCorrect === true;
                      return (
                        <div key={fIdx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-mono text-slate-500 font-bold">Question #{fIdx + 1} ({item.type || "mcq"})</span>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                                <CheckCircle className="h-3 w-3 fill-emerald-100" /> Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase">
                                <XCircle className="h-3 w-3" /> Incorrect
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-bold text-slate-900 leading-relaxed font-sans">{item.questionText}</p>

                          {/* Your choice feedback vs original indices */}
                          <div className="text-xs p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                            {item.type === "coding" ? (
                              <div className="space-y-2">
                                <div>
                                  <span className="block text-[9px] font-bold uppercase text-slate-400">Your Submitted Snippet</span>
                                  <pre className="mt-1 p-2 bg-slate-950 font-mono text-[10px] text-emerald-400 rounded max-h-32 overflow-auto whitespace-pre">
                                    {item.selectedAnswer || "[No Response Captured]"}
                                  </pre>
                                </div>

                                {item.testResults && item.testResults.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="block text-[9px] font-bold uppercase text-slate-400">Sandbox Compile results:</span>
                                    <div className="space-y-1">
                                      {item.testResults.map((tcRes: any, tcIdx: number) => (
                                        <div key={tcIdx} className="text-[9px] font-mono p-1 rounded bg-white border border-slate-200 flex justify-between items-center">
                                          <span className="text-slate-650 pr-4">Args: <strong>{tcRes.input}</strong></span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Got: <strong className="text-slate-700">{tcRes.actual}</strong></span>
                                            <span className={`px-1 rounded text-[8px] font-bold uppercase ${
                                              tcRes.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                            }`}>
                                              {tcRes.passed ? "PASS" : "FAIL"}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-semibold">
                                <div>
                                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Your Candidate Reply</span>
                                  <span className={`mt-0.5 inline-block ${isCorrect ? "text-emerald-700" : "text-rose-700 font-bold"}`}>
                                    {item.actualAnswerFeedback || "[Skipped or Empty Answer]"}
                                  </span>
                                </div>
                                
                                {item.type === "fitb" ? (
                                  <div>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase font-sans">Matching Key-Answer Required</span>
                                    <strong className="text-emerald-700">{item.correctAnswerText}</strong>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase font-sans">Correct Target Index Choice</span>
                                    <span className="text-indigo-700">Option #{Number(item.correctIndex) + 1}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Solution Explanation Box */}
                          {item.explanation && (
                            <div className="rounded-lg bg-indigo-50/30 p-3.5 border border-indigo-100/60 text-[11px] leading-relaxed text-indigo-900">
                              <span className="font-extrabold flex items-center gap-1 text-[11px] text-indigo-950 mb-0.5 font-sans">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-650 animate-pulse" />
                                Solution Explanation Details:
                              </span>
                              <p className="font-medium text-slate-650">{item.explanation}</p>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 shrink-0 bg-white">
                    <button
                      type="button"
                      onClick={() => handleLocalBeginQuiz(activeQuizId)}
                      className="rounded-xl border border-slate-350 bg-white text-slate-700 px-5 py-2.5 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                    >
                      🔄 Retake / Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuizId(null);
                        setQuizTakingQuiz(null);
                        setQuizFeedback(null);
                        setQuizSecondsLeft(null);
                      }}
                      className="rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      Close Report Card
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
