import { createYoga } from "graphql-yoga";
import { schema } from "../backend/schema";
import { createDb } from "../backend/db/client";

const yoga = createYoga({
  schema,
  context: () => ({ db: createDb() }),
  graphqlEndpoint: "/api/graphql",
  cors: {
    origin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
    methods: ["POST", "GET", "OPTIONS"],
  },
});

export default yoga;
