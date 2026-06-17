import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(__dirname, "../../.env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@aqliya.com" },
    select: {
      id: true,
      email: true,
      mfaEnabled: true,
      mfaSecret: true,
      mfaBackupCodes: true,
    },
  });
  if (!user) throw new Error("admin user missing after seed");
  console.log("MFA query OK:", {
    email: user.email,
    mfaEnabled: user.mfaEnabled,
    hasSecret: user.mfaSecret !== null,
    hasBackupCodes: user.mfaBackupCodes !== null,
  });
}

main()
  .catch((e) => {
    console.error("MFA verify FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
