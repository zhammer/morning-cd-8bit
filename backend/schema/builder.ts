import SchemaBuilder from "@pothos/core";
import type { Db } from "../db/client";

// Context type passed to all resolvers
export interface GraphQLContext {
  db: Db;
}

export const builder = new SchemaBuilder<{
  Context: GraphQLContext;
  Scalars: {
    DateTime: { Input: string; Output: Date | string };
    Date: { Input: string; Output: string };
  };
}>({});

builder.scalarType("DateTime", {
  serialize: (value) =>
    value instanceof Date ? value.toISOString() : value,
  parseValue: (value) => new Date(value as string),
});

builder.scalarType("Date", {
  serialize: (value) => value as string,
  parseValue: (value) => value as string,
});
