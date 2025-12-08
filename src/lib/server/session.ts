import { randomBytes } from "crypto";
import { getDb } from "./database";

const COOKIE_NAME = "medlink_session";
const DAY_MS = 24 * 60 * 60 * 1000;

export async function createSession(userId: string) {
  const db = await getDb();
  const sessions = db.collection<any>("sessions");
  // Ensure only one active session per user: remove all existing
  await sessions.deleteMany({ user_id: userId as any });
  const id = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * DAY_MS);
  await sessions.insertOne({ _id: id, user_id: userId, expires_at: expiresAt, created_at: new Date() });
  const cookie = `${COOKIE_NAME}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(7 * DAY_MS / 1000)}`;
  return { id, cookie };
}

export async function validateSession(sessionId: string | null) {
  if (!sessionId) return null;
  const db = await getDb();
  const sessions = db.collection<any>("sessions");
  const session = await sessions.findOne({ _id: sessionId });
  if (!session) return null;
  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
    await sessions.deleteOne({ _id: sessionId });
    return null;
  }
  const users = db.collection<any>("users");
  const user = await users.findOne({ _id: session.user_id });
  if (!user) return null;
  return { id: sessionId, user: { id: user._id as string, name: user.name, email: user.email, admin: Boolean((user as any).admin), clinic: Boolean((user as any).clinic) } };
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSessionId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(/;\s*/);
  for (const part of parts) {
    if (part.startsWith(`${COOKIE_NAME}=`)) return part.substring(COOKIE_NAME.length + 1);
  }
  return null;
}
