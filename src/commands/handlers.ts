import type { CommandHandler } from '../types/defineConfig';
import commitHandler from './commit';
import logHandler from './log';
import releaseHandler from './release';
import branchHandler from './branch';
import checkoutHandler from './checkout';
import localRemoteHandler from './local-remote';
import rebaseHandler from './rebase';
import stashHandler from './stash';
import revertHandler from './revert';
import configHandler from './config';
import cherryPickHandler from './cherry-pick';
import resetHandler from './reset';
import stageHandler from './stage';

export const commandHandlers: CommandHandler[] = [
  { 
    value: 'commit', 
    label: '✨ Commit - Create a new commit with AI assistance',
    handler: async (config?: any) => {
      await commitHandler(config);
    },
    hint: 'Create a new commit with AI assistance'
  },
  { 
    value: 'log', 
    label: '📜 Log - Browse and search through commit history',
    handler: async (config?: any) => {
      await logHandler(config);
    },
    hint: 'Browse and search through commit history'
  },
  { 
    value: 'release', 
    label: '🚀 Release - Create a new release with version management',
    handler: async (config?: any) => {
      await releaseHandler(config);
    },
    hint: 'Create a new release with version management'
  },
  { 
    value: 'branch', 
    label: '🌿 Branch - Manage Git branches',
    handler: async (config?: any) => {
      await branchHandler(config);
    },
    hint: 'Manage Git branches'
  },
  { 
    value: 'checkout', 
    label: '🔖 Checkout - Switch to another branch or commit', 
    handler: async (config?: any) => {
      await checkoutHandler(config);
    },
    hint: 'Switch to another branch or commit'
  },
  {
    value: 'local-remote',
    label: '🔄 Local-Remote - Manage local and remote repositories',
    handler: async (config?: any) => {
      await localRemoteHandler(config);
    },
    hint: 'Manage local and remote repositories'
  },
  {
    value: 'rebase',
    label: '📋 Rebase - Rebase your branch',
    handler: async (config?: any) => {
      await rebaseHandler(config);
    },
    hint: 'Rebase your branch'
  },
  {
    value: 'stash',
    label: '📦 Stash - Stash your changes',
    handler: async (config?: any) => {
      await stashHandler(config);
    },
    hint: 'Stash your changes'
  },
  {
    value: 'revert',
    label: '⏪ Revert - Revert your changes',
    handler: async (config?: any) => {
      await revertHandler(config);
    },
    hint: 'Revert your changes'
  },
  {
    value: 'config',
    label: '⚙️  Config - Configure Git settings and preferences',
    handler: async (config?: any) => {
      await configHandler(config);
    },
    hint: 'Configure Git settings and preferences'
  },
  {
    value: 'cherry-pick',
    label: '🍒 Cherry-Pick - Cherry-pick commits',
    handler: async (config?: any) => {
      await cherryPickHandler(config);
    },
    hint: 'Cherry-pick commits'
  },
  {
    value: 'reset',
    label: '🔙 Reset - Reset your branch',
    handler: async (config?: any) => {
      await resetHandler(config);
    },
    hint: 'Reset your branch'
  },
  { 
    value: 'staging', 
    label: '📦 Staging - Stage your changes',
    handler: async (config?: any) => {
      await stageHandler(config);
    },
    hint: 'Stage your changes'
  }
];
