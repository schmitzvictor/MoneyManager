export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          top: '-10%', left: '-5%', width: 520, height: 520,
          background: 'radial-gradient(circle, oklch(0.75 0.18 140 / 0.12), transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          bottom: '-15%', right: '-10%', width: 600, height: 600,
          background: 'radial-gradient(circle, oklch(0.65 0.18 200 / 0.10), transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          top: '40%', left: '40%', width: 300, height: 300,
          background: 'radial-gradient(circle, oklch(0.65 0.18 300 / 0.08), transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      {children}
    </div>
  );
}
