import { redirect, fail, type Actions, type ServerLoad } from "@sveltejs/kit";
import { getDb, usersCollection } from "$lib/server/database";
import { Argon2id } from "oslo/password";
import { createSession } from "$lib/server/session";

export const load: ServerLoad = async ({ locals }) => {
  const session = locals.session;
  if (!session) throw redirect(303, "/login");

  const db = await getDb();
  const user = await db.collection<any>("users").findOne({ _id: session.user.id });
  if (!user) throw redirect(303, "/login");

  return {
    user: {
      id: String(user._id),
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? ""
    }
  };
};

export const actions: Actions = {
  profile: async ({ locals, request }) => {
    const session = locals.session;
    if (!session) throw redirect(303, "/login");

    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();

    const errors: Record<string, string> = {};
    if (!name) errors.name = "Name is required";
    if (!phone) errors.phone = "Phone number is required";

    if (Object.keys(errors).length) {
      return fail(400, { section: "profile", errors, values: { name, phone } });
    }

    const users = await usersCollection();
    await users.updateOne({ _id: session.user.id }, { $set: { name, phone } });

    return { section: "profile", success: true };
  },

  password: async ({ locals, request, cookies }) => {
    const session = locals.session;
    if (!session) throw redirect(303, "/login");

    const form = await request.formData();
    const current_password = String(form.get("current_password") || "");
    const new_password = String(form.get("new_password") || "");
    const confirm_password = String(form.get("confirm_password") || "");

    const errors: Record<string, string> = {};
    if (!current_password) errors.current_password = "Current password is required";
    if (!new_password || new_password.length < 8) errors.new_password = "New password must be at least 8 characters";
    if (confirm_password !== new_password) errors.confirm_password = "Passwords do not match";

    if (Object.keys(errors).length) {
      return fail(400, { section: "password", errors });
    }

    const users = await usersCollection();
    const user = await users.findOne({ _id: session.user.id });
    if (!user) throw redirect(303, "/login");

    const hasher = new Argon2id();
    const valid = await hasher.verify(user.hashed_password, current_password);
    if (!valid) {
      return fail(400, { section: "password", errors: { current_password: "Current password is incorrect" } });
    }

    const hashed = await hasher.hash(new_password);
    await users.updateOne({ _id: session.user.id }, { $set: { hashed_password: hashed } });

    // Rotate session after password change
    const newSession = await createSession(String(user._id));
    const maxAge = 7 * 24 * 60 * 60;
    cookies.set("medlink_session", newSession.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge
    });

    return { section: "password", success: true };
  },

  delete: async ({ locals, request, cookies }) => {
    const session = locals.session;
    if (!session) throw redirect(303, "/login");

    const form = await request.formData();
    const confirm = String(form.get("confirm") || "").trim();

    if (confirm !== "DELETE") {
      return fail(400, { section: "delete", errors: { confirm: "Type DELETE to confirm" } });
    }

    const db = await getDb();
    await db.collection<any>("users").deleteOne({ _id: session.user.id });
    await db.collection<any>("sessions").deleteMany({ user_id: session.user.id });

    cookies.set("medlink_session", "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0
    });

    throw redirect(303, "/");
  }
};
