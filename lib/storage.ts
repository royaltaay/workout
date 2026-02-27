import { getSupabase, ensureAuth } from "./supabase";

export type SetEntry = {
  weight: string;
  reps: string;
  note?: string;
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

// ---------------------------------------------------------------------------
// Draft helpers — localStorage only (ephemeral in-progress data)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// localStorage fallbacks for sessions (offline / no Supabase configured)
// ---------------------------------------------------------------------------

function getLocalSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions: WorkoutSession[] = raw ? JSON.parse(raw) : [];
    return sessions.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

function saveLocalSession(session: WorkoutSession): void {
  const sessions = getLocalSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function deleteLocalSession(id: string): void {
  const sessions = getLocalSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// ---------------------------------------------------------------------------
// Session persistence — Supabase with localStorage fallback
// ---------------------------------------------------------------------------

export async function getSessions(): Promise<WorkoutSession[]> {
  const sb = getSupabase();
  if (sb && (await ensureAuth())) {
    const { data, error } = await sb
      .from("workout_sessions")
      .select("id, date, day, duration, exercises")
      .order("date", { ascending: false });

    if (!error && data) {
      // If Supabase has sessions, use them; otherwise check localStorage
      // (covers offline-first data or dev seed data)
      return data.length > 0 ? data as WorkoutSession[] : getLocalSessions();
    }
  }
  return getLocalSessions();
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const sb = getSupabase();
  if (sb && (await ensureAuth())) {
    await sb.from("workout_sessions").insert({
      id: session.id,
      date: session.date,
      day: session.day,
      duration: session.duration,
      exercises: session.exercises,
    });
  }
  // Always persist locally too as backup
  saveLocalSession(session);
}

/** Extract the focus type from a day title (e.g. "Push" from "Day 1 — Push / Anti-Extension") */
function dayFocus(day: string): string {
  const after = day.split("—")[1] ?? day;
  const focus = after.split("/")[0]?.trim() ?? day;
  return focus;
}

export async function getLastSession(
  day: string,
): Promise<WorkoutSession | null> {
  const focus = dayFocus(day);
  const sb = getSupabase();
  if (sb && (await ensureAuth())) {
    // Match on focus type so both old ("Monday — Push...") and new ("Day 1 — Push...") sessions match
    const { data, error } = await sb
      .from("workout_sessions")
      .select("id, date, day, duration, exercises")
      .ilike("day", `%${focus}%`)
      .order("date", { ascending: false })
      .limit(1);

    if (!error && data?.length) return data[0] as WorkoutSession;
  }
  // Fallback
  const sessions = getLocalSessions()
    .filter((s) => dayFocus(s.day) === focus)
    .sort((a, b) => b.date.localeCompare(a.date));
  return sessions[0] ?? null;
}

export async function deleteSession(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb && (await ensureAuth())) {
    await sb.from("workout_sessions").delete().eq("id", id);
  }
  deleteLocalSession(id);
}

export async function exportSessions(): Promise<string> {
  const sessions = await getSessions();
  return JSON.stringify(sessions, null, 2);
}
