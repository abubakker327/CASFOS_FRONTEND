"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Eye, Edit2, UploadCloud, Archive, FolderArchive,
  X, ChevronDown, Calendar, Users, FileText, CheckCircle2, AlertCircle, Save,
  FileEdit, Clock, CheckSquare, Globe
} from "lucide-react";
import { cn } from "../../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "Draft" | "Under Review" | "Approved" | "Published" | "Archived";
type Category = "Induction" | "In-Service" | "Special";
type CourseType = "Residential" | "Non-Residential" | "Hybrid";

interface Course {
  id: string;
  code: string;
  name: string;
  category: Category;
  type: CourseType;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: Status;
  updatedAt: string;
  description: string;
  capacity?: number;
  notes?: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE_COURSES: Course[] = [
  {
    id: "1", code: "IFS-2026-01", name: "IFS Foundation Course", category: "Induction", type: "Residential",
    startDate: "2026-06-01", endDate: "2026-08-31", durationDays: 92, status: "Published", updatedAt: "2026-03-01",
    description: "Core foundation training for newly recruited Indian Forest Service officers.", capacity: 60
  },
  {
    id: "2", code: "SFS-2026-02", name: "State Forest Service Induction", category: "Induction", type: "Residential",
    startDate: "2026-09-15", endDate: "2027-03-15", durationDays: 182, status: "Under Review", updatedAt: "2026-03-05",
    description: "Induction training covering core forestry, legal frameworks, and physical fitness.", capacity: 40
  },
  {
    id: "3", code: "GIS-ADV-26", name: "Advanced GIS & Remote Sensing", category: "In-Service", type: "Hybrid",
    startDate: "2026-04-10", endDate: "2026-04-20", durationDays: 11, status: "Draft", updatedAt: "2026-02-28",
    description: "Specialized training on QGIS, ArcGIS, and satellite imagery analysis for working professionals.", capacity: 30
  },
  {
    id: "4", code: "WL-MGT-01", name: "Wildlife Crime Intelligence", category: "Special", type: "Non-Residential",
    startDate: "2026-05-05", endDate: "2026-05-10", durationDays: 6, status: "Published", updatedAt: "2026-01-15",
    description: "Short-term workshop focused on intelligence gathering and anti-poaching operations.", capacity: 25
  },
  {
    id: "5", code: "CLIMATE-25", name: "Carbon Sequestration Workshop", category: "In-Service", type: "Hybrid",
    startDate: "2025-11-01", endDate: "2025-11-05", durationDays: 5, status: "Archived", updatedAt: "2025-11-10",
    description: "Past workshop on climate change mitigation strategies.", capacity: 50
  }
];

// Badge styling helper
const badgeStyles: Record<Status, string> = {
  "Draft": "bg-gray-100 text-gray-700 border-gray-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  "Approved": "bg-blue-50 text-blue-700 border-blue-200",
  "Published": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Archived": "bg-slate-100 text-slate-500 border-slate-200"
};

const categoryBadgeStyles: Record<Category, string> = {
  "Induction": "bg-blue-50 text-blue-700 border-blue-200",
  "In-Service": "bg-violet-50 text-violet-700 border-violet-200",
  "Special": "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calculateDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.floor(ms / 86400000) + 1);
}

function formatDate(ds: string) {
  if (!ds) return "";
  const d = new Date(ds);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const emptyForm = (): Omit<Course, "id" | "updatedAt"> => ({
  code: "", name: "", category: "Induction", type: "Residential",
  startDate: "", endDate: "", durationDays: 0, status: "Draft",
  description: "", capacity: undefined, notes: ""
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES);
  const [search, setSearch] = useState("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Course, "id" | "updatedAt">>(emptyForm());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const filtered = useMemo(() => {
    if (!search) return courses;
    return courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()));
  }, [courses, search]);

  const kpis = useMemo(() => {
    return {
      draft: courses.filter(c => c.status === "Draft").length,
      underReview: courses.filter(c => c.status === "Under Review").length,
      approved: courses.filter(c => c.status === "Approved").length,
      published: courses.filter(c => c.status === "Published").length,
    };
  }, [courses]);

  const openCreate = () => {
    setForm(emptyForm());
    setEditId(null);
    setErrors({});
    setPanelOpen(true);
  };

  const openEdit = (c: Course) => {
    setForm({ ...c });
    setEditId(c.id);
    setErrors({});
    setPanelOpen(true);
  };

  const validate = () => {
    const err: { [key: string]: string } = {};
    if (!form.name.trim()) err.name = "Course Name is required";
    if (!form.code.trim()) err.code = "Course Code is required";
    if (!form.startDate) err.startDate = "Start Date is required";
    if (!form.endDate) err.endDate = "End Date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      err.endDate = "End Date must be after Start Date";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = new Date().toISOString().split("T")[0];

    if (editId) {
      setCourses(prev => prev.map(c => c.id === editId ? { ...form, id: editId, updatedAt: now } : c));
    } else {
      setCourses(prev => [{ ...form, id: Date.now().toString(), updatedAt: now }, ...prev]);
    }
    setPanelOpen(false);
  };

  const updateStatus = (id: string, newStatus: Status) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-gray-50 overflow-hidden relative">

      {/* ── Header ── */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold text-[#111827] serif-font tracking-tight">Course Management</h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Manage all academic courses, durations, and statuses.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#163e27] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#1d4d31] transition-all shadow-[0_4px_12px_rgba(22,62,39,0.2)] hover:shadow-[0_6px_16px_rgba(22,62,39,0.3)] hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Create New Course
          </button>
        </div>
      </div>

      {/* ── Main Data Table ── */}
      <div className="flex-1 overflow-auto p-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: "Draft", val: kpis.draft, icon: FileEdit, grad: "from-slate-500 to-slate-700" },
            { label: "Under Review", val: kpis.underReview, icon: Clock, grad: "from-amber-400 to-amber-600" },
            { label: "Approved", val: kpis.approved, icon: CheckSquare, grad: "from-blue-500 to-blue-700" },
            { label: "Published", val: kpis.published, icon: Globe, grad: "from-[#83e0ab] to-[#163e27]" },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`bg-gradient-to-br ${k.grad} rounded-2xl p-5 text-white shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 cursor-default`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{k.label}</span>
                <k.icon className="w-4 h-4 opacity-70" />
              </div>
              <p className="text-[28px] font-bold serif-font leading-none mb-1">{k.val}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Course Code</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Course Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(course => (
                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-[11px] font-bold rounded-md font-mono border border-gray-200">{course.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-bold text-gray-900">{course.name}</p>
                    <p className="text-[12px] text-gray-500 font-medium truncate max-w-xs">{course.type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full border", categoryBadgeStyles[course.category])}>
                      {course.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-semibold text-gray-800">{formatDate(course.startDate)} <span className="text-gray-400 mx-1">→</span> {formatDate(course.endDate)}</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{course.durationDays} days</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border shadow-sm", badgeStyles[course.status])}>
                      <span className="w-1.5 h-1.5 rounded-full currentColor opacity-75 bg-current" />
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">
                    {formatDate(course.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(course)} className="p-1.5 text-gray-500 hover:text-[#163e27] hover:bg-[#f0f8f3] rounded-lg transition-colors" title="View / Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {course.status !== "Published" && (
                        <button onClick={() => updateStatus(course.id, "Published")} className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors" title="Publish">
                          <UploadCloud className="w-4 h-4" />
                        </button>
                      )}
                      {course.status !== "Archived" && (
                        <button onClick={() => updateStatus(course.id, "Archived")} className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Archive">
                          <FolderArchive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-[14px] font-medium">No courses found matching &quot;{search}&quot;</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Slide-over Form Panel ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] grid place-items-center p-4 sm:p-8"
              onClick={(e) => { if (e.target === e.currentTarget) setPanelOpen(false); }}
            >
              <motion.div
                initial={{ scale: 0.96, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, y: 15, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl z-[101] flex flex-col border border-gray-200 overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h2 className="text-[20px] font-bold text-gray-900 serif-font">
                    {editId ? "Edit Course" : "Create New Course"}
                  </h2>
                  <p className="text-[13px] text-gray-500 font-medium mt-1">
                    Fill out the details below to define the course setup.
                  </p>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 px-8 py-6 flex flex-col gap-10 bg-[#fbfcfb]">

                {/* Section 1: Basic Information */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-[#e2efe8] text-[#163e27] flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-widest">Basic Information</h3>
                  </div>

                  <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
                    <div>
                      <label className="text-[12px] font-bold text-gray-700 mb-1.5 block flex items-center justify-between">
                        Course Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(e => ({ ...e, name: "" })); }}
                        placeholder="e.g. IFS Foundation Course"
                        className={cn("w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white transition-all", errors.name ? "border-red-400 focus:ring-1 focus:ring-red-400" : "border-gray-200 focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27]")}
                      />
                      {errors.name && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Course Code <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={form.code}
                          onChange={e => { setForm(f => ({ ...f, code: e.target.value })); if (errors.code) setErrors(e => ({ ...e, code: "" })); }}
                          placeholder="e.g. IFS-2026"
                          className={cn("w-full px-4 py-2.5 bg-gray-50 border font-mono uppercase rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white transition-all", errors.code ? "border-red-400 focus:ring-1 focus:ring-red-400" : "border-gray-200 focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27]")}
                        />
                        {errors.code ? <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.code}</p> : <p className="text-[11px] text-gray-400 mt-1.5">Must be a unique identifier.</p>}
                      </div>
                      <div>
                        <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Category</label>
                        <div className="relative">
                          <select
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                            className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all pr-10"
                          >
                            <option value="Induction">Induction</option>
                            <option value="In-Service">In-Service</option>
                            <option value="Special">Special</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Course Type</label>
                        <div className="relative">
                          <select
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value as CourseType }))}
                            className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all pr-10"
                          >
                            <option value="Residential">Residential</option>
                            <option value="Non-Residential">Non-Residential</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Status</label>
                        <div className="relative">
                          <select
                            value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
                            className={cn("w-full appearance-none px-4 py-2.5 border rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all pr-10",
                              form.status === "Draft" ? "bg-gray-100 text-gray-700 border-gray-200 focus:ring-gray-300" :
                                form.status === "Under Review" ? "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-300" :
                                  form.status === "Archived" ? "bg-slate-100 text-slate-500 border-slate-200 focus:ring-slate-300" :
                                    "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-300")}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Published">Published</option>
                            <option value="Archived">Archived</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Course Description</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Brief overview of the course objectives and content..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Section 2: Duration */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#e2efe8] text-[#163e27] flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-widest">Course Duration</h3>
                    </div>
                    {form.startDate && form.endDate && !errors.endDate && (
                      <span className="text-[12px] font-bold bg-[#f0f8f3] text-[#163e27] px-2.5 py-1 rounded-lg border border-[#d1e8db]">
                        Total: {calculateDays(form.startDate, form.endDate)} days
                      </span>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Start Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={e => {
                          const sd = e.target.value;
                          setForm(f => ({ ...f, startDate: sd, durationDays: calculateDays(sd, f.endDate) }));
                          if (errors.startDate) setErrors(err => ({ ...err, startDate: "" }));
                        }}
                        className={cn("w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white transition-all", errors.startDate ? "border-red-400 focus:ring-1 focus:ring-red-400" : "border-gray-200 focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27]")}
                      />
                      {errors.startDate && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.startDate}</p>}
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">End Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={form.endDate}
                        min={form.startDate}
                        onChange={e => {
                          const ed = e.target.value;
                          setForm(f => ({ ...f, endDate: ed, durationDays: calculateDays(f.startDate, ed) }));
                          if (errors.endDate) setErrors(err => ({ ...err, endDate: "" }));
                        }}
                        className={cn("w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white transition-all", errors.endDate ? "border-red-400 focus:ring-1 focus:ring-red-400" : "border-gray-200 focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27]")}
                      />
                      {errors.endDate && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.endDate}</p>}
                    </div>
                  </div>
                </section>

                {/* Section 3: Additional Settings */}
                <section className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-[#e2efe8] text-[#163e27] flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-widest">Additional Settings</h3>
                  </div>

                  <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
                    <div>
                      <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Course Capacity (Trainees)</label>
                      <input
                        type="number"
                        min="1"
                        value={form.capacity || ""}
                        onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || undefined }))}
                        placeholder="e.g. 60"
                        className="w-full max-w-[200px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Internal Notes (Optional)</label>
                      <textarea
                        value={form.notes ?? ""}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Any additional instructions or private notes for administrators..."
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all resize-none"
                      />
                    </div>
                  </div>
                </section>

              </div>

              {/* ── Panel Footer ── */}
              <div className="shrink-0 bg-white border-t border-gray-200 px-8 py-5 flex items-center justify-between">
                <div>
                  {Object.keys(errors).length > 0 && (
                    <p className="text-[12px] text-red-500 font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Please fix validation errors.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPanelOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-2 bg-[#163e27] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#1d4d31] transition-all shadow-md hover:shadow-lg">
                    <Save className="w-4 h-4" /> {editId ? "Save Changes" : "Create Course"}
                  </button>
                </div>
              </div>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
