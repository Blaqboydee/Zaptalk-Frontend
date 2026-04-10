import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const TITLE   = "ember";
const TAGLINE = "talk to those who matter";

export default function SplashScreen({ onComplete }) {
  // phase: "in" → "typing" → "tagline" → "out"
  const [phase,    setPhase]    = useState("in");
  const [titleLen, setTitleLen] = useState(0);
  const [tagLen,   setTagLen]   = useState(0);
  const [showDot,  setShowDot]  = useState(false);

  // 1 — wait for logo entrance, then start typing title
  useEffect(() => {
    const t = setTimeout(() => setPhase("typing"), 760);
    return () => clearTimeout(t);
  }, []);

  // 2 — type title characters
  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTitleLen(i);
      if (i >= TITLE.length) {
        clearInterval(iv);
        setTimeout(() => {
          setShowDot(true);
          setPhase("tagline");
        }, 200);
      }
    }, 75);
    return () => clearInterval(iv);
  }, [phase]);

  // 3 — type tagline characters
  useEffect(() => {
    if (phase !== "tagline") return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTagLen(i);
      if (i >= TAGLINE.length) {
        clearInterval(iv);
        setTimeout(() => setPhase("out"), 1000);
      }
    }, 32);
    return () => clearInterval(iv);
  }, [phase]);

  // 4 — after exit transition, notify parent
  useEffect(() => {
    if (phase !== "out") return;
    const t = setTimeout(onComplete, 700);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  const isOut = phase === "out";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#06040C",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        opacity:       isOut ? 0 : 1,
        transform:     isOut ? "scale(1.06)" : "scale(1)",
        pointerEvents: isOut ? "none" : "auto",
      }}
    >
      {/* ── Flame icon ── */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: "linear-gradient(135deg, #FF5722, #E91E63)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation:
            "splash-logo-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both, splash-glow 2.5s ease-in-out 0.6s infinite",
        }}
      >
        <Flame size={40} color="#fff" strokeWidth={1.8} />
      </div>

      {/* ── "ember." title ── */}
      <div style={{ height: 64, display: "flex", alignItems: "center" }}>
        {phase !== "in" && (
          <h1
            style={{
              margin: 0,
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: "#fff",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            {TITLE.slice(0, titleLen)}

            {/* gradient dot — snaps in after last letter */}
            {showDot && (
              <span
                style={{
                  background: "linear-gradient(90deg, #FF5722, #E91E63)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                .
              </span>
            )}

            {/* blinking cursor while typing title */}
            {phase === "typing" && (
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: "0.8em",
                  background: "#FF5722",
                  marginLeft: 3,
                  verticalAlign: "text-bottom",
                  borderRadius: 2,
                  animation: "cursor-blink 0.75s steps(1) infinite",
                }}
              />
            )}
          </h1>
        )}
      </div>

      {/* ── tagline ── */}
      <div style={{ height: 22 }}>
        {(phase === "tagline" || phase === "out") && tagLen > 0 && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6B6680",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            {TAGLINE.slice(0, tagLen)}
            {tagLen < TAGLINE.length && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "0.7em",
                  background: "#6B6680",
                  marginLeft: 1,
                  verticalAlign: "text-bottom",
                  animation: "cursor-blink 0.5s steps(1) infinite",
                }}
              />
            )}
          </p>
        )}
      </div>
    </div>
  );
}
