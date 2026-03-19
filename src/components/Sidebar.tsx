"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen, Users, CalendarDays,
  MapPin, UserCheck, Compass,
  Wallet, Receipt, TrendingDown, PieChart,
  ClipboardCheck, GraduationCap,
  BarChart2, MessageSquare,
  Heart, Shield, FileText,
  Settings, LogOut, ChevronDown,
  TreePine, LucideIcon
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavChild = { label: string; href: string };
type NavLeaf  = { label: string; icon: LucideIcon; href: string };
type NavGroup = { label: string; icon: LucideIcon; children: NavChild[] };
type NavItem  = NavLeaf | NavGroup;
type NavSection = { section: string; items: NavItem[] };

function hasChildren(item: NavItem): item is NavGroup {
  return "children" in item;
}
const NAV: NavSection[] = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ],
  },
  {
    section: "Course Administration",
    items: [
      {
        label: "Course Administration",
        icon: BookOpen,
        children: [
          { label: "Course Management",  href: "/dashboard/courses" },
          { label: "Batch Management",   href: "/dashboard/batch-management" },
          { label: "Academic Planning",  href: "/dashboard/academic-planning" },
        ],
      },
    ],
  },
  {
    section: "Tours & Field Exercises",
    items: [
      {
        label: "Tours & Field Exercises",
        icon: MapPin,
        children: [
          { label: "Tour Planning",                href: "/dashboard/tour-planning" },
          { label: "Faculty & Leadership Assign.",  href: "/dashboard/tour-leadership" },
          { label: "Tour Monitoring",              href: "/dashboard/tour-monitoring" },
        ],
      },
    ],
  },
  {
    section: "Training Fund Management",
    items: [
      {
        label: "Training Fund Management",
        icon: Wallet,
        children: [
          { label: "Fund Overview",      href: "/dashboard/fund-overview" },
          { label: "Fund Transactions",  href: "/dashboard/fund-transactions" },
          { label: "Expense Monitoring", href: "/dashboard/expense-monitoring" },
          { label: "Financial Insights", href: "/dashboard/financial-insights" },
        ],
      },
    ],
  },
  {
    section: "Academic Monitoring",
    items: [
      {
        label: "Academic Monitoring",
        icon: ClipboardCheck,
        children: [
          { label: "Attendance Monitoring",  href: "/dashboard/attendance" },
          { label: "Trainee Performance",    href: "/dashboard/trainee-performance" },
        ],
      },
    ],
  },
  {
    section: "Faculty & Training Oversight",
    items: [
      {
        label: "Faculty & Training Oversight",
        icon: UserCheck,
        children: [
          { label: "Assignment Tracking",    href: "/dashboard/faculty-assignment" },
          { label: "Expense Tracking",       href: "/dashboard/faculty-expenses" },
          { label: "Performance Review",     href: "/dashboard/faculty-performance" },
        ],
      },
    ],
  },
  {
    section: "Feedback & Evaluation",
    items: [
      {
        label: "Feedback & Evaluation",
        icon: MessageSquare,
        children: [
          { label: "Feedback Review",    href: "/dashboard/feedback-review" },
          { label: "Analytics & Reports", href: "/dashboard/analytics" },
        ],
      },
    ],
  },
  {
    section: "Trainee Support & Discipline",
    items: [
      {
        label: "Trainee Support & Discipline",
        icon: Heart,
        children: [
          { label: "Counsellor & Mentor Mgmt", href: "/dashboard/counsellor-mentor" },
          { label: "Duty Officer Assignment",  href: "/dashboard/duty-officer" },
          { label: "Memo Management",          href: "/dashboard/memos" },
        ],
      },
    ],
  },
];

const BOTTOM_NAV = [
  { label: "Settings", icon: Settings, href: "#" },
  { label: "Log out",  icon: LogOut,   href: "/login", danger: true },
];

// ─── Component ──────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();

  // Track which group labels are open
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setOpen(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="w-[240px] h-full bg-[#163e27] flex flex-col shrink-0 overflow-y-auto sidebar-scrollbar border-r border-[#10301d] z-20 shadow-xl">

      {/* Logo */}
      <div className="h-[60px] px-5 flex items-center gap-3 shrink-0 border-b border-[#1d4d31]">
        <div className="w-7 h-7 flex items-center justify-center bg-[#215738] rounded-md shadow-sm text-[#7fd6a3]">
          <TreePine className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-bold tracking-wider text-white serif-font mt-0.5">CASFOS</h1>
      </div>

      {/* Nav */}
      <div className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto sidebar-scrollbar">

        {NAV.map(group => (
          <div key={group.section} className="mb-1">
            {/* no section labels */}


            {group.items.map((item: NavItem) => {
              // ── Flat link (no children) ──
              if (!hasChildren(item)) {
                const href = (item as NavLeaf).href;
                const active = pathname === href;
                return (
                  <Link key={item.label} href={href}
                    className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group
                      ${active
                        ? "bg-[#225838] text-white"
                        : "text-[#a2b7a9] hover:bg-[#1d4d31] hover:text-white"}`}>
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#83e0ab] rounded-r-md" />}
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-semibold">{item.label}</span>
                  </Link>
                );
              }

              // ── Collapsible group ──
              const isOpen = open[item.label] ?? false;
              const anyChildActive = item.children.some((c: NavChild) => pathname === c.href);

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group
                      ${anyChildActive || isOpen
                        ? "bg-[#1d4d31] text-white"
                        : "text-[#a2b7a9] hover:bg-[#1d4d31] hover:text-white"}`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-semibold flex-1 text-left leading-tight">{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown children */}
                  {isOpen && (
                    <div className="mt-0.5 ml-3 pl-3 border-l border-[#2a6042] flex flex-col gap-0.5 py-1">
                      {item.children.map((child: NavChild) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link key={child.label} href={child.href}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150
                              ${childActive
                                ? "bg-[#225838] text-white"
                                : "text-[#8fb8a0] hover:bg-[#1d4d31] hover:text-white"}`}>
                            <span className="w-1 h-1 rounded-full bg-current opacity-50 shrink-0" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Bottom links */}
        <div className="mt-4 pt-4 border-t border-[#1d4d31] flex flex-col gap-0.5">
          {BOTTOM_NAV.map(item => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150
                ${item.danger
                  ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  : "text-[#a2b7a9] hover:bg-[#1d4d31] hover:text-white"}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-[13px] font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>

      </div>

      {/* Profile */}
      <div className="p-3 shrink-0 border-t border-[#1d4d31]">
        <div className="flex items-center gap-2.5 hover:bg-[#1d4d31] p-2 rounded-lg transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#276641] flex items-center justify-center text-white font-bold text-xs shrink-0">
            VS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-white truncate">Dr. Vidhya Shree</span>
            <span className="text-[10px] text-[#8aa393] leading-none mt-0.5 font-medium truncate">director@casfos.gov.in</span>
          </div>
        </div>
      </div>

    </aside>
  );
}
