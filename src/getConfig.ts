import type { AspidaConfig } from 'aspida/dist/cjs/commands';
import { getConfigs } from 'aspida/dist/cjs/commands';

export type Config = { input: string; baseURL?: string; output: string };

export type ConfigFile = AspidaConfig & { openapi?: { outputFile?: string } };

const createConfig = (config: ConfigFile): Config => {
  return {
    input: config.input,
    baseURL: config.baseURL,
    output: config.openapi?.outputFile ?? `${config.input}.json`,
  };
};

export type PartialConfig = Partial<ConfigFile> | Partial<ConfigFile>[];

export const getConfig = (config?: PartialConfig) => getConfigs(config).map(createConfig);
