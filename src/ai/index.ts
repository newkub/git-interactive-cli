import type { GitAssistanceConfig } from '../types/defineConfig';
import { initializeDeepseekModel } from './deepseek';
import { initializeOpenAIModel } from './openai';

export const initializeAIModel = (config: GitAssistanceConfig) => {
  const { useModel } = config.ai;

  switch (useModel) {
    case 'deepseek':
      return initializeDeepseekModel(config);
    case 'openai':
      return initializeOpenAIModel(config);
    default:
      throw new Error('Unsupported AI model');
  }
};