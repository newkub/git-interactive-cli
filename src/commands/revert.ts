import { intro, outro, confirm, spinner } from '@clack/prompts';
import nodeFzf from 'node-fzf';
import { execa } from 'execa';

export const revert = async (): Promise<void> => {
  intro('✨ Revert a commit');

  try {
    const s = spinner();
    s.start('Fetching commit history');
    const { stdout: log } = await execa('git', ['log', '--oneline', '-n', '20']);
    s.stop('Commit history fetched');

    const commits = log.split('\n');
    
    const { selected } = await nodeFzf({
      list: commits,
      mode: 'fuzzy'
    });

    if (!selected) {
      outro('Operation cancelled');
      return;
    }

    const [hash] = selected.value.split(' ');

    const shouldContinue = await confirm({
      message: `Are you sure you want to revert commit ${hash}?`,
    });

    if (!shouldContinue) {
      outro('Operation cancelled');
      return;
    }

    s.start('Reverting commit');
    await execa('git', ['revert', hash]);
    s.stop('Commit reverted successfully');

    outro('✅ Commit reverted successfully!');
  } catch (error) {
    outro(`❌ Error: ${error instanceof Error ? error.message : 'Failed to revert commit'}`);
    process.exit(1);
  }
};

export default revert;
