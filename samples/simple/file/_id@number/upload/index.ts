/* eslint-disable */
import type { DefineMethods } from 'aspida';

export type Methods = DefineMethods<{
  post: {
    query?: {
      path?: string | undefined;
    } | undefined;

    status: 204;
    reqBody: File;
  };
}>;
