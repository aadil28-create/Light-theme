import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Clock3,
  Info,
  LoaderCircle,
  Radio,
  RotateCcw,
  Wifi,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";

export type ConnectionState = "connected" | "reconnecting" | "offline";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function usePreviewRoute(defaultRoute: string) {
  const readRoute = () => {
    const value = new URLSearchParams(window.location.search).get("route");
    return value?.startsWith("/") ? value : defaultRoute;
  };
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextRoute: string) => {
    const nextUrl = `${window.location.pathname}?route=${encodeURIComponent(nextRoute)}`;
    window.history.pushState({ route: nextRoute }, "", nextUrl);
    setRoute(nextRoute);
  };

  return [route, navigate] as const;
}

export function RoleSwitcher({ active }: { active: "host" | "participant" }) {
  const goToRole = (role: "host" | "participant") => {
    if (role === active) return;
    const target = role === "host" ? "HostShell" : "ParticipantShell";
    window.location.assign(window.location.pathname.replace(/(HostShell|ParticipantShell)$/, target));
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--lq-line)] bg-[var(--lq-card)] p-1 shadow-sm" aria-label="Preview role">
      <button
        type="button"
        onClick={() => goToRole("host")}
        className={cn("lq-focus rounded-full px-3 py-1.5 text-xs font-bold transition-colors", active === "host" ? "bg-[var(--lq-ink)] text-[var(--lq-paper)]" : "text-[var(--lq-ink-soft)] hover:bg-[#f1eee8]")}
        aria-pressed={active === "host"}
      >
        Host
      </button>
      <button
        type="button"
        onClick={() => goToRole("participant")}
        className={cn("lq-focus rounded-full px-3 py-1.5 text-xs font-bold transition-colors", active === "participant" ? "bg-[var(--lq-signal)] text-white" : "text-[var(--lq-ink-soft)] hover:bg-[#f1eee8]")}
        aria-pressed={active === "participant"}
      >
        Participant
      </button>
    </div>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-[13px] bg-[var(--lq-signal)] text-white shadow-[3px_3px_0_var(--lq-ink)]">
        <Radio className="h-4 w-4" strokeWidth={2.4} />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--lq-sun)]" />
      </div>
      {!compact && (
        <div>
          <div className="lq-display text-[15px] font-extrabold leading-none">Signalhouse</div>
          <div className="lq-mono mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--lq-ink-soft)]">live rooms</div>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({
  tone,
  children,
  icon: Icon,
}: {
  tone: "live" | "ready" | "warning" | "neutral" | "danger";
  children: ReactNode;
  icon?: LucideIcon;
}) {
  const tones = {
    live: "border-[#f3b2a5] bg-[#fff0eb] text-[#b4452e]",
    ready: "border-[#a8d7ca] bg-[#edf9f4] text-[#2e7168]",
    warning: "border-[#ead28d] bg-[#fff8df] text-[#896b18]",
    neutral: "border-[#dedbd4] bg-[#f5f3ee] text-[#657087]",
    danger: "border-[#ebbbb9] bg-[#fff0f0] text-[#ad4447]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold", tones[tone])}>
      {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className={cn("h-1.5 w-1.5 rounded-full", tone === "live" ? "lq-pulse bg-[var(--lq-signal)]" : tone === "ready" ? "bg-[var(--lq-mint-deep)]" : "bg-current")} />}
      {children}
    </span>
  );
}

export function ConnectionStatus({ state = "connected", label }: { state?: ConnectionState; label?: string }) {
  const config = {
    connected: { tone: "ready" as const, icon: Wifi, text: label ?? "Connected" },
    reconnecting: { tone: "warning" as const, icon: LoaderCircle, text: label ?? "Reconnecting" },
    offline: { tone: "danger" as const, icon: WifiOff, text: label ?? "Offline" },
  }[state];
  return <StatusBadge tone={config.tone} icon={config.icon}>{config.text}</StatusBadge>;
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; onClick?: () => void }> }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--lq-ink-soft)]">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#adb2b7]" />}
          {item.onClick ? (
            <button type="button" onClick={item.onClick} className="lq-focus font-semibold hover:text-[var(--lq-signal)]">{item.label}</button>
          ) : (
            <span className={cn(index === items.length - 1 && "font-semibold text-[var(--lq-ink)]")}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-[var(--lq-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="lq-mono mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">{eyebrow}</div>}
        <h1 className="lq-display text-3xl font-extrabold tracking-tight text-[var(--lq-ink)]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--lq-ink-soft)]">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

export function LoadingState({ label = "Preparing the room" }: { label?: string }) {
  return (
    <div className="lq-card rounded-2xl p-5" aria-label="Loading state">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-xl bg-[#e9e4da]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-[#e9e4da]" />
          <div className="h-2.5 w-2/3 animate-pulse rounded bg-[#f0ede6]" />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-[var(--lq-ink-soft)]">{label}...</p>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", description = "Your next live moment will show up here.", action }: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#cfcac0] bg-[#fbfaf7] p-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--lq-lilac)] text-[var(--lq-ink)]"><CircleHelp className="h-5 w-5" /></div>
      <h3 className="mt-4 text-sm font-bold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-[var(--lq-ink-soft)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-[#ebbbb9] bg-[#fff5f3] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8d6d0] text-[#ad4447]"><AlertCircle className="h-5 w-5" /></div>
        <div>
          <h3 className="text-sm font-bold text-[#873d40]">Room data paused</h3>
          <p className="mt-1 text-xs leading-5 text-[#9f5c5d]">We could not refresh this view. The last known state is still safe to use.</p>
          {onRetry && <button type="button" onClick={onRetry} className="lq-focus mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#a9483b] hover:underline"><RotateCcw className="h-3.5 w-3.5" /> Try again</button>}
        </div>
      </div>
    </div>
  );
}

export function ConfirmationDialog({ open, title, description, confirmLabel = "Confirm", onConfirm, onClose }: { open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(21,36,61,0.36)] p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="lq-dialog-title" className="lq-card w-full max-w-md rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0eb] text-[var(--lq-signal-deep)]"><Info className="h-5 w-5" /></div>
            <h2 id="lq-dialog-title" className="lq-display text-xl font-extrabold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--lq-ink-soft)]">{description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="lq-focus rounded-full p-2 text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="lq-focus rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]">Keep room open</button>
          <button type="button" onClick={onConfirm} className="lq-focus rounded-xl bg-[var(--lq-signal)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--lq-signal-deep)]">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function MiniMetric({ label, value, note, accent = "mint" }: { label: string; value: string; note: string; accent?: "mint" | "sun" | "lilac" | "signal" }) {
  const backgrounds = { mint: "bg-[#edf8f4]", sun: "bg-[#fff8df]", lilac: "bg-[#f1eef9]", signal: "bg-[#fff0eb]" };
  return <div className={cn("rounded-2xl p-4", backgrounds[accent])}><div className="text-xs font-semibold text-[var(--lq-ink-soft)]">{label}</div><div className="lq-display mt-2 text-2xl font-extrabold">{value}</div><div className="mt-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]">{note}</div></div>;
}

export function RouteHint({ route }: { route: string }) {
  const pretty = useMemo(() => route.split("/").filter(Boolean).join("  /  "), [route]);
  return <span className="lq-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--lq-ink-soft)]">{pretty}</span>;
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="lq-focus inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>;
}

export function ClockLabel({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lq-ink-soft)]"><Clock3 className="h-3.5 w-3.5" />{children}</span>;
}

export function CheckLabel({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lq-mint-deep)]"><CircleCheck className="h-3.5 w-3.5" />{children}</span>;
}