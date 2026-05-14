import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { createRequire } from "module";
import type { PrismaClient as PrismaClientType } from "../../generated/prisma/index.js";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("../../generated/prisma/index.js") as { PrismaClient: typeof PrismaClientType };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
export default prisma;
