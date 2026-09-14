import "./_group.css";
import { useState, type ElementType, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  CirclePlus,
  ClipboardList,
  Layers3,
  LayoutDashboard,
  Play,
  Settings2,
  Sparkles,
} from "lucide-react";
import { AppShell } from "./_shared/AppShell";
import {
  BackButton,
  Breadcrumbs,
  ConfirmationDialog,
  EmptyState,
  LoadingState,
  MiniMetric,
  PageHeader,
  RouteHint,
  StatusBadge,
  usePreviewRoute,
} from "./_shared/Primitives";
import { hostNav, recentRooms, rounds } from "./_shared/demoData";

function Button({ children, tone = "ink", onClick, icon: Icon }: { children: ReactNode; tone?: "ink" | "signal" | "quiet"; onClick?: () => void; icon?: ElementType }) {
  return <button type="button" onClick={onClick} className={`lq-focus inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${tone === "signal" ? "bg-[var(--lq-signal)] text-white hover:bg-[var(--lq-signal-deep)]" : tone === "quiet" ? "border border-[var(--lq-line)] bg-[var(--lq-card)] text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]" : "bg-[var(--lq-ink)] text-[var(--lq-paper)] hover:bg-[#243958]"}`}>{Icon && <Icon className="h-4 w-4" />}{children}</button>;
}

function DashboardPage({ navigate, onOpenConfirm }: { navigate: (route: string) => void; onOpenConfirm: () => void }) {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-7 sm:px-8 lg:px-10">
      <div className="lq-rise"><Breadcrumbs items={[{ label: "Host console" }, { label: "Overview" }]} /><PageHeader eyebrow="Friday · 14 June 2024" title="Good evening, Maya." description="The room is calm, the questions are queued, and your next move is clear." >
        <Button tone="signal" icon={Play} onClick={() => navigate("/host/session/harbor-47")}>Enter live room</Button>
      </PageHeader></div>
      <section className="lq-rise lq-rise-delay-1 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--lq-ink)] p-6 text-[var(--lq-paper)] sm:p-7">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-[rgba(244,203,104,0.15)]" />
          <div className="absolute right-12 top-16 h-3 w-3 rounded-full bg-[var(--lq-sun)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge tone="live">Live now</StatusBadge><RouteHint route="/host/session/harbor-47" /></div>
            <p className="mt-8 text-sm font-semibold text-[#aeb9c9]">Current room</p>
            <h2 className="lq-display mt-1 text-3xl font-extrabold sm:text-4xl">Harbor House Quiz</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#bdc7d3]">Round 01 · Warm-up lap is ready when the room is.</p>
            <div className="mt-7 flex flex-wrap items-center gap-6"><div><div className="lq-display text-3xl font-extrabold">28<span className="text-lg text-[#8391a3]">/32</span></div><div className="mt-1 text-xs text-[#9eacbd]">players joined</div></div><div className="h-9 w-px bg-[#3a4b63]" /><div><div className="lq-display text-3xl font-extrabold">06:00</div><div className="mt-1 text-xs text-[#9eacbd]">planned duration</div></div></div>
            <button type="button" onClick={() => navigate("/host/session/harbor-47")} className="lq-focus mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--lq-sun)] hover:text-[#ffe9a5]">Open room controls <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="lq-card rounded-3xl p-6 sm:p-7">
          <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Tonight at a glance</p><h2 className="lq-display mt-1 text-2xl font-extrabold">Ready when you are</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff8df] text-[#8d701e]"><Sparkles className="h-5 w-5" /></div></div>
          <div className="mt-6 grid grid-cols-2 gap-3"><MiniMetric label="Question sets" value="12" note="+2 this month" accent="lilac" /><MiniMetric label="Avg. room size" value="24" note="players / night" accent="mint" /></div>
          <button type="button" onClick={() => navigate("/host/templates")} className="lq-focus mt-5 flex w-full items-center justify-between border-t border-[var(--lq-line)] pt-4 text-sm font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><span>Browse your question sets</span><ChevronRight className="h-4 w-4" /></button>
        </div>
      </section>
      <section className="lq-rise lq-rise-delay-2 mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="lq-card rounded-3xl p-6">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Room rhythm</p><h2 className="lq-display mt-1 text-xl font-extrabold">The next three signals</h2></div><button type="button" onClick={() => navigate("/host/session/harbor-47")} className="lq-focus text-xs font-bold text-[var(--lq-signal-deep)]">Manage room</button></div>
          <div className="mt-5 space-y-2">{rounds.map((round, index) => <div key={round.number} className="group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-[var(--lq-line)] hover:bg-[#fbfaf7]"><div className={`lq-mono flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${index === 0 ? "bg-[var(--lq-signal)] text-white" : "bg-[#f0ede7] text-[var(--lq-ink-soft)]"}`}>{round.number}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{round.title}</div><div className="mt-1 text-xs text-[var(--lq-ink-soft)]">{round.detail}</div></div><StatusBadge tone={index === 0 ? "ready" : "neutral"}>{round.state}</StatusBadge></div>)}</div>
        </div>
        <div className="lq-card rounded-3xl p-6">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--lq-ink-soft)]">State gallery</p><h2 className="lq-display mt-1 text-xl font-extrabold">Quiet confidence</h2></div><button type="button" onClick={onOpenConfirm} className="lq-focus rounded-lg p-2 text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]" aria-label="Open confirmation example"><Settings2 className="h-4 w-4" /></button></div>
          <p className="mt-2 text-xs leading-5 text-[var(--lq-ink-soft)]">Foundational states stay visible and legible while you run the room.</p>
          <div className="mt-5 space-y-3"><div className="rounded-2xl bg-[#fbfaf7] p-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9399a3]">Loading</div><LoadingState label="Refreshing players" /></div><div className="rounded-2xl bg-[#fbfaf7] p-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9399a3]">Empty</div><EmptyState title="No saved drafts" description="New sets you make will appear here." /></div></div>
        </div>
      </section>
    </div>
  );
}

