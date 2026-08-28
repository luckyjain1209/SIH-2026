import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, FileText, Upload, ClipboardCheck, Bell, MessageSquare,
  User, Settings, HelpCircle, Search, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, ChevronDown, Eye, FileCheck, Building2, Shield, Users,
  History, BarChart3, Download, ArrowLeft, LogOut, Menu, X, Clock,
  TrendingUp, FileWarning, ScrollText, Landmark, Sparkles, CircleSlash,
  FileStack, GitCompare, ChevronsRight, BadgeCheck, Info
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";

/* ============================================================================
   DESIGN TOKENS
   Display: Space Grotesk (institutional but modern, used for headings only)
   Body: Inter
   Mono/utility: IBM Plex Mono (document names, IDs, evidence snippets)
   navy #101B33 sidebar | accent blue #2454FF | bg #F5F7FA
   compliant #158443 | non-compliant #C0341D | review #B4720A
============================================================================ */

const FONT_LINK_ID = "abc-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

const COLORS = {
  navy: "#101B33",
  navy2: "#182644",
  accent: "#2454FF",
  bg: "#F5F7FA",
  border: "#E2E6ED",
  green: "#158443",
  greenBg: "#E7F5EC",
  red: "#C0341D",
  redBg: "#FBEAE7",
  amber: "#B4720A",
  amberBg: "#FCF1DD",
};

/* ============================================================================
   MOCK DATA — this stands in for the PostgreSQL-backed API described in the
   accompanying README. Everything here mirrors the shape of the real schema
   (Tender, TenderRequirement, Bid, ComplianceResult, Anomaly, AuditLog) so the
   UI can later be pointed at real endpoints without restructuring.
============================================================================ */
const vendors = [
  {
    username: "Lucky Solutions",
    password: "vendor123",
    name: "Vendor 1"
  },
  {
    username: "Siya Solutions",
    password: "vendor456",
    name: "Vendor 2"
  },
  {
    username: "Charu Solutions",
    password: "vendor789",
    name: "Vendor 3"
  }
];
const procurementUsers = [
  {
    username: "Ankush Singh",
    password: "ankush@123",
    name: "Procurement Officer"
  },
  {
    username: "procurement2",
    password: "procure456",
    name: "Procurement Officer 2"
  }
];
const VENDOR_USER = {
  name: "LUCKY Solutions Pvt. Ltd.",
  contact: "LUCKY HINGER, Authorized Signatory",
  gstin: "27ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  regNo: "U72900MH2016PTC281334",
  address: "4th Floor, Cyber Towers, Hinjewadi, Pune, Maharashtra 411057",
  verified: true,
};

const OFFICER_USER = {
  name: "Ankush Singh",
  designation: "Procurement Officer, Dept. of Electronics & IT",
  org: "Ministry of Electronics & Information Technology",
};

const REQUIREMENTS = [
  { id: "REQ-T1", cat: "Technical", text: "RAM ≥ 16 GB", mandatory: true, method: "Numeric — Technical Specification" },
  { id: "REQ-T2", cat: "Technical", text: "Storage ≥ 512 GB SSD", mandatory: true, method: "Numeric — Technical Specification" },
  { id: "REQ-T3", cat: "Technical", text: "Processor ≥ Intel Core i5 equivalent", mandatory: true, method: "Semantic match — Technical Specification" },
  { id: "REQ-T4", cat: "Technical", text: "Warranty ≥ 3 years", mandatory: true, method: "Numeric — Warranty Declaration" },
  { id: "REQ-T5", cat: "Technical", text: "BIS certification required", mandatory: true, method: "Document check — BIS Certificate" },
  { id: "REQ-T6", cat: "Technical", text: "OEM authorization required", mandatory: true, method: "Document check — OEM Authorization" },
  { id: "REQ-E1", cat: "Eligibility", text: "Minimum average annual turnover ≥ ₹10 crore", mandatory: true, method: "Numeric — Turnover Certificate" },
  { id: "REQ-E2", cat: "Eligibility", text: "Minimum 3 years relevant experience", mandatory: true, method: "Numeric — Experience Certificate" },
  { id: "REQ-E3", cat: "Eligibility", text: "Valid GST registration", mandatory: true, method: "Document check — GST Certificate" },
  { id: "REQ-E4", cat: "Eligibility", text: "Valid PAN", mandatory: true, method: "Document check — PAN" },
  { id: "REQ-E5", cat: "Eligibility", text: "Required past government supply experience", mandatory: false, method: "Semantic match — Experience Certificate" },
  { id: "REQ-F1", cat: "Financial", text: "Price quotation required", mandatory: true, method: "Document check — Price Bid" },
  { id: "REQ-F2", cat: "Financial", text: "Financial bid format must be followed", mandatory: true, method: "Document check — Financial Statement" },
];

const TENDERS = [
  {
    id: "TND-2026-0142",
    title: "Supply of Laptops to Government Offices",
    dept: "Ministry of Electronics & IT",
    category: "IT Hardware",
    published: "2 Jul 2026",
    deadline: "15 Sep 2026",
    value: "₹4.8 Cr",
    reqCount: REQUIREMENTS.length,
    status: "Active",
    bidStatus: "Submitted",
    complianceStatus: "Needs Review",
  },
  {
    id: "TND-2026-0158",
    title: "Purchase of Office Furniture",
    dept: "Dept. of Administrative Reforms",
    category: "Furniture",
    published: "10 Jul 2026",
    deadline: "30 Sep 2026",
    value: "₹1.2 Cr",
    reqCount: 8,
    status: "Active",
    bidStatus: "Not Submitted",
    complianceStatus: "—",
  },
  {
    id: "TND-2026-0163",
    title: "Procurement of Networking Equipment",
    dept: "National Informatics Centre",
    category: "IT Hardware",
    published: "14 Jul 2026",
    deadline: "5 Oct 2026",
    value: "₹3.1 Cr",
    reqCount: 11,
    status: "Active",
    bidStatus: "Submitted",
    complianceStatus: "Compliant",
  },
  {
    id: "TND-2026-0171",
    title: "Supply of Printers and Scanners",
    dept: "Dept. of Posts",
    category: "IT Hardware",
    published: "18 Jul 2026",
    deadline: "20 Sep 2026",
    value: "₹0.9 Cr",
    reqCount: 9,
    status: "Active",
    bidStatus: "Not Submitted",
    complianceStatus: "—",
  },
  {
    id: "TND-2026-0104",
    title: "Annual Maintenance of IT Systems",
    dept: "Ministry of Electronics & IT",
    category: "IT Services",
    published: "22 Jun 2026",
    deadline: "1 Aug 2026",
    value: "₹2.4 Cr",
    reqCount: 7,
    status: "Closed",
    bidStatus: "Submitted",
    complianceStatus: "Non-Compliant",
  },
  {
    id: "TND-2026-0179",
    title: "Supply of UPS & Power Backup Units",
    dept: "Central Public Works Dept.",
    category: "IT Hardware",
    published: "24 Jul 2026",
    deadline: "12 Oct 2026",
    value: "₹1.6 Cr",
    reqCount: 6,
    status: "Active",
    bidStatus: "Not Submitted",
    complianceStatus: "—",
  },
];

const DOCS = [
  { name: "Company_Registration_Certificate.pdf", type: "Company Registration Certificate" },
  { name: "GST_Certificate.pdf", type: "GST Certificate" },
  { name: "PAN_Card.pdf", type: "PAN" },
  { name: "Turnover_Certificate.pdf", type: "Turnover Certificate" },
  { name: "Financial_Statement.pdf", type: "Financial Statements" },
  { name: "Experience_Certificate.pdf", type: "Experience Certificates" },
  { name: "OEM_Authorization.pdf", type: "OEM Authorization" },
  { name: "BIS_Certificate.pdf", type: "BIS Certificate" },
  { name: "Technical_Specification.pdf", type: "Technical Specification" },
  { name: "Warranty_Declaration.pdf", type: "Warranty Declaration" },
  { name: "Price_Bid.pdf", type: "Price Bid" },
];

