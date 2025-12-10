import { json, type RequestHandler } from "@sveltejs/kit";
import { getNotifications } from "$lib/server/userData";

export const GET: RequestHandler = async ({ locals }) => {
  const session = locals.session;
  if (!session) return json({ notifications: [] });

  const list = await getNotifications(session.user.id);
  const notifications = list.map((n: any) => ({
    _id: typeof n._id?.toString === "function" ? n._id.toString() : n._id,
    type: n.type || null,
    appointment_id: n.appointment_id ? String(n.appointment_id) : null,
    appointment_date: n.appointment_date || null,
    doctor_name: n.doctor_name || null,
    patient_name: n.patient_name || null,
    message: n.message || null,
    created_at: n.created_at || null
  }));

  return json({ notifications });
};
