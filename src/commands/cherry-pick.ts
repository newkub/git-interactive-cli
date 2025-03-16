import { intro, outro, confirm, spinner } from '@clack/prompts';
import nodeFzf from 'node-fzf';
import { execa } from 'execa';

export const cherryPick = async (): Promise<void> => {
  intro('🍒 Cherry-pick a commit');

  try {
    const s = spinner();
    s.start('Fetching commit history');
    const { stdout: log } = await execa('git', ['log', '--oneline', '-n', '20']);
    s.stop('Commit history fetched');

    const commits = log.split('\n');
    const { selected } = await nodeFzf(commits);
    
    if (!selected) {
      outro('Operation cancelled');
      return;
    }

    const hash = selected.value.split(' ')[0];

    const shouldContinue = await confirm({
      message: `Are you sure you want to cherry-pick commit ${hash}?`,
    });

    if (!shouldContinue) {
      outro('Operation cancelled');
      return;
    }

    s.start('Cherry-picking commit');
    await execa('git', ['cherry-pick', hash]);
    s.stop('Commit cherry-picked successfully');

    outro('✅ Commit cherry-picked successfully!');
  } catch (error) {
    outro(`❌ Error: ${error instanceof Error ? error.message : 'Failed to cherry-pick commit'}`);
    process.exit(1);
  }
};

export default cherryPick;
