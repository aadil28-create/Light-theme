import "./_group.css";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Info,
  LockKeyhole,
  LoaderCircle,
  MessageCircle,
  Radio,
  RotateCcw,
  UserRound,
  UsersRound,
  WifiOff,
} from "lucide-react";
import { AppShell } from "./_shared/AppShell";
import {
  ConnectionStatus,
  StatusBadge,
  usePreviewRoute,
  type ConnectionState,
} from "./_shared/Primitives";

const DEMO_SESSION_CODE = "HARBOR-47";
const DEMO_QUIZ_TITLE = "Harbor House Quiz";
const DEMO_PARTICIPANT_COUNT = 4;

type ParticipantFlowState =
  | "default"
  | "joining"
  | "invalid"
  | "unavailable"
  | "locked"
  | "full"
  | "connection-error"
  | "pending"
  | "approved"
  | "rejected"
  | "waiting"
  | "reconnecting";

type StateTone = "ready" | "warning" | "danger" | "neutral";

function readSessionParam() {
  const value = new URLSearchParams(window.location.search).get("session");
  return value?.trim().toUpperCase() ?? "";
}

function stateTone(state: ParticipantFlowState): StateTone {
  if (state === "approved" || state === "waiting") return "ready";
  if (state === "invalid" || state === "unavailable" || state === "full" || state === "connection-error" || state === "rejected") return "danger";
  if (state === "locked" || state === "pending" || state === "reconnecting") return "warning";
  return "neutral";
}

function stateLabel(state: ParticipantFlowState) {
  return {
    default: "Default",
    joining: "Joining",
    invalid: "Invalid session code",
    unavailable: "Unavailable session",
    locked: "Lobby locked",
    full: "Session full",
    "connection-error": "Connection error",
    pending: "Approval pending",
    approved: "Approved",
    rejected: "Rejected",
    waiting: "Waiting for host",
    reconnecting: "Reconnecting",
  }[state];
}

