import { intro, outro, select, isCancel, multiselect } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';
import type { GitAssistanceConfig } from '../types/defineConfig';
import { getGitStatus, displayDetailedChanges } from '../utils/git';

const staging = async (config: GitAssistanceConfig) => {
  intro(pc.blue('Git Staging Assistant'));

  try {
    const status = await getGitStatus();
    
    if (status.files.length === 0) {
      outro(pc.yellow('No changes to stage'));
      return;
    }
    
    displayDetailedChanges(status.files);

    const stageOption = await select({
      message: 'How would you like to stage your changes?',
      options: [
        { value: 'all', label: 'Stage all changes', hint: 'git add .' },
        { value: 'files', label: 'Stage specific files', hint: 'git add <files>' }
      ]
    });

    if (isCancel(stageOption)) {
      outro(pc.yellow('Staging cancelled'));
      return;
    }

    if (stageOption === 'all') {
      await execa('git', ['add', '.']);
      outro(pc.green('All changes staged successfully'));
    } else {
      const files = status.files.map(fileStatus => {
        const status = fileStatus.substring(0, 2).trim();
        const filePath = fileStatus.substring(3);
        let statusHint = '';
        
        switch(status) {
          case 'M': statusHint = 'Modified'; break;
          case 'A': statusHint = 'Added'; break;
          case 'D': statusHint = 'Deleted'; break;
          case '??': statusHint = 'Untracked'; break;
          default: statusHint = status;
        }
        
        return {
          value: filePath,
          label: filePath,
          hint: statusHint
        };
      });

      const selectedFiles = await multiselect({
        message: 'Select files to stage',
        options: files,
        required: false
      });

      if (isCancel(selectedFiles)) {
        outro(pc.yellow('Staging cancelled'));
        return;
      }

      if ((selectedFiles as string[]).length > 0) {
        await execa('git', ['add', ...(selectedFiles as string[])]);
        outro(pc.green('Selected files staged successfully'));
      } else {
        outro(pc.yellow('No files selected for staging'));
      }
    }
  } catch (error) {
    outro(pc.red(`Error staging files: ${error}`));
  }
};

export default staging;
