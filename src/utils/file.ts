import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import { YamlConfig } from '../types/config';
import { Logger } from './logger';

export class FileUtils {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async loadYamlConfig(filePath: string): Promise<YamlConfig> {
    try {
      this.logger.debug(`Loading YAML config from: ${filePath}`);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const config = yaml.load(fileContent) as YamlConfig;
      
      // Basic validation
      if (!config.platformUrl || !config.realm || !config.journeyName) {
        throw new Error('Missing required fields: platformUrl, realm, or journeyName');
      }
      
      return config;
    } catch (error: any) {
      this.logger.error(`Failed to load YAML config: ${error.message}`);
      throw error;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}