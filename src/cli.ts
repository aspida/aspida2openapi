import { getConfigs } from 'aspida/dist/cjs/getConfigs';
import minimist from 'minimist';
import build from '.';
import type { ConfigFile, PartialConfig } from './getConfig';
import { watchIndexFiles } from './watchIndexFiles';

export const run = (args: string[]) => {
  const argv: Record<string, string | undefined> = minimist(args, {
    string: ['version', 'config', 'output', 'watch'],
    alias: { v: 'version', c: 'config', o: 'output', w: 'watch' },
  });

  if (argv.version !== undefined) {
    console.log(`v${require('../package.json').version}`);
    return;
  }

  const configs: ConfigFile[] = getConfigs(argv.config);

  if (configs.length > 1) {
    build(configs);

    if (argv.watch !== undefined) {
      configs.forEach((config) => watchIndexFiles(config.input, () => build(config)));
    }

    return;
  }

  const config = configs[0];
  const option: PartialConfig = {
    ...config,
    openapi: {
      ...config.openapi,
      outputFile: argv.output ?? config.openapi?.outputFile,
    },
  };

  build(option);

  if (argv.watch !== undefined) watchIndexFiles(config.input, () => build(option));
};
