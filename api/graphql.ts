import "../backend/env";
import { createYoga } from "graphql-yoga";
import { schema } from "../backend/schema";
import { createDb } from "../backend/db/client";

let db: ReturnType<typeof createDb>;

const yoga = createYoga({
  schema,
  context: () => {
    if (!db) db = createDb();
    return { db };
  },
  graphqlEndpoint: "/api/graphql",
  cors: {
    origin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
    methods: ["POST", "GET", "OPTIONS"],
  },
});

export default yoga;
