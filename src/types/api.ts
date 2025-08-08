// API request/response type definitions

export interface InitRequest {
  platformUrl: string;
  realm: string;
  journeyName: string;
}

export interface InitResponse {
  authId: string;
  callbacks: Callback[];
}

export interface ContinueRequest {
  authId: string;
  callbacks: Callback[];
}

export interface ContinueResponse {
  authId?: string;
  callbacks?: Callback[];
  tokenId?: string;
  successUrl?: string;
}

export interface Callback {
  type: string;
  output?: Array<{ name: string; value: string }>;
  input: Array<{ name: string; value: string }>;
}

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}