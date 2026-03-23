"use client";

import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import {
  Users, ClipboardCheck, AlertTriangle, CheckCircle2,
  CalendarDays, TrendingUp, TrendingDown, MapPin, Wallet,
  FileText, Bell, ChevronRight, UserCheck, BarChart3,
  IndianRupee, Shield, ArrowUpRight,
  GraduationCap, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, AreaChart, Area
} from "recharts";

// ─── Data ────────────────────────────────────────────────────────────────────

const attendanceWeek = [
  { day: "Mon", present: 92, absent: 8 },
  { day: "Tue", present: 88, absent: 12 },
  { day: "Wed", present: 95, absent: 5 },
  { day: "Thu", present: 85, absent: 15 },
  { day: "Fri", present: 90, absent: 10 },
];

const feedbackData = [
  { subject: "Silviculture", score: 4.6 },
  { subject: "Wildlife", score: 4.2 },
  { subject: "Forest Law", score: 3.9 },
  { subject: "GIS", score: 4.5 },
  { subject: "Env. Sci", score: 4.1 },
];

const batchPie = [
  { name: "Allocated", value: 68 },
  { name: "Pending", value: 20 },
  { name: "Reserved", value: 12 },
];
const PIE_COLORS = ["#166534", "#eab308", "#86efac"];

const fundData = [
  { category: "Tour", amount: 3.2 },
  { category: "Tuition", amount: 1.8 },
  { category: "Institutional", amount: 0.9 },
  { category: "Equipment", amount: 1.1 },
];

const progressTrend = [
  { week: "W1", pct: 8 }, { week: "W2", pct: 14 }, { week: "W3", pct: 19 },
  { week: "W4", pct: 24 }, { week: "W5", pct: 29 }, { week: "W6", pct: 33 }, { week: "W7", pct: 38 },
];

const timetable = [
  { time: "09:00", subject: "Forest Ecology", faculty: "Dr. Aruna Devi", room: "Hall A", color: "emerald" },
  { time: "11:00", subject: "GIS & Remote Sensing", faculty: "Dr. Vikram Nair", room: "Lab 2", color: "sky" },
  { time: "14:00", subject: "Wildlife Management", faculty: "Dr. Priya Rajan", room: "Hall B", color: "violet" },
  { time: "16:00", subject: "Forest Law & Policy", faculty: "Mr. Suresh Kumar", room: "Hall A", color: "amber" },
];

const facultyList = [
  { name: "Dr. Aruna Devi", course: "Forest Ecology", tour: "Mudumalai · Mar 18", expense: "₹12,400", tasks: 2, initial: "A", color: "bg-emerald-100 text-emerald-700" },
  { name: "Dr. Vikram Nair", course: "GIS & Remote Sensing", tour: "—", expense: "₹0", tasks: 0, initial: "V", color: "bg-sky-100 text-sky-700" },
  { name: "Mr. Suresh Kumar", course: "Forest Law", tour: "Coimbatore · Apr 2", expense: "₹5,800", tasks: 1, initial: "S", color: "bg-amber-100 text-amber-700" },
  { name: "Dr. Priya Rajan", course: "Wildlife Mgmt", tour: "—", expense: "₹0", tasks: 3, initial: "P", color: "bg-violet-100 text-violet-700" },
];

const alerts = [
  { type: "danger", msg: "12 trainees below 80% attendance", icon: AlertTriangle },
  { type: "warning", msg: "3 tour journals pending submission", icon: FileText },
  { type: "warning", msg: "Missing feedback · 2 faculty members", icon: Bell },
  { type: "danger", msg: "Training fund balance below ₹50,000", icon: Wallet },
  { type: "info", msg: "5 memo approvals awaiting action", icon: CheckCircle2 },
];

const pendingMemos = [
  { id: "047", subject: "Leave request – Dr. Vikram Nair", date: "Mar 5", priority: "High" },
  { id: "048", subject: "Equipment purchase approval", date: "Mar 6", priority: "Medium" },
  { id: "049", subject: "Extended journal deadline – IFS-B", date: "Mar 6", priority: "High" },
  { id: "050", subject: "Guest faculty payment", date: "Mar 4", priority: "Low" },
];

