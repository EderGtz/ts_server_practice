import { defineConfig } from "drizzle-kit";
import { config } from "./src/config"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "src/db/migration_files",
  dialect: "postgresql",
  dbCredentials: {
    url: config.dbURL,
  },
});