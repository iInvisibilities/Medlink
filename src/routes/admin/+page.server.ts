import { redirect, fail, type ServerLoad, type Actions } from "@sveltejs/kit";
import { getDoctors, getUserById, createClinic, updateClinic, deleteClinic } from "$lib/server/userData";

export const load: ServerLoad = async ({ locals }) => {
  const session = locals.session; if (!session) throw redirect(303, "/login");
  const user = await getUserById(session.user.id);
  if (!user?.admin) throw redirect(303, "/");
  const clinics = await getDoctors();
  const deepSerialize = (value: any): any => {
    if (value == null) return value;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      if (typeof (value as any).toHexString === 'function') return (value as any).toHexString();
      if (typeof (value as any).toString === 'function' && (value.constructor?.name === 'ObjectId')) {
        return (value as any).toString();
      }
      if (Array.isArray(value)) return value.map(deepSerialize);
      const out: any = {};
      for (const [k, v] of Object.entries(value)) out[k] = deepSerialize(v);
      return out;
    }
    return value;
  };
  return { clinics: deepSerialize(clinics), adminUser: { id: String(user._id), email: user.email, name: user.name } };
};

export const actions: Actions = {
  loadClinic: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const user = await getUserById(session.user.id);
    if (!user?.admin) throw redirect(303, "/");
    const form = await request.formData();
    const id = String(form.get("id") || "");
    if (!id) return fail(400, { error: "Missing id" });
    const docs = await getDoctors();
    const clinic = docs.find((d: any) => String(d._id) === id);
    if (!clinic) return fail(404, { error: "Clinic not found" });
    const deepSerialize = (value: any): any => {
      if (value == null) return value;
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object') {
        if (typeof (value as any).toHexString === 'function') return (value as any).toHexString();
        if (typeof (value as any).toString === 'function' && (value.constructor?.name === 'ObjectId')) {
          return (value as any).toString();
        }
        if (Array.isArray(value)) return value.map(deepSerialize);
        const out: any = {};
        for (const [k, v] of Object.entries(value)) out[k] = deepSerialize(v);
        return out;
      }
      return value;
    };
    return { loaded: deepSerialize(clinic) };
  },
  clearLoaded: async ({ locals }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const user = await getUserById(session.user.id);
    if (!user?.admin) throw redirect(303, "/");
    return { loaded: null };
  },
  createClinic: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const user = await getUserById(session.user.id);
    if (!user?.admin) throw redirect(303, "/");
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const specialty = String(form.get("specialty") || "").trim();
    const city = String(form.get("city") || "").trim();
    if (!name || !specialty || !city) return fail(400, { error: "Name, specialty and city are required" });
    // Build open_hours from structured day inputs if provided
    const open_hours: any[] = [];
    for (let day = 0; day <= 6; day++) {
      const enabled = String(form.get(`oh_enabled_${day}`) || "");
      const start = String(form.get(`oh_start_${day}`) || "").trim();
      const end = String(form.get(`oh_end_${day}`) || "").trim();
      if (enabled === "on" && start && end) {
        open_hours.push({ day, start, end });
      }
    }
    const loadedId = String(form.get("id_loaded") || "").trim();
    if (loadedId) {
      await updateClinic(loadedId, { name, specialty, city, open_hours });
      return { success: true, updated: true, id: loadedId };
    } else {
      await createClinic({ name, specialty, city, open_hours });
      return { success: true, created: true };
    }
  },
  updateClinic: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const user = await getUserById(session.user.id);
    if (!user?.admin) throw redirect(303, "/");
    const form = await request.formData();
    const id = String(form.get("id") || "");
    if (!id) return fail(400, { error: "Missing id" });
    const name = form.get("name");
    const specialty = form.get("specialty");
    const city = form.get("city");
    const openHoursRaw = form.get("open_hours");
    const update: any = {};
    if (name !== null) update.name = String(name).trim();
    if (specialty !== null) update.specialty = String(specialty).trim();
    if (city !== null) update.city = String(city).trim();
    if (openHoursRaw !== null) {
      const raw = String(openHoursRaw).trim();
      if (raw) {
        try { update.open_hours = JSON.parse(raw); } catch { return fail(400, { error: "open_hours must be valid JSON" }); }
      } else {
        update.open_hours = [];
      }
    }
    await updateClinic(id, update);
    return { success: true };
  },
  deleteClinic: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const user = await getUserById(session.user.id);
    if (!user?.admin) throw redirect(303, "/");
    const form = await request.formData();
    const id = String(form.get("id") || "");
    if (!id) return fail(400, { error: "Missing id" });
    await deleteClinic(id);
    return { success: true };
  }
};
