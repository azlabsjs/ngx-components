import Dropzone from 'dropzone';
import { DropzoneConfig } from '../types';

/**
 * @description Dropzone creator function
 * @param container
 * @param options
 */
export function createDropzone(
  container: string | HTMLElement,
  options: DropzoneConfig
) {
  return new Dropzone(container, options);
}

export const autoDiscover = (value: boolean = true) => {
  Dropzone.autoDiscover = value;
};

/**
 * Creates the default dropzone preview template string
 *
 * @param iconClass
 */
export function createDefaultPreviewTemplate(iconClass: string = 'icon') {
  return `
  <div>
    <section class="drop-zone-file-container">
      <i class="${iconClass} preview-file-icon"></i>
    </section>
    <section class="dropzone-file-info">
      <strong>
        <span class="name margin-right8 text-bold" data-dz-name></span>
        <span class="size" data-dz-size></span>
      </strong>
    </section>
    <span class="error text-danger" data-dz-errormessage></span>
  </div>
  `;
}

/**
 * @description Return the dictionary message to be used by the dropzone instances
 */
export function useDefaultDictionary() {
  return {
    dictAcceptedFiles: 'Choose file to upload',
    dictFallbackMessage:
      'Your browser is outdated, please update it to the latest version.',
    dictFileTooBig:
      'File size must be less than or equal to {{maxFilesize}}Mo. Actual file size : ({{filesize}}Mo): ',
    dictInvalidFileType: 'Please choose an {{fileformat}} file type',
    dictCancelUpload: 'Upload cancelled',
    dictResponseError: 'An error happenned during file upload, please retry...',
    dictCancelUploadConfirmation: 'Please confirm to cancel the upload process',
    dictRemoveFileConfirmation: 'Please confirm to proceed',
    dictRemoveFile: 'Remove',
    dictMaxFilesExceeded:
      'You have reach the maximum of file that can be uploaded',
    dictDrag: 'Drag file(s) here or',
    dictDrag2: 'Click',
    dictUpload: 'to upload',
    dictDefaultMessage: 'to upload',
  };
}
