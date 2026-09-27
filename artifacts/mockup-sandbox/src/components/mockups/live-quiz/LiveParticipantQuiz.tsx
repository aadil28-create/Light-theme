import "./_group.css";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  Info,
  LoaderCircle,
  Radio,
  RotateCcw,
  Trophy,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  ConnectionStatus,
  StatusBadge,
  type ConnectionState,
} from "./_shared/Primitives";
import { demoLeaderboard, demoSession } from "./_shared/demoData";

type ParticipantLiveState =
  | "running"
  | "connecting"
  | "reconnecting"
  | "connection-restored"
  | "host-disconnected"
  | "quiz-paused"
  | "session-finished"
  | "session-unavailable"
  | "temporary-network-loss";

type ParticipantView = "question" | "reveal" | "leaderboard" | "results";

type LeaderboardRow = {
  rank: number;
  name: string;
  score: number;
  change?: string;
};

type AnswerOption = {
  id: string;
  label: string;
};

export type LiveParticipantQuizProps = {
  navigate: (route: string) => void;
  connection: ConnectionState;
  onConnectionChange: (connection: ConnectionState) => void;
};

const answerOptions: AnswerOption[] = [
  { id: "oakland", label: "Oakland" },
  { id: "sausalito", label: "Sausalito" },
  { id: "richmond", label: "Richmond" },
  { id: "berkeley", label: "Berkeley" },
];

const leaderboard = demoLeaderboard;

const stateOptions: ParticipantLiveState[] = [
  "running",
  "connecting",
  "reconnecting",
  "connection-restored",
  "host-disconnected",
  "quiz-paused",
  "session-finished",
  "session-unavailable",
  "temporary-network-loss",
];

const viewOptions: ParticipantView[] = ["question", "reveal", "leaderboard", "results"];

function readPreviewView(): ParticipantView {
  const value = new URLSearchParams(window.location.search).get("view") as ParticipantView | null;
  return value && viewOptions.includes(value) ? value : "question";
}

function readPreviewState(): ParticipantLiveState {
  const value = new URLSearchParams(window.location.search).get("state") as ParticipantLiveState | null;
  return value && stateOptions.includes(value) ? value : "running";
}

function stateLabel(state: ParticipantLiveState) {
  return {
    running: "Running",
    connecting: "Connecting",
    reconnecting: "Reconnecting",
    "connection-restored": "Connection Restored",
    "host-disconnected": "Host Disconnected",
    "quiz-paused": "Quiz Paused",
    "session-finished": "Session Finished",
    "session-unavailable": "Session Unavailable",
    "temporary-network-loss": "Temporary Network Loss",
  }[state];
}

function viewLabel(view: ParticipantView) {
  return {
    question: "Question",
    reveal: "Answer reveal",
    leaderboard: "Leaderboard",
    results: "Final results",
  }[view];
}

function connectionForState(state: ParticipantLiveState): ConnectionState {
  if (state === "connecting" || state === "reconnecting") return "reconnecting";
  if (state === "host-disconnected" || state === "session-unavailable" || state === "temporary-network-loss") return "offline";
  return "connected";
}

function statusTone(state: ParticipantLiveState) {
  if (state === "running" || state === "connection-restored") return "ready" as const;
  if (state === "session-finished") return "neutral" as const;
  if (state === "host-disconnected" || state === "session-unavailable" || state === "temporary-network-loss") return "danger" as const;
  return "warning" as const;
}

