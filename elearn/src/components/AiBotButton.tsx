import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Brain, Code, Copy, Check } from "lucide-react";
import { TRANSLATIONS } from "../lib/locales.js";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AiBotButtonProps {
  currentLanguage?: string;
}

export default function AiBotButton({ currentLanguage = "en" }: AiBotButtonProps) {
  const [open, setOpen] = useState(false);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS["en"];

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize companion greeting matching language Selection
  useEffect(() => {
    setMessages([
      { role: "model", text: t.aiGreeting }
    ]);
  }, [currentLanguage]);

  // Auto scroll to chat bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || loading) return;

    const updatedMessages = [...messages, { role: "user" as const, text: userPrompt }];
    setMessages(updatedMessages);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          history: updatedMessages.slice(0, -1) // send preceding chat logs
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([...updatedMessages, { role: "model" as const, text: data.reply }]);
      } else {
        setMessages([...updatedMessages, { role: "model" as const, text: `AI Service Error: ${data.error || "Failed loading reply."}` }]);
      }
    } catch (err) {
      setMessages([...updatedMessages, { role: "model" as const, text: "Failed connecting to system AI server gateway. Verify connectivity." }]);
    } finally {
      setLoading(false);
    }
  };

  const parseRichMessage = (text: string) => {
    // Parser for markdown code blocks: ```javascript\n...\n```
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : "";
        const codeText = match ? match[2].trim() : part.slice(3, -3).trim();
        
        return (
          <div key={index} className="my-2.5 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden font-mono text-[10.5px] shadow-sm select-text">
            <div className="bg-slate-900/65 px-3 py-1.5 flex items-center justify-between text-[9px] font-bold text-slate-500 border-b border-slate-950/45 uppercase tracking-wider">
              <span>{lang || "Code Snippet"}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(codeText);
                  setCopiedIndex(index);
                  setTimeout(() => setCopiedIndex(null), 1500);
                }}
                className="hover:text-indigo-400 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 font-sans"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="h-2.5 w-2.5 text-indigo-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-2.5 w-2.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-emerald-400 leading-relaxed font-mono">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }
      
      const inlineParts = part.split(/(`[^`\n]+`)/g);
      return (
        <span key={index} className="leading-relaxed whitespace-pre-wrap">
          {inlineParts.map((subPart, i) => {
            if (subPart.startsWith("`") && subPart.endsWith("`")) {
              return (
                <code key={i} className="bg-slate-800/90 font-mono text-amber-300 px-1.5 py-0.5 rounded text-[10.5px] font-medium inline-block select-all relative -top-0.5 border border-slate-750">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  const promptSuggestions = [
    t.suggestRecursion,
    t.suggestSqlJoin,
    t.suggestSpaceComplexity
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ai-assistant-chatbot-widget">
      
      {/* Floating launcher Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-905 border border-slate-800 hover:bg-slate-800 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          id="ai-bot-toggle-open"
        >
          <Brain className="h-6 w-6 text-indigo-400 animate-[pulse_3s_infinite]" />
        </button>
      )}

      {/* Floating Chat Container Window */}
      {open && (
        <div className="w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-2xl flex flex-col h-[520px]" id="ai-chatbot-window">
          
          {/* Header Title bar */}
          <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-slate-950 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-sans">{t.aiCompanion}</h3>
                <span className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Gemini Active
                </span>
              </div>
            </div>

            <button 
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white cursor-pointer"
              id="ai-bot-toggle-close"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Lists window scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/20" id="ai-chat-scroller">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 items-start ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                id={`chat-msg-${idx}`}
              >
                {/* Avatar icon badge */}
                <div className={`flex h-7 w-7 items-center justify-center rounded-md font-bold text-[10px] uppercase shrink-0 select-none ${
                  m.role === "user" ? "bg-slate-800 text-slate-300" : "bg-indigo-600 text-white"
                }`}>
                  {m.role === "user" ? "U" : "AI"}
                </div>

                {/* Msg text bubble with Rich parsing */}
                <div className={`p-3 rounded-xl text-xs max-w-[78%] leading-relaxed ${
                  m.role === "user" 
                    ? "bg-indigo-650/40 text-slate-100 rounded-tr-none border border-indigo-700/30" 
                    : "bg-slate-900 text-slate-200 rounded-tl-none border border-slate-850"
                }`}>
                  <div className="space-y-1.5 select-text">
                    {parseRichMessage(m.text)}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-650 animate-pulse text-white font-bold text-[10px]">...</div>
                <div className="p-3 bg-slate-900 rounded-xl rounded-tl-none text-xs text-slate-400 border border-slate-850 italic">
                  {t.aiThinking}...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Prompt Suggestions row */}
          {messages.length === 1 && !loading && (
            <div className="px-3.5 pt-1 pb-3 flex flex-col gap-1.5 border-t border-slate-900" id="prompt-suggestion-container">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.quickPrompts}</p>
              <div className="flex flex-wrap gap-1.5">
                {promptSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-205 hover:bg-indigo-950/40 bg-zinc-900/60 border border-zinc-800 rounded-lg px-2.5 py-1 text-left transition cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form write input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }} 
            className="p-3.5 border-t border-slate-850 bg-slate-950 rounded-b-2xl flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.aiPlaceholder}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-slate-200 outline-hidden placeholder:text-slate-500 focus:border-indigo-600 transition"
              id="ai-prompt-input"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white cursor-pointer"
              id="ai-send-btn"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
