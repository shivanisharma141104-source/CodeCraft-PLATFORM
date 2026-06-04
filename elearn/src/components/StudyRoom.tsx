import React, { useState, useEffect } from "react";
import { Download, FileText, Search, Library, Sparkles, Bookmark } from "lucide-react";
import { StudyNote } from "../types.js";

const CATEGORIES = ["All", "Python", "Java", "JavaScript", "C++", "React.js", "Node.js", "Database & SQL", "Data Structures & Algorithms"];

interface StudyRoomProps {
  onAddNotification: (title: string, message: string) => void;
  currentUser: any;
  onOpenAuth: () => void;
}

export default function StudyRoom({ onAddNotification, currentUser, onOpenAuth }: StudyRoomProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  const [savedNoteIds, setSavedNoteIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser) {
      const key = `codecraft_saved_notes_${currentUser.id}`;
      const existing = localStorage.getItem(key);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          setSavedNoteIds(parsed.map((item: any) => item.id));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setSavedNoteIds([]);
    }
  }, [currentUser]);

  const isNoteSaved = (noteId: string) => savedNoteIds.includes(noteId);

  const handleToggleSaveNote = (note: StudyNote) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const key = `codecraft_saved_notes_${currentUser.id}`;
    const existing = localStorage.getItem(key);
    let list = existing ? JSON.parse(existing) : [];
    
    const isSaved = list.some((item: any) => item.id === note.id);
    if (isSaved) {
      list = list.filter((item: any) => item.id !== note.id);
      onAddNotification("Note Removed", `Removed "${note.title}" from your saved notes.`);
    } else {
      list.push({
        id: note.id,
        title: note.title,
        category: note.category,
        content: note.content,
        fileName: note.fileName,
        fileUrl: note.fileUrl,
        savedAt: new Date().toISOString()
      });
      onAddNotification("Note Saved", `Saved "${note.title}" to your student dashboard.`);
    }
    localStorage.setItem(key, JSON.stringify(list));
    setSavedNoteIds(list.map((item: any) => item.id));
  };

  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (data.notes) {
          setNotes(data.notes);
          if (data.notes.length > 0) {
            setSelectedNote(data.notes[0]);
          }
        }
      })
      .catch((err) => console.error("Failed to load generic study notes", err));
  }, []);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === "All" || n.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleDownloadNote = (note: StudyNote) => {
    onAddNotification(
      "Download Started",
      `Initiated download for CodeCraft syntax cheatsheet "${note.fileName}"`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="study-room-workspace">
      
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="font-sans text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
          Study Handouts & Chemistry-Matched Cheat Sheets
        </h2>
        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1.5 font-medium">
          Download structured programming handouts, syntax blueprints, and reference crib sheets curated by Academic Leads.
        </p>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side: Navigation search and listings */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Search bar */}
          <div className="relative rounded-xl shadow-xs">
            <Search className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters or libraries..."
              className="w-full rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Quick Category filter button slider */}
          <div className="flex flex-wrap gap-2" id="notes-category-carousel">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-slate-950 dark:bg-slate-800 text-white shadow-xs" 
                    : "bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-705 text-slate-600 dark:text-slate-350 font-semibold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Note list cards */}
          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1" id="notes-listings">
            {filteredNotes.map((note) => {
              const active = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    active 
                      ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs" 
                      : "border-slate-100 dark:border-slate-808 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-850 hover:border-slate-200 dark:hover:border-slate-705"
                  }`}
                  id={`note-card-${note.id}`}
                >
                  <span className="font-mono text-[9px] font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                    {note.category}
                  </span>
                  <h4 className="mt-1.5 font-bold text-slate-900 dark:text-white leading-snug text-xs">{note.title}</h4>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      Revision Handout
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Open Handout</span>
                  </div>
                </div>
              );
            })}

            {filteredNotes.length === 0 && (
              <p className="text-center text-xs text-slate-450 dark:text-slate-500 py-10 italic">No notes match current search.</p>
            )}
          </div>

        </div>

        {/* Right Side: Markdown Previewer & Download exports */}
        <div className="lg:col-span-8">
          
          {selectedNote ? (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col h-full justify-between" id="note-preview-pane">
              
              <div className="space-y-5">
                {/* Actions banner */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <span className="font-mono text-[9px] font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                      CodeCraft Library • Category: {selectedNote.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mt-1">{selectedNote.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSaveNote(selectedNote)}
                      className={`inline-flex h-10 items-center gap-2 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isNoteSaved(selectedNote.id)
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Bookmark className={`h-4.5 w-4.5 ${isNoteSaved(selectedNote.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                      {isNoteSaved(selectedNote.id) ? "Saved" : "Save Note"}
                    </button>

                    <a
                      href={selectedNote.fileUrl}
                      onClick={() => handleDownloadNote(selectedNote)}
                      className="inline-flex h-10 items-center gap-2 px-4 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-100 dark:shadow-none transition-all cursor-pointer whitespace-nowrap"
                      id="download-note-attachment-anchor"
                    >
                      <Download className="h-4.5 w-4.5" />
                      Download PDF Notes
                    </a>
                  </div>
                </div>

                {/* Preformatted Notebook contents */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-6 font-mono text-xs text-slate-700 dark:text-indigo-200/80 leading-relaxed overflow-y-auto max-h-[350px]">
                  <pre className="whitespace-pre-wrap font-sans font-medium text-slate-650 dark:text-slate-350">{selectedNote.content}</pre>
                </div>
              </div>

              {/* Revision tips */}
              <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-5 flex gap-4 text-slate-500 dark:text-slate-400 items-start">
                <div className="rounded-lg bg-yellow-50 dark:bg-amber-950/20 border border-yellow-200 dark:border-amber-900/50 p-2 text-yellow-750 dark:text-amber-400 font-mono text-[9px] font-bold tracking-wider uppercase shrink-0">HELP</div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white leading-tight">Academic Review Panel Recommendation</p>
                  <p className="mt-1 text-slate-450 dark:text-slate-400 leading-relaxed font-medium">
                    Refer to syntax tables during the Weekly Coding Practice Challenges. We recommend downloading dynamic cheat sheets as offline reference templates.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-24 text-center">
              <Library className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-3 text-xs text-slate-505 dark:text-slate-400 font-bold">Select a syntax note directory to load previews.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
