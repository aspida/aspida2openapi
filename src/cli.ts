import { getConfigs } from 'aspida/dist/cjs/getConfigs';
import watchInputDir from 'aspida/dist/cjs/watchInputDir';
import minimist from 'minimist';
import { generate } from './generate';
import type { ConfigFile, PartialConfig } from './getConfig';

export const run = (args: string[]) => {
  const argv: Record<string, string | undefined> = minimist(args, {
    string: ['config', 'output', 'watch'],
    alias: { c: 'config', o: 'output', w: 'watch' },
  });

  const configs: ConfigFile[] = getConfigs(argv.config);

  if (configs.length > 1) {
    generate(configs);

    if (argv.watch !== undefined) {
      configs.forEach((config) => watchInputDir(config.input, () => generate(config)));
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

  generate(option);

  if (argv.watch !== undefined) watchInputDir(config.input, () => generate(option));
};
