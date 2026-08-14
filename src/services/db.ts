import Database from "@tauri-apps/plugin-sql";
import type { Allocation, Quest, Transaction } from "../types";

let dbInstance: Database | null = null;
let isTauriSqlAvailable = true;

export async function getDb(): Promise<Database | null> {
  if (!isTauriSqlAvailable) return null;
  if (!dbInstance) {
    try {
      dbInstance = await Database.load("sqlite:levelup_money.db");
      await initTables(dbInstance);
    } catch (err) {
      console.warn("Tauri SQLite plugin unavailable, falling back to LocalStorage:", err);
      isTauriSqlAvailable = false;
      return null;
    }
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
      cleared INTEGER NOT NULL,
      notes TEXT
    )
  `);

  // Attempt migration if notes column does not exist
  try {
    await db.execute(`ALTER TABLE transactions ADD COLUMN notes TEXT`);
  } catch {
    // Column already exists
  }

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
      done INTEGER NOT NULL,
      category TEXT
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
  try {
    const db = await getDb();
    if (!db) {
      const stored = localStorage.getItem("levelup.transactions");
      return stored ? JSON.parse(stored) : [];
    }

    const rows = await db.select<Array<{
      id: string;
      name: string;
      amount: number;
      date: string;
      category: string;
      cleared: number;
      notes?: string;
    }>>("SELECT * FROM transactions ORDER BY date DESC");

    return rows.map((r) => ({
      ...r,
      category: r.category as Transaction["category"],
      cleared: Boolean(r.cleared),
      notes: r.notes || "",
    }));
  } catch (err) {
    console.error("Failed to get transactions from db:", err);
    const stored = localStorage.getItem("levelup.transactions");
    return stored ? JSON.parse(stored) : [];
  }
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  try {
    const db = await getDb();
    if (db) {
      await db.execute(
        `INSERT INTO transactions (id, name, amount, date, category, cleared, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           amount=excluded.amount,
           date=excluded.date,
           category=excluded.category,
           cleared=excluded.cleared,
           notes=excluded.notes`,
        [tx.id, tx.name, tx.amount, tx.date, tx.category, tx.cleared ? 1 : 0, tx.notes || ""]
      );
    }
  } catch (err) {
    console.error("Failed to save transaction to db:", err);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    const db = await getDb();
    if (db) {
      await db.execute("DELETE FROM transactions WHERE id = $1", [id]);
    }
  } catch (err) {
    console.error("Failed to delete transaction from db:", err);
  }
}

export async function saveAllTransactions(txs: Transaction[]): Promise<void> {
  localStorage.setItem("levelup.transactions", JSON.stringify(txs));
  try {
    const db = await getDb();
    if (db) {
      await db.execute("DELETE FROM transactions");
      for (const tx of txs) {
        await saveTransaction(tx);
      }
    }
  } catch (err) {
    console.error("Failed to batch save transactions to db:", err);
  }
}

// --- Allocations CRUD ---
export async function getAllocations(): Promise<Allocation[]> {
  try {
    const db = await getDb();
    if (!db) {
      const stored = localStorage.getItem("levelup.allocations");
      return stored ? JSON.parse(stored) : [];
    }
    return await db.select<Allocation[]>("SELECT * FROM allocations");
  } catch (err) {
    console.error("Failed to get allocations:", err);
    const stored = localStorage.getItem("levelup.allocations");
    return stored ? JSON.parse(stored) : [];
  }
}

export async function saveAllocations(allocations: Allocation[]): Promise<void> {
  localStorage.setItem("levelup.allocations", JSON.stringify(allocations));
  try {
    const db = await getDb();
    if (db) {
      await db.execute("DELETE FROM allocations");
      for (const a of allocations) {
        await db.execute(
          "INSERT INTO allocations (id, label, percent, color) VALUES ($1, $2, $3, $4)",
          [a.id, a.label, a.percent, a.color]
        );
      }
    }
  } catch (err) {
    console.error("Failed to save allocations to db:", err);
  }
}

// --- Quests CRUD ---
export async function getQuests(): Promise<Quest[]> {
  try {
    const db = await getDb();
    if (!db) {
      const stored = localStorage.getItem("levelup.quests");
      return stored ? JSON.parse(stored) : [];
    }
    const rows = await db.select<Array<{
      id: string;
      title: string;
      date: string;
      xp: number;
      done: number;
      category?: string;
    }>>("SELECT * FROM quests");

    return rows.map((q) => ({
      ...q,
      done: Boolean(q.done),
      category: (q.category as Quest["category"]) || "daily",
    }));
  } catch (err) {
    console.error("Failed to get quests:", err);
    const stored = localStorage.getItem("levelup.quests");
    return stored ? JSON.parse(stored) : [];
  }
}

export async function saveQuest(quest: Quest): Promise<void> {
  try {
    const db = await getDb();
    if (db) {
      await db.execute(
        `INSERT INTO quests (id, title, date, xp, done, category)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT(id) DO UPDATE SET
           title=excluded.title,
           date=excluded.date,
           xp=excluded.xp,
           done=excluded.done,
           category=excluded.category`,
        [quest.id, quest.title, quest.date, quest.xp, quest.done ? 1 : 0, quest.category || "daily"]
      );
    }
  } catch (err) {
    console.error("Failed to save quest to db:", err);
  }
}

export async function saveAllQuests(quests: Quest[]): Promise<void> {
  localStorage.setItem("levelup.quests", JSON.stringify(quests));
  try {
    const db = await getDb();
    if (db) {
      await db.execute("DELETE FROM quests");
      for (const q of quests) {
        await saveQuest(q);
      }
    }
  } catch (err) {
    console.error("Failed to save all quests to db:", err);
  }
}

// --- Settings CRUD ---
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDb();
    if (!db) {
      const stored = localStorage.getItem(`levelup.setting.${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    }
    const rows = await db.select<Array<{ key: string; value: string }>>(
      "SELECT value FROM settings WHERE key = $1",
      [key]
    );

    if (rows.length === 0) return defaultValue;
    return JSON.parse(rows[0].value) as T;
  } catch {
    const stored = localStorage.getItem(`levelup.setting.${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  }
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  localStorage.setItem(`levelup.setting.${key}`, JSON.stringify(value));
  try {
    const db = await getDb();
    if (db) {
      const valStr = JSON.stringify(value);
      await db.execute(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
        [key, valStr]
      );
    }
  } catch (err) {
    console.error(`Failed to save setting ${key}:`, err);
  }
}
