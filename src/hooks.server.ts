import type { Handle } from "@sveltejs/kit";
import { validateSession } from "$lib/server/session";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("medlink_session") ?? null;
  const session = await validateSession(sessionId);
  event.locals.session = session;
  const response = await resolve(event);
  response.headers.set('Access-Control-Allow-Origin', '*'); // for testing purposes, will be updated soon.
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
};

declare module "@sveltejs/kit" {
  interface Locals {
    session: { id: string; user: { id: string; name: string; email: string; admin: boolean } } | null;
  }
}
