import { defineConfig, type GitAssistanceConfig } from './src/types/defineConfig';

export const defaultConfig: GitAssistanceConfig = {
  ai: {
    useModel: 'deepseek',
    deepseek: 'sk-6373d5e43bba46968807439a004e50e2',
    'gpt-4o': '',
    'claude-3.7-sonnet': ''
  },
  commit: {
    askMode: true,
    askType: false,
    askScope: false,
    askStage: true,
    askConfirm: false,
    askPush: false,
    mode: 'aicommit',
    message: {
      emoji: {
        enabled: true
      },
      instructions: '',
      scope: ['ui', 'backend', 'database', 'infrastructure', 'other'],
      type: [
        {
          value: 'feat',
          label: '✨ feat: New feature',
          description: ''
        },
        {
          value: 'fix',
          label: '🐛 fix: Bug fix',
          description: ''
        },
        {
          value: 'docs',
          label: '📚 docs: Documentation changes',
          description: ''
        },
        {
          value: 'style',
          label: '💅 style: Code style changes (formatting, etc)',
          description: ''
        },
        {
          value: 'refactor',
          label: '♻️ refactor: Code refactoring',
          description: ''
        },
        {
          value: 'perf',
          label: '🚀 perf: Performance improvements',
          description: ''
        },
        {
          value: 'test',
          label: '🧪 test: Adding or updating tests',
          description: ''
        },
        {
          value: 'build',
          label: '🛠️ build: Build system changes',
          description: ''
        },
        {
          value: 'ci',
          label: '👷 ci: CI configuration changes',
          description: ''
        },
        {
          value: 'chore',
          label: '🔧 chore: General maintenance tasks',
          description: ''
        },
        {
          value: 'revert',
          label: '⏪ revert: Revert previous changes',
          description: ''
        }
      ],
      description: {
        required: true,
        maxLength: 100
      },
      bulletPoints: true,
      language: 'english'
    }
  },
  hooks: {
    preCommit: 'npm run lint',
    postCommit: ''
  },
  release: {
    generateChangelog: true,
    versioning: 'semantic',
    publish: ''
  },
  stageOptions: {
    enableStageAll: true,
    enableStageByFolder: true,
    enableStageRelevant: true,
    enableStageManual: true
  }
};

export default defineConfig(defaultConfig);
