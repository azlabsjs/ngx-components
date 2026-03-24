import { Injector, Provider, inject } from '@angular/core';
import { DOWNLOAD_API, UPLOADER_OPTIONS } from './tokens';
import { UploadOptionsType } from './types';
import { HTTPRequest, HTTPResponse } from '@azlabsjs/requests';
import { createWithFetchAPI } from './fetch';

/** @description provide uploads options for the library */
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
    },
  } as Provider;
}

/** angular provider for injecting or providing `DOWNLOAD_API` injection token */
export function provideDownloadApi(
  factory: (injector: Injector) => (url: string) => Promise<File | null> = () =>
    createWithFetchAPI()
) {
  return {
    provide: DOWNLOAD_API,
    useFactory: () => {
      return factory(inject(Injector));
    },
  } as Provider;
}
