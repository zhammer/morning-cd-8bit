import { describe, it, expect } from "vitest";
import { listens, playlists } from "./schema";
import { getTableName } from "drizzle-orm";

describe("database schema", () => {
  it("listens table has correct name", () => {
    expect(getTableName(listens)).toBe("listens");
  });

  it("playlists table has correct name", () => {
    expect(getTableName(playlists)).toBe("playlists");
  });
});
