import { getConfigs } from 'aspida/dist/cjs/getConfigs';
import minimist from 'minimist';
import build from '.';
import type { ConfigFile } from './getConfig';

export const run = (args: string[]) => {
  const argv: Record<string, string | undefined> = minimist(args, {
    string: ['version', 'config', 'output'],
    alias: { v: 'version', c: 'config', o: 'output' },
  });

  if (argv.version !== undefined) {
    console.log(`v${require('../package.json').version}`);
    return;
  }

  const configs: ConfigFile[] = getConfigs(argv.config);

  if (configs.length > 1) {
    build(configs);
    return;
  }

  const config = configs[0];

  build({
    ...config,
    openapi: {
      ...config.openapi,
      outputFile: argv.output ?? config.openapi?.outputFile,
    },
  });
};
