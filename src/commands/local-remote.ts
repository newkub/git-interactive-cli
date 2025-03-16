import { intro, select, text, confirm, isCancel, outro } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';
import type { GitAssistanceConfig } from '../types/defineConfig';

const localRemoteHandler = async (_config?: GitAssistanceConfig): Promise<void> => {
  intro(pc.bgBlue(' Git Local-Remote Management '));

  try {
    const action = await select({
      message: 'Select action:',
      options: [
        { value: 'fetch', label: 'Fetch from remote', hint: 'git fetch --all' },
        { value: 'push', label: 'Push to remote', hint: 'git push' },
        { value: 'pull', label: 'Pull from remote', hint: 'git pull' },
        { value: 'remote', label: 'Add remote', hint: 'git remote add <name> <url>' },
      ],
    });

    if (isCancel(action)) {
      outro('Operation cancelled');
      return;
    }

    switch (action) {
      case 'fetch': {
        await execa('git', ['fetch', '--all']);
        console.log(pc.green('✓ Fetch completed successfully'));
        break;
      }
      case 'push': {
        await execa('git', ['push']);
        console.log(pc.green('✓ Push completed successfully'));
        break;
      }
      case 'pull': {
        await execa('git', ['pull']);
        console.log(pc.green('✓ Pull completed successfully'));
        break;
      }
      case 'remote': {
        const remoteName = await text({
          message: 'Enter remote name:',
          placeholder: 'origin'
        });

        if (isCancel(remoteName)) {
          outro('Operation cancelled');
          return;
        }

        const remoteUrl = await text({
          message: 'Enter remote URL:',
          placeholder: 'https://github.com/user/repo.git'
        });

        if (isCancel(remoteUrl)) {
          outro('Operation cancelled');
          return;
        }

        await execa('git', ['remote', 'add', remoteName, remoteUrl]);
        console.log(pc.green(`✓ Added remote ${pc.bold(remoteName)} successfully`));
        break;
      }
      default:
        console.error(pc.red('Error:'), 'Invalid action');
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red('Error:'), error);
    process.exit(1);
  } finally {
    outro('Local-Remote operation completed');
  }
};

export default localRemoteHandler;