function PlaceholderPage({ route, navigate }: { route: string; navigate: (route: string) => void }) {
  const info: Record<string, { eyebrow: string; title: string; description: string; icon: ElementType }> = {
    "/host": { eyebrow: "Host console", title: "Your room, at a glance.", description: "A calm command center for the moments before the room gets loud.", icon: LayoutDashboard },
    "/host/templates": { eyebrow: "Question sets", title: "Build the question shelf.", description: "Keep your reusable sets close. Detailed authoring arrives in the next stage.", icon: BookOpen },
    "/host/templates/harbor-house": { eyebrow: "Question set", title: "Harbor House Quiz", description: "A structural preview for the set overview route.", icon: ClipboardList },
    "/host/templates/harbor-house/questions": { eyebrow: "Question set / questions", title: "Question sequence", description: "A placeholder for the focused question list and authoring workspace.", icon: Layers3 },
    "/host/session/new": { eyebrow: "New session", title: "Set the room in motion.", description: "Choose a set, check the room details, and open a join code when you are ready.", icon: CirclePlus },
    "/host/session/harbor-47": { eyebrow: "Live room", title: "Harbor House Quiz", description: "The host control surface will live here: room status, round progression, and a clear next action.", icon: Play },
    "/host/results/harbor-47": { eyebrow: "Results", title: "A room worth remembering.", description: "The post-event view will collect the pace, participation, and final signal.", icon: BarChart3 },
  };
  const page = info[route] ?? info["/host"];
  const Icon = page.icon;
  return <div className="mx-auto max-w-[1100px] px-5 py-7 sm:px-8 lg:px-10"><Breadcrumbs items={[{ label: "Host console", onClick: () => navigate("/host/dashboard") }, { label: page.title }]} /><PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description}><Button tone="quiet" icon={ChevronRight} onClick={() => navigate("/host/dashboard")}>Back to overview</Button></PageHeader><div className="lq-card relative overflow-hidden rounded-3xl p-7 sm:p-10"><div className="absolute right-0 top-0 h-48 w-48 rounded-bl-full bg-[#edf8f4]" /><div className="relative max-w-xl"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lq-ink)] text-[var(--lq-sun)]"><Icon className="h-6 w-6" /></div><h2 className="lq-display mt-7 text-2xl font-extrabold">This route has a clear place in the event arc.</h2><p className="mt-3 text-sm leading-6 text-[var(--lq-ink-soft)]">Structural placeholder only. It establishes hierarchy, navigation, and the handoff between setup, live room, and results without pretending to be production session state.</p><div className="mt-7 flex flex-wrap items-center gap-3"><StatusBadge tone="neutral">Stage 01 / shell</StatusBadge><RouteHint route={route} /></div><div className="mt-8 border-t border-[var(--lq-line)] pt-5"><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9399a3]">Jump to a related preview route</div><div className="flex flex-wrap gap-2">{[["Set shelf", "/host/templates"], ["Sample set", "/host/templates/harbor-house"], ["Questions", "/host/templates/harbor-house/questions"], ["New room", "/host/session/new"], ["Live room", "/host/session/harbor-47"], ["Results", "/host/results/harbor-47"]].map(([label, target]) => <button key={target} type="button" onClick={() => navigate(target)} className="lq-focus rounded-lg border border-[var(--lq-line)] bg-[var(--lq-card)] px-3 py-2 text-xs font-bold text-[var(--lq-ink-soft)] hover:border-[#d6a496] hover:text-[var(--lq-signal-deep)]">{label}</button>)}</div></div></div></div></div>;
}

export function HostShell() {
  const [route, navigate] = usePreviewRoute("/host/dashboard");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const isDashboard = route === "/host" || route === "/host/dashboard";
  return <AppShell role="host" activeRoute={route} onNavigate={navigate} navigation={hostNav.map((item) => ({ ...item, icon: item.route.includes("template") ? <BookOpen className="h-4 w-4" /> : item.route.includes("results") ? <BarChart3 className="h-4 w-4" /> : item.route.includes("session") ? <Play className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" /> }))}>
    {isDashboard ? <DashboardPage navigate={navigate} onOpenConfirm={() => setConfirmOpen(true)} /> : <PlaceholderPage route={route} navigate={navigate} />}
    {notice && <div className="fixed bottom-5 right-5 z-40 rounded-2xl bg-[var(--lq-ink)] px-4 py-3 text-sm font-bold text-white shadow-xl">Room remains open.</div>}
    <ConfirmationDialog open={confirmOpen} title="End the live room?" description="This is a preview confirmation only. In the real room, ending would stop new answers and move everyone to results." confirmLabel="End preview room" onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); setNotice(true); window.setTimeout(() => setNotice(false), 2500); }} />
  </AppShell>;
}