// Deterministic, hand-authored compliance findings for LUCKY's laptop bid.
// In production this array is produced by evaluateBid() in /lib/compliance-engine
// running deterministic rules against DocumentExtraction rows (see README).
const LUCKY_FINDINGS = {
  "REQ-T1": { status: "compliant", confidence: 98, found: "16 GB DDR5 RAM", doc: "Technical_Specification.pdf", page: 2, snippet: "System memory: 16GB DDR5, expandable to 32GB." },
  "REQ-T2": { status: "compliant", confidence: 97, found: "512 GB NVMe SSD", doc: "Technical_Specification.pdf", page: 2, snippet: "Primary storage: 512GB NVMe PCIe Gen4 SSD." },
  "REQ-T3": { status: "compliant", confidence: 94, found: "Intel Core i5, 12th Gen", doc: "Technical_Specification.pdf", page: 2, snippet: "Processor: Intel Core i5-1240P, 12th Generation." },
  "REQ-T4": { status: "compliant", confidence: 96, found: "3 years onsite warranty", doc: "Warranty_Declaration.pdf", page: 3, snippet: "The OEM warrants the product for a period of 3 years from delivery, onsite." },
  "REQ-T5": { status: "review", confidence: 71, found: "Certificate present, validity unclear", doc: "BIS_Certificate.pdf", page: 7, snippet: "BIS registration number CRS-EL-0234 issued to manufacturer; renewal date partially illegible." },
  "REQ-T6": { status: "compliant", confidence: 95, found: "Signed OEM authorization letter", doc: "OEM_Authorization.pdf", page: 5, snippet: "We hereby authorize LUCKY Solutions Pvt. Ltd. to bid on our behalf for the referenced tender." },
  "REQ-E1": { status: "compliant", confidence: 99, found: "Average turnover ₹12.4 crore", doc: "Turnover_Certificate.pdf", page: 4, snippet: "Average annual turnover during the previous three financial years: ₹12.4 crore." },
  "REQ-E2": { status: "compliant", confidence: 93, found: "5 years relevant experience", doc: "Experience_Certificate.pdf", page: 6, snippet: "The bidder has supplied IT hardware to government departments continuously since 2021." },
  "REQ-E3": { status: "compliant", confidence: 100, found: "Valid GST 27ABCDE1234F1Z5", doc: "GST_Certificate.pdf", page: 1, snippet: "GSTIN: 27ABCDE1234F1Z5, registered under the CGST Act, 2017." },
  "REQ-E4": { status: "compliant", confidence: 100, found: "Valid PAN ABCDE1234F", doc: "PAN_Card.pdf", page: 1, snippet: "Permanent Account Number: ABCDE1234F." },
  "REQ-E5": { status: "compliant", confidence: 90, found: "3 prior GeM contracts fulfilled", doc: "Experience_Certificate.pdf", page: 6, snippet: "Includes completion certificates for two prior GeM procurement contracts." },
  "REQ-F1": { status: "compliant", confidence: 100, found: "Price quotation present", doc: "Price_Bid.pdf", page: 1, snippet: "Itemized price quotation attached as per prescribed BoQ format." },
  "REQ-F2": { status: "compliant", confidence: 100, found: "Format matches prescribed template", doc: "Financial_Statement.pdf", page: 1, snippet: "Financial bid submitted in the format prescribed under Annexure III." },
};

const BIDDERS = ["HINGER Solutions Pvt. Ltd.", "Digital Infra Private Ltd.", "Global Systems & Services", "Prime Tech Distributors", "Innovative IT Solutions"];

// Simplified per-bidder outcomes for the comparison grid (subset of requirements).
const COMPARISON_REQS = ["REQ-T1", "REQ-T2", "REQ-E1", "REQ-T5", "REQ-E2"];
const COMPARISON_LABELS = { "REQ-T1": "RAM ≥ 16GB", "REQ-T2": "SSD ≥ 512GB", "REQ-E1": "Turnover ≥ ₹10Cr", "REQ-T5": "BIS Certificate", "REQ-E2": "Experience" };

const BIDDER_RESULTS = {
  "HINGER Solutions Pvt. Ltd.": { "REQ-T1": "compliant", "REQ-T2": "compliant", "REQ-E1": "compliant", "REQ-T5": "compliant", "REQ-E2": "compliant", score: 92, missingDocs: 0, reviewItems: 0, anomalies: 0 },
  "Digital Infra Private Ltd.": { "REQ-T1": "compliant", "REQ-T2": "compliant", "REQ-E1": "non-compliant", "REQ-T5": "review", "REQ-E2": "compliant", score: 64, missingDocs: 1, reviewItems: 1, anomalies: 0 },
  "Global Systems & Services": { "REQ-T1": "non-compliant", "REQ-T2": "compliant", "REQ-E1": "compliant", "REQ-T5": "compliant", "REQ-E2": "review", score: 78, missingDocs: 0, reviewItems: 1, anomalies: 0 },
  "Prime Tech Distributors": { "REQ-T1": "compliant", "REQ-T2": "review", "REQ-E1": "review", "REQ-T5": "compliant", "REQ-E2": "compliant", score: 70, missingDocs: 0, reviewItems: 2, anomalies: 1 },
  "Innovative IT Solutions": { "REQ-T1": "compliant", "REQ-T2": "compliant", "REQ-E1": "compliant", "REQ-T5": "compliant", "REQ-E2": "compliant", score: 85, missingDocs: 1, reviewItems: 0, anomalies: 0 },
};

const ANOMALIES = [
  {
    id: "ANM-001",
    bidder: "Prime Tech Distributors",
    tender: "TND-2026-0142",
    type: "Financial inconsistency",
    detail: "Turnover Certificate reports ₹25 crore while the accompanying Financial Statement reports ₹8 crore for the same financial year.",
    status: "Needs Human Review",
  },
  {
    id: "ANM-002",
    bidder: "Digital Infra Private Ltd.",
    tender: "TND-2026-0142",
    type: "Expiring certificate",
    detail: "BIS certificate renewal date could not be confidently extracted and may have lapsed prior to submission.",
    status: "Needs Human Review",
  },
  {
    id: "ANM-003",
    bidder: "Global Systems & Services",
    tender: "TND-2026-0142",
    type: "Company name mismatch",
    detail: "GST Certificate lists \"Global Systems and Services LLP\" while the Company Registration Certificate lists \"Global Systems & Services Pvt. Ltd.\"",
    status: "Needs Human Review",
  },
];

const SEED_AUDIT_LOG = [
  { id: 1, user: "System (AI Engine)", action: "Compliance check completed", tender: "TND-2026-0142", bid: "LUCKY Solutions Pvt. Ltd.", detail: "13 requirements evaluated — 12 compliant, 1 needs review.", time: "28 Aug 2026, 09:12" },
  { id: 2, user: "Rajesh Kulkarni", action: "Reviewed AI finding", tender: "TND-2026-0142", bid: "LUCKY Solutions Pvt. Ltd.", detail: "Opened evidence viewer for REQ-T5 (BIS Certificate).", time: "28 Aug 2026, 10:03" },
];

const NOTIFICATIONS_SEED = [
  { id: 1, text: "Your compliance report for “Supply of Laptops to Government Offices” is ready.", time: "Today, 9:14 AM", unread: true },
  { id: 2, text: "BIS certificate for your laptop bid needs review before final submission.", time: "Today, 9:15 AM", unread: true },
  { id: 3, text: "Bid submission deadline for “Purchase of Office Furniture” is approaching (30 Sep).", time: "Yesterday", unread: false },
  { id: 4, text: "AI detected a potential inconsistency in a competing bidder's documents.", time: "2 days ago", unread: false },
];

/* ============================================================================
   COMPLIANCE ENGINE (client-side stand-in)
   Deterministic status → color/icon mapping used everywhere in the UI.
============================================================================ */
const STATUS_META = {
  compliant: { label: "Compliant", color: COLORS.green, bg: COLORS.greenBg, icon: CheckCircle2, dot: "🟢" },
  "non-compliant": { label: "Non-Compliant", color: COLORS.red, bg: COLORS.redBg, icon: XCircle, dot: "🔴" },
  review: { label: "Needs Human Review", color: COLORS.amber, bg: COLORS.amberBg, icon: AlertTriangle, dot: "🟡" },
};

function overallScore(findings) {
  const vals = Object.values(findings);
  const compliant = vals.filter((v) => v.status === "compliant").length;
  return Math.round((compliant / vals.length) * 100);
}

