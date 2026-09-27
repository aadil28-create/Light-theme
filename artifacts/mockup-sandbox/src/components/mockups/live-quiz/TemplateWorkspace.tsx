import "./_group.css";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  CirclePlus,
  ClipboardList,
  Clock3,
  Copy,
  FilePenLine,
  LayoutDashboard,
  ListChecks,
  Link2,
  LockKeyhole,
  LogOut,
  MoreHorizontal,
  Play,
  QrCode,
  Radio,
  Save,
  Trash2,
  Users,
  UserCheck,
  UserRound,
  UserX,
  UnlockKeyhole,
  WifiOff,
  X,
} from "lucide-react";
import { AppShell } from "./_shared/AppShell";
import { LiveHostQuiz } from "./LiveHostQuiz";
import {
  BackButton,
  Breadcrumbs,
  ConfirmationDialog,
  EmptyState,
  PageHeader,
  RouteHint,
  StatusBadge,
  usePreviewRoute,
} from "./_shared/Primitives";
import { demoLeaderboard, demoSession, readPreviewSessionState, writePreviewSessionState } from "./_shared/demoData";

type Tone = "ink" | "signal" | "quiet";

type Template = {
  id: string;
  title: string;
  description: string;
  updated: string;
  questionCount: number;
  accent: "signal" | "mint" | "lilac";
};

type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  timeAllowed: number;
  score: number;
  type: "Multiple choice";
};

type TemplateDraft = Pick<Template, "title" | "description">;

type SessionSettings = {
  templateId: string;
  requireApproval: boolean;
  maximumParticipants: string;
};

type SessionPreview = {
  sessionCode: string;
  joinUrl: string;
};

type ParticipantStatus = "Pending" | "Approved" | "Connected" | "Disconnected" | "Rejected" | "Removed";

type Participant = {
  id: string;
  name: string;
  initials: string;
  joined: string;
  status: ParticipantStatus;
};

const initialParticipants: Participant[] = [
  { id: "maya", name: demoSession.participantName, initials: demoSession.participantInitials, joined: "just now", status: "Pending" },
  { id: "owen", name: "Owen Bell", initials: "OB", joined: "2 min ago", status: "Approved" },
  { id: "rhea", name: "Rhea Patel", initials: "RP", joined: "3 min ago", status: "Connected" },
  { id: "sam", name: "Sam Ortega", initials: "SO", joined: "4 min ago", status: "Disconnected" },
  { id: "jules", name: "Jules Hart", initials: "JH", joined: "5 min ago", status: "Rejected" },
  { id: "noah", name: "Noah Williams", initials: "NW", joined: "6 min ago", status: "Removed" },
];

const initialTemplates: Template[] = [
  {
    id: "harbor-house",
    title: "Harbor House Quiz",
    description: "A warm general-knowledge set for a Friday room.",
    updated: "Edited yesterday",
    questionCount: 32,
    accent: "signal",
  },
  {
    id: "long-weekend",
    title: "The Long Weekend",
    description: "Easygoing questions for a slower Sunday gathering.",
    updated: "Edited 12 Jun 2024",
    questionCount: 24,
    accent: "lilac",
  },
  {
    id: "summer-signals",
    title: "Summer Signals",
    description: "Music, places, and small surprises from the season.",
    updated: "Edited 10 Jun 2024",
    questionCount: 40,
    accent: "mint",
  },
];

const initialQuestions: Question[] = [
  {
    id: 1,
    text: "Which city is known as the gateway to the San Francisco Bay?",
    options: ["Oakland", "Sausalito", "Richmond", "Berkeley"],
    correctIndex: 0,
    timeAllowed: 30,
    score: 10,
    type: "Multiple choice",
  },
  {
    id: 2,
    text: "What is the only mammal capable of true sustained flight?",
    options: ["Flying squirrel", "Bat", "Sugar glider", "Colugo"],
    correctIndex: 1,
    timeAllowed: 20,
    score: 10,
    type: "Multiple choice",
  },
  {
    id: 3,
    text: "Which instrument has 88 keys in its standard form?",
    options: ["Accordion", "Organ", "Piano", "Celesta"],
    correctIndex: 2,
    timeAllowed: 25,
    score: 15,
    type: "Multiple choice",
  },
];

