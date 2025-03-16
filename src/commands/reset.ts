import { intro, outro, select, confirm, spinner } from '@clack/prompts';
import { execa } from 'execa';

const resetHandler = async (): Promise<void> => {
  intro('🔄 Reset your branch');

  try {
    const resetType = await select({
      message: 'Select reset type:',
      options: [
        { value: 'soft', label: 'Soft - Keep changes in working directory' },
        { value: 'mixed', label: 'Mixed - Keep changes in staging area' },
        { value: 'hard', label: 'Hard - Discard all changes' },
      ],
    });

    if (typeof resetType !== 'string') {
      outro('Operation cancelled');
      return;
    }

    const s = spinner();
    s.start('Fetching commit history');
    const { stdout: log } = await execa('git', ['log', '--oneline', '-n', '20']);
    s.stop('Commit history fetched');

    const commits = log.split('\n').map(line => {
      const [hash] = line.split(' ');
      return {
        value: hash,
        label: line,
      };
    });

    const commitHash = await select({
      message: 'Select a commit to reset to:',
      options: commits,
    });

    if (typeof commitHash !== 'string') {
      outro('Operation cancelled');
      return;
    }

    const shouldContinue = await confirm({
      message: `Are you sure you want to ${resetType} reset to commit ${commitHash}?`,
    });

    if (!shouldContinue) {
      outro('Operation cancelled');
      return;
    }

    s.start('Resetting branch');
    await execa('git', ['reset', `--${resetType}`, commitHash]);
    s.stop('Branch reset successfully');

    outro('✅ Branch reset successfully!');
  } catch (error) {
    outro(`❌ Error: ${error instanceof Error ? error.message : 'Failed to reset branch'}`);
    process.exit(1);
  }
};

export default resetHandler;
