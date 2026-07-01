import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "crypto";

const adapter = new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public");
const prisma = new PrismaClient({ adapter });

const sessionToken = randomBytes(32).toString("hex");
const userId = "c7a7a7a7a7a7a7a7a7a7a002";
const expires = new Date(Date.now() + 86400000);

await prisma.session.create({
  data: { sessionToken, userId, expires },
});

console.log(sessionToken);
await prisma.$disconnect();
