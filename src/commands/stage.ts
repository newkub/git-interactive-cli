import { intro, outro, select, isCancel, multiselect } from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';
import type { GitAssistanceConfig } from '../types/defineConfig';

interface GitFile {
  path: string;
  status: string;
}

interface GitStatus {
  files: GitFile[];
}

async function getGitStatus(): Promise<GitStatus> {
  const { stdout } = await execa('git', ['status', '--porcelain']);
  const files = stdout.split('\n')
    .filter(Boolean)
    .map(line => ({
      path: line.substring(3),
      status: line.substring(0, 2).trim()
    }));
  return { files };
}

function displayDetailedChanges(files: GitFile[]): void {
  console.log(pc.blue('Changes to be staged:'));
  for (const file of files) {
    const status = file.status === 'M' ? pc.yellow('Modified') :
                  file.status === 'A' ? pc.green('Added') :
                  file.status === 'D' ? pc.red('Deleted') :
                  file.status === '??' ? pc.blue('Untracked') : 
                  file.status;
    console.log(`  ${status}: ${file.path}`);
  }
}

const getStageOptions = (config: GitAssistanceConfig | undefined) => {
  const options = [];

  const stageOptions = config?.stageOptions || {
    enableStageAll: true,
    enableStageByFolder: true,
    enableStageManual: true
  };

  if (stageOptions.enableStageAll) {
    options.push({ value: 'all', label: 'Stage all changes' });
  }
  if (stageOptions.enableStageByFolder) {
    options.push({ value: 'folder', label: 'Stage by folder' });
  }
  if (stageOptions.enableStageManual) {
    options.push({ value: 'manual', label: 'Stage manually' });
  }

  return options;
};

const handleStageSelection = async (selection: string, status: GitStatus) => {
  switch (selection) {
    case 'all': {
      await execa('git', ['add', '.']);
      break;
    }
    case 'folder': {
      const { stdout: foldersOutput } = await execa('git', ['ls-files', '--others', '--directory']);
      const folderOptions = foldersOutput.trim().split('\n').map(folder => ({ 
        value: folder, 
        label: folder 
      }));
      
      const selectedFolders = await multiselect({
        message: 'Select folders to stage',
        options: folderOptions,
      });
      
      if (!isCancel(selectedFolders)) {
        for (const folder of selectedFolders as string[]) {
          await execa('git', ['add', folder]);
        }
      }
      break;
    }
    case 'manual': {
      const files = status.files.map(fileStatus => ({
        value: fileStatus.path,
        label: fileStatus.path,
      }));

      const selectedFiles = await multiselect({
        message: 'Select files to stage',
        options: files,
      });

      if (!isCancel(selectedFiles)) {
        await execa('git', ['add', ...(selectedFiles as string[])]);
      }
      break;
    }
  }
};

export async function staging(_config?: GitAssistanceConfig): Promise<GitStatus> {
  intro(pc.bgBlue(' Git Staging Assistant '));

  try {
    const status = await getGitStatus();

    if (status.files.length === 0) {
      outro(pc.yellow('No changes to stage'));
      return status;
    }

    displayDetailedChanges(status.files);

    const stageOptions = getStageOptions(_config);
    const stageSelection = await select({
      message: 'How would you like to stage your changes?',
      options: stageOptions,
    });

    if (isCancel(stageSelection)) {
      outro(pc.yellow('Staging cancelled'));
      return status;
    }

    await handleStageSelection(stageSelection, status);
    outro(pc.green('Changes staged successfully'));
    return status;
  } catch (error) {
    outro(pc.red(`Error staging files: ${error}`));
    throw error;
  }
};

export default staging;
