import Database from "@tauri-apps/plugin-sql";
import { Transaction, Allocation, Quest } from "../types";

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:levelup_money.db");
    await initTables(dbInstance);
  }
  return dbInstance;
}

async function initTables(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      cleared INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS allocations (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      percent REAL NOT NULL,
      color TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      xp INTEGER NOT NULL,
      done INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

// --- Transactions CRUD ---
export async function getTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.select<Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
    category: string;
    cleared: number;
  }>>("SELECT * FROM transactions ORDER BY date DESC");

  return rows.map((r) => ({
    ...r,
    category: r.category as Transaction["category"],
    cleared: Boolean(r.cleared),
  }));
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO transactions (id, name, amount, date, category, cleared)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name,
       amount=excluded.amount,
       date=excluded.date,
       category=excluded.category,
       cleared=excluded.cleared`,
    [tx.id, tx.name, tx.amount, tx.date, tx.category, tx.cleared ? 1 : 0]
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM transactions WHERE id = $1", [id]);
}

export async function saveAllTransactions(txs: Transaction[]): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM transactions");
  for (const tx of txs) {
    await saveTransaction(tx);
  }
}

// --- Allocations CRUD ---
export async function getAllocations(): Promise<Allocation[]> {
  const db = await getDb();
  return await db.select<Allocation[]>("SELECT * FROM allocations");
}

export async function saveAllocations(allocations: Allocation[]): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM allocations");
  for (const a of allocations) {
    await db.execute(
      "INSERT INTO allocations (id, label, percent, color) VALUES ($1, $2, $3, $4)",
      [a.id, a.label, a.percent, a.color]
    );
  }
}

// --- Quests CRUD ---
export async function getQuests(): Promise<Quest[]> {
  const db = await getDb();
  const rows = await db.select<Array<{
    id: string;
    title: string;
    date: string;
    xp: number;
    done: number;
  }>>("SELECT * FROM quests");

  return rows.map((q) => ({
    ...q,
    done: Boolean(q.done),
  }));
}

export async function saveQuest(quest: Quest): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO quests (id, title, date, xp, done)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT(id) DO UPDATE SET
       title=excluded.title,
       date=excluded.date,
       xp=excluded.xp,
       done=excluded.done`,
    [quest.id, quest.title, quest.date, quest.xp, quest.done ? 1 : 0]
  );
}

export async function saveAllQuests(quests: Quest[]): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM quests");
  for (const q of quests) {
    await saveQuest(q);
  }
}

// --- Settings CRUD ---
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getDb();
  const rows = await db.select<Array<{ key: string; value: string }>>(
    "SELECT value FROM settings WHERE key = $1",
    [key]
  );

  if (rows.length === 0) return defaultValue;
  try {
    return JSON.parse(rows[0].value) as T;
  } catch {
    return defaultValue;
  }
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDb();
  const valStr = JSON.stringify(value);
  await db.execute(
    `INSERT INTO settings (key, value)
     VALUES ($1, $2)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, valStr]
  );
}
