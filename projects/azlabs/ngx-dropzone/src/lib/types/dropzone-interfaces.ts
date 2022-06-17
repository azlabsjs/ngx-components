import { InjectionToken } from '@angular/core';
import { DropzoneDict } from './dz-core';
import { DropzoneEvent } from './dz-event';

/**
 * @description Dropzone Global configuration injection token
 */
export const DROPZONE_CONFIG = new InjectionToken('DROPZONE_CONFIG PROVIDER');

/**
 * @description Dropzone dictionnary injection token
 */
export const DROPZONE_DICT = new InjectionToken<DropzoneDict>(
  'DZ DICTIONNARY PROVIDER'
);

/**
 * @description Supported list of dropzone events
 */
export const DropzoneEvents: DropzoneEvent[] = [
  "error",
  "success",
  "sending",
  "canceled",
  "complete",
  "processing",

  "drop",
  "dragStart",
  "dragEnd",
  "dragEnter",
  "dragOver",
  "dragLeave",

  "thumbnail",
  "addedFile",
  "addedFiles",
  "removedFile",
  "uploadProgress",
  "maxFilesReached",
  "maxFilesExceeded",

  "errorMultiple",
  "successMultiple",
  "sendingMultiple",
  "canceledMultiple",
  "completeMultiple",
  "processingMultiple",

  "reset",
  "queueComplete",
  "totalUploadProgress",
];
