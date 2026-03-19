"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Edit2, User, Clock, BookOpen, MapPin,
  AlertCircle, ChevronDown, Save, Trash2
} from "lucide-react";
import { cn } from "../../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
type Session = {
  id: string;
  day: Day;
  startHour: number;   // 8–17
  duration: number;    // in whole hours
  subject: string;
  faculty: string;
  topic?: string;
  room?: string;
  isSubstituted?: boolean;
  originalFaculty?: string;
};

const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_FULL: Record<Day, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday",
};
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM → 5 PM

const FACULTY_LIST = [
  "Dr. Rajesh Kumar", "Dr. Priya Sharma", "Prof. Venkatesh Rao",
  "Dr. Anita Menon", "Prof. Suresh Nair", "Dr. Mahesh Patel",
  "Prof. Kavitha Iyer", "Dr. Arun Krishnamurthy", "Prof. Deepa Thomas",
  "Dr. Sanjay Gupta",
];
const SUBJECTS = [
  "Forest Ecology", "Wildlife Management", "GIS & Remote Sensing",
  "Forest Laws & Policy", "Silviculture", "Biodiversity Conservation",
  "Environmental Impact Assessment", "Forest Working Plan", "Agroforestry",
  "Carbon Sequestration", "Physical Training", "Field Exercises",
];

