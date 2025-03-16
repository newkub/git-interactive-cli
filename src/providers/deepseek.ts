import OpenAI from 'openai';
import type { Config, CompletionResponse } from '../types';

type Message = {
  role: 'system' | 'user';
  content: string;
};

type CompletionRequest = {
  messages: Message[];
  model: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
};

const createOpenAIInstance = (apiKey: string) => new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey
});

const createCompletionRequest = (prompt: string, config: Config = {}): CompletionRequest => ({
  messages: [
    { role: 'system', content: 'Generate a concise commit message' },
    { role: 'user', content: prompt }
  ],
  model: config.model || 'deepseek-chat',
  max_tokens: config.maxTokens,
  temperature: config.temperature,
  top_p: config.topP
});

const getCompletionContent = (completion: OpenAI.Chat.Completions.ChatCompletion): CompletionResponse => {
  return {
    content: completion.choices[0].message.content || '',
    usage: completion.usage ? {
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens
    } : undefined
  };
};

export const deepseekClient = async (diff: string, config: Config = {}): Promise<CompletionResponse> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not defined');

  const openai = createOpenAIInstance(apiKey);
  const completion = await openai.chat.completions.create(createCompletionRequest(diff, config));
  return getCompletionContent(completion);
};
