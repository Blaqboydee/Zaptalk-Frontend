import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import logo from "../assets/zaptalklogo.png";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Check,
  Zap,
  HelpCircle
} from "lucide-react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState(1);
  
  // Resend verification states
  const [hasTriedSignup, setHasTriedSignup] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [lastResendTime, setLastResendTime] = useState(null);
  
  const navigate = useNavigate();

  // Password strength checker
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#22D3EE'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  // Cooldown timer effect
  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (passwordStrength < 2) {
      setError("Please choose a stronger password");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", { name, email, password });
      
      console.log("Registration response:", response.data);
      
      setSuccess("Your account has been created! Routing to login...");
      
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      console.error("Registration error:", err.response?.data);
      
      setError(err.response?.data?.message || "Error creating account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleResend = async () => {
  //   if (!hasTriedSignup || resendCooldown > 0 || isResending) return;

  //   setIsResending(true);
  //   setError("");
  //   setSuccess("");

  //   try {
  //     await api.post(`/auth/resend-verification`, { email });
  //     setSuccess(`Verification email resent successfully! Check your inbox.`);
  //     setResendAttempts(prev => prev + 1);
  //     setLastResendTime(Date.now());
      
  //     const cooldownTimes = [30, 60, 120, 300];
  //     const cooldownIndex = Math.min(resendAttempts, cooldownTimes.length - 1);
  //     setResendCooldown(cooldownTimes[cooldownIndex]);

  //   } catch (err) {
  //     setError(err.response?.data?.message || "Failed to resend verification email. Please try again.");
  //   } finally {
  //     setIsResending(false);
  //   }
  // };

  // const isResendDisabled = !hasTriedSignup || resendCooldown > 0 || isResending || !email.trim();

  // const getResendButtonText = () => {
  //   if (!hasTriedSignup) return "Complete signup first";
  //   if (isResending) return "Sending...";
  //   if (resendCooldown > 0) return `Resend in ${resendCooldown}s`;
  //   if (resendAttempts === 0) return "Didn't get email? Resend verification";
  //   return `Resend verification email`;
  // };

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
              <h2 className="text-2xl font-bold text-white mb-2">Join ZapTalk</h2>
              <p className="text-sm lg:text-base" style={{ color: '#A1A1AA' }}>
                Create your account and start connecting
              </p>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 transition-all duration-300`}>
                <div 
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300"
                  style={{
                    borderColor: step === 1 ? '#8B5CF6' : '#2D2640',
                    backgroundColor: step === 1 ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    color: step === 1 ? '#8B5CF6' : '#71717A'
                  }}
                >
                  1
                </div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: step === 1 ? '#8B5CF6' : '#71717A' }}
                >
                  Details
                </span>
              </div>
              <div 
                className="w-8 h-0.5 transition-colors duration-300"
                style={{ backgroundColor: step === 2 ? '#8B5CF6' : '#2D2640' }}
              />
              <div className={`flex items-center space-x-2 transition-all duration-300`}>
                <div 
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300"
                  style={{
                    borderColor: step === 2 ? '#8B5CF6' : '#2D2640',
                    backgroundColor: step === 2 ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    color: step === 2 ? '#8B5CF6' : '#71717A'
                  }}
                >
                  2
                </div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: step === 2 ? '#8B5CF6' : '#71717A' }}
                >
                  Security
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Alert System */}
            {(error || success) && (
              <div 
                className="p-4 rounded-xl backdrop-blur-sm transition-all duration-500 animate-fade-in"
                style={{
                  backgroundColor: error 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'rgba(16, 185, 129, 0.1)',
                  border: error 
                    ? '1px solid rgba(239, 68, 68, 0.5)' 
                    : '1px solid rgba(16, 185, 129, 0.5)'
                }}
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="p-1 rounded-full"
                    style={{
                      backgroundColor: error 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : 'rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    {error ? (
                      <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                    ) : (
                      <CheckCircle size={16} style={{ color: '#10B981' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-sm font-medium"
                      style={{ color: error ? '#FCA5A5' : '#86EFAC' }}
                    >
                      {error || success}
                    </p>
                    {success && hasTriedSignup && (
                      <div 
                        className="mt-2 pt-2 text-xs space-y-1"
                        style={{ 
                          borderTop: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#86EFAC'
                        }}
                      >
                        <p>Email: <span className="font-mono">{email}</span></p>
                        {lastResendTime && (
                          <p style={{ color: 'rgba(134, 239, 172, 0.8)' }}>
                            Sent: {new Date(lastResendTime).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Multiple Resend Warning */}
            {resendAttempts >= 3 && (
              <div 
                className="p-4 rounded-xl animate-fade-in"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.4)'
                }}
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="p-1 rounded-full"
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}
                  >
                    <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#FCD34D' }}>
                      Multiple attempts detected
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(252, 211, 77, 0.8)' }}>
                      Check your spam folder or contact support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <form className="space-y-6" onSubmit={handleNext}>
                <div className="space-y-5">
                  {/* Username Field */}
                  <div className="group">
                    <label 
                      className="block text-sm font-semibold mb-3"
                      style={{ color: '#FFFFFF' }}
                    >
                      Choose a Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User size={20} style={{ color: '#71717A' }} />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label 
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
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        required
                      />
                    </div>
                  </div>
                </div>

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
            )}

            {/* Step 2: Security */}
            {step === 2 && (
              <form className="space-y-6" onSubmit={handleSignUp}>
                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center space-x-2 p-2 -m-2 transition-all duration-200 hover:scale-105"
                  style={{ color: '#A1A1AA' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1AA'}
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Back to details</span>
                </button>

                <div className="space-y-5">
                  {/* Password Field */}
                  <div className="group">
                    <label 
                      className="block text-sm font-semibold mb-3"
                      style={{ color: '#FFFFFF' }}
                    >
                      Create Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={20} style={{ color: '#71717A' }} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        required
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
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div 
                        className="mt-3 p-3 rounded-lg"
                        style={{ 
                          backgroundColor: 'rgba(37, 32, 50, 0.4)',
                          border: '1px solid rgba(45, 38, 64, 0.5)'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium" style={{ color: '#A1A1AA' }}>
                            Password Strength
                          </span>
                          <span 
                            className="text-xs font-semibold"
                            style={{ color: strengthColors[passwordStrength - 1] || '#EF4444' }}
                          >
                            {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className="h-2 flex-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: level <= passwordStrength
                                  ? strengthColors[passwordStrength - 1]
                                  : 'rgba(255, 255, 255, 0.1)'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="group">
                    <label 
                      className="block text-sm font-semibold mb-3"
                      style={{ color: '#FFFFFF' }}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Check size={20} style={{ color: '#71717A' }} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
                        style={{ 
                          backgroundColor: '#252032',
                          border: `1px solid ${confirmPassword && password !== confirmPassword ? '#EF4444' : '#2D2640'}`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = confirmPassword && password !== confirmPassword ? '#EF4444' : '#8B5CF6';
                          e.target.style.boxShadow = confirmPassword && password !== confirmPassword 
                            ? '0 0 0 2px rgba(239, 68, 68, 0.1)' 
                            : '0 0 0 2px rgba(139, 92, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = confirmPassword && password !== confirmPassword ? '#EF4444' : '#2D2640';
                          e.target.style.boxShadow = 'none';
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 transition duration-200 p-1 hover:scale-110"
                        style={{ color: '#A1A1AA' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1AA'}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-2 text-xs font-medium flex items-center space-x-1" style={{ color: '#EF4444' }}>
                        <AlertTriangle size={12} />
                        <span>Passwords don't match</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div 
                  className="p-4 rounded-xl"
                  style={{ 
                    backgroundColor: 'rgba(37, 32, 50, 0.4)',
                    border: '1px solid rgba(45, 38, 64, 0.5)'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded focus:ring-offset-gray-800"
                      style={{ 
                        backgroundColor: '#252032',
                        borderColor: '#2D2640'
                      }}
                      required
                    />
                    <label htmlFor="terms" className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
                      I agree to ZapTalk's{' '}
                      <Link 
                        to="/terms" 
                        className="font-semibold transition-colors duration-200 underline underline-offset-2"
                        style={{ color: '#22D3EE' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#06B6D4'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#22D3EE'}
                      >
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link 
                        to="/privacy" 
                        className="font-semibold transition-colors duration-200 underline underline-offset-2"
                        style={{ color: '#22D3EE' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#06B6D4'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#22D3EE'}
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading || !acceptTerms}
                  className={`w-full py-4 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 transform text-white ${
                    isLoading || !acceptTerms
                      ? "cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  style={{ 
                    backgroundColor: isLoading || !acceptTerms ? '#6D28D9' : '#8B5CF6',
                    opacity: isLoading || !acceptTerms ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => !isLoading && !(!acceptTerms) && (e.currentTarget.style.backgroundColor = '#7C3AED')}
                  onMouseLeave={(e) => !isLoading && !(!acceptTerms) && (e.currentTarget.style.backgroundColor = '#8B5CF6')}
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
                      <span>Creating your account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Create Account</span>
                      <CheckCircle size={20} />
                    </div>
                  )}
                </button>

                {/* Enhanced Resend Verification Button */}
                {/* <button 
                  type="button"
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  className={`w-full py-3 px-4 rounded-xl font-medium border-2 border-dashed transition-all duration-200 ${
                    isResendDisabled
                      ? "bg-transparent border-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-gray-800/30 border-slate-600 text-slate-300 hover:bg-gray-700/40 hover:text-white hover:border-slate-500 focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                  title={!hasTriedSignup ? "You must complete the signup process first" : ""}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isResending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <div className="p-1 rounded-full bg-slate-600/30">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span>{getResendButtonText()}</span>
                      </>
                    ) : !hasTriedSignup ? (
                      <>
                        <div className="p-1 rounded-full bg-slate-600/30">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <span>{getResendButtonText()}</span>
                      </>
                    ) : (
                      <>
                        <div className="p-1 rounded-full bg-orange-400/20">
                          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span>{getResendButtonText()}</span>
                      </>
                    )}
                  </div>
                </button> */}

                {/* Resend Status Info */}
                {/* {hasTriedSignup && (
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-slate-700/30 text-center">
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">
                        Verification email will be sent to:
                      </p>
                      <p className="text-sm font-mono text-slate-300 bg-gray-900/50 px-3 py-1 rounded-lg inline-block">
                        {email}
                      </p>
                      {resendAttempts > 0 && (
                        <p className="text-xs text-slate-500">
                          Resent {resendAttempts} time{resendAttempts > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )} */}
              </form>
            )}
          </div>

          {/* Footer - Login Link */}
          {step === 1 && (
            <div 
              className="py-6 text-center"
              style={{ 
                backgroundColor: '#252032',
                borderTop: '1px solid #2D2640'
              }}
            >
              <p className="text-sm" style={{ color: '#A1A1AA' }}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold transition-colors duration-200 hover:underline underline-offset-2"
                  style={{ color: '#22D3EE' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#06B6D4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#22D3EE'}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Additional Help Section */}
        {step === 2 && hasTriedSignup && (
          <div className="mt-6 text-center animate-fade-in">
            <div 
              className="backdrop-blur-sm rounded-2xl p-6"
              style={{ 
                backgroundColor: 'rgba(37, 32, 50, 0.5)',
                border: '1px solid rgba(45, 38, 64, 0.3)'
              }}
            >
              <div className="flex items-center justify-center space-x-2 mb-3">
                <HelpCircle size={20} style={{ color: '#A1A1AA' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                  Need Help?
                </h3>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>
                Having trouble receiving the verification email? Check your spam folder or try a different email address.
              </p>
              {/* <div className="flex flex-col sm:flex-row gap-2 text-xs">
                <Link 
                  to="/help" 
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
                >
                  Contact Support
                </Link>
                <Link 
                  to="/faq" 
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
                >
                  View FAQ
                </Link>
              </div> */}
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: '#8B5CF6' }} />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: '#22D3EE' }} />
      </div>
    </div>
  );
}