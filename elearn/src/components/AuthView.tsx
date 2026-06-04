import React, { useState, useEffect } from "react";
import { X, Lock, Mail, User, Shield, CheckCircle, AlertCircle, Building2, HelpCircle } from "lucide-react";
import { UserRole } from "../types.js";

interface AuthViewProps {
  onClose: () => void;
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthView({ onClose, onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instructorSuccessMsg, setInstructorSuccessMsg] = useState(false);

  // Institution affiliation states for signup
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isAcademicAffiliated, setIsAcademicAffiliated] = useState(true);
  const [selectedInstId, setSelectedInstId] = useState("");

  useEffect(() => {
    fetch("/api/institutions")
      .then((res) => res.json())
      .then((data) => {
        if (data.institutions) {
          // Both active lists can be obtained, but we focus on Academic-category listings
          const list = data.institutions.filter(
            (inst: any) => inst.category === "academic" || !inst.category
          );
          setInstitutions(list);
          if (list.length > 0) {
            setSelectedInstId(list[0].id);
          }
        }
      })
      .catch((err) => console.error("Could not fetch academic institutions list", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInstructorSuccessMsg(false);

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all requested fields.");
      return;
    }

    if (!isLogin && (role === UserRole.STUDENT || role === UserRole.INSTRUCTOR) && isAcademicAffiliated && !selectedInstId) {
      setError("Please select a valid academic institution or choose individual status.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin 
        ? { email, password } 
        : { 
            name, 
            email, 
            password, 
            role,
            isAcademicAffiliated: role === UserRole.STUDENT || role === UserRole.INSTRUCTOR ? isAcademicAffiliated : false,
            institutionId: (role === UserRole.STUDENT || role === UserRole.INSTRUCTOR) && isAcademicAffiliated ? selectedInstId : undefined,
            institutionName: (role === UserRole.STUDENT || role === UserRole.INSTRUCTOR) && isAcademicAffiliated
              ? (institutions.find((i) => i.id === selectedInstId)?.name || "")
              : undefined
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Provide valid credentials.");
      }

      // If instructor signs up successfully and is pending approval
      if (!isLogin && role === UserRole.INSTRUCTOR) {
        setInstructorSuccessMsg(true);
        setLoading(false);
        return;
      }

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" id="auth-modal-overlay">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all" id="auth-container">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          id="close-auth-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">
            {isLogin ? "Welcome Back to CodeCraft" : "Create Technical Account"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {isLogin ? "Sign in to compile code and track courses progress" : "Set up your credentials to join student learning cohorts"}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100" id="auth-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Instructor Registration Success message */}
        {instructorSuccessMsg ? (
          <div className="rounded-xl border border-dotted border-emerald-200 bg-emerald-50/50 p-5 text-center text-xs text-emerald-800" id="instructor-approval-msg">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            <h3 className="font-bold text-sm text-slate-950">Registration Submitted</h3>
            <p className="mt-1.5 leading-relaxed">
              Your Instructor application has been logged on CodeCraft. An Admin principal must audit and approve your application credentials before you can login and upload courses. Thank you for your patience!
            </p>
            <button
              onClick={() => {
                setInstructorSuccessMsg(false);
                setIsLogin(true);
              }}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            
            {/* Name - only for signup */}
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Grace Hopper"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-sans">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Role selecting - only for signup */}
            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Select Role Type</label>
                  <div className="grid grid-cols-2 gap-2" id="role-selector">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.STUDENT)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                        role === UserRole.STUDENT
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Student Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.INSTRUCTOR)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                        role === UserRole.INSTRUCTOR
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Instructor / Admin
                    </button>
                  </div>
                  {role === UserRole.INSTRUCTOR && (
                    <p className="mt-1.5 flex items-start gap-1 text-[10px] text-amber-600 font-medium">
                      <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      Instructor accounts must undergo academic review prior to course publishing.
                    </p>
                  )}
                </div>

                {/* Institution Affiliation fields for STUDENT or INSTRUCTOR */}
                {(role === UserRole.STUDENT || role === UserRole.INSTRUCTOR) && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                      Affiliation Status *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAcademicAffiliated(true)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition cursor-pointer ${
                          isAcademicAffiliated
                            ? "border-indigo-600 bg-white dark:bg-slate-900 text-indigo-700 font-bold shadow-xs"
                            : "border-slate-200 text-slate-500 hover:bg-slate-100/50"
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-indigo-600 mb-1" />
                        <span className="text-[10px]">Academic Member</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAcademicAffiliated(false)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition cursor-pointer ${
                          !isAcademicAffiliated
                            ? "border-indigo-600 bg-white dark:bg-slate-900 text-indigo-700 font-bold shadow-xs"
                            : "border-slate-200 text-slate-500 hover:bg-slate-100/50"
                        }`}
                      >
                        <HelpCircle className="w-4 h-4 text-slate-550 mb-1" />
                        <span className="text-[10px]">Individual Learner (Non-Acad)</span>
                      </button>
                    </div>

                    {isAcademicAffiliated ? (
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-slate-500 mb-1">
                          Select Academic Institution:
                        </label>
                        {institutions.length > 0 ? (
                          <select
                            value={selectedInstId}
                            onChange={(e) => setSelectedInstId(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 p-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-600 cursor-pointer"
                          >
                            {institutions.map((inst) => (
                              <option key={inst.id} value={inst.id}>
                                {inst.name} ({inst.location})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-[10px] text-amber-600 font-medium">
                            No approved Academic Institutions found. Add one in the "Institutions" portal or sign up as Individual.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal bg-indigo-50/20 p-2.5 rounded-lg font-medium">
                        {role === UserRole.STUDENT 
                          ? "⚠️ Registered as individual: Academic tutor profiles and university catalog courses won't display in search results."
                          : "⚠️ Registered as independent tutor/advisor."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-500 active:bg-indigo-700 transition"
              id="auth-submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Requesting credentials...
                </span>
              ) : (
                <span>{isLogin ? "Sign In & Unlock Classrooms" : "Agree Terms & Complete Sign up"}</span>
              )}
            </button>

            {/* Quick credentials notes / test accounts info box */}
            {isLogin && (
              <div className="mt-2 border-t border-slate-100 pt-3.5 text-[10px] text-slate-500 font-mono space-y-1">
                <p className="font-semibold uppercase text-slate-600">Fast-track Demo Credentials:</p>
                <p>• Student: <span className="text-slate-800">student@codecraft.com</span> / <span className="text-slate-850 font-bold">student123</span></p>
                <p>• Teacher: <span className="text-slate-800">dr_alan@codecraft.com</span> / <span className="text-slate-850 font-bold">instructor123</span></p>
                <p>• Director Admin: <span className="text-slate-800">admin@codecraft.com</span> / <span className="text-slate-850 font-bold">admin123</span></p>
              </div>
            )}

            {/* Toggle Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
                id="toggle-auth-state"
              >
                {isLogin ? "Need a student account? Join Here" : "Already registered? Login Here"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
