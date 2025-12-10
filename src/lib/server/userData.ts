import { getDb } from "$lib/server/database";
import { ObjectId } from "mongodb";

export async function getUserData(userId: string) {
  const db = await getDb();
  const appointments = await db.collection<any>("appointments").find({ user_id: userId as any }).sort({ date: 1 }).toArray();
  const contacts = await db.collection<any>("contacts").find({ user_id: userId as any }).sort({ last_contacted_at: -1 }).toArray();
  const savedDoctors = await db.collection<any>("saved_doctors").find({ user_id: userId as any }).toArray();
  return { appointments, contacts, savedDoctors };
}

export async function getDoctors(filter?: { q?: string; specialty?: string; city?: string }, limit = 50) {
  const db = await getDb();
  const query: any = {};
  if (filter?.q) query.name = { $regex: filter.q, $options: "i" };
  if (filter?.specialty) query.specialty = { $regex: filter.specialty, $options: "i" };
  if (filter?.city) query.city = { $regex: filter.city, $options: "i" };
  const docs = await db.collection<any>("doctors").find(query).limit(limit).toArray();
  return docs;
}

export async function getDoctorById(id: string) {
  const db = await getDb();
  let queryId: any = id as any;
  // Convert hex string to ObjectId if applicable
  if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) {
    try { queryId = new ObjectId(id); } catch {}
  }
  const col = db.collection<any>("doctors");
  const found = await col.findOne({ _id: queryId });
  if (found) return found;
  return col.findOne({ _id: String(id) as any });
}

export async function getUserById(id: string) {
  const db = await getDb();
  return db.collection<any>("users").findOne({ _id: id as any });
}

export async function getNotifications(receiverId: string) {
  const db = await getDb();
  // Latest first for UI ordering
  return db.collection<any>("notifications").find({ receiver_id: receiverId as any }).sort({ created_at: -1 }).toArray();
}

export async function consumeNotifications(ids: string[]) {
  if (!ids.length) return;
  const db = await getDb();
  const objectIds = ids.map((id) => {
    if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) {
      try { return new ObjectId(id); } catch { return id as any; }
    }
    return id as any;
  });
  await db.collection<any>("notifications").deleteMany({ _id: { $in: objectIds } });
}

type NotificationType = "due" | "reschedule" | "deleted" | "new";

export async function createNotification(receiverId: string, params: {
  type: NotificationType;
  appointmentId?: string;
  appointmentDate?: Date | string;
  doctorName?: string;
  patientName?: string;
}) {
  const db = await getDb();
  const doc: any = {
    receiver_id: receiverId,
    type: params.type,
    appointment_id: params.appointmentId || null,
    appointment_date: params.appointmentDate ? new Date(params.appointmentDate) : null,
    doctor_name: params.doctorName || null,
    patient_name: params.patientName || null,
    created_at: new Date()
  };
  const res = await db.collection<any>("notifications").insertOne(doc);
  return { _id: res.insertedId, ...doc };
}

export async function createClinic(clinic: { name: string; specialty: string; city: string; open_hours?: any[] }) {
  const db = await getDb();
  const doc: any = {
    name: clinic.name,
    specialty: clinic.specialty,
    city: clinic.city,
    open_hours: clinic.open_hours || [],
    created_at: new Date(),
    invite_token: crypto.randomUUID(),
    invite_claimed: false
  };
  const res = await db.collection<any>("doctors").insertOne(doc);
  return { _id: res.insertedId, ...doc };
}

export async function updateClinic(id: string, update: Partial<{ name: string; specialty: string; city: string; open_hours: any[] }>) {
  const db = await getDb();
  const $set: any = {};
  if (update.name !== undefined) $set.name = update.name;
  if (update.specialty !== undefined) $set.specialty = update.specialty;
  if (update.city !== undefined) $set.city = update.city;
  if (update.open_hours !== undefined) $set.open_hours = update.open_hours;
  if (Object.keys($set).length === 0) return;
  let queryId: any = id as any;
  if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) {
    try { queryId = new ObjectId(id); } catch {}
  }
  await db.collection<any>("doctors").updateOne({ _id: queryId }, { $set });
}

export async function deleteClinic(id: string) {
  const db = await getDb();
  let queryId: any = id as any;
  if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) {
    try { queryId = new ObjectId(id); } catch {}
  }
  const col = db.collection<any>("doctors");
  const res = await col.deleteOne({ _id: queryId });
  if (!res.deletedCount) await col.deleteOne({ _id: String(id) as any });
}

export async function saveDoctor(userId: string, doctor: { id: string }) {
  const db = await getDb();
  let queryId: any = doctor.id as any;
  if (typeof doctor.id === "string" && /^[a-fA-F0-9]{24}$/.test(doctor.id)) {
    try { queryId = new ObjectId(doctor.id); } catch {}
  }
  const doc = await db.collection<any>("doctors").findOne({ _id: queryId })
    || await db.collection<any>("doctors").findOne({ _id: String(doctor.id) as any });
  if (!doc) throw new Error("Doctor not found");
  await db.collection<any>("saved_doctors").updateOne(
    { user_id: userId as any, doctor_id: String(doc._id) },
    { $set: { user_id: userId, doctor_id: String(doc._id), name: doc.name, specialty: doc.specialty, location: doc.city, saved_at: new Date() } },
    { upsert: true }
  );
}

export async function addAppointment(userId: string, appt: { doctor_id: string; date: string; notes?: string }) {
  const db = await getDb();
  let queryId: any = appt.doctor_id as any;
  if (typeof appt.doctor_id === "string" && /^[a-fA-F0-9]{24}$/.test(appt.doctor_id)) {
    try { queryId = new ObjectId(appt.doctor_id); } catch {}
  }
  const doc = await db.collection<any>("doctors").findOne({ _id: queryId })
    || await db.collection<any>("doctors").findOne({ _id: String(appt.doctor_id) as any });
  if (!doc) throw new Error("Doctor not found");
  const res = await db.collection<any>("appointments").insertOne({
    user_id: userId,
    doctor_id: String(doc._id),
    doctor_name: doc.name,
    specialty: doc.specialty,
    date: new Date(appt.date),
    notes: appt.notes || "",
    created_at: new Date()
  });
  const appointmentId = res.insertedId ? String(res.insertedId) : undefined;
  const patient = await db.collection<any>("users").findOne({ _id: userId as any });
  const clinicUsers = await db.collection<any>("users").find({ clinic_id: String(doc._id) }).project({ _id: 1 }).toArray();
  const targets = clinicUsers.map((u: any) => String(u._id)).filter(Boolean);
  for (const receiver of targets) {
    await createNotification(receiver, {
      type: "new",
      appointmentId,
      appointmentDate: new Date(appt.date),
      doctorName: doc.name,
      patientName: patient?.name || patient?.full_name || patient?.email || ""
    });
  }
}

export async function contactDoctor(userId: string, doctor: { id: string }) {
  const db = await getDb();
  let queryId: any = doctor.id as any;
  if (typeof doctor.id === "string" && /^[a-fA-F0-9]{24}$/.test(doctor.id)) {
    try { queryId = new ObjectId(doctor.id); } catch {}
  }
  const doc = await db.collection<any>("doctors").findOne({ _id: queryId })
    || await db.collection<any>("doctors").findOne({ _id: String(doctor.id) as any });
  if (!doc) throw new Error("Doctor not found");
  await db.collection<any>("contacts").updateOne(
    { user_id: userId as any, doctor_id: String(doc._id) },
    { $set: { user_id: userId, doctor_id: String(doc._id), name: doc.name, last_contacted_at: new Date() } },
    { upsert: true }
  );
}