const navigation = [
  { label: "Dashboard", route: "/host/dashboard", meta: "today", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Quiz templates", route: "/host/templates", meta: "12", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Current session", route: "/host/session/harbor-47", meta: "live", icon: <Radio className="h-4 w-4" /> },
  { label: "Results", route: "/host/results/harbor-47", meta: "last", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Sign out", route: "/signed-out", icon: <LogOut className="h-4 w-4" /> },
];

function Button({
  children,
  tone = "ink",
  onClick,
  icon: Icon,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  tone?: Tone;
  onClick?: () => void;
  icon?: typeof ArrowRight;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const toneClass =
    tone === "signal"
      ? "bg-[var(--lq-signal)] text-white hover:bg-[var(--lq-signal-deep)]"
      : tone === "quiet"
        ? "border border-[var(--lq-line)] bg-[var(--lq-card)] text-[var(--lq-ink-soft)] hover:bg-[#f0ede7]"
        : "bg-[var(--lq-ink)] text-[var(--lq-paper)] hover:bg-[#243958]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`lq-focus inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${toneClass}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  const shared =
    "lq-focus mt-2 w-full rounded-xl border border-[var(--lq-line)] bg-[#fbfaf7] px-3.5 py-3 text-sm text-[var(--lq-ink)] outline-none transition-colors placeholder:text-[#9a9eaa] focus:border-[#d98a76] focus:bg-[var(--lq-card)]";
  return (
    <label className="block text-xs font-bold text-[var(--lq-ink)]">
      {label}
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${shared} min-h-[126px] resize-y leading-6`}
          placeholder={label === "Description" ? "Give hosts a quick reason to choose this set." : undefined}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={shared}
          placeholder={label === "Title" ? "e.g. Harbor House Quiz" : undefined}
        />
      )}
      {hint && <span className="mt-1.5 block text-[11px] font-medium text-[var(--lq-ink-soft)]">{hint}</span>}
    </label>
  );
}

function WorkspaceNotice({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-2xl bg-[var(--lq-ink)] px-4 py-3 text-sm font-bold text-white shadow-xl">
      <Check className="h-4 w-4 shrink-0 text-[var(--lq-sun)]" />
      <span>{message}</span>
      <button type="button" onClick={onClose} className="lq-focus rounded-md p-1 text-[#b9c4d1] hover:text-white" aria-label="Dismiss notification">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ReviewControl({ empty, onChange }: { empty: boolean; onChange: (empty: boolean) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#d8d3c9] bg-[#f0ede6] p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#787f8c]">Preview controls</div>
        <p className="mt-1 text-xs leading-5 text-[var(--lq-ink-soft)]">Switch the local shelf state to review the empty template experience.</p>
      </div>
      <label className="flex shrink-0 items-center gap-2 rounded-lg border border-[#d8d3c9] bg-[var(--lq-card)] px-2.5 py-2 text-[10px] font-bold text-[var(--lq-ink-soft)]">
        Shelf
        <select
          aria-label="Preview template shelf state"
          value={empty ? "empty" : "available"}
          onChange={(event) => onChange(event.target.value === "empty")}
          className="lq-focus bg-transparent text-[10px] font-bold text-[var(--lq-ink)] outline-none"
        >
          <option value="available">Available templates</option>
          <option value="empty">Empty shelf</option>
        </select>
      </label>
    </div>
  );
}

function TemplateListPage({
  templates,
  empty,
  navigate,
  onDelete,
  onEmptyChange,
}: {
  templates: Template[];
  empty: boolean;
  navigate: (route: string) => void;
  onDelete: (template: Template) => void;
  onEmptyChange: (empty: boolean) => void;
}) {
  const visibleTemplates = empty ? [] : templates;
  return (
    <div className="mx-auto max-w-[1360px] px-5 py-7 sm:px-8 lg:px-10">
      <div className="lq-rise">
        <Breadcrumbs items={[{ label: "Host console" }, { label: "Quiz templates" }]} />
        <PageHeader
          eyebrow="Reusable question sets"
          title="Keep the good questions close."
          description="Build a set once, then bring it into any room when the host team is ready to play."
        >
          <Button tone="signal" icon={CirclePlus} onClick={() => navigate("/host/templates/new")}>New template</Button>
        </PageHeader>
      </div>

      <div className="lq-rise lq-rise-delay-1">
        <ReviewControl empty={empty} onChange={onEmptyChange} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="lq-rise lq-rise-delay-2 lq-card rounded-3xl p-5 sm:p-6" aria-labelledby="template-list-heading">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--lq-line)] pb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Your shelf</p>
              <h2 id="template-list-heading" className="lq-display mt-1 text-2xl font-extrabold">Quiz templates</h2>
            </div>
            <StatusBadge tone={empty ? "neutral" : "ready"}>{empty ? "No templates" : `${templates.length} ready to use`}</StatusBadge>
          </div>

          <div className="mt-5">
            {visibleTemplates.length === 0 ? (
              <EmptyState
                title="Your shelf is waiting"
                description="Create a reusable question set once, then use it for every room that needs a little spark."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button tone="signal" icon={CirclePlus} onClick={() => navigate("/host/templates/new")}>Create first template</Button>
                    {empty && (
                      <Button tone="quiet" onClick={() => onEmptyChange(false)}>Show demo templates</Button>
                    )}
                  </div>
                }
              />
            ) : (
              <div className="space-y-3">
                {visibleTemplates.map((template, index) => (
                  <TemplateRow
                    key={template.id}
                    template={template}
                    index={index}
                    navigate={navigate}
                    onDelete={() => onDelete(template)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="lq-rise lq-rise-delay-3 space-y-4">
          <div className="rounded-3xl bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)] sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(244,203,104,0.16)] text-[var(--lq-sun)]">
              <Play className="h-5 w-5" />
            </div>
            <h2 className="lq-display mt-5 text-2xl font-extrabold">From shelf to room.</h2>
            <p className="mt-2 text-sm leading-6 text-[#b9c4d1]">Open a set, tune the questions, then create a session when your room is ready.</p>
            <button type="button" onClick={() => navigate("/host/session/harbor-47")} className="lq-focus mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--lq-sun)] hover:text-[#ffe9a5]">
              See current session <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="lq-card rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[var(--lq-ink-soft)]">
              <Users className="h-4 w-4" />
              <span className="text-xs font-bold">Host workflow</span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["01", "Shape the set", "Template details"],
                ["02", "Tune each question", "Answer keys + pacing"],
                ["03", "Create the room", "Ready for players"],
              ].map(([number, title, detail]) => (
                <div key={number} className="flex items-start gap-3">
                  <span className="lq-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f1eef9] text-[10px] font-bold text-[#665b86]">{number}</span>
                  <div><div className="text-xs font-bold">{title}</div><div className="mt-0.5 text-[11px] text-[var(--lq-ink-soft)]">{detail}</div></div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--lq-line)] pt-4">
        <button type="button" onClick={() => navigate("/host/dashboard")} className="lq-focus inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]">
          <LayoutDashboard className="h-3.5 w-3.5" /> Back to dashboard
        </button>
        <RouteHint route="/host/templates" />
      </div>
    </div>
  );
}

function TemplateRow({
  template,
  index,
  navigate,
  onDelete,
}: {
  template: Template;
  index: number;
  navigate: (route: string) => void;
  onDelete: () => void;
}) {
  const accentClasses = {
    signal: "bg-[#fff0eb] text-[var(--lq-signal-deep)]",
    lilac: "bg-[#f1eef9] text-[#665b86]",
    mint: "bg-[#edf8f4] text-[var(--lq-mint-deep)]",
  };
  return (
    <article className="group rounded-2xl border border-transparent bg-[#fbfaf7] p-4 transition-colors hover:border-[var(--lq-line)] hover:bg-[#f7f4ee]">
      <div className="flex flex-col gap-4">
        <button type="button" onClick={() => navigate(`/host/templates/${template.id}`)} className="lq-focus flex min-w-0 flex-1 items-start gap-3 text-left">
          <span className={`lq-mono flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${accentClasses[template.accent]}`}>{String(index + 1).padStart(2, "0")}</span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-[var(--lq-ink)]">{template.title}</span>
              {template.id === "harbor-house" && <StatusBadge tone="live">Used tonight</StatusBadge>}
            </span>
            <span className="mt-1 block max-w-xl text-xs leading-5 text-[var(--lq-ink-soft)]">{template.description}</span>
            <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]">
              <span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" /> {template.questionCount} questions</span>
              <span>{template.updated}</span>
            </span>
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--lq-line)] pt-3">
          <button type="button" onClick={() => navigate(`/host/templates/${template.id}`)} className="lq-focus rounded-lg px-2.5 py-2 text-xs font-bold text-[var(--lq-ink-soft)] hover:bg-[#ebe7de] hover:text-[var(--lq-ink)]">Open</button>
          <button type="button" onClick={() => navigate(`/host/templates/${template.id}`)} className="lq-focus inline-flex items-center gap-1.5 rounded-lg border border-[var(--lq-line)] bg-[var(--lq-card)] px-2.5 py-2 text-xs font-bold text-[var(--lq-ink-soft)] hover:border-[#d6a496] hover:text-[var(--lq-signal-deep)]"><FilePenLine className="h-3.5 w-3.5" /> Edit</button>
          <button type="button" onClick={() => navigate(`/host/templates/${template.id}/questions`)} className="lq-focus inline-flex items-center gap-1.5 rounded-lg border border-[var(--lq-line)] bg-[var(--lq-card)] px-2.5 py-2 text-xs font-bold text-[var(--lq-ink-soft)] hover:border-[#d6a496] hover:text-[var(--lq-signal-deep)]"><ListChecks className="h-3.5 w-3.5" /> Manage questions</button>
           <button type="button" onClick={() => navigate("/host/session/new")} className="lq-focus inline-flex items-center gap-1.5 rounded-lg bg-[var(--lq-signal)] px-2.5 py-2 text-xs font-bold text-white hover:bg-[var(--lq-signal-deep)]"><Play className="h-3.5 w-3.5" /> Create session</button>
          <button type="button" onClick={onDelete} className="lq-focus rounded-lg p-2 text-[#ad5c57] hover:bg-[#fff0f0]" aria-label={`Delete ${template.title}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  );
}

function TemplateFormPage({
  template,
  isNew,
  navigate,
  onCreate,
  onUpdate,
}: {
  template?: Template;
  isNew: boolean;
  navigate: (route: string) => void;
  onCreate: (draft: TemplateDraft) => void;
  onUpdate: (id: string, draft: TemplateDraft) => void;
}) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const canSave = title.trim().length > 1;
  const targetQuestions = template ? `/host/templates/${template.id}/questions` : "/host/templates/harbor-house/questions";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    if (isNew) onCreate({ title: title.trim(), description: description.trim() });
    else if (template) onUpdate(template.id, { title: title.trim(), description: description.trim() });
    navigate("/host/templates");
  };

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console" }, { label: "Quiz templates", onClick: () => navigate("/host/templates") }, { label: isNew ? "New template" : template?.title ?? "Edit template" }]} />
      <div className="mt-5 flex items-center justify-between gap-3"><BackButton onClick={() => navigate("/host/templates")} /><RouteHint route={isNew ? "/host/templates/new" : "/host/templates/harbor-house"} /></div>
      <PageHeader eyebrow={isNew ? "New template" : "Template details"} title={isNew ? "Give the set a clear shape." : "Keep the set easy to pick."} description={isNew ? "A short description helps hosts choose the right questions when the room is waiting." : "Edit the name and description that hosts see before they create a session."}>
        {!isNew && template && <StatusBadge tone="ready">{template.questionCount} questions ready</StatusBadge>}
      </PageHeader>

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="lq-card rounded-3xl p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b border-[var(--lq-line)] pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0eb] text-[var(--lq-signal-deep)]"><ClipboardList className="h-5 w-5" /></div>
            <div><h2 className="text-sm font-bold">Template information</h2><p className="mt-1 text-xs text-[var(--lq-ink-soft)]">These details set the tone before anyone sees a question.</p></div>
          </div>
          <div className="space-y-5">
            <TextField label="Title" value={title} onChange={setTitle} hint="Keep it recognizable at a glance." />
            <TextField label="Description" value={description} onChange={setDescription} multiline hint="Optional, but useful when you have more than one set in rotation." />
          </div>
          <div className="mt-7 flex flex-wrap gap-2 border-t border-[var(--lq-line)] pt-5">
            <Button type="submit" tone="signal" icon={Save} disabled={!canSave}>{isNew ? "Save template" : "Save changes"}</Button>
            <Button tone="quiet" onClick={() => navigate("/host/templates")} icon={X}>Cancel</Button>
          </div>
        </section>

        <aside className="space-y-4">
          {!isNew && template ? (
            <div className="rounded-3xl bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)] sm:p-6">
              <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#9eacbd]">Next up</div>
              <h2 className="lq-display mt-3 text-2xl font-extrabold">Tune the questions.</h2>
              <p className="mt-2 text-sm leading-6 text-[#b9c4d1]">Check answer keys, pacing, and points before you open a room.</p>
              <Button tone="signal" icon={ListChecks} onClick={() => navigate(targetQuestions)}>Manage questions</Button>
            </div>
          ) : (
            <div className="lq-card rounded-3xl p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f1eef9] text-[#665b86]"><CirclePlus className="h-5 w-5" /></div>
              <h2 className="lq-display mt-5 text-xl font-extrabold">Start with the room in mind.</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--lq-ink-soft)]">After saving, add the questions that will make the room lean in.</p>
              <button type="button" onClick={() => navigate(targetQuestions)} className="lq-focus mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lq-signal-deep)] hover:underline">Manage questions <ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <div className="lq-card rounded-3xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9399a3]">Quick navigation</div>
            <div className="mt-3 space-y-1">
              <button type="button" onClick={() => navigate("/host/templates")} className="lq-focus flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold text-[var(--lq-ink-soft)] hover:bg-[#f0ede7] hover:text-[var(--lq-ink)]">Back to templates <ArrowRight className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => navigate("/host/dashboard")} className="lq-focus flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold text-[var(--lq-ink-soft)] hover:bg-[#f0ede7] hover:text-[var(--lq-ink)]">Dashboard <LayoutDashboard className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function QuestionManagementPage({
  questions,
  navigate,
  onDelete,
}: {
  questions: Question[];
  navigate: (route: string) => void;
  onDelete: (question: Question) => void;
}) {
  return (
    <div className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console" }, { label: "Quiz templates", onClick: () => navigate("/host/templates") }, { label: "Harbor House Quiz", onClick: () => navigate("/host/templates/harbor-house") }, { label: "Questions" }]} />
      <div className="mt-5 flex items-center justify-between gap-3"><BackButton onClick={() => navigate("/host/templates/harbor-house")} /><RouteHint route="/host/templates/harbor-house/questions" /></div>
      <PageHeader eyebrow="Harbor House Quiz" title="Make every question earn its place." description="Review the sequence, answer keys, pacing, and points before creating a live session. Correct answers are visible to hosts only.">
        <Button tone="signal" icon={CirclePlus} onClick={() => navigate("/host/templates/harbor-house/questions/new")}>Add question</Button>
      </PageHeader>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Questions" value={String(questions.length)} note="in this set" accent="signal" />
        <Metric label="Points" value={String(questions.reduce((sum, question) => sum + question.score, 0))} note="total available" accent="sun" />
        <Metric label="Pace" value={`${Math.round(questions.reduce((sum, question) => sum + question.timeAllowed, 0) / 60)}m`} note="answer time" accent="mint" />
        <Metric label="Type" value="MCQ" note="multiple choice" accent="lilac" />
      </div>

      <section className="lq-card rounded-3xl p-5 sm:p-6" aria-labelledby="question-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--lq-line)] pb-4">
          <div><p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Question sequence</p><h2 id="question-list-heading" className="lq-display mt-1 text-2xl font-extrabold">The set, in order</h2></div>
          <button type="button" onClick={() => navigate("/host/templates/harbor-house")} className="lq-focus text-xs font-bold text-[var(--lq-signal-deep)] hover:underline">Edit template details</button>
        </div>
        {questions.length === 0 ? (
          <div className="mt-5"><EmptyState title="No questions yet" description="Add the first question to give this set a pulse." action={<Button tone="signal" icon={CirclePlus} onClick={() => navigate("/host/templates/harbor-house/questions/new")}>Add first question</Button>} /></div>
        ) : (
          <div className="mt-5 space-y-3">
            {questions.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={index} navigate={navigate} onDelete={() => onDelete(question)} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--lq-line)] pt-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate("/host/templates/harbor-house")} className="lq-focus inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><ArrowLeft className="h-3.5 w-3.5" /> Template</button>
          <button type="button" onClick={() => navigate("/host/dashboard")} className="lq-focus inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><LayoutDashboard className="h-3.5 w-3.5" /> Dashboard</button>
        </div>
         <Button tone="signal" icon={Play} onClick={() => navigate("/host/session/new")}>Create session</Button>
      </div>
    </div>
  );
}

