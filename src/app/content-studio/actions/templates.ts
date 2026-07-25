"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import {
  ContentStudioError,
  createTemplate as csCreateTemplate,
  getTemplate as csGetTemplate,
  listTemplates as csListTemplates,
} from "@/lib/platform/content-studio";
import type { CreateTemplateData } from "@/lib/platform/content-studio";
import { safe, revalidateAll } from "./common";

export async function createTemplateAction(data: CreateTemplateData) {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
    const template = await csCreateTemplate(user.organizationId, data, user.id);
    revalidateAll();
    revalidatePath("/content-studio/templates");
    return template;
  });
}

export async function listTemplatesAction() {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
    return csListTemplates(user.organizationId);
  });
}

export async function getTemplateAction(id: string) {
  return safe(async () => {
    const _user = await getCurrentUser();
if (!hasRequiredRole(_user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
    const template = await csGetTemplate(id);
    if (!template) throw new ContentStudioError("Template not found");
    return template;
  });
}
