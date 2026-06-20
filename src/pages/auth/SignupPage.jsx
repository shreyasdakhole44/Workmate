import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, Sparkles, ChevronDown, Menu, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// ─── Colour tokens (matching LoginPage & LandingPage) ────────────────────────
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
          <Link to="/login"
            style={{ backgroundColor: C.primary }}
            className="inline-flex items-center gap-2 text-sm font-semibold
                       text-white px-5 py-2.5 rounded-lg hover:opacity-90
                       transition-opacity shadow-md">
            Sign In
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
            <Link to="/login"
              style={{ backgroundColor: C.primary }}
              className="text-sm font-semibold text-white text-center
                         py-3 rounded-lg animate-none">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
    companySize: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    companyName: false,
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
  });

  const getPasswordStrength = (pass) => {
    if (!pass) return { strength: 0, strengthColor: "bg-gray-100", strengthLabel: "" };
    if (pass.length < 8) {
      return { strength: 1, strengthColor: "bg-red-500", strengthLabel: "Weak (minimum 8 characters)" };
    }
    const hasNumbersOrSpecials = /[\d!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasMixedCase = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
    
    if (hasNumbersOrSpecials && hasMixedCase) {
      return { strength: 3, strengthColor: "bg-emerald-500", strengthLabel: "Strong" };
    } else {
      return { strength: 2, strengthColor: "bg-amber-500", strengthLabel: "Good" };
    }
  };

  const { strength, strengthColor, strengthLabel } = getPasswordStrength(formData.password);

  const validateField = (name, val) => {
    if (name === "firstName") {
      return !val.trim() ? "First name is required" : "";
    }
    if (name === "lastName") {
      return !val.trim() ? "Last name is required" : "";
    }
    if (name === "companyName") {
      return !val.trim() ? "Company name is required" : "";
    }
    if (name === "email") {
      if (!val) return "Work email is required";
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(val)) return "Enter a valid email address";
      return "";
    }
    if (name === "password") {
      if (!val) return "Password is required";
      if (val.length < 8) return "Password must be at least 8 characters";
      return "";
    }
    return "";
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      companyName: validateField("companyName", formData.companyName),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };

    setTouched({
      firstName: true,
      lastName: true,
      companyName: true,
      email: true,
      password: true,
    });
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(err => err !== "");
    if (hasErrors) {
      toast.error("Please resolve the validation errors first.");
      return;
    }

    if (!formData.agree) {
      toast.error("You must agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    // Simulate API registration request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success("Account created successfully!");
    }, 1200);
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

      {/* Navbar */}
      <Navbar />

      {/* Responsive Split Layout */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Welcome trial badges, copy, and checklist */}
          <div className="text-left">
            
            {/* Pill Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-6"
                 style={{ borderColor: C.primary + "40", backgroundColor: C.primary + "08" }}>
              <Sparkles size={14} style={{ color: C.primary }} />
              <span style={{ color: C.primary }} className="text-xs font-semibold uppercase tracking-wider">
                Free 14-day trial
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Start your{" "}
              <span style={{ color: C.primary }} className="block">
                HR transformation.
              </span>
            </h1>

            {/* Subcopy */}
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
              No credit card required. Set up your organisation in under 5 minutes and invite your team.
            </p>

            {/* Checklist */}
            <div className="space-y-3 max-w-md">
              {[
                "Unlimited employees on the free trial",
                "All modules included — attendance, leave, payroll, performance",
                "AI-powered performance review summaries",
                "PDF payslip generation from day one",
                "Dedicated onboarding support",
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle size={18} className="text-[#E8420A] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            {/* Social-proof trust stack */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#FAF7F2] bg-emerald-500 text-[10px] font-bold text-white uppercase shadow-sm shrink-0">
                  SD
                </div>
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#FAF7F2] bg-blue-500 text-[10px] font-bold text-white uppercase shadow-sm shrink-0">
                  PS
                </div>
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#FAF7F2] bg-amber-500 text-[10px] font-bold text-white uppercase shadow-sm shrink-0">
                  RK
                </div>
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#FAF7F2] bg-purple-500 text-[10px] font-bold text-white uppercase shadow-sm shrink-0">
                  AV
                </div>
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Joining 500+ teams already using WorkMate
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: Signup Form Card */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
              <p className="text-sm text-gray-400 mb-6">Get started in less than 2 minutes</p>

              {success ? (
                /* Success confirmation state */
                <div className="space-y-5 py-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Account created! Check your email to verify and get started.</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We've sent a verification link to <strong className="text-gray-700">{formData.email}</strong>. Please check your inbox and click the verification link to activate your free trial.
                  </p>
                  <div className="pt-2">
                    <Link to="/login" 
                          style={{ backgroundColor: C.primary }}
                          className="w-full h-14 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30">
                      Sign In to Account →
                    </Link>
                  </div>
                </div>
              ) : (
                /* Regular Sign-up Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Row 1: First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        onBlur={() => handleBlur("firstName")}
                        className={`w-full h-12 border rounded-xl px-4 text-sm outline-none transition-all ${
                          touched.firstName && errors.firstName 
                            ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-[#E8420A] focus:ring-2 focus:ring-[#E8420A]/20"
                        }`}
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        onBlur={() => handleBlur("lastName")}
                        className={`w-full h-12 border rounded-xl px-4 text-sm outline-none transition-all ${
                          touched.lastName && errors.lastName 
                            ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-[#E8420A] focus:ring-2 focus:ring-[#E8420A]/20"
                        }`}
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Company Name */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Your company name"
                      value={formData.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      onBlur={() => handleBlur("companyName")}
                      className={`w-full h-12 border rounded-xl px-4 text-sm outline-none transition-all ${
                        touched.companyName && errors.companyName 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-[#E8420A] focus:ring-2 focus:ring-[#E8420A]/20"
                      }`}
                    />
                    {touched.companyName && errors.companyName && (
                      <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.companyName}</p>
                    )}
                  </div>

                  {/* Row 3: Work Email */}
                  <div className="space-y-1">
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={`w-full h-12 border rounded-xl px-4 text-sm outline-none transition-all ${
                        touched.email && errors.email 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-[#E8420A] focus:ring-2 focus:ring-[#E8420A]/20"
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.email}</p>
                    )}
                  </div>

                  {/* Row 4: Password with Show/Hide & strength meter */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        onBlur={() => handleBlur("password")}
                        className={`w-full h-12 border rounded-xl pl-4 pr-12 text-sm outline-none transition-all ${
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
                      <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.password}</p>
                    )}

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                              strength >= i ? strengthColor : "bg-gray-100"
                            }`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 font-semibold">{strengthLabel}</p>
                      </div>
                    )}
                  </div>

                  {/* Row 5: Company Size Dropdown */}
                  <div className="relative">
                    <select
                      value={formData.companySize}
                      onChange={(e) => handleChange("companySize", e.target.value)}
                      className="w-full h-12 border border-gray-200 rounded-xl px-4 text-sm appearance-none bg-white outline-none cursor-pointer focus:border-[#E8420A] focus:ring-2 focus:ring-[#E8420A]/20"
                      style={{ color: formData.companySize ? "#111827" : "#9CA3AF" }}
                    >
                      <option value="" disabled>No. of Employees</option>
                      {["1-10", "11-50", "51-200", "201-500", "500+"].map((o) => (
                        <option key={o} value={o} className="text-gray-900">{o}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>

                  {/* Checkbox Row */}
                  <label className="flex items-start gap-2.5 text-xs text-gray-500 mt-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agree}
                      onChange={(e) => handleChange("agree", e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-[#E8420A] focus:ring-[#E8420A]/30 cursor-pointer"
                    />
                    <span>
                      I agree to the{" "}
                      <a href="#" onClick={(e) => { e.preventDefault(); toast.success("Displaying Terms of Service..."); }} className="text-[#E8420A] underline hover:opacity-80">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" onClick={(e) => { e.preventDefault(); toast.success("Displaying Privacy Policy..."); }} className="text-[#E8420A] underline hover:opacity-80">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!formData.agree || loading}
                    style={{ backgroundColor: formData.agree && !loading ? C.primary : undefined }}
                    className={`w-full h-14 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer
                      ${(!formData.agree || loading) 
                        ? "bg-gray-200 opacity-50 cursor-not-allowed shadow-none text-gray-400" 
                        : "hover:opacity-90 shadow-orange-650/30"
                      }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating account…</span>
                      </>
                    ) : (
                      <span>Create Free Account →</span>
                    )}
                  </button>

                </form>
              )}

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-150"></div>
                </div>
                <span className="relative bg-white px-3 text-xs text-gray-455 uppercase tracking-wider font-semibold">
                  or
                </span>
              </div>

              {/* Reverse link back to Login */}
              <div className="text-center text-sm">
                <span className="text-gray-500">Already have an account? </span>
                <Link to="/login" style={{ color: C.primary }} className="font-semibold hover:underline">
                  Sign in →
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
