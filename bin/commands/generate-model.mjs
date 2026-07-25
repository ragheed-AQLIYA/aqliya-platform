import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

function toCamel(name) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function toPascal(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function toPlural(name) {
  if (name.endsWith("y")) return name.slice(0, -1) + "ies";
  if (name.endsWith("s")) return name + "es";
  return name + "s";
}

export async function run(args) {
  if (args.length === 0) {
    console.error("Usage: aqliya generate:model <ModelName>");
    console.error("Example: aqliya generate:model Task");
    process.exitCode = 1;
    return;
  }

  const name = toPascal(args[0]);
  const camel = toCamel(name);
  const plural = toPlural(camel);
  const prismaPath = join(process.cwd(), "prisma", "schema.prisma");
  const actionsDir = join(process.cwd(), "src", "actions");
  const actionsPath = join(actionsDir, `${camel}-actions.ts`);

  if (!existsSync(prismaPath)) {
    console.error(`Prisma schema not found at ${prismaPath}`);
    process.exitCode = 1;
    return;
  }

  if (!existsSync(actionsDir)) {
    mkdirSync(actionsDir, { recursive: true });
  }

  if (existsSync(actionsPath)) {
    console.error(`Actions file already exists: ${actionsPath}`);
    process.exitCode = 1;
    return;
  }

  const schemaContent = readFileSync(prismaPath, "utf8");

  if (schemaContent.includes(`model ${name}`)) {
    console.error(`Model "${name}" already exists in schema.prisma`);
    process.exitCode = 1;
    return;
  }

  const modelBlock = `

model ${name} {
  id             String   @id @default(cuid())
  organizationId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  createdBy      String?

  @@map("${plural}")
}
`;

  writeFileSync(prismaPath, schemaContent.trimEnd() + modelBlock, "utf8");
  console.log(`✅ Prisma model "${name}" appended to prisma/schema.prisma`);

  const actionsContent = `"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ${name} } from "@prisma/client";

export type ${name}CreateInput = {
  organizationId?: string;
};

export type ${name}UpdateInput = Partial<${name}CreateInput>;

export async function create${name}(data: ${name}CreateInput): Promise<${name}> {
  const user = await getCurrentUser();

  return prisma.${camel}.create({
    data: {
      ...data,
      createdBy: user.id,
    },
  });
}

export async function get${name}(id: string): Promise<${name} | null> {
  await getCurrentUser();

  return prisma.${camel}.findUnique({ where: { id } });
}

export async function list${toPlural(name)}(organizationId?: string): Promise<${name}[]> {
  await getCurrentUser();

  return prisma.${camel}.findMany({
    where: organizationId ? { organizationId } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function update${name}(id: string, data: ${name}UpdateInput): Promise<${name}> {
  await getCurrentUser();

  return prisma.${camel}.update({
    where: { id },
    data,
  });
}

export async function delete${name}(id: string): Promise<void> {
  await getCurrentUser();

  await prisma.${camel}.delete({ where: { id } });
}
`;

  writeFileSync(actionsPath, actionsContent, "utf8");
  console.log(`✅ Server actions created at src/actions/${camel}-actions.ts`);

  console.log(`\n📋 ${name} model generated successfully.
   - Model: prisma/schema.prisma (model ${name})
   - Actions: src/actions/${camel}-actions.ts

Next steps:
   1. Add fields to the model in schema.prisma
   2. Run: npx prisma generate
   3. Run: npx prisma migrate dev --name add_${camel}
`);
}