/* ============================================================================
   SMALL UI PRIMITIVES
============================================================================ */
function StatusBadge({ status, size = "md" }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  const Icon = meta.icon;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${pad}`}
      style={{ color: meta.color, background: meta.bg }}
    >
      <Icon size={size === "sm" ? 12 : 13} />
      {meta.label}
    </span>
  );
}

function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`bg-white rounded-2xl border ${className}`}
      style={{ borderColor: COLORS.border, boxShadow: "0 1px 2px rgba(16,27,51,0.04)" }}
      {...rest}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tint }) {
  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-semibold mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>
          {value}
        </p>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: tint + "1A" }}>
        <Icon size={19} style={{ color: tint }} />
      </div>
    </Card>
  );
}

function ConfidenceBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: COLORS.accent }} />
      </div>
      <span className="text-xs text-slate-500 font-medium">{value}%</span>
    </div>
  );
}

function AiDisclaimer({ compact }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl ${compact ? "px-3 py-2" : "px-4 py-3"}`}
      style={{ background: "#EEF2FF", border: `1px solid #D6DEFF` }}
    >
      <Info size={15} className="mt-0.5 shrink-0" style={{ color: COLORS.accent }} />
      <p className="text-xs leading-relaxed" style={{ color: "#2A3B7A" }}>
        AI-generated assessment. Confidence scores indicate model certainty, not proof of correctness. The final
        procurement decision remains with the authorized officer.
      </p>
    </div>
  );
}

function DemoTag() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: "#101B33", color: "#fff" }}
    >
      <Sparkles size={11} /> Simulated · Demo Mode
    </span>
  );
}

function BackButton({ onClick, label = "Back" }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1.5 -ml-2.5 rounded-lg transition-colors hover:bg-slate-100 active:bg-slate-200"
      style={{ color: COLORS.navy }}
      aria-label="Go back to the previous page"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}

