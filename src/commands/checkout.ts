import { intro, outro, select, isCancel, text } from '@clack/prompts';
import pc from 'picocolors';
import nodeFzf from 'node-fzf';
import { execa } from 'execa';

const getLogHistory = async () => {
  const { stdout } = await execa('git', [
    'log',
    '--pretty=format:%H%x00%an%x00%ad%x00%s',
    '--date=short'
  ]);

  if (!stdout) return [];

  return stdout.split('\n').map(line => {
    const [hash, author, date, message] = line.split('\0');
    return { hash, author, date, message };
  });
};

const getBranches = async () => {
  const { stdout } = await execa('git', ['branch']);
  if (!stdout) return [];
  
  return stdout.split('\n')
    .map(branch => branch.trim())
    .filter(branch => branch)
    .map(branch => branch.startsWith('* ') ? branch.substring(2) : branch);
};

const checkoutCommit = async (hash: string) => {
  await execa('git', ['checkout', hash]);
};

const checkoutBranch = async (branchName: string) => {
  await execa('git', ['checkout', branchName]);
};

const createBranchFromCommit = async (hash: string, branchName: string) => {
  await execa('git', ['checkout', '-b', branchName, hash]);
};

const showCommitDiff = async (hash: string): Promise<string> => {
  const { stdout } = await execa('git', ['show', hash]);
  return stdout;
};

const checkoutHandler = async () => {
  intro('Git Checkout');

  try {
    const logs = await getLogHistory();
    const branches = await getBranches();
    
    if (!logs.length && !branches.length) {
      outro('No commits or branches found');
      return { success: true, message: 'No commits or branches found' };
    }
    
    const options = [
      ...branches.map(branch => ({ 
        type: 'branch', 
        value: branch, 
        display: `${pc.green('branch:')} ${branch}`
      })),
      ...logs.map(log => ({ 
        type: 'commit', 
        value: log.hash, 
        display: `${pc.yellow('commit:')} ${log.hash.slice(0, 7)} ${pc.green(log.date)} ${pc.blue(log.author)}: ${log.message}`
      }))
    ];

    const formattedOptions = options.map(option => option.display);
    const result = await nodeFzf(formattedOptions);
    
    if (result.selected) {
      const selected = options[result.selected.index];
      
      if (selected.type === 'branch') {
        await checkoutBranch(selected.value);
        outro(`Checked out branch ${pc.green(selected.value)}`);
      } else {
        await checkoutCommit(selected.value);
        outro(`Checked out commit ${pc.yellow(selected.value.slice(0, 7))}`);
      }
    }

    return { success: true, message: 'Checkout completed successfully' };
  } catch (error) {
    outro(`Error: ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default checkoutHandler;