// Per-subject colours
type ColourSet = { pill: string; header: string; light: string; dot: string };
const COLOURS: Record<string, ColourSet> = {
  "Forest Ecology":          { pill:"bg-emerald-100 border-emerald-200 text-emerald-900", header:"bg-emerald-200 text-emerald-900", light:"bg-emerald-50 border-emerald-200 text-emerald-900", dot:"bg-emerald-400" },
  "Wildlife Management":     { pill:"bg-violet-100 border-violet-200 text-violet-900",  header:"bg-violet-200 text-violet-900",  light:"bg-violet-50 border-violet-200 text-violet-900",   dot:"bg-violet-400"  },
  "GIS & Remote Sensing":    { pill:"bg-blue-100 border-blue-200 text-blue-900",    header:"bg-blue-200 text-blue-900",    light:"bg-blue-50 border-blue-200 text-blue-900",         dot:"bg-blue-400"    },
  "Forest Laws & Policy":    { pill:"bg-amber-100 border-amber-200 text-amber-900",   header:"bg-amber-200 text-amber-900",   light:"bg-amber-50 border-amber-200 text-amber-900",      dot:"bg-amber-400"   },
  "Silviculture":            { pill:"bg-teal-100 border-teal-200 text-teal-900",    header:"bg-teal-200 text-teal-900",    light:"bg-teal-50 border-teal-200 text-teal-900",         dot:"bg-teal-400"    },
  "Biodiversity Conservation":{ pill:"bg-green-100 border-green-200 text-green-900",  header:"bg-green-200 text-green-900",   light:"bg-green-50 border-green-200 text-green-900",      dot:"bg-green-500"   },
  "Environmental Impact Assessment":{ pill:"bg-orange-100 border-orange-200 text-orange-900", header:"bg-orange-200 text-orange-900", light:"bg-orange-50 border-orange-200 text-orange-900", dot:"bg-orange-400" },
  "Forest Working Plan":     { pill:"bg-cyan-100 border-cyan-200 text-cyan-900",    header:"bg-cyan-200 text-cyan-900",    light:"bg-cyan-50 border-cyan-200 text-cyan-900",         dot:"bg-cyan-400"    },
  "Agroforestry":            { pill:"bg-lime-100 border-lime-200 text-lime-900",    header:"bg-lime-200 text-lime-900",    light:"bg-lime-50 border-lime-200 text-lime-900",         dot:"bg-lime-500"    },
  "Carbon Sequestration":    { pill:"bg-sky-100 border-sky-200 text-sky-900",     header:"bg-sky-200 text-sky-900",     light:"bg-sky-50 border-sky-200 text-sky-900",            dot:"bg-sky-400"     },
  "Physical Training":       { pill:"bg-red-100 border-red-200 text-red-900",     header:"bg-red-200 text-red-900",     light:"bg-red-50 border-red-200 text-red-900",            dot:"bg-red-400"     },
  "Field Exercises":         { pill:"bg-indigo-100 border-indigo-200 text-indigo-900",  header:"bg-indigo-200 text-indigo-900",  light:"bg-indigo-50 border-indigo-200 text-indigo-900",   dot:"bg-indigo-400"  },
  default:                   { pill:"bg-gray-100 border-gray-200 text-gray-900",    header:"bg-gray-200 text-gray-900",    light:"bg-gray-50 border-gray-200 text-gray-900",         dot:"bg-gray-400"    },
};
const clr = (s: string) => COLOURS[s] ?? COLOURS.default;
function fmt(h: number) { return `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`; }

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE: Session[] = [
  { id:"1",  day:"Mon", startHour:8,  duration:2, subject:"Forest Ecology",          faculty:"Dr. Rajesh Kumar",        topic:"Ecosystem Dynamics",         room:"Lecture Hall A" },
  { id:"2",  day:"Mon", startHour:11, duration:1, subject:"GIS & Remote Sensing",    faculty:"Prof. Venkatesh Rao",     topic:"Introduction to GIS",        room:"Lab 2" },
  { id:"3",  day:"Mon", startHour:14, duration:2, subject:"Silviculture",            faculty:"Dr. Anita Menon",         topic:"Forest Regeneration Methods", room:"Lecture Hall B" },
  { id:"4",  day:"Tue", startHour:8,  duration:1, subject:"Physical Training",       faculty:"Prof. Suresh Nair",       room:"Ground" },
  { id:"5",  day:"Tue", startHour:10, duration:2, subject:"Wildlife Management",     faculty:"Dr. Priya Sharma",        topic:"Habitat Assessment",         room:"Lecture Hall A" },
  { id:"6",  day:"Tue", startHour:14, duration:2, subject:"Forest Laws & Policy",    faculty:"Prof. Kavitha Iyer",      topic:"Wildlife Protection Act",     room:"Lecture Hall C" },
  { id:"7",  day:"Wed", startHour:9,  duration:2, subject:"Biodiversity Conservation",faculty:"Dr. Mahesh Patel",       topic:"Protected Area Management",   room:"Lecture Hall A" },
  { id:"8",  day:"Wed", startHour:14, duration:1, subject:"Environmental Impact Assessment",faculty:"Dr. Arun Krishnamurthy", room:"Lecture Hall B" },
  { id:"9",  day:"Thu", startHour:8,  duration:2, subject:"Forest Working Plan",     faculty:"Prof. Deepa Thomas",      topic:"Working Plan Preparation",    room:"Lecture Hall A" },
  { id:"10", day:"Thu", startHour:11, duration:1, subject:"Carbon Sequestration",    faculty:"Dr. Sanjay Gupta",        topic:"Carbon Credits & REDD+",      room:"Lecture Hall C" },
  { id:"11", day:"Thu", startHour:14, duration:2, subject:"Agroforestry",            faculty:"Dr. Rajesh Kumar",        topic:"Farm Forestry Systems",       room:"Field" },
  { id:"12", day:"Fri", startHour:8,  duration:1, subject:"Physical Training",       faculty:"Prof. Suresh Nair",       room:"Ground" },
  { id:"13", day:"Fri", startHour:10, duration:2, subject:"Field Exercises",         faculty:"Dr. Priya Sharma",        topic:"Field Survey Techniques",     room:"Field" },
  { id:"14", day:"Fri", startHour:14, duration:2, subject:"GIS & Remote Sensing",    faculty:"Prof. Venkatesh Rao",     topic:"Satellite Image Analysis",    room:"Lab 2" },
];

