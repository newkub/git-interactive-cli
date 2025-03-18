import OpenAI from 'openai';

export async function generateWithGPT4(prompt: string, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200
  });
  return response.choices[0]?.message?.content || 'No response generated';
}
