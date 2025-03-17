type ModelType = 'deepseek' | 'gpt-4o' | 'claude-3.7-sonnet';
type VersioningType = 'semantic' | 'calendar' | 'other';
type Language = 'english' | 'mandarin' | 'hindi' | 'spanish' | 'french' | 'arabic' | 'bengali' | 'russian' | 'portuguese' | 'indonesian' | 'urdu' | 'german' | 'japanese' | 'swahili' | 'marathi' | 'telugu' | 'turkish' | 'tamil' | 'vietnamese' | 'thai';

type CommitMode = 'aicommit' | 'manual';

interface CommitTypeOption {
  value: string;
  label: string;
  description: string;
}

interface AIConfig {
  useModel: ModelType;
  deepseek: string;
  'gpt-4o': string;
  'claude-3.7-sonnet': string;
}

interface CommitAnswers {
  type: string;
  scope?: string;
  description: string;
  bulletPoints?: string[];
  emoji?: string;
}

interface CommitMessageConfig {
  emoji: {
    enabled: boolean;
  };
  instructions: string;
  scope: string[];
  type: CommitTypeOption[];
  description: {
    required: boolean;
    maxLength: number;
    format?: 'long' | 'bullet';
  };
  bulletPoints: boolean;
  language: Language;
}

interface CommitConfig {
  mode: CommitMode;
  askMode: boolean;
  askType: boolean;
  askScope: boolean;
  askStage: boolean;
  askConfirm: boolean;
  askPush: boolean;
  message: CommitMessageConfig;
}

interface HooksConfig {
  preCommit: string;
  postCommit: string;
}

interface ReleaseConfig {
  generateChangelog: boolean;
  versioning: VersioningType;
  publish: string;
}

interface GitAssistanceConfig {
  ai: AIConfig;
  commit: CommitConfig;
  commitMessage?: {
    emoji: boolean;
    scope: boolean;
    type: boolean;
    bulletPoints: boolean;
  };
  hooks: HooksConfig;
  release: ReleaseConfig;
  stageOptions: {
    enableStageAll: boolean;
    enableStageByFolder: boolean;
    enableStageRelevant: boolean;
    enableStageManual: boolean;
  };
}

const defaultConfig: GitAssistanceConfig = {
  ai: {
    useModel: 'deepseek',
    deepseek: '',
    'gpt-4o': '',
    'claude-3.7-sonnet': ''
  },
  commit: {
    mode: 'aicommit',
    askMode: true,
    askType: true,
    askScope: true,
    askStage: true,
    askConfirm: true,
    askPush: true,
    message: {
      emoji: {
        enabled: true
      },
      instructions: 'Explain the changes you made in this commit. Be specific and concise.',
      scope: ['ui', 'backend', 'database', 'infrastructure', 'other'],
      type: [],
      description: {
        required: true,
        maxLength: 100,
      },
      bulletPoints: true,
      language: 'english'
    }
  },
  commitMessage: {
    emoji: true,
    scope: true,
    type: true,
    bulletPoints: true
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

function defineConfig(config: GitAssistanceConfig): GitAssistanceConfig {
  return config;
}

export type {
  ModelType,
  VersioningType,
  Language,
  CommitMode,
  CommitTypeOption,
  AIConfig,
  CommitAnswers,
  CommitMessageConfig,
  CommitConfig,
  HooksConfig,
  ReleaseConfig,
  GitAssistanceConfig
};
export {
  defaultConfig,
  defineConfig
};