import { Command } from 'commander';
import { createRunCommand } from './run';
import { createValidateCommand } from './validate';

export function createJourneyCommand(): Command {
  const command = new Command('journey');
  
  command
    .description('Authentication journey testing commands')
    .addCommand(createRunCommand())
    .addCommand(createValidateCommand());
  
  return command;
}