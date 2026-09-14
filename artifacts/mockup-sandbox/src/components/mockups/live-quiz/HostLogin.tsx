import "./_group.css";
import { useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Eye, EyeOff, LoaderCircle, LockKeyhole, Radio, WifiOff } from "lucide-react";
import { BrandMark, cn, StatusBadge, usePreviewRoute } from "./_shared/Primitives";

type PreviewState = "default" | "loading" | "invalid" | "validation" | "connection" | "expired";

const previewStates: Array<{ value: PreviewState; label: string }> = [
  { value: "default", label: "Default" },
  { value: "loading", label: "Loading" },
  { value: "invalid", label: "Invalid credentials" },
  { value: "validation", label: "Validation error" },
  { value: "connection", label: "Connection error" },
  { value: "expired", label: "Authentication expired" },
];

export function HostLogin({
  onLogin,
}: {
  onLogin?: (username: string, password: string) => void;
} = {}) {
  const [, navigate] = usePreviewRoute("/host/login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [previewState, setPreviewState] = useState<PreviewState>("default");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localNotice, setLocalNotice] = useState("");

  const activeState = isSubmitting ? "loading" : previewState;
  const hasValidation = activeState === "validation";
  const hasInvalidCredentials = activeState === "invalid";
  const hasConnectionError = activeState === "connection";
  const hasExpiredAuth = activeState === "expired";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalNotice("");

    if (!username.trim() || !password) {
      setPreviewState("validation");
      return;
    }

    if (previewState === "loading") {
      setIsSubmitting(true);
      window.setTimeout(() => {
        setIsSubmitting(false);
        setLocalNotice("Loading preview complete. No authentication request was made.");
      }, 850);
      return;
    }

    onLogin?.(username, password);
    if (previewState === "default") {
      setLocalNotice("Preview sign-in submitted locally.");
    }
  };

  return (
    <div className="live-quiz min-h-[100dvh] bg-[var(--lq-paper)]">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <button type="button" onClick={() => navigate("/")} className="lq-focus rounded-xl">
          <BrandMark />
        </button>
        <StatusBadge tone="neutral">Host access</StatusBadge>
      </header>

      <main className="mx-auto grid min-h-[calc(100dvh-88px)] max-w-[1180px] items-center gap-10 px-5 pb-12 pt-4 sm:px-8 sm:pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10">
        <section className="relative hidden lg:block">
          <div className="lq-dot-grid absolute -left-12 -top-12 h-48 w-48 rounded-[32px] opacity-50" />
          <div className="relative max-w-[420px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lq-signal)] text-white shadow-[4px_4px_0_var(--lq-ink)]">
              <Radio className="h-6 w-6" />
            </div>
            <div className="lq-mono mt-9 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">Host console</div>
            <h1 className="lq-display mt-4 text-5xl font-extrabold leading-[0.96] text-[var(--lq-ink)]">
              Set the room
              <span className="block text-[var(--lq-signal)]">in motion.</span>
            </h1>
            <p className="mt-6 max-w-[350px] text-base leading-7 text-[var(--lq-ink-soft)]">
              Sign in to the quiet side of the room. Your questions, pacing, and live controls are waiting.
            </p>
            <div className="mt-9 flex items-center gap-2 text-xs font-bold text-[var(--lq-ink-soft)]">
              <span className="h-2 w-2 rounded-full bg-[var(--lq-mint-deep)]" />
              Local preview · no live credentials
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[500px]">
          <div className="mb-7 lg:hidden">
            <div className="lq-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">Host console</div>
            <h1 className="lq-display mt-3 text-4xl font-extrabold leading-none text-[var(--lq-ink)]">Set the room in motion.</h1>
          </div>

          <div className="lq-card rounded-[30px] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Welcome back</p>
                <h2 className="lq-display mt-1 text-3xl font-extrabold text-[var(--lq-ink)]">Host sign in</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff8df] text-[#8d701e]">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="signalhouse-username" className="mb-2 block text-xs font-bold text-[var(--lq-ink)]">Username</label>
                <input
                  id="signalhouse-username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your host username"
                  className={cn("lq-focus w-full rounded-xl border bg-[#fbfaf7] px-3.5 py-3 text-sm text-[var(--lq-ink)] placeholder:text-[#a4a8ae]", hasValidation && !username.trim() ? "border-[#d9867e]" : "border-[var(--lq-line)]")}
                  aria-invalid={hasValidation && !username.trim()}
                />
                {hasValidation && !username.trim() && <p className="mt-1.5 text-xs font-semibold text-[#ad4447]">Enter your username to continue.</p>}
              </div>

              <div>
                <label htmlFor="signalhouse-password" className="mb-2 block text-xs font-bold text-[var(--lq-ink)]">Password</label>
                <div className="relative">
                  <input
                    id="signalhouse-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className={cn("lq-focus w-full rounded-xl border bg-[#fbfaf7] px-3.5 py-3 pr-12 text-sm text-[var(--lq-ink)] placeholder:text-[#a4a8ae]", hasValidation && !password ? "border-[#d9867e]" : "border-[var(--lq-line)]")}
                    aria-invalid={hasValidation && !password}
                  />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="lq-focus absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {hasValidation && !password && <p className="mt-1.5 text-xs font-semibold text-[#ad4447]">Enter your password to continue.</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="lq-focus flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--lq-signal)] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--lq-signal-deep)] disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {hasInvalidCredentials && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#ebbbb9] bg-[#fff0f0] p-3.5 text-[#873d40]" role="alert">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div><p className="text-xs font-bold">Those details did not match.</p><p className="mt-1 text-[11px] leading-5 text-[#9f5c5d]">Check the username and password, then try again.</p></div>
              </div>
            )}
            {hasConnectionError && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#ead28d] bg-[#fff8df] p-3.5 text-[#896b18]" role="alert">
                <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
                <div><p className="text-xs font-bold">The room signal is unavailable.</p><p className="mt-1 text-[11px] leading-5 text-[#806e35]">This preview is showing a connection error. Nothing was sent.</p></div>
              </div>
            )}
            {hasExpiredAuth && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#d8d0ea] bg-[#f3f0fa] p-3.5 text-[#625783]" role="alert">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                <div><p className="text-xs font-bold">Your host session has expired.</p><p className="mt-1 text-[11px] leading-5 text-[#756b91]">Sign in again to return to the room controls.</p></div>
              </div>
            )}
            {localNotice && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#a8d7ca] bg-[#edf9f4] p-3.5 text-[#2e7168]" role="status">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-xs font-semibold leading-5">{localNotice}</p>
              </div>
            )}

            <div className="mt-7 border-t border-[var(--lq-line)] pt-5">
              <label htmlFor="signalhouse-state" className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9399a3]">
                <span>Preview state</span>
                <select
                  id="signalhouse-state"
                  value={previewState}
                  onChange={(event) => { setPreviewState(event.target.value as PreviewState); setLocalNotice(""); }}
                  className="lq-focus rounded-lg border border-[var(--lq-line)] bg-[var(--lq-card)] px-2 py-1.5 text-[10px] font-bold normal-case tracking-normal text-[var(--lq-ink-soft)]"
                >
                  {previewStates.map((state) => <option key={state.value} value={state.value}>{state.label}</option>)}
                </select>
              </label>
              <p className="mt-2 text-[11px] leading-5 text-[var(--lq-ink-soft)]">Local state gallery for review. Sign in does not call a service or persist credentials.</p>
            </div>
          </div>

          <button type="button" onClick={() => navigate("/")} className="lq-focus mx-auto mt-5 flex items-center gap-1.5 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Signalhouse
          </button>
        </section>
      </main>
    </div>
  );
}