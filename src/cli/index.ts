#!/usr/bin/env node

import { Command } from 'commander';
import { createRunCommand } from './commands/run';
import { createValidateCommand } from './commands/validate';
import { createStepCommand } from './commands/step';

const program = new Command();

program
  .name('authflow')
  .description('A CLI tool to simulate and test ForgeRock/Ping Identity Cloud authentication journeys')
  .version('0.1.0');

// Add commands
program.addCommand(createRunCommand());
program.addCommand(createValidateCommand());
program.addCommand(createStepCommand());

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help();
}