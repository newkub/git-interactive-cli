import type { GitAssistanceConfig } from '../types/defineConfig';

export const initializeDeepseekModel = (config: GitAssistanceConfig) => {
  const { deepseek } = config.ai;
  if (!deepseek) {
    throw new Error('Deepseek API key is required');
  }

  return {
    generateCommitMessage: async (_changes: readonly string[]) => {
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseek}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'user',
                content: `Generate a commit message based on these changes: ${_changes.join('\n')}`
              }
            ],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate commit message');
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('Error generating commit message:', error);
        throw error;
      }
    }
  };
};
