import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getPoolSize(): number {
  const poolSize = parseInt(process.env.DB_POOL_SIZE || '10', 10);
  return Math.max(1, Math.min(poolSize, 50)); // Clamp between 1-50
}

// Create a dummy DB client for when DATABASE_URL is not available
class DummyDb {
  async query() {
    console.warn("Database operations are disabled: DATABASE_URL is not set");
    return [];
  }
}

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  db: any;
};

let db: any;
let isRealConnection = false;

// Only initialize the database if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    const poolSize = getPoolSize();
    const reusing = Boolean(globalForDb.conn);
    const conn = reusing
      ? globalForDb.conn!
      : postgres(process.env.DATABASE_URL, {
          max: poolSize,
          idle_timeout: 20,
          connect_timeout: 10,
          prepare: false,
        });
    globalForDb.conn = conn;
    db = drizzle(conn, { schema });
    globalForDb.db = db;
    isRealConnection = true;
    console.log(
      reusing
        ? 'Reusing existing database connection; pool size is unchanged from the initial value (restart to apply DB_POOL_SIZE changes).'
        : `Database connection established successfully with pool size: ${poolSize}`
    );
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    db = new DummyDb();
    globalForDb.db = db;
    isRealConnection = false;
  }
} else {
  console.warn("DATABASE_URL is not set. Database features will be disabled.");
  db = new DummyDb();
  globalForDb.db = db;
  isRealConnection = false;
}

// Add a method to check if we have a real database connection
if (db && typeof db === 'object') {
  (db as any).isRealConnection = () => isRealConnection;
}

export { db };
