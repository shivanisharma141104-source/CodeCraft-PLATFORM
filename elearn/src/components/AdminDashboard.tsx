import React, { useState, useEffect } from "react";
import { 
  Users, Trash2, Check, ShieldAlert, BadgeCheck, 
  Sparkles, UserX, Search, BarChart2, BookOpen, 
  AlertTriangle, Ban, Unlock, RefreshCw, Layers, Award,
  Building2, MapPin, School, Globe, Mail, X, Clock
} from "lucide-react";
import { User, UserRole } from "../types.js";

interface AdminDashboardProps {
  token: string | null;
  onAddNotification: (title: string, message: string) => void;
}

export default function AdminDashboard({ token, onAddNotification }: AdminDashboardProps) {
  // Tab control
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "moderation" | "analytics" | "institutions">("users");

  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearchStr, setUserSearchStr] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole.STUDENT | UserRole.INSTRUCTOR | UserRole.ADMIN>("all");

  // Courses state
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseSearchStr, setCourseSearchStr] = useState("");

  // Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Institutions state
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);

  // Base endpoints loaders
  const fetchUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchReports = async () => {
    if (!token) return;
    setReportsLoading(true);
    try {
      const res = await fetch("/api/admin/reports", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data) {
        setAnalytics(data);
        if (data.courses) {
          setCourses(data.courses);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    if (!token) return;
    setInstitutionsLoading(true);
    try {
      const res = await fetch("/api/institutions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.institutions) {
        setInstitutions(data.institutions);
      }
    } catch (err) {
      console.error("Failed to load institutions inside AdminDashboard", err);
    } finally {
      setInstitutionsLoading(false);
    }
  };

  const handleApproveInstitution = async (id: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/admin/institutions/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: approve ? "approved" : "rejected" })
      });
      if (res.ok) {
        onAddNotification(
          approve ? "Institution Approved" : "Registration Rejected",
          approve 
            ? "Approved school/college listing which is now visible in the directory."
            : "Rejected institution listing query parameters."
        );
        fetchInstitutions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run appropriate loader on tab change
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "courses") {
      fetchAnalytics(); // fetches both courses enrollment details & stats!
    } else if (activeTab === "moderation") {
      fetchReports();
    } else if (activeTab === "analytics") {
      fetchAnalytics();
    } else if (activeTab === "institutions") {
      fetchInstitutions();
    }
  }, [activeTab, token]);

  // Actions
  const handleApproveInstructor = async (instructorId: string, approve: boolean) => {
    try {
      const res = await fetch("/api/admin/approve-instructor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ instructorId, approve })
      });
      if (res.ok) {
        onAddNotification(
          approve ? "Instructor Approved" : "Instructor Rejected",
          approve 
            ? "Approved credentials. The Instructor can now log in and build courses."
            : "Certification application rejected or revoked."
        );
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBlockUser = async (uId: string, isBlocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${uId}/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ block: !isBlocked })
      });
      if (res.ok) {
        onAddNotification(
          !isBlocked ? "Member Blocked" : "Member Unblocked",
          !isBlocked 
            ? "Suspended member credentials. The user is locked out from signing in."
            : "Restored workspace permissions for this user."
        );
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (uId: string) => {
    if (!window.confirm("Verify: Are you sure you want to permanently delete this user account from CodeCraft database registry?")) return;
    try {
      const res = await fetch(`/api/admin/users/${uId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        onAddNotification("Account Purged", "Permanently deleted user credentials.");
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete this course? This will cascade-delete all its chapters, lectures, and interactive grading quizzes from the catalog! This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        onAddNotification("Course Deleted", "Harvested syllabus module out of system.");
        fetchAnalytics(); // Reload courses and stats
      } else {
        onAddNotification("Error", "Unable to purge selected course.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        onAddNotification("Complaint Dismissed", "Report resolved as safe content.");
        fetchReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReportedComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this inappropriate discussion comment?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        onAddNotification("Content Purged", "Successfully deleted comment and resolved complaints.");
        fetchReports();
      } else {
        onAddNotification("Error", "Could not delete this discussion post.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Render stats dynamic preview
  const pendingFaculty = users.filter(u => u.role === UserRole.INSTRUCTOR && !u.approved).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="admin-dashboard-view">
      
      {/* Banner */}
      <div className="mb-8 rounded-2xl bg-slate-900 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-bold text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            DIRECTOR GENERAL COMMAND CONSOLE
          </div>
          <h2 className="mt-2 font-sans text-xl font-bold tracking-tight text-white">
            CodeCraft Registrar & Moderator Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review instructor applications, moderate forum discussions, audit catalogs, and inspect system telemetry stats.
          </p>
        </div>
        {pendingFaculty > 0 && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/35 p-3 flex items-center gap-2 max-w-xs shrink-0 self-start sm:self-center">
            <ShieldAlert className="h-4 w-4 text-amber-400 animate-bounce shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Unchecked Faculty Applications</p>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{pendingFaculty} instructor accounts waiting approval.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation Bars */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex flex-wrap gap-x-6">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === "users"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            id="admin-tab-users"
          >
            <Users className="h-4 w-4" />
            Members Directory
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === "courses"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            id="admin-tab-courses"
          >
            <BookOpen className="h-4 w-4" />
            Curriculum Catalog
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("moderation")}
            className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === "moderation"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            id="admin-tab-moderation"
          >
            <AlertTriangle className="h-4 w-4" />
            Safety & Moderation
            {reports.length > 0 && (
              <span className="ml-1 rounded-full bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 font-extrabold animate-pulse">
                {reports.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === "analytics"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            id="admin-tab-analytics"
          >
            <BarChart2 className="h-4 w-4" />
            Platform Analytics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("institutions")}
            className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === "institutions"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            id="admin-tab-institutions"
          >
            <Building2 className="h-4 w-4 animate-bounce" />
            Institution Approvals
            {institutions.filter(i => i.status === "pending").length > 0 && (
              <span className="ml-1 rounded-full bg-violet-100 text-indigo-700 text-[9px] px-1.5 py-0.5 font-extrabold animate-pulse">
                {institutions.filter(i => i.status === "pending").length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Main Tab Rendering */}

      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Faculty Queue Section */}
          {users.filter(u => u.role === UserRole.INSTRUCTOR && !u.approved).length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-5 space-y-3">
              <h3 className="font-sans text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Pending Instructor Certifications Waitlist
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed max-w-2xl">
                The following applicants registered as faculty. Please authenticate their professional resume background. Upon approval, they get instant code writing access to host lectures.
              </p>
              
              <div className="rounded-lg border border-amber-100 bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-50/50 text-amber-900 border-b border-amber-100 font-extrabold">
                    <tr>
                      <th className="p-3">Applicant Profile</th>
                      <th className="p-3">Email Contact</th>
                      <th className="p-3">Created Date</th>
                      <th className="p-3 text-right">Approve/Reject Authority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50 font-medium">
                    {users
                      .filter(u => u.role === UserRole.INSTRUCTOR && !u.approved)
                      .map(u => (
                        <tr key={u.id} className="hover:bg-amber-50/10">
                          <td className="p-3 flex items-center gap-2">
                            <img src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}`} className="h-6 w-6 rounded bg-slate-50" />
                            <span className="font-bold text-slate-900">{u.name}</span>
                          </td>
                          <td className="p-3 text-slate-600 font-mono">{u.email}</td>
                          <td className="p-3 text-slate-400 font-mono text-[10px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Pending"}
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleApproveInstructor(u.id, true)}
                              className="rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1.5 cursor-pointer transition"
                              id={`approve-btn-${u.id}`}
                            >
                              Approve Faculty
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveInstructor(u.id, false)}
                              className="rounded border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[10px] px-2.5 py-1.5 cursor-pointer transition"
                              id={`reject-btn-${u.id}`}
                            >
                              Reject Application
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Directory List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-indigo-600" />
                  Active Members Database
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Filter user directories, manage operational locks, and purge registry profiles.</p>
              </div>

              {/* Advanced Controls: Search & Subtests */}
              <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto">
                <div className="relative shrink-0 max-w-xs w-full sm:w-60 flex items-center border border-slate-200 rounded-lg bg-white px-2.5 py-1.5 shadow-2xs focus-within:border-indigo-500">
                  <Search className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearchStr}
                    onChange={(e) => setUserSearchStr(e.target.value)}
                    className="w-full text-xs text-slate-900 border-0 bg-transparent p-0 focus:outline-hidden focus:ring-0"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("all")}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold transition cursor-pointer ${
                      roleFilter === "all" ? "bg-white text-indigo-755 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    All ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter(UserRole.STUDENT)}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold transition cursor-pointer ${
                      roleFilter === UserRole.STUDENT ? "bg-white text-indigo-755 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Students ({users.filter(u => u.role === UserRole.STUDENT).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter(UserRole.INSTRUCTOR)}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold transition cursor-pointer ${
                      roleFilter === UserRole.INSTRUCTOR ? "bg-white text-indigo-755 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Faculty ({users.filter(u => u.role === UserRole.INSTRUCTOR).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter(UserRole.ADMIN)}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold transition cursor-pointer ${
                      roleFilter === UserRole.ADMIN ? "bg-white text-indigo-755 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Admins ({users.filter(u => u.role === UserRole.ADMIN).length})
                  </button>
                </div>
              </div>
            </div>

            {usersLoading ? (
              <div className="py-12 text-center text-slate-400 italic text-xs">Loading database roster indexes...</div>
            ) : (
              <div className="rounded-xl border border-slate-150 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 font-extrabold text-slate-500">
                      <th className="p-3.5">User name</th>
                      <th className="p-3.5">Email address</th>
                      <th className="p-3.5">Assigned Role</th>
                      <th className="p-3.5">Authority state</th>
                      <th className="p-3.5 text-right">Moderation Commands</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users
                      .filter(u => {
                        const matchRole = roleFilter === "all" || u.role === roleFilter;
                        const matchSearch = !userSearchStr || 
                          u.name.toLowerCase().includes(userSearchStr.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearchStr.toLowerCase());
                        return matchRole && matchSearch;
                      })
                      .map((u) => (
                        <tr 
                          key={u.id} 
                          className={`hover:bg-slate-50/50 transition duration-150 ${
                            u.blocked ? "bg-rose-50/10 hover:bg-rose-50/20" : ""
                          }`}
                          id={`user-row-${u.id}`}
                        >
                          <td className="p-3.5 flex items-center gap-2.5">
                            <img 
                              src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}`} 
                              className="h-7 w-7 rounded-md bg-slate-50 border border-slate-100"
                              alt="avatar"
                            />
                            <div>
                              <div className="text-slate-900 font-bold flex items-center gap-1.5">
                                {u.name}
                                {u.blocked && (
                                  <span className="rounded bg-rose-150 px-1 py-0.5 text-[8px] font-extrabold text-rose-700 tracking-wide">
                                    LOCKED
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5 block">UID: {u.id}</span>
                            </div>
                          </td>

                          <td className="p-3.5 text-slate-550 font-mono">{u.email}</td>

                          <td className="p-3.5">
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              u.role === UserRole.ADMIN 
                                ? "bg-purple-100 text-purple-800" 
                                : u.role === UserRole.INSTRUCTOR 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-slate-100 text-slate-800"
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="p-3.5">
                            {u.role === UserRole.INSTRUCTOR ? (
                              u.approved ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                  <BadgeCheck className="h-4 w-4" />
                                  Faculty Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold animate-pulse">
                                  <ShieldAlert className="h-4 w-4" />
                                  Pending Certification
                                </span>
                              )
                            ) : u.blocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold">
                                <Ban className="h-3.5 w-3.5" />
                                Account Banned
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold uppercase italic">Active Cohort</span>
                            )}
                          </td>

                          {/* Actions panel */}
                          <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                            {u.id !== "u-admin" && u.role !== UserRole.ADMIN && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlockUser(u.id, !!u.blocked)}
                                  className={`inline-flex h-8 items-center gap-1 justify-center rounded-lg px-2.5 text-[10px] font-bold border transition cursor-pointer ${
                                    u.blocked
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                      : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                  }`}
                                  id={`block-user-btn-${u.id}`}
                                >
                                  {u.blocked ? (
                                    <>
                                      <Unlock className="h-3 w-3" />
                                      <span>Unblock Account</span>
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="h-3 w-3" />
                                      <span>Block Access</span>
                                    </>
                                  )}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="inline-flex h-8 items-center gap-1 justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition px-2.5 text-[10px] font-bold cursor-pointer"
                                  id={`delete-user-btn-${u.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Unregister</span>
                                </button>
                              </>
                            )}
                          </td>

                        </tr>
                      ))}

                    {users.filter(u => {
                      const matchRole = roleFilter === "all" || u.role === roleFilter;
                      const matchSearch = !userSearchStr || 
                        u.name.toLowerCase().includes(userSearchStr.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchStr.toLowerCase());
                      return matchRole && matchSearch;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">No registered members found matching filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
                Curriculum Inventory Dashboard
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Audit courses published across the network, view student enrollments, and purge content modules.</p>
            </div>

            <div className="relative max-w-xs w-full flex items-center border border-slate-200 rounded-lg bg-white px-2.5 py-1.5 shadow-2xs focus-within:border-indigo-500">
              <Search className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search course titles or categories..."
                value={courseSearchStr}
                onChange={(e) => setCourseSearchStr(e.target.value)}
                className="w-full text-xs text-slate-900 border-0 bg-transparent p-0 focus:outline-hidden focus:ring-0"
              />
            </div>
          </div>

          {coursesLoading ? (
            <div className="py-12 text-center text-slate-400 italic text-xs">Reading course collection indices...</div>
          ) : (
            <div className="rounded-xl border border-slate-150 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-extrabold text-slate-500">
                    <th className="p-3.5">Course Path</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Host Instructor</th>
                    <th className="p-3.5">Enrollments</th>
                    <th className="p-3.5">Completions</th>
                    <th className="p-3.5 text-right">Inventory Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {courses
                    .filter(c => !courseSearchStr || 
                      c.title.toLowerCase().includes(courseSearchStr.toLowerCase()) ||
                      c.category.toLowerCase().includes(courseSearchStr.toLowerCase()))
                    .map((c) => (
                      <tr key={c.courseId} className="hover:bg-slate-50/50" id={`course-row-${c.courseId}`}>
                        <td className="p-3.5">
                          <div className="font-extrabold text-slate-900 leading-tight">{c.title}</div>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">ID: {c.courseId}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase">
                            {c.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-semibold">{c.instructor}</td>
                        <td className="p-3.5 font-mono text-slate-600 font-bold">{c.enrolledCount} active students</td>
                        <td className="p-3.5 font-mono text-slate-500">{c.completedCount} gradings</td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(c.courseId)}
                            className="inline-flex h-8 items-center gap-1 justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition px-2.5 text-[10px] font-bold cursor-pointer"
                            id={`delete-course-btn-${c.courseId}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Purge Course</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                  {courses.filter(c => !courseSearchStr || 
                    c.title.toLowerCase().includes(courseSearchStr.toLowerCase()) ||
                    c.category.toLowerCase().includes(courseSearchStr.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">No courses matched your query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "moderation" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                Community Safety & Forum Moderation Control
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                Review complaints about vulgarity, spelling loops, answers spamming, or inappropriate behavior reported by active cohorts.
              </p>
            </div>
            
            <button
              type="button"
              onClick={fetchReports}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-650 hover:text-indigo-850 cursor-pointer font-bold border border-slate-200 rounded-lg p-2 bg-white hover:bg-slate-50 shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Reports Queue</span>
            </button>
          </div>

          {reportsLoading ? (
            <div className="py-12 text-center text-slate-400 italic text-xs">Synchronizing complains stream...</div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center max-w-xl mx-auto space-y-3">
              <div className="mx-auto h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-sans">Zero Outstanding Reports</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active discussions have been flagged by students as inappropriate. The platform community environment is healthy and pristine.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" id="reported-complaints-grids">
              {reports.map((r) => (
                <div 
                  key={r.id} 
                  className="rounded-xl border border-rose-100 bg-rose-50/10 p-4 flex flex-col md:flex-row justify-between gap-4"
                  id={`report-card-${r.id}`}
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-rose-100/70 border border-rose-200 text-rose-800 text-[9px] font-extrabold uppercase px-1.5 py-0.5 tracking-wider">
                        FLAGGED: {r.reason}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Report Ref: {r.id}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400 font-mono">Date: {new Date(r.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="bg-white border rounded-lg p-3 max-w-3xl border-slate-200 relative">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offensive Post Preview</p>
                      <p className="text-xs text-slate-800 font-sans mt-1 leading-relaxed italic">"{r.commentText}"</p>
                      
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Original Author: <strong className="text-slate-600 font-bold">{r.commentAuthorName}</strong></span>
                        <span>Flagged By: <strong className="text-slate-600 font-bold">{r.reportedByUserName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteReportedComment(r.commentId)}
                      className="rounded-lg bg-rose-600 hover:bg-rose-5050 text-white hover:bg-rose-500 font-bold text-xs px-3.5 py-2 cursor-pointer shadow-xs transition"
                      id={`purge-comment-btn-${r.id}`}
                    >
                      Delete Comment
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissReport(r.id)}
                      className="rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3.5 py-2 cursor-pointer bg-white transition"
                      id={`dismiss-report-btn-${r.id}`}
                    >
                      Dismiss Complaint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {analyticsLoading || !analytics ? (
            <div className="py-12 text-center text-slate-400 italic text-xs">Assembling overall platform analytics counters...</div>
          ) : (
            <>
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="admin-analytics-totals">
                <div className="rounded-xl border border-slate-150 bg-white p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</p>
                  <p className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight">{analytics.totals.users}</p>
                  <div className="mt-1 text-[10px] font-semibold text-indigo-600">
                    {analytics.totals.students} Students • {analytics.totals.instructors} Academic Faculty
                  </div>
                </div>

                <div className="rounded-xl border border-slate-150 bg-white p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courses Active</p>
                  <p className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight">{analytics.totals.courses}</p>
                  <div className="mt-1 text-[10px] font-mono text-slate-400">
                    In syllabus inventories
                  </div>
                </div>

                <div className="rounded-xl border border-slate-150 bg-white p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lectures & Parts</p>
                  <p className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight">
                    {analytics.totals.modules + analytics.totals.lessons}
                  </p>
                  <div className="mt-1 text-[10px] font-semibold text-slate-500">
                    {analytics.totals.lessons} total video lessons
                  </div>
                </div>

                <div className="rounded-xl border border-slate-150 bg-white p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quiz Performance Attempts</p>
                  <p className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight">{analytics.totals.quizAttempts}</p>
                  <div className="mt-1 text-[10px] font-semibold text-emerald-600">
                    Graded answers saved
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 border-indigo-200">
                  <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Discussion Forum Noise</p>
                  <p className="mt-1.5 text-2xl font-black text-indigo-950 tracking-tight">{analytics.totals.comments}</p>
                  <div className="mt-1 text-[10px] font-semibold text-amber-750">
                    With {reports.length} pending moderation reviews
                  </div>
                </div>
              </div>

              {/* Layout Content: Subject distributions & enrollment breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Subject Distribution Block */}
                <div className="rounded-xl border border-slate-150 bg-white p-5 space-y-4">
                  <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pb-2 border-b">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    Subject Path Distributions
                  </h3>
                  
                  <div className="space-y-3.5">
                    {analytics.courseCategories && analytics.courseCategories.map((c: any) => {
                      const totalCount = analytics.totals.courses;
                      const percentage = totalCount > 0 ? Math.floor((c.count / totalCount) * 100) : 0;
                      
                      return (
                        <div key={c.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{c.name} Learning Path</span>
                            <span className="font-mono text-slate-500">{c.count} courses ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {(!analytics.courseCategories || analytics.courseCategories.length === 0) && (
                      <p className="text-xs text-slate-400 italic py-6 text-center">No categories mapped dynamically yet.</p>
                    )}
                  </div>
                </div>

                {/* Enrollment list auditing */}
                <div className="lg:col-span-2 rounded-xl border border-slate-150 bg-white p-5 space-y-4">
                  <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pb-2 border-b">
                    <Award className="h-4 w-4 text-emerald-500" />
                    Direct Course Enrollment & Grading Telemetry
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead>
                        <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2">
                          <th className="pb-2">Course Title</th>
                          <th className="pb-2">Assigned Faculty</th>
                          <th className="pb-2 text-center">Active Enrolled</th>
                          <th className="pb-2 text-center">Finished syllabus %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {analytics.courses && analytics.courses.map((item: any, idx: number) => {
                          const completionRatio = item.enrolledCount > 0 
                            ? Math.floor((item.completedCount / item.enrolledCount) * 100) 
                            : 0;
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 text-slate-900 font-bold">{item.title}</td>
                              <td className="py-2.5 text-slate-500">{item.instructor}</td>
                              <td className="py-2.5 text-center font-mono text-slate-950 font-bold">{item.enrolledCount} st.</td>
                              <td className="py-2.5">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden font-mono">
                                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${completionRatio}%` }} />
                                  </div>
                                  <span className="font-mono text-[10px] font-bold text-slate-800">{completionRatio}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {(!analytics.courses || analytics.courses.length === 0) && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400 italic">No courses recorded in backend state.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "institutions" && (
        <div className="space-y-6" id="admin-institutions-tab-panel">
          <div>
            <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Building2 className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
              Institutions Management Roster
            </h3>
            <p className="text-[11px] text-slate-405 mt-1">
              Approve or reject regional primary school profiles, high schools, and degree colleges requesting platform affiliation.
            </p>
          </div>

          {institutionsLoading ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">Syncing institutions query states...</div>
          ) : institutions.length === 0 ? (
            <div className="rounded-xl border border-slate-150 bg-white p-12 text-center shadow-2xs">
              <Building2 className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-800">No school or college registration queries found</h4>
              <p className="text-[11px] text-slate-505 mt-1">There are no school or college structures waiting validation.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-150 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-705">
                <thead className="bg-slate-55 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-3">Institution Profile</th>
                    <th className="p-3">Address & Website</th>
                    <th className="p-3">Contact Admissions</th>
                    <th className="p-3">Enrollment Size</th>
                    <th className="p-3">Overview / Pitch</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {institutions.map((inst) => {
                    const isPending = inst.status === "pending";
                    const isApproved = inst.status === "approved";
                    const isRejected = inst.status === "rejected";

                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/40">
                        {/* Name and classification type */}
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900 text-xs">{inst.name}</p>
                          <span className="inline-flex mt-1 rounded-sm px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-slate-100 text-slate-700 tracking-wider">
                            {inst.type}
                          </span>
                        </td>
                        
                        {/* Location and Web URL Link */}
                        <td className="p-3">
                          <p className="flex items-center gap-1 text-[11px] text-slate-800 font-bold">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {inst.location}
                          </p>
                          {inst.website && (
                            <a 
                              href={inst.website} 
                              target="_blank" 
                              rel="noreferrer" 
                              referrerPolicy="no-referrer"
                              className="inline-flex items-center gap-1 mt-1 text-[10px] text-indigo-600 hover:underline"
                            >
                              <Globe className="h-3 w-3 shrink-0" />
                              View portal
                            </a>
                          )}
                        </td>

                        {/* Contact details */}
                        <td className="p-3">
                          <p className="flex items-center gap-1 font-semibold text-slate-900">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {inst.contactEmail}
                          </p>
                          {inst.contactPhone && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{inst.contactPhone}</p>
                          )}
                        </td>

                        {/* Size scale */}
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {inst.enrollmentSize ? `${inst.enrollmentSize.toLocaleString()} students` : "Dormant"}
                        </td>

                        {/* Description overview */}
                        <td className="p-3 max-w-[200px]">
                          <p className="line-clamp-2 text-[11px] text-slate-500" title={inst.description}>
                            {inst.description}
                          </p>
                        </td>

                        {/* Current Status tag badge */}
                        <td className="p-3">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-850">
                              <Clock className="h-2.5 w-2.5 animate-pulse" />
                              Pending Vetting
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-850">
                              <Check className="h-2.5 w-2.5" />
                              Approved Affiliate
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-850">
                              <X className="h-2.5 w-2.5" />
                              Registration Denied
                            </span>
                          )}
                        </td>

                        {/* Quick authorization toggles */}
                        <td className="p-3 text-right space-y-1 whitespace-nowrap">
                          {isPending ? (
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveInstitution(inst.id, true)}
                                className="rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 cursor-pointer transition shadow-3xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveInstitution(inst.id, false)}
                                className="rounded border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[10px] px-2 py-1 cursor-pointer transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApproveInstitution(inst.id, !isApproved)}
                              className={`rounded border text-[10px] px-2 py-1 font-bold cursor-pointer transition ${
                                isApproved 
                                  ? "border-amber-250 text-amber-700 hover:bg-amber-50" 
                                  : "border-emerald-250 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              {isApproved ? "Revoke Approval" : "Grant Approval"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
