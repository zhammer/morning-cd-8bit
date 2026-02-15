import { createYoga } from "graphql-yoga";
import { schema } from "../backend/schema";
import { createDb } from "../backend/db/client";

const db = createDb();

const yoga = createYoga({
  schema,
  context: () => ({ db }),
  graphqlEndpoint: "/api/graphql",
  cors: {
    origin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
    methods: ["POST", "GET", "OPTIONS"],
  },
});

export default yoga;
