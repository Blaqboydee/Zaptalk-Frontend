import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
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
  HelpCircle,
  MailCheck
} from "lucide-react";

export default function SignUp() {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // UI states
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Verification states
  const [registrationComplete, setRegistrationComplete] = useState(false);
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

  // Handlers
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
      
      setRegistrationComplete(true);
      setSuccess("Account created! Please check your email to verify your account.");
      setLastResendTime(Date.now());
      setResendCooldown(60);
      
    } catch (err) {
      console.error("Registration error:", err.response?.data);
      
      if (err.response?.status === 409) {
        setError("This email is already registered. Please login instead.");
      } else {
        setError(err.response?.data?.error || "Error creating account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/auth/resend-verification`, { email });
      setSuccess(`Verification email resent successfully! Check your inbox at ${email}`);
      setResendAttempts(prev => prev + 1);
      setLastResendTime(Date.now());
      
      const cooldownTimes = [60, 120, 300];
      const cooldownIndex = Math.min(resendAttempts, cooldownTimes.length - 1);
      setResendCooldown(cooldownTimes[cooldownIndex]);

    } catch (err) {
      console.error("Resend error:", err.response?.data);
      setError(err.response?.data?.error || "Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getResendButtonText = () => {
    if (isResending) return "Sending...";
    if (resendCooldown > 0) return `Resend in ${resendCooldown}s`;
    if (resendAttempts === 0) return "Resend Verification Email";
    return `Resend Again`;
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: '#0F0F1A' }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: '#8B5CF6' }} />
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: '#22D3EE' }} />

      <div className="w-full max-w-lg animate-fade-in relative z-10">
        {/* Main Card */}
        <div 
          className="rounded-2xl overflow-hidden"
          style={{ 
            backgroundColor: '#1A1625',
            border: '1px solid #2D2640'
          }}
        >
          {/* Header Section */}
          <Header 
            registrationComplete={registrationComplete}
            step={step}
          />

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Alert System */}
            <AlertBanner 
              error={error}
              success={success}
              registrationComplete={registrationComplete}
              email={email}
              lastResendTime={lastResendTime}
            />

            {/* Multiple Resend Warning */}
            {resendAttempts >= 3 && (
              <ResendWarning />
            )}

            {/* Main Content */}
            {registrationComplete ? (
              <VerificationScreen
                email={email}
                handleResend={handleResend}
                isResending={isResending}
                resendCooldown={resendCooldown}
                resendAttempts={resendAttempts}
                getResendButtonText={getResendButtonText}
              />
            ) : (
              <>
                {step === 1 && (
                  <StepOneForm
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    handleNext={handleNext}
                  />
                )}

                {step === 2 && (
                  <StepTwoForm
                    password={password}
                    setPassword={setPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                    passwordStrength={passwordStrength}
                    strengthColors={strengthColors}
                    strengthLabels={strengthLabels}
                    acceptTerms={acceptTerms}
                    setAcceptTerms={setAcceptTerms}
                    handleBack={handleBack}
                    handleSignUp={handleSignUp}
                    isLoading={isLoading}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer - Login Link */}
          {!registrationComplete && step === 1 && (
            <Footer />
          )}
        </div>

        {/* Help Section */}
        {registrationComplete && (
          <HelpSection />
        )}
      </div>
    </div>
  );
}

// ============= COMPONENTS =============

function Header({ registrationComplete, step }) {
  return (
    <div className="p-8 text-center" style={{ borderBottom: '1px solid #2D2640' }}>
      <div className="mb-6">
        {/* Logo */}
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
        
        {!registrationComplete ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">Join ZapTalk</h2>
            <p className="text-sm lg:text-base" style={{ color: '#A1A1AA' }}>
              Create your account and start connecting
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <div 
                className="p-4 rounded-full"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
              >
                <MailCheck size={48} style={{ color: '#10B981' }} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-sm lg:text-base" style={{ color: '#A1A1AA' }}>
              We've sent a verification link to verify your account
            </p>
          </>
        )}
      </div>
      
      {/* Step indicator */}
      {!registrationComplete && (
        <StepIndicator step={step} />
      )}
    </div>
  );
}

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <StepCircle step={step} currentStep={1} label="Details" />
      <div 
        className="w-8 h-0.5 transition-colors duration-300"
        style={{ backgroundColor: step === 2 ? '#8B5CF6' : '#2D2640' }}
      />
      <StepCircle step={step} currentStep={2} label="Security" />
    </div>
  );
}

