/* eslint-disable */
import type { DefineMethods } from 'aspida';
import type * as Types from '../../../../../../@types';

export type Methods = DefineMethods<{
  post: {
    reqHeaders?: Types.AppIdHeader & Types.AppPlatformHeader & Types.AppVersionHeader & Types.AppOrganisationToken | undefined;
    status: 200;

    /** OK */
    resBody: {
      id: string;
    };

    reqFormat: FormData;

    reqBody: {
      /** Image to upload. */
      file: File;
      caption?: string | undefined;
      headline?: string | undefined;
      text?: string | undefined;
      published?: boolean | undefined;
    };
  };
}>;
