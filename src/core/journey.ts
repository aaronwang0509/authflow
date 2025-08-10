import { ForgeRockApiClient } from './api-client';
import { ConfigParser } from './config';
import { Logger } from '../utils/logger';
import { JourneyConfig, JourneyResult, Callback } from '../types/journey';
import * as readline from 'readline';

export class JourneyRunner {
  private apiClient: ForgeRockApiClient;
  private configParser: ConfigParser;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.apiClient = new ForgeRockApiClient(logger);
    this.configParser = new ConfigParser(logger);
  }

  async runJourney(config: JourneyConfig, stepMode: boolean = false): Promise<JourneyResult> {
    try {
      this.logger.info(`Starting journey: ${config.journeyName}`);
      
      // Step 1: Initialize journey
      this.logger.step(1, 'Initializing authentication journey');
      const initResponse = await this.apiClient.initJourney({
        platformUrl: config.platformUrl,
        realm: config.realm,
        journeyName: config.journeyName
      });

      if (stepMode) {
        this.logger.success('Journey initialized!');
        this.logger.info(`Auth ID: ${initResponse.authId}`);
        this.logger.info(`Callbacks received: ${initResponse.callbacks.length}`);
        
        const shouldContinue = await this.promptUser('Continue to next step?');
        if (!shouldContinue) {
          return { success: false, error: 'User cancelled journey' };
        }
      }
      
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

        if (stepMode) {
          this.logger.success(`Step ${stepNumber - 1} completed!`);
          this.logger.info(`New Auth ID: ${continueResponse.authId}`);
          this.logger.info(`Callbacks received: ${continueResponse.callbacks?.length || 0}`);
          
          const shouldContinue = await this.promptUser('Continue to next step?');
          if (!shouldContinue) {
            return { success: false, error: 'User cancelled journey' };
          }
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
    this.logger.debug('Processing callbacks with intelligent prompt matching');
    
    return callbacks.map(callback => ({
      ...callback,
      input: callback.input.map(input => {
        // First try intelligent prompt matching
        const configValue = this.matchByPrompt(callback, input.name, stepConfig);
        
        // Fallback to direct field name matching for backward compatibility
        const fallbackValue = stepConfig[input.name];
        
        return {
          ...input,
          value: configValue || fallbackValue || input.value
        };
      })
    }));
  }

  private matchByPrompt(callback: Callback, inputName: string, stepConfig: Record<string, string>): string | undefined {
    // Extract prompt text from callback output
    const promptOutput = callback.output?.find(output => output.name === 'prompt');
    if (!promptOutput) {
      this.logger.debug(`No prompt found for callback type: ${callback.type}`);
      return undefined;
    }

    const promptText = promptOutput.value;
    this.logger.debug(`Looking for prompt: "${promptText}" (field: ${inputName})`);

    // Try exact match first
    if (stepConfig[promptText]) {
      this.logger.debug(`Exact prompt match found: "${promptText}" -> "${stepConfig[promptText]}"`);
      return stepConfig[promptText];
    }

    // Try case-insensitive match
    const lowerPrompt = promptText.toLowerCase();
    for (const [configKey, configValue] of Object.entries(stepConfig)) {
      if (configKey.toLowerCase() === lowerPrompt) {
        this.logger.debug(`Case-insensitive prompt match: "${configKey}" -> "${configValue}"`);
        return configValue;
      }
    }

    // Try fuzzy matching for common patterns
    const fuzzyMatch = this.fuzzyMatchPrompt(promptText, stepConfig);
    if (fuzzyMatch) {
      this.logger.debug(`Fuzzy prompt match: "${promptText}" -> "${fuzzyMatch.key}" -> "${fuzzyMatch.value}"`);
      return fuzzyMatch.value;
    }

    this.logger.debug(`No prompt match found for: "${promptText}"`);
    return undefined;
  }

  private fuzzyMatchPrompt(promptText: string, stepConfig: Record<string, string>): { key: string; value: string } | undefined {
    const lowerPrompt = promptText.toLowerCase();
    
    // Common prompt patterns and their variations
    const patterns = [
      { patterns: ['username', 'user name', 'user', 'email', 'login'], prompt: lowerPrompt },
      { patterns: ['password', 'pass', 'pwd'], prompt: lowerPrompt },
      { patterns: ['code', 'otp', 'token', 'verification', 'verify'], prompt: lowerPrompt },
      { patterns: ['phone', 'mobile', 'sms'], prompt: lowerPrompt }
    ];

    for (const [configKey, configValue] of Object.entries(stepConfig)) {
      const lowerConfigKey = configKey.toLowerCase();
      
      // Check if any pattern matches both prompt and config key
      for (const pattern of patterns) {
        const promptMatches = pattern.patterns.some(p => pattern.prompt.includes(p));
        const configMatches = pattern.patterns.some(p => lowerConfigKey.includes(p));
        
        if (promptMatches && configMatches) {
          return { key: configKey, value: configValue };
        }
      }

      // Check for partial matches (contains)
      if (lowerPrompt.includes(lowerConfigKey) || lowerConfigKey.includes(lowerPrompt)) {
        return { key: configKey, value: configValue };
      }
    }

    return undefined;
  }

  private async promptUser(question: string): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${question} (Y/n): `, (answer) => {
        rl.close();
        // Default to yes if empty or starts with 'y', only no if explicitly 'n' or 'no'
        const lowerAnswer = answer.toLowerCase().trim();
        resolve(lowerAnswer === '' || lowerAnswer === 'y' || lowerAnswer === 'yes' || 
               (lowerAnswer !== 'n' && lowerAnswer !== 'no'));
      });
    });
  }
}