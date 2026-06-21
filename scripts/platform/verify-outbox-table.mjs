import { prisma } from "../db-utils/prisma.mjs";

const count = await prisma.platformOutboxEvent.count();
console.log(JSON.stringify({ ok: true, platformOutboxEventCount: count }));
await prisma.$disconnect();
