import { intro, select, text, confirm, isCancel, outro, multiselect, spinner } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';
import { generateCommitMessage } from '../utils/git';
import type { GitAssistanceConfig } from '../types/defineConfig';
import config from '../../git-interactive.config';

const getStageOptions = (config: GitAssistanceConfig) => {
  const options = [];

  if (config.stageOptions.enableStageAll) {
    options.push({ value: 'all', label: 'Stage all changes' });
  }
  if (config.stageOptions.enableStageByFolder) {
    options.push({ value: 'folder', label: 'Stage by folder' });
  }
  if (config.stageOptions.enableStageRelevant) {
    options.push({ value: 'relevant', label: 'Stage relevant files (AI)' });
  }
  if (config.stageOptions.enableStageManual) {
    options.push({ value: 'manual', label: 'Stage manually' });
  }

  return options;
};

const handleStageSelection = async (selection: string) => {
  switch (selection) {
    case 'all': {
      await execa('git', ['add', '.']);
      break;
    }
    case 'folder': {
      const folder = await select({
        message: 'Select folder to stage',
        options: await getFolderOptions()
      });
      if (!isCancel(folder)) {
        await execa('git', ['add', folder as string]);
      }
      break;
    }
    case 'relevant': {
      // AI-based staging logic
      break;
    }
    case 'manual': {
      const { stdout: changedFiles } = await execa('git', ['status', '--porcelain']);
      const files = changedFiles.trim().split('\n').map(fileStatus => ({
        value: fileStatus.substring(3),
        label: fileStatus.substring(3),
        hint: fileStatus.substring(0, 2).trim()
      }));

      const selectedFiles = await multiselect({
        message: 'Select files to stage',
        options: files,
        required: false
      });

      if (!isCancel(selectedFiles)) {
        await execa('git', ['add', ...(selectedFiles as string[])]);
      }
      break;
    }
  }
};

const getFolderOptions = async (): Promise<{ value: string; label: string }[]> => {
  const { stdout: folders } = await execa('git', ['ls-files', '--others', '--directory']);
  return folders.trim().split('\n').map(folder => ({ value: folder, label: folder }));
};

export async function commit(_config?: GitAssistanceConfig): Promise<void> {
  intro(pc.bgBlue(' Git AI Commit '));
  
  try {
    // Check for staged files
    const { stdout: stagedFiles } = await execa('git', ['diff', '--name-only', '--staged']);
    
    if (!stagedFiles.trim()) {
      // แสดงรายการไฟล์ที่เปลี่ยนแปลง
      const changedFiles = await execa('git', ['status', '--porcelain']);
      if (changedFiles.stdout.trim()) {
        console.log('Changed files:');
        for (const fileStatus of changedFiles.stdout.trim().split('\n')) {
          const status = fileStatus.substring(0, 2).trim();
          const filePath = fileStatus.substring(3);
          let statusText = '';
          let color = pc.white;

          switch (status) {
            case 'M':
              statusText = '(Modified)';
              color = pc.green;
              break;
            case 'A':
              statusText = '(Added)';
              color = pc.green;
              break;
            case 'D':
              statusText = '(Deleted)';
              color = pc.red;
              break;
            default:
              statusText = `(${status})`;
          }

          console.log(color(`${statusText} ${filePath}`));
        }
      }

      const stageOptions = getStageOptions(config);
      const stageSelection = await select({
        message: 'Select staging option:',
        options: stageOptions
      });
      
      if (isCancel(stageSelection)) {
        outro('Operation cancelled');
        return;
      }
      
      await handleStageSelection(stageSelection);
      console.log(pc.green('✓ Changes staged'));
    }
    
    const commitType = config.commit.askType ? await select({
      message: 'Select commit type:',
      options: config.commit.message.type.options.map(option => ({
        value: option.value,
        label: `${option.value.charAt(0).toUpperCase() + option.value.slice(1)}: ${option.description}`,
      })),
    }) : 'feat';
    
    if (isCancel(commitType)) {
      outro('Operation cancelled');
      return;
    }
    
    const commitScope = config.commit.askScope ? await select({
      message: 'Select scope:',
      options: config.commit.message.scope.map(s => ({ value: s, label: s }))
    }) : '';
    
    if (isCancel(commitScope)) {
      outro('Operation cancelled');
      return;
    }
    
    const commitDescription = await text({
      message: 'Enter commit description:',
      placeholder: 'Brief description of the changes',
      validate: (value) => {
        if (config.commit.message.description.required && !value.trim()) return 'Description is required';
        if (value.length > config.commit.message.description.maxLength) return `Description is too long (max ${config.commit.message.description.maxLength} characters)`;
        return;
      },
    });
    
    if (isCancel(commitDescription)) {
      outro('Operation cancelled');
      return;
    }
    
    const commitMessage = generateCommitMessage(
      {
        emoji: { enabled: true }, translate: { enabled: false },
        bulletPoints: {
          enabled: false,
          maxItems: 0
        }
      },
      {
        type: commitType as string,
        scope: commitScope as string,
        description: commitDescription as string,
        emoji: '✨',
        bulletPoints: []
      }
    );
    
    const shouldCommit = await confirm({
      message: `Commit with message: "${commitMessage}"?`,
      initialValue: true,
    });
    
    if (isCancel(shouldCommit) || !shouldCommit) {
      outro('Operation cancelled');
      return;
    }
    
    await execa('git', ['commit', '-m', commitMessage]);
    console.log(pc.green('✓ Changes committed successfully'));
    
    const shouldPush = await confirm({
      message: 'Push changes to remote?',
      initialValue: config.commit.askPush,
    });
    
    if (isCancel(shouldPush)) {
      outro('Push cancelled');
      return;
    }
    
    if (shouldPush) {
      await execa('git', ['push']);
      console.log(pc.green('✓ Changes pushed to remote'));
    }
    
    outro('All done! 🎉');
  } catch (error) {
    console.error(pc.red('An error occurred:'), error);
    outro(pc.red('Failed to complete the operation'));
  }
}

export default commit;
