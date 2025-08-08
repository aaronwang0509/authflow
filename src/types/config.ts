// Configuration type definitions

export interface CliConfig {
  verbose?: boolean;
  timeout?: number;
  retries?: number;
}

export interface YamlConfig {
  platformUrl: string;
  realm: string;
  journeyName: string;
  steps: Record<string, Record<string, string>>;
}

export interface RunOptions {
  file: string;
  verbose?: boolean;
  stepByStep?: boolean;
  timeout?: number;
}