function Metric({ label, value, note, accent }: { label: string; value: string; note: string; accent: "signal" | "sun" | "mint" | "lilac" }) {
  const backgrounds = { signal: "bg-[#fff0eb]", sun: "bg-[#fff8df]", mint: "bg-[#edf8f4]", lilac: "bg-[#f1eef9]" };
  return <div className={`rounded-2xl p-4 ${backgrounds[accent]}`}><div className="text-xs font-semibold text-[var(--lq-ink-soft)]">{label}</div><div className="lq-display mt-2 text-2xl font-extrabold">{value}</div><div className="mt-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]">{note}</div></div>;
}

function QuestionCard({ question, index, navigate, onDelete }: { question: Question; index: number; navigate: (route: string) => void; onDelete: () => void }) {
  return (
    <article className="rounded-2xl border border-[var(--lq-line)] bg-[#fbfaf7] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex items-center gap-3 lg:w-[270px] lg:shrink-0">
          <span className="lq-mono flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--lq-ink)] text-xs font-bold text-[var(--lq-paper)]">{String(index + 1).padStart(2, "0")}</span>
          <div className="min-w-0"><StatusBadge tone="neutral">{question.type}</StatusBadge><div className="mt-2 flex flex-wrap gap-3"><span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]"><Clock3 className="h-3.5 w-3.5" /> {question.timeAllowed}s</span><span className="text-[11px] font-semibold text-[var(--lq-ink-soft)]">{question.score} points</span></div></div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-6 text-[var(--lq-ink)]">{question.text}</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <div key={`${question.id}-${option}`} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${optionIndex === question.correctIndex ? "border-[#a8d7ca] bg-[#edf9f4] text-[#2e7168]" : "border-[var(--lq-line)] bg-[var(--lq-card)] text-[var(--lq-ink-soft)]"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${optionIndex === question.correctIndex ? "bg-[#b7e1d5] text-[#2e7168]" : "bg-[#f0ede7] text-[#7d8490]"}`}>{String.fromCharCode(65 + optionIndex)}</span>
                <span className="min-w-0 flex-1">{option}</span>
                {optionIndex === question.correctIndex && <Check className="h-3.5 w-3.5 shrink-0" aria-label="Correct answer" />}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a877f]">Correct answer shown to host only</p>
        </div>
        <div className="flex items-center gap-1 lg:shrink-0">
          <button type="button" onClick={() => navigate(`/host/templates/harbor-house/questions/${question.id}/edit`)} className="lq-focus inline-flex items-center gap-1.5 rounded-lg border border-[var(--lq-line)] bg-[var(--lq-card)] px-2.5 py-2 text-xs font-bold text-[var(--lq-ink-soft)] hover:border-[#d6a496] hover:text-[var(--lq-signal-deep)]"><FilePenLine className="h-3.5 w-3.5" /> Edit</button>
          <button type="button" onClick={onDelete} className="lq-focus rounded-lg p-2 text-[#ad5c57] hover:bg-[#fff0f0]" aria-label={`Delete question ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
          <button type="button" className="lq-focus rounded-lg p-2 text-[#9aa0a9] hover:bg-[#f0ede7]" aria-label="More question actions"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  );
}

