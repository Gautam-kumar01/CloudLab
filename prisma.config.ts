import * as dotenv from 'dotenv';
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env' });
  dotenv.config({ path: '.env.development' });
  dotenv.config({ path: '.env.production' });
}
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
