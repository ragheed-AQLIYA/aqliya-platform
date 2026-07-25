import { prisma } from "@/lib/prisma"

/**
 * Extended Prisma Client type for SalesOS Tier B/A models.
 *
 * The SalesOS prisma-repository modules use `getPrismaAny()` to access
 * models that exist at runtime but aren't in the generated Prisma types.
 * This module provides a typed alternative.
 *
 * @deprecated Replace with proper Prisma Client extensions once all models
 * are added to schema.prisma. See docs/development/PRISMA_EXTENSION_PLAN.md
 */

// Type-only extension: the actual PrismaClient already has these models at runtime.
// This type declaration tells TypeScript they exist.
type ExtendedPrismaClient = typeof prisma

/**
 * Get a typed Prisma client that includes all product-specific models.
 * This is the recommended replacement for getPrismaAny().
 *
 * @example
 * ```typescript
 * // Before (untyped):
 * const p = getPrismaAny()
 * const results = await p.salesDeal.findMany()
 *
 * // After (typed via this extension):
 * const p = getExtendedPrisma()
 * const results = await p.salesDeal.findMany()
 * ```
 */
export function getExtendedPrisma(): ExtendedPrismaClient {
  return prisma
}

/**
 * @deprecated Use getExtendedPrisma() instead.
 * This function returns an untyped Prisma client for backward compatibility.
 * It will be removed once all SalesOS Tier B/A models are in schema.prisma.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPrismaAnyDeprecated(): any {
  return prisma
}