function QuestionEditorPage({
  question,
  isNew,
  navigate,
  onCreate,
  onUpdate,
}: {
  question?: Question;
  isNew: boolean;
  navigate: (route: string) => void;
  onCreate: (question: Omit<Question, "id">) => void;
  onUpdate: (id: number, question: Omit<Question, "id">) => void;
}) {
  const [text, setText] = useState(question?.text ?? "");
  const [options, setOptions] = useState(question?.options ?? ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0);
  const [timeAllowed, setTimeAllowed] = useState(String(question?.timeAllowed ?? 30));
  const [score, setScore] = useState(String(question?.score ?? 10));
  const canSave = text.trim().length > 4 && options.length >= 2 && options.every((option) => option.trim().length > 0);

  const updateOption = (index: number, value: string) => setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? value : option));
  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    setCorrectIndex((current) => current === index ? 0 : current > index ? current - 1 : current);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    const payload = { text: text.trim(), options: options.map((option) => option.trim()), correctIndex, timeAllowed: Number(timeAllowed) || 30, score: Number(score) || 10, type: "Multiple choice" as const };
    if (isNew) onCreate(payload);
    else if (question) onUpdate(question.id, payload);
    navigate("/host/templates/harbor-house/questions");
  };

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console" }, { label: "Quiz templates", onClick: () => navigate("/host/templates") }, { label: "Harbor House Quiz", onClick: () => navigate("/host/templates/harbor-house") }, { label: "Questions", onClick: () => navigate("/host/templates/harbor-house/questions") }, { label: isNew ? "New question" : "Edit question" }]} />
      <div className="mt-5 flex items-center justify-between gap-3"><BackButton onClick={() => navigate("/host/templates/harbor-house/questions")} /><RouteHint route={isNew ? "/host/templates/harbor-house/questions/new" : "/host/templates/harbor-house/questions/1/edit"} /></div>
      <PageHeader eyebrow="Multiple choice · host editor" title={isNew ? "Add a question with a little pull." : "Tune the question and its key."} description="Only the host sees the correct answer during setup. Players will receive the options without the answer key." />

      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="lq-card rounded-3xl p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-[var(--lq-line)] pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--lq-signal)] text-white"><ListChecks className="h-5 w-5" /></div>
            <div><h2 className="text-sm font-bold">Question prompt</h2><p className="mt-1 text-xs text-[var(--lq-ink-soft)]">Write the thing players should answer in the room.</p></div>
          </div>
          <label className="mt-6 block text-xs font-bold text-[var(--lq-ink)]">
            Question text
            <textarea value={text} onChange={(event) => setText(event.target.value)} className="lq-focus mt-2 min-h-[118px] w-full resize-y rounded-xl border border-[var(--lq-line)] bg-[#fbfaf7] px-3.5 py-3 text-sm leading-6 text-[var(--lq-ink)] outline-none transition-colors placeholder:text-[#9a9eaa] focus:border-[#d98a76] focus:bg-[var(--lq-card)]" placeholder="Ask something the room can answer together." />
          </label>

          <div className="mt-7 border-t border-[var(--lq-line)] pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-sm font-bold">Answer options</h2><p className="mt-1 text-xs text-[var(--lq-ink-soft)]">Select the correct option for the host answer key.</p></div>
              <Button tone="quiet" icon={CirclePlus} onClick={() => setOptions((current) => [...current, ""])} disabled={options.length >= 6}>Add option</Button>
            </div>
            <div className="mt-4 space-y-2.5">
              {options.map((option, index) => (
                <div key={`option-${index}`} className={`flex items-center gap-2 rounded-xl border p-2 ${index === correctIndex ? "border-[#a8d7ca] bg-[#edf9f4]" : "border-[var(--lq-line)] bg-[#fbfaf7]"}`}>
                  <input type="radio" name="correct-answer" checked={index === correctIndex} onChange={() => setCorrectIndex(index)} aria-label={`Mark option ${String.fromCharCode(65 + index)} correct`} className="h-4 w-4 accent-[#397f75]" />
                  <span className="lq-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0ede7] text-[10px] font-bold text-[var(--lq-ink-soft)]">{String.fromCharCode(65 + index)}</span>
                  <input value={option} onChange={(event) => updateOption(index, event.target.value)} aria-label={`Answer option ${String.fromCharCode(65 + index)}`} className="lq-focus min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm font-semibold text-[var(--lq-ink)] outline-none placeholder:text-[#9a9eaa]" placeholder={`Option ${String.fromCharCode(65 + index)}`} />
                  {index === correctIndex && <span className="hidden text-[10px] font-bold text-[#2e7168] sm:inline">Correct</span>}
                  <button type="button" onClick={() => removeOption(index)} disabled={options.length <= 2} className="lq-focus rounded-lg p-2 text-[#a5a9b0] hover:bg-[#fff0f0] hover:text-[#ad5c57] disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Remove option ${String.fromCharCode(65 + index)}`}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2 border-t border-[var(--lq-line)] pt-5">
            <Button type="submit" tone="signal" icon={Save} disabled={!canSave}>{isNew ? "Save question" : "Save changes"}</Button>
            <Button tone="quiet" icon={X} onClick={() => navigate("/host/templates/harbor-house/questions")}>Cancel</Button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="lq-card rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[var(--lq-signal-deep)]" /><h2 className="text-sm font-bold">Room settings</h2></div>
            <p className="mt-1 text-xs leading-5 text-[var(--lq-ink-soft)]">Set the moment, not the engine. These values are local preview data.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <label className="text-xs font-bold">Time allowed (seconds)<input type="number" min="5" max="180" value={timeAllowed} onChange={(event) => setTimeAllowed(event.target.value)} className="lq-focus mt-2 w-full rounded-xl border border-[var(--lq-line)] bg-[#fbfaf7] px-3 py-2.5 text-sm outline-none focus:border-[#d98a76]" /></label>
              <label className="text-xs font-bold">Score value<input type="number" min="1" max="100" value={score} onChange={(event) => setScore(event.target.value)} className="lq-focus mt-2 w-full rounded-xl border border-[var(--lq-line)] bg-[#fbfaf7] px-3 py-2.5 text-sm outline-none focus:border-[#d98a76]" /></label>
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#fff8df] p-3 text-[#806a27]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /><p className="text-[11px] font-semibold leading-5">The correct answer is marked for hosts and stays out of the player experience.</p></div>
          </div>
          <div className="rounded-3xl bg-[#f1eef9] p-5 sm:p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#756a97]">Question type</div>
            <div className="mt-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcd7ee] text-[#665b86]"><ListChecks className="h-4 w-4" /></div><div><div className="text-sm font-bold">Multiple choice</div><div className="mt-0.5 text-[11px] text-[#756a97]">Production question format</div></div></div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function CreateSessionPage({
  templates,
  selectedTemplate,
  navigate,
  onCreateSession,
}: {
  templates: Template[];
  selectedTemplate?: Template;
  navigate: (route: string) => void;
  onCreateSession: (settings: SessionSettings) => void;
}) {
  const [templateId, setTemplateId] = useState(selectedTemplate?.id ?? templates[0]?.id ?? "");
  const [requireApproval, setRequireApproval] = useState(true);
  const [maximumParticipants, setMaximumParticipants] = useState("");
  const template = templates.find((item) => item.id === templateId) ?? selectedTemplate ?? templates[0];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!template) return;
    onCreateSession({ templateId: template.id, requireApproval, maximumParticipants: maximumParticipants.trim() });
  };

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console" }, { label: "Current session" }, { label: "Create session" }]} />
      <div className="mt-5 flex items-center justify-between gap-3">
        <BackButton onClick={() => navigate("/host/templates")} />
        <RouteHint route="/host/session/new" />
      </div>
      <PageHeader
        eyebrow="New live room"
        title="Make a room for the set."
        description="Choose what you want to play, set the two guardrails that matter, and open a lobby when the room is ready."
      >
        <StatusBadge tone="ready" icon={CheckCircle2}>Local preview</StatusBadge>
      </PageHeader>

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="lq-card rounded-3xl p-5 sm:p-7">
          <div className="flex items-start gap-3 border-b border-[var(--lq-line)] pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--lq-signal)] text-white"><Radio className="h-5 w-5" /></div>
            <div>
              <h2 className="text-sm font-bold">Choose a quiz template</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--lq-ink-soft)]">The host can still review the room before the first question lands.</p>
            </div>
          </div>

          {templates.length === 0 ? (
            <EmptyState
              title="No quiz sets to play"
              description="Create a template first, then come back to make a live room."
              action={<Button tone="quiet" onClick={() => navigate("/host/templates/new")}>Create a template</Button>}
            />
          ) : (
            <>
              <label className="mt-6 block text-xs font-bold text-[var(--lq-ink)]">
                Quiz template
                <select
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  className="lq-focus mt-2 w-full appearance-none rounded-xl border border-[var(--lq-line)] bg-[#fbfaf7] px-3.5 py-3 text-sm font-semibold text-[var(--lq-ink)] outline-none transition-colors focus:border-[#d98a76] focus:bg-[var(--lq-card)]"
                >
                  {templates.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>

              {template && (
                <div className="mt-4 rounded-2xl border border-[#ead28d] bg-[#fff8df] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#8a7228]">Selected set</div>
                      <h3 className="lq-display mt-2 text-2xl font-extrabold text-[var(--lq-ink)]">{template.title}</h3>
                    </div>
                    <span className="lq-mono rounded-lg bg-[#f4d98e] px-2 py-1 text-[10px] font-bold text-[#725b1f]">{template.questionCount} Qs</span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#71633a]">{template.description}</p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold text-[#806a27]">
                    <span className="inline-flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> {template.questionCount} questions</span>
                    <span>{template.updated}</span>
                  </div>
                </div>
              )}

              <div className="mt-7 border-t border-[var(--lq-line)] pt-6">
                <div className="mb-4">
                  <h2 className="text-sm font-bold">Room guardrails</h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--lq-ink-soft)]">Optional settings for this room only. You can change the lobby lock later.</p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--lq-line)] bg-[#fbfaf7] p-4 transition-colors hover:border-[#d6a496]">
                  <input type="checkbox" checked={requireApproval} onChange={(event) => setRequireApproval(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#ed6d4d]" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">Require Participant Approval</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--lq-ink-soft)]">New arrivals wait in the lobby until you let them in.</span>
                  </span>
                </label>
                <label className="mt-3 block text-xs font-bold">
                  <span className="flex items-center justify-between gap-2"><span>Maximum Participants</span><span className="font-medium text-[var(--lq-ink-soft)]">Optional</span></span>
                  <input
                    type="number"
                    min="2"
                    max="200"
                    value={maximumParticipants}
                    onChange={(event) => setMaximumParticipants(event.target.value)}
                    placeholder="Leave open"
                    className="lq-focus mt-2 w-full rounded-xl border border-[var(--lq-line)] bg-[#fbfaf7] px-3.5 py-3 text-sm text-[var(--lq-ink)] outline-none transition-colors placeholder:text-[#9a9eaa] focus:border-[#d98a76] focus:bg-[var(--lq-card)]"
                  />
                </label>
              </div>

              <div className="mt-7 flex flex-wrap gap-2 border-t border-[var(--lq-line)] pt-5">
                <Button type="submit" tone="signal" icon={Play}>Create Session</Button>
                <Button tone="quiet" icon={X} onClick={() => navigate("/host/templates")}>Cancel</Button>
              </div>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)] sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(244,203,104,0.16)] text-[var(--lq-sun)]"><Users className="h-5 w-5" /></div>
            <h2 className="lq-display mt-5 text-2xl font-extrabold">A room before a crowd.</h2>
            <p className="mt-2 text-sm leading-6 text-[#b9c4d1]">Create the room first. Then share the code, welcome people in, and start when the energy feels right.</p>
            <div className="mt-5 border-t border-[#34435a] pt-4">
              <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#9eacbd]">Next</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-bold"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--lq-sun)] text-[var(--lq-ink)]">2</span> Open the host lobby</div>
            </div>
          </div>
          <div className="lq-card rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[var(--lq-ink-soft)]"><ClipboardList className="h-4 w-4" /><span className="text-xs font-bold">Session summary</span></div>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-4"><dt className="text-[var(--lq-ink-soft)]">Template</dt><dd className="text-right font-bold">{template?.title ?? "None selected"}</dd></div>
              <div className="flex items-start justify-between gap-4"><dt className="text-[var(--lq-ink-soft)]">Questions</dt><dd className="font-bold">{template?.questionCount ?? 0}</dd></div>
              <div className="flex items-start justify-between gap-4"><dt className="text-[var(--lq-ink-soft)]">Approval</dt><dd className="font-bold">{requireApproval ? "Required" : "Open entry"}</dd></div>
            </dl>
          </div>
        </aside>
      </form>
    </div>
  );
}

