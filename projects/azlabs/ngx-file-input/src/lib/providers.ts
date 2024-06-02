import { Injector, Provider, inject } from '@angular/core';
import { UPLOADER_OPTIONS } from './tokens';
import { UploadOptionsType } from './types';
import { HTTPRequest, HTTPResponse } from '@azlabsjs/requests';

/** @description Provides uploads options for the library */
export function provideUploadOptions(
  url: string,
  options?: UploadOptionsType<HTTPRequest, HTTPResponse>
) {
  return {
    provide: UPLOADER_OPTIONS,
    useFactory: () => {
      if (typeof options === 'undefined' || options === null) {
        return {
          path: url,
        };
      }
      return {
        ...options,
        injector: inject(Injector),
        path: options.path ?? url,
      } as UploadOptionsType<HTTPRequest, HTTPResponse>;
    }
  } as Provider;
}
