import { describe, it, expect } from "vitest";
import { schema } from "./index";

describe("GraphQL Schema", () => {
  it("compiles and produces a valid schema", () => {
    expect(schema).toBeDefined();
    // Verify it's a GraphQL schema by checking for expected properties
    const queryType = schema.getQueryType();
    expect(queryType).toBeDefined();
    expect(queryType!.name).toBe("Query");

    const mutationType = schema.getMutationType();
    expect(mutationType).toBeDefined();
    expect(mutationType!.name).toBe("Mutation");
  });

  it("has the expected query fields", () => {
    const queryType = schema.getQueryType()!;
    const fields = queryType.getFields();
    expect(fields.listen).toBeDefined();
    expect(fields.allListens).toBeDefined();
    expect(fields.sunlightWindow).toBeDefined();
  });

  it("has the expected mutation fields", () => {
    const mutationType = schema.getMutationType()!;
    const fields = mutationType.getFields();
    expect(fields.submitListen).toBeDefined();
  });

  it("has the expected types", () => {
    const typeMap = schema.getTypeMap();
    expect(typeMap.Listen).toBeDefined();
    expect(typeMap.Song).toBeDefined();
    expect(typeMap.SunlightWindow).toBeDefined();
    expect(typeMap.ListenConnection).toBeDefined();
    expect(typeMap.ListenEdge).toBeDefined();
    expect(typeMap.PageInfo).toBeDefined();
    expect(typeMap.ListenInput).toBeDefined();
    expect(typeMap.MusicProvider).toBeDefined();
    expect(typeMap.DateTime).toBeDefined();
    expect(typeMap.Date).toBeDefined();
  });
});
