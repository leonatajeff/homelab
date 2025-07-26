import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./packages/db/schema.ts",
  out: "./packages/db/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
