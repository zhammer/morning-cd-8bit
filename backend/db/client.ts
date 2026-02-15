import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

export function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle({ client: sql, schema });
}

export type Db = ReturnType<typeof createDb>;