// ─── Empty form factory ───────────────────────────────────────────────────────
const emptyForm = (day?: Day, hour?: number): Omit<Session,"id"> => ({
  day: day ?? "Mon", startHour: hour ?? 9, duration: 1,
  subject: SUBJECTS[0], faculty: FACULTY_LIST[0],
  topic: "", room: "", isSubstituted: false, originalFaculty: "",
});

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AcademicPlanningPage() {
  const [sessions, setSessions] = useState<Session[]>(SAMPLE);
  const [detail,   setDetail]   = useState<Session | null>(null);
  const [subModal, setSubModal] = useState(false);      // substitute faculty modal
  const [subName,  setSubName]  = useState("");
  const [modal,    setModal]    = useState<{ mode:"create"|"edit"; session?: Session; day?: Day; hour?: number } | null>(null);
  const [form,     setForm]     = useState<Omit<Session,"id">>(emptyForm());

  // helpers
  const openCreate = (day: Day, hour: number) => {
    setForm(emptyForm(day, hour)); setModal({ mode:"create", day, hour }); setDetail(null);
  };
  const openEdit = (s: Session) => {
    setForm({ ...s }); setModal({ mode:"edit", session: s }); setDetail(null);
  };
  const save = () => {
    if (!form.subject || !form.faculty) return;
    if (modal?.mode === "edit" && modal.session)
      setSessions(p => p.map(s => s.id === modal.session!.id ? { ...form, id: modal.session!.id } : s));
    else
      setSessions(p => [...p, { ...form, id: Date.now().toString() }]);
    setModal(null);
  };
  const del = (id: string) => { setSessions(p => p.filter(s => s.id !== id)); setDetail(null); };

  // Substitute faculty
  const applySubstitute = () => {
    if (!subName.trim() || !detail) return;
    setSessions(p => p.map(s => s.id === detail.id
      ? { ...s, faculty: subName, isSubstituted: true, originalFaculty: s.isSubstituted ? s.originalFaculty : s.faculty }
      : s));
    setDetail(prev => prev ? { ...prev, faculty: subName, isSubstituted: true, originalFaculty: prev.isSubstituted ? prev.originalFaculty : prev.faculty } : null);
    setSubModal(false); setSubName("");
  };
  const clearSubstitute = (s: Session) => {
    const updated = { ...s, faculty: s.originalFaculty ?? s.faculty, isSubstituted: false, originalFaculty: undefined };
    setSessions(p => p.map(x => x.id === s.id ? updated : x));
    setDetail(updated);
  };

  // Get session for a given day+hour (returns session if this slot is covered)
  const sessionAt = (day: Day, hour: number) =>
    sessions.find(s => s.day === day && s.startHour <= hour && s.startHour + s.duration > hour);
  // Is this the starting hour of a session?
  const sessionStart = (day: Day, hour: number) =>
    sessions.find(s => s.day === day && s.startHour === hour);

  const SLOT_H = 64; // px per hour slot

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden bg-[#f7f9f8]">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900 serif-font">Weekly Academic Timetable</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Click any empty cell to schedule a session · Click a session to view details</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 mr-2">
            {Object.entries(COLOURS).filter(([k]) => k !== "default").slice(0,5).map(([subj, c]) => (
              <div key={subj} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full shrink-0", c.dot)}/>
                <span className="text-[10px] text-gray-500 font-medium hidden xl:block">{subj.split(" ")[0]}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setForm(emptyForm()); setModal({ mode:"create" }); }}
            className="flex items-center gap-2 bg-[#163e27] text-white px-4 py-2 rounded-xl font-bold text-[13px] hover:bg-[#1d4d31] transition-colors shadow-md hover:shadow-lg">
            <Plus className="w-4 h-4"/> Add Session
          </button>
        </div>
      </div>

      {/* ── Timetable Grid ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px]">

          {/* Day Headers */}
          <div className="grid sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm"
            style={{ gridTemplateColumns: "72px repeat(5, 1fr)" }}>
            <div className="py-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider border-r border-gray-100"></div>
            {DAYS.map(day => (
              <div key={day} className="py-3 text-center border-r border-gray-100 last:border-0">
                <p className="text-[12px] font-bold text-gray-800 uppercase tracking-wider">{day}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{DAY_FULL[day]}</p>
              </div>
            ))}
          </div>

          {/* Time + Cells */}
          <div className="grid relative" style={{ gridTemplateColumns: "72px repeat(5, 1fr)" }}>

            {/* Time column */}
            <div className="border-r border-gray-100">
              {HOURS.map(h => (
                <div key={h} className="border-b border-gray-100 flex items-start justify-end pr-3 pt-2"
                  style={{ height: `${SLOT_H}px` }}>
                  <span className="text-[11px] text-gray-400 font-semibold">{fmt(h)}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((day, di) => (
              <div key={day} className="border-r border-gray-100 last:border-0 relative"
                style={{ height: `${HOURS.length * SLOT_H}px` }}>

                {/* Hour grid lines + click targets */}
                {HOURS.map((hour, hi) => {
                  const occupied = !!sessionAt(day, hour);
                  return (
                    <div key={hour}
                      style={{ top: hi * SLOT_H, height: SLOT_H, position: "absolute", left: 0, right: 0 }}
                      className={cn("border-b border-gray-100 transition-colors",
                        !occupied ? "hover:bg-[#f0f8f3] cursor-pointer group" : "")}
                      onClick={() => !occupied && openCreate(day, hour)}>
                      {!occupied && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity h-full flex items-center justify-center">
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                            <Plus className="w-3 h-3"/>
                            <span>Add</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Sessions (absolutely positioned) */}
                {sessions.filter(s => s.day === day).map(s => {
                  const top  = (s.startHour - HOURS[0]) * SLOT_H;
                  const height = s.duration * SLOT_H - 3;
                  const c    = clr(s.subject);
                  return (
                    <motion.button
                      key={s.id}
                      layoutId={s.id}
                      onClick={() => setDetail(s)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ top: top + 2, height, position: "absolute", left: 3, right: 3, zIndex: 10 }}
                      className={cn("rounded-xl px-3 py-2 text-left cursor-pointer shadow-sm hover:shadow-md transition-shadow overflow-hidden border", c.pill, "border-white/20")}>
                      <p className="text-[11px] font-black truncate leading-tight">{s.subject}</p>
                      {height > 44 && (
                        <>
                          <p className="text-[10px] opacity-80 font-medium truncate mt-0.5">{s.faculty}</p>
                          {s.isSubstituted && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full mt-1 font-bold">
                              <AlertCircle className="w-2.5 h-2.5"/> Sub
                            </span>
                          )}
                        </>
                      )}
                      <p className="text-[9px] opacity-70 mt-auto pt-1 font-semibold">{fmt(s.startHour)} – {fmt(s.startHour + s.duration)}</p>
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Session Detail Card ──────────────────────────────────────────── */}
      <AnimatePresence>
        {detail && (
          <>
            {/* Backdrop */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-40" onClick={() => { setDetail(null); setSubModal(false); }}/>

            <motion.div
              initial={{opacity:0, scale:0.95, y:12}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:8}}
              className="fixed bottom-7 right-7 w-88 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
              style={{ width: 340 }}>
              {/* Coloured header */}
              <div className={cn("px-5 py-4", clr(detail.subject).pill)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider opacity-80">{DAY_FULL[detail.day]} · {fmt(detail.startHour)} – {fmt(detail.startHour + detail.duration)}</p>
                    <h3 className="text-[15px] font-bold mt-0.5 leading-tight">{detail.subject}</h3>
                    {detail.topic && <p className="text-[11px] opacity-80 mt-0.5 truncate">{detail.topic}</p>}
                  </div>
                  <button onClick={() => setDetail(null)} className="opacity-50 hover:opacity-100 transition-opacity shrink-0 p-0.5">
                    <X className="w-4 h-4"/>
                  </button>
                </div>
              </div>

              {/* Detail rows */}
              <div className="p-5 flex flex-col gap-3">
                {/* Faculty */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-gray-500"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Faculty</p>
                    <p className="text-[13px] font-bold text-gray-900 mt-0.5">{detail.faculty}</p>
                    {detail.isSubstituted && detail.originalFaculty && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0"/>
                        <p className="text-[10px] text-amber-600 font-semibold">Substituting {detail.originalFaculty}</p>
                        <button onClick={() => clearSubstitute(detail)}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold underline ml-1">
                          Revert
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timing */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-gray-500"/>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Timing</p>
                    <p className="text-[13px] font-bold text-gray-900 mt-0.5">{fmt(detail.startHour)} – {fmt(detail.startHour + detail.duration)} ({detail.duration}h)</p>
                  </div>
                </div>

                {/* Room */}
                {detail.room && (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-gray-500"/>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Venue</p>
                      <p className="text-[13px] font-bold text-gray-900 mt-0.5">{detail.room}</p>
                    </div>
                  </div>
                )}

                {/* Substitute faculty inline */}
                <AnimatePresence>
                  {subModal && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                      className="overflow-hidden">
                      <div className="pt-1 pb-2 flex flex-col gap-2">
                        <p className="text-[11px] font-bold text-amber-600">Assign Substitute Faculty</p>
                        <select value={subName} onChange={e => setSubName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[12px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] bg-white">
                          <option value="">— Select Faculty —</option>
                          {FACULTY_LIST.filter(f => f !== detail.faculty).map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={applySubstitute}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#163e27] text-white text-[12px] font-bold hover:bg-[#1d4d31] transition-colors">
                            <Save className="w-3.5 h-3.5"/> Apply
                          </button>
                          <button onClick={() => setSubModal(false)}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="px-5 pb-5 flex gap-2">
                <button onClick={() => { setSubModal(v => !v); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-[12px] font-bold hover:bg-amber-100 transition-colors flex-1 justify-center">
                  <User className="w-3.5 h-3.5"/> Substitute Faculty
                </button>
                <button onClick={() => openEdit(detail)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f0f7f2] text-[#163e27] text-[12px] font-bold hover:bg-[#e0efe8] transition-colors">
                  <Edit2 className="w-3.5 h-3.5"/>
                </button>
                <button onClick={() => del(detail.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
            onClick={e => { if(e.target===e.currentTarget) setModal(null); }}>
            <motion.div initial={{scale:0.96,y:20}} animate={{scale:1,y:0}} exit={{scale:0.96,opacity:0}}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-[16px] font-bold text-gray-900 serif-font">
                  {modal.mode==="create" ? "Schedule Session" : "Edit Session"}
                </h2>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-500"/>
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

                {/* Subject */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Subject *</label>
                  <div className="relative">
                    <select value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))}
                      className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] bg-white pr-9">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Topic / Session Title</label>
                  <input value={form.topic ?? ""} onChange={e => setForm(f=>({...f,topic:e.target.value}))}
                    placeholder="e.g. Ecosystem Dynamics…"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"/>
                </div>

                {/* Faculty */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Teaching Faculty *</label>
                  <div className="relative">
                    <select value={form.faculty} onChange={e => setForm(f=>({...f,faculty:e.target.value}))}
                      className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] bg-white pr-9">
                      {FACULTY_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                  </div>
                </div>

                {/* Day + Start Hour */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Day</label>
                    <div className="relative">
                      <select value={form.day} onChange={e => setForm(f=>({...f,day:e.target.value as Day}))}
                        className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] bg-white pr-9">
                        {DAYS.map(d => <option key={d} value={d}>{DAY_FULL[d]}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Start Time</label>
                    <div className="relative">
                      <select value={form.startHour} onChange={e => setForm(f=>({...f,startHour:Number(e.target.value)}))}
                        className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] bg-white pr-9">
                        {HOURS.map(h => <option key={h} value={h}>{fmt(h)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                </div>

                {/* Duration + Room */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Duration</label>
                    <div className="relative">
                      <select value={form.duration} onChange={e => setForm(f=>({...f,duration:Number(e.target.value)}))}
                        className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] bg-white pr-9">
                        {[1,2,3,4].map(d => <option key={d} value={d}>{d} hour{d>1?"s":""}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Venue / Room</label>
                    <input value={form.room ?? ""} onChange={e => setForm(f=>({...f,room:e.target.value}))}
                      placeholder="e.g. Lecture Hall A"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27]"/>
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setModal(null)}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={save}
                  className="px-5 py-2 rounded-xl bg-[#163e27] text-white text-[13px] font-bold hover:bg-[#1d4d31] transition-colors shadow-sm">
                  {modal.mode==="create" ? "Schedule Session" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
