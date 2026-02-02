import "../src/helpers/load_env";

import { defineConfig } from "drizzle-kit";

import { fixDatabaseUrl } from "../src/helpers/utils_indep";

fixDatabaseUrl();

export default defineConfig({
  out: "./drizzle",
  schema: "./src/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
