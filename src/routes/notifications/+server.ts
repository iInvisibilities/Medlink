import { redirect, type RequestHandler } from "@sveltejs/kit";
import { consumeNotifications } from "$lib/server/userData";

export const POST: RequestHandler = async ({ locals, request, url }) => {
  const session = locals.session;
  if (!session) throw redirect(303, "/login");

  const form = await request.formData();
  const singleId = form.get("id");
  let ids: string[] = [];

  if (singleId && typeof singleId === "string") {
    ids = [singleId];
  } else {
    const idsRaw = String(form.get("ids") || "[]");
    try {
      ids = JSON.parse(idsRaw);
    } catch {
      ids = [];
    }
  }

  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !id.trim())) {
    throw redirect(303, url.searchParams.get("redirectTo") || "/");
  }

  await consumeNotifications(ids);

  const back = url.searchParams.get("redirectTo") || request.headers.get("referer") || "/";
  throw redirect(303, back);
};