/* ============================================================================
   EVIDENCE DRAWER — signature interaction: every AI finding traces to a
   document + page + highlighted snippet, never a bare label.
============================================================================ */
function EvidenceDrawer({ finding, requirement, onClose, onOverride }) {
  if (!finding) return null;
  const meta = STATUS_META[finding.status];
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(16,27,51,0.45)" }} onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-[slideIn_.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
          <h3 className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Evidence Trail</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          <div>
            <p className="text-xs text-slate-500 mb-1">Requirement · {requirement.id}</p>
            <p className="text-sm font-medium text-slate-800">{requirement.text}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={finding.status} />
            <ConfidenceBar value={finding.confidence} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">What the AI found</p>
            <p className="text-sm text-slate-800">{finding.found}</p>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
            <div className="px-4 py-2.5 flex items-center gap-2 text-xs font-medium" style={{ background: COLORS.bg, color: COLORS.navy }}>
              <FileText size={13} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{finding.doc}</span>
              <span className="text-slate-400">· Page {finding.page}</span>
            </div>
            <div className="px-4 py-4 bg-[#FCFCFD]">
              <p className="text-sm leading-relaxed text-slate-700" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>
                “…<mark className="rounded px-0.5" style={{ background: meta.bg, color: meta.color }}>{finding.snippet}</mark>…”
              </p>
            </div>
          </div>
          <AiDisclaimer compact />
        </div>
        {onOverride && (
          <div className="px-5 py-4 border-t space-y-2" style={{ borderColor: COLORS.border }}>
            <p className="text-xs text-slate-500 mb-1">Officer action</p>
            <div className="flex gap-2">
              <button
                onClick={() => onOverride("compliant")}
                className="flex-1 text-xs font-medium py-2 rounded-lg border transition-colors hover:bg-emerald-50"
                style={{ borderColor: COLORS.green, color: COLORS.green }}
              >
                Accept as Compliant
              </button>
              <button
                onClick={() => onOverride("non-compliant")}
                className="flex-1 text-xs font-medium py-2 rounded-lg border transition-colors hover:bg-red-50"
                style={{ borderColor: COLORS.red, color: COLORS.red }}
              >
                Mark Non-Compliant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   SHELL — sidebar + topbar used by both roles
============================================================================ */
const VENDOR_NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tenders", label: "My Tenders", icon: FileText },
  { key: "bids", label: "My Bids", icon: ClipboardCheck },
  // { key: "upload", label: "Upload Documents", icon: Upload },
  { key: "reports", label: "Compliance Reports", icon: FileCheck },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "help", label: "Help & Support", icon: HelpCircle },
];

const OFFICER_NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tenders", label: "Tenders", icon: FileText },
  { key: "evaluations", label: "Bid Evaluations", icon: ClipboardCheck },
  { key: "upload", label: "Upload Documents", icon: Upload },
  { key: "reports", label: "Compliance Reports", icon: FileCheck },
  { key: "anomalies", label: "Anomaly Alerts", icon: AlertTriangle },
  { key: "audit", label: "Audit Trail", icon: History },
  { key: "users", label: "Users & Roles", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ role, view, setView, onSwitchRole, mobileOpen, setMobileOpen }) {
  const items = role === "vendor" ? VENDOR_NAV : OFFICER_NAV;
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 shrink-0 flex flex-col transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        style={{ background: COLORS.navy }}
      >
        <div className="px-5 h-16 flex items-center gap-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.accent }}>
            <Shield size={16} color="#fff" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              AI Bid Compliance
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "#8C97B8" }}>GeM Procurement Platform</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {items.map((it) => {
            const Icon = it.icon;
            const active = view === it.key;
            return (
              <button
                key={it.key}
                onClick={() => {
                  setView(it.key);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  background: active ? "rgba(36,84,255,0.18)" : "transparent",
                  color: active ? "#fff" : "#AFB9D4",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={16} />
                {it.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={onSwitchRole}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
            style={{ color: "#AFB9D4" }}
          >
            <LogOut size={16} /> Switch role / Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function TopBar({ title, subtitle, onMenu, user, notifCount }) {
  return (
    <div className="h-16 px-4 md:px-8 flex items-center justify-between border-b bg-white shrink-0" style={{ borderColor: COLORS.border }}>
      <div className="flex items-center gap-3 min-w-0">
        <button className="md:hidden text-slate-500" onClick={onMenu}><Menu size={20} /></button>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</p>
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="relative">
          <Bell size={18} className="text-slate-500" />
          {notifCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-semibold">
              {notifCount}
            </span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: COLORS.accent }}>
          {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   LANDING PAGE
============================================================================ */
function Landing({ onEnter }) {
  return (
    <div className="min-h-screen" style={{ background: COLORS.bg }}>
      <header className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: COLORS.navy }}>
            <Shield size={17} color="#fff" />
          </div>
          <span className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>AI Bid Compliance</span>
        </div>
        <button
          onClick={() => onEnter("vendor")}
          className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white"
          style={{ background: COLORS.accent }}
        >
          Try Demo
        </button>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-6" style={{ background: "#EEF2FF", color: COLORS.accent }}>
            <Sparkles size={12} /> Built for the GeM Procurement pipeline
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>
            AI-Powered Bid Compliance for Smarter Government Procurement
          </h1>
          <p className="mt-5 text-slate-600 text-base leading-relaxed max-w-lg">
            Automate document scrutiny, identify compliance gaps and generate explainable bid assessments —
            while keeping final decisions with authorized procurement officers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => onEnter("vendor")} className="px-5 py-3 rounded-lg text-sm font-semibold text-white" style={{ background: COLORS.accent }}>
              Continue as Vendor
            </button>
            <button onClick={() => onEnter("officer")} className="px-5 py-3 rounded-lg text-sm font-semibold border" style={{ borderColor: COLORS.navy, color: COLORS.navy }}>
              Continue as Procurement Officer
            </button>
          </div>
          
        </div>
        <Card className="p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">How it works</p>
          <ol className="space-y-4">
            {[
              ["Tender document is uploaded", "AI extracts structured requirements"],
              ["Vendor submits bid documents", "OCR / text extraction runs automatically"],
              ["Compliance engine compares bid vs. requirement", "Deterministic rules + semantic matching"],
              ["Officer reviews explainable findings", "Every result links to document + page evidence"],
            ].map(([a, b], i) => (
              <li key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: COLORS.navy, color: "#fff" }}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{a}</p>
                  <p className="text-xs text-slate-500">{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          [Shield, "Explainable results", "Every compliant, non-compliant or review verdict cites the exact document, page and extracted text behind it."],
          [FileWarning, "Anomaly detection", "Flags mismatches across turnover, GST, PAN and certificates as inconsistencies for manual review — never as confirmed fraud."],
          [History, "Full auditability", "Every officer override is timestamped, attributed and reasoned in an immutable-style audit trail."],
        ].map(([Icon, t, d], i) => (
          <Card key={i} className="p-6">
            <Icon size={20} style={{ color: COLORS.accent }} />
            <p className="font-semibold mt-3 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>{t}</p>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{d}</p>
          </Card>
        ))}
      </section>

      <footer className="text-center text-xs text-slate-400 pb-10">
        AI is a decision-support system. The final procurement decision always remains with the authorized officer.
      </footer>
    </div>
  );
}

/* ============================================================================
   VENDOR: DASHBOARD
============================================================================ */
function VendorDashboard({ setView }) {
  const cards = [
    { label: "Active Tenders", value: 7, icon: FileText, tint: COLORS.accent },
    { label: "Bids Submitted", value: 12, icon: ClipboardCheck, tint: COLORS.navy },
    { label: "Compliant Bids", value: 8, icon: CheckCircle2, tint: COLORS.green },
    { label: "Non-Compliant Bids", value: 2, icon: XCircle, tint: COLORS.red },
    { label: "Pending Review", value: 2, icon: AlertTriangle, tint: COLORS.amber },
  ];
  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>
            Welcome back, LUCKY Solutions! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track your tenders, upload documents and ensure compliance.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setView("tenders")} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: COLORS.accent }}>
            Browse Tenders
          </button>
          <button onClick={() => setView("bids")} className="px-4 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: COLORS.border, color: COLORS.navy }}>
            My Bids
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-sm" style={{ color: COLORS.navy }}>Recent activity</p>
          <DemoTag />
        </div>
        <div className="space-y-3">
          {[
            ["Compliance report generated", "Supply of Laptops to Government Offices", "92% overall score", CheckCircle2, COLORS.green],
            ["BIS certificate flagged for review", "Supply of Laptops to Government Offices", "Confidence 71%", AlertTriangle, COLORS.amber],
            ["Bid submitted", "Procurement of Networking Equipment", "11 documents uploaded", Upload, COLORS.accent],
          ].map(([t, s, r, Icon, c], i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: COLORS.border }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c + "1A" }}>
                <Icon size={15} style={{ color: c }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{t}</p>
                <p className="text-xs text-slate-500 truncate">{s}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{r}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================================
   VENDOR: MY TENDERS
============================================================================ */
function statusColorText(s) {
  if (s === "Compliant") return COLORS.green;
  if (s === "Non-Compliant") return COLORS.red;
  if (s === "Needs Review") return COLORS.amber;
  return "#94A3B8";
}

function MyTenders({ onOpen, query, setQuery, filter, setFilter }) {
  const filtered = TENDERS.filter((t) => {
    const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && t.status === "Active") ||
      (filter === "Bid Submitted" && t.bidStatus === "Submitted") ||
      (filter === "Closed" && t.status === "Closed");
    return matchesQuery && matchesFilter;
  });
  return (
    <div className="p-4 md:p-8 space-y-5">
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>My Tenders</h1>
        <p className="text-sm text-slate-500 mt-1">Browse open tenders and track your submissions.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tender title or ID..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={{ borderColor: COLORS.border, "--tw-ring-color": "#D6DEFF" }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["All", "Active", "Bid Submitted", "Closed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border"
              style={
                filter === f
                  ? { background: COLORS.navy, color: "#fff", borderColor: COLORS.navy }
                  : { background: "#fff", color: "#475569", borderColor: COLORS.border }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <Card key={t.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-slate-800">{t.title}</p>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: COLORS.bg, color: "#64748B" }}>{t.category}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{t.id}</p>
              <p className="text-xs text-slate-500 mt-1">{t.dept}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-slate-500">
                <span>Published {t.published}</span>
                <span>Deadline {t.deadline}</span>
                <span>Value {t.value}</span>
                <span>{t.reqCount} requirements</span>
              </div>
            </div>
            <div className="flex md:flex-col items-start md:items-end gap-2 shrink-0">
              <span className="text-xs font-medium" style={{ color: statusColorText(t.complianceStatus) }}>
                {t.complianceStatus !== "—" ? `Compliance: ${t.complianceStatus}` : "Not yet submitted"}
              </span>
              <span className="text-xs text-slate-400">{t.bidStatus}</span>
              <button
                onClick={() => onOpen(t.id)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1"
                style={{ background: COLORS.accent }}
              >
                {t.bidStatus === "Submitted" ? "View Bid" : "View Tender"} <ChevronRight size={13} />
              </button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-sm text-slate-400">No tenders match your search.</Card>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   VENDOR: TENDER DETAILS
============================================================================ */
function TenderDetails({ tenderId, onBack, onSubmitBid }) {
  const tender = TENDERS.find((t) => t.id === tenderId) || TENDERS[0];
  const groups = ["Technical", "Eligibility", "Financial"];
  return (
    <div className="p-4 md:p-8 space-y-5">
      <BackButton onClick={onBack} />
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>{tender.title}</h1>
            <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{tender.id}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: tender.status === "Active" ? COLORS.greenBg : "#F1F2F4", color: tender.status === "Active" ? COLORS.green : "#64748B" }}>
            {tender.status}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
          <div><p className="text-xs text-slate-400">Department</p><p className="font-medium text-slate-700 mt-0.5">{tender.dept}</p></div>
          <div><p className="text-xs text-slate-400">Category</p><p className="font-medium text-slate-700 mt-0.5">{tender.category}</p></div>
          <div><p className="text-xs text-slate-400">Deadline</p><p className="font-medium text-slate-700 mt-0.5">{tender.deadline}</p></div>
          <div><p className="text-xs text-slate-400">Estimated Value</p><p className="font-medium text-slate-700 mt-0.5">{tender.value}</p></div>
        </div>
        <button onClick={onSubmitBid} className="mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: COLORS.accent }}>
          {tender.bidStatus === "Submitted" ? "View / Update Bid" : "Submit Bid"}
        </button>
      </Card>

      {groups.map((g) => (
        <Card key={g} className="p-6">
          <p className="font-semibold text-sm mb-4" style={{ color: COLORS.navy }}>{g} Requirements</p>
          <div className="space-y-3">
            {REQUIREMENTS.filter((r) => r.cat === g).map((r) => (
              <div key={r.id} className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: COLORS.border }}>
                <span className="text-[11px] mt-0.5 px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: COLORS.bg, color: "#64748B", fontFamily: "'IBM Plex Mono', monospace" }}>{r.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">{r.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.method}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={r.mandatory ? { background: "#FFF1F0", color: "#B42318" } : { background: "#F1F5F9", color: "#64748B" }}>
                  {r.mandatory ? "Mandatory" : "Optional"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================================
   VENDOR: BID SUBMISSION WIZARD
============================================================================ */
const AI_STEPS = ["Reading document...", "Extracting requirements...", "Analyzing eligibility...", "Checking technical specifications...", "Generating compliance report..."];

function BidSubmission({ tenderId, onFinish, onBack }) {
  const tender = TENDERS.find((t) => t.id === tenderId) || TENDERS[0];
  const [step, setStep] = useState(1);
  const [uploaded, setUploaded] = useState({});
  const [aiStepIndex, setAiStepIndex] = useState(-1);
  const [aiDone, setAiDone] = useState(false);

  const toggleUpload = (name) => setUploaded((u) => ({ ...u, [name]: u[name] ? "" : "Uploaded" }));

  useEffect(() => {
    if (step !== 4 || aiDone) return;
    setAiStepIndex(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i >= AI_STEPS.length) {
        clearInterval(interval);
        setAiDone(true);
      } else {
        setAiStepIndex(i);
      }
    }, 850);
    return () => clearInterval(interval);
  }, [step, aiDone]);

  const steps = ["Tender Information", "Company Information", "Upload Documents", "AI Pre-Compliance Check", "Submit Bid"];
  const allUploaded = DOCS.every((d) => uploaded[d.name]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <BackButton onClick={onBack} />
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Submit Bid</h1>
        <p className="text-sm text-slate-500 mt-1">{tender.title} · <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{tender.id}</span></p>
      </div>

      <div className="flex items-center overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={i + 1 <= step ? { background: COLORS.accent, color: "#fff" } : { background: "#F1F5F9", color: "#94A3B8" }}
              >
                {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${i + 1 === step ? "text-slate-800" : "text-slate-400"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="w-8 md:w-14 h-px mx-2 shrink-0" style={{ background: COLORS.border }} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold" style={{ color: COLORS.navy }}>Tender Information</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[["Tender Title", tender.title], ["Tender ID", tender.id], ["Department", tender.dept], ["Submission Deadline", tender.deadline]].map(([l, v]) => (
                <div key={l}><p className="text-xs text-slate-400">{l}</p><p className="font-medium text-slate-700 mt-0.5">{v}</p></div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold" style={{ color: COLORS.navy }}>Company Information</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[["Company Name", VENDOR_USER.name], ["GSTIN", VENDOR_USER.gstin], ["PAN", VENDOR_USER.pan], ["Registration No.", VENDOR_USER.regNo]].map(([l, v]) => (
                <div key={l}><p className="text-xs text-slate-400">{l}</p><p className="font-medium text-slate-700 mt-0.5" style={{ fontFamily: l.includes("No") || l === "GSTIN" || l === "PAN" ? "'IBM Plex Mono', monospace" : undefined }}>{v}</p></div>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="font-semibold mb-1" style={{ color: COLORS.navy }}>Upload Documents</p>
            <p className="text-xs text-slate-500 mb-4">Supported formats: PDF, DOCX, JPG, PNG.</p>
            <div className="space-y-2">
              {DOCS.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3 py-2.5 border-b last:border-0" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={15} className="text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 truncate">{d.type}</p>
                      <p className="text-xs text-slate-400 truncate" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{d.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleUpload(d.name)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
                    style={uploaded[d.name] ? { background: COLORS.greenBg, color: COLORS.green } : { background: COLORS.accent, color: "#fff" }}
                  >
                    {uploaded[d.name] ? "✓ Uploaded" : "Upload"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold" style={{ color: COLORS.navy }}>AI Pre-Compliance Check</p>
              <DemoTag />
            </div>
            <div className="space-y-2.5">
              {AI_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  {i < aiStepIndex || aiDone ? (
                    <CheckCircle2 size={16} style={{ color: COLORS.green }} />
                  ) : i === aiStepIndex ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                  )}
                  <span className={i <= aiStepIndex || aiDone ? "text-slate-700" : "text-slate-300"}>{s}</span>
                </div>
              ))}
            </div>
            {aiDone && (
              <div className="mt-6 p-4 rounded-xl flex items-center justify-between" style={{ background: COLORS.bg }}>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Pre-compliance score: {overallScore(LUCKY_FINDINGS)}%</p>
                  <p className="text-xs text-slate-500 mt-0.5">12 compliant · 1 needs human review · 0 non-compliant</p>
                </div>
                <TrendingUp size={22} style={{ color: COLORS.green }} />
              </div>
            )}
          </div>
        )}
        {step === 5 && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: COLORS.greenBg }}>
              <CheckCircle2 size={26} style={{ color: COLORS.green }} />
            </div>
            <p className="font-semibold mt-4" style={{ color: COLORS.navy }}>Ready to submit</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Your bid for {tender.title} will be submitted with 11 documents and a pre-compliance score of {overallScore(LUCKY_FINDINGS)}%.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-5 border-t" style={{ borderColor: COLORS.border }}>
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border disabled:opacity-30"
            style={{ borderColor: COLORS.border, color: COLORS.navy }}
          >
            Back
          </button>
          {step < 5 ? (
            <button
              disabled={(step === 3 && !allUploaded) || (step === 4 && !aiDone)}
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: COLORS.accent }}
            >
              Continue
            </button>
          ) : (
            <button onClick={onFinish} className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: COLORS.green }}>
              Submit Bid
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================================
   COMPLIANCE REPORT (shared by vendor + officer, officer gets override controls)
============================================================================ */
function ComplianceReport({ role, findings, setFindings, addAudit, onBack, bidderName, tenderTitle }) {
  const [evidence, setEvidence] = useState(null);
  const score = overallScore(findings);
  const displayBidder = bidderName || "LUCKY Solutions Pvt. Ltd.";
  const displayTender = tenderTitle || "Supply of Laptops to Government Offices";
  const breakdown = [
    ["Technical Compliance", 95],
    ["Eligibility Compliance", 88],
    ["Document Completeness", 100],
    ["Financial Compliance", 90],
  ];

  const handleOverride = (reqId, newStatus) => {
    const prev = findings[reqId].status;
    setFindings((f) => ({ ...f, [reqId]: { ...f[reqId], status: newStatus, confidence: 100 } }));
    addAudit({
      user: OFFICER_USER.name,
      action: "Overrode AI finding",
      tender: "TND-2026-0142",
      bid: "LUCKY Solutions Pvt. Ltd.",
      detail: `Changed ${reqId} from "${STATUS_META[prev].label}" → "${STATUS_META[newStatus].label}". Reason: Verified original certificate manually.`,
    });
    setEvidence(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-5">
      <BackButton onClick={onBack} />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Compliance Report</h1>
          <p className="text-sm text-slate-500 mt-1">{displayTender} · {displayBidder}</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: COLORS.border, color: COLORS.navy }}>
          <Download size={14} /> Export PDF
        </button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-xs text-slate-400">Overall Compliance Score</p>
            <p className="text-4xl font-semibold mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>{score}%</p>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 min-w-[280px]">
            {breakdown.map(([l, v]) => (
              <div key={l}>
                <p className="text-xs text-slate-400">{l}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${v}%`, background: COLORS.accent }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{v}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <AiDisclaimer />

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.border }}>
          <p className="font-semibold text-sm" style={{ color: COLORS.navy }}>Requirement-by-requirement findings</p>
        </div>
        <div className="divide-y" style={{ borderColor: COLORS.border }}>
          {REQUIREMENTS.map((r) => {
            const f = findings[r.id];
            return (
              <div key={r.id} className="px-6 py-4 flex items-center gap-4 flex-wrap md:flex-nowrap hover:bg-slate-50/60 cursor-pointer" onClick={() => setEvidence(r.id)}>
                <div className="flex-1 min-w-[220px]">
                  <p className="text-sm text-slate-800 font-medium">{r.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.id} · {r.cat}</p>
                </div>
                <StatusBadge status={f.status} />
                <div className="flex items-center gap-1.5 text-xs text-slate-500 w-36 shrink-0">
                  <FileText size={12} /> <span className="truncate">Page {f.page}</span>
                </div>
                <ConfidenceBar value={f.confidence} />
                <ChevronRight size={15} className="text-slate-300 shrink-0" />
              </div>
            );
          })}
        </div>
      </Card>

      <EvidenceDrawer
        finding={evidence ? findings[evidence] : null}
        requirement={evidence ? REQUIREMENTS.find((r) => r.id === evidence) : null}
        onClose={() => setEvidence(null)}
        onOverride={role === "officer" ? (s) => handleOverride(evidence, s) : null}
      />
    </div>
  );
}

/* ============================================================================
   COMPLIANCE REPORTS — list page shared by vendor & officer sidebars.
   Selecting a report navigates one level deeper; Back returns here.
============================================================================ */
function ComplianceReportsList({ role, onOpen }) {
  const items =
    role === "vendor"
      ? [
        { id: "TND-2026-0142", title: "Supply of Laptops to Government Offices", status: "review", score: 92, date: "24 Aug 2026" },
        { id: "TND-2026-0163", title: "Procurement of Networking Equipment", status: "compliant", score: 96, date: "18 Aug 2026" },
        { id: "TND-2026-0104", title: "Annual Maintenance of IT Systems", status: "non-compliant", score: 54, date: "29 Jul 2026" },
      ]
      : BIDDERS.map((b) => ({
        id: b,
        title: b,
        status: BIDDER_RESULTS[b].score >= 85 ? "compliant" : BIDDER_RESULTS[b].score >= 70 ? "review" : "non-compliant",
        score: BIDDER_RESULTS[b].score,
        date: "24 Aug 2026",
      }));
  return (
    <div className="p-4 md:p-8 space-y-5">
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Compliance Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          {role === "vendor" ? "Reports generated for your submitted bids." : "Reports generated for bids on Supply of Laptops to Government Offices."}
        </p>
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <Card key={it.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800">{it.title}</p>
              <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{it.id}</p>
              <p className="text-xs text-slate-500 mt-1">Generated {it.date}</p>
            </div>
            <StatusBadge status={it.status} />
            <p className="text-sm font-semibold w-16 text-right" style={{ color: COLORS.navy }}>{it.score}%</p>
            <button
              onClick={() => onOpen(it.id)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1 shrink-0"
              style={{ background: COLORS.accent }}
            >
              View Report <ChevronRight size={13} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   VENDOR: MY BIDS
============================================================================ */
function MyBids({ onOpenReport }) {
  const bids = [
    { tender: "Supply of Laptops to Government Offices", id: "TND-2026-0142", status: "review", score: 92, date: "24 Aug 2026" },
    { tender: "Procurement of Networking Equipment", id: "TND-2026-0163", status: "compliant", score: 96, date: "18 Aug 2026" },
    { tender: "Annual Maintenance of IT Systems", id: "TND-2026-0104", status: "non-compliant", score: 54, date: "29 Jul 2026" },
  ];
  return (
    <div className="p-4 md:p-8 space-y-5">
      <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>My Bids</h1>
      <div className="space-y-3">
        {bids.map((b) => (
          <Card key={b.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800">{b.tender}</p>
              <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{b.id}</p>
              <p className="text-xs text-slate-500 mt-1">Submitted {b.date}</p>
            </div>
            <StatusBadge status={b.status} />
            <p className="text-sm font-semibold w-16 text-right" style={{ color: COLORS.navy }}>{b.score}%</p>
            <button onClick={() => onOpenReport(b.id)} className="px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1 shrink-0" style={{ background: COLORS.accent }}>
              View Report <ChevronRight size={13} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   VENDOR: NOTIFICATIONS, PROFILE, GENERIC UPLOAD
============================================================================ */
function Notifications({ items, setItems }) {
  return (
    <div className="p-4 md:p-8 space-y-5">
      <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Notifications</h1>
      <Card className="divide-y" style={{ borderColor: COLORS.border }}>
        {items.map((n) => (
          <div key={n.id} className="px-5 py-4 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.unread ? COLORS.accent : "transparent" }} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${n.unread ? "font-semibold text-slate-800" : "text-slate-500"}`}>{n.text}</p>
              <p className="text-xs text-slate-400 mt-1">{n.time}</p>
            </div>
            {n.unread && (
              <button
                onClick={() => setItems((its) => its.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                className="text-xs font-medium shrink-0" style={{ color: COLORS.accent }}
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

function Profile({ onOpenSettings }) {
  return (
    <div className="p-4 md:p-8 space-y-5 max-w-2xl">
      <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Profile</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-semibold text-lg" style={{ background: COLORS.navy }}>TN</div>
          <div>
            <p className="font-semibold text-slate-800">{VENDOR_USER.name}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium mt-1" style={{ color: COLORS.green }}><BadgeCheck size={13} /> Verified Vendor</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5 mt-6 text-sm">
          {[["Authorized Contact", VENDOR_USER.contact], ["GSTIN", VENDOR_USER.gstin], ["PAN", VENDOR_USER.pan], ["Company Registration No.", VENDOR_USER.regNo], ["Registered Address", VENDOR_USER.address]].map(([l, v]) => (
            <div key={l} className={l === "Registered Address" ? "md:col-span-2" : ""}>
              <p className="text-xs text-slate-400">{l}</p>
              <p className="font-medium text-slate-700 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t flex justify-end" style={{ borderColor: COLORS.border }}>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: COLORS.border, color: COLORS.navy }}
          >
            <Settings size={14} /> Manage Settings
          </button>
        </div>
      </Card>
    </div>
  );
}

function AccountSettings({ onBack }) {
  return (
    <div className="p-4 md:p-8 space-y-5 max-w-2xl">
      <BackButton onClick={onBack} />
      <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Settings</h1>
      <Card className="p-6 divide-y" style={{ borderColor: COLORS.border }}>
        {[
          ["Email notifications", "Receive alerts when a compliance report is ready or a deadline is approaching."],
          ["SMS alerts", "Get a text message when a certificate is expiring soon."],
          ["Two-factor authentication", "Add an extra layer of security to your account."],
        ].map(([t, d], i) => (
          <div key={t} className={`flex items-center justify-between gap-4 py-4 ${i === 0 ? "" : ""}`}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">{t}</p>
              <p className="text-xs text-slate-500 mt-0.5">{d}</p>
            </div>
            <div className="w-10 h-6 rounded-full relative shrink-0" style={{ background: i === 0 ? COLORS.accent : "#E2E6ED" }}>
              <div className="w-4 h-4 rounded-full bg-white absolute top-1 shadow" style={{ left: i === 0 ? 20 : 4 }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function GenericUpload() {
  return (
    <div className="p-4 md:p-8 space-y-5">
      <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Upload Documents</h1>
      <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed" style={{ borderStyle: "dashed" }}>
        <Upload size={26} className="text-slate-400" />
        <p className="text-sm font-medium text-slate-700 mt-3">Drag and drop files, or browse</p>
        <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG, PNG · up to 20MB each</p>
        <button className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: COLORS.accent }}>Browse Files</button>
      </Card>
      <p className="text-xs text-slate-400">Tip: to see the full upload → AI processing → compliance flow, start a bid from a tender's page and use "Submit Bid".</p>
    </div>
  );
}

/* ============================================================================
   OFFICER: DASHBOARD
============================================================================ */
function OfficerDashboard({ setView }) {
  const cards = [
    { label: "Total Tenders", value: 24, icon: FileText, tint: COLORS.accent },
    { label: "Bids Evaluated", value: 61, icon: ClipboardCheck, tint: COLORS.navy },
    { label: "Compliant Bids", value: 38, icon: CheckCircle2, tint: COLORS.green },
    { label: "Non-Compliant Bids", value: 14, icon: XCircle, tint: COLORS.red },
    { label: "Pending Reviews", value: 9, icon: AlertTriangle, tint: COLORS.amber },
  ];
  const pieData = [
    { name: "Compliant", value: 38, color: COLORS.green },
    { name: "Non-Compliant", value: 14, color: COLORS.red },
    { name: "Pending Review", value: 9, color: COLORS.amber },
  ];
  const evals = [
    { bidder: "LUCKY Solutions Pvt. Ltd.", tender: "TND-2026-0142", score: 92, status: "review", date: "24 Aug 2026" },
    { bidder: "Digital Infra Private Ltd.", tender: "TND-2026-0142", score: 64, status: "non-compliant", date: "24 Aug 2026" },
    { bidder: "Global Systems & Services", tender: "TND-2026-0142", score: 78, status: "review", date: "23 Aug 2026" },
    { bidder: "Innovative IT Solutions", tender: "TND-2026-0142", score: 85, status: "compliant", date: "23 Aug 2026" },
  ];
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Officer Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">{OFFICER_USER.name} · {OFFICER_USER.org}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <Card className="p-6 md:col-span-1">
          <p className="font-semibold text-sm mb-2" style={{ color: COLORS.navy }}>Compliance Overview</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm" style={{ color: COLORS.navy }}>Recent Bid Evaluations</p>
            <button onClick={() => setView("evaluations")} className="text-xs font-semibold" style={{ color: COLORS.accent }}>View all</button>
          </div>
          <div className="space-y-1">
            {evals.map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0 text-sm" style={{ borderColor: COLORS.border }}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 truncate">{e.bidder}</p>
                  <p className="text-xs text-slate-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{e.tender}</p>
                </div>
                <StatusBadge status={e.status} size="sm" />
                <span className="text-xs font-semibold w-10 text-right" style={{ color: COLORS.navy }}>{e.score}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================================
   OFFICER: BID EVALUATIONS + COMPARISON
============================================================================ */
function BidEvaluations({ onOpenReport, onCompare }) {
  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Bid Evaluations</h1>
          <p className="text-sm text-slate-500 mt-1">Supply of Laptops to Government Offices · TND-2026-0142</p>
        </div>
        <button onClick={onCompare} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: COLORS.navy }}>
          <GitCompare size={15} /> Compare Bidders
        </button>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b" style={{ borderColor: COLORS.border }}>
              <th className="px-5 py-3 font-medium">Bidder</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Overall Status</th>
              <th className="px-5 py-3 font-medium">Evaluated On</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {BIDDERS.map((b) => {
              const r = BIDDER_RESULTS[b];
              const status = r.score >= 85 ? "compliant" : r.score >= 70 ? "review" : "non-compliant";
              return (
                <tr key={b} className="border-b last:border-0" style={{ borderColor: COLORS.border }}>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{b}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: COLORS.navy }}>{r.score}%</td>
                  <td className="px-5 py-3.5"><StatusBadge status={status} size="sm" /></td>
                  <td className="px-5 py-3.5 text-slate-500">24 Aug 2026</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <button onClick={() => onOpenReport(b)} className="text-xs font-semibold flex items-center gap-1" style={{ color: COLORS.accent }}><Eye size={13} /> View</button>
                      <button className="text-xs font-semibold flex items-center gap-1 text-slate-500"><FileCheck size={13} /> Generate Report</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BidComparison({ onBack }) {
  return (
    <div className="p-4 md:p-8 space-y-5">
      <BackButton onClick={onBack} />
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Bid Comparison</h1>
        <p className="text-sm text-slate-500 mt-1">Supply of Laptops to Government Offices · TND-2026-0142</p>
      </div>
      <AiDisclaimer />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b" style={{ borderColor: COLORS.border }}>
              <th className="px-5 py-3 font-medium sticky left-0 bg-white">Requirement</th>
              {BIDDERS.map((b) => <th key={b} className="px-5 py-3 font-medium">{b.split(" ")[0]}</th>)}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_REQS.map((rid) => (
              <tr key={rid} className="border-b last:border-0" style={{ borderColor: COLORS.border }}>
                <td className="px-5 py-3.5 font-medium text-slate-800 sticky left-0 bg-white">{COMPARISON_LABELS[rid]}</td>
                {BIDDERS.map((b) => (
                  <td key={b} className="px-5 py-3.5 text-lg">{STATUS_META[BIDDER_RESULTS[b][rid]].dot}</td>
                ))}
              </tr>
            ))}
            <tr className="border-b" style={{ borderColor: COLORS.border }}>
              <td className="px-5 py-3.5 font-medium text-slate-800 sticky left-0 bg-white">Compliance Score</td>
              {BIDDERS.map((b) => <td key={b} className="px-5 py-3.5 font-semibold" style={{ color: COLORS.navy }}>{BIDDER_RESULTS[b].score}%</td>)}
            </tr>
            <tr className="border-b" style={{ borderColor: COLORS.border }}>
              <td className="px-5 py-3.5 text-slate-500 sticky left-0 bg-white">Missing Documents</td>
              {BIDDERS.map((b) => <td key={b} className="px-5 py-3.5 text-slate-600">{BIDDER_RESULTS[b].missingDocs}</td>)}
            </tr>
            <tr className="border-b" style={{ borderColor: COLORS.border }}>
              <td className="px-5 py-3.5 text-slate-500 sticky left-0 bg-white">Review Items</td>
              {BIDDERS.map((b) => <td key={b} className="px-5 py-3.5 text-slate-600">{BIDDER_RESULTS[b].reviewItems}</td>)}
            </tr>
            <tr>
              <td className="px-5 py-3.5 text-slate-500 sticky left-0 bg-white">Anomaly Count</td>
              {BIDDERS.map((b) => <td key={b} className="px-5 py-3.5 text-slate-600">{BIDDER_RESULTS[b].anomalies}</td>)}
            </tr>
          </tbody>
        </table>
      </Card>
      <div className="text-center text-xs text-slate-400 py-2">
        AI-generated assessment. Final procurement decision remains with the authorized officer.
      </div>
    </div>
  );
}

/* ============================================================================
   OFFICER: ANOMALIES + AUDIT TRAIL
============================================================================ */
function AnomalyAlerts() {
  return (
    <div className="p-4 md:p-8 space-y-5">
      <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Anomaly Alerts</h1>
      <p className="text-sm text-slate-500 -mt-3">Potential inconsistencies detected across bidder documents — manual verification recommended.</p>
      <div className="space-y-3">
        {ANOMALIES.map((a) => (
          <Card key={a.id} className="p-5 flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: COLORS.amberBg }}>
              <AlertTriangle size={17} style={{ color: COLORS.amber }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-slate-800">{a.type}</p>
                <span className="text-xs text-slate-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{a.id}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{a.bidder} · {a.tender}</p>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{a.detail}</p>
              <p className="text-xs mt-2 font-medium" style={{ color: COLORS.amber }}>⚠ Potential inconsistency detected — manual verification recommended.</p>
            </div>
            <StatusBadge status="review" size="sm" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function AuditTrail({ log }) {
  return (
    <div className="p-4 md:p-8 space-y-5">
      <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy }}>Audit Trail</h1>
      <p className="text-sm text-slate-500 -mt-3">Immutable log of AI results and officer decisions.</p>
      <Card>
        <div className="divide-y" style={{ borderColor: COLORS.border }}>
          {[...log].reverse().map((e) => (
            <div key={e.id} className="px-5 py-4 flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: COLORS.bg }}>
                <ScrollText size={14} className="text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{e.user} — {e.action}</p>
                <p className="text-xs text-slate-500 mt-1">{e.detail}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-400">
                  <span>{e.tender}</span><span>{e.bid}</span><span>{e.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================================
   NAVIGATION / ROUTING
   A single `loc` object { role, screen, params } is the source of truth for
   "where am I". Every navigation goes through navigate(), which:
     - pushes (or replaces) a real browser history entry, so the native
       Back/Forward buttons work correctly and deep-link URLs are shareable
     - skips pushing when the target is identical to where we already are,
       so repeat clicks on the same tab/link never pile up history entries
     - snapshots the scroll position of the page we're leaving onto that
       entry, and restores it automatically when the user navigates back to it
   The in-app "← Back" button never guesses a destination — it simply calls
   history.back(), so it always returns to the exact previous page/state.
============================================================================ */
function buildPath(loc) {
  if (!loc || !loc.role) return "#/";
  const parts = ["", loc.role, loc.screen];
  if (loc.params?.tenderId) parts.push(encodeURIComponent(loc.params.tenderId));
  if (loc.params?.bidder) parts.push(encodeURIComponent(loc.params.bidder));
  return "#" + parts.join("/");
}
function sameLoc(a, b) {
  if (!a || !b) return false;
  return a.role === b.role && a.screen === b.screen && JSON.stringify(a.params || {}) === JSON.stringify(b.params || {});
}
const LANDING_LOC = { role: null, screen: "landing", params: {} };

// Which sidebar item should highlight as "active" for a given screen.
function navKeyForScreen(role, screen) {
  if (role === "vendor") {
    return { tenderDetails: "tenders", bidSubmission: "tenders", reportsList: "reports", report: "reports" }[screen] || screen;
  }
  return { comparison: "evaluations", reportsList: "reports", report: "reports" }[screen] || screen;
}
// Which screen a sidebar click should land on for a given nav key.
function screenForNavKey(role, key) {
  if (role === "vendor") return key === "reports" ? "reportsList" : key;
  return key === "reports" ? "reportsList" : key;
}
function titleForScreen(role, screen) {
  const vendor = {
    dashboard: "Dashboard", tenders: "My Tenders", tenderDetails: "Tender Details", bidSubmission: "Submit Bid",
    bids: "My Bids", upload: "Upload Documents", reportsList: "Compliance Reports", report: "Compliance Report",
    notifications: "Notifications", messages: "Messages", profile: "Profile", settings: "Settings", help: "Help & Support",
  };
  const officer = {
    dashboard: "Dashboard", tenders: "Tenders", evaluations: "Bid Evaluations", comparison: "Bid Comparison",
    upload: "Upload Documents", reportsList: "Compliance Reports", report: "Compliance Report",
    anomalies: "Anomaly Alerts", audit: "Audit Trail", users: "Users & Roles", settings: "Settings",
  };
  return (role === "vendor" ? vendor : officer)[screen] || "Dashboard";
}
// tumhara existing code...


/* YAHAN VENDOR LOGIN PASTE KARO */

function VendorLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const vendor = vendors.find(
      (v) =>
        v.username === username &&
        v.password === password
    );

    if (vendor) {
      setError("");
      onLogin(vendor);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Vendor Login
        </h1>

        <p className="text-slate-500 mb-6">
          Login to access your vendor dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full border border-slate-300 rounded-lg px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border border-slate-300 rounded-lg px-4 py-3"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            Login
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full border border-slate-300 py-3 rounded-lg font-semibold"
          >
            Back
          </button>

        </form>
      </div>
    </div>
  );
}
function ProcurementLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const user = procurementUsers.find(
      (u) =>
        u.username === username &&
        u.password === password
    );

    if (user) {
      setError("");
      onLogin(user);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Procurement Login
        </h1>

        <p className="text-slate-500 mb-6">
          Login to access the procurement dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full border border-slate-300 rounded-lg px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border border-slate-300 rounded-lg px-4 py-3"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Login
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full border border-slate-300 py-3 rounded-lg font-semibold"
          >
            Back
          </button>

        </form>
      </div>
    </div>
  );
}


/* ISKE BAAD TUMHARA EXISTING CODE */

/* ============================================================================
   ROOT APP
============================================================================ */
export default function App() {
  useFonts();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInVendor, setLoggedInVendor] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loc, setLoc] = useState(LANDING_LOC);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_SEED);
  const [findings, setFindings] = useState(LUCKY_FINDINGS);
  const [auditLog, setAuditLog] = useState(SEED_AUDIT_LOG);


  const handleVendorLogin = (e) => {
    e.preventDefault();

    const vendor = vendors.find(
      (v) =>
        v.username === username &&
        v.password === password
    );

    if (vendor) {
      setLoggedInVendor(vendor);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  // Filter/search/tab state is lifted here (rather than living inside the
  // list components) specifically so it survives unmount/remount when the
  // user navigates away and then back — e.g. Back to "My Tenders" restores
  // the same search text and filter chip that were active before.
  const [vendorTendersUI, setVendorTendersUI] = useState({ query: "", filter: "All" });
  const [officerTendersUI, setOfficerTendersUI] = useState({ query: "", filter: "All" });

  const scrollRef = React.useRef(null);
  const pendingScroll = React.useRef(0);
  const isPopNav = React.useRef(false);

  // Establish the initial history entry once, and listen for native
  // Back/Forward so the app state always mirrors real browser history.
  useEffect(() => {
    window.history.replaceState({ loc: LANDING_LOC, scrollTop: 0 }, "", buildPath(LANDING_LOC));
    const onPopState = (e) => {
      const state = e.state || { loc: LANDING_LOC, scrollTop: 0 };
      isPopNav.current = true;
      pendingScroll.current = state.scrollTop || 0;
      setLoc(state.loc || LANDING_LOC);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Restore/reset scroll position after every location change.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isPopNav.current) {
      el.scrollTop = pendingScroll.current || 0;
      isPopNav.current = false;
    } else {
      el.scrollTop = 0;
    }
  }, [loc]);

  // The one function every navigation in the app funnels through.
  const navigate = useCallback((screen, params = {}, opts = {}) => {
    const { replace = false, role: roleOverride } = opts;
    setLoc((prev) => {
      const nextRole = roleOverride !== undefined ? roleOverride : prev.role;
      const next = { role: nextRole, screen, params };
      if (!replace && sameLoc(prev, next)) return prev; // no duplicate history entries
      const el = scrollRef.current;
      const leavingScroll = el ? el.scrollTop : 0;
      if (window.history.state) {
        window.history.replaceState({ ...window.history.state, scrollTop: leavingScroll }, "", buildPath(prev));
      }
      window.history[replace ? "replaceState" : "pushState"]({ loc: next, scrollTop: 0 }, "", buildPath(next));
      return next;
    });
  }, []);

  const goBack = useCallback(() => window.history.back(), []);

  // Persist audit trail across reloads via artifact storage.
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage?.get?.("audit-log", false);
        if (res?.value) setAuditLog(JSON.parse(res.value));
      } catch (e) { /* no stored log yet — seed data stands */ }
    })();
  }, []);
  const addAudit = useCallback((entry) => {
    setAuditLog((log) => {
      const next = [...log, { id: log.length + 1, time: "28 Aug 2026, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), ...entry }];
      window.storage?.set?.("audit-log", JSON.stringify(next), false).catch(() => { });
      return next;
    });
  }, []);

  const enter = (r) => {
  if (r === "vendor") {
    navigate("vendor-login");
  } 
  else if (r === "officer") {
    navigate("procurement-login");
  } 
  else {
    navigate("dashboard", {}, { role: r });
  }
};
  const switchRole = () => navigate("landing", {}, { role: null, replace: false });

  if (loc.screen === "vendor-login") {
  return (
    <VendorLogin
      onLogin={() => navigate("dashboard", {}, { role: "vendor" })}
      onBack={() => navigate("landing", {}, { role: null })}
    />
  );
}
  if (loc.screen === "procurement-login") {
  return (
    <ProcurementLogin
      onLogin={() =>
        navigate("dashboard", {}, { role: "officer" })
      }
      onBack={() =>
        navigate("landing", {}, { role: null })
      }
    />
  );
}
if (!loc.role) return <Landing onEnter={enter} />;

  const role = loc.role;
  const activeNavKey = navKeyForScreen(role, loc.screen);
  const sidebarSetView = (key) => navigate(screenForNavKey(role, key), {});
  const unreadCount = notifications.filter((n) => n.unread).length;

  let content = null;

  if (role === "vendor") {
    switch (loc.screen) {
      case "dashboard":
        content = <VendorDashboard setView={sidebarSetView} />;
        break;
      case "tenders":
        content = (
          <MyTenders
            onOpen={(id) => navigate("tenderDetails", { tenderId: id })}
            query={vendorTendersUI.query}
            setQuery={(query) => setVendorTendersUI((s) => ({ ...s, query }))}
            filter={vendorTendersUI.filter}
            setFilter={(filter) => setVendorTendersUI((s) => ({ ...s, filter }))}
          />
        );
        break;
      case "tenderDetails":
        content = (
          <TenderDetails
            tenderId={loc.params.tenderId}
            onBack={goBack}
            onSubmitBid={() => navigate("bidSubmission", { tenderId: loc.params.tenderId })}
          />
        );
        break;
      case "bidSubmission":
        content = (
          <BidSubmission
            tenderId={loc.params.tenderId}
            onBack={goBack}
            onFinish={() => navigate("report", { tenderId: loc.params.tenderId, bidder: VENDOR_USER.name }, { replace: true })}
          />
        );
        break;
      case "bids":
        content = <MyBids onOpenReport={(id) => navigate("report", { tenderId: id, bidder: VENDOR_USER.name })} />;
        break;
      case "upload":
        content = <GenericUpload />;
        break;
      case "reportsList":
        content = <ComplianceReportsList role="vendor" onOpen={(id) => navigate("report", { tenderId: id, bidder: VENDOR_USER.name })} />;
        break;
      case "report":
        content = (
          <ComplianceReport
            role="vendor"
            findings={findings}
            setFindings={setFindings}
            addAudit={addAudit}
            onBack={goBack}
            bidderName={loc.params.bidder}
          />
        );
        break;
      case "notifications":
        content = <Notifications items={notifications} setItems={setNotifications} />;
        break;
      case "profile":
        content = <Profile onOpenSettings={() => navigate("settings", {})} />;
        break;
      case "settings":
        content = <AccountSettings onBack={goBack} />;
        break;
      default:
        content = <div className="p-8"><Card className="p-10 text-center text-sm text-slate-400">This section is a placeholder in the SIH prototype.</Card></div>;
    }
  } else {
    switch (loc.screen) {
      case "dashboard":
        content = <OfficerDashboard setView={sidebarSetView} />;
        break;
      case "tenders":
        content = (
          <MyTenders
            onOpen={(id) => navigate("evaluations", { tenderId: id })}
            query={officerTendersUI.query}
            setQuery={(query) => setOfficerTendersUI((s) => ({ ...s, query }))}
            filter={officerTendersUI.filter}
            setFilter={(filter) => setOfficerTendersUI((s) => ({ ...s, filter }))}
          />
        );
        break;
      case "evaluations":
        content = (
          <BidEvaluations
            onOpenReport={(bidder) => navigate("report", { bidder })}
            onCompare={() => navigate("comparison", { tenderId: loc.params.tenderId })}
          />
        );
        break;
      case "comparison":
        content = <BidComparison onBack={goBack} />;
        break;
      case "upload":
        content = <GenericUpload />;
        break;
      case "reportsList":
        content = <ComplianceReportsList role="officer" onOpen={(bidder) => navigate("report", { bidder })} />;
        break;
      case "report":
        content = (
          <ComplianceReport
            role="officer"
            findings={findings}
            setFindings={setFindings}
            addAudit={addAudit}
            onBack={goBack}
            bidderName={loc.params.bidder}
          />
        );
        break;
      case "anomalies":
        content = <AnomalyAlerts />;
        break;
      case "audit":
        content = <AuditTrail log={auditLog} />;
        break;
      case "settings":
        content = <AccountSettings onBack={goBack} />;
        break;
      default:
        content = <div className="p-8"><Card className="p-10 text-center text-sm text-slate-400">This section is a placeholder in the SIH prototype.</Card></div>;
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: COLORS.bg, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar role={role} view={activeNavKey} setView={sidebarSetView} onSwitchRole={switchRole} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={titleForScreen(role, loc.screen)}
          subtitle={role === "vendor" ? "LUCKY Solutions Pvt. Ltd." : OFFICER_USER.org}
          onMenu={() => setMobileOpen(true)}
          user={role === "vendor" ? VENDOR_USER : OFFICER_USER}
          notifCount={role === "vendor" ? unreadCount : 3}
        />
        <div ref={scrollRef} className="flex-1 overflow-y-auto">{content}</div>
      </div>
    </div>
  );
}
