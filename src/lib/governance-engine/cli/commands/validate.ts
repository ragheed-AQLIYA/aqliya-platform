import {
  GovernanceValidator,
  ClaimsValidator,
  EvidenceValidator,
  ProductsValidator,
  AuthoritiesValidator,
  RelationshipsValidator,
  IntegrityValidator,
  FreshnessValidator,
  FreezeValidator,
  DecisionsValidator,
} from '../../validators';
import type { GovernanceRegistries } from '../../types/entities';
import type { ValidationResponse } from '../../validators/types';
import { loadRegistries } from '../helpers';

const VALID_TYPES = [
  'claims', 'evidence', 'products', 'authorities',
  'relationships', 'integrity', 'freshness', 'freeze',
  'decisions', 'governance',
] as const;

type ValidateType = typeof VALID_TYPES[number];

function isValidateType(value: string): value is ValidateType {
  return VALID_TYPES.includes(value as ValidateType);
}

function runSyncValidator(
  type: Exclude<ValidateType, 'governance'>,
  registries: GovernanceRegistries,
): ValidationResponse {
  switch (type) {
    case 'claims': return new ClaimsValidator(registries).validate();
    case 'evidence': return new EvidenceValidator(registries).validate();
    case 'products': return new ProductsValidator(registries).validate();
    case 'authorities': return new AuthoritiesValidator(registries).validate();
    case 'relationships': return new RelationshipsValidator(registries).validate();
    case 'integrity': return new IntegrityValidator(registries).validate();
    case 'freshness': return new FreshnessValidator(registries).validate();
    case 'freeze': return new FreezeValidator(registries).validate();
    case 'decisions': return new DecisionsValidator(registries).validate();
  }
}

export async function validateCommand(
  type: string,
  options: { scope?: string; format?: string; strict?: boolean; threshold?: number },
): Promise<number> {
  if (!isValidateType(type)) {
    process.stderr.write(`Unknown validation type "${type}". Valid types: ${VALID_TYPES.join(', ')}\n`);
    return 2;
  }

  const { registries, exitCode } = await loadRegistries(options.scope);
  if (exitCode !== 0) return exitCode;

  let response: ValidationResponse;

  if (type === 'governance') {
    const gov = new GovernanceValidator(registries);
    response = await gov.validate();
  } else {
    response = runSyncValidator(type, registries);
  }

  if (response.status === 'pass') return 0;
  if (response.status === 'warn') return 1;
  return 2;
}
