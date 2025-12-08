import { fail, redirect, type Actions } from "@sveltejs/kit";
import { getDb } from "$lib/server/database";
import { Argon2id } from "oslo/password";

export const actions: Actions = {
  default: async ({ params, request }) => {
    const token = params.token;
    const form = await request.formData();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (!password || password.length < 8 || password !== confirm) {
      return fail(400, { error: "Invalid password or mismatch" });
    }

    const db = await getDb();
    const resets = db.collection<any>("password_resets");
    const reset = await resets.findOne({ _id: token });
    if (!reset || reset.used || new Date(reset.expires_at).getTime() < Date.now()) {
      return fail(400, { error: "Reset link is invalid or expired" });
    }

    const users = db.collection<any>("users");
    const user = await users.findOne({ _id: reset.user_id as any });
    if (!user) {
      return fail(400, { error: "Account not found" });
    }

    const hasher = new Argon2id();
    const hashed = await hasher.hash(password);
    await users.updateOne({ _id: user._id as any }, { $set: { hashed_password: hashed, updated_at: new Date() } });
    await resets.updateOne({ _id: token }, { $set: { used: true, used_at: new Date() } });

    // Invalidate existing sessions for this user
    await db.collection<any>("sessions").deleteMany({ user_id: user._id as any });

    return { success: "You can now log in." };
  }
};
