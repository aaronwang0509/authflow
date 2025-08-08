// Journey-related type definitions

export interface JourneyConfig {
  platformUrl: string;
  realm: string;
  journeyName: string;
  steps: Record<string, StepConfig>;
}

export interface StepConfig {
  [key: string]: string; // prompt -> value mapping
}

export interface JourneyStep {
  authId: string;
  callbacks: Callback[];
}

export interface Callback {
  type: string;
  output?: Array<{ name: string; value: string }>;
  input: Array<{ name: string; value: string }>;
}

export interface JourneyResult {
  success: boolean;
  tokenId?: string;
  successUrl?: string;
  error?: string;
}