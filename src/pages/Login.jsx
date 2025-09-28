import { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/zaptalklogo.png";
import GoogleSignIn from "../components/GoogleAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if redirected from Google login
  useEffect(() => {
    const token = searchParams.get("token");
    const verified = searchParams.get("verified");

    if (token) {
      login(token);
      navigate("/allchats");
    }

    if (verified) {
      setError("Email verified! You can now log in.");
    }
  }, [searchParams]);

  // Regular login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/allchats");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 p-4 text-center border-b border-slate-700/50">
            <div className="mb-6">
              <img src={logo} alt="ZapTalk" className="mx-auto h-16 w-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-slate-400">Sign in to continue your conversations</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Enhanced Alert System */}
            {error && (
              <div className="p-4 rounded-xl border bg-red-900/30 border-red-700/50 text-red-200 backdrop-blur-sm transition-all duration-500">
                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-red-400/20">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{error}</p>
                    <p className="text-xs text-red-300/80 mt-1">Please check your credentials and try again.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign-In Component */}
            <GoogleSignIn />

            {/* Enhanced Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900/80 text-slate-400">or sign in with email</span>
              </div>
            </div>

            {/* Enhanced Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                {/* Email Field */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-orange-400 transition-colors">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-gray-800/80 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-orange-400 transition-colors">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-gray-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-gray-800/80 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition duration-200 p-1"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878L8.464 8.464m5.656 5.656l1.415 1.415M14.534 14.534l1.415 1.415M14.534 14.534L8.464 8.464" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-orange-500 focus:ring-orange-500/50 focus:ring-offset-gray-800 bg-gray-700/50"
                  />
                  <label htmlFor="remember" className="text-sm text-slate-400">
                    Remember me
                  </label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Enhanced Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 transform ${
                  isLoading
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-500/25 hover:shadow-orange-400/30 focus:ring-4 focus:ring-orange-400/30 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Footer - Sign Up Link */}
          <div className="bg-gray-800/40 p-6 text-center border-t border-slate-700/50">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-semibold text-orange-400 hover:text-orange-300 transition-colors duration-200 hover:underline underline-offset-2"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}