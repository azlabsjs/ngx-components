import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { HTMLFileInputDirective } from './html-file-input.directive';
import { CommonModule } from '@angular/common';
import { UPLOADER_OPTIONS } from './tokens';
import { UploadOptionsType } from './types';
import { HTTPRequest, HTTPResponse } from '@azlabsjs/requests';
import { FormsModule } from '@angular/forms';
import { NgxSmartFileInputComponent } from './ngx-file-input.component';
import { SafeHTMLPipe } from './safe-html.pipe';
import { NgxUploadsEventsService } from './ngx-uploads-events.service';

/**
 * Module configuration type definition
 * 
 * @internal
 */
type ConfigType = {
  uploadOptions?: UploadOptionsType<HTTPRequest, HTTPResponse>;
  uploadURL: string;
};

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [HTMLFileInputDirective, NgxSmartFileInputComponent, SafeHTMLPipe],
  exports: [HTMLFileInputDirective, NgxSmartFileInputComponent],
})
export class NgxFileInputModule {
  static forRoot(
    configs: ConfigType
  ): ModuleWithProviders<NgxFileInputModule> {
    return {
      ngModule: NgxFileInputModule,
      providers: [
        NgxUploadsEventsService,
        {
          provide: UPLOADER_OPTIONS,
          useFactory: (injector: Injector) => {
            if (
              typeof configs.uploadOptions === 'undefined' ||
              configs.uploadOptions === null
            ) {
              return {
                path: configs.uploadURL,
              };
            }
            return {
              ...configs.uploadOptions,
              injector,
              path: configs.uploadOptions.path || configs.uploadURL,
            } as UploadOptionsType<HTTPRequest, HTTPResponse>;
          },
          deps: [Injector],
        },
      ],
    };
  }
}
