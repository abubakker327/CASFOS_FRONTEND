"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, X,
  Calendar, MapPin, AlignLeft, Edit2, Trash2, Search, Clock
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType = "course" | "tour" | "exam" | "holiday" | "meeting" | "event";
type CalEvent = {
  id: string; title: string; type: EventType;
  startDate: string; endDate: string;
  startTime?: string; endTime?: string;
  location?: string; description?: string; allDay?: boolean;
};

const EVENT_TYPES: Record<EventType, { label: string; color: string; bg: string; border: string; dot: string; pill: string }> = {
  course:  { label: "Course",   color: "text-teal-700",    bg: "bg-teal-50",    border: "border-teal-300",   dot: "bg-teal-500",    pill: "bg-teal-500 text-white"    },
  tour:    { label: "Tour",     color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-300", dot: "bg-violet-500",  pill: "bg-violet-500 text-white"  },
  exam:    { label: "Exam",     color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-300",  dot: "bg-amber-500",   pill: "bg-amber-500 text-white"   },
  holiday: { label: "Holiday",  color: "text-red-700",     bg: "bg-red-50",     border: "border-red-300",    dot: "bg-red-400",     pill: "bg-red-400 text-white"     },
  meeting: { label: "Meeting",  color: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-300",    dot: "bg-sky-500",     pill: "bg-sky-500 text-white"     },
  event:   { label: "Event",    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300",dot: "bg-emerald-500", pill: "bg-emerald-600 text-white" },
};

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const HOURS  = Array.from({ length: 24 }, (_, i) => i);

function pad(n: number) { return String(n).padStart(2,"0"); }
function toStr(y: number, m: number, d: number) { return `${y}-${pad(m+1)}-${pad(d)}`; }
function todayStr() { const d = new Date(); return toStr(d.getFullYear(), d.getMonth(), d.getDate()); }
function fmtHour(h: number) { if(h===0) return ""; return `${h>12?h-12:h}:00 ${h>=12?"PM":"AM"}`; }
function dayDiff(a: string, b: string) { return Math.round((new Date(b).getTime()-new Date(a).getTime())/86400000); }

const SAMPLE: CalEvent[] = [
  { id:"3",  title:"Mudumalai Wildlife Tour",         type:"tour",    startDate:"2026-03-18", endDate:"2026-03-20", startTime:"06:00", endTime:"20:00", location:"Mudumalai Wildlife Sanctuary" },
  { id:"6",  title:"GIS Lab Examination",             type:"exam",    startDate:"2026-03-12", endDate:"2026-03-12", startTime:"10:00", endTime:"12:00", location:"Lab 2" },
  { id:"7",  title:"Forest Ecology Exam",             type:"exam",    startDate:"2026-03-25", endDate:"2026-03-25", startTime:"09:00", endTime:"11:00", location:"Hall A" },
  { id:"8",  title:"Holi Holiday",                   type:"holiday", startDate:"2026-03-14", endDate:"2026-03-14", allDay:true },
  { id:"9",  title:"Faculty Review Meeting",          type:"meeting", startDate:"2026-03-10", endDate:"2026-03-10", startTime:"14:00", endTime:"15:30", location:"Conference Room" },
  { id:"10", title:"Batch Induction Day",             type:"event",   startDate:"2026-03-05", endDate:"2026-03-05", startTime:"09:00", endTime:"17:00", location:"Auditorium" },
  { id:"11", title:"Coimbatore Forest Division Visit",type:"tour",    startDate:"2026-04-02", endDate:"2026-04-04", startTime:"07:00", endTime:"19:00", location:"Coimbatore Forest Division" },
  { id:"12", title:"Wildlife Management Exam",        type:"exam",    startDate:"2026-04-10", endDate:"2026-04-10", startTime:"10:00", endTime:"12:00", location:"Hall B" },
  { id:"13", title:"Directors Monthly Meeting",       type:"meeting", startDate:"2026-03-31", endDate:"2026-03-31", startTime:"11:00", endTime:"12:00" },
];

// ─── Calendar Panel ───────────────────────────────────────────────────────────
export default function CalendarPanel({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [view,  setView]  = useState<"month"|"week"|"day">("month");
  const [selDate, setSelDate] = useState(todayStr());
  const [events, setEvents]   = useState<CalEvent[]>(SAMPLE);
  const [modal,  setModal]    = useState<{mode:"create"|"edit"; event?: CalEvent; date?: string} | null>(null);
  const [detail, setDetail]   = useState<CalEvent | null>(null);
  const [search, setSearch]   = useState("");

  const makeForm = (date?: string): Omit<CalEvent,"id"> => ({
    title:"", type:"event", startDate: date ?? selDate, endDate: date ?? selDate,
    startTime:"09:00", endTime:"10:00", location:"", description:"", allDay:false,
  });
  const [form, setForm] = useState<Omit<CalEvent,"id">>(makeForm());

  const openCreate = (date?: string) => {
    setForm(makeForm(date)); setModal({ mode:"create", date }); setDetail(null);
  };
  const openEdit = (ev: CalEvent) => {
    setForm({ ...ev }); setModal({ mode:"edit", event: ev }); setDetail(null);
  };
  const save = () => {
    if (!form.title.trim()) return;
    if (modal?.mode === "edit" && modal.event)
      setEvents(p => p.map(e => e.id === modal.event!.id ? { ...form, id: modal.event!.id } : e));
    else
      setEvents(p => [...p, { ...form, id: Date.now().toString() }]);
    setModal(null);
  };
  const del = (id: string) => { setEvents(p => p.filter(e => e.id !== id)); setDetail(null); };

  const prevM = () => { if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const nextM = () => { if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelDate(todayStr()); };

  const filtered = useMemo(() =>
    search ? events.filter(e => e.title.toLowerCase().includes(search.toLowerCase())) : events,
    [events, search]
  );
  const byDate = (d: string) => filtered.filter(e => e.startDate <= d && e.endDate >= d);

  // Mini calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInM  = new Date(year, month+1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const miniCal: Array<{date:string; day:number; cur:boolean}> = [];
  for(let i=firstDay-1;i>=0;i--) {
    const pM=month===0?11:month-1, pY=month===0?year-1:year;
    miniCal.push({ date:toStr(pY,pM,prevDays-i), day:prevDays-i, cur:false });
  }
  for(let d=1;d<=daysInM;d++) miniCal.push({ date:toStr(year,month,d), day:d, cur:true });
  while(miniCal.length%7!==0) {
    const extra = miniCal.length - firstDay - daysInM + 1;
    const nM=month===11?0:month+1, nY=month===11?year+1:year;
    miniCal.push({ date:toStr(nY,nM,extra), day:extra, cur:false });
  }

  const today = todayStr();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[3px] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.97, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.97, y: 8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-[#f7f9f8] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "min(1200px, 96vw)", height: "min(820px, 92vh)" }}
      >
        {/* ── Panel Header ──────────────────────────────────────────────── */}
        <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#f0f7f2] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#163e27]"/>
            </div>
            <h1 className="text-[15px] font-bold text-gray-900 serif-font">Course Calendar</h1>
          </div>
          {/* Toolbar centre */}
          <div className="flex items-center gap-3">
            <button onClick={goToday}
              className="px-3 py-1.5 text-[12px] font-bold border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
              Today
            </button>
            <div className="flex items-center gap-0.5">
              <button onClick={prevM} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft className="w-4 h-4 text-gray-600"/></button>
              <button onClick={nextM} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight className="w-4 h-4 text-gray-600"/></button>
            </div>
            <h2 className="text-[15px] font-bold text-gray-800 serif-font">{MONTHS[month]} {year}</h2>
          </div>
          {/* Right controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {(["month","week","day"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn("px-3.5 py-1.5 rounded-lg text-[12px] font-bold capitalize transition-all",
                    view===v ? "bg-white text-[#163e27] shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                  {v}
                </button>
              ))}
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900">
              <X className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left Sidebar */}
          <div className="w-[220px] shrink-0 bg-white border-r border-gray-100 flex flex-col p-4 gap-5 overflow-y-auto">
            <button onClick={() => openCreate()}
              className="flex items-center justify-center gap-2 bg-[#163e27] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#1d4d31] transition-colors shadow-md w-full">
              <Plus className="w-4 h-4"/> Create Event
            </button>

            {/* Mini calendar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-bold text-gray-800">{MONTHS[month].slice(0,3)} {year}</span>
                <div className="flex gap-0.5">
                  <button onClick={prevM} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft className="w-3.5 h-3.5"/></button>
                  <button onClick={nextM} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight className="w-3.5 h-3.5"/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {["S","M","T","W","T","F","S"].map((d,i) => (
                  <div key={i} className="text-center text-[9px] font-bold text-gray-400 py-1">{d}</div>
                ))}
                {miniCal.map(({ date, day, cur }) => {
                  const isToday = date === today, isSel = date === selDate;
                  const has = byDate(date).length > 0;
                  return (
                    <button key={date} onClick={() => { setSelDate(date); setView("day"); }}
                      className={cn("relative text-center text-[11px] py-1 rounded-md font-medium transition-all",
                        isToday ? "bg-[#163e27] text-white font-bold" :
                        isSel   ? "bg-[#e1efe8] text-[#163e27] font-bold" :
                        cur     ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-50")}>
                      {day}
                      {has && !isToday && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#256242]"/>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Event Types</p>
              <div className="flex flex-col gap-1.5">
                {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(([type, t]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className={cn("w-2.5 h-2.5 rounded-sm shrink-0", t.dot)}/>
                    <span className="text-[11px] text-gray-600 font-medium">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
                className="w-full pl-8 pr-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"/>
            </div>
          </div>

          {/* Calendar Views */}
          <div className="flex-1 overflow-auto">
            {view === "month" && <MonthView calDays={miniCal} todayStr={today} filtered={filtered} onEvent={setDetail} onCreate={openCreate}/>}
            {view === "week"  && <WeekView  selDate={selDate} todayStr={today} byDate={byDate} onEvent={setDetail} onCreate={openCreate}/>}
            {view === "day"   && <DayView   date={selDate}    events={byDate(selDate)} onEvent={setDetail} onCreate={openCreate}/>}
          </div>
        </div>

        {/* ── Event Detail Card ───────────────────────────────────────────── */}
        <AnimatePresence>
          {detail && (
            <motion.div initial={{opacity:0,y:16,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:0.97}}
              className="absolute bottom-7 right-7 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className={cn("px-5 py-4 flex items-start justify-between", EVENT_TYPES[detail.type].bg)}>
                <div className="flex-1 min-w-0">
                  <span className={cn("text-[10px] font-black uppercase tracking-wider", EVENT_TYPES[detail.type].color)}>
                    {EVENT_TYPES[detail.type].label}
                  </span>
                  <h3 className="text-[15px] font-bold text-gray-900 mt-0.5 truncate">{detail.title}</h3>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-700 ml-2 shrink-0">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <div className="p-5 flex flex-col gap-2.5 text-[12px] text-gray-600">
                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0"/>
                  {detail.startDate}{detail.endDate !== detail.startDate ? ` → ${detail.endDate}` : ""}
                  {!detail.allDay && detail.startTime ? ` · ${detail.startTime} – ${detail.endTime}` : ""}
                </div>
                {detail.location    && <div className="flex items-center gap-2"><MapPin    className="w-3.5 h-3.5 text-gray-400 shrink-0"/>{detail.location}</div>}
                {detail.description && <div className="flex items-start gap-2"><AlignLeft className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5"/>{detail.description}</div>}
              </div>
              <div className="px-5 pb-5 flex gap-2">
                <button onClick={() => openEdit(detail)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f0f7f2] text-[#163e27] text-[12px] font-bold hover:bg-[#e0efe8] transition-colors">
                  <Edit2 className="w-3.5 h-3.5"/> Edit
                </button>
                <button onClick={() => del(detail.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5"/> Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
        <AnimatePresence>
          {modal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
              onClick={e => { if(e.target===e.currentTarget) setModal(null); }}>
              <motion.div initial={{scale:0.96,y:20}} animate={{scale:1,y:0}} exit={{scale:0.96,opacity:0}}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <h2 className="text-[16px] font-bold text-gray-900 serif-font">
                    {modal.mode==="create" ? "Create Event" : "Edit Event"}
                  </h2>
                  <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-4 h-4 text-gray-500"/>
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Title *</label>
                    <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
                      placeholder="Event title…"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"/>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Event Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(([type,t]) => (
                        <button key={type} onClick={() => setForm(f=>({...f,type}))}
                          className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all",
                            form.type===type ? `${t.bg} border-2 ${t.border} ${t.color}` : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50")}>
                          <span className={cn("w-2 h-2 rounded-full shrink-0", t.dot)}/>{t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Start Date</label>
                      <input type="date" value={form.startDate} onChange={e => setForm(f=>({...f, startDate:e.target.value, endDate: e.target.value > f.endDate ? e.target.value : f.endDate}))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"/>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">End Date</label>
                      <input type="date" value={form.endDate} min={form.startDate} onChange={e => setForm(f=>({...f, endDate:e.target.value}))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"/>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <button type="button" onClick={() => setForm(f=>({...f,allDay:!f.allDay}))}
                        className={cn("w-9 h-5 rounded-full transition-colors relative shrink-0", form.allDay?"bg-[#163e27]":"bg-gray-200")}>
                        <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all", form.allDay?"left-4":"left-0.5")}/>
                      </button>
                      <span className="text-[12px] font-semibold text-gray-600">All day event</span>
                    </label>
                  </div>

                  {!form.allDay && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Start Time</label>
                        <input type="time" value={form.startTime ?? ""} onChange={e => setForm(f=>({...f,startTime:e.target.value}))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27]"/>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">End Time</label>
                        <input type="time" value={form.endTime ?? ""} onChange={e => setForm(f=>({...f,endTime:e.target.value}))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27]"/>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Location</label>
                    <input value={form.location ?? ""} onChange={e => setForm(f=>({...f,location:e.target.value}))}
                      placeholder="Add location…"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"/>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                    <textarea value={form.description ?? ""} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                      placeholder="Add description…" rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all resize-none"/>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                  <button onClick={() => setModal(null)}
                    className="px-5 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={save}
                    className="px-5 py-2 rounded-xl bg-[#163e27] text-white text-[13px] font-bold hover:bg-[#1d4d31] transition-colors shadow-sm">
                    {modal.mode==="create" ? "Create Event" : "Save Changes"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────
function MonthView({ calDays, todayStr, filtered, onEvent, onCreate }: {
  calDays: Array<{date:string;day:number;cur:boolean}>;
  todayStr: string;
  filtered: CalEvent[];
  onEvent: (e:CalEvent) => void;
  onCreate: (d?:string) => void;
}) {
  const weeks = Array.from({length: calDays.length/7}, (_,w) => calDays.slice(w*7, w*7+7));
  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-gray-100 shrink-0">
        {DAYS.map(d => (
          <div key={d} className="py-2.5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        {weeks.map((week, wi) => {
          const weekStart = week[0].date;
          const weekEnd   = week[6].date;
          const multiEvs = filtered.filter(e =>
            e.startDate !== e.endDate &&
            e.startDate <= weekEnd && e.endDate >= weekStart
          ).sort((a,b) => a.startDate < b.startDate ? -1 : 1);

          type Lane = { endCol: number; ev: CalEvent }[];
          const lanes: Lane[] = [];
          multiEvs.forEach(ev => {
            const cs = Math.max(0, dayDiff(weekStart, ev.startDate));
            let placed = false;
            for (const lane of lanes) {
              const lastEndCol = Math.min(6, dayDiff(weekStart, lane[lane.length-1].ev.endDate));
              if (cs > lastEndCol) { lane.push({ endCol: lastEndCol, ev }); placed = true; break; }
            }
            if (!placed) lanes.push([{ endCol: Math.min(6, dayDiff(weekStart, ev.endDate)), ev }]);
          });

          const singleEvsByDate: Record<string, CalEvent[]> = {};
          week.forEach(({date}) => {
            singleEvsByDate[date] = filtered.filter(e => e.startDate === e.endDate && e.startDate === date);
          });

          return (
            <div key={wi} className="flex-1 flex flex-col border-b border-gray-100 last:border-0 min-h-[110px]">
              <div className="grid grid-cols-7">
                {week.map(({date, day, cur}) => {
                  const isToday = date === todayStr;
                  return (
                    <div key={date} onDoubleClick={() => onCreate(date)}
                      className={cn("border-r border-gray-100 last:border-0 px-1.5 pt-1.5 pb-0.5 group flex items-center justify-between",
                        !cur && "bg-gray-50/40", "hover:bg-[#f0f8f3] transition-colors cursor-pointer")}>
                      <span className={cn("w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-bold",
                        isToday ? "bg-[#163e27] text-white" : !cur ? "text-gray-300" : "text-gray-700")}>
                        {day}
                      </span>
                      <button onClick={e=>{e.stopPropagation();onCreate(date);}}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-200">
                        <Plus className="w-3 h-3 text-gray-500"/>
                      </button>
                    </div>
                  );
                })}
              </div>
              {lanes.map((lane, li) => {
                const cells: React.ReactNode[] = [];
                let col = 0;
                lane.forEach(({ ev }) => {
                  const cs = Math.max(0, dayDiff(weekStart, ev.startDate));
                  const ce = Math.min(6, dayDiff(weekStart, ev.endDate));
                  const span = ce - cs + 1;
                  const isStart = ev.startDate >= weekStart;
                  const isEnd   = ev.endDate   <= weekEnd;
                  if (cs > col) cells.push(<div key={`g${col}`} style={{gridColumn:`span ${cs-col}`}}/>);
                  cells.push(
                    <button key={ev.id} onClick={() => onEvent(ev)}
                      style={{gridColumn:`span ${span}`}}
                      className={cn(
                        "text-left text-[10px] font-bold px-2 py-[3px] truncate hover:brightness-90 transition-all",
                        EVENT_TYPES[ev.type].pill,
                        isStart ? "rounded-l-full ml-0.5" : "rounded-l-none",
                        isEnd   ? "rounded-r-full mr-0.5" : "rounded-r-none"
                      )}>
                      {isStart ? ev.title : ""}
                    </button>
                  );
                  col = ce + 1;
                });
                if (col < 7) cells.push(<div key="gend" style={{gridColumn:`span ${7-col}`}}/>);
                return (
                  <div key={li} className="grid grid-cols-7 mb-0.5">{cells}</div>
                );
              })}
              <div className="grid grid-cols-7 flex-1">
                {week.map(({date, cur}) => (
                  <div key={date} onDoubleClick={() => onCreate(date)}
                    className={cn("border-r border-gray-100 last:border-0 px-1 pb-1 flex flex-col gap-0.5",
                      !cur && "bg-gray-50/40", "hover:bg-[#f0f8f3] transition-colors cursor-pointer")}>
                    {singleEvsByDate[date]?.map(ev => (
                      <button key={ev.id} onClick={e=>{e.stopPropagation();onEvent(ev);}}
                        className={cn("text-left text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate w-full hover:brightness-90 transition-all",
                          EVENT_TYPES[ev.type].pill)}>
                        {!ev.allDay && ev.startTime && <span className="opacity-75 mr-1">{ev.startTime}</span>}
                        {ev.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({ selDate, todayStr, byDate, onEvent, onCreate }: {
  selDate: string; todayStr: string;
  byDate: (d:string) => CalEvent[];
  onEvent: (e:CalEvent) => void;
  onCreate: (d?:string) => void;
}) {
  const base = new Date(selDate);
  const dow  = base.getDay();
  const week = Array.from({length:7},(_,i) => {
    const d = new Date(base); d.setDate(base.getDate()-dow+i);
    return { date:toStr(d.getFullYear(),d.getMonth(),d.getDate()), day:d.getDate(), name:DAYS[i] };
  });
  return (
    <div className="flex flex-col h-full">
      <div className="grid border-b border-gray-100 shrink-0" style={{gridTemplateColumns:"56px repeat(7,1fr)"}}>
        <div/>
        {week.map(wd => (
          <div key={wd.date} className="py-2.5 text-center border-l border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">{wd.name}</p>
            <p className={cn("text-[15px] font-bold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto",
              wd.date===todayStr ? "bg-[#163e27] text-white" : "text-gray-800")}>{wd.day}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(h => (
          <div key={h} className="grid border-b border-gray-50" style={{gridTemplateColumns:"56px repeat(7,1fr)",minHeight:"52px"}}>
            <div className="text-[10px] text-gray-400 font-semibold pr-3 pt-1 text-right">{fmtHour(h)}</div>
            {week.map(wd => {
              const evs = byDate(wd.date).filter(e => !e.allDay && e.startTime && parseInt(e.startTime.split(":")[0])===h);
              return (
                <div key={wd.date} className="border-l border-gray-100 px-1 pt-0.5 hover:bg-[#f0f8f3] transition-colors cursor-pointer"
                  onDoubleClick={() => onCreate(wd.date)}>
                  {evs.map(ev => (
                    <button key={ev.id} onClick={e=>{e.stopPropagation();onEvent(ev);}}
                      className={cn("w-full text-left text-[10px] font-bold px-1.5 py-1 rounded-md mb-0.5 hover:brightness-90 transition-all truncate",
                        EVENT_TYPES[ev.type].pill)}>
                      {ev.startTime} {ev.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Day View ─────────────────────────────────────────────────────────────────
function DayView({ date, events, onEvent, onCreate }: {
  date: string; events: CalEvent[];
  onEvent: (e:CalEvent) => void;
  onCreate: (d?:string) => void;
}) {
  const d = new Date(date);
  const allDay = events.filter(e => e.allDay);
  const timed  = events.filter(e => !e.allDay);
  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-4 border-b border-gray-100 shrink-0">
        <h3 className="text-[14px] font-bold text-gray-900 serif-font">
          {d.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
        </h3>
        {allDay.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {allDay.map(ev => (
              <button key={ev.id} onClick={() => onEvent(ev)}
                className={cn("text-[11px] font-bold px-2.5 py-1 rounded-lg", EVENT_TYPES[ev.type].pill)}>
                {ev.title}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(h => {
          const slotEvs = timed.filter(e => e.startTime && parseInt(e.startTime.split(":")[0])===h);
          return (
            <div key={h} className="flex border-b border-gray-50 min-h-[56px] hover:bg-[#f0f8f3] transition-colors cursor-pointer"
              onDoubleClick={() => onCreate(date)}>
              <div className="w-16 shrink-0 text-[11px] text-gray-400 font-semibold pt-1 pr-4 text-right">{fmtHour(h)}</div>
              <div className="flex-1 pl-3 pt-1 flex flex-col gap-1">
                {slotEvs.map(ev => (
                  <button key={ev.id} onClick={e=>{e.stopPropagation();onEvent(ev);}}
                    className={cn("text-left max-w-2xl rounded-xl px-4 py-2 text-[12px] font-bold hover:brightness-90 transition-all flex items-center justify-between gap-4",
                      EVENT_TYPES[ev.type].pill)}>
                    <span>{ev.title}</span>
                    {ev.location && <span className="flex items-center gap-1 text-[11px] opacity-80 font-semibold"><MapPin className="w-3 h-3"/>{ev.location}</span>}
                    <span className="opacity-80 text-[11px] font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/>{ev.startTime} – {ev.endTime}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
