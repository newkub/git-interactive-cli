import { Anthropic } from '@anthropic-ai/sdk';

export async function generateWithClaude(prompt: string, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: 'claude-3-7-sonnet-20240229',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200
  });
  return response.content[0]?.text || 'No response generated';
}
