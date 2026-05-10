'use client';

import { useState } from 'react';
import { login, signup } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  PieChart,
  Shield,
  Check,
  ArrowRight,
} from 'lucide-react';

// ─── Small stat pill for the hero panel ───────────────────────────────────────
function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}
      >
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Input field with icon ────────────────────────────────────────────────────
function Field({
  icon: Icon,
  type = 'text',
  placeholder,
  name,
  autoFocus,
  suffix,
}: {
  icon: React.ElementType;
  type?: string;
  placeholder: string;
  name: string;
  autoFocus?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
        <Icon className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.3)' }} strokeWidth={1.75} />
      </span>
      <Input
        name={name}
        type={type}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        className="h-12 rounded-xl pl-10 pr-10 text-sm"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.95)',
        }}
      />
      {suffix && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const action = mode === 'login' ? login : signup;
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between px-14 py-10 relative z-10"
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, oklch(0.75 0.18 140), oklch(0.65 0.18 200))',
              boxShadow: '0 4px 20px oklch(0.75 0.18 140 / 0.25)',
            }}
          >
            <Wallet className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.5 }}>
            Money Manager
          </span>
        </div>

        {/* Hero content */}
        <div className="flex flex-col gap-5 max-w-md">
          {/* Badge */}
          <div
            className="inline-flex self-start items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: 'oklch(0.75 0.18 140 / 0.15)',
              border: '1px solid oklch(0.75 0.18 140 / 0.35)',
              color: 'oklch(0.75 0.18 140)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'oklch(0.75 0.18 140)', boxShadow: '0 0 8px oklch(0.75 0.18 140)' }}
            />
            Beta · v0.1
          </div>

          <h1
            style={{
              fontSize: 42, fontWeight: 900,
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: -1.5, lineHeight: 1.05,
            }}
          >
            Suas finanças,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, oklch(0.75 0.18 140), oklch(0.65 0.18 200))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              em ordem.
            </span>
          </h1>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 420 }}>
            Acompanhe gastos, defina metas e entenda para onde seu dinheiro vai — tudo em um painel claro e privado.
          </p>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <StatPill icon={TrendingUp} label="Economia média"   value="+24% / mês"     color="#34d399" />
            <StatPill icon={PieChart}   label="Orçamento ativo"  value="6 categorias"   color="oklch(0.75 0.18 140)" />
            <StatPill icon={Shield}     label="Criptografia"     value="AES-256"        color="#a855f7" />
            <StatPill icon={Check}      label="Sincronização"    value="Tempo real"     color="#fbbf24" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span>© 2026 Money Manager</span>
          <div className="flex gap-5">
            <span className="cursor-pointer hover:text-white/50 transition-colors">Privacidade</span>
            <span className="cursor-pointer hover:text-white/50 transition-colors">Termos</span>
            <span className="cursor-pointer hover:text-white/50 transition-colors">Suporte</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full items-center justify-center px-6 py-10 lg:w-[520px] lg:shrink-0">
        <div className="w-full max-w-sm flex flex-col gap-6">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, oklch(0.75 0.18 140), oklch(0.65 0.18 200))' }}
            >
              <Wallet className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'rgba(255,255,255,0.95)' }}>Money Manager</span>
          </div>

          {/* Header */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.8 }}>
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              {mode === 'login'
                ? 'Entre para continuar gerenciando suas finanças.'
                : 'Comece grátis em menos de 30 segundos.'}
            </p>
          </div>

          {/* Mode tabs */}
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {(['login', 'signup'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => { setMode(v); setError(null); }}
                className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
                style={
                  mode === v
                    ? { background: 'oklch(0.75 0.18 140 / 0.15)', color: 'oklch(0.75 0.18 140)' }
                    : { color: 'rgba(255,255,255,0.45)' }
                }
              >
                {v === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form action={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <Field icon={Check} name="name" placeholder="Seu nome" />
            )}
            <Field icon={Mail} name="email" type="email" placeholder="email@exemplo.com" autoFocus={mode === 'login'} />
            <Field
              icon={Lock}
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder={mode === 'login' ? 'Sua senha' : 'Crie uma senha forte'}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                >
                  {showPw
                    ? <EyeOff className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    : <Eye    className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.35)' }} />}
                </button>
              }
            />

            {/* Remember / forgot */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer select-none items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRemember((r) => !r)}
                    className="flex h-4 w-4 items-center justify-center rounded transition-all"
                    style={{
                      background: remember ? 'oklch(0.75 0.18 140)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${remember ? 'oklch(0.75 0.18 140 / 0.5)' : 'rgba(255,255,255,0.15)'}`,
                    }}
                  >
                    {remember && <Check className="h-3 w-3 text-[#07070f]" strokeWidth={3} />}
                  </button>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Lembrar de mim</span>
                </label>
                <span
                  className="cursor-pointer text-xs font-semibold"
                  style={{ color: 'oklch(0.75 0.18 140)' }}
                >
                  Esqueceu a senha?
                </span>
              </div>
            )}

            {mode === 'signup' && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                Ao criar uma conta, você concorda com nossos{' '}
                <span className="cursor-pointer underline" style={{ color: 'rgba(255,255,255,0.5)' }}>Termos</span>
                {' '}e{' '}
                <span className="cursor-pointer underline" style={{ color: 'rgba(255,255,255,0.5)' }}>Política de Privacidade</span>.
              </p>
            )}

            {error && (
              <div
                className="rounded-xl px-4 py-2.5 text-sm"
                style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-opacity disabled:opacity-80"
              style={{
                background: 'linear-gradient(135deg, oklch(0.75 0.18 140), oklch(0.65 0.18 200))',
                color: '#07070f',
                boxShadow: '0 6px 24px oklch(0.75 0.18 140 / 0.3)',
              }}
            >
              {isLoading ? (
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {mode === 'login' ? (
              <>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-semibold"
                  style={{ color: 'oklch(0.75 0.18 140)' }}
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-semibold"
                  style={{ color: 'oklch(0.75 0.18 140)' }}
                >
                  Entrar
                </button>
              </>
            )}
          </p>

          {/* Security pill */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"
            style={{
              background: 'rgba(52,211,153,0.06)',
              border: '1px solid rgba(52,211,153,0.18)',
              color: '#34d399',
            }}
          >
            <Shield className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            Conexão criptografada de ponta a ponta
          </div>
        </div>
      </div>
    </div>
  );
}
