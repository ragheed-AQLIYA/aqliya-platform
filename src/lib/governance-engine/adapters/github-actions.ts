import { createLogger } from './logger';
import * as fs from 'node:fs';

const log = createLogger({ product: "governance-engine", action: "github-actions" });

export async function postPRComment(body: string): Promise<void> {
  log.info('PR comment (stub)', { bodyLength: body.length, preview: body.slice(0, 120) });
}

export function setOutput(name: string, value: string): void {
  const output = process.env.GITHUB_OUTPUT;
  if (output) {
    try {
      fs.appendFileSync(output, `${name}=${value}\n`);
    } catch {
      log.warn('setOutput (stub)', { name, value });
    }
  } else {
    log.info('setOutput (stub)', { name, value });
  }
}

export async function annotatePR(
  annotations: Array<{
    file: string;
    line: number;
    message: string;
    severity: 'notice' | 'warning' | 'error';
  }>,
): Promise<void> {
  for (const a of annotations) {
    const msg = `${a.file}:${a.line} — ${a.message}`;
    if (a.severity === 'error') {
      log.error(msg, undefined, { severity: a.severity });
    } else if (a.severity === 'warning') {
      log.warn(msg, { severity: a.severity });
    } else {
      log.info(msg, { severity: a.severity });
    }
  }
}
