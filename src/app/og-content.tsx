/**
 * Shared OG image JSX content used by both opengraph-image and twitter-image.
 * Extracted to eliminate duplication (Next.js requires separate route files
 * with their own exports, but the rendering can be shared).
 */
export function OgImageContent() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0e 50%, #0a0a0a 100%)",
        position: "relative",
      }}
    >
      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          opacity: 0.08,
          backgroundImage:
            "linear-gradient(rgba(255,51,68,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,51,68,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow circle behind logo */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,51,68,0.15) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff3344, #ff6677)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          🌍
        </div>
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -2,
          }}
        >
          Fate
          <span style={{ color: "#ff3344" }}>Map</span>
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          color: "#a0a0a0",
          display: "flex",
          letterSpacing: 0.5,
        }}
      >
        Input any event. Watch the world react.
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 16,
            color: "#666",
            display: "flex",
            gap: 24,
          }}
        >
          <span>AI Geopolitical Sandbox</span>
          <span>·</span>
          <span>48 Countries</span>
          <span>·</span>
          <span>28 Scenarios</span>
          <span>·</span>
          <span>Open Source</span>
        </div>
      </div>
    </div>
  );
}
