import OpenAI from 'openai';

export async function generateWithDeepseek(prompt: string, apiKey: string): Promise<string> {
  const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey
  });
  
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200
  });
  
  return response.choices[0]?.message?.content || 'No response generated';
}
