import { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/zaptalklogo.png";
import GoogleSignIn from "../components/GoogleAuth";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  LogIn,
  ArrowLeft,
  AlertTriangle,
  Zap
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState(1); // 1 = email, 2 = password (mobile only)
  const [isMobile, setIsMobile] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Handle email submission (mobile only)
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setError("");
      setStep(2);
    }
  };

  // Handle back to email step
  const handleBack = () => {
    setStep(1);
    setError("");
  };

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

  // Determine if we should show single page or multi-step
  const showEmailStep = !isMobile || step === 1;
  const showPasswordStep = !isMobile || step === 2;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0F0F1A' }}
    >
      <div className="w-full max-w-lg animate-fade-in">
        {/* Main Card */}
        <div 
          className="rounded-2xl overflow-hidden"
          style={{ 
            backgroundColor: '#1A1625',
            border: '1px solid #2D2640'
          }}
        >
          
          {/* Header Section */}
          <div className="p-8 text-center" style={{ borderBottom: '1px solid #2D2640' }}>
            <div className="mb-6">
              {/* Logo with Zap Icon */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  <Zap size={32} className="text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Zap<span style={{ color: '#22D3EE' }}>Talk</span>
                </h1>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isMobile && step === 2 ? "Enter Password" : "Welcome Back"}
              </h2>
              <p className="text-sm lg:text-base" style={{ color: '#A1A1AA' }}>
                {isMobile && step === 2 
                  ? `Signing in as ${email}` 
                  : "Sign in to continue your conversations"}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Error Alert */}
            {error && (
              <div 
                className="p-4 rounded-xl backdrop-blur-sm transition-all duration-500 animate-fade-in"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.5)'
                }}
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="p-1 rounded-full"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#FCA5A5' }}>
                      {error}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(252, 165, 165, 0.8)' }}>
                      Please check your credentials and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Email Step (Mobile) or Full Form (Desktop) */}
            {showEmailStep && (
              <>
                {/* Google Sign-In Component */}
                <GoogleSignIn />

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full" style={{ borderTop: '1px solid #2D2640' }} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span 
                      className="px-4"
                      style={{ 
                        backgroundColor: '#1A1625',
                        color: '#A1A1AA'
                      }}
                    >
                      or sign in with email
                    </span>
                  </div>
                </div>

                {/* Email Form (Mobile Step 1) */}
                {isMobile ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="group">
                      <label 
                        htmlFor="email" 
                        className="block text-sm font-semibold mb-3"
                        style={{ color: '#FFFFFF' }}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail size={20} style={{ color: '#71717A' }} />
                        </div>
                        <input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
                          style={{ 
                            backgroundColor: '#252032',
                            border: '1px solid #2D2640'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#8B5CF6';
                            e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#2D2640';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      type="submit"
                      className="w-full py-4 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-white"
                      style={{ backgroundColor: '#8B5CF6' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>Continue</span>
                        <ArrowRight size={20} />
                      </div>
                    </button>
                  </form>
                ) : null}
              </>
            )}

            {/* STEP 2: Password Step (Mobile) or Full Form (Desktop) */}
            {(showPasswordStep || !isMobile) && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-5">
                  {/* Email Field (Desktop only) */}
                  {!isMobile && (
                    <div className="group">
                      <label 
                        htmlFor="email" 
                        className="block text-sm font-semibold mb-3"
                        style={{ color: '#FFFFFF' }}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail size={20} style={{ color: '#71717A' }} />
                        </div>
                        <input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
                          style={{ 
                            backgroundColor: '#252032',
                            border: '1px solid #2D2640'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#8B5CF6';
                            e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#2D2640';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Field */}
                  {(!isMobile || step === 2) && (
                    <div className="group">
                      <label 
                        htmlFor="password" 
                        className="block text-sm font-semibold mb-3"
                        style={{ color: '#FFFFFF' }}
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock size={20} style={{ color: '#71717A' }} />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
                          style={{ 
                            backgroundColor: '#252032',
                            border: '1px solid #2D2640'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#8B5CF6';
                            e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#2D2640';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 transition duration-200 p-1 hover:scale-110"
                          style={{ color: '#A1A1AA' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1AA'}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                {(!isMobile || step === 2) && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500/50 focus:ring-offset-gray-800"
                        style={{ 
                          backgroundColor: '#252032',
                          borderColor: '#2D2640'
                        }}
                      />
                      <label 
                        htmlFor="remember" 
                        className="text-sm"
                        style={{ color: '#A1A1AA' }}
                      >
                        Remember me
                      </label>
                    </div>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm font-medium transition-colors duration-200 hover:underline underline-offset-2"
                      style={{ color: '#22D3EE' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#06B6D4'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#22D3EE'}
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Sign In Button with Back Option */}
                {(!isMobile || step === 2) && (
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-4 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 transform text-white ${
                        isLoading
                          ? "cursor-not-allowed"
                          : "hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                      style={{ 
                        backgroundColor: isLoading ? '#6D28D9' : '#8B5CF6',
                        opacity: isLoading ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#7C3AED')}
                      onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#8B5CF6')}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div 
                            className="w-5 h-5 rounded-full animate-spin"
                            style={{ 
                              border: '2px solid #FFFFFF',
                              borderTopColor: 'transparent'
                            }}
                          />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Sign In</span>
                          <LogIn size={20} />
                        </div>
                      )}
                    </button>

                    {/* Back Button (Mobile Step 2 only) */}
                    {isMobile && step === 2 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="w-full py-3 px-6 font-medium rounded-xl text-white transition-all duration-200 hover:scale-[1.02]"
                        style={{ 
                          backgroundColor: '#252032',
                          border: '1px solid #2D2640'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <ArrowLeft size={20} />
                          <span>Back to Email</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Footer - Sign Up Link */}
          <div 
            className="py-6 text-center"
            style={{ 
              backgroundColor: '#252032',
              borderTop: '1px solid #2D2640'
            }}
          >
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-semibold transition-colors duration-200 hover:underline underline-offset-2"
                style={{ color: '#22D3EE' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#06B6D4'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#22D3EE'}
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: '#8B5CF6' }} />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: '#22D3EE' }} />
      </div>
    </div>
  );
}