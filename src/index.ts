import type { AspidaMethodParams } from 'aspida';
import type { DirentTree } from 'aspida/dist/cjs/getDirentTree';
import { getDirentTree } from 'aspida/dist/cjs/getDirentTree';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import type { OpenAPIV3_1 } from 'openapi-types';
import { join } from 'path';
import * as TJS from 'typescript-json-schema';
import type { PartialConfig } from './getConfig';
import { getConfig } from './getConfig';

export const toOpenAPI = (params: {
  input: string;
  template?: OpenAPIV3_1.Document | string;
}): string => {
  const tree = getDirentTree(params.input);

  const createFilePaths = (tree: DirentTree): string[] => {
    return tree.children.flatMap((child) =>
      child.isDir ? createFilePaths(child.tree) : tree.path,
    );
  };

  const paths = createFilePaths(tree);

  const typeFile = `${paths
    .map((p, i) => `import type { Methods as Methods${i} } from '${p.replace(params.input, '.')}'`)
    .join('\n')}

type AllMethods = [${paths.map((_, i) => `Methods${i}`).join(', ')}]`;

  const typeFilePath = join(params.input, `@openapi-${Date.now()}.ts`);

  writeFileSync(typeFilePath, typeFile, 'utf8');

  const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true,
    rootDir: process.cwd(),
    baseUrl: process.cwd(),
    // @ts-expect-error dont match ScriptTarget
    target: 'ES2022',
  };

  const program = TJS.getProgramFromFiles([typeFilePath], compilerOptions);
  const schema = TJS.generateSchema(program, 'AllMethods', { required: true });
  const doc: OpenAPIV3_1.Document = {
    ...(typeof params.template === 'string'
      ? JSON.parse(readFileSync(params.template, 'utf8'))
      : params.template),
    paths: {},
    components: { schemas: schema?.definitions as any },
  };

  unlinkSync(typeFilePath);

  (schema?.items as TJS.Definition[])?.forEach((def, i) => {
    const parameters: { name: string; in: 'path' | 'query'; required: boolean; schema: any }[] = [];

    let path = paths[i];

    if (path.includes('/_')) {
      parameters.push(
        ...path
          .split('/')
          .filter((p) => p.startsWith('_'))
          .map((p) => ({
            name: p.slice(1).split('@')[0],
            in: 'path' as const,
            required: true,
            schema: ['number', 'string'].includes(p.slice(1).split('@')[1])
              ? { type: p.slice(1).split('@')[1] }
              : { anyOf: [{ type: 'number' }, { type: 'string' }] },
          })),
      );

      path = path.replace(/\/_([^/@]+)(@[^/]+)?/g, '/{$1}');
    }

    path = path.replace(params.input, '') || '/';

    doc.paths![path] = Object.entries(def.properties!).reduce((dict, [method, val]) => {
      const params = [...parameters];
      // const required = ((val as TJS.Definition).required ?? []) as (keyof AspidaMethodParams)[];
      const props = (val as TJS.Definition).properties as {
        [Key in keyof AspidaMethodParams]: TJS.Definition;
      };

      if (props.query) {
        const def = (props.query.properties ??
          schema?.definitions?.[props.query.$ref!.split('/').at(-1)!]) as TJS.Definition;

        params.push(
          ...Object.entries(def).map(([name, value]) => ({
            name,
            in: 'query' as const,
            required: props.query?.required?.includes(name) ?? false,
            schema: value,
          })),
        );
      }

      const reqFormat = props.reqFormat?.$ref;
      const reqContentType =
        ((props.reqHeaders?.properties?.['content-type'] as TJS.Definition)?.const ??
        reqFormat?.includes('FormData'))
          ? 'multipart/form-data'
          : reqFormat?.includes('URLSearchParams')
            ? 'application/x-www-form-urlencoded'
            : 'application/json';
      const resContentType =
        ((props.resHeaders?.properties?.['content-type'] as TJS.Definition)?.const as string) ??
        'application/json';

      return {
        ...dict,
        [method]: {
          tags: path === '/' ? undefined : path.split('/{')[0].replace(/^\//, '').split('/'),
          parameters: params,
          requestBody:
            props.reqBody === undefined
              ? undefined
              : { content: { [reqContentType]: { schema: props.reqBody } } },
          responses:
            props.resBody === undefined
              ? undefined
              : {
                  [(props.status?.const as string) ?? '2XX']: {
                    content: { [resContentType]: { schema: props.resBody } },
                  },
                },
        },
      };
    }, {});
  });

  return JSON.stringify(doc, null, 2).replaceAll('#/definitions', '#/components/schemas');
};

export default (configs?: PartialConfig) =>
  getConfig(configs).forEach((config) => {
    const existingDoc: OpenAPIV3_1.Document | undefined = existsSync(config.output)
      ? JSON.parse(readFileSync(config.output, 'utf8'))
      : undefined;
    const template: OpenAPIV3_1.Document = {
      openapi: '3.1.0',
      info: {
        title: `${config.output.split('/').at(-1)?.replace('.json', '')} api`,
        version: 'v0.0',
      },
      servers: config.baseURL ? [{ url: config.baseURL }] : undefined,
      ...existingDoc,
      paths: {},
      components: {},
    };

    writeFileSync(config.output, toOpenAPI({ input: config.input, template }), 'utf8');
    console.log(`${config.output} was built successfully.`);
  });
