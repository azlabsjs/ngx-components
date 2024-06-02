/*
 * Public API Surface of ngx-file-input
 */

import { NgxSmartFileInputComponent } from './lib/file-input.component';
import { HTMLFileInputDirective } from './lib/file-input.directive';

//#region module exports
export { UPLOADER_OPTIONS } from './lib/tokens';
export {
  UploadOptionsType,
  InterceptorFactory,
  EventArgType,
} from './lib/types';
export { NgxSmartFileInputComponent } from './lib/file-input.component';
export { NgxUploadsEventsService } from './lib/uploads-events.service';
export { NgxFileInputModule } from './lib/file-input.module';
export { HTMLFileInputDirective } from './lib/file-input.directive';
export { provideUploadOptions } from './lib/providers';

/** @description Exported library directives */
export const FILE_INPUT_DIRECTIVES = [
  NgxSmartFileInputComponent,
  HTMLFileInputDirective,
] as const;
//#endregion module exports
