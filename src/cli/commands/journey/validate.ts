import { Command } from 'commander';
import { Logger } from '../../../utils/logger';
import { FileUtils } from '../../../utils/file';
import { ConfigParser } from '../../../core/config';

export function createValidateCommand(): Command {
  const command = new Command('validate');
  
  command
    .description('Validate a YAML configuration file')
    .argument('<file>', 'Path to the YAML configuration file to validate')
    .option('-v, --verbose', 'Enable verbose logging', false)
    .action(async (file: string, options) => {
      const logger = new Logger(options.verbose);
      const fileUtils = new FileUtils(logger);
      const configParser = new ConfigParser(logger);
      
      try {
        // Check if file exists
        if (!(await fileUtils.fileExists(file))) {
          logger.error(`Config file not found: ${file}`);
          process.exit(1);
        }
        
        // Load and parse YAML config
        logger.info(`Validating config file: ${file}`);
        const yamlConfig = await fileUtils.loadYamlConfig(file);
        const journeyConfig = configParser.parseYamlToJourneyConfig(yamlConfig);
        
        // Validate config
        configParser.validateConfig(journeyConfig);
        
        logger.success('Configuration is valid!');
        logger.info(`Journey: ${journeyConfig.journeyName}`);
        logger.info(`Platform: ${journeyConfig.platformUrl}`);
        logger.info(`Realm: ${journeyConfig.realm}`);
        logger.info(`Steps: ${Object.keys(journeyConfig.steps).length}`);
        
      } catch (error: any) {
        logger.error(`Validation failed: ${error.message}`);
        process.exit(1);
      }
    });
  
  return command;
}