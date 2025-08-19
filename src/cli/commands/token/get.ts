import { Command } from 'commander';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { TokenService } from '../../../core/services/TokenService';
import { TokenConfig } from '../../../core/types/token';

export function createGetCommand(): Command {
  const command = new Command('get');
  
  command
    .description('Generate PAIC Service Account access token from YAML config')
    .option('-C, --config <path>', 'Path to the YAML token configuration file (required)')
    .option('-v, --verbose', 'Enable verbose logging', false)
    .action(async (options) => {
      const configPath = options.config;
      try {
        // Validate required config option
        if (!configPath) {
          console.error('❌ Config file is required. Use -C or --config option.');
          process.exit(1);
        }
        
        // Check if config file exists
        if (!fs.existsSync(configPath)) {
          console.error(`❌ Config file not found: ${configPath}`);
          process.exit(1);
        }
        
        // Load and parse YAML config
        const yamlContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(yamlContent) as TokenConfig;
        
        // Override verbose setting from CLI option
        config.verbose = options.verbose || config.verbose || false;
        
        // Validate required fields
        const requiredFields = ['service_account_id', 'jwk_json', 'platform', 'scope'];
        for (const field of requiredFields) {
          if (!config[field as keyof TokenConfig]) {
            console.error(`❌ Missing required field '${field}' in config file`);
            process.exit(1);
          }
        }
        
        // Set defaults
        config.exp_seconds = config.exp_seconds || 899;
        config.output_format = config.output_format || 'token';
        
        // Create TokenService and get access token
        const tokenService = new TokenService();
        const result = await tokenService.getAccessToken(config);
        
        // Format and output token
        const formattedOutput = tokenService.formatToken(result, config.output_format);
        console.log(formattedOutput);
        
      } catch (error: any) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
    });
  
  return command;
}