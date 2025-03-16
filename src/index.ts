import pc from 'picocolors';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import nodeFzf from 'node-fzf';
import commitHandler from './commands/commit';
import logHandler from './commands/log';
import releaseHandler from './commands/release';
import branchHandler from './commands/branch';
import checkoutHandler from './commands/checkout';
import localRemoteHandler from './commands/local-remote';
import rebaseHandler from './commands/rebase';
import stashHandler from './commands/stash';
import revertHandler from './commands/revert';
import configHandler from './commands/config';
import cherryPickHandler from './commands/cherry-pick';
import resetHandler from './commands/reset';
import stageHandler from './commands/stage';

import type { GitAssistanceConfig } from './types/defineConfig';

const execPromise = promisify(execCallback);

interface CommandHandler {
  value: string;
  label: string;
  handler: (config?: GitAssistanceConfig) => Promise<unknown>;
  hint?: string;
}

/**
 * Executes a shell command and returns the output
 */
export const runCommand = async (command: string): Promise<string> => {
  try {
    const { stdout } = await execPromise(command);
    return stdout.trim();
  } catch (error) {
    console.error(`Command failed: ${command}`, error);
    throw error;
  }
};

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    console.log(`\n${pc.magenta('🚀')} ${pc.bold(pc.cyan('Git Assistance'))} ${pc.magenta('✨')}`);
    console.log(`${pc.dim(pc.italic('Ready to enhance your Git workflow with AI assistance'))}\n`);

    const commandHandlers: CommandHandler[] = [
      { 
        value: 'commit', 
        label: '✨ Commit - Create a new commit with AI assistance',
        handler: commitHandler,
        hint: 'Create a new commit with AI assistance'
      },
      { 
        value: 'log', 
        label: '📜 Log - Browse and search through commit history',
        handler: logHandler,
        hint: 'Browse and search through commit history'
      },
      { 
        value: 'release', 
        label: '🚀 Release - Create a new release with version management',
        handler: releaseHandler,
        hint: 'Create a new release with version management'
      },
      { 
        value: 'branch', 
        label: '🌿 Branch - Manage Git branches',
        handler: branchHandler,
        hint: 'Manage Git branches'
      },
      { 
        value: 'checkout', 
        label: '🔖 Checkout - Switch to another branch or commit', 
        handler: checkoutHandler,
        hint: 'Switch to another branch or commit'
      },
      {
        value: 'local-remote',
        label: '🔄 Local-Remote - Manage local and remote repositories',
        handler: localRemoteHandler,
        hint: 'Manage local and remote repositories'
      },
      {
        value: 'rebase',
        label: '📋 Rebase - Rebase your branch',
        handler: rebaseHandler,
        hint: 'Rebase your branch'
      },
      {
        value: 'stash',
        label: '📦 Stash - Stash your changes',
        handler: stashHandler,
        hint: 'Stash your changes'
      },
      {
        value: 'revert',
        label: '⏪ Revert - Revert your changes',
        handler: revertHandler,
        hint: 'Revert your changes'
      },
      {
        value: 'config',
        label: '⚙️  Config - Configure Git settings and preferences',
        handler: configHandler,
        hint: 'Configure Git settings and preferences'
      },
      {
        value: 'cherry-pick',
        label: '🍒 Cherry-Pick - Cherry-pick commits',
        handler: cherryPickHandler,
        hint: 'Cherry-pick commits'
      },
      {
        value: 'reset',
        label: '🔙 Reset - Reset your branch',
        handler: resetHandler,
        hint: 'Reset your branch'
      },
      { 
        value: 'staging', 
        label: '📦 Staging - Stage your changes',
        handler: stageHandler,
        hint: 'Stage your changes'
      }
    ];
    
    console.log(pc.cyan('Select a command (use arrow keys and Enter to select):'));
    
    const { selected } = await nodeFzf({
      list: commandHandlers.map(c => c.label),
      fzf: {
        layout: 'reverse',
        height: '50%',
        border: 'rounded',
      }
    });
    
    if (!selected) {
      console.log(pc.red('\nOperation cancelled'));
      process.exit(0);
    }
    
    const selectedIndex = selected.index;
    const selectedCommand = commandHandlers[selectedIndex];

    console.log(pc.green(`\nExecuting: ${selectedCommand.label.split(' - ')[0]}`));
    await selectedCommand.handler({} as GitAssistanceConfig);
  } catch (error) {
    console.error(pc.red('Failed to initialize:'), error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\nOperation cancelled');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nOperation terminated');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled promise rejection:', error);
  process.exit(1);
});

main().catch(console.error);
