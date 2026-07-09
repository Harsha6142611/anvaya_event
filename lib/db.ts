import { createClient, type Client } from "@libsql/client";
import type { Entry, EntryType } from "./types";

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  return client;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getClient();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS entries (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          reason TEXT NOT NULL,
          amount INTEGER NOT NULL,
          type TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);

      // Older DBs had CHECK (sponsor|expenditure) — rebuild so 'due' is allowed
      const meta = await db.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='entries'",
      );
      const sql = String(meta.rows[0]?.sql ?? "");
      if (sql.includes("CHECK") && !sql.includes("'due'")) {
        await db.execute(`
          CREATE TABLE entries_migrated (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            reason TEXT NOT NULL,
            amount INTEGER NOT NULL,
            type TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        `);
        await db.execute(`
          INSERT INTO entries_migrated (id, name, reason, amount, type, created_at)
          SELECT id, name, reason, amount, type, created_at FROM entries
        `);
        await db.execute("DROP TABLE entries");
        await db.execute("ALTER TABLE entries_migrated RENAME TO entries");
      }
    })();
  }
  await schemaReady;
}

function rowToEntry(row: Record<string, unknown>): Entry {
  return {
    id: String(row.id),
    name: String(row.name),
    reason: String(row.reason),
    amount: Number(row.amount),
    type: row.type as EntryType,
    created_at: Number(row.created_at),
  };
}

export async function listEntries(): Promise<Entry[]> {
  await ensureSchema();
  const result = await getClient().execute(
    "SELECT id, name, reason, amount, type, created_at FROM entries ORDER BY created_at DESC",
  );
  return result.rows.map((row) => rowToEntry(row as Record<string, unknown>));
}

export async function createEntry(input: {
  name: string;
  reason: string;
  amount: number;
  type: EntryType;
}): Promise<Entry> {
  await ensureSchema();
  const entry: Entry = {
    id: crypto.randomUUID(),
    name: input.name,
    reason: input.reason,
    amount: input.amount,
    type: input.type,
    created_at: Date.now(),
  };

  await getClient().execute({
    sql: `INSERT INTO entries (id, name, reason, amount, type, created_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      entry.id,
      entry.name,
      entry.reason,
      entry.amount,
      entry.type,
      entry.created_at,
    ],
  });

  return entry;
}

export async function deleteEntry(id: string): Promise<boolean> {
  await ensureSchema();
  const result = await getClient().execute({
    sql: "DELETE FROM entries WHERE id = ?",
    args: [id],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export function verifyPin(pin: string): boolean {
  const expected = process.env.ANVAYA_PIN;
  if (!expected) {
    return pin === "1234";
  }
  return pin === expected;
}
