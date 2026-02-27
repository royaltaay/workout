import { getSupabase, ensureAuth } from "./supabase";
import {
  workoutPlan,
  exerciseNameToId,
  dayById,
} from "./workout-data";

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
// Backward-compat normalizer — converts old sessions at read time
// ---------------------------------------------------------------------------

/** Build a map from legacy day strings to stable day IDs */
const legacyDayToId: Record<string, string> = {};
for (const day of workoutPlan.days) {
  // New ID format — pass through
  legacyDayToId[day.id] = day.id;
  // Old formats: "Day 1", "Day 1 — Push / Anti-Extension", etc.
  legacyDayToId[day.label] = day.id;
  legacyDayToId[day.title] = day.id;
}

/** Resolve a stored day string to a stable day ID */
function resolveDayId(raw: string): string {
  // Direct lookup handles exact matches for id, label, or title
  if (legacyDayToId[raw]) return legacyDayToId[raw];

  // Try matching by day number (e.g. "Day 1 — Push / Anti-Extension" variants)
  const numMatch = raw.match(/Day (\d)/);
  if (numMatch) {
    for (const day of workoutPlan.days) {
      if (day.label === `Day ${numMatch[1]}`) return day.id;
    }
  }

  // Try matching by focus keyword (e.g. old "Monday — Push ..." format)
  const rawLower = raw.toLowerCase();
  for (const day of workoutPlan.days) {
    // Extract focus keyword from title: "Day 1 — Push / Anti-Extension" → "Push"
    const focus = day.title.split("—")[1]?.split("/")[0]?.trim();
    if (focus && rawLower.includes(focus.toLowerCase())) return day.id;
  }

  // Can't resolve — return as-is (won't match any day, but data isn't lost)
  return raw;
}

/** Resolve an exercise key (display name or ID) to a stable exercise ID */
function resolveExerciseId(key: string): string {
  // Already an ID (key exists in exerciseIdToName)?
  // Check if it's a known display name
  return exerciseNameToId[key] ?? key;
}

/** Normalize a session from any historical format to current ID-based format */
function normalizeSession(raw: WorkoutSession): WorkoutSession {
  const dayId = resolveDayId(raw.day);

  const exercises: Record<string, SetEntry[]> = {};
  for (const [key, sets] of Object.entries(raw.exercises)) {
    exercises[resolveExerciseId(key)] = sets;
  }

  return { ...raw, day: dayId, exercises };
}

/** Normalize exercise log keys (for drafts) */
function normalizeLogs(
  logs: Record<string, SetEntry[]>,
): Record<string, SetEntry[]> {
  const normalized: Record<string, SetEntry[]> = {};
  for (const [key, sets] of Object.entries(logs)) {
    normalized[resolveExerciseId(key)] = sets;
  }
  return normalized;
}

// ---------------------------------------------------------------------------
// Draft helpers — localStorage only (ephemeral in-progress data)
// ---------------------------------------------------------------------------

export function getDraft(): Record<string, SetEntry[]> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? normalizeLogs(JSON.parse(raw)) : {};
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
    return sessions.map(normalizeSession).sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

function saveLocalSession(session: WorkoutSession): void {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions: WorkoutSession[] = raw ? JSON.parse(raw) : [];
    sessions.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage full or unavailable
  }
}

function deleteLocalSession(id: string): void {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions: WorkoutSession[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify(sessions.filter((s) => s.id !== id)),
    );
  } catch {
    // localStorage unavailable
  }
}

// ---------------------------------------------------------------------------
// Session persistence — Supabase with localStorage fallback
// ---------------------------------------------------------------------------

export async function getSessions(): Promise<WorkoutSession[]> {
  const local = getLocalSessions();
  const sb = getSupabase();
  if (sb && (await ensureAuth())) {
    const { data, error } = await sb
      .from("workout_sessions")
      .select("id, date, day, duration, exercises")
      .order("date", { ascending: false });

    if (!error && data && data.length > 0) {
      const remote = (data as WorkoutSession[]).map(normalizeSession);
      // Merge: remote wins for duplicates, then add any local-only sessions
      const remoteIds = new Set(remote.map((s) => s.id));
      const localOnly = local.filter((s) => !remoteIds.has(s.id));
      return [...remote, ...localOnly].sort((a, b) => b.date.localeCompare(a.date));
    }
  }
  return local;
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  // Persist locally FIRST so data is never lost
  saveLocalSession(session);

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
}

export async function getLastSession(
  dayId: string,
): Promise<WorkoutSession | null> {
  const day = dayById[dayId];
  const sb = getSupabase();
  if (sb && (await ensureAuth())) {
    // Match new ID format + old title/label formats for backward compat
    const orClauses = [`day.eq.${dayId}`];
    if (day) {
      orClauses.push(`day.ilike.%${day.label}%`);
      // Extract focus keyword from title for matching very old formats
      const focus = day.title.split("—")[1]?.split("/")[0]?.trim();
      if (focus) orClauses.push(`day.ilike.%${focus}%`);
    }

    const { data, error } = await sb
      .from("workout_sessions")
      .select("id, date, day, duration, exercises")
      .or(orClauses.join(","))
      .order("date", { ascending: false })
      .limit(1);

    if (!error && data?.length) {
      const remote = normalizeSession(data[0] as WorkoutSession);
      // Check if local has something newer
      const localMatch = getLocalSessions()
        .filter((s) => s.day === dayId)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      if (localMatch && localMatch.date > remote.date) return localMatch;
      return remote;
    }
  }
  // Fallback to localStorage (already normalized in getLocalSessions)
  const sessions = getLocalSessions().filter((s) => s.day === dayId);
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
