import { intro, outro, select, isCancel, text } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';

async function stash(): Promise<void> {
  intro(pc.bgBlue(' Git Stash Management '));

  try {
    const action = await select({
      message: 'Select stash action:',
      options: [
        { value: 'save', label: 'Stash changes', hint: 'git stash push' },
        { value: 'list', label: 'List stashes', hint: 'git stash list' },
        { value: 'apply', label: 'Apply stash', hint: 'git stash apply' },
        { value: 'pop', label: 'Pop stash', hint: 'git stash pop' },
        { value: 'drop', label: 'Drop stash', hint: 'git stash drop' },
      ],
    });

    if (isCancel(action)) {
      outro('Operation cancelled');
      return;
    }

    switch (action) {
      case 'save': {
        const message = await text({
          message: 'Enter stash message (optional):',
          placeholder: 'WIP on feature',
          hint: 'git stash push -m "message"'
        });

        if (isCancel(message)) {
          outro('Operation cancelled');
          return;
        }

        await execa('git', message ? ['stash', 'push', '-m', message.toString()] : ['stash']);
        console.log(pc.green('✓ Changes stashed successfully'));
        break;
      }
      case 'list': {
        const { stdout } = await execa('git', ['stash', 'list']);
        if (stdout) {
          console.log(stdout);
        } else {
          console.log(pc.yellow('No stashes found'));
        }
        break;
      }
      case 'apply': {
        const { stdout } = await execa('git', ['stash', 'list']);
        if (!stdout) {
          console.log(pc.yellow('No stashes found'));
          break;
        }

        const stashIndex = await text({
          message: 'Enter stash index (leave empty for latest):',
          placeholder: '0',
          hint: 'git stash apply stash@{index}'
        });

        if (isCancel(stashIndex)) {
          outro('Operation cancelled');
          return;
        }

        await execa('git', stashIndex ? ['stash', 'apply', `stash@{${stashIndex}}`] : ['stash', 'apply']);
        console.log(pc.green('✓ Stash applied successfully'));
        break;
      }
      case 'pop': {
        const { stdout } = await execa('git', ['stash', 'list']);
        if (!stdout) {
          console.log(pc.yellow('No stashes found'));
          break;
        }

        const stashIndex = await text({
          message: 'Enter stash index (leave empty for latest):',
          placeholder: '0',
          hint: 'git stash pop stash@{index}'
        });

        if (isCancel(stashIndex)) {
          outro('Operation cancelled');
          return;
        }

        await execa('git', stashIndex ? ['stash', 'pop', `stash@{${stashIndex}}`] : ['stash', 'pop']);
        console.log(pc.green('✓ Stash popped successfully'));
        break;
      }
      case 'drop': {
        const { stdout } = await execa('git', ['stash', 'list']);
        if (!stdout) {
          console.log(pc.yellow('No stashes found'));
          break;
        }

        const stashIndex = await text({
          message: 'Enter stash index:',
          placeholder: '0',
          hint: 'git stash drop stash@{index}',
          validate: (value) => value.length === 0 ? 'Stash index is required' : undefined
        });

        if (isCancel(stashIndex)) {
          outro('Operation cancelled');
          return;
        }

        await execa('git', ['stash', 'drop', `stash@{${stashIndex}}`]);
        console.log(pc.green('✓ Stash dropped successfully'));
        break;
      }
    }
  } catch (error) {
    console.error(pc.red('Error:'), error);
  }

  outro('Stash operation completed');
}

export default stash;