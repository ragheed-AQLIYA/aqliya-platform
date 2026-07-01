import { ReportGenerator } from '../../generators';
import { loadRegistries } from '../helpers';

const VALID_REPORT_TYPES = ['summary', 'full', 'findings', 'freshness'] as const;

type ReportType = typeof VALID_REPORT_TYPES[number];

function isReportType(value: string): value is ReportType {
  return VALID_REPORT_TYPES.includes(value as ReportType);
}

export async function reportCommand(
  type: string,
  options: { format?: string; output?: string },
): Promise<number> {
  if (!isReportType(type)) {
    process.stderr.write(`Unknown report type "${type}". Valid types: ${VALID_REPORT_TYPES.join(', ')}\n`);
    return 2;
  }

  const { registries, exitCode } = await loadRegistries();
  if (exitCode !== 0) return exitCode;

  const reportGen = new ReportGenerator();
  const result = reportGen.generate(registries, {});

  if (options.output) {
    try {
      const fs = await import('node:fs/promises');
      await fs.writeFile(options.output, result.content, 'utf-8');
      process.stdout.write(`Report written to ${options.output}\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Failed to write report to ${options.output}: ${message}\n`);
      return 1;
    }
  } else {
    process.stdout.write(result.content + '\n');
  }

  return 0;
}
