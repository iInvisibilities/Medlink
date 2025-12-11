import { redirect, fail, type ServerLoad, type Actions } from "@sveltejs/kit";
import { getUserData, addAppointment, getDoctors, getDoctorById, createNotification, BILLING_FREE_THRESHOLD, BILLING_RATE } from "$lib/server/userData";
import { getDb } from "$lib/server/database";
import { ObjectId } from "mongodb";

const startOfUtcMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

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

const computeBilling = (userDoc: any) => {
  if (!userDoc?.clinic_id) return null;

  const billingState = userDoc?.billing || {};
  const usedAppointments = billingState.usedAppointments ?? 0;
  const freeThreshold = BILLING_FREE_THRESHOLD;
  const ratePerAppointment = BILLING_RATE;

  const now = new Date();
  const monthStart = startOfUtcMonth(now);

  const freeUsed = Math.min(usedAppointments, freeThreshold);
  const freeRemaining = Math.max(freeThreshold - usedAppointments, 0);

  let paidStartDate: Date | null = billingState.paidStartDate ? new Date(billingState.paidStartDate) : null;
  const hasPaid = usedAppointments > freeThreshold;
  if (!paidStartDate && hasPaid) paidStartDate = now;

  let currentPeriodStart: Date | null = billingState.currentPeriodStart ? new Date(billingState.currentPeriodStart) : null;
  let currentPeriodPaidAppointments: number = billingState.currentPeriodCount ?? 0;
  let needsBillingPersist = false;

  if (paidStartDate) {
    const mismatch = !currentPeriodStart
      || currentPeriodStart.getUTCFullYear() !== monthStart.getUTCFullYear()
      || currentPeriodStart.getUTCMonth() !== monthStart.getUTCMonth();
    if (mismatch) {
      currentPeriodStart = monthStart;
      currentPeriodPaidAppointments = 0;
      needsBillingPersist = true;
    }
  } else {
    currentPeriodStart = null;
    currentPeriodPaidAppointments = 0;
  }

  const currentPeriodAmountDue = paidStartDate ? currentPeriodPaidAppointments * ratePerAppointment : 0;
  const lifetimePaidAppointments = Math.max(usedAppointments - freeThreshold, 0);

  return {
    data: {
      freeThreshold,
      ratePerAppointment,
      totalAppointments: usedAppointments,
      freeUsed,
      freeRemaining,
      paidStartDate: paidStartDate ? paidStartDate.toISOString() : null,
      currentPeriodStart: currentPeriodStart ? currentPeriodStart.toISOString() : null,
      currentPeriodPaidAppointments,
      currentPeriodAmountDue,
      lifetimePaidAppointments
    },
    needsBillingPersist,
    persist: {
      currentPeriodStart,
      currentPeriodPaidAppointments,
      paidStartDate
    }
  };
};

export const load: ServerLoad = async ({ locals }) => {
  const session = locals.session;
  if (!session) throw redirect(303, "/login");
  const db = await getDb();
  const userDoc = await db.collection<any>("users").findOne({ _id: session.user.id });
  // Branch: clinic vs non-clinic
  let appointments: any[] = [];
  const clinicId = userDoc?.clinic_id;
  if (clinicId) {
    appointments = await db.collection<any>("appointments").find({ doctor_id: clinicId }).sort({ date: 1 }).toArray();
    await Promise.all(
      appointments.map(async (appt) => {
        const user = await db.collection<any>("users").findOne({ _id: appt.user_id });
        appt.user_name = user?.name || "";
        appt.user_phone = user?.phone || "";
        return appt;
      })
    );
  } else {
    const data = await getUserData(session.user.id);
    appointments = data.appointments;
  }
  const doctors = await getDoctors();

  // Billing metrics (clinic accounts only)
  let billing: any = null;
  if (clinicId) {
    const billingResult = computeBilling(userDoc);
    if (billingResult) {
      billing = billingResult.data;
      if (billingResult.needsBillingPersist) {
        await db.collection<any>("users").updateOne(
          { _id: session.user.id },
          {
            $set: {
              "billing.currentPeriodStart": billingResult.persist.currentPeriodStart,
              "billing.currentPeriodCount": billingResult.persist.currentPeriodPaidAppointments,
              "billing.paidStartDate": billingResult.persist.paidStartDate
            }
          }
        );
      }
    }
  }
  const serializeDoctors = deepSerialize(doctors);
  const serializeAppointments = deepSerialize(appointments);
  const serializeBilling = deepSerialize(billing);
  return { user: session.user, appointments: serializeAppointments, doctors: serializeDoctors, billing: serializeBilling };
};

