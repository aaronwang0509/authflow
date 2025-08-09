import { Command } from 'commander';

export function createVersionCommand(): Command {
  const command = new Command('version');
  
  command
    .description('Show version information')
    .action(() => {
      console.log('0.1.0');
    });
  
  return command;
}