function SessionQRCode({ url }: { url: string }) {
  return (
    <div className="rounded-2xl border border-[var(--lq-line)] bg-[#fbfaf7] p-4">
      <div className="mx-auto flex aspect-square w-full max-w-[204px] items-center justify-center rounded-lg bg-white p-3" aria-label={`QR code for ${url}`}>
        <QRCodeSVG
          value={url}
          size={180}
          level="M"
          includeMargin
          bgColor="#ffffff"
          fgColor="#15243d"
          className="h-full w-full"
        />
      </div>
      <div className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--lq-ink-soft)]">Scan to join</div>
    </div>
  );
}

function participantTone(status: ParticipantStatus) {
  if (status === "Pending") return "warning" as const;
  if (status === "Rejected") return "danger" as const;
  if (status === "Approved" || status === "Connected") return "ready" as const;
  return "neutral" as const;
}

function HostSessionLobbyPage({
  template,
  settings,
  sessionCode,
  joinUrl,
  participants,
  lobbyLocked,
  quizStarted,
  navigate,
  onApproveParticipant,
  onRejectParticipant,
  onRemoveParticipant,
  onLockLobby,
  onUnlockLobby,
  onStartQuiz,
  onCopy,
}: {
  template?: Template;
  settings: SessionSettings;
  sessionCode: string;
  joinUrl: string;
  participants: Participant[];
  lobbyLocked: boolean;
  quizStarted: boolean;
  navigate: (route: string) => void;
  onApproveParticipant: (id: string) => void;
  onRejectParticipant: (id: string) => void;
  onRemoveParticipant: (id: string) => void;
  onLockLobby: () => void;
  onUnlockLobby: () => void;
  onStartQuiz: () => void;
  onCopy: (message: string) => void;
}) {
  const activeParticipants = participants.filter((participant) => participant.status !== "Removed" && participant.status !== "Rejected");
  const approvalLabel = settings.requireApproval ? "Approval required" : "Open entry";
  const statusLabel = quizStarted ? "Quiz live" : lobbyLocked ? "Lobby locked" : "Lobby open";

  return (
    <div className="mx-auto max-w-[1360px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console" }, { label: "Current session" }]} />
      <div className="mt-5 flex items-center justify-between gap-3">
        <BackButton onClick={() => navigate("/host/templates")} />
        <RouteHint route="/host/session/harbor-47" />
      </div>
      <div className="lq-rise mt-5 flex flex-col gap-5 border-b border-[var(--lq-line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="lq-mono mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">Host session · Harbor 47</div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="lq-display text-3xl font-extrabold tracking-tight text-[var(--lq-ink)] sm:text-4xl">{template?.title ?? "Harbor House Quiz"}</h1>
            <StatusBadge tone={quizStarted ? "live" : lobbyLocked ? "warning" : "ready"}>{statusLabel}</StatusBadge>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--lq-ink-soft)]">The room is staged. Share the code, keep an eye on arrivals, and start when your people are in.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!lobbyLocked ? (
            <Button tone="quiet" icon={LockKeyhole} onClick={onLockLobby} disabled={quizStarted}>Lock Lobby</Button>
          ) : (
            <Button tone="quiet" icon={UnlockKeyhole} onClick={onUnlockLobby} disabled={quizStarted}>Unlock Lobby</Button>
          )}
          <Button tone="signal" icon={Play} onClick={onStartQuiz} disabled={quizStarted}>Start Quiz</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-5">
          <section className="lq-card overflow-hidden rounded-3xl" aria-labelledby="session-code-heading">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="bg-[var(--lq-ink)] p-6 text-[var(--lq-paper)] sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="lq-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#9eacbd]">Share this room</div>
                  <StatusBadge tone={quizStarted ? "live" : "ready"}>{quizStarted ? "In progress" : "Waiting for players"}</StatusBadge>
                </div>
                <h2 id="session-code-heading" className="lq-display mt-8 text-lg font-bold text-[#dbe3ec]">Session code</h2>
                <div className="lq-mono mt-2 whitespace-nowrap text-4xl font-bold tracking-[0.1em] text-[var(--lq-sun)] sm:text-5xl">{sessionCode}</div>
                <p className="mt-4 max-w-md text-sm leading-6 text-[#b9c4d1]">An intentionally fixed demo code for this preview. Nothing is generated or connected behind the scenes.</p>
                <Button tone="signal" icon={Copy} onClick={() => onCopy("Session code copied locally.")}>Copy Code</Button>
              </div>
              <div className="bg-[#fff8df] p-6 sm:p-8">
                <div className="flex items-center gap-2 text-[#806a27]"><Link2 className="h-4 w-4" /><span className="text-xs font-bold">Participant join link</span></div>
                <div className="mt-4 break-all rounded-xl border border-[#ead28d] bg-[#fffdf3] px-3 py-3 text-xs font-bold leading-5 text-[#725b1f]">{joinUrl}</div>
                <Button tone="quiet" icon={Copy} onClick={() => onCopy("Join URL copied locally.")}>Copy Join Link</Button>
              </div>
            </div>
          </section>

          <section className="lq-card rounded-3xl p-5 sm:p-6" aria-labelledby="participant-list-heading">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--lq-line)] pb-4">
              <div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[var(--lq-signal-deep)]" /><p className="text-sm font-semibold text-[var(--lq-ink-soft)]">People in the room</p></div>
                <h2 id="participant-list-heading" className="lq-display mt-1 text-2xl font-extrabold">{activeParticipants.length} participant{activeParticipants.length === 1 ? "" : "s"} active</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={lobbyLocked ? "warning" : "ready"} icon={lobbyLocked ? LockKeyhole : UnlockKeyhole}>{lobbyLocked ? "Lobby locked" : "Lobby open"}</StatusBadge>
                <StatusBadge tone={settings.requireApproval ? "warning" : "ready"}>{approvalLabel}</StatusBadge>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {participants.map((participant) => (
                <div key={participant.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--lq-line)] bg-[#fbfaf7] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${participant.status === "Rejected" || participant.status === "Removed" ? "bg-[#f0ede7] text-[#89909a]" : "bg-[#f1eef9] text-[#665b86]"}`}>{participant.initials}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><span className={`truncate text-sm font-bold ${participant.status === "Removed" ? "text-[var(--lq-ink-soft)] line-through" : "text-[var(--lq-ink)]"}`}>{participant.name}</span><StatusBadge tone={participantTone(participant.status)}>{participant.status}</StatusBadge></div>
                      <div className="mt-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]">Joined {participant.joined}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                    {participant.status === "Pending" && (
                      <>
                        <button type="button" onClick={() => onApproveParticipant(participant.id)} className="lq-focus inline-flex items-center gap-1.5 rounded-lg bg-[#edf9f4] px-2.5 py-2 text-xs font-bold text-[#2e7168] hover:bg-[#dff2ea]"><UserCheck className="h-3.5 w-3.5" /> Approve</button>
                        <button type="button" onClick={() => onRejectParticipant(participant.id)} className="lq-focus inline-flex items-center gap-1.5 rounded-lg bg-[#fff0f0] px-2.5 py-2 text-xs font-bold text-[#ad4447] hover:bg-[#fbe1e1]"><UserX className="h-3.5 w-3.5" /> Reject</button>
                      </>
                    )}
                    {(participant.status === "Approved" || participant.status === "Connected" || participant.status === "Disconnected") && (
                      <button type="button" onClick={() => onRemoveParticipant(participant.id)} className="lq-focus inline-flex items-center gap-1.5 rounded-lg border border-[var(--lq-line)] bg-[var(--lq-card)] px-2.5 py-2 text-xs font-bold text-[var(--lq-ink-soft)] hover:border-[#d6a496] hover:text-[#ad4447]"><UserX className="h-3.5 w-3.5" /> Remove</button>
                    )}
                    {participant.status === "Disconnected" && <WifiOff className="ml-1 h-4 w-4 text-[#9a7d29]" aria-label="Disconnected" />}
                    {participant.status === "Connected" && <CheckCircle2 className="ml-1 h-4 w-4 text-[var(--lq-mint-deep)]" aria-label="Connected" />}
                    {(participant.status === "Rejected" || participant.status === "Removed") && <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9298a1]">No access</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="lq-card rounded-3xl p-5 sm:p-6" aria-labelledby="qr-heading">
            <div className="flex items-center justify-between gap-3">
              <div><div className="flex items-center gap-2"><QrCode className="h-4 w-4 text-[var(--lq-signal-deep)]" /><h2 id="qr-heading" className="text-sm font-bold">Quick join</h2></div><p className="mt-1 text-xs leading-5 text-[var(--lq-ink-soft)]">This QR encodes the complete participant URL.</p></div>
              <StatusBadge tone="neutral">Preview URL</StatusBadge>
            </div>
            <div className="mt-4"><SessionQRCode url={joinUrl} /></div>
          </section>
          <section className="rounded-3xl bg-[#edf8f4] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[#397f75]"><UserRound className="h-4 w-4" /><span className="text-xs font-bold">Room notes</span></div>
            <h2 className="lq-display mt-4 text-xl font-extrabold text-[var(--lq-ink)]">Keep the welcome warm.</h2>
            <p className="mt-2 text-xs leading-5 text-[#4d746d]">Approval is {settings.requireApproval ? "on" : "off"} for this preview. {settings.maximumParticipants ? `The room is capped at ${settings.maximumParticipants} people.` : "There is no participant cap."}</p>
            <button type="button" onClick={() => navigate("/host/session/new")} className="lq-focus mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#2e7168] hover:underline">Adjust session setup <ArrowRight className="h-3.5 w-3.5" /></button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function HostResultsPage({ navigate }: { navigate: (route: string) => void }) {
  return (
    <div className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console", onClick: () => navigate("/host/dashboard") }, { label: "Results" }]} />
      <PageHeader
        eyebrow="Session complete"
        title="A room worth remembering."
        description={`${demoSession.title} has ended. These are supplied preview results, ready for review or a new room.`}
      >
        <Button tone="quiet" icon={LayoutDashboard} onClick={() => navigate("/host/dashboard")}>Back to dashboard</Button>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-[var(--lq-ink)] p-5 text-[var(--lq-paper)]">
          <StatusBadge tone="ready">Session finished</StatusBadge>
          <div className="lq-display mt-6 text-3xl font-extrabold">{demoSession.sessionCode}</div>
          <p className="mt-2 text-xs leading-5 text-[#c0cad4]">Final state supplied by the session service.</p>
        </div>
        <div className="lq-card rounded-3xl p-5">
          <div className="flex items-center gap-2 text-[var(--lq-mint-deep)]"><Users aria-hidden="true" className="h-4 w-4" /><span className="text-xs font-bold">Participants</span></div>
          <div className="lq-display mt-4 text-3xl font-extrabold">32</div>
          <p className="mt-1 text-xs text-[var(--lq-ink-soft)]">players in the finished room</p>
        </div>
        <div className="lq-card rounded-3xl p-5">
          <div className="flex items-center gap-2 text-[#665b86]"><BarChart3 aria-hidden="true" className="h-4 w-4" /><span className="text-xs font-bold">Questions</span></div>
          <div className="lq-display mt-4 text-3xl font-extrabold">03</div>
          <p className="mt-1 text-xs text-[var(--lq-ink-soft)]">supplied in this preview</p>
        </div>
      </section>

      <section className="lq-card mt-5 rounded-3xl p-5 sm:p-6" aria-labelledby="final-results-heading">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--lq-line)] pb-5">
          <div>
            <div className="flex items-center gap-2 text-[var(--lq-signal-deep)]"><CheckCircle2 aria-hidden="true" className="h-4 w-4" /><span className="text-xs font-bold">Final leaderboard</span></div>
            <h2 id="final-results-heading" className="lq-display mt-1 text-2xl font-extrabold">The room has a winner.</h2>
          </div>
          <StatusBadge tone="neutral">Preview results</StatusBadge>
        </div>
        <div className="mt-4 divide-y divide-[var(--lq-line)]">
          {demoLeaderboard.map((row) => (
            <div key={row.rank} className="flex items-center gap-3 py-3.5">
              <span className={`lq-mono flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${row.rank === 1 ? "bg-[#fff8df] text-[#8d701e]" : "bg-[#f0ede7] text-[var(--lq-ink-soft)]"}`}>{String(row.rank).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{row.name}</div>
                <div className="mt-1 text-xs text-[var(--lq-ink-soft)]">{row.change}</div>
              </div>
              <div className="text-right"><div className="lq-display text-xl font-extrabold">{row.score}</div><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--lq-ink-soft)]">points</div></div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--lq-line)] pt-5">
          <Button tone="signal" icon={LayoutDashboard} onClick={() => navigate("/host/dashboard")}>Return to dashboard</Button>
          <Button tone="quiet" icon={CirclePlus} onClick={() => navigate("/host/session/new")}>Create another session</Button>
        </div>
      </section>
    </div>
  );
}

function HostDashboardPage({ navigate }: { navigate: (route: string) => void }) {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10">
      <div className="lq-rise">
        <Breadcrumbs items={[{ label: "Host console" }, { label: "Dashboard" }]} />
        <PageHeader eyebrow="Friday · 14 June 2024" title="Good evening, Maya." description="The room is calm, the questions are queued, and your next move is clear.">
          <Button tone="signal" icon={CirclePlus} onClick={() => navigate("/host/session/new")}>Create session</Button>
        </PageHeader>
      </div>
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--lq-ink)] p-6 text-[var(--lq-paper)] sm:p-7">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-[rgba(244,203,104,0.15)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge tone="live">Live room ready</StatusBadge><RouteHint route="/host/session/harbor-47" /></div>
            <p className="mt-8 text-sm font-semibold text-[#c0cad4]">Current room</p>
            <h2 className="lq-display mt-1 text-3xl font-extrabold sm:text-4xl">{demoSession.title}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#cbd3dd]">Round 01 · Warm-up lap is ready when the room is.</p>
            <div className="mt-7 flex flex-wrap items-center gap-6"><div><div className="lq-display text-3xl font-extrabold">28<span className="text-lg text-[#aeb9c9]">/32</span></div><div className="mt-1 text-xs text-[#c0cad4]">players joined</div></div><div className="h-9 w-px bg-[#4c5b70]" /><div><div className="lq-display text-3xl font-extrabold">06:00</div><div className="mt-1 text-xs text-[#c0cad4]">planned duration</div></div></div>
            <button type="button" onClick={() => navigate("/host/session/harbor-47")} className="lq-focus mt-7 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-[var(--lq-sun)] hover:text-[#ffe9a5]">Open room controls <ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="lq-card rounded-3xl p-6 sm:p-7">
          <p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Tonight at a glance</p>
          <h2 className="lq-display mt-1 text-2xl font-extrabold">Ready when you are</h2>
          <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f1eef9] p-4"><div className="text-xs font-semibold text-[var(--lq-ink-soft)]">Question sets</div><div className="lq-display mt-2 text-2xl font-extrabold">12</div><div className="mt-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]">+2 this month</div></div><div className="rounded-2xl bg-[#edf8f4] p-4"><div className="text-xs font-semibold text-[var(--lq-ink-soft)]">Avg. room size</div><div className="lq-display mt-2 text-2xl font-extrabold">24</div><div className="mt-1 text-[11px] font-semibold text-[var(--lq-ink-soft)]">players / night</div></div></div>
          <button type="button" onClick={() => navigate("/host/templates")} className="lq-focus mt-5 flex min-h-[44px] w-full items-center justify-between border-t border-[var(--lq-line)] pt-4 text-sm font-bold text-[var(--lq-ink-soft)] hover:text-[var(--lq-signal-deep)]"><span>Browse your question sets</span><ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
        </div>
      </section>
      <section className="lq-card mt-5 rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[var(--lq-ink-soft)]">Room rhythm</p><h2 className="lq-display mt-1 text-xl font-extrabold">The next three signals</h2></div><button type="button" onClick={() => navigate("/host/session/harbor-47")} className="lq-focus min-h-[44px] text-xs font-bold text-[var(--lq-signal-deep)]">Manage room</button></div>
        <div className="mt-5 grid gap-2 md:grid-cols-3">{["Warm-up lap", "Things with wings", "The final signal"].map((round, index) => <div key={round} className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3"><span className={`lq-mono flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${index === 0 ? "bg-[var(--lq-signal)] text-white" : "bg-[#f0ede7] text-[var(--lq-ink-soft)]"}`}>{String(index + 1).padStart(2, "0")}</span><div><div className="text-sm font-bold">{round}</div><div className="mt-1 text-xs text-[var(--lq-ink-soft)]">{index === 0 ? "Ready" : "Queued"}</div></div></div>)}</div>
      </section>
    </div>
  );
}

function HandoffPage({ route, navigate }: { route: string; navigate: (route: string) => void }) {
  const signedOut = route === "/signed-out";
  if (signedOut) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-72px)] max-w-[760px] items-center px-5 py-10 sm:px-8">
        <div className="lq-card w-full rounded-3xl p-7 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lq-signal)] text-white shadow-[4px_4px_0_var(--lq-ink)]"><LogOut className="h-6 w-6" /></div>
          <div className="lq-mono mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lq-signal-deep)]">Local preview only</div>
          <h1 className="lq-display mt-3 text-4xl font-extrabold">You are signed out.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--lq-ink-soft)]">No credentials changed and no auth request was made. Return to the host workspace to keep reviewing the template flow.</p>
          <Button tone="signal" icon={ArrowRight} onClick={() => navigate("/host/templates")}>Return to templates</Button>
        </div>
      </div>
    );
  }
  const title = route.startsWith("/host/results") ? "A room worth remembering." : "Your room, at a glance.";
  const description = route.startsWith("/host/results") ? "Results remain one click away after a room has finished." : "The dashboard is the calm starting point for the host workflow.";
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console", onClick: () => navigate("/host/templates") }, { label: route.startsWith("/host/results") ? "Results" : "Dashboard" }]} />
      <div className="mt-5 flex items-center justify-between gap-3"><BackButton onClick={() => navigate("/host/templates")} /><RouteHint route={route} /></div>
      <PageHeader eyebrow={route.startsWith("/host/results") ? "Results" : "Dashboard"} title={title} description={description}>
        <Button tone="quiet" onClick={() => navigate("/host/templates")}>Back to templates</Button>
      </PageHeader>
      <div className="lq-card relative overflow-hidden rounded-3xl p-7 sm:p-10">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-bl-full bg-[#edf8f4]" />
        <div className="relative max-w-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lq-ink)] text-[var(--lq-sun)]">{route.startsWith("/host/results") ? <BarChart3 className="h-6 w-6" /> : <LayoutDashboard className="h-6 w-6" />}</div>
          <h2 className="lq-display mt-7 text-2xl font-extrabold">The template shelf is ready for the next handoff.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--lq-ink-soft)]">This local preview keeps the surrounding host navigation intact without implying live-session behavior, networking, or a scoring engine.</p>
           <div className="mt-7 flex flex-wrap items-center gap-3"><StatusBadge tone="neutral">Workspace handoff</StatusBadge><Button tone="signal" icon={BookOpen} onClick={() => navigate("/host/templates")}>Open quiz templates</Button></div>
        </div>
      </div>
    </div>
  );
}

