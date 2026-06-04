import React, { useState, useEffect } from "react";
import { 
  Play, Terminal, RotateCcw, Flame, CheckCircle, 
  XCircle, Braces, Sparkles, HelpCircle 
} from "lucide-react";
import { TRANSLATIONS } from "../lib/locales.js";

interface Challenge {
  id: string;
  title: string;
  description: string;
  problem: string;
  category: string;
  startingCode: string;
  solutionCode: string;
  startingCodePy?: string;
  solutionCodePy?: string;
  testCases: { input: string; expectedOutput: string }[];
}

interface PracticeArenaProps {
  initialCode?: string;
  onAddNotification: (title: string, message: string) => void;
  currentLanguage: string;
}

const PRESET_CHALLENGES: Challenge[] = [
  {
    id: "daily-challenge-calc",
    title: "🔥 Daily Challenge: String Reverse Master",
    category: "Strings & Manipulation",
    description: "Reverse each word in a string but maintain order",
    problem: `Welcome to the Daily Coding Challenge!\n\nWrite a function named 'reverseWords' that takes a string of space-separated words, and returns a new string where each word is reversed, but the order of the words remains original.\n\nInput format: reverseWords(s)\nExample: reverseWords("hello world") => should output "olleh dlrow"`,
    startingCode: `function reverseWords(s) {\n  // Reverse individual words here\n  return s;\n}`,
    solutionCode: `function reverseWords(s) {\n  return s.split(" ").map(w => w.split("").reverse().join("")).join(" ");\n}`,
    startingCodePy: `def reverseWords(s):\n    # Reverse individual words here\n    return s`,
    solutionCodePy: `def reverseWords(s):\n    return " ".join([w[::-1] for w in s.split(" ")])`,
    testCases: [
      { input: "'hello world'", expectedOutput: '"olleh dlrow"' },
      { input: "'CodeCraft Sandbox Explorer'", expectedOutput: '"tfarCedoC xodbnaS rerolpxE"' }
    ]
  },
  {
    id: "ds-two-sum",
    title: "Array Two Sum",
    category: "Data Structures & Algorithms",
    description: "Find indexes matching sum goals",
    problem: `Write a function named 'twoSum' that takes an array of numbers and a target sum, and returns the indices of the two elements that add up to the target.\n\nInput formats: twoSum(nums, target)\nExample: twoSum([2, 5, 8, 12], 10) => should output [0, 2]`,
    startingCode: `function twoSum(nums, target) {\n  // Write your code here and return [idx1, idx2]\n  \n}`,
    solutionCode: `function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map[comp] !== undefined) {\n      return [map[comp], i];\n    }\n    map[nums[i]] = i;\n  }\n  return [];\n}`,
    startingCodePy: `def twoSum(nums, target):\n    # Write your code here and return list of [idx1, idx2]\n    return []`,
    solutionCodePy: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []`,
    testCases: [
      { input: "[2, 5, 8, 12], 10", expectedOutput: "[0, 2]" },
      { input: "[3, 2, 4], 6", expectedOutput: "[1, 2]" }
    ]
  },
  {
    id: "js-fibonacci",
    title: "Fibonacci Nth Digits",
    category: "Algorithm",
    description: "Generate Fibonacci index recursively",
    problem: `Write a function named 'fib' that returns the Nth fibonacci index where inputs: N.\n\nExample: fib(6) => should output 8 (0, 1, 1, 2, 3, 5, 8)`,
    startingCode: `function fib(n) {\n  // Return Nth fib term\n  \n}`,
    solutionCode: `function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}`,
    startingCodePy: `def fib(n):\n    # Return Nth fib term\n    return 0`,
    solutionCodePy: `def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)`,
    testCases: [
      { input: "6", expectedOutput: "8" },
      { input: "10", expectedOutput: "55" }
    ]
  },
  {
    id: "py-anagram",
    title: "Valid Anagram Word Checks",
    category: "Strings",
    description: "Evaluate matching dictionary strings",
    problem: `Write a function named 'isAnagram' that validates if word A is an anagram of word B. Return true or false.\n\nExample: isAnagram('listen', 'silent') => true`,
    startingCode: `function isAnagram(s, t) {\n  // Return true or false\n  \n}`,
    solutionCode: `function isAnagram(s, t) {\n  return s.split("").sort().join("") === t.split("").sort().join("");\n}`,
    startingCodePy: `def isAnagram(s, t):\n    # Return True or False\n    return False`,
    solutionCodePy: `def isAnagram(s, t):\n    return sorted(s) == sorted(t)`,
    testCases: [
      { input: "'listen', 'silent'", expectedOutput: "true" },
      { input: "'hello', 'world'", expectedOutput: "false" }
    ]
  }
];

export default function PracticeArena({ initialCode, onAddNotification, currentLanguage }: PracticeArenaProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(PRESET_CHALLENGES[0]);
  const [code, setCode] = useState(PRESET_CHALLENGES[0].startingCode);
  const [language, setLanguage] = useState("javascript");
  const [customInput, setCustomInput] = useState("");
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [gradingFeedback, setGradingFeedback] = useState<string | null>(null);
  const [gradingSuccess, setGradingSuccess] = useState<boolean | null>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS["en"];

  // Load requested initialCode if student switched from lectures
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (!initialCode) {
      let desiredCode = selectedChallenge.startingCode;
      if (language === "python" && selectedChallenge.startingCodePy) {
        desiredCode = selectedChallenge.startingCodePy;
      }
      setCode(desiredCode);
      setGradingFeedback(null);
      setGradingSuccess(null);
      setStdout("");
    }
  }, [selectedChallenge, language, initialCode]);

  // Execute Code on sandbox compiler VM
  const handleRunCode = async () => {
    setCompiling(true);
    setError(null);
    setStdout("");
    setGradingFeedback(null);
    setGradingSuccess(null);

    try {
      const res = await fetch("/api/practice/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      if (data.success) {
        setStdout(data.stdout || "Execution finished with empty buffer.");
      } else {
        setError(data.error);
        setStdout(data.stdout || "");
      }
    } catch (err: any) {
      setError("Network error failed to execute script on sandbox compiler.");
    } finally {
      setCompiling(false);
    }
  };

  // Automated case tests grading
  const handleGradeCode = async () => {
    setCompiling(true);
    setError(null);
    setStdout("");
    setGradingFeedback("Starting auto-grader evaluations...");
    setGradingSuccess(null);

    try {
      // Evaluate actual code by injecting tests loops directly into the evaluation
      let testRunnerCode = code + "\n\n";
      
      if (language === "python" || language === "python3") {
        testRunnerCode += "import json\n";
        const funcName = selectedChallenge.startingCodePy?.match(/def\s+(\w+)/)?.[1] || "twoSum";
        selectedChallenge.testCases.forEach((tc, idx) => {
          testRunnerCode += `\ntry:\n    res = ${funcName}(${tc.input})\n    print("TEST_${idx}: " + json.dumps(res))\nexcept Exception as e:\n    print("TEST_${idx}_FAIL: " + str(e))\n`;
        });
      } else {
        selectedChallenge.testCases.forEach((tc, idx) => {
          // Append assertions and comparisons
          testRunnerCode += `\ntry {\n  const res = (${selectedChallenge.startingCode.match(/function\s+(\w+)/)?.[1] || "twoSum"})(${tc.input});\n  console.log("TEST_${idx}: " + JSON.stringify(res));\n} catch(e) {\n  console.log("TEST_${idx}_FAIL: " + e.message);\n}\n`;
        });
      }

      const res = await fetch("/api/practice/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: testRunnerCode, language })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Execution failed during test parsing.");
        setGradingSuccess(false);
        setGradingFeedback("Grader completed: Code failed compilation check.");
        return;
      }

      // Read responses from console streams
      const consoleOutput = data.stdout || "";
      let passedAll = true;
      let logsSummary: string[] = [];

      selectedChallenge.testCases.forEach((tc, idx) => {
        const searchTag = `TEST_${idx}: `;
        const idxOf = consoleOutput.indexOf(searchTag);
        
        if (idxOf > -1) {
          const startOfVal = idxOf + searchTag.length;
          const endOfVal = consoleOutput.indexOf("\n", startOfVal);
          const rawResult = consoleOutput.substring(startOfVal, endOfVal > -1 ? endOfVal : undefined).trim();
          
          // Match spaces in expected outputs
          const cleanExpected = tc.expectedOutput.replace(/\s+/g, "");
          const cleanReal = rawResult.replace(/\s+/g, "");

          if (cleanReal === cleanExpected) {
            logsSummary.push(`✔ Test Case ${idx + 1} Passed (Input: ${tc.input})`);
          } else {
            passedAll = false;
            logsSummary.push(`❌ Test Case ${idx + 1} Failed. Expected: ${tc.expectedOutput}, Real: ${rawResult}`);
          }
        } else {
          passedAll = false;
          logsSummary.push(`❌ Test Case ${idx + 1} Crashed / Failed matching assertions.`);
        }
      });

      setGradingSuccess(passedAll);
      setGradingFeedback(logsSummary.join("\n"));
      setStdout(consoleOutput);

      if (passedAll) {
        onAddNotification(
          "Challenge Completed!", 
          `Excellent work! Your code passed all system assertions for "${selectedChallenge.title}".`
        );
      }

    } catch (err) {
      setError("Grader failed connecting to backend evaluation routes.");
      setGradingSuccess(false);
    } finally {
      setCompiling(false);
    }
  };

  const handleResetCode = () => {
    let desiredCode = selectedChallenge.startingCode;
    if (language === "python" && selectedChallenge.startingCodePy) {
      desiredCode = selectedChallenge.startingCodePy;
    }
    setCode(desiredCode);
    setStdout("");
    setError(null);
    setGradingFeedback(null);
    setGradingSuccess(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans" id="practice-arena">
      
      {/* Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            {t.interactiveSandbox}
          </h2>
          <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5 font-medium">
            {t.sandboxSub}
          </p>
        </div>

        {/* Configurations selector */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 dark:text-slate-500">{t.environment}</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-slate-205 dark:border-slate-805 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-705 dark:text-slate-200 shadow-2xs focus:border-indigo-600 focus:outline-hidden transition-all whitespace-nowrap cursor-pointer"
          >
            <option value="javascript">JavaScript (V8 Sandbox Engine)</option>
            <option value="python">Python 3 (PySandbox Core Engine)</option>
            <option value="cpp">C++ (GCC Dry-run)</option>
          </select>
        </div>
      </div>

      {/* Workspace split columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side: Challenge Picker & Problem Description */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Challenges listing */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 block">{t.challengesList}</h3>
            <div className="space-y-2.5" id="arena-challenges-list">
              {PRESET_CHALLENGES.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChallenge(ch)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all duration-250 ${
                    selectedChallenge.id === ch.id
                      ? "border-indigo-600 dark:border-indigo-505 bg-indigo-50/45 dark:bg-indigo-950/20 shadow-2xs font-bold scale-[1.01]"
                      : "border-slate-50 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-750 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <p className="font-bold text-slate-900 dark:text-white">{ch.title}</p>
                  <p className="mt-1 text-[10px] text-slate-455 dark:text-slate-400 font-semibold">{ch.category} • {ch.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Problem markdown descriptions */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-805 px-3 py-1 text-[9px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              <Braces className="h-3.5 w-3.5" />
              {t.systemTaskConstraints}
            </div>
            
            <h4 className="mt-4 font-sans text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">
              {selectedChallenge.title}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-4 whitespace-pre-wrap font-medium">
              {selectedChallenge.problem}
            </p>

            {/* Test cases expectations preview */}
            <div className="mt-6 space-y-3">
              <p className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">{t.gradingCheckpoints}:</p>
              {selectedChallenge.testCases.map((tc, idx) => (
                <div key={idx} className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-805 p-3 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-slate-705 dark:text-slate-300">Inputs: <span className="text-slate-900 dark:text-white font-medium">{tc.input}</span></p>
                  <p className="mt-1 font-semibold">Expect Output: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{tc.expectedOutput}</span></p>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Right Side: Virtual Code Editor and Terminal logs */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Code Editor Window */}
          <div className="rounded-2xl border border-slate-850 bg-slate-900 overflow-hidden flex flex-col flex-1 min-h-[400px]">
            {/* Window Header title */}
            <div className="bg-slate-950 px-5 py-3.5 flex items-center justify-between border-b border-slate-850">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400 shrink-0" />
                <span className="h-3 w-3 rounded-full bg-amber-400 shrink-0" />
                <span className="h-3 w-3 rounded-full bg-green-400 shrink-0" />
                <span className="ml-3.5 font-mono text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  main.{language === "javascript" ? "js" : language === "python" ? "py" : "cpp"}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleResetCode}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.reset}
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={compiling}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  {t.runCode}
                </button>

                <button
                  onClick={handleGradeCode}
                  disabled={compiling}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-inner cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-200 animate-pulse" />
                  {t.gradeCode}
                </button>
              </div>
            </div>

            {/* Custom Edit Box with side lines indicators for VS-Code alignment */}
            <div className="flex-1 flex font-mono text-xs text-indigo-150 overflow-hidden bg-slate-900">
              
              {/* Fake Lines indicators */}
              <div className="bg-slate-950/20 px-4 py-4 text-right text-slate-600 select-none border-r border-slate-850 font-mono text-[11px] leading-[18px]">
                {Array.from({ length: Math.max(15, code.split("\n").length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Editing block */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-transparent px-5 py-4 text-[12px] font-mono leading-[18px] text-slate-100 focus:outline-hidden focus:ring-0 select-text resize-none font-medium h-[350px] overflow-y-auto"
                style={{ fontFamily: '"JetBrains Mono", Consolas, Courier, monospace' }}
              />

            </div>
          </div>

          {/* Console / Grader feedback Output Terminal */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-4">
              <Terminal className="h-4.5 w-4.5 text-indigo-650 dark:text-indigo-400 animate-pulse" />
              CodeCraft Output Console
            </h3>

            {/* Auto-grading results */}
            {gradingFeedback && (
              <div className={`mb-4 p-4 rounded-xl border text-xs font-mono whitespace-pre-wrap leading-relaxed ${
                gradingSuccess === true 
                  ? "bg-green-50/50 border-green-200 dark:bg-emerald-950/20 dark:border-emerald-900/60 text-green-800 dark:text-emerald-450 shadow-3xs" 
                  : gradingSuccess === false 
                  ? "bg-red-50/50 border-red-205/50 dark:bg-red-950/25 dark:border-red-900/60 text-red-700 dark:text-red-450" 
                  : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`} id="grader-feedback-box">
                <p className="font-bold mb-2 border-b border-slate-200/50 dark:border-slate-800/80 pb-1.5 flex items-center gap-2">
                  {gradingSuccess === true ? <CheckCircle className="h-4.5 w-4.5 text-green-655" /> : gradingSuccess === false ? <XCircle className="h-4.5 w-4.5 text-red-555" /> : <HelpCircle className="h-4.5 w-4.5" />}
                  Grader Verification Log
                </p>
                {gradingFeedback}
              </div>
            )}

            {/* General STDOUT */}
            {error ? (
              <div className="rounded-xl bg-red-950/5 border border-red-200 p-4 font-mono text-xs text-red-655">
                <span className="font-bold block uppercase mb-1.5 text-[10px] tracking-wider">Evaluation Warning:</span>
                {error}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-950 p-4.5 font-mono text-[11px] text-slate-300 min-h-[110px] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                {stdout ? stdout : "Execute code blocks or click 'Grade Code' to review tests outcomes..."}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
