/* eslint-disable */
import type { DefineMethods } from 'aspida';

export type Methods = DefineMethods<{
  get: {
    query: {
      /** The user name for login */
      username: string;
      /** The password for login in clear text */
      password: string;
    };

    status: 200;
    /** successful operation */
    resBody: string;

    resHeaders: {
      /** date in UTC when token expires */
      'X-Expires-After': string;
    };
  };
}>;
