import type { Handle } from "@sveltejs/kit";
import { validateSession } from "$lib/server/session";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("medlink_session") ?? null;
  const session = await validateSession(sessionId);
  event.locals.session = session;
  return resolve(event);
};

declare module "@sveltejs/kit" {
  interface Locals {
    session: { id: string; user: { id: string; name: string; email: string; admin: boolean } } | null;
  }
}
