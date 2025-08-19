import jwt from 'jsonwebtoken';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { TokenConfig, TokenResponse, TokenResult, TokenServiceOptions } from '../types/token';

export class TokenService {
  private defaultOptions: TokenServiceOptions = {
    timeout: 30000,
    retries: 1,
    cache: false
  };

  constructor(private options: TokenServiceOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Create a signed JWT for ForgeRock Service Account (mirrors Python create_signed_jwt)
   */
  private createSignedJWT(
    serviceAccountId: string,
    audience: string,
    jwkObject: any,
    expSeconds: number = 899
  ): string {
    const exp = Math.floor(Date.now() / 1000) + expSeconds;
    const jti = randomBytes(16).toString('base64url');

    const payload = {
      iss: serviceAccountId,
      sub: serviceAccountId,
      aud: audience,
      exp: exp,
      jti: jti
    };

    // Convert JWK to PEM format for jsonwebtoken library
    // The jsonwebtoken library expects PEM format, not raw JWK
    const jwkToPem = require('jwk-to-pem');
    const privateKey = jwkToPem(jwkObject, { private: true });
    
    // Sign JWT with private key
    return jwt.sign(payload, privateKey, { 
      algorithm: 'RS256',
      header: { alg: 'RS256' }
    });
  }

  /**
   * Get PAIC Service Account Access Token (mirrors Python get_service_account_access_token)
   */
  async getAccessToken(config: TokenConfig): Promise<TokenResult> {
    try {
      // Parse JWK from JSON string
      const jwkObject = JSON.parse(config.jwk_json);
      
      // Create audience URL
      const audience = config.platform.replace(/\/$/, '') + '/am/oauth2/access_token';
      
      // Create signed JWT
      const signedJWT = this.createSignedJWT(
        config.service_account_id,
        audience,
        jwkObject,
        config.exp_seconds
      );

      // Prepare token exchange request
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const data = new URLSearchParams({
        client_id: 'service-account',
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJWT,
        scope: config.scope
      });

      // Configure request options
      const requestConfig: any = {
        headers,
        timeout: this.options.timeout
      };

      // Add proxy if specified
      if (config.proxy) {
        requestConfig.proxy = false;
        requestConfig.httpsAgent = config.proxy;
      }

      // Configure SSL verification (default: true for security)
      const verifySSL = config.verify_ssl !== undefined ? config.verify_ssl : true;
      
      if (!verifySSL) {
        // Disable SSL verification (matches Python verify=False)
        // Suppress the Node.js warning by capturing original process.emitWarning
        const originalEmitWarning = process.emitWarning;
        process.emitWarning = () => {}; // Suppress warnings temporarily
        
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        requestConfig.rejectUnauthorized = false;
        
        // Restore warning emission after request
        setTimeout(() => {
          process.emitWarning = originalEmitWarning;
        }, 100);
      } else {
        // Ensure SSL verification is enabled
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        requestConfig.rejectUnauthorized = true;
      }

      if (config.verbose) {
        console.log(`Requesting access token for SA=${config.service_account_id}`);
        console.log(`Endpoint: ${audience}`);
        console.log(`Scope: ${config.scope}`);
      }

      // Make token exchange request
      const response = await axios.post(audience, data, requestConfig);

      if (response.status === 200) {
        const tokenData: TokenResponse = response.data;
        
        if (config.verbose) {
          console.log('✅ Access token retrieved successfully');
          console.log(`   Token length: ${tokenData.access_token?.length || 0}`);
          console.log(`   Scope: ${tokenData.scope || 'N/A'}`);
          console.log(`   Expires in: ${tokenData.expires_in || 'N/A'} seconds`);
        }

        return {
          token: tokenData.access_token,
          expires_in: tokenData.expires_in,
          scope: tokenData.scope
        };
      } else {
        throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
      }

    } catch (error: any) {
      if (config.verbose) {
        console.error('❌ Failed to retrieve access token:', error.response?.status || 'Unknown');
        console.error('   Response:', error.response?.data || error.message);
      }
      throw new Error(`Token request failed: ${error.message}`);
    }
  }

  /**
   * Format token output according to specified format
   */
  formatToken(result: TokenResult, format: 'token' | 'bearer' | 'json'): string {
    switch (format) {
      case 'token':
        return result.token;
      case 'bearer':
        return `Bearer ${result.token}`;
      case 'json':
        return JSON.stringify({
          access_token: result.token,
          token_type: 'Bearer',
          expires_in: result.expires_in,
          scope: result.scope
        });
      default:
        return result.token;
    }
  }
}