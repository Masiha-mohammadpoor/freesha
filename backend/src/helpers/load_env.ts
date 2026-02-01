import dotenv from "dotenv";

import { dockerizeDatabaseUrl } from "./utils";

dotenv.config({ path: "./.env" });

if (process.env.IS_IN_DOCKER && process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dockerizeDatabaseUrl(process.env.DATABASE_URL);
}
