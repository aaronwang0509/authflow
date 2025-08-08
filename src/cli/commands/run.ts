import { Command } from 'commander';
import { Logger } from '../../utils/logger';
import { FileUtils } from '../../utils/file';
import { ConfigParser } from '../../core/config';
import { JourneyRunner } from '../../core/journey';

export function createRunCommand(): Command {
  const command = new Command('run');
  
  command
    .description('Run an authentication journey using a YAML config file')
    .argument('<file>', 'Path to the YAML configuration file')
    .option('-v, --verbose', 'Enable verbose logging', false)
    .option('-s, --step-by-step', 'Run in step-by-step mode', false)
    .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '30000')
    .action(async (file: string, options) => {
      const logger = new Logger(options.verbose);
      const fileUtils = new FileUtils(logger);
      const configParser = new ConfigParser(logger);
      const journeyRunner = new JourneyRunner(logger);
      
      try {
        // Check if file exists
        if (!(await fileUtils.fileExists(file))) {
          logger.error(`Config file not found: ${file}`);
          process.exit(1);
        }
        
        // Load and parse YAML config
        logger.info(`Loading config from: ${file}`);
        const yamlConfig = await fileUtils.loadYamlConfig(file);
        const journeyConfig = configParser.parseYamlToJourneyConfig(yamlConfig);
        
        // Validate config
        configParser.validateConfig(journeyConfig);
        
        // Run the journey
        const result = await journeyRunner.runJourney(journeyConfig);
        
        if (result.success) {
          logger.success('Journey completed successfully');
          if (result.tokenId) {
            logger.info(`Token ID: ${result.tokenId.substring(0, 20)}...`);
          }
          if (result.successUrl) {
            logger.info(`Success URL: ${result.successUrl}`);
          }
        } else {
          logger.error(`Journey failed: ${result.error}`);
          process.exit(1);
        }
        
      } catch (error: any) {
        logger.error(`Command failed: ${error.message}`);
        process.exit(1);
      }
    });
  
  return command;
}