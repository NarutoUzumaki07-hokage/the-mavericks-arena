import type { MemberSession } from "@/types/member";

const KEY = "mavericks.session.v1";

export function readSession(): MemberSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MemberSession;
    return parsed?.memberId ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSession(memberId: string) {
  const session: MemberSession = { memberId, signedInAt: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
}

/**
 * Authentication entry point. Today it only checks the member exists in the
 * roster; a PIN/password check can be added here later without touching the UI flow.
 */
export async function authenticateMember(
  memberId: string,
  _credential?: string,
): Promise<MemberSession> {
  return writeSession(memberId);
}
