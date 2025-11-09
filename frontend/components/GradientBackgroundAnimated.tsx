/**
 * Animated version of the gradient background with subtle floating motion.
 * Use this instead of GradientBackground for a more dynamic experience.
 */
export default function GradientBackgroundAnimated() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      {/* Teal/Cyan blob - top left */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[60%] h-[50%] rounded-full opacity-40 blur-[120px] animate-blob"
        style={{
          background: "radial-gradient(circle, #4FD1C5 0%, #38B2AC 40%, transparent 70%)",
        }}
      />

      {/* Lime/Yellow-green blob - bottom right */}
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[65%] h-[55%] rounded-full opacity-40 blur-[120px] animate-blob animation-delay-2000"
        style={{
          background: "radial-gradient(circle, #D4FC79 0%, #C6E563 40%, transparent 70%)",
        }}
      />

      {/* Optional: Additional subtle blob for more depth */}
      <div
        className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px] animate-blob animation-delay-4000"
        style={{
          background: "radial-gradient(circle, #81E6D9 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
