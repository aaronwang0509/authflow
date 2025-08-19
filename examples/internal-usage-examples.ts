// Examples of how TokenService will be used internally by other commands

import { TokenService } from '../src/core/services/TokenService';
import { TokenConfig } from '../src/core/types/token';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

// Example 1: API Testing Command using TokenService
class APITestCommand {
  private tokenService = new TokenService();

  async testEndpoints(configPath: string) {
    // Load token config from file
    const tokenConfig = this.loadTokenConfig(configPath);
    
    // Get access token internally
    const result = await this.tokenService.getAccessToken(tokenConfig);
    
    // Use token for API calls
    const headers = {
      'Authorization': `Bearer ${result.token}`,
      'Content-Type': 'application/json'
    };
    
    // Make authenticated API calls...
    console.log('Testing APIs with token:', result.token.substring(0, 20) + '...');
  }

  private loadTokenConfig(configPath: string): TokenConfig {
    const yamlContent = fs.readFileSync(configPath, 'utf8');
    return yaml.load(yamlContent) as TokenConfig;
  }
}

// Example 2: Journey Runner using TokenService for authenticated flows
class JourneyRunner {
  private tokenService = new TokenService();

  async runAuthenticatedJourney(journeyConfig: any, tokenConfigPath?: string) {
    let authToken = '';
    
    if (tokenConfigPath) {
      // Some journeys need pre-authentication
      const tokenConfig = yaml.load(fs.readFileSync(tokenConfigPath, 'utf8')) as TokenConfig;
      const result = await this.tokenService.getAccessToken(tokenConfig);
      authToken = result.token;
    }
    
    // Run journey with optional authentication
    console.log('Running journey with auth:', authToken ? 'YES' : 'NO');
  }
}

// Example 3: Programmatic TokenService usage (no file)
class ProgrammaticExample {
  private tokenService = new TokenService();

  async getTokenFromMemory() {
    const tokenConfig: TokenConfig = {
      service_account_id: 'my-service-account',
      jwk_json: '{"kty":"RSA","n":"...","e":"AQAB","d":"..."}',
      platform: 'https://my-forgerock.com',
      scope: 'fr:am:* fr:idm:*',
      exp_seconds: 899,
      output_format: 'token'
    };
    
    // Get token without any file I/O
    const result = await this.tokenService.getAccessToken(tokenConfig);
    return result.token;
  }
}

// Example 4: Cross-command configuration sharing
class ConfigurableCommand {
  private tokenService = new TokenService();

  async executeWithToken(mainConfig: any) {
    // Main config references token config
    if (mainConfig.token_config_path) {
      const tokenConfig = yaml.load(fs.readFileSync(mainConfig.token_config_path, 'utf8')) as TokenConfig;
      const result = await this.tokenService.getAccessToken(tokenConfig);
      
      // Use token for this command's operations
      return this.doWork(result.token);
    }
    
    // Fall back to unauthenticated mode
    return this.doWork(null);
  }

  private async doWork(token: string | null) {
    console.log('Working with token:', token ? 'authenticated' : 'anonymous');
  }
}