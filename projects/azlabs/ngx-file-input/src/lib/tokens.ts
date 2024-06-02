import { InjectionToken } from '@angular/core';
import { UploadOptionsType } from './types';
import { HTTPRequest, HTTPResponse } from '@azlabsjs/requests';

/** @description Uploader options injection token */
export const UPLOADER_OPTIONS = new InjectionToken<
  UploadOptionsType<HTTPRequest, HTTPResponse>
>('OPTIONS TO PASS TO THE UPLOADER BY DEFAULT');
