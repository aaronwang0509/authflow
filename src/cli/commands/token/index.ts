import { Command } from 'commander';
import { createGetCommand } from './get';

export function createTokenCommand(): Command {
  const command = new Command('token');
  
  command
    .description('JWT token generation and management commands')
    .addCommand(createGetCommand());
  
  return command;
}