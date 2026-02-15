import { eq, gt, lt, desc, and } from "drizzle-orm";
import { listens, type Listen } from "../db/schema";
import { getSunlightWindow } from "./sunlight";
import type { Db } from "../db/client";

interface SubmitListenInput {
  songId: string;
  songProvider?: string;
  listenerName: string;
  note?: string;
  ianaTimezone: string;
}

function localDateString(date: Date, ianaTimezone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: ianaTimezone });
}

export async function submitListen(
  db: Db,
  input: SubmitListenInput,
  now: Date = new Date()
): Promise<Listen> {
  const todayLocal = localDateString(now, input.ianaTimezone);
  const sunlight = await getSunlightWindow(input.ianaTimezone, todayLocal);

  if (now < sunlight.sunriseUtc || now >= sunlight.sunsetUtc) {
    throw new Error(
      "It is not currently daytime in your timezone. Listens can only be submitted during the day."
    );
  }

  const [listen] = await db
    .insert(listens)
    .values({
      songId: input.songId,
      songProvider: input.songProvider || "SPOTIFY",
      listenerName: input.listenerName,
      note: input.note || null,
      listenTimeUtc: now,
      ianaTimezone: input.ianaTimezone,
    })
    .returning();

  return listen;
}

export async function getListen(db: Db, id: number): Promise<Listen | null> {
  const results = await db
    .select()
    .from(listens)
    .where(eq(listens.id, id))
    .limit(1);
  return results[0] || null;
}

export interface ListenEdge {
  node: Listen;
  cursor: string;
}

export interface ListenConnection {
  edges: ListenEdge[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

interface GetListensOptions {
  after?: Date;
  before?: Date;
  last?: number;
}

export async function getListens(
  db: Db,
  options: GetListensOptions
): Promise<ListenConnection> {
  const conditions = [];
  if (options.after) {
    conditions.push(gt(listens.listenTimeUtc, options.after));
  }
  if (options.before) {
    conditions.push(lt(listens.listenTimeUtc, options.before));
  }

  const limit = (options.last || 10) + 1;

  const results = await db
    .select()
    .from(listens)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(listens.listenTimeUtc))
    .limit(limit);

  const hasMore = results.length > (options.last || 10);
  const trimmed = hasMore ? results.slice(0, options.last || 10) : results;

  const edges: ListenEdge[] = trimmed.map((listen) => ({
    node: listen,
    cursor: listen.listenTimeUtc.toISOString(),
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: hasMore,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
  };
}