const atRiskTrainees = [
  { name: "Arjun Mehta", batch: "IFS-A", att: 72 },
  { name: "Kavitha Rao", batch: "IFS-B", att: 68 },
  { name: "Raman Pillai", batch: "SFS-A", att: 75 },
  { name: "Divya Nair", batch: "IFS-A", att: 70 },
];

const card = "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)] hover:-translate-y-0.5";
const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 pb-16 flex flex-col gap-6 max-w-400 mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 serif-font tracking-tight">Course Director Dashboard</h1>
          <p className="text-[12px] text-gray-400 font-medium mt-0.5">IFS Foundation Course 2024–25 · Academic Year Overview</p>
        </div>
        <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live · March 2025
        </span>
      </motion.div>

      {/* ── BENTO ROW 1: KPI Hero Strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Course Duration", val: "167 Days", sub: "Jan 15 – Jun 30", icon: CalendarDays, grad: "from-teal-500 to-teal-700" },
          { label: "Total Batches",   val: "4",        sub: "+1 upcoming",    icon: GraduationCap, grad: "from-violet-500 to-violet-700" },
          { label: "Total Trainees",  val: "148",      sub: "+12 this month", icon: Users,         grad: "from-emerald-500 to-[#1a5c38]" },
          { label: "Total Faculty",   val: "32",       sub: "6 on leave",     icon: UserCheck,     grad: "from-amber-400 to-amber-600" },
        ].map((k, i) => (
          <motion.div key={k.label} custom={i} initial="hidden" animate="visible" variants={fade}
            className={`bg-linear-to-br ${k.grad} rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{k.label}</span>
              <k.icon className="w-4 h-4 opacity-70" />
            </div>
            <p className="text-[28px] font-bold serif-font leading-none mb-1">{k.val}</p>
            <p className="text-[11px] opacity-75 font-semibold">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── BENTO ROW 2: Alerts + Memos (moved to top) ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <motion.div custom={10} initial="hidden" animate="visible" variants={fade} className={card}>
          <div className="p-5 border-b border-gray-100">
            <SectionHeader icon={<Bell className="w-4 h-4" />} title="Alerts & Notifications" sub="Important actions requiring your attention" />
          </div>
          <div className="p-5 flex flex-col gap-2.5">
            {alerts.map((a, i) => (
              <div key={i} className={cn("flex items-start gap-3 px-4 py-3 rounded-xl border text-[12px] transition-all hover:shadow-sm cursor-pointer",
                a.type==="danger"?"bg-red-50 border-red-100 hover:border-red-200":
                a.type==="warning"?"bg-amber-50 border-amber-100 hover:border-amber-200":
                "bg-blue-50 border-blue-100 hover:border-blue-200")}>
                <a.icon className={cn("w-4 h-4 shrink-0 mt-0.5",
                  a.type==="danger"?"text-red-500":a.type==="warning"?"text-amber-500":"text-blue-500")} />
                <span className={cn("font-medium", a.type==="danger"?"text-red-800":a.type==="warning"?"text-amber-800":"text-blue-800")}>{a.msg}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Memos */}
        <motion.div custom={11} initial="hidden" animate="visible" variants={fade} className={card}>
          <div className="p-5 border-b border-gray-100">
            <SectionHeader icon={<FileText className="w-4 h-4" />} title="Memo & Approvals" sub="Pending memos requiring approval" />
          </div>
          <div className="p-5 flex flex-col gap-2">
            {pendingMemos.map(m => (
              <div key={m.id} className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-500 shrink-0">#{m.id}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-900 truncate">{m.subject}</p>
                  <p className="text-[10px] text-gray-400">{m.date}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                  m.priority==="High"?"bg-red-50 text-red-600":m.priority==="Medium"?"bg-amber-50 text-amber-600":"bg-gray-100 text-gray-500")}>{m.priority}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-500 transition-colors shrink-0" />
              </div>
            ))}
            <button className="mt-2 text-[12px] font-bold text-[#256242] hover:text-[#1a4a2e] transition-colors self-end flex items-center gap-1">View all memos <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>
        </motion.div>
      </div>

      {/* ── BENTO ROW 3: Course Progress + Batch Summary ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Progress Area Chart - wide */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fade} className={cn(card, "lg:col-span-2 p-6")}>
          <SectionHeader icon={<Activity className="w-4 h-4" />} title="Course Progress Trend" sub="Weekly progression through the academic calendar" />
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={progressTrend}>
                <defs>
                  <linearGradient id="prog" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#256242" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#256242" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v) => typeof v === 'number' ? [`${v}%`, "Progress"] : null} />
                <Area type="monotone" dataKey="pct" stroke="#256242" strokeWidth={2.5} fill="url(#prog)" dot={{ fill: "#256242", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#256242" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Batch Allocation Donut */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fade} className={cn(card, "p-6 flex flex-col")}>
          <SectionHeader icon={<Users className="w-4 h-4" />} title="Batch Summary" sub="Allocation distribution" />
          <div className="flex flex-col items-center justify-center flex-1 mt-2">
            <ResponsiveContainer width={170} height={140}>
              <PieChart>
                <Pie data={batchPie} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={4}>
                  {batchPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v) => typeof v === 'number' ? [`${v} trainees`] : null} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1">
              {batchPie.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-gray-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
            <MiniStat label="Batches" value="4" />
            <MiniStat label="Per Batch" value="37" />
          </div>
        </motion.div>
      </div>

      {/* ── BENTO ROW 3: Attendance ───────────────────────────────────────── */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fade} className={card}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <SectionHeader icon={<ClipboardCheck className="w-4 h-4" />} title="Attendance Monitoring" sub="Real-time attendance across all batches" />
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: stats + at-risk table */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Total", value: "148", color: "bg-gray-50 border-gray-200 text-gray-800" },
                { label: "Present", value: "133", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                { label: "Absent", value: "15",  color: "bg-red-50 border-red-200 text-red-700" },
                { label: "On Leave", value: "7", color: "bg-amber-50 border-amber-200 text-amber-700" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl px-4 py-3 border ${s.color}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{s.label}</p>
                  <p className="text-[22px] font-bold serif-font leading-tight">{s.value}</p>
                </div>
              ))}
            </div>

            {/* At Risk mini list */}
            <div>
              <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" /> Below 80% Attendance
              </p>
              <div className="rounded-xl overflow-hidden border border-red-100">
                {atRiskTrainees.map((t, i) => (
                  <div key={t.name} className={cn("flex items-center justify-between px-4 py-2.5 text-[12px]", i % 2 === 0 ? "bg-white" : "bg-red-50/40", i < atRiskTrainees.length - 1 && "border-b border-red-50")}>
                    <span className="font-bold text-gray-800">{t.name}</span>
                    <span className="text-gray-500 text-[11px]">{t.batch}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${t.att}%` }} />
                      </div>
                      <span className="font-bold text-red-500 text-[11px] w-8">{t.att}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: weekly bar chart */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">Weekly Attendance</p>
            <ResponsiveContainer width="100%" height={195}>
              <BarChart data={attendanceWeek} barSize={18} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                <Bar dataKey="present" name="Present" fill="#256242" radius={[5, 5, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#fca5a5" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── BENTO ROW 4: Academic Schedule (full width) ───────────────────── */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fade} className={card}>
        <div className="p-6 border-b border-gray-100">
          <SectionHeader icon={<CalendarDays className="w-4 h-4" />} title="Academic Schedule" sub="Today's timetable · Friday, March 6, 2025" />
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timetable */}
          <div className="flex flex-col gap-2.5">
            {timetable.map(t => {
              const colors: Record<string, string> = {
                emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
                sky: "bg-sky-50 border-sky-200 text-sky-700",
                violet: "bg-violet-50 border-violet-200 text-violet-700",
                amber: "bg-amber-50 border-amber-200 text-amber-700",
              };
              const timeColors: Record<string, string> = {
                emerald: "text-emerald-600", sky: "text-sky-600", violet: "text-violet-600", amber: "text-amber-600"
              };
              return (
                <div key={t.time} className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all hover:shadow-md cursor-pointer ${colors[t.color]}`}>
                  <span className={`text-[13px] font-black w-11 shrink-0 ${timeColors[t.color]}`}>{t.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{t.subject}</p>
                    <p className="text-[11px] text-gray-500">{t.faculty}</p>
                  </div>
                  <span className="text-[11px] font-bold bg-white/80 px-2.5 py-1 rounded-lg shrink-0">{t.room}</span>
                </div>
              );
            })}
          </div>
          {/* Faculty mapping + modification alerts */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Modification Alerts</p>
              <div className="flex flex-col gap-2">
                {[
                  { c:"amber", t: "Wildlife Management class rescheduled to Hall C on Mar 8" },
                  { c:"amber", t: "GIS Lab merged with IFS-B batch — capacity check needed" },
                  { c:"red",   t: "Dr. Priya Rajan on leave Mar 10–12 — substitute required" },
                ].map((a, i) => (
                  <div key={i} className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium ${a.c === "red" ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-800 border border-amber-100"}`}>
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{a.t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Faculty – Subject Mapping</p>
              <div className="flex flex-col gap-2">
                {[
                  ["Forest Ecology", "Dr. Aruna Devi", "emerald"],
                  ["GIS & Remote Sensing", "Dr. Vikram Nair", "sky"],
                  ["Wildlife Management", "Dr. Priya Rajan", "violet"],
                  ["Forest Law & Policy", "Mr. Suresh Kumar", "amber"],
                  ["Silviculture", "Dr. Meena Krishnan", "teal"],
                ].map(([sub, fac, c]) => (
                  <div key={sub} className="flex items-center justify-between text-[12px] py-1.5 border-b border-gray-50">
                    <span className="text-gray-600">{sub}</span>
                    <span className={`font-bold text-${c}-700`}>{fac}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── BENTO ROW 5: Faculty + Tour 2-col ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Activity */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fade} className={card}>
          <div className="p-5 border-b border-gray-100">
            <SectionHeader icon={<UserCheck className="w-4 h-4" />} title="Faculty Activity" sub="Responsibilities, tours & pending tasks" />
          </div>
          <div className="p-5 flex flex-col gap-2.5">
            {facultyList.map(f => (
              <div key={f.name} className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                <div className={`w-9 h-9 rounded-full ${f.color} text-[13px] font-black flex items-center justify-center shrink-0`}>{f.initial}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{f.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{f.course} · {f.tour}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-gray-700">{f.expense}</p>
                  {f.tasks > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{f.tasks} pending</span>}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-500 transition-colors" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tour & Field Exercises */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fade} className={card}>
          <div className="p-5 border-b border-gray-100">
            <SectionHeader icon={<MapPin className="w-4 h-4" />} title="Tour & Field Exercises" sub="Upcoming tours and assignments" />
          </div>
          <div className="p-5 flex flex-col gap-3">
            {[
              { name: "Mudumalai Wildlife Field Tour", date: "Mar 18–22, 2025", batch: "IFS-A", leader: "Dr. Aruna Devi", status: "Planned", color: "blue" },
              { name: "Coimbatore Forest Division Visit", date: "Apr 2–3, 2025", batch: "SFS-B", leader: "Mr. Suresh Kumar", status: "Confirmed", color: "emerald" },
            ].map(t => (
              <div key={t.name} className="group rounded-xl border border-gray-100 bg-gray-50 p-4 hover:border-gray-200 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-2.5">
                  <p className="text-[13px] font-bold text-gray-900">{t.name}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${t.color === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{t.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-500">
                  <span>📅 {t.date}</span>
                  <span>🎓 Batch: <b className="text-gray-700">{t.batch}</b></span>
                  <span>👤 Leader: <b className="text-gray-700">{t.leader}</b></span>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-[12px] text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
              <span><b>Journal Alert:</b> IFS-B tour journal deadline extended to Mar 20, 2025.</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── BENTO ROW 6: Training Fund (full width) ───────────────────────── */}
      <motion.div custom={6} initial="hidden" animate="visible" variants={fade} className={cn(card)}>
        <div className="p-6 border-b border-gray-100">
          <SectionHeader icon={<IndianRupee className="w-4 h-4" />} title="Training Fund Summary" sub="Financial overview · IFS Foundation Course 2024–25" />
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-3 gap-4">
            <BigKpi label="Total Fund" value="₹28.5L" trend="+8%" icon={<Wallet />} grad="from-emerald-500 to-emerald-700" />
            <BigKpi label="Expenses" value="₹19.7L" trend="69%" icon={<TrendingDown />} grad="from-red-400 to-red-600" />
            <BigKpi label="Balance" value="₹8.8L" trend="31%" icon={<TrendingUp />} grad="from-sky-400 to-sky-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Expense Breakdown</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={fundData} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="L" />
                <YAxis dataKey="category" type="category" width={90} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v) => typeof v === 'number' ? [`₹${v}L`] : null} />
                <Bar dataKey="amount" radius={[0, 5, 5, 0]}>
                  {fundData.map((_, i) => <Cell key={i} fill={["#166534","#15803d","#4ade80","#86efac"][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── BENTO ROW 7: Caution Deposit + Feedback ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caution Deposit */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={fade} className={card}>
          <div className="p-5 border-b border-gray-100">
            <SectionHeader icon={<Shield className="w-4 h-4" />} title="Caution Deposit" sub="Trainee caution deposit status" />
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <MiniAccentCard label="Total" value="₹1,48,000" color="gray" />
              <MiniAccentCard label="Per Trainee" value="₹1,000" color="gray" />
              <MiniAccentCard label="Interest (YE)" value="₹5,920" color="emerald" />
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-4 bg-gray-50 px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <span>Batch</span><span>Count</span><span>Amount</span><span>Status</span>
              </div>
              {[
                { b:"IFS-A", n:38, a:"₹38,000", s:"Collected" },
                { b:"IFS-B", n:37, a:"₹37,000", s:"Collected" },
                { b:"SFS-A", n:36, a:"₹36,000", s:"Partial" },
                { b:"SFS-B", n:37, a:"₹37,000", s:"Pending" },
              ].map((r, i) => (
                <div key={r.b} className={cn("grid grid-cols-4 px-4 py-2.5 text-[12px] border-b border-gray-50 last:border-0", i%2===0?"bg-white":"bg-gray-50/40")}>
                  <span className="font-bold text-gray-800">{r.b}</span>
                  <span className="text-gray-500">{r.n}</span>
                  <span className="font-semibold text-gray-800">{r.a}</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full w-fit",
                    r.s==="Collected"?"bg-emerald-50 text-emerald-700":r.s==="Partial"?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700")}>{r.s}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Feedback Analytics */}
        <motion.div custom={8} initial="hidden" animate="visible" variants={fade} className={card}>
          <div className="p-5 border-b border-gray-100">
            <SectionHeader icon={<BarChart3 className="w-4 h-4" />} title="Feedback Analytics" sub="Faculty & subject-wise feedback scores" />
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <MiniAccentCard label="Avg Score" value="4.3 / 5" color="emerald" />
              <MiniAccentCard label="Responses" value="142" color="gray" />
              <MiniAccentCard label="Report" value="Week 8" color="sky" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Subject-wise Scores</p>
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={feedbackData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                <Bar dataKey="score" radius={[5, 5, 0, 0]}>
                  {feedbackData.map((d, i) => <Cell key={i} fill={d.score >= 4.4 ? "#166534" : d.score >= 4.0 ? "#4ade80" : "#eab308"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── BENTO ROW 8: Trainee Monitoring (full width) ─────────────────── */}
      <motion.div custom={9} initial="hidden" animate="visible" variants={fade} className={card}>
        <div className="p-6 border-b border-gray-100">
          <SectionHeader icon={<Users className="w-4 h-4" />} title="Trainee Monitoring" sub="Counsellor mapping, mentoring & appraisals" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <BigProgressCard label="Counsellor Mapped" done={148} total={148} color="emerald" />
            <BigProgressCard label="Mentor Mapped" done={136} total={148} color="amber" />
            <BigProgressCard label="Appraisals Done" done={112} total={148} color="sky" />
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-5 bg-gray-50 px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              {["Trainee", "Batch", "Counsellor", "Mentor", "Appraisal"].map(h => <span key={h}>{h}</span>)}
            </div>
            {[
              { name:"Arjun Mehta", batch:"IFS-A", counsellor:"Dr. Devi", mentor:"Mr. Kumar", appraisal:"Done" },
              { name:"Kavitha Rao", batch:"IFS-B", counsellor:"Dr. Nair", mentor:"—", appraisal:"Pending" },
              { name:"Raman Pillai", batch:"SFS-A", counsellor:"Dr. Devi", mentor:"Dr. Rajan", appraisal:"Done" },
              { name:"Divya Nair", batch:"IFS-A", counsellor:"Mr. Kumar", mentor:"Dr. Nair", appraisal:"Pending" },
              { name:"Suresh Babu", batch:"SFS-B", counsellor:"Dr. Rajan", mentor:"Dr. Devi", appraisal:"Done" },
            ].map((r, i) => (
              <div key={r.name} className={cn("grid grid-cols-5 px-5 py-3 text-[12px] border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors", i%2===0?"bg-white":"bg-gray-50/40")}>
                <span className="font-bold text-gray-900">{r.name}</span>
                <span className="text-gray-500">{r.batch}</span>
                <span className="text-gray-700">{r.counsellor}</span>
                <span className={r.mentor === "—" ? "text-red-400 font-bold" : "text-gray-700"}>{r.mentor}</span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full w-fit self-center",
                  r.appraisal==="Done"?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700")}>{r.appraisal}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>


    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#f0f7f2] text-[#256242] flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <h2 className="text-[14px] font-bold text-gray-900 serif-font leading-none">{title}</h2>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-[16px] font-bold text-gray-900 serif-font">{value}</span>
    </div>
  );
}

function BigKpi({ label, value, trend, icon, grad }: { label: string; value: string; trend: string; icon: React.ReactNode; grad: string }) {
  return (
    <div className={`bg-linear-to-br ${grad} rounded-xl p-4 text-white flex flex-col gap-2 hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md`}>
      <div className="flex items-center justify-between opacity-80">
        <div className="w-4 h-4">{icon}</div>
        <span className="text-[11px] font-bold">{trend}</span>
      </div>
      <p className="text-[22px] font-bold serif-font leading-none">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

function MiniAccentCard({ label, value, color }: { label: string; value: string; color: "gray" | "emerald" | "sky" | "amber" }) {
  const map: Record<string, string> = {
    gray:    "bg-gray-50 border-gray-100 text-gray-800",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    sky:     "bg-sky-50 border-sky-100 text-sky-700",
    amber:   "bg-amber-50 border-amber-100 text-amber-700",
  };
  return (
    <div className={cn("rounded-xl px-4 py-3 border", map[color])}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
      <p className="text-[15px] font-bold leading-tight mt-0.5">{value}</p>
    </div>
  );
}

function BigProgressCard({ label, done, total, color }: { label: string; done: number; total: number; color: "emerald" | "amber" | "sky" }) {
  const pct = Math.round((done / total) * 100);
  const bar: Record<string, string> = { emerald: "bg-emerald-500", amber: "bg-amber-400", sky: "bg-sky-500" };
  const border: Record<string, string> = { emerald: "border-emerald-100", amber: "border-amber-100", sky: "border-sky-100" };
  const bg: Record<string, string> = { emerald: "bg-emerald-50", amber: "bg-amber-50", sky: "bg-sky-50" };
  const text: Record<string, string> = { emerald: "text-emerald-700", amber: "text-amber-700", sky: "text-sky-700" };
  return (
    <div className={cn("rounded-xl px-5 py-4 border", bg[color], border[color])}>
      <div className="flex items-end justify-between mb-2">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider", text[color])}>{label}</span>
        <span className={cn("text-[18px] font-bold serif-font", text[color])}>{pct}%</span>
      </div>
      <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-1.5">
        <div className={cn("h-full rounded-full transition-all", bar[color])} style={{ width: `${pct}%` }} />
      </div>
      <p className={cn("text-[11px] font-semibold", text[color])}>{done} / {total}</p>
    </div>
  );
}

// need React for cloneElement
import React from "react";
