import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { HTMLFileInputDirective } from './file-input.directive';
import { CommonModule } from '@angular/common';
import { UPLOADER_OPTIONS } from './tokens';
import { UploadOptionsType } from './types';
import { HTTPRequest, HTTPResponse } from '@azlabsjs/requests';
import { FormsModule } from '@angular/forms';
import { NgxSmartFileInputComponent } from './file-input.component';
import { SafeHTMLPipe } from './safe-html.pipe';
import { NgxUploadsEventsService } from './uploads-events.service';
import { provideUploadOptions } from './providers';

/** @internal */
type ConfigType = {
  uploadOptions?: UploadOptionsType<HTTPRequest, HTTPResponse>;
  uploadURL: string;
};


/** @deprecated */
@NgModule({
  imports: [HTMLFileInputDirective, NgxSmartFileInputComponent],
  exports: [HTMLFileInputDirective, NgxSmartFileInputComponent],
})
export class NgxFileInputModule {
  /** @deprecated Use `provideUploadOptions(...)` at the root of your application to register upload options configuration */
  static forRoot(configs: ConfigType): ModuleWithProviders<NgxFileInputModule> {
    return {
      ngModule: NgxFileInputModule,
      providers: [
        NgxUploadsEventsService,
        provideUploadOptions(configs.uploadURL, configs.uploadOptions),
      ],
    };
  }
}
