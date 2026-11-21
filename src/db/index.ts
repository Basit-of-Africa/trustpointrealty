import "server-only";
import { cache } from "react";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = PostgresJsDatabase<typeof schema>;

/*
 * On Cloudflare Workers a TCP connection can't be shared between requests,
 * so we open one per request (memoised with React's request-scoped cache).
 * On Node (local dev, Render, a VPS) we keep one shared pool.
 */
const onWorkers =
  typeof navigator !== "undefined" &&
  navigator.userAgent === "Cloudflare-Workers";

function connectionString(): string {
  if (onWorkers) {
    try {
      // Prefer a Hyperdrive binding when one is configured.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const env = getCloudflareContext().env as {
        HYPERDRIVE?: { connectionString: string };
      };
      if (env.HYPERDRIVE) return env.HYPERDRIVE.connectionString;
    } catch {
      // fall through to DATABASE_URL
    }
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

function create(max: number): DB {
  const client = postgres(connectionString(), {
    max,
    idle_timeout: onWorkers ? 5 : 30,
    // Neon's pooler and Hyperdrive don't support named prepared statements.
    prepare: false,
  });
  return drizzle(client, { schema });
}

const globalForDb = globalThis as unknown as { __tpDb?: DB };

const perRequestDb = cache(() => create(1));

export function getDb(): DB {
  if (onWorkers) return perRequestDb();
  if (!globalForDb.__tpDb) globalForDb.__tpDb = create(10);
  return globalForDb.__tpDb;
}

export { schema };
