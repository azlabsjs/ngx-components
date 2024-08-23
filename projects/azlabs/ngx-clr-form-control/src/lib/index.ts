import { NgxFormControlComponent } from './control.component';
import { NgxInputErrorComponent } from './ngx-input-error';

/** Exports */
export { useOptionsInterceptor } from './helpers';
export { NgxFormControlComponent } from './control.component';
export { NgxClrFormControlModule } from './control.module';
export { NgxInputErrorComponent } from './ngx-input-error';

/** Exported providers */
export { provideTranslations } from './providers';

/** Exported library directives */
export const FORM_CONTROL_DIRECTIVES = [
  NgxFormControlComponent,
  NgxInputErrorComponent,
] as const;

/** Exported library directives */
export const CLR_FORM_CONTROL_DIRECTIVES = [
  NgxFormControlComponent,
  NgxInputErrorComponent,
] as const;
