/**
 * @description Type definition of possible dropzone events
 */
export type DropzoneEvent = 'error' | 'success' | 'sending' | 'canceled' | 'complete' |
  'processing' | 'drop' | 'dragStart' | 'dragEnd' | 'dragEnter' | 'dragOver' | 'dragLeave' |
  'thumbnail' | 'addedFile' | 'addedFiles' | 'removedFile' | 'uploadProgress' | 'maxFilesReached' |
  'maxFilesExceeded' | 'errorMultiple' | 'successMultiple' | 'sendingMultiple' | 'canceledMultiple' |
  'completeMultiple' | 'processingMultiple' | 'reset' | 'queueComplete' | 'totalUploadProgress';
