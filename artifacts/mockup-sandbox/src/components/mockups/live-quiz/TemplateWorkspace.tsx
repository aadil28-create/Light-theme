import "./_group.css";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CirclePlus,
  ClipboardList,
  Clock3,
  FilePenLine,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MoreHorizontal,
  Play,
  Radio,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AppShell } from "./_shared/AppShell";
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
          <button type="button" onClick={() => navigate("/host/session/harbor-47")} className="lq-focus inline-flex items-center gap-1.5 rounded-lg bg-[var(--lq-signal)] px-2.5 py-2 text-xs font-bold text-white hover:bg-[var(--lq-signal-deep)]"><Play className="h-3.5 w-3.5" /> Create session</button>
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
        <Button tone="signal" icon={Play} onClick={() => navigate("/host/session/harbor-47")}>Create session</Button>
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

function HandoffPage({ route, navigate }: { route: string; navigate: (route: string) => void }) {
  const session = route.startsWith("/host/session");
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
  const title = session ? "Set the room in motion." : route.startsWith("/host/results") ? "A room worth remembering." : "Your room, at a glance.";
  const description = session ? "The current session handoff stays visible in the host shell while this workspace focuses on templates and question authoring." : route.startsWith("/host/results") ? "Results remain one click away after a room has finished." : "The dashboard is the calm starting point for the host workflow.";
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-7 sm:px-8 lg:px-10">
      <Breadcrumbs items={[{ label: "Host console", onClick: () => navigate("/host/templates") }, { label: session ? "Current session" : route.startsWith("/host/results") ? "Results" : "Dashboard" }]} />
      <div className="mt-5 flex items-center justify-between gap-3"><BackButton onClick={() => navigate("/host/templates")} /><RouteHint route={route} /></div>
      <PageHeader eyebrow={session ? "Current session" : route.startsWith("/host/results") ? "Results" : "Dashboard"} title={title} description={description}>
        <Button tone="quiet" onClick={() => navigate("/host/templates")}>Back to templates</Button>
      </PageHeader>
      <div className="lq-card relative overflow-hidden rounded-3xl p-7 sm:p-10">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-bl-full bg-[#edf8f4]" />
        <div className="relative max-w-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lq-ink)] text-[var(--lq-sun)]">{session ? <Radio className="h-6 w-6" /> : route.startsWith("/host/results") ? <BarChart3 className="h-6 w-6" /> : <LayoutDashboard className="h-6 w-6" />}</div>
          <h2 className="lq-display mt-7 text-2xl font-extrabold">The template shelf is ready for the next handoff.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--lq-ink-soft)]">This local preview keeps the surrounding host navigation intact without implying live-session behavior, networking, or a scoring engine.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3"><StatusBadge tone={session ? "live" : "neutral"}>{session ? "Room handoff" : "Workspace handoff"}</StatusBadge><Button tone="signal" icon={BookOpen} onClick={() => navigate("/host/templates")}>Open quiz templates</Button></div>
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

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === "harbor-house") ?? templates[0], [templates]);
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