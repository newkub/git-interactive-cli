import { defineConfig } from './src/types/defineConfig';

export interface CommitConfig {
  askScope: boolean;
  scopes: { value: string; label: string }[];
  askMode: boolean;
  askType: boolean;
  askStage: boolean;
  askConfirm: boolean;
  askPush: boolean;
  mode: string;
  message: {
    scope: string[];
    type: {
      options: {
        value: string;
        description: string;
      }[];
    };
    description: {
      required: boolean;
      maxLength: number;
      format: string;
    };
    translate: string;
    instructions: string;
  };
}

export default defineConfig({
  "ai": {
    "useModel": "deepseek",
    "deepseek": "sk-6373d5e43bba46968807439a004e50e2",
    "gpt-4o": "",
    "claude-3.7-sonnet": ""
  },
  "commit": {
    "askMode" : true,
    "askType": true,
    "askScope": true,
    "askStage": true,
    "askConfirm": true,
    "askPush": false, 
    "mode": "aicommit",
    "message": {
      "scope": ["auth", "ui", "core", "api"],
      "type": {
        "options": [
          { "value": "feat", "description": "A new feature" },
          { "value": "fix", "description": "A bug fix" },
          { "value": "docs", "description": "Documentation only changes" },
          { "value": "style", "description": "Changes that don't affect the meaning of the code" },
          { "value": "refactor", "description": "A code change that neither fixes a bug nor adds a feature" },
          { "value": "test", "description": "Adding missing tests or correcting existing tests" },
          { "value": "chore", "description": "Other changes that don't modify src or test files" }
        ]
      },
      "description": {
        "required": true,
        "maxLength": 100,
        "format": 'bullet'
      },
      "translate": "english",
      "instructions": "Please follow these instructions when committing:\n1. Use clear and concise descriptions\n2. Include relevant issue numbers\n3. Specify testing details"
    }
  },
  "stageOptions": {
    "enableStageAll": true,
    "enableStageByFolder": true,
    "enableStageRelevant": true,
    "enableStageManual": true
  },
  "hooks": {
    "preCommit": "npm run lint",
    "postCommit": ""
  },
  "release": {
    "generateChangelog": true,
    "versioning": "semantic",
    "publish": ""
  }
});