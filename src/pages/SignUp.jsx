import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import logo from "../assets/zaptalklogo.png";

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
  const strengthColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'];
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
      await api.post("/auth/register", { name, email, password });
      setSuccess("Verification link sent to your email. Please check your inbox.");
      setHasTriedSignup(true);
      setLastResendTime(Date.now());
      setName("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!hasTriedSignup || resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/auth/resend-verification`, { email });
      setSuccess(`Verification email resent successfully! Check your inbox.`);
      setResendAttempts(prev => prev + 1);
      setLastResendTime(Date.now());
      
      const cooldownTimes = [30, 60, 120, 300];
      const cooldownIndex = Math.min(resendAttempts, cooldownTimes.length - 1);
      setResendCooldown(cooldownTimes[cooldownIndex]);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isResendDisabled = !hasTriedSignup || resendCooldown > 0 || isResending || !email.trim();

  const getResendButtonText = () => {
    if (!hasTriedSignup) return "Complete signup first";
    if (isResending) return "Sending...";
    if (resendCooldown > 0) return `Resend in ${resendCooldown}s`;
    if (resendAttempts === 0) return "Didn't get email? Resend verification";
    return `Resend verification email`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 p-8 text-center border-b border-slate-700/50">
            <div className="mb-6">
              <img src={logo} alt="ZapTalk" className="mx-auto h-16 w-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Join ZapTalk</h1>
              <p className="text-slate-400">Create your account and start connecting</p>
            </div>
            
            {/* Enhanced Step indicator */}
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${step === 1 ? 'text-orange-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step === 1 ? 'border-orange-400 bg-orange-400/20' : 'border-slate-600'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Details</span>
              </div>
              <div className={`w-8 h-0.5 transition-colors duration-300 ${step === 2 ? 'bg-orange-400' : 'bg-slate-600'}`}></div>
              <div className={`flex items-center space-x-2 ${step === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step === 2 ? 'border-orange-400 bg-orange-400/20' : 'border-slate-600'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Security</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Enhanced Alert System */}
            {(error || success) && (
              <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-500 ${
                error 
                  ? 'bg-red-900/30 border-red-700/50 text-red-200' 
                  : 'bg-green-900/30 border-green-700/50 text-green-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${error ? 'bg-red-400/20' : 'bg-green-400/20'}`}>
                    <svg className={`w-4 h-4 ${error ? 'text-red-400' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={error ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                                     : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{error || success}</p>
                    {success && hasTriedSignup && (
                      <div className="mt-2 pt-2 border-t border-green-700/30 text-xs space-y-1">
                        <p className="text-green-300">Email: <span className="font-mono">{email}</span></p>
                        {lastResendTime && (
                          <p className="text-green-400/80">
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
              <div className="p-4 rounded-xl border bg-amber-900/20 border-amber-700/40 text-amber-200">
                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-amber-400/20">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Multiple attempts detected</p>
                    <p className="text-xs text-amber-300/80 mt-1">Check your spam folder or contact support.</p>
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
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Choose a Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-orange-400 transition-colors">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-gray-800/80 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-orange-400 transition-colors">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-gray-800/80 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-400/30 focus:ring-4 focus:ring-orange-400/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Continue</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
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
                  className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 p-2 -m-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">Back to details</span>
                </button>

                <div className="space-y-5">
                  {/* Password Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Create Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-orange-400 transition-colors">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-gray-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-gray-800/80 transition-all duration-200"
                        required
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
                    
                    {/* Enhanced Password Strength Indicator */}
                    {password && (
                      <div className="mt-3 p-3 bg-gray-800/40 rounded-lg border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-400">Password Strength</span>
                          <span className="text-xs font-semibold" style={{ color: strengthColors[passwordStrength - 1] || '#EF4444' }}>
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
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.414-4.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-12 pr-12 py-4 bg-gray-800/60 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-gray-800/80 transition-all duration-200 ${
                          confirmPassword && password !== confirmPassword ? 'border-red-400/70' : 'border-slate-600/50'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition duration-200 p-1"
                      >
                        {showConfirmPassword ? (
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
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-2 text-xs text-red-400 font-medium flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Passwords don't match</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Enhanced Terms and Conditions */}
                <div className="p-4 bg-gray-800/40 rounded-xl border border-slate-700/50">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-slate-600 text-orange-500 focus:ring-orange-500/50 focus:ring-offset-gray-800 bg-gray-700/50"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed">
                      I agree to ZapTalk's{' '}
                      <Link to="/terms" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors duration-200 underline underline-offset-2">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors duration-200 underline underline-offset-2">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading || !acceptTerms}
                  className={`w-full py-4 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 transform ${
                    isLoading || !acceptTerms
                      ? "bg-slate-600 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-500/25 hover:shadow-orange-400/30 focus:ring-4 focus:ring-orange-400/30 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating your account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Create Account</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Enhanced Resend Verification Button */}
                <button 
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
                </button>

                {/* Resend Status Info */}
                {hasTriedSignup && (
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
                )}
              </form>
            )}
          </div>

          {/* Footer - Login Link */}
          {step === 1 && (
            <div className="bg-gray-800/40 p-6 text-center border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-orange-400 hover:text-orange-300 transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Additional Help Section */}
        {step === 2 && hasTriedSignup && (
          <div className="mt-6 text-center">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-slate-300">Need Help?</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
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
      </div>
    </div>
  );
}