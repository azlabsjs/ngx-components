import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { SlideContentLoader } from './slide-content-loader.service';
import { NgxSlidesComponent } from './ngx-slides.component';
import { SlideContentDataLoader } from './types';

export type ModuleConfig = {
  assets: string;
};

@NgModule({
  declarations: [NgxSlidesComponent],
  imports: [CommonModule],
  exports: [NgxSlidesComponent],
})
export class NgxSlidesModule {
  /**
   * Register providers at the application root level
   *
   * @param config
   */
  static forRoot(config?: ModuleConfig): ModuleWithProviders<NgxSlidesModule> {
    return {
      ngModule: NgxSlidesModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: (loader: SlideContentDataLoader) => {
            return async () => {
              return await loader.load(config?.assets);
            };
          },
          multi: true,
          deps: [SlideContentLoader],
        },
      ],
    };
  }
}
