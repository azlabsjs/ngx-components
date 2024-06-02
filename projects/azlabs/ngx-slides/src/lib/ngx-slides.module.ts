import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxSlidesComponent } from './ngx-slides.component';

/** @internal */
export type ModuleConfig = {
  assets: string;
};

/** @deprecated Use provided initialization `provideSlides()` function at component or module level
 * to provide default slides without passing them though input properties
 */
@NgModule({
  declarations: [],
  imports: [NgxSlidesComponent],
  exports: [NgxSlidesComponent],
})
export class NgxSlidesModule {
  /** @deprecated Use provided initialization `provideSlides()` function at component or module level
   * to provide default slides without passing them though input properties
   */
  static forRoot(config?: ModuleConfig): ModuleWithProviders<NgxSlidesModule> {
    return {
      ngModule: NgxSlidesModule,
      providers: [],
    };
  }
}
