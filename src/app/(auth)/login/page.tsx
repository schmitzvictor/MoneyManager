export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Money Manager</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your finances
        </p>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Auth will be implemented in Phase 2.
      </p>
    </div>
  );
}
