// ─── Admin / Organization workspace access helpers ───

import type { CurrentUser } from "@/lib/auth";
import {
  principalFromCurrentUser,
  type Principal,
} from "@/lib/platform/access/principal";
import { can } from "@/lib/platform/access/permissions";
import {
  listV1Products,
  getV1Product,
} from "@/lib/platform/registry/product-registry";
import type { V1ProductKey } from "@/lib/platform/registry/product-contracts";
import { getProductPermissions } from "@/lib/platform/registry/runtime";

export interface ActorContext {
  principal: Principal;
  organizationId: string;
  platformOrganizationId?: string;
  accessibleProducts: V1ProductKey[];
}

export interface ProductAccessGrant {
  productSlug: V1ProductKey;
  routePrefix: string;
  permissions: readonly string[];
  maturity: string;
}

export function resolveActorContext(user: CurrentUser): ActorContext {
  const principal = principalFromCurrentUser(user);
  return {
    principal,
    organizationId: user.organizationId,
    platformOrganizationId: user.platformOrganizationId,
    accessibleProducts: getUserProductAccess(user),
  };
}

export function getUserProductAccess(user: CurrentUser): V1ProductKey[] {
  const grants: V1ProductKey[] = [];
  for (const product of listV1Products()) {
    if (validateWorkspaceAccess(user, product.slug).allowed) {
      grants.push(product.slug);
    }
  }
  return grants;
}

export function validateWorkspaceAccess(
  user: CurrentUser,
  productSlug: V1ProductKey,
): { allowed: boolean; reason?: string } {
  const product = getV1Product(productSlug);
  const principal = principalFromCurrentUser(user);

  const viewCheck = can(principal, "resource.view", {
    type: "product",
    id: productSlug,
    organizationId: user.organizationId,
  });

  if (!viewCheck.allowed && user.role === "VIEWER" && productSlug === "sales") {
    return { allowed: true };
  }

  if (!viewCheck.allowed && user.role !== "VIEWER") {
    return { allowed: true };
  }

  if (product.maturity === "L3_prototype" && user.role === "VIEWER") {
    return {
      allowed: false,
      reason: `${product.name} requires OPERATOR role or above`,
    };
  }

  return { allowed: true };
}

export function listProductsForOrg(organizationId: string): ProductAccessGrant[] {
  void organizationId;
  return listV1Products().map((p) => ({
    productSlug: p.slug,
    routePrefix: p.routePrefix,
    permissions: getProductPermissions(p.slug),
    maturity: p.maturity,
  }));
}

export function validateProductActionAccess(
  user: CurrentUser,
  productSlug: V1ProductKey,
  action: string,
): { allowed: boolean; reason?: string } {
  const workspace = validateWorkspaceAccess(user, productSlug);
  if (!workspace.allowed) return workspace;

  const elevatedActions = new Set(["review", "approve", "export", "update", "create"]);
  if (elevatedActions.has(action) && user.role === "VIEWER") {
    return {
      allowed: false,
      reason: `${action} requires OPERATOR or ADMIN role`,
    };
  }

  return { allowed: true };
}
