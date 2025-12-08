import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/medlink";
const client = new MongoClient(uri);

let _db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (_db) return _db;
  await client.connect();
  _db = client.db();
  return _db;
}

export async function usersCollection(): Promise<Collection<any>> {
  const db = await getDb();
  return db.collection("users");
}
