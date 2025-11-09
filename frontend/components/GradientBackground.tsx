export default function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-neutral-200">
      {/* Teal/Cyan blob - top left */}
      <div
        className="absolute bottom-[10%] left-[-20%] w-[100%] h-[100%] rounded-full opacity-70 blur-[60px]"
        style={{
          background:
            "radial-gradient(ellipse, #4FD1C5 30%, #38B2AC 80%, transparent 80%)",
        }}
      />

      {/* Lime/Yellow-green blob - bottom right */}
      <div
        className="absolute bottom-[-40%] right-[20%] w-[100%] h-[100%] rounded-full opacity-40 blur-[70px]"
        style={{
          background:
            "radial-gradient(ellipse, #D4FC79 0%, #C6E563 40%, transparent 70%)",
        }}
      />

      {/* Optional: Additional subtle blob for more depth */}
      <div
        className="absolute top-[-20%] right-[-20%] w-[100%] h-[100%] rounded-full opacity-40 blur-[70px]"
        style={{
          background:
            "radial-gradient(ellipse, #81E6D9 30%, #2AC3AF 60%, transparent 100%)",
        }}
      />

      {/* Diagonal line texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] blur-[1px]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.4) 2px,
            rgba(0, 0, 0, 0.4) 4px
          )`,
        }}
      />
    </div>
  );
}
