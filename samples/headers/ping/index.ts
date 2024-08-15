/* eslint-disable */
import type { DefineMethods } from 'aspida';
import type * as Types from '../@types';

export type Methods = DefineMethods<{
  get: {
    status: 200;
    /** OK */
    resBody: string;

    resHeaders: {
      'X-Simple': Types.X_Simple;
      'X-Ref': Types.X_Ref;
    };
  };
}>;
