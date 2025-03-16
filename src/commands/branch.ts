import { intro, outro, select, isCancel, text, confirm } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';
import type { GitAssistanceConfig } from '../types/defineConfig';

const getBranches = async (): Promise<{ name: string; current: boolean }[]> => {
  try {
    const { stdout } = await execa('git', ['branch']);
    return stdout.split('\n')
      .filter(Boolean)
      .map(branch => {
        const isCurrent = branch.startsWith('*');
        const name = branch.replace('*', '').trim();
        return { name, current: isCurrent };
      });
  } catch (error) {
    throw new Error(`Failed to get branches: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const checkoutBranch = async (branchName: string): Promise<void> => {
  try {
    await execa('git', ['checkout', branchName]);
  } catch (error) {
    throw new Error(`Failed to checkout branch: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const mergeBranch = async (branchName: string): Promise<void> => {
  try {
    await execa('git', ['merge', branchName]);
  } catch (error) {
    throw new Error(`Failed to merge branch: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const deleteBranch = async (branchName: string): Promise<void> => {
  try {
    await execa('git', ['branch', '-d', branchName]);
  } catch (error) {
    throw new Error(`Failed to delete branch: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const branchHandler = async (_config?: GitAssistanceConfig): Promise<void> => {
  intro('Git Branch');

  try {
    const branches = await getBranches();
    
    if (!branches.length) {
      outro('No branches found');
      return;
    }

    const branchOptions = branches.map(branch => ({
      value: branch.name,
      label: `${branch.current ? pc.green('* ') : '  '}${branch.name} ${branch.current ? pc.blue('(current)') : ''}`,
      hint: branch.current ? 'current' : undefined
    }));

    const selectedBranchName = await select({
      message: 'Select a branch:',
      options: branchOptions
    });
    
    if (isCancel(selectedBranchName)) {
      outro('Operation canceled');
      return;
    }
    
    const selectedBranch = branches.find(branch => branch.name === selectedBranchName);
    
    if (!selectedBranch) {
      outro('No branch selected');
      return;
    }
    
    if (!selectedBranch.current) {
      const action = await select({
        message: `Selected branch: ${pc.green(selectedBranch.name)}. What would you like to do?`,
        options: [
          { value: 'checkout', label: 'Checkout branch' },
          { value: 'merge', label: 'Merge into current branch' },
          { value: 'delete', label: 'Delete branch' },
          { value: 'cancel', label: 'Cancel' }
        ]
      });

      if (isCancel(action)) {
        outro('Operation canceled');
        return;
      }

      switch (action) {
        case 'checkout':
          console.log(`\nSwitching to branch: ${pc.green(selectedBranch.name)}`);
          await checkoutBranch(selectedBranch.name);
          outro(`Successfully switched to ${pc.green(selectedBranch.name)}`);
          break;
        case 'merge':
          console.log(`\nMerging ${pc.green(selectedBranch.name)} into current branch`);
          await mergeBranch(selectedBranch.name);
          outro(`Successfully merged ${pc.green(selectedBranch.name)}`);
          break;
        case 'delete':
          console.log(`\nDeleting branch: ${pc.green(selectedBranch.name)}`);
          await deleteBranch(selectedBranch.name);
          outro(`Successfully deleted ${pc.green(selectedBranch.name)}`);
          break;
        case 'cancel':
          outro('Operation canceled');
          break;
      }
    } else {
      outro(`Already on branch ${pc.green(selectedBranch.name)}`);
    }
  } catch (error) {
    outro(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export default branchHandler