function StateNotice({ state }: { state: ParticipantFlowState }) {
  if (state === "default") return null;

  const copy: Record<Exclude<ParticipantFlowState, "default">, { title: string; description: string; icon: typeof Info }> = {
    joining: { title: "Checking the room", description: "This preview is checking the supplied name and session code.", icon: LoaderCircle },
    invalid: { title: "Check those details", description: "Enter your name and a session code before joining the quiz.", icon: CircleAlert },
    unavailable: { title: "That room is unavailable", description: `This preview accepts ${DEMO_SESSION_CODE}. A production backend would validate the supplied code here.`, icon: CircleAlert },
    locked: { title: "The lobby is locked", description: "The host is not accepting new participants right now.", icon: LockKeyhole },
    full: { title: "The room is full", description: "This session has reached its participant limit.", icon: UsersRound },
    "connection-error": { title: "Connection interrupted", description: "We could not reach the room. Check the connection and try again.", icon: WifiOff },
    pending: { title: "Waiting for approval", description: "Your join request is with the host. Keep this screen open.", icon: Clock3 },
    approved: { title: "You are approved", description: "The host has let you into the room. The quiz will begin here.", icon: CheckCircle2 },
    rejected: { title: "The host did not approve this request", description: "You can return to the join form and try another session code.", icon: CircleAlert },
    waiting: { title: "Waiting for the host", description: "You are in the room. The host will start the first question when ready.", icon: Clock3 },
    reconnecting: { title: "Reconnecting to the room", description: "The connection is being restored. Your place in the room is unchanged.", icon: RotateCcw },
  };
  const item = copy[state];
  const Icon = item.icon;
  const iconClass = state === "joining" || state === "reconnecting" ? "animate-spin" : "";

  return (
    <div className={`mt-5 rounded-2xl border p-4 ${stateTone(state) === "danger" ? "border-[#ebbbb9] bg-[#fff5f3] text-[#873d40]" : stateTone(state) === "warning" ? "border-[#ead28d] bg-[#fff8df] text-[#806a27]" : "border-[#a8d7ca] bg-[#edf9f4] text-[#2e7168]"}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
        <div>
          <div className="text-xs font-bold">{item.title}</div>
          <p className="mt-1 text-[11px] leading-5 opacity-85">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewStateControl({
  value,
  onChange,
  options,
}: {
  value: ParticipantFlowState;
  onChange: (value: ParticipantFlowState) => void;
  options: ParticipantFlowState[];
}) {
  return (
    <div className="rounded-2xl border border-[#d8d3c9] bg-[#f0ede6] p-3.5">
      <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#787f8c]">Preview controls</div>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-5 text-[var(--lq-ink-soft)]">Review the local participant state gallery.</p>
        <label className="flex shrink-0 items-center gap-2 rounded-lg border border-[#d8d3c9] bg-[var(--lq-card)] px-2.5 py-2 text-[10px] font-bold text-[var(--lq-ink-soft)]">
          State
          <select
            aria-label="Preview participant state"
            value={value}
            onChange={(event) => onChange(event.target.value as ParticipantFlowState)}
            className="lq-focus max-w-[170px] bg-transparent text-[10px] font-bold text-[var(--lq-ink)] outline-none"
          >
            {options.map((option) => <option key={option} value={option}>{stateLabel(option)}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}

function ParticipantJoinForm({
  name,
  sessionCode,
  prefilled,
  state,
  onNameChange,
  onSessionCodeChange,
  onSubmit,
  onBack,
  additionalField,
}: {
  name: string;
  sessionCode: string;
  prefilled: boolean;
  state: ParticipantFlowState;
  onNameChange: (value: string) => void;
  onSessionCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  additionalField?: ReactNode;
}) {
  const isJoining = state === "joining";
  return (
    <form onSubmit={onSubmit} className="lq-card rounded-[28px] p-5 sm:p-6">
      <div className="flex items-start gap-3 border-b border-[var(--lq-line)] pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--lq-signal)] text-white"><Radio className="h-5 w-5" /></div>
        <div>
          <h2 className="text-sm font-bold">Join the room</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--lq-ink-soft)]">Use the name your host will recognize.</p>
        </div>
      </div>

      {prefilled && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#a8d7ca] bg-[#edf9f4] p-4 text-[#2e7168]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="text-xs font-bold">Joining session {sessionCode}</div>
            <p className="mt-1 text-[11px] leading-5">This code came from a participant link. It is prefilled for you, but the production service will still validate it.</p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <label className="block text-xs font-bold text-[var(--lq-ink)]">
          Participant Name
          <input
            autoComplete="name"
            autoFocus={!prefilled}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="e.g. Maya Chen"
            className="lq-focus mt-2 w-full rounded-xl border border-[var(--lq-line)] bg-[#fbfaf7] px-3.5 py-3 text-sm text-[var(--lq-ink)] outline-none transition-colors placeholder:text-[#9a9eaa] focus:border-[#d98a76] focus:bg-[var(--lq-card)]"
          />
        </label>
        <label className="block text-xs font-bold text-[var(--lq-ink)]">
          Session Code
          <input
            autoCapitalize="characters"
            autoComplete="one-time-code"
            value={sessionCode}
            onChange={(event) => onSessionCodeChange(event.target.value.toUpperCase())}
            placeholder="e.g. HARBOR-47"
            className="lq-focus mt-2 w-full rounded-xl border border-[var(--lq-line)] bg-[#fbfaf7] px-3.5 py-3 text-sm font-bold tracking-[0.08em] text-[var(--lq-ink)] outline-none transition-colors placeholder:text-[#9a9eaa] placeholder:font-normal placeholder:tracking-normal focus:border-[#d98a76] focus:bg-[var(--lq-card)]"
          />
        </label>
        {additionalField}
      </div>

      <StateNotice state={state} />

      <div className="mt-6 flex flex-col gap-2 border-t border-[var(--lq-line)] pt-5">
        <button type="submit" disabled={isJoining} className="lq-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--lq-signal)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--lq-signal-deep)] disabled:cursor-not-allowed disabled:opacity-50">
          {isJoining ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {isJoining ? "Joining…" : "Join Quiz"}
        </button>
        <button type="button" onClick={onBack} className="lq-focus inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--lq-line)] bg-[var(--lq-card)] px-4 py-3 text-sm font-bold text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]"><ArrowLeft className="h-4 w-4" /> Back</button>
      </div>
    </form>
  );
}

function ParticipantLobby({
  name,
  sessionCode,
  state,
  connection,
  onBack,
}: {
  name: string;
  sessionCode: string;
  state: ParticipantFlowState;
  connection: ConnectionState;
  onBack: () => void;
}) {
  const lobbyStatus = state === "rejected" ? "Rejected" : state === "approved" ? "Approved" : state === "locked" ? "Lobby locked" : state === "reconnecting" ? "Reconnecting" : "Approval pending";
  const isRejected = state === "rejected";
  const isReconnecting = state === "reconnecting";
  const isApproved = state === "approved";

  return (
    <div className="px-5 py-6">
      <button type="button" onClick={onBack} className="lq-focus inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><ArrowLeft className="h-3.5 w-3.5" /> Back to join</button>

      <div className="lq-rise mt-5 rounded-[28px] bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)]">
        <div className="flex items-center justify-between gap-3">
          <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#9eacbd]">Participant lobby</div>
          <StatusBadge tone={isRejected ? "danger" : isApproved ? "ready" : "warning"}>{lobbyStatus}</StatusBadge>
        </div>
        <h1 className="lq-display mt-8 text-[36px] font-extrabold leading-[0.96]">You are<br /><span className="text-[var(--lq-sun)]">{isRejected ? "not in yet." : "in the room."}</span></h1>
        <p className="mt-4 text-sm leading-6 text-[#c0cad4]">
          {isRejected ? "The host did not approve this request. You can go back and try another room." : isApproved ? "The host has approved you. Keep this screen open for the first question." : "The host is getting ready. Keep this screen open and watch for the next signal."}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#3a4b63] pt-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9eacbd]">Session</div>
            <div className="lq-mono mt-1 text-sm font-bold text-[var(--lq-sun)]">{sessionCode || "—"}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9eacbd]">You</div>
            <div className="mt-1 truncate text-sm font-bold text-[var(--lq-paper)]">{name || "Participant"}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 lq-card rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[var(--lq-ink-soft)]">Harbor House Quiz</div>
            <div className="mt-1 text-lg font-extrabold">Room status</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff8df] text-[#92721d]"><UsersRound className="h-5 w-5" /></div>
        </div>
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf7] p-3">
            <span className="text-xs font-semibold text-[var(--lq-ink-soft)]">Connection</span>
            <ConnectionStatus state={connection} />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf7] p-3">
            <span className="text-xs font-semibold text-[var(--lq-ink-soft)]">Approval</span>
            <StatusBadge tone={isRejected ? "danger" : isApproved ? "ready" : "warning"}>{lobbyStatus}</StatusBadge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf7] p-3">
            <span className="text-xs font-semibold text-[var(--lq-ink-soft)]">Participants</span>
            <span className="text-xs font-bold">{DEMO_PARTICIPANT_COUNT} in the room</span>
          </div>
        </div>
      </div>

      <div className={`mt-5 rounded-3xl p-5 ${isRejected ? "bg-[#fff0f0]" : isReconnecting ? "bg-[#fff8df]" : "bg-[#edf8f4]"}`}>
        <div className="flex items-start gap-3">
          {isRejected ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ad4447]" /> : isReconnecting ? <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[#8c701f]" /> : <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#397f75]" />}
          <div>
            <div className={`text-xs font-bold ${isRejected ? "text-[#873d40]" : isReconnecting ? "text-[#6f5c20]" : "text-[#2e7168]"}`}>{isRejected ? "You can try again" : isApproved ? "Waiting for the host to start" : "Waiting for host approval"}</div>
            <p className={`mt-1 text-[11px] leading-5 ${isRejected ? "text-[#9f5c5d]" : isReconnecting ? "text-[#806e35]" : "text-[#4d746d]"}`}>{isRejected ? "Return to the join form to enter another code." : isApproved ? "The first question will appear when the host starts the quiz." : "No action is needed while the host reviews the room."}</p>
          </div>
        </div>
      </div>

      {isReconnecting && <div className="mt-5 text-center text-[11px] font-semibold text-[var(--lq-ink-soft)]">Trying to restore your connection…</div>}
    </div>
  );
}

export function ParticipantJoinWorkspace() {
  const [route, navigate] = usePreviewRoute("/participant");
  const [name, setName] = useState("");
  const initialCode = useMemo(() => readSessionParam() || (route === "/participant/lobby" ? DEMO_SESSION_CODE : ""), [route]);
  const [sessionCode, setSessionCode] = useState(initialCode);
  const [state, setState] = useState<ParticipantFlowState>(route === "/participant/lobby" ? "pending" : "default");
  const [connection, setConnection] = useState<ConnectionState>("connected");
  const isLobby = route === "/participant/lobby";

  const previewJoinStates: ParticipantFlowState[] = ["default", "joining", "invalid", "unavailable", "locked", "full", "connection-error", "pending", "rejected"];
  const previewLobbyStates: ParticipantFlowState[] = ["pending", "waiting", "approved", "rejected", "locked", "reconnecting"];
  const appConnection = state === "reconnecting" ? "reconnecting" : state === "connection-error" ? "offline" : connection;

  const updateState = (nextState: ParticipantFlowState) => {
    setState(nextState);
    setConnection(nextState === "reconnecting" ? "reconnecting" : nextState === "connection-error" ? "offline" : "connected");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = sessionCode.trim().toUpperCase();
    setSessionCode(normalizedCode);
    if (!name.trim() || !normalizedCode) {
      updateState("invalid");
      return;
    }
    if (connection === "offline") {
      updateState("connection-error");
      return;
    }
    if (normalizedCode !== DEMO_SESSION_CODE) {
      updateState("unavailable");
      return;
    }
    updateState("joining");
    window.setTimeout(() => {
      updateState("pending");
      navigate("/participant/lobby");
    }, 650);
  };

  const returnToJoin = () => {
    updateState("default");
    navigate("/participant");
  };

  return (
    <AppShell
      participant
      role="participant"
      connection={appConnection}
      compactBrand
      footer={<div className="mx-auto hidden max-w-[430px] border-t border-[var(--lq-line)] bg-[var(--lq-card)] px-5 py-4 text-center text-[10px] font-semibold text-[var(--lq-ink-soft)] sm:block">Signalhouse participant preview · no live networking</div>}
    >
      <div className="border-b border-[var(--lq-line)] bg-[var(--lq-card)] px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">Participant entry</div>
            <div className="mt-1 text-sm font-bold">{isLobby ? DEMO_QUIZ_TITLE : "Join a live quiz"}</div>
          </div>
          <ConnectionStatus state={appConnection} />
        </div>
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-[#edf8f4] px-3.5 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[var(--lq-mint-deep)]"><UserRound className="h-4 w-4" /></div>
          <div><div className="text-xs font-bold">{name || "Guest participant"}</div><div className="text-[10px] text-[var(--lq-ink-soft)]">{sessionCode ? `Session ${sessionCode}` : "Enter a session code to begin"}</div></div>
        </div>
      </div>

      {isLobby ? (
        <>
          <ParticipantLobby name={name} sessionCode={sessionCode} state={state} connection={appConnection} onBack={returnToJoin} />
          <div className="px-5 pb-5">
            <PreviewStateControl value={state} onChange={updateState} options={previewLobbyStates} />
          </div>
        </>
      ) : (
        <div className="px-5 py-6">
          <div className="lq-rise">
            <StatusBadge tone="ready">Public participant page</StatusBadge>
            <h1 className="lq-display mt-5 text-[38px] font-extrabold leading-[0.96]">Find your<br /><span className="text-[var(--lq-signal)]">place in the room.</span></h1>
            <p className="mt-4 max-w-[330px] text-sm leading-6 text-[var(--lq-ink-soft)]">Enter the name your host will see and the code from your invite. If you scanned a QR, the code is already here.</p>
          </div>

          <div className="mt-5">
            <ParticipantJoinForm
              name={name}
              sessionCode={sessionCode}
              prefilled={Boolean(readSessionParam())}
              state={state}
              onNameChange={setName}
              onSessionCodeChange={setSessionCode}
              onSubmit={submit}
              onBack={returnToJoin}
            />
          </div>

          <div className="mt-5 rounded-3xl bg-[#fff8df] p-5">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8c701f]" />
              <div><div className="text-xs font-bold text-[#6f5c20]">Joining by QR</div><p className="mt-1 text-[11px] leading-5 text-[#806e35]">A valid QR can fill the session code for you. The service still checks the room before you enter.</p></div>
            </div>
          </div>

          <div className="mt-5">
            <PreviewStateControl value={state} onChange={updateState} options={previewJoinStates} />
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold text-[var(--lq-ink-soft)]"><MessageCircle className="h-3.5 w-3.5" /> Need a hand? Ask your host.</div>
        </div>
      )}
    </AppShell>
  );
}