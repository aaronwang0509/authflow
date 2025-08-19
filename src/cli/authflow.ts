#!/usr/bin/env node

import { Command } from 'commander';
import { createJourneyCommand } from './commands/journey';
import { createTokenCommand } from './commands/token';
import { createVersionCommand } from './commands/version';

const program = new Command();

program
  .name('authflow')
  .description('A CLI tool to simulate and test ForgeRock/Ping Identity Cloud authentication journeys')
  .version('0.1.0', '-v, --version', 'output the version number');

// Add commands
program.addCommand(createJourneyCommand());
program.addCommand(createTokenCommand());
program.addCommand(createVersionCommand());

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help();
}