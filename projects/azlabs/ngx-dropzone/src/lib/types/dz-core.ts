import * as BaseDropzone from "dropzone";
export type Dropzone = any | BaseDropzone;

export interface DropzoneDict {
  dictFallbackMessage: string;
  dictFileTooBig: string;
  dictInvalidFileType: string;
  dictResponseError: string;
  dictCancelUpload: string;
  dictCancelUploadConfirmation: string;
  dictRemoveFile: string;
  dictRemoveFileConfirmation: string;
  dictMaxFilesExceeded: string;
  dictUploadCanceled: string;
  dictAcceptedFiles: string;
  dictDrag?: string;
  dictDrag2?: string;
  dictUpload: string;
}
