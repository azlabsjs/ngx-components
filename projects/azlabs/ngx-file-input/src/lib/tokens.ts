import { InjectionToken } from '@angular/core';
import { UploadOptionsType } from './types';
import { HTTPRequest, HTTPResponse } from '@azlabsjs/requests';

/** @description uploader options injection token */
export const UPLOADER_OPTIONS = new InjectionToken<
  UploadOptionsType<HTTPRequest, HTTPResponse>
>('OPTIONS TO PASS TO THE UPLOADER BY DEFAULT');

/** api for reading file content from a unified resource interface */
export const DOWNLOAD_API = new InjectionToken<(url: string) => Blob>(
  'api for reading file content from a unified resource interface'
);
