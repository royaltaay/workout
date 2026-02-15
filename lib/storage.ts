export type SetEntry = {
  weight: string;
  reps: string;
};

export type WorkoutSession = {
  id: string;
  date: string;
  day: string;
  duration: number;
  exercises: Record<string, SetEntry[]>;
};

const SESSIONS_KEY = "dungym-sessions";
const DRAFT_KEY = "dungym-draft";

export function getSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: WorkoutSession): void {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getLastSession(day: string): WorkoutSession | null {
  const sessions = getSessions()
    .filter((s) => s.day === day)
    .sort((a, b) => b.date.localeCompare(a.date));
  return sessions[0] ?? null;
}

export function getDraft(): Record<string, SetEntry[]> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDraft(data: Record<string, SetEntry[]>): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function exportSessions(): string {
  return JSON.stringify(getSessions(), null, 2);
}
