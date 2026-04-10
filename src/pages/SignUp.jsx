import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle,
  AlertTriangle, ArrowLeft, Check, Flame, HelpCircle, MailCheck,
} from "lucide-react";

export default function SignUp() {
  const [name, setName]                           = useState("");
  const [email, setEmail]                         = useState("");
  const [password, setPassword]                   = useState("");
  const [confirmPassword, setConfirmPassword]     = useState("");
  const [acceptTerms, setAcceptTerms]             = useState(false);

  const [step, setStep]                           = useState(1);
  const [isLoading, setIsLoading]                 = useState(false);
  const [error, setError]                         = useState("");
  const [success, setSuccess]                     = useState("");
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isResending, setIsResending]             = useState(false);
  const [resendCooldown, setResendCooldown]       = useState(0);
  const [resendAttempts, setResendAttempts]       = useState(0);
  const [lastResendTime, setLastResendTime]       = useState(null);

  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    let s = 0;
    if (pass.length >= 8)           s++;
    if (/[a-z]/.test(pass))         s++;
    if (/[A-Z]/.test(pass))         s++;
    if (/[0-9]/.test(pass))         s++;
    if (/[^A-Za-z0-9]/.test(pass))  s++;
    return s;
  };
  const passwordStrength  = getPasswordStrength(password);
  const strengthColors    = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "var(--ember-cyan)"];
  const strengthLabels    = ["Very weak", "Weak", "Fair", "Good", "Strong"];

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) { setError("Please fill in all fields."); return; }
    setStep(2);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (passwordStrength < 2)         { setError("Please choose a stronger password."); return; }
    if (!acceptTerms)                 { setError("Please accept the terms to continue."); return; }
    setIsLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login?registered=true");
    } catch (err) {
      if (err.response?.status === 409)
        setError("This email is already registered — sign in instead.");
      else
        setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true); setError(""); setSuccess("");
    try {
      await api.post("/auth/resend-verification", { email });
      setSuccess(`Verification email resent to ${email}`);
      setResendAttempts((p) => p + 1);
      setLastResendTime(Date.now());
      const cooldowns = [60, 120, 300];
      setResendCooldown(cooldowns[Math.min(resendAttempts, cooldowns.length - 1)]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const resendLabel = isResending
    ? "Sending…"
    : resendCooldown > 0
      ? `Resend in ${resendCooldown}s`
      : resendAttempts === 0 ? "Resend verification email" : "Resend again";

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute animate-orb" style={{ width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,87,34,0.09) 0%, transparent 65%)", top: "-80px", right: "-60px" }} />
        <div className="absolute animate-orb" style={{ width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)", bottom: "20px", left: "-40px", animationDelay: "2.5s" }} />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-fire)" }}>
            <Flame size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 900, fontSize: "24px", letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            ember<span style={{ color: "var(--ember-fire)" }}>.</span>
          </span>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)" }}>

          {/* Card header */}
          <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border-color)" }}>
            {registrationComplete ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <MailCheck size={26} color="var(--success)" strokeWidth={1.8} />
                </div>
                <h1 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 6 }}>Check your inbox</h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)", fontWeight: 500 }}>We sent a verification link to your email</p>
              </div>
            ) : (
              <>
                <h1 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 6 }}>
                  Create your<br />
                  <span style={{ background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>account.</span>
                </h1>
                <p style={{ fontSize: "14px", color: "var(--text-tertiary)", fontWeight: 500 }}>Join your people on Ember</p>
                <StepIndicator step={step} />
              </>
            )}
          </div>

          {/* Card body */}
          <div className="px-8 py-7 space-y-5">

            {error   && <AlertBanner type="error"   message={error} />}
            {success && <AlertBanner type="success" message={success} extra={lastResendTime ? `Last sent: ${new Date(lastResendTime).toLocaleTimeString()}` : null} />}

            {resendAttempts >= 3 && (
              <AlertBanner type="warning" message="Multiple attempts detected — check your spam folder or contact support." />
            )}

            {registrationComplete ? (
              <VerificationScreen
                email={email}
                handleResend={handleResend}
                isResending={isResending}
                resendCooldown={resendCooldown}
                resendLabel={resendLabel}
              />
            ) : step === 1 ? (
              <form className="space-y-5" onSubmit={handleNext}>
                <EmberField label="Username" type="text" placeholder="Choose a username" value={name} onChange={(e) => setName(e.target.value)} icon={<User size={16} color="var(--text-tertiary)" />} required />
                <EmberField label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={16} color="var(--text-tertiary)" />} required />
                <button type="submit" className="btn-ember w-full" style={{ padding: "13px" }}>
                  <span>Continue</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleSignUp}>
                <button type="button" onClick={() => { setStep(1); setError(""); }} className="flex items-center gap-2 no-select" style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <ArrowLeft size={14} strokeWidth={2.5} />
                  Back to details
                </button>

                <EmberField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={16} color="var(--text-tertiary)" />}
                  rightSlot={
                    <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ color: "var(--text-tertiary)", lineHeight: 0 }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                  required
                />

                {password && <PasswordStrength strength={passwordStrength} colors={strengthColors} labels={strengthLabels} />}

                <div>
                  <EmberField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Check size={16} color="var(--text-tertiary)" />}
                    rightSlot={
                      <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} style={{ color: "var(--text-tertiary)", lineHeight: 0 }}>
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                    hasError={confirmPassword && password !== confirmPassword}
                    required
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="flex items-center gap-1 mt-2" style={{ fontSize: "12px", color: "var(--error)", fontWeight: 600 }}>
                      <AlertTriangle size={12} strokeWidth={2} /> Passwords don't match
                    </p>
                  )}
                </div>

                {/* Terms */}
                <label
                  className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl"
                  style={{ background: "var(--glass-surface)", border: "1px solid var(--glass-border)" }}
                >
                  <div
                    style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      background: acceptTerms ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                      border: acceptTerms ? "none" : "1px solid var(--border-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setAcceptTerms((v) => !v)}
                  >
                    {acceptTerms && <Check size={11} color="#fff" strokeWidth={3} />}
                  </div>
                  <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} style={{ display: "none" }} required />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    I agree to Ember's{" "}
                    <Link to="/terms" style={{ color: "var(--ember-fire)", fontWeight: 700 }}>Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy" style={{ color: "var(--ember-fire)", fontWeight: 700 }}>Privacy Policy</Link>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !acceptTerms}
                  className="btn-ember w-full"
                  style={{ padding: "13px", opacity: isLoading || !acceptTerms ? 0.55 : 1, cursor: isLoading || !acceptTerms ? "not-allowed" : "pointer" }}
                >
                  {isLoading ? (
                    <><Spinner /><span>Creating your account…</span></>
                  ) : (
                    <><span>Create Account</span><CheckCircle size={16} strokeWidth={2.5} /></>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          {!registrationComplete && step === 1 && (
            <div className="px-8 py-5 text-center" style={{ background: "var(--glass-surface)", borderTop: "1px solid var(--border-color)" }}>
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                Already on Ember?{" "}
                <Link to="/login" style={{ color: "var(--ember-fire)", fontWeight: 700 }}>Sign in →</Link>
              </p>
            </div>
          )}
        </div>

        {/* Help section (post-registration) */}
        {registrationComplete && (
          <div className="mt-5 rounded-2xl p-5 animate-fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle size={15} color="var(--text-tertiary)" strokeWidth={2} />
              <span style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>Need help?</span>
            </div>
            <div className="space-y-2">
              {["Check your spam / junk folder", "Make sure you entered the correct email", "Wait a few minutes before requesting a new email"].map((tip) => (
                <p key={tip} className="flex items-start gap-2" style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.6 }}>
                  <CheckCircle size={13} color="var(--success)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                  {tip}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-3 mt-5">
      {[{ n: 1, label: "Details" }, { n: 2, label: "Security" }].map(({ n, label }, i) => (
        <React.Fragment key={n}>
          {i > 0 && (
            <div style={{ flex: 1, height: 1, background: step >= n ? "var(--ember-fire)" : "var(--border-color)", transition: "background 0.3s ease", opacity: 0.5 }} />
          )}
          <div className="flex items-center gap-2">
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: step === n ? "var(--gradient-primary)" : step > n ? "rgba(255,87,34,0.15)" : "var(--bg-tertiary)",
              border: step === n ? "none" : step > n ? "1px solid rgba(255,87,34,0.3)" : "1px solid var(--border-color)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.25s ease",
            }}>
              {step > n
                ? <Check size={12} color="var(--ember-fire)" strokeWidth={2.5} />
                : <span style={{ fontSize: "12px", fontWeight: 800, color: step === n ? "#fff" : "var(--text-muted)" }}>{n}</span>
              }
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: step === n ? "var(--ember-fire)" : "var(--text-tertiary)", transition: "color 0.2s ease" }}>
              {label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function EmberField({ label, icon, rightSlot, hasError, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: hasError ? "var(--error)" : focused ? "var(--ember-fire)" : "var(--text-tertiary)", marginBottom: 8, transition: "color 0.15s ease" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", lineHeight: 0 }}>{icon}</div>}
        <input
          {...inputProps}
          onFocus={(e) => { setFocused(true); e.target.style.borderColor = hasError ? "var(--error)" : "var(--border-fire)"; e.target.style.boxShadow = hasError ? "0 0 0 3px rgba(239,68,68,0.10)" : "0 0 0 3px rgba(255,87,34,0.10)"; }}
          onBlur={(e) => { setFocused(false); e.target.style.borderColor = hasError ? "var(--error)" : "var(--glass-border)"; e.target.style.boxShadow = "none"; }}
          style={{
            width: "100%", paddingLeft: icon ? 44 : 16, paddingRight: rightSlot ? 44 : 16,
            paddingTop: 12, paddingBottom: 12,
            background: "var(--glass-surface)",
            border: `1px solid ${hasError ? "var(--error)" : "var(--glass-border)"}`,
            borderRadius: "var(--radius-lg)",
            fontFamily: "'Urbanist', sans-serif", fontSize: "15px", fontWeight: 500,
            color: "var(--text-primary)", outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}
        />
        {rightSlot && <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", lineHeight: 0 }}>{rightSlot}</div>}
      </div>
    </div>
  );
}

function PasswordStrength({ strength, colors, labels }) {
  return (
    <div className="px-4 py-3 rounded-2xl" style={{ background: "var(--glass-surface)", border: "1px solid var(--glass-border)" }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Strength</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: colors[strength - 1] || colors[0] }}>{labels[strength - 1] || labels[0]}</span>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4,5].map((l) => (
          <div key={l} style={{ flex: 1, height: 3, borderRadius: 99, background: l <= strength ? colors[strength - 1] : "var(--bg-hover)", transition: "background 0.3s ease" }} />
        ))}
      </div>
    </div>
  );
}

function AlertBanner({ type, message, extra }) {
  const cfg = {
    error:   { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.22)",  text: "#FCA5A5", icon: <AlertTriangle size={14} color="var(--error)" strokeWidth={2} /> },
    success: { bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.22)",  text: "#86EFAC", icon: <CheckCircle  size={14} color="var(--success)" strokeWidth={2} /> },
    warning: { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.22)", text: "#FCD34D", icon: <AlertTriangle size={14} color="var(--warning)" strokeWidth={2} /> },
  }[type];
  return (
    <div className="animate-fade-in flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{cfg.icon}</div>
      <div>
        <p style={{ fontSize: "13px", color: cfg.text, fontWeight: 500, lineHeight: 1.5 }}>{message}</p>
        {extra && <p style={{ fontSize: "11px", color: cfg.text, opacity: 0.7, marginTop: 4 }}>{extra}</p>}
      </div>
    </div>
  );
}

function VerificationScreen({ email, handleResend, isResending, resendCooldown, resendLabel }) {
  const disabled = resendCooldown > 0 || isResending;
  return (
    <div className="space-y-5">
      <div className="px-5 py-6 rounded-2xl text-center space-y-3" style={{ background: "var(--glass-surface)", border: "1px solid var(--glass-border)" }}>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Verification link sent to:</p>
        <div className="inline-flex items-center px-4 py-2 rounded-xl" style={{ background: "rgba(255,87,34,0.08)", border: "1px solid var(--border-fire)" }}>
          <span style={{ fontFamily: "monospace", fontSize: "14px", color: "var(--ember-fire)", fontWeight: 700 }}>{email}</span>
        </div>
        <div className="pt-3 space-y-2" style={{ borderTop: "1px solid var(--border-color)" }}>
          {["Click the link in your email to verify", "Then sign in to enter Ember"].map((t) => (
            <p key={t} className="flex items-center justify-center gap-2" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              <CheckCircle size={13} color="var(--success)" strokeWidth={2} /> {t}
            </p>
          ))}
        </div>
      </div>

      <button
        onClick={handleResend}
        disabled={disabled}
        className="btn-ghost w-full"
        style={{ padding: "12px", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer", justifyContent: "center", gap: 8 }}
      >
        {isResending ? <><Spinner /><span>Sending…</span></> : <><Mail size={15} /><span>{resendLabel}</span></>}
      </button>

      <Link to="/login" className="flex items-center justify-center gap-2" style={{ fontSize: "13px", color: "var(--ember-fire)", fontWeight: 700 }}>
        <ArrowLeft size={14} strokeWidth={2.5} />
        Back to sign in
      </Link>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
  );
}