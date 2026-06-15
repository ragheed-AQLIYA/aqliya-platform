import type { AbacContext } from "./abac-service";

export interface EvaluatorCondition {
  attribute: string;
  operator: string;
  value: string;
}

export function evaluateCondition(
  condition: EvaluatorCondition,
  context: AbacContext,
): boolean {
  const { attribute, operator, value } = condition;

  if (attribute === "role.slug") {
    return evaluateRoleSlugCondition(operator, value, context);
  }

  const contextValue = resolveContextValue(attribute, context);

  if (contextValue === undefined || contextValue === null) {
    return false;
  }

  return applyOperator(operator, contextValue, value);
}

function evaluateRoleSlugCondition(
  operator: string,
  value: string,
  context: AbacContext,
): boolean {
  const slugs = context.roleSlugs ?? [];
  switch (operator) {
    case "EQUALS":
      return slugs.includes(value);
    case "NOT_EQUALS":
      return !slugs.includes(value);
    case "IN": {
      const values = value.split(",").map((v) => v.trim());
      return values.some((v) => slugs.includes(v));
    }
    case "NOT_IN": {
      const values = value.split(",").map((v) => v.trim());
      return !values.some((v) => slugs.includes(v));
    }
    default:
      return false;
  }
}

function resolveContextValue(attribute: string, context: AbacContext): unknown {
  switch (attribute) {
    case "user.id":
      return context.userId;
    case "user.organizationId":
      return context.organizationId;
    case "resource.ownerId":
      return context.resourceOwnerId;
    case "resource.sensitivity":
      return context.resourceSensitivity;
    case "resource.id":
      return context.resourceId;
    case "resource.type":
      return context.resourceType;
    case "time.hour":
      return (context.requestTime ?? new Date()).getHours();
    case "request.method":
      return context.action;
    default:
      return context.attributes?.[attribute];
  }
}

function applyOperator(
  operator: string,
  contextValue: unknown,
  conditionValue: string,
): boolean {
  switch (operator) {
    case "EQUALS":
      return String(contextValue) === conditionValue;
    case "NOT_EQUALS":
      return String(contextValue) !== conditionValue;
    case "IN": {
      const values = conditionValue.split(",").map((v) => v.trim());
      return values.includes(String(contextValue));
    }
    case "NOT_IN": {
      const values = conditionValue.split(",").map((v) => v.trim());
      return !values.includes(String(contextValue));
    }
    case "GREATER_THAN":
      return Number(contextValue) > Number(conditionValue);
    case "LESS_THAN":
      return Number(contextValue) < Number(conditionValue);
    case "CONTAINS":
      return String(contextValue).includes(conditionValue);
    case "EXISTS":
      return (
        contextValue !== undefined &&
        contextValue !== null &&
        contextValue !== ""
      );
    default:
      return false;
  }
}
