import type { CLIConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import { validateCommand } from './commands/validate';
import { generateCommand } from './commands/generate';
import { reportCommand } from './commands/report';
import { statusCommand } from './commands/status';
import { auditCommand } from './commands/audit';
import { formatCLI } from './formatters/cli-formatter';
import { formatJSON } from './formatters/json-formatter';
import { formatCI } from './formatters/ci-formatter';
import type { ValidationResponse } from '../validators/types';

export interface CLI {
  validate(type: string, options?: { scope?: string; format?: string; strict?: boolean; threshold?: number }): Promise<number>;
  generate(artifact: string, options?: { product?: string; force?: boolean }): Promise<number>;
  report(type: string, options?: { format?: string; output?: string }): Promise<number>;
  status(): Promise<number>;
  audit(options?: { scope?: string; output?: string }): Promise<number>;
}

function formatResult(result: unknown, config: CLIConfig): void {
  switch (config.format) {
    case 'json':
      process.stdout.write(formatJSON(result));
      break;
    case 'ci':
      process.stdout.write(formatCI(result as Parameters<typeof formatCI>[0]));
      break;
    case 'cli':
    default:
      process.stdout.write(formatCLI(result));
      break;
  }
}

export function createCLI(config?: Partial<CLIConfig>): CLI {
  const resolved: CLIConfig = { ...DEFAULT_CONFIG, ...config };

  return {
    async validate(type: string, options?: { scope?: string; format?: string; strict?: boolean; threshold?: number }): Promise<number> {
      const mergedOptions = {
        ...options,
        strict: options?.strict ?? resolved.strict,
        threshold: options?.threshold ?? resolved.threshold,
      };

      const originalWrite = process.stdout.write.bind(process.stdout);

      const exitCode = await validateCommand(type, mergedOptions);

      return exitCode;
    },

    async generate(artifact: string, options?: { product?: string; force?: boolean }): Promise<number> {
      return generateCommand(artifact, options ?? {});
    },

    async report(type: string, options?: { format?: string; output?: string }): Promise<number> {
      const mergedOptions = {
        ...options,
        format: options?.format ?? resolved.format,
      };
      return reportCommand(type, mergedOptions);
    },

    async status(): Promise<number> {
      return statusCommand();
    },

    async audit(options?: { scope?: string; output?: string }): Promise<number> {
      return auditCommand(options ?? {});
    },
  };
}
