import { fail, type Actions } from "@sveltejs/kit";
import { getDb } from "$lib/server/database";

function generateToken() {
  return crypto.randomUUID().replace(/-/g, "") + Math.random().toString(36).slice(2);
}

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    if (!email || !email.includes("@")) {
      return fail(400, { error: "Enter a valid email", values: { email } });
    }
    const db = await getDb();
    const users = db.collection<any>("users");
    const user = await users.findOne({ email });
    if (!user) {
      // Avoid leaking which emails exist
      return { success: "If an account exists, a link has been sent." };
    }

    const resets = db.collection<any>("password_resets");
    // Invalidate previous reset tokens for this user
    await resets.deleteMany({ user_id: user._id as any });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const doc = { _id: token, user_id: user._id, email, expires_at: expiresAt, used: false, created_at: new Date() };
    await resets.insertOne(doc);

    const link = `/reset/${token}`;
    // In real app, send email. For demo, return link.
    return { success: `Use this link within 1 hour: ${link}` };
  }
};
