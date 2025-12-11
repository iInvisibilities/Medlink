import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/medlink";
const client = new MongoClient(uri);

let _db: Db | null = null;
let indexesReady = false;

async function ensureIndexes(db: Db) {
  if (indexesReady) return;
  const appointments = db.collection("appointments");
  // Ensure appointments expire 1 day after their scheduled date/time.
  const indexes = await appointments.listIndexes().toArray();
  const ttlName = "date_ttl";
  const ttlIndex = indexes.find((idx) => idx.name === ttlName || (idx.key && idx.key.date === 1));
  if (ttlIndex && ttlIndex.expireAfterSeconds !== 86400) {
    // Update existing TTL to 1 day.
    await db.command({ collMod: "appointments", index: { name: ttlIndex.name, expireAfterSeconds: 86400 } });
  } else if (!ttlIndex) {
    await appointments.createIndex({ date: 1 }, { expireAfterSeconds: 86400, name: ttlName });
  }
  indexesReady = true;
}

export async function getDb(): Promise<Db> {
  if (_db) return _db;
  await client.connect();
  _db = client.db();
  await ensureIndexes(_db);
  return _db;
}

export async function usersCollection(): Promise<Collection<any>> {
  const db = await getDb();
  return db.collection("users");
}
