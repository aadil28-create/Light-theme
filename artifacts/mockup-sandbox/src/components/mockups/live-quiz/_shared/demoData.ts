export const demoSession = {
  title: "Harbor House Quiz",
  sessionCode: "HARBOR-47",
  roomLabel: "Harbor House Quiz",
  hostName: "Maya Chen",
  participantName: "Maya Chen",
  participantInitials: "MC",
  joinUrl: "https://play.signalhouse.example/participant?session=HARBOR-47",
} as const;

export const demoLeaderboard = [
  { rank: 1, name: "Rhea Patel", score: 120, change: "Up 2 places" },
  { rank: 2, name: "Owen Bell", score: 110, change: "Holding steady" },
  { rank: 3, name: `You · ${demoSession.participantName}`, score: 95, change: "Up 1 place" },
  { rank: 4, name: "Sam Ortega", score: 80, change: "Down 1 place" },
] as const;

export type PreviewSessionState = {
  lobbyLocked: boolean;
  quizStarted: boolean;
  approvedParticipants: string[];
};

const previewSessionStorageKey = "signalhouse.preview.session";
const defaultPreviewSessionState: PreviewSessionState = {
  lobbyLocked: false,
  quizStarted: false,
  approvedParticipants: [],
};

export function readPreviewSessionState(): PreviewSessionState {
  if (typeof window === "undefined") return defaultPreviewSessionState;
  try {
    const stored = window.localStorage.getItem(previewSessionStorageKey);
    if (!stored) return defaultPreviewSessionState;
    const parsed = JSON.parse(stored) as Partial<PreviewSessionState>;
    return {
      lobbyLocked: parsed.lobbyLocked === true,
      quizStarted: parsed.quizStarted === true,
      approvedParticipants: Array.isArray(parsed.approvedParticipants)
        ? parsed.approvedParticipants.filter((name): name is string => typeof name === "string")
        : [],
    };
  } catch {
    return defaultPreviewSessionState;
  }
}

export function writePreviewSessionState(
  updates: Partial<PreviewSessionState>,
): PreviewSessionState {
  const next = { ...readPreviewSessionState(), ...updates };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(previewSessionStorageKey, JSON.stringify(next));
    } catch {
      // Preview state is intentionally best-effort and never production state.
    }
  }
  return next;
}

export const hostNav = [
  { label: "Overview", route: "/host/dashboard", meta: "today" },
  { label: "Question sets", route: "/host/templates", meta: "12" },
  { label: "New session", route: "/host/session/new", meta: "+" },
  { label: "Live room", route: "/host/session/harbor-47", meta: "live" },
  { label: "Results", route: "/host/results/harbor-47", meta: "last" },
];

export const recentRooms = [
  { title: "Harbor House Quiz", detail: "Friday, 14 Jun · 32 players", status: "Live now", color: "signal" },
  { title: "The Long Weekend", detail: "Wednesday, 12 Jun · 6 rounds", status: "Draft", color: "lilac" },
  { title: "Summer Signals", detail: "Monday, 10 Jun · 24 players", status: "Finished", color: "mint" },
];

export const rounds = [
  { number: "01", title: "Warm-up lap", detail: "8 questions · 06:00", state: "Ready" },
  { number: "02", title: "Things with wings", detail: "10 questions · 08:00", state: "Queued" },
  { number: "03", title: "The final signal", detail: "5 questions · 05:00", state: "Queued" },
];