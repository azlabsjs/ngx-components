/*
 * Public API Surface of ngx-file-input
 */

import { NgxSmartFileInputComponent } from './lib/file-input.component';
import { HTMLFileInputDirective } from './lib/file-input.directive';

export { UPLOADER_OPTIONS } from './lib/tokens';
export { UploadOptionsType, InterceptorFactory, EventArgType } from './lib/types';
export { NgxSmartFileInputComponent } from './lib/file-input.component';
export { NgxUploadsEventsService } from './lib/uploads-events.service';
export { HTMLFileInputDirective } from './lib/file-input.directive';
export { provideUploadOptions, provideDownloadApi } from './lib/providers';

/** @description library directives */
export const FILE_INPUT_DIRECTIVES = [NgxSmartFileInputComponent, HTMLFileInputDirective] as const;
