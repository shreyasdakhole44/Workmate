import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Shield, Users, UserCheck, ChevronDown, Menu, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// ─── Colour tokens (matching LandingPage) ───────────────────────────────────
const C = {
  navBg:      "#0B3D2E",   // HROne's dark-green navbar
  navText:    "#FFFFFF",
  primary:    "#E8420A",   // HROne's orange-red brand colour
  primaryHov: "#C73708",
  bodyBg:     "#FAF7F2",   // HROne warm cream background
  border:     "#E5E7EB",
};

function NavLink({ children, href = "#" }) {
  return (
    <a href={href}
      className="flex items-center gap-1 text-sm font-medium text-white/90
                 hover:text-white transition-colors cursor-pointer">
      {children}
      {href === "#" && <ChevronDown size={14} className="opacity-60" />}
    </a>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Features",       hasDropdown: false, href: "/#features" },
    { label: "Modules",        hasDropdown: false, href: "/#modules" },
    { label: "Why WorkMate",   hasDropdown: false, href: "/#why-workmate" },
    { label: "Role Portals",   hasDropdown: false, href: "/#portals" },
    { label: "Testimonials",   hasDropdown: false, href: "/#testimonials" },
  ];

  return (
    <nav style={{ backgroundColor: C.navBg }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">

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
            </NavLink>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/signup"
            style={{ backgroundColor: C.primary }}
            className="inline-flex items-center gap-2 text-sm font-semibold
                       text-white px-5 py-2.5 rounded-lg hover:opacity-90
                       transition-opacity shadow-md">
            Sign Up
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
             className="lg:hidden border-t border-white/10 px-4 py-4 space-y-3 text-left">
          {navLinks.map(l => (
            <a key={l.label} href={l.href || "#"}
               className="block text-white/80 hover:text-white text-sm
                          font-medium py-2" onClick={() => setMobileOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <Link to="/signup"
              style={{ backgroundColor: C.primary }}
              className="text-sm font-semibold text-white text-center
                         py-3 rounded-lg">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  // Validation States
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (val) => {
    if (!val) return "This field is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) return "Enter a valid email address";
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "This field is required";
    if (val.length < 4) return "Password must be at least 4 characters";
    return "";
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    }
    if (field === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleChange = (field, value) => {
    if (field === "email") {
      setEmail(value);
      if (touched.email) {
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
      }
    }
    if (field === "password") {
      setPassword(value);
      if (touched.password) {
        setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    // Validate all fields
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    
    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) {
      toast.error("Please resolve the validation errors first.");
      return;
    }

    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.fullName || "User"}!`);
      navigate("/dashboard");
    } catch (err) {
      setSubmitError("Invalid email or password. Please try again.");
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSubmitError("");
    setErrors({ email: "", password: "" });
    setTouched({ email: false, password: false });
    toast.success("Demo credentials loaded!");
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden select-none"
         style={{ backgroundColor: C.bodyBg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{
             backgroundImage: "radial-gradient(circle, #00000008 1px, transparent 1px)",
             backgroundSize: "28px 28px",
           }} />

      {/* Reusable Navbar matching Landing Page theme */}
      <Navbar />

      {/* Responsive Split Layout */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Welcome badge, copy, and role cards */}
          <div className="text-left">
            
            {/* Pill Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-6"
                 style={{ borderColor: C.primary + "40", backgroundColor: C.primary + "08" }}>
              <span style={{ color: C.primary }} className="text-xs font-semibold uppercase tracking-wider">
                Welcome back
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Sign in to{" "}
              <span style={{ color: C.primary }} className="block sm:inline">
                WorkMate.
              </span>
            </h1>

            {/* Subcopy */}
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
              Access your dashboard — whether you're managing the whole organisation, running HR operations, or just checking in for the day.
            </p>

            {/* Role Portals Preview List */}
            <div className="space-y-3.5 max-w-md">
              {/* Card 1 */}
              <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  Admins see organisation-wide control
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  HR managers see their team's daily operations
                </p>
              </div>

              {/* Card 3 */}
              <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <UserCheck size={18} />
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  Employees see their own attendance, leave, and payslips
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Branded Login Form Card */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in</h2>
              <p className="text-sm text-gray-400 mb-6">Enter your credentials to continue</p>

              {/* Red banner for failed login attempts */}
              {submitError && (
                <div className="mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2.5">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <span className="font-semibold">{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Address input */}
                <div className="space-y-1">
                  <input
                    type="email"
                    placeholder="Work email"
                    value={email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full h-14 border rounded-xl px-4 text-sm outline-none transition-all ${
                      touched.email && errors.email 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-gray-200 focus:border-[#E8420A] focus:ring-2 focus:ring-[#E8420A]/20"
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password input */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={`w-full h-14 border rounded-xl pl-4 pr-12 text-sm outline-none transition-all ${
                        touched.password && errors.password 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-[#E8420A] focus:ring-2 focus:ring-[#E8420A]/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember me & Forgot Password links */}
                <div className="flex items-center justify-between text-sm py-1">
                  <label className="flex items-center gap-2 text-gray-650 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-[#E8420A] focus:ring-[#E8420A]" />
                    <span className="text-gray-500 text-sm">Remember me</span>
                  </label>
                  <a href="#" 
                     onClick={(e) => { e.preventDefault(); toast.success("Password reset request sent. Check your email."); }}
                     style={{ color: C.primary }} 
                     className="font-semibold hover:underline">
                    Forgot password?
                  </a>
                </div>

                {/* Submit button with loading state */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: C.primary }}
                  className="w-full h-14 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <span>Sign in →</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-150"></div>
                </div>
                <span className="relative bg-white px-3 text-xs text-gray-455 uppercase tracking-wider font-semibold">
                  or
                </span>
              </div>

              {/* CTA link to Get Started */}
              <div className="text-center text-sm">
                <span className="text-gray-500">Don't have an account? </span>
                <Link to="/signup" 
                   style={{ color: C.primary }} 
                   className="font-semibold hover:underline">
                  Get started →
                </Link>
              </div>

              {/* Terms & Privacy policies links */}
              <p className="text-[11px] text-gray-400 text-center mt-6 leading-relaxed">
                By signing in, you agree to WorkMate's{" "}
                <a href="#" className="underline hover:text-gray-600" style={{ color: C.primary }}>Terms of Service</a> and{" "}
                <a href="#" className="underline hover:text-gray-600" style={{ color: C.primary }}>Privacy Policy</a>.
              </p>

            </div>

            {/* Quick Demo portal setups */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mt-6 text-left space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Quick Demo Logins Setup
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: "Admin", email: "admin@workmate.com", pass: "admin123", bg: "bg-red-50 text-red-700 hover:bg-red-100/50 border-red-100" },
                  { role: "HR Manager", email: "hr@workmate.com", pass: "hr123", bg: "bg-blue-50 text-blue-700 hover:bg-blue-100/50 border-blue-100" },
                  { role: "Employee", email: "emp@workmate.com", pass: "emp123", bg: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/50 border-emerald-100" }
                ].map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleDemoClick(demo.email, demo.pass)}
                    className={`text-left text-[11px] p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] font-semibold ${demo.bg}`}
                  >
                    <span className="font-extrabold">{demo.role}</span>
                    <span className="opacity-75 font-mono text-[9px] mt-0.5 truncate w-full">{demo.email}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
