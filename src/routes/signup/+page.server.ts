import { redirect, fail, type Actions } from "@sveltejs/kit";
import { Argon2id } from "oslo/password";
import { usersCollection } from "$lib/server/database";
import { createSession } from "$lib/server/session";

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    const invite_token = String(form.get("invite_token") || "").trim();

    const errors: Record<string, string> = {};
    if (!name) errors.name = "Name is required";
    if (!email || !email.includes("@")) errors.email = "Valid email is required";
    if (!password || password.length < 8) errors.password = "Password must be at least 8 characters";
    if (confirm !== password) errors.confirm = "Passwords do not match";
    if (Object.keys(errors).length) {
      return fail(400, { errors, values: { name, email } });
    }

    const users = await usersCollection();
    const existing = await users.findOne({ email });
    if (existing) {
      return fail(409, { errors: { email: "Email already registered" }, values: { name, email } });
    }

    const hasher = new Argon2id();
    const hashed = await hasher.hash(password);
    const userId = crypto.randomUUID();

    // If invite token provided, validate clinic invite and mark claimed
    let clinicFlag = false;
    let claimedClinicId: string | null = null;
    if (invite_token) {
      const doctors = await (await usersCollection()).db.collection<any>("doctors").findOne({ invite_token, invite_claimed: false });
      if (!doctors) {
        return fail(400, { errors: { invite_token: "Invalid or already claimed invite token" }, values: { name, email, invite_token } });
      }
      clinicFlag = true;
      claimedClinicId = String(doctors._id);
      await (await usersCollection()).db.collection<any>("doctors").updateOne({ _id: doctors._id }, { $set: { invite_claimed: true, claimed_at: new Date() } });
    }

    await users.insertOne({
      _id: userId,
      name,
      email,
      hashed_password: hashed,
      created_at: new Date(),
      clinic: clinicFlag,
      clinic_id: claimedClinicId || null
    });

    const session = await createSession(userId);
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    cookies.set("medlink_session", session.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge
    });
    throw redirect(303, "/");
  }
};
