import { json, type RequestHandler } from "@sveltejs/kit";
import { getDb } from "$lib/server/database";
import { getUserData } from "$lib/server/userData";

const deepSerialize = (value: any): any => {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if (typeof (value as any).toHexString === "function") return (value as any).toHexString();
    if (typeof (value as any).toString === "function" && (value.constructor?.name === "ObjectId")) {
      return (value as any).toString();
    }
    if (Array.isArray(value)) return value.map(deepSerialize);
    const out: any = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepSerialize(v);
    return out;
  }
  return value;
};

export const GET: RequestHandler = async ({ locals }) => {
  const session = locals.session;
  if (!session) return new Response(null, { status: 401 });

  const db = await getDb();
  let appointments: any[] = [];
  let isClinic = false;

  const userDoc = await db.collection<any>("users").findOne({ _id: session.user.id });
  const clinicId = userDoc?.clinic_id;

  if (clinicId) {
    isClinic = true;
    appointments = await db
      .collection<any>("appointments")
      .find({ doctor_id: clinicId })
      .sort({ date: 1 })
      .toArray();

    // Populate user display names for clinic view
    await Promise.all(
      appointments.map(async (appt) => {
        const user = await db.collection<any>("users").findOne({ _id: appt.user_id });
        appt.user_name = user?.name || "";
        appt.user_phone = user?.phone || "";
      })
    );
  } else {
    const data = await getUserData(session.user.id);
    appointments = data.appointments;
  }

  return json({ appointments: deepSerialize(appointments), isClinic });
};
