import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const u = await prisma.user.findUnique({
  where: { email: "admin@aqliya.com" },
  select: { email: true, passwordHash: true },
});
const count = await prisma.user.count();
console.log(JSON.stringify({ db: url, platformUsers: count, found: !!u, hasHash: !!u?.passwordHash }));
await prisma.$disconnect();
