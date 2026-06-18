import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, ShieldCheck, Users, Percent, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation States
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (val) => {
    if (!val) return "Email is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required";
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
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({ email: "", password: "" });
    setTouched({ email: false, password: false });
    toast.success("Demo credentials loaded!");
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-bg overflow-hidden">
      
      {/* ── Left Side Panel (55% Width on Desktop) ── */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#1E2A4A] via-[#111827] to-[#1E2A4A] text-white p-12 flex-col justify-between relative">
        {/* Subtle glowing elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-light/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
            <svg className="w-6 h-6 text-blue-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15,25 L38,78 L50,50 L62,78 L85,25" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M27,25 L44,65 L50,50 L56,65 L73,25" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            </svg>
          </div>
          <div>
            <h1 className="text-[18px] font-bold tracking-wide text-white leading-none">WorkMate</h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">HRMS & Payroll Suite</p>
          </div>
        </div>

        {/* Brand Tagline */}
        <div className="max-w-md my-auto z-10 space-y-6">
          <h2 className="text-[44px] font-bold leading-tight tracking-tight text-white">
            HR made <span className="text-brand">human.</span>
          </h2>
          <p className="text-[15px] text-slate-300 leading-relaxed font-normal">
            Simplify performance appraisals, automate core payroll checks, and manage attendance timelines effortlessly in one cohesive, secure platform.
          </p>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 z-10 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400">
              <Users size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Employees</span>
            </div>
            <p className="text-[20px] font-bold text-white leading-none">12,500+</p>
            <p className="text-[10px] text-slate-400">Profiles Managed</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <Percent size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Uptime</span>
            </div>
            <p className="text-[20px] font-bold text-white leading-none">99.99%</p>
            <p className="text-[10px] text-slate-400">SLA Guaranteed</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldCheck size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security</span>
            </div>
            <p className="text-[20px] font-bold text-white leading-none">3 Portals</p>
            <p className="text-[10px] text-slate-400">RBAC Secured</p>
          </div>
        </div>
      </div>

      {/* ── Right Side Form (45% Width on Desktop) ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 md:p-12 relative bg-white">
        
        {/* Subtle backdrop shapes for mobile/tablet */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-full max-w-[380px] space-y-7 z-10">
          
          {/* Logo header for mobile views */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#1E2A4A] flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15,25 L38,78 L50,50 L62,78 L85,25" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M27,25 L44,65 L50,50 L56,65 L73,25" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
              </svg>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900 leading-none">WorkMate HRMS</h2>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Talentrix Solution</p>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">Welcome back</h3>
            <p className="text-[13px] text-gray-400 font-normal">Please sign in with your enterprise credentials</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                className={`input text-xs ${
                  touched.email && errors.email ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={!!errors.email}
              />
              {touched.email && errors.email && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input pr-10 text-xs ${
                    touched.password && errors.password ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs font-semibold py-3 mt-2 rounded-lg flex items-center justify-center shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" color="white" /> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick-select Demo Logins */}
          <div className="border-t border-gray-150 pt-5 space-y-3 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Quick Demo Portals Setup
            </p>
            <div className="space-y-2">
              {[
                {
                  role: "Admin",
                  email: "admin@workmate.com",
                  pass: "admin123",
                  colorClass: "bg-red-50 text-red-700 hover:bg-red-100/60 border border-red-100",
                },
                {
                  role: "HR Manager",
                  email: "hr@workmate.com",
                  pass: "hr123",
                  colorClass: "bg-blue-50 text-blue-700 hover:bg-blue-100/60 border border-[#FEF2EE]",
                },
                {
                  role: "Employee",
                  email: "emp@workmate.com",
                  pass: "emp123",
                  colorClass: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/60 border border-emerald-100",
                },
                {
                  role: "Employee (Rohit)",
                  email: "rohit@workmate.com",
                  pass: "rohit123",
                  colorClass: "bg-amber-50 text-amber-700 hover:bg-amber-100/60 border border-amber-100",
                },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleDemoClick(d.email, d.pass)}
                  className={`w-full text-left text-[11px] px-3.5 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] font-medium ${d.colorClass}`}
                >
                  <div className="min-w-0">
                    <span className="font-bold">{d.role}:</span>
                    <span className="opacity-80 ml-2 font-mono truncate">{d.email}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider shrink-0 opacity-75">Auto-fill</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
