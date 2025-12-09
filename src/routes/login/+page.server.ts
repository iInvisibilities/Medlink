import { redirect, fail, type Actions } from "@sveltejs/kit";
import { Argon2id } from "oslo/password";
import { usersCollection } from "$lib/server/database";
import { createSession } from "$lib/server/session";

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return fail(400, { error: "Invalid email or password", values: { email } });
    }

    const users = await usersCollection();
    const user = await users.findOne({ email });
    if (!user) {
      return fail(400, { error: "Invalid email or password", values: { email } });
    }

    const hasher = new Argon2id();
    const valid = await hasher.verify(user.hashed_password, password);
    if (!valid) {
      return fail(400, { error: "Invalid email or password", values: { email } });
    }

    const session = await createSession(user._id as string);
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    cookies.set("medlink_session", session.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge
    });
    throw redirect(303, "/dashboard");
  }
};
