import { intro, outro, select, isCancel, multiselect } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';
import type { GitAssistanceConfig } from '../types/defineConfig';

const restore = async (config?: GitAssistanceConfig): Promise<void> => {
  intro(pc.blue('Git Restore Assistant'));

  try {
    // Get staged files
    const { stdout: stagedFiles } = await execa('git', ['diff', '--cached', '--name-only']);
    
    if (!stagedFiles) {
      outro(pc.yellow('No files in staging area to restore'));
      return;
    }
    
    const files = stagedFiles.split('\n').filter(Boolean);
    
    const restoreOption = await select({
      message: 'How would you like to restore files from staging area?',
      options: [
        { value: 'all', label: 'Restore all files', hint: 'git restore --staged .' },
        { value: 'select', label: 'Select specific files', hint: 'git restore --staged <files>' }
      ]
    });

    if (isCancel(restoreOption)) {
      outro(pc.yellow('Operation cancelled'));
      return;
    }

    if (restoreOption === 'all') {
      await execa('git', ['restore', '--staged', '.']);
      outro(pc.green('Successfully restored all files from staging area'));
    } else {
      const selectedFiles = await multiselect({
        message: 'Select files to restore from staging area',
        options: files.map(file => ({ value: file, label: file })),
        required: true
      });

      if (isCancel(selectedFiles)) {
        outro(pc.yellow('Operation cancelled'));
        return;
      }

      await execa('git', ['restore', '--staged', ...selectedFiles]);
      outro(pc.green("Successfully restored selected files from staging area"));
    }
  } catch (error) {
    outro(pc.red(`Error restoring files: ${error}`));
  }
};

export default restore;