export interface TokenConfig {
  service_account_id: string;
  jwk_json: string;  // JWK as JSON string - generic structure, no assumptions
  platform: string;
  scope: string;
  exp_seconds: number;
  proxy?: string | null;
  verbose?: boolean;
  output_format: 'token' | 'bearer' | 'json';
  verify_ssl?: boolean;  // SSL certificate verification (default: true)
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export interface TokenServiceOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface TokenResult {
  token: string;
  expires_in?: number;
  scope?: string;
}