export function TemplateWorkspace() {
  const [route, navigate] = usePreviewRoute("/host/templates");
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [emptyShelf, setEmptyShelf] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "template" | "question"; value: Template | Question } | null>(null);
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    templateId: "harbor-house",
    requireApproval: true,
    maximumParticipants: "",
  });
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const approvedParticipants = readPreviewSessionState().approvedParticipants;
    return initialParticipants.map((participant) => approvedParticipants.includes(participant.name) ? { ...participant, status: "Approved" } : participant);
  });
  const [lobbyLocked, setLobbyLocked] = useState(() => readPreviewSessionState().lobbyLocked);
  const [quizStarted, setQuizStarted] = useState(() => readPreviewSessionState().quizStarted);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  };

  const onCreateTemplate = (draft: TemplateDraft) => {
    setTemplates((current) => [{ id: `template-${current.length + 1}`, ...draft, updated: "Edited just now", questionCount: 0, accent: "signal" }, ...current]);
    showNotice("Template added to this local preview.");
  };
  const onUpdateTemplate = (id: string, draft: TemplateDraft) => {
    setTemplates((current) => current.map((template) => template.id === id ? { ...template, ...draft, updated: "Edited just now" } : template));
    showNotice("Template details updated locally.");
  };
  const onDeleteTemplate = (id: string) => {
    setTemplates((current) => current.filter((template) => template.id !== id));
    showNotice("Template removed from this local preview.");
  };
  const onCreateQuestion = (question: Omit<Question, "id">) => {
    setQuestions((current) => [...current, { ...question, id: Math.max(0, ...current.map((item) => item.id)) + 1 }]);
    showNotice("Question added to the local sequence.");
  };
  const onUpdateQuestion = (id: number, question: Omit<Question, "id">) => {
    setQuestions((current) => current.map((item) => item.id === id ? { ...question, id } : item));
    showNotice("Question updated locally.");
  };
  const onDeleteQuestion = (id: number) => {
    setQuestions((current) => current.filter((question) => question.id !== id));
    showNotice("Question removed from the local sequence.");
  };
  const onCreateSession = (settings: SessionSettings) => {
    setSessionSettings(settings);
    setParticipants(initialParticipants);
    setLobbyLocked(false);
    setQuizStarted(false);
    writePreviewSessionState({ lobbyLocked: false, quizStarted: false, approvedParticipants: [] });
    showNotice("Session created locally. The host lobby is ready.");
    navigate("/host/session/harbor-47");
  };
  const onApproveParticipant = (id: string) => {
    setParticipants((current) => {
      const participant = current.find((item) => item.id === id);
      if (participant) {
        writePreviewSessionState({ approvedParticipants: [...new Set([...readPreviewSessionState().approvedParticipants, participant.name])] });
      }
      return current.map((item) => item.id === id ? { ...item, status: "Approved" } : item);
    });
    showNotice("Participant approved locally.");
  };
  const onRejectParticipant = (id: string) => {
    setParticipants((current) => {
      const participant = current.find((item) => item.id === id);
      if (participant) {
        writePreviewSessionState({ approvedParticipants: readPreviewSessionState().approvedParticipants.filter((name) => name !== participant.name) });
      }
      return current.map((item) => item.id === id ? { ...item, status: "Rejected" } : item);
    });
    showNotice("Participant rejected locally.");
  };
  const onRemoveParticipant = (id: string) => {
    setParticipants((current) => current.map((participant) => participant.id === id ? { ...participant, status: "Removed" } : participant));
    showNotice("Participant removed locally.");
  };
  const onLockLobby = () => {
    setLobbyLocked(true);
    writePreviewSessionState({ lobbyLocked: true });
    showNotice("Lobby locked locally.");
  };
  const onUnlockLobby = () => {
    setLobbyLocked(false);
    writePreviewSessionState({ lobbyLocked: false });
    showNotice("Lobby unlocked locally.");
  };
  const onStartQuiz = () => {
    setQuizStarted(true);
    setLobbyLocked(true);
    writePreviewSessionState({ quizStarted: true, lobbyLocked: true });
    showNotice("Quiz started in the local preview.");
    navigate("/host/session/harbor-47/quiz");
  };
  const onPauseQuiz = () => {
    showNotice("Pause sent to the local preview.");
  };
  const onResumeQuiz = () => {
    showNotice("Resume sent to the local preview.");
  };
  const onNextQuestion = () => {
    showNotice("Next question sent to the local preview.");
  };
  const onEndQuiz = () => {
    showNotice("End quiz sent to the local preview.");
    navigate("/host/results/harbor-47");
  };

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === "harbor-house") ?? templates[0], [templates]);
  const sessionTemplate = useMemo(() => templates.find((template) => template.id === sessionSettings.templateId) ?? selectedTemplate, [sessionSettings.templateId, selectedTemplate, templates]);
  const liveQuestion = questions[0] ?? initialQuestions[0];
  const liveLeaderboard = demoLeaderboard.map((row) => ({ ...row }));
  const editingQuestionId = route.match(/\/questions\/(\d+)\/edit$/)?.[1];
  const editingQuestion = editingQuestionId ? questions.find((question) => question.id === Number(editingQuestionId)) : undefined;
  const isTemplatesSection = route.startsWith("/host/templates");
  const activeRoute = route === "/signed-out" ? "/signed-out" : isTemplatesSection ? "/host/templates" : route.startsWith("/host/session") ? "/host/session/harbor-47" : route.startsWith("/host/results") ? "/host/results/harbor-47" : "/host/dashboard";

  const content =
    route === "/host/templates" ? (
      <TemplateListPage templates={templates} empty={emptyShelf} navigate={navigate} onEmptyChange={setEmptyShelf} onDelete={(template) => setDeleteTarget({ kind: "template", value: template })} />
    ) : route === "/host/templates/new" ? (
      <TemplateFormPage isNew navigate={navigate} onCreate={onCreateTemplate} onUpdate={onUpdateTemplate} />
    ) : route === "/host/templates/harbor-house" ? (
      <TemplateFormPage template={selectedTemplate} isNew={false} navigate={navigate} onCreate={onCreateTemplate} onUpdate={onUpdateTemplate} />
    ) : route === "/host/templates/harbor-house/questions" ? (
      <QuestionManagementPage questions={questions} navigate={navigate} onDelete={(question) => setDeleteTarget({ kind: "question", value: question })} />
    ) : route === "/host/templates/harbor-house/questions/new" ? (
      <QuestionEditorPage key={route} isNew navigate={navigate} onCreate={onCreateQuestion} onUpdate={onUpdateQuestion} />
     ) : route === "/host/session/new" ? (
       <CreateSessionPage templates={templates} selectedTemplate={selectedTemplate} navigate={navigate} onCreateSession={onCreateSession} />
     ) : route === "/host/session/harbor-47/quiz" ? (
       <LiveHostQuiz
         quizTitle={sessionTemplate?.title ?? "Harbor House Quiz"}
         sessionCode={demoSession.sessionCode}
         totalQuestions={questions.length || 1}
         currentQuestionNumber={1}
         currentQuestion={liveQuestion.text}
         answerOptions={liveQuestion.options}
         correctAnswerIndex={liveQuestion.correctIndex}
         remainingMs={liveQuestion.timeAllowed * 1000}
         timerStatus="running"
         sessionStatus="live"
         questionStatus="accepting answers"
         connectedParticipants={participants.filter((participant) => participant.status === "Connected" || participant.status === "Approved").length}
         answersReceived={2}
         leaderboard={liveLeaderboard}
         navigate={navigate}
         onPauseQuiz={onPauseQuiz}
         onResumeQuiz={onResumeQuiz}
         onNextQuestion={onNextQuestion}
         onEndQuiz={onEndQuiz}
       />
     ) : route === "/host/session/harbor-47" ? (
       <HostSessionLobbyPage
          template={sessionTemplate}
         settings={sessionSettings}
          sessionCode={demoSession.sessionCode}
          joinUrl={demoSession.joinUrl}
         participants={participants}
         lobbyLocked={lobbyLocked}
         quizStarted={quizStarted}
         navigate={navigate}
         onApproveParticipant={onApproveParticipant}
         onRejectParticipant={onRejectParticipant}
         onRemoveParticipant={onRemoveParticipant}
         onLockLobby={onLockLobby}
         onUnlockLobby={onUnlockLobby}
         onStartQuiz={onStartQuiz}
         onCopy={showNotice}
       />
     ) : route === "/host/results/harbor-47" ? (
       <HostResultsPage navigate={navigate} />
     ) : route === "/host" || route === "/host/dashboard" ? (
       <HostDashboardPage navigate={navigate} />
     ) : editingQuestionId ? (
      <QuestionEditorPage key={route} question={editingQuestion} isNew={false} navigate={navigate} onCreate={onCreateQuestion} onUpdate={onUpdateQuestion} />
    ) : (
      <HandoffPage route={route} navigate={navigate} />
    );

  return (
    <AppShell role="host" activeRoute={activeRoute} onNavigate={navigate} navigation={navigation}>
      {content}
      {notice && <WorkspaceNotice message={notice} onClose={() => setNotice(null)} />}
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.kind === "question" ? "Delete this question?" : "Delete this template?"}
        description={deleteTarget?.kind === "question" ? "This local preview action removes the question from the visible sequence." : "This local preview action removes the template from the visible shelf."}
        confirmLabel="Delete locally"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?.kind === "template") onDeleteTemplate((deleteTarget.value as Template).id);
          if (deleteTarget?.kind === "question") onDeleteQuestion((deleteTarget.value as Question).id);
          setDeleteTarget(null);
        }}
      />
    </AppShell>
  );
}