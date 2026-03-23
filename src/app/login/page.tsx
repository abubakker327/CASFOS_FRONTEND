"use client";

import { useState } from "react";
import { Mail, Lock, Eye, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/app/Services/api";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    login: "", // Can be email or username
    password: "",
    role: "", // Added role selection
    remember: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate role selection
    if (!formData.role) {
      setError("Please select your role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Make API call to Laravel backend
      const response = await api.post('/login', {
        login: formData.login,
        password: formData.password
        // Role is not sent to backend as it's used for UI only
        // The backend will determine role from the user record
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Set default authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        
        // Redirect based on role from backend
        router.push(response.data.data.redirect);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f9fafb] font-sans">

      {/* Left Panel: Branding / Image */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-12 overflow-hidden bg-[#163e27]">
        {/* Abstract Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/forest_sun.png')" }}
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-linear-to-t from-[#102d1d]/90 via-[#102d1d]/40 to-transparent z-0" />

        <div className="relative z-10 w-full max-w-125 p-8 sm:p-10 rounded-3xl backdrop-blur-md bg-black/10 border border-white/10 shadow-2xl">
          <div className="flex flex-col gap-8">
            {/* Header / Badges */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-white/20 border border-white/20 backdrop-blur-sm shadow-sm flex items-center">
                <span className="text-[11px] font-bold text-white tracking-wide uppercase drop-shadow-sm">
                  Official Training Portal
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-[44px] sm:text-[52px] leading-[1.05] font-bold text-white serif-font tracking-tight drop-shadow-md">
              Excellence in <br /> Forest Service <br /> Training
            </h1>

            {/* Blockquote */}
            <div className="flex gap-4 items-stretch pr-4">
              <div className="w-1 bg-[#95cd84] rounded-full shrink-0 shadow-[0_0_8px_rgba(149,205,132,0.6)]" />
              <p className="text-[17px] text-white/95 font-medium leading-[1.6] tracking-wide drop-shadow-sm py-1">
                “A centralized digital platform supporting training programmes, learning resources, assessments, and institutional services of CASFOS, Coimbatore.”
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto z-10">

        <div className="w-full max-w-105 bg-white rounded-3xl p-10 sm:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 relative">

          <div className="text-center mb-8">
            <h2 className="text-[28px] font-bold text-gray-900 serif-font mb-1.5">Welcome Back</h2>
            <p className="text-[13px] font-medium text-gray-500">Sign in to access the CASFOS portal</p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[13px] font-medium text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Email/Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Email / Username</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  autoComplete="username"
                  placeholder="Enter your email or username"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#256242]/20 focus:border-[#256242] transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#256242]/20 focus:border-[#256242] transition-all"
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role Select Field - UNCOMMENTED */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Role</label>
              <div className="relative">
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#256242]/20 focus:border-[#256242] transition-all appearance-none cursor-pointer"
                  required
                  disabled={loading}
                >
                  <option value="" disabled>Select your role</option>
                  <option value="admin">Admin / Director</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="trainee">Officer Trainee</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-1 mb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <input 
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="peer w-4 h-4 border-gray-300 rounded text-[#256242] focus:ring-[#256242]/20 transition-all appearance-none border checked:bg-[#256242] checked:border-[#256242]" 
                    disabled={loading}
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[12px] font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-[12px] font-bold text-[#256242] hover:text-[#1a472f] transition-colors">Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-[#2a6d4b] hover:bg-[#1f5639] text-white font-bold text-[14px] rounded-xl transition-all shadow-md hover:shadow-lg mt-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}