import pc from 'picocolors';
import { intro, outro, spinner } from '@clack/prompts';
import { execa } from 'execa';
import type { GitAssistanceConfig } from '../types/defineConfig';

async function configHandler(_config?: GitAssistanceConfig): Promise<void> {
  intro(pc.bgBlue(' Git Configuration '));
  
  const s = spinner();
  s.start('Reading git configuration');
  
  try {
    const { stdout: configContent } = await execa('git', ['config', '--list']);
    s.stop('Configuration loaded');
    
    console.log(pc.cyan('--- Git Configuration ---'));
    console.log(configContent);
    console.log(pc.cyan('------------------------'));
    
    const { stdout: configPath } = await execa('git', ['config', '--list', '--show-origin']);
    const configFiles = [...new Set(configPath.split('\n').map(line => {
      const match = line.match(/^file:(.+?)\s/);
      return match ? match[1] : null;
    }).filter(Boolean))];
    
    console.log(pc.green(`Configuration file paths:`));
    configFiles.forEach(path => console.log(pc.green(` - ${path}`)));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(pc.red(`Error reading git config: ${message}`));
  }
  
  outro('Git configuration operation completed');
}

export default configHandler;
