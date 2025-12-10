import type { LayoutServerLoad } from "./$types";
import { getLanguageContent } from "$lib/server/language";
import { getNotifications, createNotification } from "$lib/server/userData";
import { getDb } from "$lib/server/database";

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
  const validLangs = new Set(["en", "fr", "ar"]);

  const fromQuery = url.searchParams.get("lang") || undefined;
  const fromCookie = cookies.get("lang") || undefined;

  let language = fromQuery || fromCookie || "en";
  if (!validLangs.has(language)) language = "en";

  // If language came from the query param, persist it in a cookie
  if (fromQuery && fromQuery !== fromCookie && validLangs.has(fromQuery)) {
    cookies.set("lang", fromQuery, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
  }

  const content = getLanguageContent(language);

  let notifications: any[] = [];
  let clinicAppointmentIds: string[] = [];
  if (locals.session) {
    const pending = await getNotifications(locals.session.user.id);
    notifications = pending.map((n: any) => ({
      _id: typeof n._id?.toString === "function" ? n._id.toString() : n._id,
      type: n.type || null,
      appointment_id: n.appointment_id ? String(n.appointment_id) : null,
      appointment_date: n.appointment_date || null,
      doctor_name: n.doctor_name || null,
      patient_name: n.patient_name || null,
      message: n.message || null,
      created_at: n.created_at || null
    }));

    // Add due-soon notifications (within next 60 minutes) for patient accounts
    if (!locals.session.user.clinic) {
      const db = await getDb();
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
      const upcoming = await db.collection<any>("appointments").find({
        user_id: locals.session.user.id as any,
        date: { $gte: now, $lte: inOneHour }
      }).toArray();

      const existingDue = new Set(
        notifications
          .filter((n) => n.type === "due" && n.appointment_id)
          .map((n) => String(n.appointment_id))
      );

      for (const appt of upcoming) {
        if (!appt?._id || !appt.date) continue;
        if (existingDue.has(String(appt._id))) continue;
        const created = await createNotification(locals.session.user.id, {
          type: "due",
          appointmentId: String(appt._id),
          appointmentDate: new Date(appt.date),
          doctorName: appt.doctor_name || appt.specialty || ""
        });
        if (created) {
          notifications.push({
            _id: typeof created._id?.toString === "function" ? created._id.toString() : created._id,
            type: created.type || null,
            appointment_id: created.appointment_id ? String(created.appointment_id) : null,
            appointment_date: created.appointment_date,
            doctor_name: created.doctor_name || null,
            patient_name: created.patient_name || null,
            message: created.message || null,
            created_at: created.created_at || new Date()
          });
        }
      }
      // Ensure final ordering latest to oldest
      notifications.sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bt - at;
      });
    } else {
      const db = await getDb();
      const userDoc = await db.collection<any>("users").findOne({ _id: locals.session.user.id });
      const clinicId = userDoc?.clinic_id;
      if (clinicId) {
        const ids = await db.collection<any>("appointments").find({ doctor_id: clinicId }).project({ _id: 1 }).toArray();
        clinicAppointmentIds = ids.map((r: any) => (typeof r._id?.toString === "function" ? r._id.toString() : String(r._id)));
      }
    }
  }

  return {
    session: locals.session,
    language,
    content,
    notifications,
    clinicAppointmentIds
  };
};
