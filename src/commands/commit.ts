import { intro, outro, select, spinner, text, confirm, isCancel, log } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';
import { defaultConfig } from '../../git-interactive.config';
import { staging } from './stage';
import type { CommitAnswers } from '../types/defineConfig';

async function commitHandler(): Promise<void> {
  const config = defaultConfig.commit;
  intro(pc.bold('🤖 AI Commit Assistant'));

  try {
    const status = await staging();
    if (status.files.length === 0) {
      log.warning('No files staged for commit.');
      return;
    }

    // Select mode if enabled
    let mode = config.mode;
    if (config.askMode) {
      const commitMode = await select({
        message: 'Select commit mode:',
        options: [
          { value: 'aicommit', label: 'AI Commit' },
          { value: 'manual', label: 'Manual Commit' }
        ],
        initialValue: config.mode
      });
      if (isCancel(commitMode)) {
        outro(pc.yellow('Commit cancelled.'));
        return;
      }
      mode = commitMode;
    }

    if (mode === 'aicommit') {
      // Generate commit message using AI
      const spin = spinner();
      spin.start('Generating AI commit message...');
      
      const answers: CommitAnswers = {
        type: config.message.type[0].value,
        scope: '',
        description: '',
        emoji: config.message.emoji.enabled ? config.message.type[0].label.split(' ')[0] : '',
        bulletPoints: []
      };
      
      const commitMessage = formatCommitMessage(answers);
      spin.stop();

      try {
        await execa('git', ['commit', '-m', commitMessage]);
        log.success('Commit created successfully!');
      } catch (error) {
        log.error('Failed to create commit:', error);
      }
    } else {
      // Manual commit logic
      const commitType = await select({
        message: 'Select commit type:',
        options: config.message.type.map(type => ({
          value: type.value,
          label: type.label
        }))
      });
      
      if (isCancel(commitType)) {
        outro(pc.yellow('Commit cancelled.'));
        return;
      }
      
      let scope = '';
      if (config.askScope) {
        scope = await text({
          message: 'Enter scope (optional):',
          placeholder: 'e.g. auth, ui'
        });
        
        if (isCancel(scope)) {
          outro(pc.yellow('Commit cancelled.'));
          return;
        }
      }
      
      const description = await text({
        message: 'Enter commit description:',
        placeholder: 'Brief description of changes',
        validate: (value) => {
          if (!value && config.message.description.required) {
            return 'Description is required';
          }
          if (value.length > config.message.description.maxLength) {
            return `Description must be less than ${config.message.description.maxLength} characters`;
          }
        }
      });
      
      if (isCancel(description)) {
        outro(pc.yellow('Commit cancelled.'));
        return;
      }
      
      const typeObj = config.message.type.find(t => t.value === commitType);
      const emoji = config.message.emoji.enabled && typeObj 
        ? typeObj.label.split(' ')[0] 
        : '';
      
      const answers: CommitAnswers = {
        type: commitType,
        scope: scope,
        description: description,
        emoji,
        bulletPoints: []
      };
      
      const commitMessage = formatCommitMessage(answers);
      
      if (config.askConfirm) {
        const shouldCommit = await confirm({
          message: `Commit with message: "${commitMessage}"?`
        });
        
        if (isCancel(shouldCommit) || !shouldCommit) {
          outro(pc.yellow('Commit cancelled.'));
          return;
        }
      }
      
      try {
        await execa('git', ['commit', '-m', commitMessage]);
        outro(pc.green('✅ Changes committed successfully!'));
        
        if (config.askPush) {
          const shouldPush = await confirm({
            message: 'Push changes to remote?'
          });
          
          if (!isCancel(shouldPush) && shouldPush) {
            const spin = spinner();
            spin.start('Pushing changes...');
            try {
              await execa('git', ['push']);
              spin.stop();
            } catch (error) {
              spin.stop();
              outro(pc.red(`Error pushing changes: ${error}`));
            }
          }
        }
      } catch (error) {
        outro(pc.red(`Error committing changes: ${error}`));
      }
    }
  } catch (error) {
    outro(pc.red(`Error staging files: ${error}`));
  }
}

function formatCommitMessage(answers: CommitAnswers): string {
  const { type, scope, description, emoji } = answers;
  
  let message = `${type}${scope ? `(${scope})` : ''}: ${description}`;

  if (emoji) {
    message += ` ${emoji}`;
  }

  return message;
}

export default commitHandler;
