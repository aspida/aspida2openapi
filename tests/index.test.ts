import fs from 'fs';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import build from '../src';
import type { ConfigFile } from '../src/getConfig';

describe('cli test', () => {
  beforeAll(() => fs.mkdirSync('_samples'));
  afterAll(() => fs.promises.rmdir('_samples', { recursive: true }));

  test('main', () => {
    const configs: ConfigFile[] = require('../aspida.config.js');

    return Promise.all(
      configs.map(async (config) => {
        const originalFile = config.openapi?.outputFile ?? `${config.input}.json`;
        const outputFile = `_${originalFile}`;

        await build({ ...config, openapi: { outputFile } })[0];

        expect(fs.readFileSync(outputFile, 'utf8')).toBe(
          fs.readFileSync(originalFile, 'utf8').replace(/\r/g, ''),
        );
      }),
    );
  });
});
