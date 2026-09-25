import "./_group.css";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Square,
  Trophy,
  Users,
  Wifi,
} from "lucide-react";
import {
  Breadcrumbs,
  ConnectionStatus,
  RouteHint,
  StatusBadge,
  type ConnectionState,
} from "./_shared/Primitives";

type LiveViewState = "running" | "paused" | "reconnecting" | "restored" | "finished";

type LeaderboardRow = {
  rank: number;
  name: string;
  score: number;
  change?: string;
};

export type LiveHostQuizProps = {
  quizTitle: string;
  sessionCode: string;
  totalQuestions: number;
  currentQuestionNumber: number;
  currentQuestion: string;
  answerOptions: string[];
  correctAnswerIndex: number;
  remainingMs: number;
  timerStatus: string;
  sessionStatus: string;
  questionStatus: string;
  connectedParticipants: number;
  answersReceived: number;
  leaderboard: LeaderboardRow[];
  navigate: (route: string) => void;
  onPauseQuiz: () => void;
  onResumeQuiz: () => void;
  onNextQuestion: () => void;
  onEndQuiz: () => void;
};

function ActionButton({
  children,
  onClick,
  tone = "quiet",
  icon: Icon,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "signal" | "quiet" | "ink";
  icon?: typeof Play;
  disabled?: boolean;
}) {
  const toneClass = tone === "signal"
    ? "bg-[var(--lq-signal)] text-white hover:bg-[var(--lq-signal-deep)]"
    : tone === "ink"
      ? "bg-[var(--lq-ink)] text-[var(--lq-paper)] hover:bg-[#243958]"
      : "border border-[var(--lq-line)] bg-[var(--lq-card)] text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`lq-focus inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${toneClass}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function formatRemainingMs(remainingMs: number) {
  const seconds = Math.max(0, Math.floor(remainingMs / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function getStateLabel(state: LiveViewState, reveal: boolean) {
  if (reveal) return "Reveal results";
  return {
    running: "Running",
    paused: "Paused",
    reconnecting: "Reconnecting",
    restored: "Connection restored",
    finished: "Session finished",
  }[state];
}

function getStatusTone(state: LiveViewState, reveal: boolean) {
  if (reveal || state === "paused") return "warning" as const;
  if (state === "reconnecting") return "warning" as const;
  if (state === "finished") return "neutral" as const;
  return "live" as const;
}

function Leaderboard({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <section className="lq-card rounded-3xl p-5 sm:p-6" aria-labelledby="live-leaderboard-heading">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--lq-line)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--lq-signal-deep)]"><Trophy className="h-4 w-4" /><span className="text-xs font-bold">Live leaderboard</span></div>
          <h2 id="live-leaderboard-heading" className="lq-display mt-1 text-2xl font-extrabold">Who is climbing?</h2>
        </div>
        <StatusBadge tone="neutral">Preview</StatusBadge>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.name} className={`flex items-center gap-3 rounded-2xl p-3 ${row.rank === 1 ? "bg-[#fff8df]" : "bg-[#fbfaf7]"}`}>
            <span className={`lq-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${row.rank === 1 ? "bg-[var(--lq-sun)] text-[var(--lq-ink)]" : "bg-[#f0ede7] text-[var(--lq-ink-soft)]"}`}>{String(row.rank).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold">{row.name}</div>
              {row.change && <div className="mt-0.5 text-[10px] font-semibold text-[var(--lq-ink-soft)]">{row.change}</div>}
            </div>
            <div className="text-right">
              <div className="lq-mono text-xs font-bold">{row.score}</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--lq-ink-soft)]">pts</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LiveHostQuiz({
  quizTitle,
  sessionCode,
  totalQuestions,
  currentQuestionNumber: initialQuestionNumber,
  currentQuestion,
  answerOptions,
  correctAnswerIndex,
  remainingMs,
  timerStatus,
  sessionStatus,
  questionStatus,
  connectedParticipants,
  answersReceived,
  leaderboard,
  navigate,
  onPauseQuiz,
  onResumeQuiz,
  onNextQuestion,
  onEndQuiz,
}: LiveHostQuizProps) {
  const [viewState, setViewState] = useState<LiveViewState>("running");
  const [reveal, setReveal] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(initialQuestionNumber);
  const connection: ConnectionState = viewState === "reconnecting" ? "reconnecting" : "connected";
  const statusLabel = getStateLabel(viewState, reveal);
  const statusTone = getStatusTone(viewState, reveal);
  const isPaused = viewState === "paused";
  const isFinished = viewState === "finished";
  const isReconnecting = viewState === "reconnecting";

  const choosePreviewState = (nextState: LiveViewState | "reveal") => {
    if (nextState === "reveal") {
      setReveal(true);
      setViewState("running");
      return;
    }
    setReveal(false);
    setViewState(nextState);
  };

  const handlePause = () => {
    setViewState("paused");
    onPauseQuiz();
  };

  const handleResume = () => {
    setViewState("running");
    onResumeQuiz();
  };

  const handleNextQuestion = () => {
    if (reveal) {
      setReveal(false);
      setQuestionNumber((current) => Math.min(current + 1, totalQuestions));
    } else {
      setReveal(true);
    }
    onNextQuestion();
  };

  const handleEndQuiz = () => {
    setReveal(false);
    setViewState("finished");
    onEndQuiz();
  };

  return (
    <div className="mx-auto max-w-[1380px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console" }, { label: "Current session", onClick: () => navigate("/host/session/harbor-47") }, { label: "Live quiz" }]} />
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={() => navigate("/host/session/harbor-47")} className="lq-focus inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><ArrowLeft className="h-3.5 w-3.5" /> Back to lobby</button>
        <RouteHint route="/host/session/harbor-47/quiz" />
      </div>

      <div className="lq-rise mt-5 flex flex-col gap-5 border-b border-[var(--lq-line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="lq-mono mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">Live host console · {sessionCode}</div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="lq-display text-3xl font-extrabold tracking-tight text-[var(--lq-ink)] sm:text-4xl">{quizTitle}</h1>
            <StatusBadge tone={statusTone} icon={isReconnecting ? RotateCcw : undefined}>{statusLabel}</StatusBadge>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--lq-ink-soft)]">Keep the room moving from one question to the next. Lifecycle, timer, and scoring values remain server-owned.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPaused || isFinished ? (
            <ActionButton tone="signal" icon={Play} onClick={handleResume} disabled={isFinished}>Start / First Question</ActionButton>
          ) : (
            <ActionButton tone="quiet" icon={Pause} onClick={handlePause} disabled={isReconnecting}>Pause</ActionButton>
          )}
          <ActionButton tone="signal" icon={ChevronRight} onClick={handleNextQuestion} disabled={isFinished || isReconnecting}>Next Question</ActionButton>
          <ActionButton tone="quiet" icon={Square} onClick={handleEndQuiz} disabled={isFinished}>End Quiz</ActionButton>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#d8d3c9] bg-[#f0ede6] p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#787f8c]">Preview controls</div>
            <p className="mt-1 text-[11px] leading-5 text-[var(--lq-ink-soft)]">Review host states without changing authoritative quiz behavior.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-[#d8d3c9] bg-[var(--lq-card)] px-2.5 py-2 text-[10px] font-bold text-[var(--lq-ink-soft)]">
              State
              <select
                aria-label="Preview live quiz state"
                value={reveal ? "reveal" : viewState}
                onChange={(event) => choosePreviewState(event.target.value as LiveViewState | "reveal")}
                className="lq-focus bg-transparent text-[10px] font-bold text-[var(--lq-ink)] outline-none"
              >
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="reconnecting">Reconnecting</option>
                <option value="restored">Connection restored</option>
                <option value="reveal">Reveal results</option>
                <option value="finished">Session finished</option>
              </select>
            </label>
            <ConnectionStatus state={connection} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <section className="lq-card overflow-hidden rounded-3xl" aria-labelledby="live-question-heading">
            <div className="flex flex-col gap-5 bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)] sm:p-7 lg:flex-row lg:items-stretch lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={statusTone}>{reveal ? "Between questions" : isFinished ? "Session finished" : questionStatus}</StatusBadge>
                  <span className="lq-mono text-[10px] font-bold text-[#a9b6c4]">Question {questionNumber} / {totalQuestions}</span>
                </div>
                <h2 id="live-question-heading" className="lq-display mt-7 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">{reveal ? "What the room just answered." : currentQuestion}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#b9c4d1]">{reveal ? "Review the answer key and standings before sending the room onward." : "Answer options are visible to the host so the room can be checked at a glance."}</p>
              </div>
              <div className="flex shrink-0 flex-row items-center justify-between gap-4 rounded-2xl bg-[#263852] p-4 lg:w-[180px] lg:flex-col lg:items-start lg:justify-center">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a9b6c4]"><Clock3 className="h-3.5 w-3.5" /> Timer</div>
                  <div className="lq-mono mt-2 text-3xl font-bold text-[var(--lq-sun)]">{formatRemainingMs(remainingMs)}</div>
                </div>
                <div className="text-right lg:text-left">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a9b6c4]">Server status</div>
                  <div className="mt-1 text-xs font-bold text-[var(--lq-paper)]">{isPaused ? "paused" : timerStatus}</div>
                </div>
              </div>
            </div>

            {!reveal && (
              <div className="p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div><div className="text-xs font-semibold text-[var(--lq-ink-soft)]">Answer options</div><div className="mt-1 text-sm font-bold">Host answer key</div></div>
                  <StatusBadge tone="neutral">Host only</StatusBadge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {answerOptions.map((option, index) => (
                    <div key={option} className="flex items-center gap-3 rounded-2xl border border-[var(--lq-line)] bg-[#fbfaf7] p-3.5">
                      <span className="lq-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f0ede7] text-[10px] font-bold text-[var(--lq-ink-soft)]">{String.fromCharCode(65 + index)}</span>
                      <span className="min-w-0 flex-1 text-sm font-semibold">{option}</span>
                      {index === correctAnswerIndex && <span className="flex items-center gap-1 text-[10px] font-bold text-[#2e7168]"><Check className="h-3.5 w-3.5" /> Key</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reveal && (
              <div className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr] sm:p-7">
                <div className="rounded-2xl border border-[#a8d7ca] bg-[#edf9f4] p-4">
                  <div className="flex items-center gap-2 text-[#2e7168]"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-bold">Correct answer</span></div>
                  <div className="mt-3 text-lg font-extrabold">{answerOptions[correctAnswerIndex]}</div>
                  <p className="mt-1 text-[11px] leading-5 text-[#4d746d]">Answer key supplied by the quiz session.</p>
                </div>
                <div className="rounded-2xl border border-[var(--lq-line)] bg-[#fbfaf7] p-4">
                  <div className="flex items-center gap-2 text-[var(--lq-ink-soft)]"><BarChart3 className="h-4 w-4" /><span className="text-xs font-bold">Question summary</span></div>
                  <div className="mt-3 text-lg font-extrabold">{answersReceived} answers received</div>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--lq-ink-soft)]">The server supplies response totals and scoring.</p>
                </div>
              </div>
            )}
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#edf8f4] p-4"><div className="flex items-center gap-2 text-[#397f75]"><Users className="h-4 w-4" /><span className="text-xs font-bold">Connected</span></div><div className="lq-display mt-2 text-3xl font-extrabold">{connectedParticipants}</div><div className="mt-1 text-[10px] font-semibold text-[#4d746d]">participants</div></div>
            <div className="rounded-2xl bg-[#fff8df] p-4"><div className="flex items-center gap-2 text-[#806a27]"><BarChart3 className="h-4 w-4" /><span className="text-xs font-bold">Answers in</span></div><div className="lq-display mt-2 text-3xl font-extrabold">{answersReceived}</div><div className="mt-1 text-[10px] font-semibold text-[#806e35]">of {connectedParticipants} connected</div></div>
            <div className="rounded-2xl bg-[#f1eef9] p-4"><div className="flex items-center gap-2 text-[#665b86]"><Radio className="h-4 w-4" /><span className="text-xs font-bold">Session</span></div><div className="mt-2 truncate text-lg font-extrabold">{sessionStatus}</div><div className="mt-1 text-[10px] font-semibold text-[#756a97]">server status</div></div>
          </div>

          {isReconnecting && <div className="flex items-start gap-3 rounded-2xl border border-[#ead28d] bg-[#fff8df] p-4 text-[#806a27]"><RotateCcw className="mt-0.5 h-4 w-4 shrink-0 animate-spin" /><div><div className="text-xs font-bold">Connection interrupted</div><p className="mt-1 text-[11px] leading-5">The console is waiting for the authoritative session state to return.</p></div></div>}
          {viewState === "restored" && <div className="flex items-start gap-3 rounded-2xl border border-[#a8d7ca] bg-[#edf9f4] p-4 text-[#2e7168]"><Wifi className="mt-0.5 h-4 w-4 shrink-0" /><div><div className="text-xs font-bold">Connection restored</div><p className="mt-1 text-[11px] leading-5">The host console is receiving session updates again.</p></div></div>}
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)] sm:p-6">
            <div className="flex items-center gap-2 text-[#b9c4d1]"><Radio className="h-4 w-4 text-[var(--lq-sun)]" /><span className="text-xs font-bold">Live status information</span></div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-[#34435a] pb-3"><span className="text-xs text-[#b9c4d1]">Session code</span><span className="lq-mono text-xs font-bold text-[var(--lq-sun)]">{sessionCode}</span></div>
              <div className="flex items-center justify-between gap-3 border-b border-[#34435a] pb-3"><span className="text-xs text-[#b9c4d1]">Session status</span><span className="text-xs font-bold">{sessionStatus}</span></div>
              <div className="flex items-center justify-between gap-3 border-b border-[#34435a] pb-3"><span className="text-xs text-[#b9c4d1]">Question status</span><span className="text-xs font-bold">{reveal ? "reveal" : questionStatus}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-[#b9c4d1]">Connection</span><ConnectionStatus state={connection} /></div>
            </div>
          </div>
          <Leaderboard rows={leaderboard} />
        </aside>
      </div>
    </div>
  );
}