function formatRemainingMs(remainingMs: number) {
  const seconds = Math.max(0, Math.floor(remainingMs / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function RecoveryNotice({ state }: { state: ParticipantLiveState }) {
  if (state === "running") return null;

  const notices = {
    connecting: {
      title: "Connecting to the room",
      body: "The session is being prepared. Your answer state comes from the host service.",
      icon: LoaderCircle,
      tone: "warning",
    },
    reconnecting: {
      title: "Reconnecting to the room",
      body: "Keep this screen open. The last known quiz state remains visible while the connection returns.",
      icon: RotateCcw,
      tone: "warning",
    },
    "connection-restored": {
      title: "Connection restored",
      body: "The participant view is receiving session updates again.",
      icon: Wifi,
      tone: "ready",
    },
    "host-disconnected": {
      title: "Host disconnected",
      body: "The host connection is unavailable. Wait for the room to become available again.",
      icon: WifiOff,
      tone: "danger",
    },
    "quiz-paused": {
      title: "Quiz paused",
      body: "The host has paused the room. Your answer and score are held by the session service.",
      icon: Clock3,
      tone: "warning",
    },
    "session-finished": {
      title: "Session finished",
      body: "The quiz is complete. Review the final standings below.",
      icon: CheckCircle2,
      tone: "ready",
    },
    "session-unavailable": {
      title: "Session unavailable",
      body: "This room cannot be reached right now. The service will determine when it is available again.",
      icon: WifiOff,
      tone: "danger",
    },
    "temporary-network-loss": {
      title: "Temporary network loss",
      body: "Your network connection is unstable. Do not refresh unless the host asks you to.",
      icon: RotateCcw,
      tone: "danger",
    },
  } satisfies Record<Exclude<ParticipantLiveState, "running">, { title: string; body: string; icon: typeof Info; tone: "warning" | "ready" | "danger" }>;
  const notice = notices[state];
  const Icon = notice.icon;
  const toneClasses = {
    warning: "border-[#ead28d] bg-[#fff8df] text-[#806a27]",
    ready: "border-[#a8d7ca] bg-[#edf9f4] text-[#2e7168]",
    danger: "border-[#ebbbb9] bg-[#fff5f3] text-[#873d40]",
  };

  return (
    <div className={`mt-4 rounded-2xl border p-4 ${toneClasses[notice.tone]}`} role={notice.tone === "danger" ? "alert" : "status"} aria-live="polite">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${state === "connecting" || state === "reconnecting" ? "animate-spin" : ""}`} />
        <div>
          <div className="text-xs font-bold">{notice.title}</div>
          <p className="mt-1 text-[11px] leading-5 opacity-85">{notice.body}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewControls({
  view,
  state,
  onViewChange,
  onStateChange,
}: {
  view: ParticipantView;
  state: ParticipantLiveState;
  onViewChange: (view: ParticipantView) => void;
  onStateChange: (state: ParticipantLiveState) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#d8d3c9] bg-[#f0ede6] p-3.5">
      <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#787f8c]">Preview controls</div>
      <p className="mt-1 text-[11px] leading-5 text-[var(--lq-ink-soft)]">Review participant states without changing server-owned quiz behavior.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="flex items-center justify-between gap-2 rounded-lg border border-[#d8d3c9] bg-[var(--lq-card)] px-2.5 py-2 text-[10px] font-bold text-[var(--lq-ink-soft)]">
          View
          <select aria-label="Preview participant live view" value={view} onChange={(event) => onViewChange(event.target.value as ParticipantView)} className="lq-focus max-w-[150px] bg-transparent text-right text-[10px] font-bold text-[var(--lq-ink)] outline-none">
            {viewOptions.map((option) => <option key={option} value={option}>{viewLabel(option)}</option>)}
          </select>
        </label>
        <label className="flex items-center justify-between gap-2 rounded-lg border border-[#d8d3c9] bg-[var(--lq-card)] px-2.5 py-2 text-[10px] font-bold text-[var(--lq-ink-soft)]">
          State
          <select aria-label="Preview participant connection state" value={state} onChange={(event) => onStateChange(event.target.value as ParticipantLiveState)} className="lq-focus max-w-[180px] bg-transparent text-right text-[10px] font-bold text-[var(--lq-ink)] outline-none">
            {stateOptions.map((option) => <option key={option} value={option}>{stateLabel(option)}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}

function ProgressBar({ view }: { view: ParticipantView }) {
  const progress = view === "results" ? 100 : view === "leaderboard" ? 67 : view === "reveal" ? 50 : 33;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[10px] font-bold text-[var(--lq-ink-soft)]">
        <span>Question 1 of 3</span>
        <span>{progress}% through preview</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e7e2d9]">
        <div className="h-full rounded-full bg-[var(--lq-signal)] transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function QuestionView({
  selectedOptionId,
  canAnswer,
  onSelect,
}: {
  selectedOptionId: string | null;
  canAnswer: boolean;
  onSelect: (optionId: string) => void;
}) {
  return (
    <section className="lq-card mt-4 rounded-[28px] p-5" aria-labelledby="participant-question-heading">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[var(--lq-signal-deep)]"><Radio className="h-4 w-4" /><span className="text-xs font-bold">Question 1</span></div>
        <StatusBadge tone={canAnswer ? "live" : "neutral"}>{canAnswer ? "Answering open" : "Answering closed"}</StatusBadge>
      </div>
      <h2 id="participant-question-heading" className="lq-display mt-6 text-[30px] font-extrabold leading-[1.02]">Which city is known as the gateway to the San Francisco Bay?</h2>
      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[#fff8df] px-3.5 py-3">
        <div className="flex items-center gap-2 text-[#806a27]"><Clock3 className="h-4 w-4" /><span className="text-xs font-bold">Time remaining</span></div>
        <span className="lq-mono text-lg font-bold text-[#806a27]">00:30</span>
      </div>
      <fieldset className="mt-5 space-y-3" role="radiogroup" aria-labelledby="participant-question-heading">
        <legend className="sr-only">Choose one answer</legend>
        {answerOptions.map((option, index) => {
          const selected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              disabled={!canAnswer}
               role="radio"
               aria-checked={selected}
              className={`lq-focus flex min-h-[64px] w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ${selected ? "border-[#df836f] bg-[#fff0eb] text-[var(--lq-signal-deep)] shadow-[0_0_0_2px_rgba(223,131,111,0.12)]" : "border-[var(--lq-line)] bg-[#fbfaf7] text-[var(--lq-ink)] hover:border-[#d6a496]"} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${selected ? "bg-[var(--lq-signal)] text-white" : "bg-[#f0ede7] text-[var(--lq-ink-soft)]"}`}>{String.fromCharCode(65 + index)}</span>
              <span className="flex-1 text-sm font-bold">{option.label}</span>
              {selected && <Check className="h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </fieldset>
      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[#edf8f4] p-3.5 text-[#397f75]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-[11px] leading-5">{selectedOptionId ? "Your selection is shown locally. The server still owns submission and answer acceptance." : "Choose an answer while the host keeps answering open."}</p>
      </div>
    </section>
  );
}

function RevealView({ selectedOptionId }: { selectedOptionId: string | null }) {
  const submittedAnswer = answerOptions.find((option) => option.id === selectedOptionId)?.label ?? "No answer selected";
  return (
    <section className="mt-4 space-y-3" aria-labelledby="participant-reveal-heading">
      <div className="rounded-[28px] bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)]">
        <StatusBadge tone="warning">Between questions</StatusBadge>
        <h2 id="participant-reveal-heading" className="lq-display mt-6 text-[30px] font-extrabold leading-[1.02]">Here is what the room just answered.</h2>
        <p className="mt-3 text-sm leading-6 text-[#c0cad4]">The host has closed this question. Correctness and points come from the session service.</p>
      </div>
      <div className="lq-card rounded-[28px] p-5">
        <div className="flex items-center gap-2 text-[var(--lq-ink-soft)]"><Radio className="h-4 w-4" /><span className="text-xs font-bold">Your submitted answer</span></div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#f5f3ee] p-4">
          <span className="text-sm font-extrabold">{submittedAnswer}</span>
          <StatusBadge tone="neutral">Submitted</StatusBadge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#a8d7ca] bg-[#edf9f4] p-4">
            <div className="flex items-center gap-2 text-[#2e7168]"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-bold">Correct answer</span></div>
            <div className="mt-2 text-lg font-extrabold">Oakland</div>
            <p className="mt-1 text-[11px] leading-5 text-[#4d746d]">Supplied by the quiz session.</p>
          </div>
          <div className="rounded-2xl border border-[#ead28d] bg-[#fff8df] p-4">
            <div className="flex items-center gap-2 text-[#806a27]"><Trophy className="h-4 w-4" /><span className="text-xs font-bold">Score gained</span></div>
            <div className="mt-2 text-lg font-extrabold">+10 pts</div>
            <p className="mt-1 text-[11px] leading-5 text-[#806e35]">Scoring is owned by the server.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeaderboardView({ final = false }: { final?: boolean }) {
  return (
    <section className="lq-card mt-4 rounded-[28px] p-5" aria-labelledby={final ? "final-leaderboard-heading" : "participant-leaderboard-heading"}>
      <div className="flex items-start justify-between gap-3 border-b border-[var(--lq-line)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--lq-signal-deep)]"><Trophy className="h-4 w-4" /><span className="text-xs font-bold">{final ? "Final leaderboard" : "Live leaderboard"}</span></div>
          <h2 id={final ? "final-leaderboard-heading" : "participant-leaderboard-heading"} className="lq-display mt-1 text-2xl font-extrabold">{final ? "The room has a winner." : "Your place in the room."}</h2>
        </div>
        <StatusBadge tone={final ? "ready" : "neutral"}>{final ? "Complete" : "Live"}</StatusBadge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#fff8df] p-4"><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#806a27]">{final ? "Final rank" : "Current rank"}</div><div className="lq-display mt-1 text-3xl font-extrabold text-[var(--lq-ink)]">#3</div></div>
        <div className="rounded-2xl bg-[#edf8f4] p-4"><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#397f75]">{final ? "Final score" : "Current score"}</div><div className="lq-display mt-1 text-3xl font-extrabold text-[var(--lq-ink)]">95</div></div>
      </div>
      <div className="mt-4 space-y-2">
        {leaderboard.map((row) => {
          const isParticipant = row.name.startsWith("You");
          return (
            <div key={row.name} className={`flex items-center gap-3 rounded-2xl p-3 ${isParticipant ? "border border-[#f3b2a5] bg-[#fff0eb]" : row.rank === 1 ? "bg-[#fff8df]" : "bg-[#fbfaf7]"}`}>
              <span className={`lq-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${row.rank === 1 ? "bg-[var(--lq-sun)] text-[var(--lq-ink)]" : isParticipant ? "bg-[var(--lq-signal)] text-white" : "bg-[#f0ede7] text-[var(--lq-ink-soft)]"}`}>{String(row.rank).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{row.name}</div><div className="mt-0.5 text-[10px] font-semibold text-[var(--lq-ink-soft)]">{row.change}</div></div>
              <div className="text-right"><div className="lq-mono text-xs font-bold">{row.score}</div><div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--lq-ink-soft)]">pts</div></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ResultsView({ navigate }: { navigate: (route: string) => void }) {
  return (
    <section className="mt-4" aria-labelledby="participant-results-heading">
      <div className="rounded-[28px] bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)]">
        <div className="flex items-center justify-between gap-3"><StatusBadge tone="ready">Complete</StatusBadge><CheckCircle2 className="h-5 w-5 text-[var(--lq-sun)]" /></div>
        <h2 id="participant-results-heading" className="lq-display mt-7 text-[36px] font-extrabold leading-[0.96]">You made<br /><span className="text-[var(--lq-sun)]">your mark.</span></h2>
        <p className="mt-4 text-sm leading-6 text-[#c0cad4]">{demoSession.title} is finished. Here are the final results supplied by the session.</p>
        <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#3a4b63] pt-4">
          <div><div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9eacbd]">Final rank</div><div className="lq-mono mt-1 text-2xl font-bold text-[var(--lq-sun)]">#3</div></div>
          <div><div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9eacbd]">Final score</div><div className="lq-mono mt-1 text-2xl font-bold text-[var(--lq-sun)]">95 pts</div></div>
        </div>
      </div>
      <LeaderboardView final />
      <button type="button" onClick={() => navigate("/participant")} className="lq-focus mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--lq-signal)] px-5 py-3.5 text-sm font-bold text-white hover:bg-[var(--lq-signal-deep)]"><Home className="h-4 w-4" /> Return Home</button>
    </section>
  );
}

export function LiveParticipantQuiz({ navigate, connection, onConnectionChange }: LiveParticipantQuizProps) {
  const [view, setView] = useState<ParticipantView>(readPreviewView);
  const [liveState, setLiveState] = useState<ParticipantLiveState>(readPreviewState);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>("oakland");
  const displayConnection = connectionForState(liveState) === "connected" ? connection : connectionForState(liveState);
  const canAnswer = view === "question" && liveState === "running";
  const effectiveView = liveState === "session-finished" ? "results" : view;
  const connectionLabel = liveState === "connecting" ? "Connecting" : liveState === "connection-restored" ? "Connection Restored" : undefined;

  const changeState = (nextState: ParticipantLiveState) => {
    setLiveState(nextState);
    onConnectionChange(connectionForState(nextState));
    if (nextState === "session-finished") setView("results");
  };

  return (
    <div className="px-5 py-6">
      <button type="button" onClick={() => navigate("/participant")} className="lq-focus inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><ArrowLeft className="h-3.5 w-3.5" /> Back to waiting room</button>

      <div className="lq-rise mt-5 flex items-center justify-between gap-3">
        <div>
          <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">Live participant</div>
          <h1 className="lq-display mt-1 text-2xl font-extrabold">{demoSession.title}</h1>
        </div>
        <ConnectionStatus state={displayConnection} label={connectionLabel} />
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--lq-line)] bg-[var(--lq-card)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--lq-ink-soft)]"><Users aria-hidden="true" className="h-4 w-4" /><span className="text-xs font-bold">{demoSession.sessionCode}</span></div>
          <StatusBadge tone={statusTone(liveState)}>{stateLabel(liveState)}</StatusBadge>
        </div>
        <ProgressBar view={effectiveView} />
      </div>

      <RecoveryNotice state={liveState} />

      {effectiveView === "question" && <QuestionView selectedOptionId={selectedOptionId} canAnswer={canAnswer} onSelect={setSelectedOptionId} />}
      {effectiveView === "reveal" && <RevealView selectedOptionId={selectedOptionId} />}
      {effectiveView === "leaderboard" && <LeaderboardView />}
      {effectiveView === "results" && <ResultsView navigate={navigate} />}

      {effectiveView !== "results" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f1eef9] p-4"><div className="flex items-center gap-2 text-[#665b86]"><BarChart3 className="h-4 w-4" /><span className="text-xs font-bold">Your answer status</span></div><div className="mt-2 text-sm font-extrabold">{selectedOptionId ? effectiveView === "question" ? "Selected · not locked locally" : "Submitted" : "Not answered"}</div></div>
          <div className="rounded-2xl bg-[#edf8f4] p-4"><div className="flex items-center gap-2 text-[#397f75]"><Trophy className="h-4 w-4" /><span className="text-xs font-bold">Your standing</span></div><div className="mt-2 text-sm font-extrabold">#3 · 95 pts</div></div>
        </div>
      )}

      <div className="mt-5">
        <PreviewControls view={effectiveView} state={liveState} onViewChange={setView} onStateChange={changeState} />
      </div>

      {effectiveView === "question" && (
        <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-semibold text-[var(--lq-ink-soft)]">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> 00:30 remaining · server timer</span>
          <button type="button" onClick={() => setView("reveal")} className="lq-focus inline-flex items-center gap-1 font-bold text-[var(--lq-signal-deep)] hover:underline">Preview reveal <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {effectiveView === "reveal" && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => setView("leaderboard")} className="lq-focus inline-flex items-center gap-1.5 rounded-xl bg-[var(--lq-signal)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--lq-signal-deep)]">See leaderboard <ArrowRight className="h-4 w-4" /></button>
        </div>
      )}
      {effectiveView === "leaderboard" && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => setView("results")} className="lq-focus inline-flex items-center gap-1.5 rounded-xl bg-[var(--lq-ink)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#243958]">Preview final results <ArrowRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}