import Anthropic from '@anthropic-ai/sdk';

type Message = {
  role: 'user';
  content: string;
};

type CompletionRequest = {
  messages: Message[];
  model: string;
  max_tokens: number;
};

type CompletionResponse = {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

type Config = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
};

const createAnthropicClient = (apiKey: string) => new Anthropic({ apiKey });

const createMessage = (prompt: string): Message => ({ role: 'user', content: prompt });

const createCompletionRequest = (model: string, maxTokens: number) => (messages: Message[]): CompletionRequest => ({
  messages,
  model,
  max_tokens: maxTokens
});

const getCompletionText = (completion: Anthropic.Message): string => {
  const firstContent = completion.content[0];
  if (firstContent.type === 'text') {
    return firstContent.text;
  }
  throw new Error('Unexpected content type');
};

const anthropicClient = async (prompt: string, config: Config = {}): Promise<CompletionResponse> => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not defined');

  const anthropic = createAnthropicClient(apiKey);
  const message = createMessage(prompt);
  const model = config.model || 'claude-3-opus-20240229';
  const maxTokens = config.maxTokens || 1000;
  const completionRequest = createCompletionRequest(model, maxTokens)([message]);
  const completion = await anthropic.messages.create(completionRequest);
  
  return {
    content: getCompletionText(completion),
    usage: completion.usage ? {
      promptTokens: completion.usage.input_tokens,
      completionTokens: completion.usage.output_tokens,
      totalTokens: completion.usage.input_tokens + completion.usage.output_tokens
    } : undefined
  };
};

export {
  anthropicClient,
  createAnthropicClient,
  createMessage,
  createCompletionRequest,
  getCompletionText
};
