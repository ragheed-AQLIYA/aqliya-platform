// Governance Engine — Error Types

export class EngineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly severity: 'error' | 'warning' | 'info' = 'error',
    public readonly blocking: boolean = true,
  ) {
    super(message);
    this.name = 'EngineError';
  }
}

export class RegistryError extends EngineError {
  constructor(message: string, public readonly registryPath: string) {
    super(message, 'REGISTRY_ERROR', 'error', true);
    this.name = 'RegistryError';
  }
}

export class ValidationError extends EngineError {
  constructor(
    message: string,
    public readonly ruleId: string,
    public readonly entityId?: string,
  ) {
    super(message, `VAL_${ruleId}`, 'error', true);
    this.name = 'ValidationError';
  }
}

export class FreezeViolation extends EngineError {
  constructor(message: string, public readonly component: string) {
    super(message, 'FREEZE_VIOLATION', 'error', true);
    this.name = 'FreezeViolation';
  }
}

export class EntityNotFoundError extends EngineError {
  constructor(entityType: string, entityId: string) {
    super(`${entityType} not found: ${entityId}`, 'ENTITY_NOT_FOUND', 'error', true);
    this.name = 'EntityNotFoundError';
  }
}

export class CircularDependencyError extends EngineError {
  constructor(entityId: string, path: string[]) {
    super(`Circular dependency detected: ${entityId} at ${path.join(' → ')}`, 'CIRCULAR_DEPENDENCY', 'error', true);
    this.name = 'CircularDependencyError';
  }
}
