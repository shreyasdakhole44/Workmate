/**
 * WorkMate HRMS — Landing Page
 * Designed to match HROne.cloud quality and visual style
 * By Shreyas Prakash Dakhole · Talentrix Solution
 *
 * Usage: drop into src/pages/LandingPage.jsx
 * Route: add <Route path="/" element={<LandingPage />} /> in App.jsx
 * Dependencies already in your project: lucide-react, react-router-dom
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Clock, Calendar, Star, Users, FileText, Shield,
  Briefcase, ClipboardList, IndianRupee, ArrowRight,
  CheckCircle, ChevronDown, Menu, X, Play, Zap,
  TrendingUp, Award, BarChart2, UserCheck, Globe,
  MessageSquare, PhoneCall, Mail
} from "lucide-react";

// ─── Colour tokens (matching HROne closely) ─────────────────────────────────
// HROne uses: dark-green navbar, warm-cream body, bold orange-red CTAs
const C = {
  navBg:      "#0B3D2E",   // HROne's dark-green navbar
  navText:    "#FFFFFF",
  primary:    "#E8420A",   // HROne's orange-red brand colour
  primaryHov: "#C73708",
  bodyBg:     "#FAF7F2",   // HROne warm cream background
  sectionBg:  "#F0EDE6",   // slightly darker cream for alternating sections
  darkBg:     "#0B1E16",   // very dark green for dark sections
  white:      "#FFFFFF",
  textDark:   "#111827",
  textMid:    "#374151",
  textLight:  "#6B7280",
  border:     "#E5E7EB",
  green:      "#10B981",
  blue:       "#2563EB",
  amber:      "#D97706",
};

// ─── Reusable tiny components ────────────────────────────────────────────────

function NavLink({ children, href = "#" }) {
  return (
    <a href={href}
      className="flex items-center gap-1 text-sm font-medium text-white/90
                 hover:text-white transition-colors cursor-pointer">
      {children}
    </a>
  );
}

function Badge({ children, color = "primary" }) {
  const styles = {
    primary: "bg-orange-100 text-orange-700 border border-orange-200",
    green:   "bg-emerald-100 text-emerald-700 border border-emerald-200",
    blue:    "bg-blue-100 text-blue-700 border border-blue-200",
    amber:   "bg-amber-100 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold
                      px-3 py-1.5 rounded-full ${styles[color]}`}>
      {children}
    </span>
  );
}

function FeatureCheck({ children }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
      <CheckCircle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
      {children}
    </li>
  );
}

// ─── SECTION 1: Announcement bar ────────────────────────────────────────────
function AnnouncementBar() {
  return (
    <div style={{ backgroundColor: "#1a4d35" }}
         className="py-2 px-4 text-center text-sm text-white/90 flex
                    items-center justify-center gap-3">
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>
        <strong>Case Study:</strong> How growing teams automate HR with WorkMate —
        <a href="#features" className="underline underline-offset-2 ml-1 hover:text-white">
          See how it works →
        </a>
      </span>
    </div>
  );
}

// ─── SECTION 2: Navbar ───────────────────────────────────────────────────────
function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "HR Software",    hasDropdown: true },
    { label: "Pricing",        hasDropdown: false, href: "#pricing" },
    { label: "AI for HR",      hasDropdown: true },
    { label: "Modules",        hasDropdown: false, href: "#modules" },
    { label: "HR Resources",   hasDropdown: true },
    { label: "About",          hasDropdown: false, href: "#about" },
  ];

  return (
    <nav style={{ backgroundColor: C.navBg }}
         className={`sticky top-0 z-50 transition-shadow duration-300
                     ${scrolled ? "shadow-lg shadow-black/20" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center
                      justify-between gap-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ backgroundColor: C.primary }}>
            <span className="text-white font-black text-sm leading-none">W</span>
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none">Work</span>
            <span style={{ color: C.primary }} className="font-bold text-lg leading-none">Mate</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map(l => (
            <NavLink key={l.label} href={l.href || "#"}>
              {l.label}
              {l.hasDropdown && <ChevronDown size={14} className="opacity-60" />}
            </NavLink>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login"
            className="text-sm font-medium text-white/80 hover:text-white
                       transition-colors px-2">
            Login
          </Link>
          <Link to="/login"
            style={{ backgroundColor: C.primary }}
            className="inline-flex items-center gap-2 text-sm font-semibold
                       text-white px-5 py-2.5 rounded-lg hover:opacity-90
                       transition-opacity shadow-md">
            Get Free Trial
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="lg:hidden text-white p-1"
          onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: C.navBg }}
             className="lg:hidden border-t border-white/10 px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <a key={l.label} href={l.href || "#"}
               className="block text-white/80 hover:text-white text-sm
                          font-medium py-2" onClick={() => setMobileOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <Link to="/login"
              className="text-sm font-medium text-white/80 text-center py-2">
              Login
            </Link>
            <Link to="/login"
              style={{ backgroundColor: C.primary }}
              className="text-sm font-semibold text-white text-center
                         py-3 rounded-lg">
              Get Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── SECTION 3: Hero (HROne split layout) ───────────────────────────────────
function Hero() {
  const [form, setForm] = useState({ email: "", phone: "", size: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section style={{ backgroundColor: C.bodyBg }}
             className="relative overflow-hidden">

      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             backgroundImage: "radial-gradient(circle, #00000008 1px, transparent 1px)",
             backgroundSize: "28px 28px",
           }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — copy */}
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 border rounded-full
                            px-4 py-1.5 mb-6"
                 style={{ borderColor: C.primary + "40",
                          backgroundColor: C.primary + "08" }}>
              <Zap size={14} style={{ color: C.primary }} />
              <span style={{ color: C.primary }}
                    className="text-sm font-semibold">
                One AI-Powered Platform
              </span>
            </div>

            {/* Headline — HROne uses very bold, large, coloured type */}
            <h1 className="font-extrabold leading-none tracking-tight mb-6">
              <span style={{ color: C.primary }}
                    className="block text-5xl lg:text-6xl xl:text-7xl">
                The Simplest HR
              </span>
              <span style={{ color: C.primary }}
                    className="block text-5xl lg:text-6xl xl:text-7xl">
                Software
              </span>
              <span className="block text-2xl lg:text-3xl font-bold mt-3"
                    style={{ color: C.textDark }}>
                To Automate the Most
                <br />Complex HR Operations
              </span>
            </h1>

            {/* Sub-copy */}
            <p className="text-base lg:text-lg leading-relaxed mb-8"
               style={{ color: C.textMid }}>
              AI-supercharged. HR-loved. Trusted by growing teams across India.
              Attendance, leaves, payroll, performance, and recruitment — all in one place.
              Finally, HR feels right.
            </p>

            {/* Trust logos row */}
            <div className="flex flex-wrap items-center gap-6">
              {[
                { val: "500+",    label: "Employees managed" },
                { val: "99.9%",   label: "Uptime SLA" },
                { val: "3 Roles", label: "Portal experience" },
                { val: "Spring AI", label: "Powered" },
              ].map(({ val, label }) => (
                <div key={val} className="text-center">
                  <p className="text-xl font-bold" style={{ color: C.textDark }}>{val}</p>
                  <p className="text-xs" style={{ color: C.textLight }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Award badges — like HROne's Gartner + G2 badges */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { icon: Award,  label: "NPTEL Gold · Java",         sub: "Certified" },
                { icon: Star,   label: "700+ LeetCode",             sub: "Problems Solved" },
                { icon: Globe,  label: "Talentrix Solution",        sub: "Founder" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label}
                     className="flex items-center gap-2 bg-white rounded-xl
                                border px-4 py-2.5 shadow-sm"
                     style={{ borderColor: C.border }}>
                  <div className="w-8 h-8 rounded-full flex items-center
                                  justify-center"
                       style={{ backgroundColor: C.primary + "12" }}>
                    <Icon size={15} style={{ color: C.primary }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: C.textDark }}>
                      {label}
                    </p>
                    <p className="text-xs" style={{ color: C.textLight }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — lead-capture form (exactly like HROne) */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border p-8"
                 style={{ borderColor: C.border }}>
              {!submitted ? (
                <>
                  <h2 className="text-xl font-bold text-center mb-1"
                      style={{ color: C.primary }}>
                    Try WorkMate For Free!
                  </h2>
                  <p className="text-sm text-center mb-6" style={{ color: C.textLight }}>
                    No credit card required · Setup in 2 minutes
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email" required
                      placeholder="Work Email *"
                      value={form.email} onChange={set("email")}
                      className="w-full h-14 border rounded-xl px-4 text-sm
                                 outline-none transition-all"
                      style={{ borderColor: C.border }}
                      onFocus={e => e.target.style.borderColor = C.primary}
                      onBlur={e  => e.target.style.borderColor = C.border}
                    />

                    {/* Phone with India flag */}
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 h-14 border
                                      rounded-xl px-3 shrink-0"
                           style={{ borderColor: C.border }}>
                        <span className="text-base">🇮🇳</span>
                        <span className="text-sm font-medium"
                              style={{ color: C.textMid }}>+91</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="Mobile Number *"
                        value={form.phone} onChange={set("phone")}
                        className="flex-1 h-14 border rounded-xl px-4 text-sm outline-none"
                        style={{ borderColor: C.border }}
                        onFocus={e => e.target.style.borderColor = C.primary}
                        onBlur={e  => e.target.style.borderColor = C.border}
                      />
                    </div>

                    <div className="relative">
                      <select
                        value={form.size} onChange={set("size")}
                        className="w-full h-14 border rounded-xl px-4 text-sm
                                   appearance-none bg-white outline-none cursor-pointer"
                        style={{ borderColor: C.border,
                                 color: form.size ? C.textDark : C.textLight }}>
                        <option value="" disabled>No. of Employees *</option>
                        {["1–10","11–50","51–200","201–500","500+"].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2
                                   -translate-y-1/2 pointer-events-none"
                                   style={{ color: C.textLight }} />
                    </div>

                    <p className="text-xs" style={{ color: C.textLight }}>
                      By providing your information, you hereby consent to the WorkMate{" "}
                      <a href="#" className="underline" style={{ color: C.primary }}>
                        Cookie Policy
                      </a>{" "}
                      and{" "}
                      <a href="#" className="underline" style={{ color: C.primary }}>
                        Privacy Policy
                      </a>.
                    </p>

                    <button type="submit"
                      style={{ backgroundColor: C.primary }}
                      className="w-full h-14 rounded-xl text-white font-bold
                                 text-base hover:opacity-90 transition-opacity
                                 shadow-lg flex items-center justify-center gap-2">
                      Start Free Trial
                      <ArrowRight size={18} />
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t flex items-center
                                  justify-center gap-2"
                       style={{ borderColor: C.border }}>
                    <span className="text-xs" style={{ color: C.textLight }}>
                      Already have an account?
                    </span>
                    <Link to="/login"
                      style={{ color: C.primary }}
                      className="text-xs font-semibold hover:underline">
                      Sign in →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center
                                  justify-center mx-auto mb-4"
                       style={{ backgroundColor: C.primary + "12" }}>
                    <CheckCircle size={32} style={{ color: C.primary }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: C.textDark }}>
                    You're in! 🎉
                  </h3>
                  <p className="text-sm mb-6" style={{ color: C.textLight }}>
                    We'll be in touch shortly. In the meantime, try the demo.
                  </p>
                  <Link to="/login"
                    style={{ backgroundColor: C.primary }}
                    className="inline-flex items-center gap-2 text-white font-semibold
                               px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                    Go to Dashboard
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 4: Stats ticker ─────────────────────────────────────────────────
function StatsTicker() {
  const stats = [
    { val: "500+",    label: "Employees Managed" },
    { val: "35+",     label: "REST API Endpoints" },
    { val: "3",       label: "Role-Based Portals" },
    { val: "7",       label: "Core Modules" },
    { val: "99.9%",   label: "Uptime Target" },
    { val: "Spring AI", label: "AI Integration" },
    { val: "Java 24", label: "Latest Backend" },
    { val: "PDF",     label: "Payslip Export" },
  ];

  return (
    <section style={{ backgroundColor: "#0B3D2E", borderTop: "1px solid #ffffff18" }}
             className="py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest
                      mb-8 text-white/40">
          What WorkMate delivers
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px"
             style={{ backgroundColor: "#ffffff18" }}>
          {stats.slice(0, 8).map(({ val, label }) => (
            <div key={val}
                 className="flex flex-col items-center justify-center py-8 px-4 text-center"
                 style={{ backgroundColor: "#0B3D2E" }}>
              <span className="text-3xl font-black text-white mb-1">{val}</span>
              <span className="text-xs text-white/50 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5: Features grid ────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Clock,
      color: "#E8420A",
      bg:    "#fef2ee",
      title: "Smart Attendance",
      desc:  "Auto check-in/out via dashboard. Working hours calculated automatically. PRESENT ≥ 8h · HALF_DAY ≥ 4h · ABSENT < 4h. Monthly reports with attendance %.",
      tag:   "Real-time",
    },
    {
      icon: Calendar,
      color: "#10B981",
      bg:    "#ecfdf5",
      title: "Leave Workflow",
      desc:  "5-layer validation — date order, past dates, weekends, overlap detection, balance sufficiency. Atomic approve with instant balance deduction. Full history.",
      tag:   "Automated",
    },
    {
      icon: Star,
      color: "#7C3AED",
      bg:    "#f5f3ff",
      title: "AI Performance Reviews",
      desc:  "Manager enters score + notes. Spring AI (GPT-4o-mini) generates a professional written review summary. Department analytics chart for HR.",
      tag:   "Spring AI",
      tagColor: "blue",
    },
    {
      icon: Briefcase,
      color: "#2563EB",
      bg:    "#eff6ff",
      title: "Recruitment Pipeline",
      desc:  "Post jobs, track candidates: APPLIED → SHORTLISTED → INTERVIEW → SELECTED. Interview scheduling with interviewer assignment and feedback.",
      tag:   "Pipeline",
    },
    {
      icon: FileText,
      color: "#E8420A",
      bg:    "#fef2ee",
      title: "PDF Payslips",
      desc:  "Auto-calculate Basic + HRA + Allowances − PF − Tax = Net Pay. iText7 generates a branded PDF. Employees download in one click. Full payslip history.",
      tag:   "PDF Export",
    },
    {
      icon: Shield,
      color: "#0B3D2E",
      bg:    "#ecfdf5",
      title: "Role-Based Security",
      desc:  "JWT + Spring Security. Three roles: Admin (full access), HR Manager (team management), Employee (own data only). @PreAuthorize on every endpoint.",
      tag:   "Secure",
      tagColor: "green",
    },
  ];

  return (
    <section id="features" style={{ backgroundColor: C.bodyBg }} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-14">
          <Badge>FEATURES</Badge>
          <h2 className="text-4xl font-extrabold mt-4 mb-4"
              style={{ color: C.textDark }}>
            Everything HR needs.
            <span style={{ color: C.primary }}> Nothing it doesn't.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: C.textLight }}>
            WorkMate replaces 5 separate tools with one unified platform built
            on Java 24 and Spring Boot 3.5.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, bg, title, desc, tag, tagColor }) => (
            <div key={title}
                 className="bg-white rounded-2xl border p-7 group
                            hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                 style={{ borderColor: C.border }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                   style={{ backgroundColor: bg }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base" style={{ color: C.textDark }}>{title}</h3>
                <Badge color={tagColor || "primary"}>{tag}</Badge>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.textLight }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 6: Role portals ─────────────────────────────────────────────────
function RolePortals() {
  const roles = [
    {
      role:    "ADMINISTRATOR",
      accent:  "#EF4444",
      accentBg:"#fef2f2",
      icon:    Shield,
      title:   "Admin Portal",
      desc:    "Complete organisational control. Create accounts, set salaries, promote employees, and manage every corner of the system.",
      items: [
        "Create HR + Employee login accounts",
        "Set salary structure + generate payslips",
        "Promote employees — designation + salary",
        "Post job openings, manage recruitment",
        "Approve / reject leaves across all teams",
        "Full org-wide analytics and reports",
      ],
    },
    {
      role:    "HR MANAGER",
      accent:  "#2563EB",
      accentBg:"#eff6ff",
      icon:    Users,
      title:   "HR Manager Portal",
      desc:    "Team management and HR operations. Approve leaves, track attendance, write performance reviews, and manage the candidate pipeline.",
      popular: true,
      items: [
        "Approve / reject leave requests",
        "Create AI-assisted performance reviews",
        "View team attendance dashboard daily",
        "Manage recruitment candidate pipeline",
        "Generate and share monthly payslips",
        "Seed onboarding checklists for new hires",
      ],
    },
    {
      role:    "EMPLOYEE",
      accent:  "#10B981",
      accentBg:"#ecfdf5",
      icon:    UserCheck,
      title:   "Employee Portal",
      desc:    "Everything you need, nothing you don't. Check in, apply for leave, download payslips, and track your own performance history.",
      items: [
        "Check in / out with live clock display",
        "Apply for leave and track request status",
        "Download PDF payslips in one click",
        "View your performance reviews and scores",
        "Complete your onboarding checklist",
        "View own monthly attendance report",
      ],
    },
  ];

  return (
    <section id="portals"
             style={{ backgroundColor: C.sectionBg }}
             className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <Badge color="green">ROLE PORTALS</Badge>
          <h2 className="text-4xl font-extrabold mt-4 mb-4"
              style={{ color: C.textDark }}>
            Three roles.
            <span style={{ color: C.primary }}> Three experiences.</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: C.textLight }}>
            Every user logs in to a dashboard built specifically for their role.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {roles.map(({ role, accent, accentBg, icon: Icon, title, desc, items, popular }) => (
            <div key={role}
                 className="relative bg-white rounded-2xl border overflow-hidden
                            hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                 style={{ borderColor: C.border }}>

              {/* Popular ribbon */}
              {popular && (
                <div className="absolute top-4 right-0 text-white text-xs font-bold
                                px-4 py-1.5 rounded-l-full z-10"
                     style={{ backgroundColor: accent }}>
                  MOST USED
                </div>
              )}

              {/* Coloured top border — exactly 4px, full width */}
              <div style={{ height: 4, backgroundColor: accent }} />

              <div className="p-8">
                {/* Role badge */}
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full
                                 mb-5 uppercase tracking-wider"
                      style={{ backgroundColor: accentBg, color: accent }}>
                  {role}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                     style={{ backgroundColor: accentBg }}>
                  <Icon size={26} style={{ color: accent }} />
                </div>

                <h3 className="text-xl font-bold mb-3" style={{ color: C.textDark }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: C.textLight }}>
                  {desc}
                </p>

                <ul className="space-y-3">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm"
                        style={{ color: C.textMid }}>
                      <CheckCircle size={15} style={{ color: accent, flexShrink: 0, marginTop: 1 }} />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link to="/login"
                  style={{ borderColor: accent, color: accent }}
                  className="mt-8 flex items-center justify-center gap-2 py-3
                             rounded-xl border-2 font-semibold text-sm
                             hover:text-white transition-colors"
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = accent;
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = accent;
                  }}>
                  Access {title} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 7: Modules tab showcase ────────────────────────────────────────
function Modules() {
  const [active, setActive] = useState(0);

  const modules = [
    {
      label: "Attendance",
      icon: Clock,
      heading: "Smart Attendance Tracking",
      body: "Employees check in and out from their personal dashboard. WorkMate automatically calculates working hours on checkout and determines attendance status — no manual entry needed. HR gets a live team view every morning.",
      bullets: [
        "Auto check-in / check-out via dashboard",
        "Working hours calculated on checkout",
        "PRESENT ≥ 8h · HALF_DAY ≥ 4h · ABSENT < 4h",
        "Monthly report: attendance %, daily breakdown",
        "HR manually marks WFH / HOLIDAY / LEAVE",
        "Real-time team attendance for HR and Admin",
      ],
      preview: (
        <div className="bg-white rounded-xl border p-5 shadow-sm"
             style={{ borderColor: C.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: C.textDark }}>
            Today's Attendance
          </p>
          <div className="font-mono text-3xl font-bold mb-4"
               style={{ color: C.primary }}>09:47:23 AM</div>
          <div className="space-y-2 mb-4">
            {[["WM-001","Shreyas Dakhole","Checked in 09:15","PRESENT"],
              ["WM-002","Priya Sharma",   "Checked in 09:30","PRESENT"],
              ["WM-003","Rahul Kumar",    "Not checked in",  "ABSENT"]].map(
              ([code, name, time, status]) => (
              <div key={code} className="flex items-center justify-between
                                         rounded-lg px-3 py-2"
                   style={{ backgroundColor: C.sectionBg }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: C.textDark }}>
                    {name}
                  </p>
                  <p className="text-xs" style={{ color: C.textLight }}>{time}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${status === "PRESENT" ? "bg-emerald-100 text-emerald-700"
                                         : "bg-red-100 text-red-700"}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
          <button style={{ backgroundColor: C.primary }}
                  className="w-full py-2.5 rounded-lg text-white text-sm font-semibold">
            Check In Now
          </button>
        </div>
      ),
    },
    {
      label: "Leave",
      icon: Calendar,
      heading: "Leave Management That Actually Works",
      body: "Five layers of validation before any leave is saved. Atomic approval ensures the status update and balance deduction happen together — or not at all. Cancellation restores balance automatically.",
      bullets: [
        "5-layer validation before leave submission",
        "Overlap detection via JPQL query",
        "Atomic @Transactional approve + balance deduct",
        "Cancel restores balance if leave was approved",
        "5 leave types: Casual · Sick · Earned · Maternity · Paternity",
        "HR approval queue with one-click approve / reject",
      ],
      preview: (
        <div className="bg-white rounded-xl border p-5 shadow-sm space-y-3"
             style={{ borderColor: C.border }}>
          <p className="text-sm font-semibold" style={{ color: C.textDark }}>
            Leave Balance 2025
          </p>
          {[["Casual","#E8420A",9,12],
            ["Sick","#10B981",7,7],
            ["Earned","#2563EB",12,15]].map(([type, color, used, total]) => (
            <div key={type}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: C.textMid }}>{type} Leave</span>
                <span style={{ color }} className="font-bold">{used}/{total} days</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: C.sectionBg }}>
                <div className="h-2 rounded-full transition-all duration-700"
                     style={{ width: `${(used/total)*100}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
          <div className="pt-2">
            <button style={{ backgroundColor: C.primary }}
                    className="w-full py-2.5 rounded-lg text-white text-sm font-semibold">
              Apply for Leave
            </button>
          </div>
        </div>
      ),
    },
    {
      label: "Performance",
      icon: Star,
      heading: "AI-Powered Performance Reviews",
      body: "Manager enters a score and bullet-point notes. Spring AI (via ChatClient) generates a professional, full written review summary in seconds. Department analytics show team performance at a glance.",
      bullets: [
        "Score 1–10 with auto label (Excellent, Outstanding…)",
        "Spring AI writes the review summary for HR",
        "One review per employee per period (enforced)",
        "Department-wise average score bar chart",
        "Employee sees own review history as timeline",
        "aiSummary column reserved — upgrade ready",
      ],
      preview: (
        <div className="bg-white rounded-xl border p-5 shadow-sm"
             style={{ borderColor: C.border }}>
          <p className="text-sm font-semibold mb-3" style={{ color: C.textDark }}>
            Q1 2025 — Performance Review
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center
                            text-lg font-bold text-white"
                 style={{ backgroundColor: C.primary }}>SD</div>
            <div>
              <p className="font-semibold text-sm" style={{ color: C.textDark }}>
                Shreyas Dakhole
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg font-black" style={{ color: C.primary }}>8</span>
                <span className="text-xs" style={{ color: C.textLight }}>/10</span>
                <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full
                                 bg-blue-50 text-blue-700">Excellent</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-3 text-xs leading-relaxed italic"
               style={{ backgroundColor: "#fef2ee", color: C.textMid }}>
            "Shreyas consistently delivers high-quality code and demonstrates
            strong communication skills. Areas of growth include documentation."
          </div>
          <p className="text-xs mt-2 flex items-center gap-1"
             style={{ color: C.textLight }}>
            <Zap size={11} style={{ color: C.primary }} />
            Generated by Spring AI · ChatClient (GPT-4o-mini)
          </p>
        </div>
      ),
    },
    {
      label: "Payroll",
      icon: IndianRupee,
      heading: "Payslips Employees Can Actually Download",
      body: "Set a salary structure once. Generate a payslip in one click. Employees download a professionally branded PDF instantly. iText7 generates the PDF — no third-party payroll service needed.",
      bullets: [
        "Salary structure: Basic + HRA + Transport + Allowances",
        "Deductions: PF + Income Tax + Other",
        "One-click payslip generation per month",
        "Employee downloads branded PDF payslip",
        "Promotion history logged with old/new salary",
        "Admin can promote + change designation in one action",
      ],
      preview: (
        <div className="bg-white rounded-xl border p-5 shadow-sm"
             style={{ borderColor: C.border }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-bold text-sm" style={{ color: C.textDark }}>
                Payslip — June 2025
              </p>
              <p className="text-xs" style={{ color: C.textLight }}>WM-001 · Shreyas Dakhole</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full
                             bg-emerald-50 text-emerald-700">GENERATED</span>
          </div>
          <div className="space-y-1.5 mb-4 text-xs">
            {[["Basic Salary","₹50,000","text-gray-700"],
              ["HRA","₹10,000","text-gray-700"],
              ["Transport","₹3,000","text-gray-700"],
              ["PF Deduction","−₹6,000","text-red-600"],
              ["Income Tax","−₹2,000","text-red-600"]].map(([k,v,c]) => (
              <div key={k} className="flex justify-between">
                <span style={{ color: C.textLight }}>{k}</span>
                <span className={`font-semibold ${c}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-3 flex justify-between items-center"
               style={{ backgroundColor: C.navBg }}>
            <span className="text-white text-xs font-medium">NET PAY</span>
            <span className="text-white font-black text-lg">₹55,000</span>
          </div>
          <button className="w-full mt-3 py-2 rounded-lg text-xs font-semibold
                             border flex items-center justify-center gap-1.5"
                  style={{ borderColor: C.primary, color: C.primary }}>
            <FileText size={13} /> Download PDF
          </button>
        </div>
      ),
    },
  ];

  const m = modules[active];

  return (
    <section id="modules" style={{ backgroundColor: C.bodyBg }} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <Badge>MODULES</Badge>
          <h2 className="text-4xl font-extrabold mt-4 mb-4"
              style={{ color: C.textDark }}>
            One platform.
            <span style={{ color: C.primary }}> Every HR workflow.</span>
          </h2>
          <p className="text-lg" style={{ color: C.textLight }}>
            Switch between modules without switching tools.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {modules.map(({ label, icon: Icon }, i) => (
            <button key={label} onClick={() => setActive(i)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm
                         font-semibold transition-all"
              style={active === i
                ? { backgroundColor: C.primary, color: "white",
                    boxShadow: `0 4px 14px ${C.primary}40` }
                : { backgroundColor: "white", color: C.textMid,
                    border: `1px solid ${C.border}` }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid lg:grid-cols-2 gap-10 items-center bg-white
                        rounded-2xl border p-8 lg:p-12"
             style={{ borderColor: C.border }}>
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: C.textDark }}>
              {m.heading}
            </h3>
            <p className="text-base leading-relaxed mb-6" style={{ color: C.textLight }}>
              {m.body}
            </p>
            <ul className="space-y-3">
              {m.bullets.map(b => <FeatureCheck key={b}>{b}</FeatureCheck>)}
            </ul>
            <Link to="/login"
              style={{ backgroundColor: C.primary }}
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl
                         text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              Try {m.label} Module <ArrowRight size={15} />
            </Link>
          </div>
          <div>{m.preview}</div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 8: Tech stack ───────────────────────────────────────────────────
function TechStack() {
  const tech = [
    { icon: "☕", name: "Java 24",       sub: "Latest JDK",        color: "#E8420A" },
    { icon: "🍃", name: "Spring Boot 3.5",sub: "REST Framework",   color: "#10B981" },
    { icon: "🤖", name: "Spring AI 1.0", sub: "ChatClient + RAG",  color: "#7C3AED" },
    { icon: "🗄",  name: "MySQL 9",       sub: "Primary Database",  color: "#2563EB" },
    { icon: "⚛",  name: "React 19",      sub: "Frontend",          color: "#06B6D4" },
    { icon: "🔐", name: "JWT + BCrypt",  sub: "Spring Security",   color: "#F59E0B" },
  ];

  return (
    <section style={{ backgroundColor: C.darkBg }} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest
                        mb-4 text-white/40">
            BUILT WITH
          </p>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Production-grade technology.
            <span style={{ color: C.primary }}> Proven stack.</span>
          </h2>
          <p className="text-white/50 text-base">
            Every choice made for performance, security, and scalability.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tech.map(({ icon, name, sub, color }) => (
            <div key={name}
                 className="flex flex-col items-center text-center p-6 rounded-2xl
                            border border-white/8 hover:border-white/20
                            hover:bg-white/5 transition-all cursor-default">
              <span className="text-3xl mb-3">{icon}</span>
              <p className="font-bold text-white text-sm mb-0.5">{name}</p>
              <p className="text-xs" style={{ color: color + "cc" }}>{sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/30 text-sm">
            700+ LeetCode Problems · NPTEL Gold in Java · Founder, Talentrix Solution ·
            B.Tech CSE 2nd Year
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 9: Testimonials ─────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      name:    "Rahul Kumar",
      role:    "HR Director, TechVentures",
      initials:"RK",
      color:   "#2563EB",
      stars:   5,
      quote:   "WorkMate transformed how we manage our 50-person team. The attendance tracking alone saves our HR 3 hours every Monday morning. The leave workflow is bulletproof.",
    },
    {
      name:    "Priya Sharma",
      role:    "People Manager, GrowthCo",
      initials:"PS",
      color:   "#10B981",
      stars:   5,
      quote:   "The 5-layer leave validation is exactly what we needed — no more balance errors or overlapping requests. Our employees love the self-service portal.",
    },
    {
      name:    "Arjun Verma",
      role:    "CTO, StartupHub",
      initials:"AV",
      color:   "#E8420A",
      stars:   5,
      quote:   "The Spring AI performance review writer is genuinely impressive. Manager inputs a score, WorkMate writes a professional review. It's like having an AI HR assistant.",
    },
  ];

  return (
    <section style={{ backgroundColor: C.sectionBg }} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <Badge>TESTIMONIALS</Badge>
          <h2 className="text-4xl font-extrabold mt-4 mb-4"
              style={{ color: C.textDark }}>
            What HR teams say about WorkMate
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, initials, color, stars, quote }) => (
            <div key={name}
                 className="bg-white rounded-2xl border p-8
                            hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                 style={{ borderColor: C.border }}>
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array(stars).fill(0).map((_, i) => (
                  <Star key={i} size={14} fill="#F59E0B" className="text-amber-400" />
                ))}
              </div>

              {/* Quote mark */}
              <p className="text-5xl font-serif leading-none mb-3"
                 style={{ color: color + "30" }}>"</p>

              <p className="text-sm leading-relaxed mb-6 italic"
                 style={{ color: C.textMid }}>"{quote}"</p>

              <div className="flex items-center gap-3 pt-4 border-t"
                   style={{ borderColor: C.border }}>
                <div className="w-10 h-10 rounded-full flex items-center
                                justify-center text-white text-sm font-bold"
                     style={{ backgroundColor: color }}>
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.textDark }}>
                    {name}
                  </p>
                  <p className="text-xs" style={{ color: C.textLight }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 10: Final CTA ───────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ backgroundColor: C.navBg }} className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block text-sm font-semibold px-4 py-1.5
                         rounded-full border border-white/20 text-white/70 mb-6">
          🚀 Ready to transform your HR operations?
        </span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
          Start managing your team
          <br />
          <span style={{ color: C.primary }}>the smart way.</span>
        </h2>
        <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          WorkMate brings together attendance, leaves, payroll, performance,
          and AI — in one platform your entire team will actually use.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login"
            style={{ backgroundColor: C.primary }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4
                       rounded-xl text-white font-bold text-base hover:opacity-90
                       transition-opacity shadow-xl">
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          <a href="#modules"
             className="inline-flex items-center justify-center gap-2 px-8 py-4
                        rounded-xl text-white font-semibold text-base border
                        border-white/20 hover:bg-white/10 transition-colors">
            <Play size={16} /> See the Modules
          </a>
        </div>
        <p className="text-white/30 text-sm mt-8">
          Built by Shreyas Prakash Dakhole · Talentrix Solution · B.Tech CSE
        </p>
      </div>
    </section>
  );
}

// ─── SECTION 11: Footer ──────────────────────────────────────────────────────
function Footer() {
  const cols = [
    {
      heading: "Product",
      links: ["Features", "Modules", "Pricing", "Changelog", "Roadmap"],
    },
    {
      heading: "Company",
      links: ["About", "Blog", "Careers", "Press", "Contact"],
    },
    {
      heading: "Resources",
      links: ["Documentation", "API Reference", "Swagger UI", "GitHub", "Status"],
    },
  ];

  return (
    <footer style={{ backgroundColor: "#060E09" }}
            className="border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: C.primary }}>
                <span className="text-white font-black text-sm">W</span>
              </div>
              <span className="text-white font-bold text-lg">WorkMate</span>
            </div>
            <p className="text-sm leading-relaxed text-white/40 max-w-xs mb-6">
              A Human Resource Management System built by Talentrix Solution.
              Designed to make HR human again.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-white/50">
                👨‍💻 <span className="text-white/70">Shreyas Prakash Dakhole</span>
              </p>
              <p className="text-white/50">
                🎓 B.Tech CSE · 2nd Year
              </p>
              <p className="text-white/50">
                🏆 NPTEL Gold · Java
              </p>
              <p className="text-white/50">
                💡 700+ LeetCode Problems
              </p>
              <p className="text-white/50">
                🚀 Founder, Talentrix Solution
              </p>
            </div>
          </div>

          {/* Nav columns */}
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <p className="text-white text-sm font-semibold uppercase tracking-wider mb-5">
                {heading}
              </p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}>
                    <a href="#"
                       className="text-sm text-white/40 hover:text-white/80 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col
                        sm:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-sm">
            © 2025 WorkMate by Talentrix Solution. All rights reserved.
          </p>
          <p className="text-white/25 text-sm">
            Built with ❤️ using Java 24 + Spring Boot + React 19
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── ROOT COMPONENT ──────────────────────────────────────────────────────────
export default function LandingPage() {
  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <StatsTicker />
      <Features />
      <Modules />
      <RolePortals />
      <TechStack />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}