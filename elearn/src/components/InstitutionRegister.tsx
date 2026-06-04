import React, { useState, useEffect } from "react";
import { 
  School, MapPin, Globe, Mail, Phone, Users, CheckCircle, 
  Clock, Sparkles, Plus, Search, Building2, GraduationCap, AlertCircle, X, ShieldAlert
} from "lucide-react";
import { RegisteredInstitution, User } from "../types.js";
import { TRANSLATIONS } from "../lib/locales.js";

interface InstitutionRegisterProps {
  currentUser: User | null;
  token: string | null;
  currentLanguage: string;
  onAddNotification: (title: string, message: string) => void;
  onOpenAuth: () => void;
}

export default function InstitutionRegister({
  currentUser,
  token,
  currentLanguage,
  onAddNotification,
  onOpenAuth
}: InstitutionRegisterProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS["en"];

  // States
  const [institutions, setInstitutions] = useState<RegisteredInstitution[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState<"all" | "academic" | "non-academic">("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Registration Form State
  const [showForm, setShowForm] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<"academic" | "individual">("academic");
  const [name, setName] = useState("");
  const [type, setType] = useState<"school" | "college" | "university" | "bootcamp" | "studyclub" | "other">("college");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [enrollmentSize, setEnrollmentSize] = useState("");
  const [description, setDescription] = useState("");
  
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch institutions on load and after submits
  const fetchInstitutions = () => {
    setLoading(true);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch("/api/institutions", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.institutions) {
          setInstitutions(data.institutions);
        }
      })
      .catch((err) => console.error("Error loading schools/colleges list", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInstitutions();
  }, [token]);

  // Handle registration modes sync
  useEffect(() => {
    if (registrationMode === "individual") {
      setType("studyclub");
    } else {
      setType("college");
    }
  }, [registrationMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!name.trim()) return setSubmitError("Name is required.");
    if (!location.trim()) return setSubmitError("Physical address/location is required.");
    if (!contactEmail.trim() || !contactEmail.includes("@")) {
      return setSubmitError("Please specify a valid official contact email address.");
    }
    if (!description.trim() || description.length < 15) {
      return setSubmitError("Please write a meaningful short overview of at least 15 characters.");
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/institutions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name.trim(),
          type,
          category: registrationMode === "academic" ? "academic" : "non-academic",
          location: location.trim(),
          website: website.trim(),
          contactEmail: contactEmail.trim().toLowerCase(),
          contactPhone: contactPhone.trim(),
          enrollmentSize: enrollmentSize ? Number(enrollmentSize) : undefined,
          description: description.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit institution registration parameters.");
        return;
      }

      setSubmitSuccess(true);
      onAddNotification(
        "Registration Logged",
        registrationMode === "academic"
          ? `Your academic registration for "${name}" is logged.`
          : `Your non-academic/individual study circle "${name}" is registered.`
      );

      // Reset Form fields
      setName("");
      setLocation("");
      setWebsite("");
      setContactEmail("");
      setContactPhone("");
      setEnrollmentSize("");
      setDescription("");
      
      // Refresh list
      fetchInstitutions();

      // Close the form modal/view after a brief delay
      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(false);
      }, 3000);

    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred during submission.");
    }
  };

  const isStudentIndividual = currentUser?.role === "student" && !currentUser?.isAcademicAffiliated;

  const filteredInstitutions = institutions.filter((inst) => {
    // If student is registered independently, they cannot find other Academic Institutions
    const isAcademicInst = inst.category === "academic" || !inst.category;
    if (isStudentIndividual && isAcademicInst) {
      return false; // hide academic institutions
    }

    const matchesSearch = 
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inst.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check main Category tab
    const matchesCategory = 
      activeCategoryTab === "all" || 
      inst.category === activeCategoryTab ||
      (!inst.category && activeCategoryTab === "academic"); // fallback for old data

    const matchesType = filterType === "all" || inst.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans" id="institutions-registry-portal">
      
      {/* Header Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-8 md:p-12 shadow-xl mb-10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-655/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-violet-655/15 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3.5 py-1 text-[10px] font-extrabold text-indigo-300 tracking-widest uppercase mb-4 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            CodeCraft Global Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Academic Institutions Directory
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Establish programmatic curriculum linkages, register your computer science division or school, and sync offline study guides under automated classroom workspaces.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Register College / School
            </button>
            <a
              href="#active-registered-list"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 px-5 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Explore Registered ({institutions.length})
            </a>
          </div>
        </div>
      </div>

      {/* Draft Registration Form Overlay Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col my-8 max-h-[90vh]">
            
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Academic Registration Form
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Submit school or collegiate profiles for vetting. Approved profiles synchronize campus logins.
                </p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-805 transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Error notifications */}
            {submitError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-900/50 p-3.5 text-xs text-red-650 dark:text-red-400 font-medium">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-505" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Success feedback state */}
            {submitSuccess ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <CheckCircle className="h-14 w-14 text-emerald-500 animate-[bounce_1s_infinite] mb-4" />
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Submission Logged Successfully!</h4>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  An academic supervisor will review your registration schema. You can view approved listings in the main tab directory shortly.
                </p>
              </div>
            ) : (
              // Form scroll body
              <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                
                {/* Visual Auth Reminder for guests */}
                {!currentUser && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-250 dark:border-amber-900/60 p-3 text-xs text-amber-800 dark:text-amber-400 font-medium mb-1">
                    <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Registering as Guest</p>
                      <p className="text-[11px] leading-relaxed mt-0.5">
                        You can register without an account, but logging in binds this registration to your profile.
                        <button 
                          type="button" 
                          onClick={() => { setShowForm(false); onOpenAuth(); }}
                          className="ml-1 text-indigo-600 dark:text-indigo-400 underline hover:font-bold border-none bg-transparent cursor-pointer"
                        >
                          Sign In / Sign Up
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* Registration Category Selector */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 mb-2">
                  <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                    Are you representing an Academic Institution or registering as an Individual group? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegistrationMode("academic")}
                      className={`px-4 py-3 rounded-lg border text-left flex flex-col transition cursor-pointer ${
                        registrationMode === "academic"
                          ? "border-indigo-650 bg-indigo-50/55 dark:bg-indigo-950/20 text-slate-950 dark:text-white ring-2 ring-indigo-500/20"
                          : "border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <span className="text-xs font-extrabold flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400">
                        <Building2 className="w-4 h-4 shrink-0" /> Academic Institution
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 leading-tight font-medium">
                        Prescribed schools, vocational colleges, universities, or degree institutes.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegistrationMode("individual")}
                      className={`px-4 py-3 rounded-lg border text-left flex flex-col transition cursor-pointer ${
                        registrationMode === "individual"
                          ? "border-indigo-650 bg-indigo-50/55 dark:bg-indigo-950/20 text-slate-950 dark:text-white ring-2 ring-indigo-500/20"
                          : "border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <span className="text-xs font-extrabold flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400">
                        <Users className="w-4 h-4 shrink-0" /> Individual / Non-Academic
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 leading-tight font-medium">
                        Private tutoring hubs, developer clubs, independent bootcamps, or self-study circles.
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      {registrationMode === "academic" ? "Institution Name *" : "Group or Individual Hub Name *"}
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder={registrationMode === "academic" ? "e.g., California Institute of Tech" : "e.g., Pasadena self-study circles"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden placeholder:text-slate-400 focus:border-indigo-600 transition"
                    />
                  </div>

                  {/* Type of institution selection dropdown */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Classification Type *
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-600 transition cursor-pointer"
                    >
                      {registrationMode === "academic" ? (
                        <>
                          <option value="school">Primary/Secondary School</option>
                          <option value="college">Technical Undergrad College</option>
                          <option value="university">Vested Research University</option>
                        </>
                      ) : (
                        <>
                          <option value="bootcamp">Technology Bootcamp / Training Academy</option>
                          <option value="studyclub">Independent Study Club / Circle</option>
                          <option value="other">Private Mentoring / Learning Support Hub</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address/Location */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Location / Physical Address *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Pasadena, California, USA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden placeholder:text-slate-400 focus:border-indigo-600 transition"
                    />
                  </div>

                  {/* Website URL */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Official Web URL
                    </label>
                    <input 
                      type="url" 
                      placeholder="e.g., https://www.caltech.edu"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden placeholder:text-slate-400 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Contact Email address */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Admissions / Contact Email *
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g., cs_registrar@university.edu"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden placeholder:text-slate-400 focus:border-indigo-600 transition"
                    />
                  </div>

                  {/* Enrollment size */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Enrollment Scale
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g., 4500"
                      value={enrollmentSize}
                      onChange={(e) => setEnrollmentSize(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden placeholder:text-slate-400 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>

                {/* Telephone */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                    Academic Phone / Office Contact
                  </label>
                  <input 
                    type="tel" 
                    placeholder="e.g., +1 (626) 395-6811"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden placeholder:text-slate-400 focus:border-indigo-600 transition"
                  />
                </div>

                {/* Short Overview Description */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                    Brief Institution Overview * (At least 15 characters)
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe computing courses offered, active labs, computer science clubs, or training initiatives..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden placeholder:text-slate-400 focus:border-indigo-600 transition"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-805 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-850 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-405 hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5.5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition cursor-pointer"
                  >
                    Submit Parameters
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Main Filter and Directory Search section */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-6" id="active-registered-list">
        
        {isStudentIndividual && (
          <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Academic Directory Isolation Enabled</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-405 mt-1 leading-normal">
                You are registered as an **Individual/Non-Academic student**. Under platform compliance guidelines, other official Academic College and School registries are hidden from your directories. You can only view non-academic training circles or register your own self-study club.
              </p>
            </div>
          </div>
        )}

        {/* Banner with heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Registered Affiliates & Study Guilds Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explore established computer science divisions, academic institutions, and student-powered self-study blocks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input field */}
            <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, city, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden placeholder:text-slate-505 focus:border-indigo-600 transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Categories Tab Separator */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Main Category Category Filtering Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-800/50 shrink-0">
            <button
              onClick={() => { setActiveCategoryTab("all"); setFilterType("all"); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeCategoryTab === "all"
                  ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-xs"
                  : "text-slate-550 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              All Hubs ({institutions.length})
            </button>
            <button
              onClick={() => { setActiveCategoryTab("academic"); setFilterType("all"); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === "academic"
                  ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-xs"
                  : "text-slate-550 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <School className="w-3.5 h-3.5" />
              Academic Colleges ({institutions.filter(i => i.category === "academic" || !i.category).length})
            </button>
            <button
              onClick={() => { setActiveCategoryTab("non-academic"); setFilterType("all"); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === "non-academic"
                  ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-xs"
                  : "text-slate-550 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Non-Academic / Individual Circles ({institutions.filter(i => i.category === "non-academic").length})
            </button>
          </div>

          {/* Sub-type filter controls based on selection */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 shrink-0">Subtype:</span>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-800/80">
              <button
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg transition-colors cursor-pointer ${
                  filterType === "all"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                All
              </button>

              {activeCategoryTab !== "non-academic" && (
                <>
                  <button
                    onClick={() => setFilterType("school")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg transition-colors cursor-pointer ${
                      filterType === "school"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Schools
                  </button>
                  <button
                    onClick={() => setFilterType("college")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg transition-colors cursor-pointer ${
                      filterType === "college"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Colleges
                  </button>
                  <button
                    onClick={() => setFilterType("university")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg transition-colors cursor-pointer ${
                      filterType === "university"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Universities
                  </button>
                </>
              )}

              {activeCategoryTab !== "academic" && (
                <>
                  <button
                    onClick={() => setFilterType("bootcamp")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg transition-colors cursor-pointer ${
                      filterType === "bootcamp"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Bootcamps
                  </button>
                  <button
                    onClick={() => setFilterType("studyclub")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg transition-colors cursor-pointer ${
                      filterType === "studyclub"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Study Clubs
                  </button>
                  <button
                    onClick={() => setFilterType("other")}
                    className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg transition-colors cursor-pointer ${
                      filterType === "other"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Other Individual
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500 font-mono">Syncing institutional records from databases...</p>
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/60 p-12 text-center shadow-xs">
          <Building2 className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-600 mb-3" />
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No registered profiles found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            No matching registered institutions currently match your query filter. Be the first to add your regional institution parameters!
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Vette Your School/College Profile
          </button>
        </div>
      ) : (
        /* Institutions Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredInstitutions.map((inst) => {
            const isSchool = inst.type === "school";
            const isUniv = inst.type === "university";
            const isBootcamp = inst.type === "bootcamp";
            const isClub = inst.type === "studyclub";
            const isAcademic = inst.category === "academic" || !inst.category;
            
            return (
              <div 
                key={inst.id}
                className={`group relative rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between ${
                  isAcademic 
                    ? "border-slate-150/70 dark:border-slate-850" 
                    : "border-indigo-100 dark:border-indigo-950/50 hover:border-indigo-300"
                }`}
                id={`inst-card-${inst.id}`}
              >
                {/* Top header parameters */}
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className={`p-2.5 rounded-xl ${
                      isSchool 
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                        : isUniv 
                          ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400'
                          : isBootcamp
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : isClub
                              ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400'
                              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {isSchool && <School className="h-4.5 w-4.5" />}
                      {isUniv && <GraduationCap className="h-4.5 w-4.5" />}
                      {isBootcamp && <Sparkles className="h-4.5 w-4.5" />}
                      {isClub && <Users className="h-4.5 w-4.5" />}
                      {!isSchool && !isUniv && !isBootcamp && !isClub && <Building2 className="h-4.5 w-4.5" />}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Category Pill Tag */}
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        isAcademic 
                          ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          : "bg-indigo-100 text-indigo-850 dark:bg-indigo-955/20 dark:text-indigo-300"
                      }`}>
                        {isAcademic ? "Academic" : "Individual"}
                      </span>

                      {/* Classification Badge tag */}
                      <span className={`text-[8.5px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        isSchool 
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-300"
                          : isUniv
                            ? "bg-violet-100 text-violet-800 dark:bg-violet-955/20 dark:text-violet-300"
                            : isBootcamp
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-955/20 dark:text-emerald-300"
                              : isClub
                                ? "bg-pink-100 text-pink-800 dark:bg-pink-955/20 dark:text-pink-300"
                                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-955/20 dark:text-indigo-300"
                      }`}>
                        {inst.type}
                      </span>
                      
                      {/* Status Tag ONLY if pending */}
                      {inst.status === "pending" && (
                        <span className="text-[8.5px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-205 dark:bg-slate-805 dark:border-slate-750 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 animate-pulse" />
                          Reviewing
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="mt-4 font-sans text-[14px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {inst.name}
                  </h4>

                  <span className="inline-flex items-center gap-1 mt-1.5 text-[10.5px] font-medium text-slate-455 dark:text-slate-400">
                    <MapPin className="h-3 w-3 text-slate-410" />
                    {inst.location}
                  </span>

                  <p className="mt-3.5 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3 select-text">
                    {inst.description}
                  </p>
                </div>

                {/* Footer details row */}
                <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-850 text-[10.5px] font-medium text-slate-500 dark:text-slate-405 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${inst.contactEmail}`} className="underline hover:text-indigo-500 select-all">{inst.contactEmail}</a>
                    </span>
                    {inst.enrollmentSize && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {inst.enrollmentSize.toLocaleString()} body
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {inst.website ? (
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        <a 
                          href={inst.website} 
                          target="_blank" 
                          rel="referrer" 
                          referrerPolicy="no-referrer"
                          className="hover:text-indigo-500 transition underline select-all"
                        >
                          Visit website
                        </a>
                      </span>
                    ) : (
                      <span />
                    )}

                    {inst.contactPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span className="select-all">{inst.contactPhone}</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
