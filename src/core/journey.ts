import { ForgeRockApiClient } from './api-client';
import { ConfigParser } from './config';
import { Logger } from '../utils/logger';
import { JourneyConfig, JourneyResult, Callback } from '../types/journey';

export class JourneyRunner {
  private apiClient: ForgeRockApiClient;
  private configParser: ConfigParser;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.apiClient = new ForgeRockApiClient(logger);
    this.configParser = new ConfigParser(logger);
  }

  async runJourney(config: JourneyConfig): Promise<JourneyResult> {
    try {
      this.logger.info(`Starting journey: ${config.journeyName}`);
      
      // Step 1: Initialize journey
      this.logger.step(1, 'Initializing authentication journey');
      const initResponse = await this.apiClient.initJourney({
        platformUrl: config.platformUrl,
        realm: config.realm,
        journeyName: config.journeyName
      });
      
      let currentAuthId = initResponse.authId;
      let currentCallbacks = initResponse.callbacks;
      let stepNumber = 2;
      
      // Step 2+: Process each step
      const stepKeys = Object.keys(config.steps);
      
      for (const stepKey of stepKeys) {
        this.logger.step(stepNumber, `Processing step: ${stepKey}`);
        
        // TODO: Implement callback matching logic
        // For now, this is a placeholder
        const processedCallbacks = this.processCallbacks(currentCallbacks, config.steps[stepKey]);
        
        const continueResponse = await this.apiClient.continueJourney(
          {
            authId: currentAuthId,
            callbacks: processedCallbacks
          },
          config.platformUrl,
          config.realm
        );
        
        // Check if journey is complete
        if (continueResponse.tokenId) {
          this.logger.success('Authentication successful!');
          return {
            success: true,
            tokenId: continueResponse.tokenId,
            successUrl: continueResponse.successUrl
          };
        }
        
        // Continue with next step
        currentAuthId = continueResponse.authId!;
        currentCallbacks = continueResponse.callbacks!;
        stepNumber++;
      }
      
      throw new Error('Journey completed but no token received');
      
    } catch (error: any) {
      this.logger.error(`Journey failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private processCallbacks(callbacks: Callback[], stepConfig: Record<string, string>): Callback[] {
    // TODO: Implement intelligent callback matching
    // This is a placeholder implementation
    this.logger.debug('Processing callbacks (placeholder implementation)');
    
    return callbacks.map(callback => ({
      ...callback,
      input: callback.input.map(input => {
        // Simple matching by input name
        const configValue = stepConfig[input.name];
        return {
          ...input,
          value: configValue || input.value
        };
      })
    }));
  }
}