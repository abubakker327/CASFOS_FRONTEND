"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Edit2, Archive, Eye, Filter, ArrowRight, ArrowLeft,
  Users, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight,
  TrendingDown, BookOpen, Plus, X
} from "lucide-react";
import { cn } from "../../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type BatchStatus = "Draft" | "Active" | "Full" | "Archived";
type BatchType = "Induction" | "In-Service" | "Special";
type Gender = "Male" | "Female" | "Other" | "All";
type ServiceType = "IFS" | "SFS" | "Other" | "All";
type EnrollmentStatus = "Enrolled" | "Pending" | "Withdrawn" | "All";

interface Batch {
  id: string;
  code: string;
  name: string;
  type: BatchType;
  capacity: number;
  status: BatchStatus;
  traineeIds: string[]; // List of assigned trainee IDs
}

interface Trainee {
  id: string;
  rollNumber: string;
  name: string;
  gender: Gender;
  serviceType: ServiceType;
  enrollmentStatus: EnrollmentStatus;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE_BATCHES: Batch[] = [
  { id: "b1", code: "IFS-2026-A", name: "2026 IFS Batch A", type: "Induction", capacity: 40, status: "Active", traineeIds: ["t1", "t2", "t3"] },
  { id: "b2", code: "SFS-2026-B", name: "2026 SFS Batch B", type: "Induction", capacity: 30, status: "Full", traineeIds: ["t4", "t5", "t6", "t7"] },
  { id: "b3", code: "GIS-ADV", name: "GIS Special Group", type: "In-Service", capacity: 20, status: "Draft", traineeIds: [] },
  { id: "b4", code: "WLF-25", name: "Wildlife Management '25", type: "Special", capacity: 25, status: "Archived", traineeIds: ["t8", "t9"] },
];

const SAMPLE_TRAINEES: Trainee[] = [
  { id: "t1", rollNumber: "R26-001", name: "Rahul Sharma", gender: "Male", serviceType: "IFS", enrollmentStatus: "Enrolled" },
  { id: "t2", rollNumber: "R26-002", name: "Priya Desai", gender: "Female", serviceType: "IFS", enrollmentStatus: "Enrolled" },
  { id: "t3", rollNumber: "R26-003", name: "Amit Kumar", gender: "Male", serviceType: "IFS", enrollmentStatus: "Pending" },
  { id: "t4", rollNumber: "R26-004", name: "Sneha Reddy", gender: "Female", serviceType: "SFS", enrollmentStatus: "Enrolled" },
  { id: "t5", rollNumber: "R26-005", name: "Vikram Singh", gender: "Male", serviceType: "SFS", enrollmentStatus: "Enrolled" },
  { id: "t6", rollNumber: "R26-006", name: "Anjali Gupta", gender: "Female", serviceType: "SFS", enrollmentStatus: "Withdrawn" },
  { id: "t7", rollNumber: "R26-007", name: "Rohan Verma", gender: "Male", serviceType: "SFS", enrollmentStatus: "Pending" },
  { id: "t8", rollNumber: "R26-008", name: "Kavita R", gender: "Female", serviceType: "Other", enrollmentStatus: "Enrolled" },
  { id: "t9", rollNumber: "R26-009", name: "Arjun Nair", gender: "Male", serviceType: "Other", enrollmentStatus: "Enrolled" },
  { id: "t10", rollNumber: "R26-010", name: "Meera Patel", gender: "Female", serviceType: "IFS", enrollmentStatus: "Enrolled" },
  { id: "t11", rollNumber: "R26-011", name: "Suresh Pillai", gender: "Male", serviceType: "IFS", enrollmentStatus: "Enrolled" },
  { id: "t12", rollNumber: "R26-012", name: "Neha Joshi", gender: "Female", serviceType: "SFS", enrollmentStatus: "Pending" },
];

// Badge styling helper
const badgeStyles: Record<BatchStatus, string> = {
  "Draft": "bg-gray-100 text-gray-700 border-gray-200",
  "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Full": "bg-amber-50 text-amber-700 border-amber-200",
  "Archived": "bg-slate-100 text-slate-500 border-slate-200"
};

const serviceStyles: Record<string, string> = {
  "IFS": "bg-blue-50 text-blue-700",
  "SFS": "bg-indigo-50 text-indigo-700",
  "Other": "bg-gray-100 text-gray-700"
};

type TransferDirection = "assign" | "remove";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BatchManagementPage() {
  const [batches, setBatches] = useState<Batch[]>(SAMPLE_BATCHES);
  const [trainees] = useState<Trainee[]>(SAMPLE_TRAINEES);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(SAMPLE_BATCHES[0].id);

  const selectedBatch = useMemo(() => batches.find(b => b.id === selectedBatchId), [batches, selectedBatchId]);

  // Filters
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<Gender>("All");
  const [serviceFilter, setServiceFilter] = useState<ServiceType>("All");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus>("All");

  // Selection
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    direction: TransferDirection;
    traineeIds: string[];
    warning?: string;
  } | null>(null);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    code: "", course: "", startDate: "", endDate: "", capacity: 30, instructor: ""
  });

  // Derived state
  const assignedTrainees = useMemo(() => {
    if (!selectedBatch) return [];
    return trainees.filter(t => selectedBatch.traineeIds.includes(t.id));
  }, [selectedBatch, trainees]);

  const availableTrainees = useMemo(() => {
    if (!selectedBatch) return [];
    return trainees.filter(t => {
      if (selectedBatch.traineeIds.includes(t.id)) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.rollNumber.toLowerCase().includes(search.toLowerCase())) return false;
      if (genderFilter !== "All" && t.gender !== genderFilter) return false;
      if (serviceFilter !== "All" && t.serviceType !== serviceFilter) return false;
      if (statusFilter !== "All" && t.enrollmentStatus !== statusFilter) return false;
      return true;
    });
  }, [selectedBatch, trainees, search, genderFilter, serviceFilter, statusFilter]);

  // Reset selections when changing batch
  useEffect(() => {
    setSelectedAvailable(new Set());
    setSelectedAssigned(new Set());
  }, [selectedBatchId]);

  const toggleAvailable = (id: string) => {
    const next = new Set(selectedAvailable);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAvailable(next);
  };

  const toggleAssigned = (id: string) => {
    const next = new Set(selectedAssigned);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAssigned(next);
  };

  const selectAllAvailable = () => {
    if (selectedAvailable.size === availableTrainees.length && availableTrainees.length > 0) {
      setSelectedAvailable(new Set());
    } else {
      setSelectedAvailable(new Set(availableTrainees.map(t => t.id)));
    }
  };

  const selectAllAssigned = () => {
    if (selectedAssigned.size === assignedTrainees.length && assignedTrainees.length > 0) {
      setSelectedAssigned(new Set());
    } else {
      setSelectedAssigned(new Set(assignedTrainees.map(t => t.id)));
    }
  };

  const initiateTransfer = (direction: TransferDirection) => {
    if (!selectedBatch) return;

    if (direction === "assign") {
      const ids = Array.from(selectedAvailable);
      if (ids.length === 0) return;

      const newTotal = selectedBatch.traineeIds.length + ids.length;
      let warning;
      if (newTotal > selectedBatch.capacity) {
        warning = `Adding ${ids.length} trainees will exceed the batch capacity by ${newTotal - selectedBatch.capacity}. Proceed anyway?`;
      }
      setConfirmModal({ open: true, direction, traineeIds: ids, warning });
    } else {
      const ids = Array.from(selectedAssigned);
      if (ids.length === 0) return;
      setConfirmModal({ open: true, direction, traineeIds: ids });
    }
  };

  const executeTransfer = () => {
    if (!selectedBatch || !confirmModal) return;

    const { direction, traineeIds } = confirmModal;

    setBatches(prev => prev.map(b => {
      if (b.id !== selectedBatch.id) return b;
      let newIds = [...b.traineeIds];
      if (direction === "assign") {
        newIds.push(...traineeIds);
        setSelectedAvailable(new Set());
      } else {
        newIds = newIds.filter(id => !traineeIds.includes(id));
        setSelectedAssigned(new Set());
      }
      
      // Auto-update status if full
      let status = b.status;
      if (status !== "Archived") {
         if (newIds.length >= b.capacity) status = "Full";
         else if (newIds.length > 0 && status === "Full") status = "Active";
      }

      return { ...b, traineeIds: newIds, status };
    }));

    setConfirmModal(null);
  };

  const updateBatchStatus = (id: string, newStatus: BatchStatus) => {
    setBatches(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };


  return (
    <div className="flex h-[calc(100vh-60px)] bg-gray-50 overflow-hidden relative border-t border-gray-200">
      
      {/* ── LEFT PANEL: Batch List ── */}
      <div className="w-[320px] shrink-0 bg-white border-r border-gray-200 flex flex-col z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#111827] serif-font tracking-tight">Batches</h2>
            <p className="text-[12px] text-gray-500 font-medium mt-1">Select a batch to manage allocation</p>
          </div>
          <button onClick={() => setCreateModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-[#163e27] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#1d4d31] transition-all shadow-[0_4px_12px_rgba(22,62,39,0.2)] hover:shadow-[0_6px_16px_rgba(22,62,39,0.3)] hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Create New Batch
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 nav-scrollbar bg-gray-50/50">
          {batches.map(batch => {
            const isSelected = selectedBatchId === batch.id;
            const fillPct = Math.min(100, Math.round((batch.traineeIds.length / batch.capacity) * 100));
            const isOver = batch.traineeIds.length > batch.capacity;

            return (
              <div
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer relative group",
                  isSelected 
                    ? "bg-[#163e27] border-[#163e27] shadow-md shadow-[#163e27]/20" 
                    : "bg-white border-gray-200 hover:border-[#163e27]/30 hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={cn("text-[14px] font-bold leading-tight", isSelected ? "text-white" : "text-gray-900")}>
                      {batch.name}
                    </h3>
                    <p className={cn("text-[11px] font-mono mt-0.5", isSelected ? "text-[#83e0ab]" : "text-gray-500")}>
                      {batch.code} • {batch.type}
                    </p>
                  </div>
                  <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full border", 
                    isSelected ? "bg-white/10 text-white border-white/20" : badgeStyles[batch.status]
                  )}>
                    {!isSelected && <span className="w-1 h-1 rounded-full currentColor opacity-75 bg-current" />}
                    {batch.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center text-[11px] mb-1.5 font-bold">
                    <span className={isSelected ? "text-white/80" : "text-gray-500"}>Capacity</span>
                    <span className={cn(isSelected ? "text-white" : isOver ? "text-red-600" : "text-gray-700")}>
                      {batch.traineeIds.length} / {batch.capacity}
                    </span>
                  </div>
                  <div className={cn("h-1.5 rounded-full overflow-hidden", isSelected ? "bg-white/20" : "bg-gray-100")}>
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", 
                        isSelected ? "bg-[#83e0ab]" : isOver ? "bg-red-500" : "bg-[#163e27]"
                      )}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                <div className={cn("absolute right-4 bottom-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", 
                  isSelected ? "hidden" : "block"
                )}>
                   <button onClick={(e) => { e.stopPropagation(); updateBatchStatus(batch.id, "Archived"); }} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Archive">
                      <Archive className="w-3.5 h-3.5" />
                   </button>
                   <button className="p-1.5 text-gray-400 hover:text-[#163e27] hover:bg-[#f0f8f3] rounded-lg transition-colors" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL: Allocation Workspace ── */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {selectedBatch ? (
          <>
            {/* Top Bar Workspace Info */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
               <div>
                  <h2 className="text-[20px] font-extrabold text-gray-900 serif-font">Trainee Allocation: {selectedBatch.name}</h2>
                  <p className="text-[13px] text-gray-500 font-medium mt-1">
                    Manage participants for this batch. Select trainees and move them between available and assigned lists.
                  </p>
               </div>
               {selectedBatch.traineeIds.length >= selectedBatch.capacity && selectedBatch.status !== "Archived" && (
                 <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200">
                   <AlertTriangle className="w-4 h-4" />
                   <span className="text-[12px] font-bold">Capacity Full</span>
                 </div>
               )}
            </div>

            {/* Filters */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0 gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search available trainees..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                  <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
                  <select 
                    value={genderFilter} onChange={e => setGenderFilter(e.target.value as Gender)}
                    className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer pr-6 py-1"
                  >
                    <option value="All">All Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="w-px h-4 bg-gray-200" />
                  <select 
                    value={serviceFilter} onChange={e => setServiceFilter(e.target.value as ServiceType)}
                    className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer pr-6 py-1"
                  >
                    <option value="All">All Services</option>
                    <option value="IFS">IFS</option>
                    <option value="SFS">SFS</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="w-px h-4 bg-gray-200" />
                  <select 
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value as EnrollmentStatus)}
                    className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer pr-6 py-1"
                  >
                    <option value="All">All Status</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dual List Box Area */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden min-h-0 bg-[#fbfcfb]">
              
              {/* Left Column: Available */}
              <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-w-0">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-bold text-gray-800">Available Trainees</h3>
                    <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{availableTrainees.length}</span>
                  </div>
                  <button 
                    onClick={selectAllAvailable}
                    className="text-[11px] font-bold text-[#163e27] hover:underline"
                  >
                    {selectedAvailable.size === availableTrainees.length && availableTrainees.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {availableTrainees.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => toggleAvailable(t.id)}
                      className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border",
                        selectedAvailable.has(t.id) ? "bg-[#f0f8f3] border-[#83e0ab]" : "border-transparent"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedAvailable.has(t.id)} 
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-[#163e27] focus:ring-[#163e27] border-gray-300" 
                      />
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900 truncate">{t.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">{t.rollNumber}</p>
                        </div>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", serviceStyles[t.serviceType])}>
                          {t.serviceType}
                        </span>
                      </div>
                    </div>
                  ))}
                  {availableTrainees.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      <Users className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-[13px] font-medium">No trainees match the current filters.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Controls */}
              <div className="flex flex-col items-center justify-center gap-4 shrink-0 px-2">
                <button
                  onClick={() => initiateTransfer("assign")}
                  disabled={selectedAvailable.size === 0}
                  className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all shadow-sm",
                    selectedAvailable.size > 0 
                      ? "bg-[#163e27] text-white hover:bg-[#1d4d31] hover:shadow-md hover:scale-105" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                  title="Assign to Batch"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="text-[11px] font-bold text-gray-400">
                  {selectedAvailable.size > 0 && `${selectedAvailable.size} sel` }
                </div>
                <button
                  onClick={() => initiateTransfer("remove")}
                  disabled={selectedAssigned.size === 0}
                  className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all shadow-sm",
                    selectedAssigned.size > 0 
                      ? "bg-white border-2 border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 hover:scale-105" 
                      : "bg-gray-100 text-gray-400 border-2 border-transparent cursor-not-allowed"
                  )}
                  title="Remove from Batch"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Right Column: Assigned */}
              <div className="flex-1 flex flex-col bg-white border border-[#83e0ab] rounded-2xl shadow-sm overflow-hidden min-w-0 ring-1 ring-[#163e27]/5">
                <div className="px-5 py-4 border-b border-[#e2efe8] bg-[#f0f8f3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-bold text-[#163e27]">Assigned to Batch</h3>
                    <span className="bg-[#163e27] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{assignedTrainees.length}</span>
                  </div>
                  <button 
                    onClick={selectAllAssigned}
                    className="text-[11px] font-bold text-[#163e27] hover:underline"
                  >
                    {selectedAssigned.size === assignedTrainees.length && assignedTrainees.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {assignedTrainees.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => toggleAssigned(t.id)}
                      className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-rose-50/50 transition-colors border",
                        selectedAssigned.has(t.id) ? "bg-rose-50 border-rose-200" : "border-transparent"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedAssigned.has(t.id)} 
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-gray-300" 
                      />
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900 truncate">{t.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">{t.rollNumber}</p>
                        </div>
                        <ShieldCheck className="w-4 h-4 text-[#83e0ab]" />
                      </div>
                    </div>
                  ))}
                  {assignedTrainees.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      <BookOpen className="w-8 h-8 mb-2 opacity-30 text-[#163e27]" />
                      <p className="text-[13px] font-medium">No trainees assigned yet.<br/>Select from the left to assign.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Users className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-600">No Batch Selected</h3>
            <p className="text-[14px]">Choose a batch from the left panel to manage its trainees.</p>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[200] grid place-items-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
              onClick={() => setConfirmModal(null)} 
            />
            <motion.div initial={{scale:0.95, y:15, opacity:0}} animate={{scale:1, y:0, opacity:1}} exit={{scale:0.95, y:15, opacity:0}}
              className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-sm overflow-hidden"
            >
              <div className={cn("px-6 py-4 flex items-center gap-3", confirmModal.direction === "assign" ? (confirmModal.warning ? "bg-amber-50" : "bg-[#f0f8f3]") : "bg-rose-50")}>
                {confirmModal.warning ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : confirmModal.direction === "assign" ? <CheckCircle2 className="w-5 h-5 text-[#163e27]" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                <h3 className={cn("text-[15px] font-bold", confirmModal.direction === "assign" ? (confirmModal.warning ? "text-amber-900" : "text-[#163e27]") : "text-rose-900")}>
                  {confirmModal.direction === "assign" ? "Confirm Assignment" : "Confirm Removal"}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                  Are you sure you want to {confirmModal.direction === "assign" ? "assign" : "remove"} <strong className="text-gray-900">{confirmModal.traineeIds.length}</strong> selected trainees {confirmModal.direction === "assign" ? "to" : "from"} <strong className="text-gray-900">{selectedBatch?.name}</strong>?
                </p>
                {confirmModal.warning && (
                  <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-3 text-[12px] text-amber-800 font-medium leading-relaxed">
                    <strong>Warning:</strong> {confirmModal.warning}
                  </div>
                )}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button onClick={() => setConfirmModal(null)} className="px-4 py-2 rounded-lg text-gray-600 text-[13px] font-bold hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={executeTransfer} 
                    className={cn("px-5 py-2 rounded-lg text-[13px] font-bold text-white transition-colors shadow-sm",
                      confirmModal.direction === "assign" ? "bg-[#163e27] hover:bg-[#1d4d31]" : "bg-rose-600 hover:bg-rose-700"
                    )}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create Batch Modal ── */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-[200] grid place-items-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
              onClick={() => setCreateModalOpen(false)} 
            />
            <motion.div initial={{scale:0.96, y:15, opacity:0}} animate={{scale:1, y:0, opacity:1}} exit={{scale:0.96, y:15, opacity:0}}
              className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h2 className="text-[20px] font-bold text-[#1f2937] serif-font tracking-tight">
                    Create New Batch
                  </h2>
                  <p className="text-[13px] text-[#6b7280] font-medium mt-1">
                    Define batch parameters for the selected training course.
                  </p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-8 overflow-y-auto min-h-0 bg-[#fbfcfb] flex-1">
                <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                  
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">
                      Batch ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., CY-2026-04"
                      value={newBatch.code}
                      onChange={e => setNewBatch(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#f8fafc] border-2 border-[#163e27]/20 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">
                      Course <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={newBatch.course}
                        onChange={e => setNewBatch(prev => ({ ...prev, course: e.target.value }))}
                        className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all pr-10"
                      >
                        <option value="" disabled>Select course</option>
                        <option value="IFS Foundation">IFS Foundation Course</option>
                        <option value="SFS Induction">SFS Induction</option>
                        <option value="Advanced GIS">Advanced GIS & Remote Sensing</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newBatch.startDate}
                      onChange={e => setNewBatch(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">
                      End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newBatch.endDate}
                      onChange={e => setNewBatch(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">
                      Max Capacity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 30"
                      value={newBatch.capacity || ""}
                      onChange={e => setNewBatch(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">
                      Lead Instructor <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Col. A. Sharma"
                      value={newBatch.instructor}
                      onChange={e => setNewBatch(prev => ({ ...prev, instructor: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all"
                    />
                  </div>

                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 bg-white border-t border-gray-100 px-8 py-5 flex items-center justify-end gap-4">
                <button 
                  onClick={() => setCreateModalOpen(false)} 
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-[#4b5563] font-bold text-[14px] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Placeholder for actual creation logic
                    setCreateModalOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-sm bg-[#163e27] hover:bg-[#1d4d31]"
                >
                  Create Batch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

