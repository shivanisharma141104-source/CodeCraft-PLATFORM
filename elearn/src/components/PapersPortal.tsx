import React, { useState, useEffect } from "react";
import { Download, FileText, Search, Library, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { QuestionPaper } from "../types.js";

const CATEGORIES = ["All", "Python", "Java", "JavaScript", "C++", "Data Structures & Algorithms", "Database & SQL"];

interface PapersPortalProps {
  onAddNotification: (title: string, message: string) => void;
}

export default function PapersPortal({ onAddNotification }: PapersPortalProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);

  useEffect(() => {
    fetch("/api/papers")
      .then((res) => res.json())
      .then((data) => {
        if (data.papers) {
          setPapers(data.papers);
          if (data.papers.length > 0) {
            setSelectedPaper(data.papers[0]);
          }
        }
      })
      .catch((err) => console.error("Failed to load historical papers", err));
  }, []);

  const filteredPapers = papers.filter((p) => {
    return selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleDownloadPaper = (paper: QuestionPaper) => {
    onAddNotification(
      "Download Started",
      `Dynamic export registered for academic paper "${paper.title}"`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="papers-portal-workspace">
      
      {/* Header details */}
      <div className="mb-8 font-sans">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
          Archive Examination Question Papers
        </h2>
        <p className="text-xs text-slate-450 mt-1.5 font-medium">
          Consult official university past papers, sample questionnaires, and model answers curated by Academic Leads.
        </p>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left column list */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Quick filter carousel */}
          <div className="flex flex-wrap gap-2" id="papers-filter-carousel">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                  selectedCategory === cat 
                    ? "bg-slate-950 text-white shadow-xs" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Paper list indicators */}
          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1" id="papers-list">
            {filteredPapers.map((paper) => {
              const active = selectedPaper?.id === paper.id;
              return (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    active 
                      ? "border-indigo-600 bg-indigo-50/15 shadow-xs font-bold" 
                      : "border-slate-100 bg-white hover:bg-slate-50/50 hover:border-slate-200"
                  }`}
                  id={`paper-card-${paper.id}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-[9px] font-extrabold text-indigo-600 tracking-wider uppercase">
                      {paper.year} CLASS EXAM
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {paper.examType}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{paper.title}</h4>
                  <p className="text-[10px] text-slate-450 mt-2 font-medium">Syllabus Index: {paper.category}</p>
                </div>
              );
            })}

            {filteredPapers.length === 0 && (
              <div className="p-10 border border-dashed border-slate-200 text-center rounded-2xl bg-slate-50 text-slate-400">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-350 mb-2" />
                <p className="text-xs font-semibold">No model papers published matching this directory category.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right column displays detailing explanations */}
        <div className="lg:col-span-8">
          {selectedPaper ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col h-full justify-between" id="paper-previews">
              
              <div className="space-y-5">
                {/* Action Row */}
                <div className="border-b border-slate-100 pb-5 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[9px] font-extrabold tracking-widest text-indigo-600 uppercase">
                      CodeCraft Registrar • {selectedPaper.category} Category
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">{selectedPaper.title}</h3>
                  </div>

                  <a
                    href={selectedPaper.fileUrl}
                    onClick={() => handleDownloadPaper(selectedPaper)}
                    className="inline-flex h-10 items-center gap-2 px-4 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-100 transition-all cursor-pointer"
                    id="download-paper-anchor"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Download Paper Answers
                  </a>
                </div>

                {/* Previews content scroll */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 font-mono text-xs text-slate-705 leading-relaxed overflow-y-auto max-h-[380px]">
                  <pre className="whitespace-pre-wrap font-sans font-medium text-slate-650">{selectedPaper.content}</pre>
                </div>
              </div>

              {/* Model Answers key walkups */}
              <div className="mt-8 border-t border-slate-100 pt-5" id="paper-answer-keys">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Model Answers Explanation walkthrough</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50/20 rounded-2xl border border-indigo-100/40 text-xs">
                    <p className="font-bold text-slate-900">Task Question Q1 Solving:</p>
                    <p className="text-slate-550 mt-1.5 leading-relaxed text-[11px] font-medium">
                      Analyze scope variables parameters, declare target variables correctly within execution frames.
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-50/20 rounded-2xl border border-indigo-100/40 text-xs">
                    <p className="font-bold text-slate-900">Task Question Q2 Solving:</p>
                    <p className="text-slate-550 mt-1.5 leading-relaxed text-[11px] font-medium">
                      Check Big-O time and space complexity models, optimize functional calls, and reduce recursive frames safely.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-slate-150 bg-slate-50 py-24 text-center">
              <Library className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-3 text-xs text-slate-500 font-bold">Select a previous year paper directory to preview.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
