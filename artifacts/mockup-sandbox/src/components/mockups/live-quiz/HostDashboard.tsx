import "./_group.css";
import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CirclePlus,
  Clock3,
  LayoutDashboard,
  LogOut,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "./_shared/AppShell";
import {
  BackButton,
  Breadcrumbs,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  RouteHint,
  StatusBadge,
  usePreviewRoute,
} from "./_shared/Primitives";

type TemplateMode = "available" | "empty";
type SessionState = "none" | "waiting" | "running" | "paused" | "finished";
type SurfaceState = "ready" | "loading" | "error";

const navigation = [
  { label: "Dashboard", route: "/host/dashboard", meta: "today", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Quiz templates", route: "/host/templates", meta: "12", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Current session", route: "/host/session/harbor-47", meta: "live", icon: <Radio className="h-4 w-4" /> },
  { label: "Results", route: "/host/results/harbor-47", meta: "last", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Sign out", route: "/signed-out", icon: <LogOut className="h-4 w-4" /> },
];

const templates = [
  { name: "Harbor House Quiz", detail: "32 questions · 4 rounds", edited: "Edited yesterday", tone: "signal" },
  { name: "The Long Weekend", detail: "24 questions · 3 rounds", edited: "Edited 12 Jun", tone: "lilac" },
  { name: "Summer Signals", detail: "40 questions · 5 rounds", edited: "Edited 10 Jun", tone: "mint" },
];

const sessionCopy: Record<SessionState, {
  label: string;
  tone: "live" | "ready" | "warning" | "neutral" | "danger";
  description: string;
  action: string;
  icon: LucideIcon;
}> = {
  none: {
    label: "No active session",
    tone: "neutral",
    description: "Start from a template when the room is ready.",
    action: "Create a session",
    icon: CirclePlus,
  },
  waiting: {
    label: "Waiting for players",
    tone: "warning",
    description: "The join code is open. Give the room a moment to gather.",
    action: "Open room controls",
    icon: Clock3,
  },
  running: {
    label: "Live now",
    tone: "live",
    description: "Round 01 · Warm-up lap is ready for the next signal.",
    action: "Open room controls",
    icon: Play,
  },
  paused: {
    label: "Paused",
    tone: "warning",
    description: "The room is holding. Resume when the room is ready.",
    action: "Open room controls",
    icon: Pause,
  },
  finished: {
    label: "Finished",
    tone: "ready",
    description: "The room is complete. A results view is ready to review.",
    action: "View results",
    icon: BarChart3,
  },
};

function Button({
  children,
  tone = "ink",
  onClick,
  icon: Icon,
  disabled = false,
}: {
  children: ReactNode;
  tone?: "ink" | "signal" | "quiet";
  onClick?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`lq-focus inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        tone === "signal"
          ? "bg-[var(--lq-signal)] text-white hover:bg-[var(--lq-signal-deep)]"
          : tone === "quiet"
            ? "border border-[var(--lq-line)] bg-[var(--lq-card)] text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]"
            : "bg-[var(--lq-ink)] text-[var(--lq-paper)] hover:bg-[#243958]"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function PreviewControls({
  templateMode,
  sessionState,
  surfaceState,
  onTemplateMode,
  onSessionState,
  onSurfaceState,
}: {
  templateMode: TemplateMode;
  sessionState: SessionState;
  surfaceState: SurfaceState;
  onTemplateMode: (value: TemplateMode) => void;
  onSessionState: (value: SessionState) => void;
  onSurfaceState: (value: SurfaceState) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#d8d3c9] bg-[#f0ede6] p-3.5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#787f8c]">Review controls</div>
          <p className="mt-1 text-xs leading-5 text-[var(--lq-ink-soft)]">Local structural states only. Nothing here is authoritative production state.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-[#d8d3c9] bg-[var(--lq-card)] px-2.5 py-2 text-[10px] font-bold text-[var(--lq-ink-soft)]">
            Templates
            <select
              aria-label="Preview template state"
              value={templateMode}
              onChange={(event) => onTemplateMode(event.target.value as TemplateMode)}
              className="lq-focus bg-transparent text-[10px] font-bold text-[var(--lq-ink)] outline-none"
            >
              <option value="available">Available</option>
              <option value="empty">No templates</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-[#d8d3c9] bg-[var(--lq-card)] px-2.5 py-2 text-[10px] font-bold text-[var(--lq-ink-soft)]">
            Session
            <select
              aria-label="Preview session state"
              value={sessionState}
              onChange={(event) => onSessionState(event.target.value as SessionState)}
              className="lq-focus bg-transparent text-[10px] font-bold text-[var(--lq-ink)] outline-none"
            >
              <option value="running">Running</option>
              <option value="waiting">Waiting</option>
              <option value="paused">Paused</option>
              <option value="finished">Finished</option>
              <option value="none">No active session</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-[#d8d3c9] bg-[var(--lq-card)] px-2.5 py-2 text-[10px] font-bold text-[var(--lq-ink-soft)]">
            Surface
            <select
              aria-label="Preview surface state"
              value={surfaceState}
              onChange={(event) => onSurfaceState(event.target.value as SurfaceState)}
              className="lq-focus bg-transparent text-[10px] font-bold text-[var(--lq-ink)] outline-none"
            >
              <option value="ready">Ready</option>
              <option value="loading">Loading</option>
              <option value="error">Error</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

function TemplateSection({
  mode,
  onCreate,
  onBrowse,
}: {
  mode: TemplateMode;
  onCreate: () => void;
  onBrowse: () => void;
}) {
  return (
    <section className="lq-card rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Existing templates</p>
          <h2 className="lq-display mt-1 text-2xl font-extrabold">Choose a starting point</h2>
        </div>
        <Button tone="quiet" icon={CirclePlus} onClick={onCreate}>Create template</Button>
      </div>
      {mode === "empty" ? (
        <div className="mt-5">
          <EmptyState
            title="Your shelf is waiting"
            description="Make a reusable question set once, then bring it into any room."
            action={<Button tone="signal" icon={CirclePlus} onClick={onCreate}>Create your first template</Button>}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {templates.map((template, index) => (
            <button
              type="button"
              key={template.name}
              onClick={onBrowse}
              className="lq-focus group flex w-full items-center gap-3 rounded-2xl border border-transparent bg-[#fbfaf7] p-3 text-left transition-colors hover:border-[var(--lq-line)] hover:bg-[#f6f3ed]"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${template.tone === "signal" ? "bg-[#fff0eb] text-[var(--lq-signal-deep)]" : template.tone === "lilac" ? "bg-[#f1eef9] text-[#665b86]" : "bg-[#edf8f4] text-[var(--lq-mint-deep)]"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[var(--lq-ink)]">{template.name}</span>
                <span className="mt-1 block text-xs text-[var(--lq-ink-soft)]">{template.detail} · {template.edited}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#a7acb4] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--lq-signal-deep)]" />
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={onBrowse} className="lq-focus mt-5 flex w-full items-center justify-between border-t border-[var(--lq-line)] pt-4 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]">
        <span>Browse all quiz templates</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}

function ActiveSessionSection({
  state,
  navigate,
}: {
  state: SessionState;
  navigate: (route: string) => void;
}) {
  const config = sessionCopy[state];
  const Icon = config.icon;
  const isFinished = state === "finished";
  const route = isFinished ? "/host/results/harbor-47" : "/host/session/harbor-47";
  return (
    <section className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 ${state === "none" ? "border border-[var(--lq-line)] bg-[#fbfaf7]" : "bg-[var(--lq-ink)] text-[var(--lq-paper)]"}`}>
      {state !== "none" && <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full border-[28px] border-[rgba(244,203,104,0.14)]" />}
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`text-sm font-semibold ${state === "none" ? "text-[var(--lq-ink-soft)]" : "text-[#aeb9c9]"}`}>Active session</p>
            <h2 className={`lq-display mt-1 text-2xl font-extrabold ${state === "none" ? "text-[var(--lq-ink)]" : ""}`}>Harbor House Quiz</h2>
          </div>
          <StatusBadge tone={config.tone}>{config.label}</StatusBadge>
        </div>
        <div className={`mt-5 flex items-start gap-3 rounded-2xl p-3.5 ${state === "none" ? "bg-[#f0ede7]" : "bg-[#243653]"}`}>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${state === "none" ? "bg-[#e3dfd6] text-[var(--lq-ink-soft)]" : "bg-[rgba(244,203,104,0.16)] text-[var(--lq-sun)]"}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-sm font-bold ${state === "none" ? "text-[var(--lq-ink)]" : ""}`}>{config.description}</p>
            <p className={`mt-1 text-xs leading-5 ${state === "none" ? "text-[var(--lq-ink-soft)]" : "text-[#b9c4d1]"}`}>Structural preview state · route <span className="lq-mono">{route}</span></p>
          </div>
        </div>
        {state !== "none" && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div><div className="lq-display text-2xl font-extrabold">{state === "waiting" ? "08" : "28"}<span className="text-base text-[#8391a3]">/32</span></div><div className="mt-1 text-xs text-[#9eacbd]">players joined</div></div>
            <div><div className="lq-display text-2xl font-extrabold">{state === "finished" ? "04" : "01"}</div><div className="mt-1 text-xs text-[#9eacbd]">round position</div></div>
            <div className="hidden sm:block"><div className="lq-display text-2xl font-extrabold">{state === "finished" ? "24:18" : "06:00"}</div><div className="mt-1 text-xs text-[#9eacbd]">planned duration</div></div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button tone={state === "none" ? "signal" : "signal"} icon={isFinished ? BarChart3 : state === "running" ? Play : CirclePlus} onClick={() => navigate(route)}>{config.action}</Button>
          {state !== "none" && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#aeb9c9]"><Radio className="h-3.5 w-3.5" /> Preview room: harbor-47</span>}
        </div>
      </div>
    </section>
  );
}

function RecentSessions({ navigate }: { navigate: (route: string) => void }) {
  return (
    <section className="lq-card rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Recent sessions</p>
          <h2 className="lq-display mt-1 text-2xl font-extrabold">Results worth revisiting</h2>
          <p className="mt-1 text-[11px] leading-5 text-[var(--lq-ink-soft)]">Structural preview records · not authoritative production state.</p>
        </div>
        <button type="button" onClick={() => navigate("/host/results/harbor-47")} className="lq-focus rounded-lg p-2 text-[var(--lq-ink-soft)] hover:bg-[#f0ede7] hover:text-[var(--lq-signal-deep)]" aria-label="Open latest results">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 space-y-2">
        {[
          { title: "Harbor House Quiz", detail: "Friday, 14 Jun · 32 players", badge: "Live now", tone: "live" as const },
          { title: "Summer Signals", detail: "Monday, 10 Jun · 24 players", badge: "Finished", tone: "ready" as const },
          { title: "The Long Weekend", detail: "Wednesday, 12 Jun · 6 rounds", badge: "Draft", tone: "neutral" as const },
        ].map((room) => (
          <button type="button" key={room.title} onClick={() => navigate(room.badge === "Finished" ? "/host/results/harbor-47" : "/host/session/harbor-47")} className="lq-focus flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-[#fbfaf7]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ede7] text-[var(--lq-ink-soft)]"><Radio className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{room.title}</div><div className="mt-1 text-xs text-[var(--lq-ink-soft)]">{room.detail}</div></div>
            <StatusBadge tone={room.tone}>{room.badge}</StatusBadge>
          </button>
        ))}
      </div>
    </section>
  );
}

function SurfaceState({ state, onRetry }: { state: SurfaceState; onRetry: () => void }) {
  if (state === "loading") return <LoadingState label="Refreshing dashboard surfaces" />;
  if (state === "error") return <ErrorState onRetry={onRetry} />;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#a8d7ca] bg-[#edf9f4] p-4 text-[#2e7168]">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8efe7]"><Check className="h-4 w-4" /></div>
      <div><p className="text-xs font-bold">Dashboard surfaces are ready</p><p className="mt-1 text-[11px] leading-5 text-[#4f8079]">Local preview data is staged for review.</p></div>
    </div>
  );
}

function DashboardPage({
  navigate,
  templateMode,
  sessionState,
  surfaceState,
  setTemplateMode,
  setSessionState,
  setSurfaceState,
}: {
  navigate: (route: string) => void;
  templateMode: TemplateMode;
  sessionState: SessionState;
  surfaceState: SurfaceState;
  setTemplateMode: (value: TemplateMode) => void;
  setSessionState: (value: SessionState) => void;
  setSurfaceState: (value: SurfaceState) => void;
}) {
  return (
    <div className="mx-auto max-w-[1360px] px-5 py-7 sm:px-8 lg:px-10">
      <div className="lq-rise">
        <Breadcrumbs items={[{ label: "Host console" }, { label: "Dashboard" }]} />
        <PageHeader
          eyebrow="Friday · 14 June 2024"
          title="Good evening, Maya."
          description="The room is calm, the questions are queued, and your next move is clear."
        >
          <Button tone="signal" icon={CirclePlus} onClick={() => navigate("/host/session/new")}>Create session</Button>
        </PageHeader>
      </div>

      <div className="lq-rise lq-rise-delay-1">
        <PreviewControls
          templateMode={templateMode}
          sessionState={sessionState}
          surfaceState={surfaceState}
          onTemplateMode={setTemplateMode}
          onSessionState={setSessionState}
          onSurfaceState={setSurfaceState}
        />
      </div>

      <div className="mt-5 lq-rise lq-rise-delay-1">
        <SurfaceState state={surfaceState} onRetry={() => setSurfaceState("ready")} />
      </div>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="lq-rise lq-rise-delay-2">
          <ActiveSessionSection state={sessionState} navigate={navigate} />
        </div>
        <div className="lq-rise lq-rise-delay-2">
          <div className="lq-card h-full rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Tonight at a glance</p><h2 className="lq-display mt-1 text-2xl font-extrabold">Ready when you are</h2></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff8df] text-[#8d701e]"><Settings2 className="h-5 w-5" /></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f1eef9] p-4"><div className="text-xs font-semibold text-[var(--lq-ink-soft)]">Question sets</div><div className="lq-display mt-2 text-2xl font-extrabold">{templateMode === "empty" ? "—" : "12"}</div><div className="mt-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]">{templateMode === "empty" ? "ready to make" : "+2 this month"}</div></div>
              <div className="rounded-2xl bg-[#edf8f4] p-4"><div className="text-xs font-semibold text-[var(--lq-ink-soft)]">Avg. room size</div><div className="lq-display mt-2 text-2xl font-extrabold">24</div><div className="mt-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]">players / night</div></div>
            </div>
            <button type="button" onClick={() => navigate("/host/templates")} className="lq-focus mt-5 flex w-full items-center justify-between border-t border-[var(--lq-line)] pt-4 text-sm font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><span>Browse your question sets</span><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="lq-rise lq-rise-delay-2">
          <TemplateSection mode={templateMode} onCreate={() => navigate("/host/templates")} onBrowse={() => navigate("/host/templates")} />
        </div>
        <div className="lq-rise lq-rise-delay-3">
          <RecentSessions navigate={navigate} />
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--lq-line)] pt-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--lq-ink-soft)]"><Users className="h-3.5 w-3.5" /> Host workflow preview · setup → room → results</div>
        <RouteHint route="/host/dashboard" />
      </div>
    </div>
  );
}

function PlaceholderPage({ route, navigate }: { route: string; navigate: (route: string) => void }) {
  const isTemplates = route.startsWith("/host/templates");
  const isSession = route.startsWith("/host/session");
  const isResults = route.startsWith("/host/results");
  const page = isTemplates
    ? { eyebrow: "Quiz templates", title: "Build the question shelf.", description: "A placeholder for reusable question sets. Detailed template management is intentionally outside this structural dashboard preview.", icon: BookOpen }
    : isSession
      ? { eyebrow: "Current session", title: "Set the room in motion.", description: "A placeholder for room controls, pacing, the join code, and live round progression.", icon: Radio }
      : { eyebrow: "Results", title: "A room worth remembering.", description: "A placeholder for participation, pace, and the final signal after a session ends.", icon: BarChart3 };
  const Icon = page.icon;
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console", onClick: () => navigate("/host/dashboard") }, { label: page.title }]} />
      <div className="mt-5 flex items-center justify-between gap-3"><BackButton onClick={() => navigate("/host/dashboard")} /><RouteHint route={route} /></div>
      <PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description}>
        <Button tone="quiet" icon={ArrowRight} onClick={() => navigate("/host/dashboard")}>Back to dashboard</Button>
      </PageHeader>
      <div className="lq-card relative overflow-hidden rounded-3xl p-7 sm:p-10">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-bl-full bg-[#edf8f4]" />
        <div className="relative max-w-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lq-ink)] text-[var(--lq-sun)]"><Icon className="h-6 w-6" /></div>
          <h2 className="lq-display mt-7 text-2xl font-extrabold">This route has a clear place in the event arc.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--lq-ink-soft)]">Structural placeholder only. It keeps the authenticated shell and route hierarchy reviewable without pretending this detailed workflow exists.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3"><StatusBadge tone="neutral">Structural preview</StatusBadge><StatusBadge tone={isSession ? "live" : isResults ? "ready" : "neutral"}>{isSession ? "Room handoff" : isResults ? "Results handoff" : "Setup handoff"}</StatusBadge></div>
          <div className="mt-8 border-t border-[var(--lq-line)] pt-5"><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9399a3]">Jump to a related preview route</div><div className="flex flex-wrap gap-2">{[["Dashboard", "/host/dashboard"], ["Templates", "/host/templates"], ["Current session", "/host/session/harbor-47"], ["Results", "/host/results/harbor-47"]].map(([label, target]) => <button key={target} type="button" onClick={() => navigate(target)} className="lq-focus rounded-lg border border-[var(--lq-line)] bg-[var(--lq-card)] px-3 py-2 text-xs font-bold text-[var(--lq-ink-soft)] hover:border-[#d6a496] hover:text-[var(--lq-signal-deep)]">{label}</button>)}</div></div>
        </div>
      </div>
    </div>
  );
}

function SignedOutPage({ navigate }: { navigate: (route: string) => void }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-72px)] max-w-[760px] items-center px-5 py-10 sm:px-8">
      <div className="lq-card w-full rounded-3xl p-7 sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lq-signal)] text-white shadow-[4px_4px_0_var(--lq-ink)]"><LogOut className="h-6 w-6" /></div>
        <div className="lq-mono mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">Preview only</div>
        <h1 className="lq-display mt-3 text-4xl font-extrabold">You are signed out.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--lq-ink-soft)]">No credentials were changed and no auth request was made. This local state demonstrates the handoff back to the landing preview.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Button tone="signal" icon={RotateCcw} onClick={() => navigate("/host/dashboard")}>Return to host preview</Button><Button tone="quiet" onClick={() => navigate("/")}>Go to landing preview</Button></div>
      </div>
    </div>
  );
}

export function HostDashboard() {
  const [route, navigate] = usePreviewRoute("/host/dashboard");
  const [templateMode, setTemplateMode] = useState<TemplateMode>("available");
  const [sessionState, setSessionState] = useState<SessionState>("running");
  const [surfaceState, setSurfaceState] = useState<SurfaceState>("ready");
  const isDashboard = route === "/host" || route === "/host/dashboard";
  const isSignedOut = route === "/signed-out" || route === "/";

  return (
    <AppShell
      role="host"
      activeRoute={route}
      onNavigate={navigate}
      navigation={navigation}
    >
      {isSignedOut ? (
        <SignedOutPage navigate={navigate} />
      ) : isDashboard ? (
        <DashboardPage
          navigate={navigate}
          templateMode={templateMode}
          sessionState={sessionState}
          surfaceState={surfaceState}
          setTemplateMode={setTemplateMode}
          setSessionState={setSessionState}
          setSurfaceState={setSurfaceState}
        />
      ) : (
        <PlaceholderPage route={route} navigate={navigate} />
      )}
    </AppShell>
  );
}