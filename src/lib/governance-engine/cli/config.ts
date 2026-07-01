export interface CLIConfig {
  strict: boolean;
  format: 'cli' | 'json' | 'ci';
  threshold: number;
}
export const DEFAULT_CONFIG: CLIConfig = { strict: false, format: 'cli', threshold: 90 };
