import { YamlConfig } from '../types/config';
import { JourneyConfig, StepConfig } from '../types/journey';
import { Logger } from '../utils/logger';

export class ConfigParser {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  parseYamlToJourneyConfig(yamlConfig: YamlConfig): JourneyConfig {
    this.logger.debug('Parsing YAML config to journey config');
    
    // Convert YAML steps format to our internal format
    const steps: Record<string, StepConfig> = {};
    
    Object.keys(yamlConfig.steps).forEach(stepKey => {
      steps[stepKey] = yamlConfig.steps[stepKey];
    });
    
    return {
      platformUrl: yamlConfig.platformUrl,
      realm: yamlConfig.realm,
      journeyName: yamlConfig.journeyName,
      steps
    };
  }

  validateConfig(config: JourneyConfig): void {
    if (!config.platformUrl.startsWith('http')) {
      throw new Error('Platform URL must start with http or https');
    }
    
    if (!config.realm || config.realm.trim() === '') {
      throw new Error('Realm cannot be empty');
    }
    
    if (!config.journeyName || config.journeyName.trim() === '') {
      throw new Error('Journey name cannot be empty');
    }
    
    if (Object.keys(config.steps).length === 0) {
      throw new Error('At least one step must be defined');
    }
    
    this.logger.debug('Config validation passed');
  }
}