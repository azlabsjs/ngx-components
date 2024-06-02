import { NgxSlidesComponent } from '@azlabsjs/ngx-slides';

//#region Exports
export {
  SlidesRequestClient,
  SLIDES_REQUEST_CLIENT,
  SlideData,
  SlidesContents,
} from './types';
export { NgxSlidesComponent } from './ngx-slides.component';
export { NgxSlidesModule } from './ngx-slides.module';
export { createSlide } from './helpers';
export { provideSlides } from './providers';

/** @description Exported slides directives */
export const SLIDES_DIRECTIVES = [NgxSlidesComponent] as const;
//#endregion Exports
