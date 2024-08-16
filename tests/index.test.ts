import fs, { copyFileSync } from 'fs';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import build from '../src';
import type { ConfigFile } from '../src/getConfig';

describe('cli test', () => {
  beforeAll(() => fs.mkdirSync('_samples'));
  afterAll(() => fs.promises.rmdir('_samples', { recursive: true }));

  const configs: ConfigFile[] = require('../aspida.config.js');

  test.each(configs)('$input', (config) => {
    const originalFile = config.openapi?.outputFile ?? `${config.input}.json`;
    const outputFile = `_${originalFile}`;

    if (config.input.endsWith('openapi')) {
      // override doc info
      copyFileSync(`${config.input}.json`, outputFile);
    }

    build({ ...config, openapi: { outputFile } });

    expect(fs.readFileSync(outputFile, 'utf8')).toBe(
      fs.readFileSync(originalFile, 'utf8').replace(/\r/g, ''),
    );
  });
});
