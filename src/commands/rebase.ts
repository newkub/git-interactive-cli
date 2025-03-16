import { intro, outro, select, isCancel, text } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';

const rebaseHandler = async (): Promise<void> => {
  intro(pc.bgBlue(' Git Rebase '));

  try {
    const action = await select({
      message: 'Select rebase action:',
      options: [
        { value: 'interactive', label: 'Interactive rebase', hint: 'git rebase -i HEAD~N' },
        { value: 'onto', label: 'Rebase onto specific branch', hint: 'git rebase <branch>' },
        { value: 'continue', label: 'Continue rebase', hint: 'git rebase --continue' },
        { value: 'abort', label: 'Abort rebase', hint: 'git rebase --abort' },
      ],
    });

    if (isCancel(action)) {
      outro('Rebase operation cancelled');
      return;
    }

    switch (action) {
      case 'interactive': {
        const commits = await text({
          message: 'How many commits back do you want to rebase?',
          placeholder: '3',
          validate: (value) => {
            if (!/^\d+$/.test(value)) return 'Please enter a number';
            return undefined;
          },
        });
        
        if (isCancel(commits)) {
          outro('Rebase operation cancelled');
          return;
        }
        
        await execa('git', ['rebase', '-i', `HEAD~${commits}`]);
        outro(pc.green('✓ Interactive rebase started'));
        break;
      }
      case 'onto': {
        const branch = await text({
          message: 'Enter branch name to rebase onto:',
          placeholder: 'main',
        });
        
        if (isCancel(branch)) {
          outro('Rebase operation cancelled');
          return;
        }
        
        await execa('git', ['rebase', branch]);
        outro(pc.green(`✓ Successfully rebased onto ${branch}`));
        break;
      }
      case 'continue': {
        await execa('git', ['rebase', '--continue']);
        outro(pc.green('✓ Rebase continued'));
        break;
      }
      case 'abort': {
        await execa('git', ['rebase', '--abort']);
        outro(pc.green('✓ Rebase aborted'));
        break;
      }
    }
  } catch (error) {
    outro(pc.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
  }
};

export default rebaseHandler;