import type { RequestHandler } from "@sveltejs/kit";
import { clearSessionCookie } from "$lib/server/session";
import { getDb } from "$lib/server/database";

export const POST: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get("medlink_session") ?? null;
  if (sessionId) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ _id: sessionId as any });
    cookies.delete("medlink_session", { path: "/" });
  }
  return new Response(null, {
    status: 303,
    headers: { Location: "/" }
  });
};

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get("medlink_session") ?? null;
  if (sessionId) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ _id: sessionId as any });
    cookies.delete("medlink_session", { path: "/" });
  }
  return new Response(null, {
    status: 303,
    headers: { Location: "/" }
  });
};
