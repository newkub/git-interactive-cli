import { intro, select, text, confirm, isCancel, outro, spinner } from '@clack/prompts';
import pc from 'picocolors';
import semver from 'semver';
import { execa } from 'execa';

const getCurrentBranch = async (): Promise<string> => {
  const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return stdout.trim();
};

const getLatestTag = async (): Promise<string | null> => {
  try {
    const { stdout } = await execa('git', ['describe', '--tags', '--abbrev=0']);
    return stdout.trim();
  } catch (error) {
    return null;
  }
};

const generateChangelog = async (version: string): Promise<void> => {
  const s = spinner();
  s.start('Generating changelog');
  
  try {
    const { stdout } = await execa('git', ['log', '--pretty=format:%s', '--no-merges']);
    const commits = stdout.split('\n');
    
    const changelog = `# ${version} (${new Date().toISOString().split('T')[0]})\n\n${commits.map(commit => `* ${commit}`).join('\n')}`;
    
    await execa('bash', ['-c', `echo "${changelog}" > CHANGELOG.md`]);
    s.stop('Changelog generated');
  } catch (error) {
    s.stop('Failed to generate changelog');
    throw error;
  }
};

const bumpVersion = (_currentVersion: string, type: semver.ReleaseType): string => {
  return semver.inc(_currentVersion, type) || _currentVersion;
};

const releaseHandler = async () => {
  intro(pc.bold('Git Release') + pc.dim(' (git tag, git commit, git push)'));

  try {
    const currentBranch = await getCurrentBranch();
    const latestTag = await getLatestTag() || '0.0.0';
    
    console.log(`${pc.dim('Current branch:')} ${pc.green(currentBranch)}`);
    console.log(`${pc.dim('Latest tag:')} ${pc.yellow(latestTag)}`);
    console.log(pc.dim('Equivalent to: git describe --tags --abbrev=0'));

    const releaseType = await select({
      message: 'Select release type:',
      options: [
        { value: 'patch', label: `Patch ${pc.dim('(bug fixes)')} → ${pc.green(bumpVersion(latestTag, 'patch'))}` },
        { value: 'minor', label: `Minor ${pc.dim('(new features)')} → ${pc.green(bumpVersion(latestTag, 'minor'))}` },
        { value: 'major', label: `Major ${pc.dim('(breaking changes)')} → ${pc.green(bumpVersion(latestTag, 'major'))}` }
      ]
    });

    if (isCancel(releaseType)) {
      outro('Release cancelled');
      return { success: false, message: 'Release cancelled by user' };
    }

    const customVersion = await confirm({
      message: `Use custom version instead of ${pc.green(bumpVersion(latestTag, releaseType as semver.ReleaseType))}?`,
      initialValue: false
    });

    let version = '';
    if (customVersion === true) {
      version = await text({
        message: 'Enter version (e.g. 1.2.3):',
        placeholder: bumpVersion(latestTag, releaseType as semver.ReleaseType),
        validate: (input) => {
          if (!semver.valid(input)) {
            return 'Please enter a valid semver version (e.g. 1.2.3)';
          }
        }
      }) as string;
      
      if (isCancel(version)) {
        outro('Release cancelled');
        return { success: false, message: 'Release cancelled by user' };
      }
    } else {
      version = bumpVersion(latestTag, releaseType as semver.ReleaseType);
    }

    // Generate changelog
    await generateChangelog(version);
    console.log(pc.dim('Equivalent to: git log --pretty=format:%s --no-merges > CHANGELOG.md'));

    // Create tag and commit
    const s = spinner();
    s.start('Creating release commit and tag');
    await execa('git', ['add', 'CHANGELOG.md']);
    await execa('git', ['commit', '-m', `chore(release): ${version}`]);
    await execa('git', ['tag', '-a', version, '-m', `Release ${version}`]);
    s.stop('Release commit and tag created');
    
    console.log(pc.dim('Equivalent to:'));
    console.log(pc.dim('  git add CHANGELOG.md'));
    console.log(pc.dim(`  git commit -m "chore(release): ${version}"`));
    console.log(pc.dim(`  git tag -a ${version} -m "Release ${version}"`));

    console.log(`${pc.green('✓')} Created release ${pc.bold(version)}`);

    const shouldPush = await confirm({
      message: 'Push the release to remote?',
      initialValue: true
    });
    
    if (shouldPush) {
      const s = spinner();
      s.start('Pushing to remote');
      await execa('git', ['push', 'origin', currentBranch]);
      await execa('git', ['push', 'origin', version]);
      s.stop('Pushed to remote');
      
      console.log(pc.dim('Equivalent to:'));
      console.log(pc.dim(`  git push origin ${currentBranch}`));
      console.log(pc.dim(`  git push origin ${version}`));
      console.log(`${pc.green('✓')} Pushed release to remote`);
    }
    
    outro(pc.green('Release completed successfully!'));
    return { success: true, message: 'Release completed successfully' };
  } catch (error) {
    console.error(pc.red('Error creating release:'), error);
    outro(pc.red('Release failed'));
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Release failed',
      error: error instanceof Error ? error : undefined
    };
  }
};

export default releaseHandler;