function StepCircle({ step, currentStep, label }) {
  const isActive = step === currentStep;
  return (
    <div className="flex items-center space-x-2 transition-all duration-300">
      <div 
        className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300"
        style={{
          borderColor: isActive ? '#8B5CF6' : '#2D2640',
          backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
          color: isActive ? '#8B5CF6' : '#71717A'
        }}
      >
        {currentStep}
      </div>
      <span 
        className="text-sm font-medium"
        style={{ color: isActive ? '#8B5CF6' : '#71717A' }}
      >
        {label}
      </span>
    </div>
  );
}

function AlertBanner({ error, success, registrationComplete, email, lastResendTime }) {
  if (!error && !success) return null;

  return (
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
          {success && registrationComplete && (
            <div 
              className="mt-2 pt-2 text-xs space-y-1"
              style={{ 
                borderTop: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#86EFAC'
              }}
            >
              <p>Email sent to: <span className="font-mono">{email}</span></p>
              {lastResendTime && (
                <p style={{ color: 'rgba(134, 239, 172, 0.8)' }}>
                  Last sent: {new Date(lastResendTime).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResendWarning() {
  return (
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
            Check your spam folder or contact support if you still haven't received the email.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepOneForm({ name, setName, email, setEmail, handleNext }) {
  return (
    <form className="space-y-6" onSubmit={handleNext}>
      <div className="space-y-5">
        <InputField
          label="Choose a Username"
          icon={<User size={20} style={{ color: '#71717A' }} />}
          type="text"
          placeholder="Enter your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <InputField
          label="Email Address"
          icon={<Mail size={20} style={{ color: '#71717A' }} />}
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
  );
}

function StepTwoForm({ 
  password, setPassword, confirmPassword, setConfirmPassword,
  showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
  passwordStrength, strengthColors, strengthLabels,
  acceptTerms, setAcceptTerms, handleBack, handleSignUp, isLoading
}) {
  return (
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
        <PasswordInput
          label="Create Password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          icon={<Lock size={20} style={{ color: '#71717A' }} />}
        />
        
        {/* Password Strength Indicator */}
        {password && (
          <PasswordStrength 
            passwordStrength={passwordStrength}
            strengthColors={strengthColors}
            strengthLabels={strengthLabels}
          />
        )}

        {/* Confirm Password Field */}
        <div className="group">
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
            icon={<Check size={20} style={{ color: '#71717A' }} />}
            error={confirmPassword && password !== confirmPassword}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-2 text-xs font-medium flex items-center space-x-1" style={{ color: '#EF4444' }}>
              <AlertTriangle size={12} />
              <span>Passwords don't match</span>
            </p>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <TermsCheckbox acceptTerms={acceptTerms} setAcceptTerms={setAcceptTerms} />

      {/* Create Account Button */}
      <SubmitButton isLoading={isLoading} acceptTerms={acceptTerms} />
    </form>
  );
}

function InputField({ label, icon, ...inputProps }) {
  return (
    <div className="group">
      <label 
        className="block text-sm font-semibold mb-3"
        style={{ color: '#FFFFFF' }}
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          {...inputProps}
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
  );
}

function PasswordInput({ label, icon, value, onChange, showPassword, setShowPassword, placeholder, error }) {
  return (
    <div className="group">
      <label 
        className="block text-sm font-semibold mb-3"
        style={{ color: '#FFFFFF' }}
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
          style={{ 
            backgroundColor: '#252032',
            border: `1px solid ${error ? '#EF4444' : '#2D2640'}`
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#EF4444' : '#8B5CF6';
            e.target.style.boxShadow = error
              ? '0 0 0 2px rgba(239, 68, 68, 0.1)' 
              : '0 0 0 2px rgba(139, 92, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#EF4444' : '#2D2640';
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
    </div>
  );
}

function PasswordStrength({ passwordStrength, strengthColors, strengthLabels }) {
  return (
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
  );
}

function TermsCheckbox({ acceptTerms, setAcceptTerms }) {
  return (
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
  );
}

function SubmitButton({ isLoading, acceptTerms }) {
  return (
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
      onMouseEnter={(e) => !isLoading && acceptTerms && (e.currentTarget.style.backgroundColor = '#7C3AED')}
      onMouseLeave={(e) => !isLoading && acceptTerms && (e.currentTarget.style.backgroundColor = '#8B5CF6')}
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
  );
}

function VerificationScreen({ email, handleResend, isResending, resendCooldown, resendAttempts, getResendButtonText }) {
  const isResendDisabled = resendCooldown > 0 || isResending;

  return (
    <div className="space-y-6">
      {/* Email Sent Info */}
      <div 
        className="p-6 rounded-xl text-center space-y-4"
        style={{ 
          backgroundColor: 'rgba(37, 32, 50, 0.4)',
          border: '1px solid rgba(45, 38, 64, 0.5)'
        }}
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            Verification Email Sent
          </h3>
          <p className="text-sm" style={{ color: '#A1A1AA' }}>
            We've sent a verification link to:
          </p>
          <p 
            className="text-sm font-mono px-4 py-2 rounded-lg inline-block"
            style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#22D3EE',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            {email}
          </p>
        </div>

        <div 
          className="pt-4 space-y-2 text-xs"
          style={{ 
            borderTop: '1px solid rgba(45, 38, 64, 0.5)',
            color: '#A1A1AA'
          }}
        >
          <p className="flex items-center justify-center gap-2">
            <CheckCircle size={14} style={{ color: '#10B981' }} />
            Click the link in your email to verify your account
          </p>
          <p className="flex items-center justify-center gap-2">
            <CheckCircle size={14} style={{ color: '#10B981' }} />
            After verification, you can login to ZapTalk
          </p>
        </div>
      </div>

      {/* Resend Button */}
      <button 
        type="button"
        onClick={handleResend}
        disabled={isResendDisabled}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
          isResendDisabled
            ? "cursor-not-allowed opacity-50"
            : "hover:scale-[1.02] active:scale-[0.98]"
        }`}
        style={{
          backgroundColor: isResendDisabled ? '#252032' : 'rgba(139, 92, 246, 0.2)',
          border: `2px solid ${isResendDisabled ? '#2D2640' : '#8B5CF6'}`,
          color: isResendDisabled ? '#71717A' : '#FFFFFF'
        }}
        onMouseEnter={(e) => !isResendDisabled && (e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.3)')}
        onMouseLeave={(e) => !isResendDisabled && (e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)')}
      >
        <div className="flex items-center justify-center space-x-3">
          {isResending ? (
            <>
              <div 
                className="w-5 h-5 rounded-full animate-spin"
                style={{ 
                  border: '2px solid #FFFFFF',
                  borderTopColor: 'transparent'
                }}
              />
              <span>Sending...</span>
            </>
          ) : resendCooldown > 0 ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{getResendButtonText()}</span>
            </>
          ) : (
            <>
              <Mail size={20} />
              <span>{getResendButtonText()}</span>
            </>
          )}
        </div>
      </button>

      {/* Resend Stats */}
      {resendAttempts > 0 && (
        <div 
          className="p-3 rounded-lg text-center text-xs"
          style={{ 
            backgroundColor: 'rgba(37, 32, 50, 0.4)',
            border: '1px solid rgba(45, 38, 64, 0.5)',
            color: '#71717A'
          }}
        >
          <p>
            Email resent {resendAttempts} time{resendAttempts > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Back to Login */}
      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center justify-center space-x-2 text-sm font-medium transition-colors duration-200"
          style={{ color: '#22D3EE' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#06B6D4'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#22D3EE'}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}

function Footer() {
  return (
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
  );
}

function HelpSection() {
  return (
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
        <div className="space-y-3 text-xs" style={{ color: '#A1A1AA' }}>
          <p className="leading-relaxed">
            Having trouble receiving the verification email?
          </p>
          <div 
            className="p-3 rounded-lg text-left space-y-2"
            style={{ 
              backgroundColor: 'rgba(37, 32, 50, 0.5)',
              border: '1px solid rgba(45, 38, 64, 0.5)'
            }}
          >
            <p className="flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
              <span>Check your spam/junk folder</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
              <span>Make sure you entered the correct email address</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
              <span>Wait a few minutes before requesting a new email</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}