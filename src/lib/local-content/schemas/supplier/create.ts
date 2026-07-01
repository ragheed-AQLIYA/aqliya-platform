import { z } from "zod";
import {
  requiredText,
  optionalText,
  optionalPercentage,
  optionalSupplierLocality,
  optionalOwnershipType,
} from "../common";

/**
 * Schema for `createLocalContentSupplierAction`.
 *
 * All fields come from FormData. name is required; others are optional.
 * Shared between create and update (update makes fields optional).
 */
export const createSupplierSchema = z.object({
  name: requiredText,
  crNumber: optionalText,
  localityClassification: optionalSupplierLocality,
  localContentPercentage: optionalPercentage,
  ownershipType: optionalOwnershipType,
  workforceLocalPct: optionalPercentage,
});

/**
 * Schema for `updateLocalContentSupplierAction`.
 *
 * All fields are optional on update (partial).
 * If a field is not provided, the existing value is preserved in the service layer.
 */
export const updateSupplierSchema = createSupplierSchema.partial();
