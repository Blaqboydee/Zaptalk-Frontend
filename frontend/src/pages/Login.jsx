import { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import GoogleSignIn from "../components/GoogleAuth";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  LogIn, ArrowLeft, AlertTriangle, Flame, CheckCircle,
} from "lucide-react";

export default function Login() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");
  const [notice, setNotice]           = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [step, setStep]               = useState(1);
  const [isMobile, setIsMobile]       = useState(false);

  const { login }        = useContext(AuthContext);
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const token      = searchParams.get("token");
    const verified   = searchParams.get("verified");
    const registered = searchParams.get("registered");
    if (token)      { login(token); navigate("/allchats"); }
    if (verified)   setNotice("Email verified — you're good to sign in.");
    if (registered) setNotice("Account created! Sign in to get started.");
  }, [searchParams]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) { setError(""); setStep(2); }
  };

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

  const showEmailStep    = !isMobile || step === 1;
  const showPasswordStep = !isMobile || step === 2;

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute animate-orb"
          style={{
            width: 420, height: 420, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,87,34,0.1) 0%, transparent 65%)",
            top: "-120px", right: "-80px",
          }}
        />
        <div
          className="absolute animate-orb"
          style={{
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)",
            bottom: "40px", left: "-60px",
            animationDelay: "3s",
          }}
        />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">

        {/* ── Brand mark ── */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-fire)" }}
          >
            <Flame size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontWeight: 900,
              fontSize: "24px",
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
            }}
          >
            ember<span style={{ color: "var(--ember-fire)" }}>.</span>
          </span>
        </div>

        {/* ── Card ── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border-color)" }}>
            <h1
              style={{
                fontFamily: "'Urbanist', sans-serif",
                fontWeight: 800,
                fontSize: "28px",
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                marginBottom: 6,
              }}
            >
              {isMobile && step === 2 ? "Enter password" : (
                <>Welcome<br />
                  <span style={{ background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    back.
                  </span>
                </>
              )}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-tertiary)", fontWeight: 500 }}>
              {isMobile && step === 2
                ? `Signing in as ${email}`
                : "Sign in to continue your conversations"}
            </p>
          </div>

          {/* Card body */}
          <div className="px-8 py-7 space-y-5">

            {/* Notice banner */}
            {notice && !error && (
              <AlertBanner type="success" message={notice} />
            )}

            {/* Error banner */}
            {error && <AlertBanner type="error" message={error} />}

            {/* Step 1 — email + google */}
            {showEmailStep && (
              <>
                <GoogleSignIn />

                <div className="divider-or">or continue with email</div>

                {isMobile ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-5">
                    <EmberField
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<Mail size={16} color="var(--text-tertiary)" />}
                      required
                    />
                    <button type="submit" className="btn-ember w-full" style={{ padding: "13px" }}>
                      <span>Continue</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </form>
                ) : null}
              </>
            )}

            {/* Step 2 / desktop full form */}
            {(showPasswordStep || !isMobile) && (
              <form onSubmit={handleLogin} className="space-y-5">

                {/* Email (desktop only) */}
                {!isMobile && (
                  <EmberField
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail size={16} color="var(--text-tertiary)" />}
                    required
                  />
                )}

                {/* Password */}
                {(!isMobile || step === 2) && (
                  <EmberField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock size={16} color="var(--text-tertiary)" />}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        style={{ color: "var(--text-tertiary)", lineHeight: 0 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                    required
                  />
                )}

                {/* Remember / forgot */}
                {(!isMobile || step === 2) && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer no-select">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ accentColor: "var(--ember-fire)", width: 14, height: 14 }}
                      />
                      <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                        Remember me
                      </span>
                    </label>
                    <Link
                      to="/forgot-password"
                      style={{ fontSize: "13px", color: "var(--ember-fire)", fontWeight: 600 }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Submit */}
                {(!isMobile || step === 2) && (
                  <div className="space-y-3 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-ember w-full"
                      style={{
                        padding: "13px",
                        opacity: isLoading ? 0.65 : 1,
                        cursor: isLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Spinner />
                          <span>Signing in…</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <LogIn size={16} strokeWidth={2.5} />
                        </>
                      )}
                    </button>

                    {/* Mobile back */}
                    {isMobile && step === 2 && (
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(""); }}
                        className="btn-ghost w-full"
                        style={{ padding: "12px" }}
                      >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                        <span>Back to email</span>
                      </button>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Card footer */}
          <div
            className="px-8 py-5 text-center"
            style={{
              background: "var(--glass-surface)",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              New to Ember?{" "}
              <Link
                to="/signup"
                style={{ color: "var(--ember-fire)", fontWeight: 700 }}
              >
                Light a spark →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

function EmberField({ label, icon, rightSlot, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "'Urbanist', sans-serif",
          fontWeight: 700,
          fontSize: "12px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: focused ? "var(--ember-fire)" : "var(--text-tertiary)",
          marginBottom: 8,
          transition: "color 0.15s ease",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div
            style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", lineHeight: 0,
            }}
          >
            {icon}
          </div>
        )}
        <input
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            e.target.style.borderColor = "var(--border-fire)";
            e.target.style.boxShadow = "0 0 0 3px rgba(255,87,34,0.10)";
          }}
          onBlur={(e) => {
            setFocused(false);
            e.target.style.borderColor = "var(--glass-border)";
            e.target.style.boxShadow = "none";
          }}
          style={{
            width: "100%",
            background: "var(--glass-surface)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-lg)",
            padding: icon && rightSlot ? "12px 44px" : icon ? "12px 16px 12px 44px" : "12px 44px 12px 16px",
            paddingLeft: icon ? 44 : 16,
            paddingRight: rightSlot ? 44 : 16,
            fontFamily: "'Urbanist', sans-serif",
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--text-primary)",
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}
        />
        {rightSlot && (
          <div
            style={{
              position: "absolute", right: 14, top: "50%",
              transform: "translateY(-50%)", lineHeight: 0,
            }}
          >
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertBanner({ type, message }) {
  const isError = type === "error";
  return (
    <div
      className="animate-fade-in flex items-start gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: isError ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
        border: `1px solid ${isError ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
      }}
    >
      <div
        style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: isError ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {isError
          ? <AlertTriangle size={14} color="var(--error)" strokeWidth={2} />
          : <CheckCircle size={14} color="var(--success)" strokeWidth={2} />
        }
      </div>
      <p style={{ fontSize: "13px", color: isError ? "#FCA5A5" : "#86EFAC", fontWeight: 500, lineHeight: 1.5 }}>
        {message}
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 16, height: 16, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}