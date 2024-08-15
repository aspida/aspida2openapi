/* eslint-disable */
import type { DefineMethods } from 'aspida';
import type * as Types from '../../../../../../@types';

export type Methods = DefineMethods<{
  /** Create shared image item in chat */
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
      published?: boolean | undefined;
      /** text message to send to pubnub */
      formattedText?: string | undefined;
    };
  };
}>;
