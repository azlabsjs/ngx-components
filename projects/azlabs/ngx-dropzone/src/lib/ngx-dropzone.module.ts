import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { useDefaultDictionary } from './helpers';
import { NgxDropzoneComponent } from './ngx-dropzone.component';
import { NgxDropzoneDirective } from './ngx-dropzone.directive';
import {
  DropzoneConfig,
  DropzoneDict,
  DROPZONE_CONFIG,
  DROPZONE_DICT
} from './types';

@NgModule({
  declarations: [NgxDropzoneComponent, NgxDropzoneDirective],
  imports: [CommonModule],
  exports: [NgxDropzoneComponent, NgxDropzoneDirective],
})
export class NgxDropzoneModule {
  static forRoot(config?: {
    dropzoneConfig: DropzoneConfig;
    dictionary: Partial<DropzoneDict>;
  }): ModuleWithProviders<NgxDropzoneModule> {
    return {
      ngModule: NgxDropzoneModule,
      providers: [
        {
          provide: DROPZONE_DICT,
          useValue:
            typeof config?.dictionary === 'undefined' ||
            config?.dictionary === null ||
            Object.keys(config?.dictionary ?? {}).length === 0
              ? useDefaultDictionary()
              : config?.dictionary,
        },
        {
          provide: DROPZONE_CONFIG,
          useFactory: (dictionary: Partial<DropzoneDict>) => {
            const dzConfig = (config?.dropzoneConfig || {
              url: 'http://localhost',
              maxFilesize: 10,
              acceptedFiles: 'image/*',
              autoProcessQueue: false,
              uploadMultiple: false,
              maxFiles: 1,
              addRemoveLinks: true,
            }) as any;

            for (const [prop, value] of Object.entries(dictionary)) {
              if (
                !(prop in dzConfig) ||
                dzConfig[prop] === 'undefined' ||
                dzConfig[prop] === null
              ) {
                dzConfig[prop] = value;
              }
            }
            return dzConfig as DropzoneConfig;
          },
          deps: [DROPZONE_DICT],
        },
      ],
    };
  }
}
