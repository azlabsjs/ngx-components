import * as Dropzone from 'dropzone';

export type DZParamsFunction = (files: any, xhr: any, chunk?: any) => any;
export type DZHeadersFunction = () => any;

export type DZInitFunction = () => any;
export type DZFallbackFunction = () => HTMLElement;

export type DZAcceptFunction = (buffer: File, done: Function) => any;
export type DZResizeFunction = (
  buffer: File,
  width: number,
  height: number,
  resizeMethod: string
) => any;

export type DZRenameFileFunction = (buffer: File) => string;
export type DZTransformFileFunction = (buffer: File, done: Function) => any;
export type DZChunksUploadedFunction = (buffer: File, done: Function) => any;

export interface DZConfigInterface {
  timeout?: number;
  autoReset?: number | null;
  errorReset?: number | null;
  cancelReset?: number | null;
  url?: string | ((files: any) => string);
  method?: string | ((files: any) => string);
  params?: any | DZParamsFunction;
  headers?: any | (() => { [index: string]: any });
  init?: DZInitFunction;
  accept?: DZAcceptFunction;
  resize?: DZResizeFunction;
  fallback?: DZFallbackFunction;
  renameFile?: DZRenameFileFunction;
  transformFile?: DZTransformFileFunction;
  chunksUploaded?: DZChunksUploadedFunction;

  withCredentials?: boolean;

  previewsContainer?: any;
  hiddenInputContainer?: any;

  clickable?: string | string[] | boolean;
  paramName?: any;
  capture?: string;
  maxFiles?: number;
  maxFilesize?: number;
  filesizeBase?: number;
  acceptedFiles?: string;
  forceFallback?: boolean;
  addRemoveLinks?: boolean;
  uploadMultiple?: boolean;
  parallelUploads?: number;
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMethod?: 'contain' | 'crop';
  resizeQuality?: number;
  resizeMimeType?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  thumbnailMethod?: 'contain' | 'crop';
  previewTemplate?: string;
  autoQueue?: boolean;
  autoProcessQueue?: boolean;
  ignoreHiddenFiles?: boolean;
  maxThumbnailFilesize?: number;
  createImageThumbnails?: boolean;

  chunking?: boolean;
  chunkSize?: number;
  retryChunks?: boolean;
  forceChunking?: boolean;
  retryChunksLimit?: number;
  parallelChunkUploads?: boolean;

  dictFileSizeUnits?: any;

  dictDefaultMessage?: string;
  dictFallbackMessage?: string;

  dictFileTooBig?: string;
  dictResponseError?: string;
  dictInvalidFileType?: string;

  dictRemoveFile?: string;
  dictCancelUpload?: string;
  dictUploadCanceled?: string;
  dictFallbackText?: string;
  dictMaxFilesExceeded?: string;
  dictRemoveFileConfirmation?: string;
  dictCancelUploadConfirmation?: string;
  dictAcceptedFiles?: string;

  //
  dictDrag?: string;
  dictDrag2?: string;
  dictUpload: string;
}

export type DropzoneConfig = DZConfigInterface & Dropzone.DropzoneOptions;