export const actions: Actions = {
  availableDays: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const form = await request.formData();
    const doctor_id = String(form.get("doctor_id") || "");
    if (!doctor_id) return fail(400, { error: "Select a clinic first" });
    const doctor = await getDoctorById(doctor_id);
    if (!doctor) return fail(404, { error: "Clinic not found" });
    const db = await getDb();
    const days: string[] = [];
    const now = new Date();
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = 0; i < 14; i++) {
      const dayDate = new Date(startDay); dayDate.setDate(startDay.getDate() + i);
      const weekday = dayDate.getDay();
      const dayHours = (doctor.open_hours || []).find((h: any) => Number(h.day) === weekday);
      if (!dayHours) continue; // closed
      const [startH, startM] = String(dayHours.start).split(":").map(Number);
      const [endH, endM] = String(dayHours.end).split(":").map(Number);
      const start = new Date(dayDate); start.setHours(startH, startM, 0, 0);
      const end = new Date(dayDate); end.setHours(endH, endM, 0, 0);
      // generate slots and filter those already booked
      const slots: string[] = [];
      for (let t = start.getTime(); t < end.getTime(); t += 30 * 60 * 1000) slots.push(new Date(t).toISOString());
      const appts = await db.collection<any>("appointments").find({ doctor_id: doctor_id as any, date: { $gte: start, $lt: end } }).project({ date: 1 }).toArray();
      const booked = new Set(appts.map((a: any) => new Date(a.date).toISOString()));
      const free = slots.filter((s) => !booked.has(s));
      if (free.length > 0) days.push(dayDate.toISOString());
    }
    return { availableDays: days, doctor: { id: doctor_id, name: doctor.name } };
  },
  searchClinics: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const form = await request.formData();
    const q = String(form.get("q") || "").trim();
    const specialty = String(form.get("specialty") || "").trim();
    const location = String(form.get("location") || "").trim();
    // Require at least one filter to be provided
    if (!q && !specialty && !location) {
      return fail(400, { error: "Please enter at least one filter (name, specialty, or location) before searching." });
    }
    const results = await getDoctors({ q: q || undefined, specialty: specialty || undefined, city: location || undefined }, 50);
    return { results: deepSerialize(results) };
  },
  findSlots: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const form = await request.formData();
    const doctor_id = String(form.get("doctor_id") || "");
    const date = String(form.get("date") || "");
    if (!doctor_id || !date) return fail(400, { error: "Select doctor and date", values: { doctor_id, date } });
    const doctor = await getDoctorById(doctor_id);
    if (!doctor) return fail(404, { error: "Doctor not found" });
    const dt = new Date(date);
    // Only allow future dates
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dt.getTime() < today.getTime()) return fail(400, { error: "Please select a future date", values: { doctor_id, date } });
    const weekday = dt.getDay();
    // Expect doctor.open_hours: [{ day: 0-6, start: "09:00", end: "17:00" }]
    const dayHours = (doctor.open_hours || []).find((h: any) => Number(h.day) === weekday);
    if (!dayHours) return fail(400, { error: "Doctor is not available that day", values: { doctor_id, date } });
    const [startH, startM] = String(dayHours.start).split(":").map(Number);
    const [endH, endM] = String(dayHours.end).split(":").map(Number);
    const start = new Date(dt); start.setHours(startH, startM, 0, 0);
    const end = new Date(dt); end.setHours(endH, endM, 0, 0);
    // 30-minute slots
    const slots: string[] = [];
    for (let t = start.getTime(); t < end.getTime(); t += 30 * 60 * 1000) {
      slots.push(new Date(t).toISOString());
    }
    // Exclude existing appointments for the doctor across all users at exact times
    const db = await getDb();
    const appts = await db.collection<any>("appointments").find({ doctor_id: doctor_id as any }).project({ date: 1 }).toArray();
    const bookedTimes = new Set<string>(appts.map((a: any) => new Date(a.date).toISOString()));
    const available = slots.filter((s) => !bookedTimes.has(s));
    return { slots: available, doctor: { id: doctor_id, name: doctor.name }, date };
  },
  addAppointment: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    const form = await request.formData();
    const doctor_id = String(form.get("doctor_id") || "");
    const slot = String(form.get("slot") || "");
    const notes = String(form.get("notes") || "");
    if (!doctor_id || !slot) return fail(400, { error: "Missing appointment info" });
    // Validate the requested slot is within the clinic's open hours for that day
    const doctor = await getDoctorById(doctor_id);
    if (!doctor) return fail(404, { error: "Clinic not found" });
    const dt = new Date(slot);
    if (isNaN(dt.getTime())) return fail(400, { error: "Invalid slot time" });
    const now2 = new Date();
    if (dt.getTime() < now2.getTime()) return fail(400, { error: "Selected time must be in the future" });
    const weekday = dt.getDay();
    const dayHours = (doctor.open_hours || []).find((h: any) => Number(h.day) === weekday);
    if (!dayHours) return fail(400, { error: "Clinic is closed that day" });
    const [startH, startM] = String(dayHours.start).split(":").map(Number);
    const [endH, endM] = String(dayHours.end).split(":").map(Number);
    const start = new Date(dt); start.setHours(startH, startM, 0, 0);
    const end = new Date(dt); end.setHours(endH, endM, 0, 0);
    if (dt < start || dt >= end) {
      return fail(400, { error: "Selected time is outside clinic open hours" });
    }

    // Enforce one active appointment per clinic for this user
    const db = await getDb();
    const existing = await db.collection<any>("appointments").findOne({ user_id: session.user.id as any, doctor_id: doctor_id as any });
    if (existing) {
      return fail(400, { error: "You already have an appointment with this clinic" });
    }

    await addAppointment(session.user.id, { doctor_id, date: slot, notes });
    return { success: true };
  },
  updateAppointment: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    if (!session.user.clinic) return fail(403, { error: "Only clinic accounts can update appointments" });
    const form = await request.formData();
    const id = String(form.get("id") || "");
    const dateStr = String(form.get("date") || "");
    if (!id) return fail(400, { error: "Missing appointment id" });
    const db = await getDb();
    const appt = await db.collection<any>("appointments").findOne({ _id: new ObjectId(id) });
    if (!appt) return fail(404, { error: "Appointment not found" });
    // Ensure this appointment belongs to the clinic
    const userDoc = await db.collection<any>("users").findOne({ _id: session.user.id });
    if (!userDoc?.clinic_id || String(appt.doctor_id) !== String(userDoc.clinic_id)) return fail(403, { error: "Not authorized to modify this appointment" });
    const update: any = {};
    if (dateStr) {
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return fail(400, { error: "Invalid date" });
      update.date = dt;
    }
    // Notes are not editable from the clinic dashboard per requirements
    await db.collection<any>("appointments").updateOne({ _id: appt._id }, { $set: update });

    // Notify the user about the schedule change (structured, language-ready)
    const newTime = update.date ? new Date(update.date) : new Date(appt.date);
    await createNotification(String(appt.user_id), {
      type: "reschedule",
      appointmentId: String(appt._id),
      appointmentDate: newTime,
      doctorName: appt.doctor_name || appt.specialty || ""
    });
    return { updated: true, id };
  },
  deleteAppointment: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    if (!session.user.clinic) return fail(403, { error: "Only clinic accounts can delete appointments" });
    const form = await request.formData();
    const id = String(form.get("id") || "");
    if (!id) return fail(400, { error: "Missing appointment id" });
    const db = await getDb();
    const appt = await db.collection<any>("appointments").findOne({ _id: new ObjectId(id) });
    if (!appt) return fail(404, { error: "Appointment not found" });
    const userDoc = await db.collection<any>("users").findOne({ _id: session.user.id });
    if (!userDoc?.clinic_id || String(appt.doctor_id) !== String(userDoc.clinic_id)) return fail(403, { error: "Not authorized to delete this appointment" });
    await db.collection<any>("appointments").deleteOne({ _id: appt._id });
    // Notify the user about the deletion
    await createNotification(String(appt.user_id), {
      type: "deleted",
      appointmentId: String(appt._id),
      appointmentDate: new Date(appt.date),
      doctorName: appt.doctor_name || appt.specialty || ""
    });
    return { deleted: true, id };
  },
  cancelAppointment: async ({ locals, request }) => {
    const session = locals.session; if (!session) throw redirect(303, "/login");
    if (session.user.clinic) return fail(403, { error: "Clinic accounts cannot cancel as patient" });
    const form = await request.formData();
    const id = String(form.get("id") || "");
    if (!id) return fail(400, { error: "Missing appointment id" });
    const db = await getDb();
    const appt = await db.collection<any>("appointments").findOne({ _id: new ObjectId(id), user_id: session.user.id as any });
    if (!appt) return fail(404, { error: "Appointment not found" });
    await db.collection<any>("appointments").deleteOne({ _id: appt._id });

    // Notify clinic users about the cancellation
    const clinicUsers = await db.collection<any>("users").find({ clinic_id: String(appt.doctor_id) }).project({ _id: 1 }).toArray();
    const patient = await db.collection<any>("users").findOne({ _id: session.user.id });
    const patientName = patient?.name || patient?.full_name || patient?.email || "";
    for (const receiver of clinicUsers) {
      await createNotification(String(receiver._id), {
        type: "deleted",
        appointmentId: String(appt._id),
        appointmentDate: new Date(appt.date),
        doctorName: appt.doctor_name || appt.specialty || "",
        patientName
      });
    }

    return { deleted: true, id };
  }
};
