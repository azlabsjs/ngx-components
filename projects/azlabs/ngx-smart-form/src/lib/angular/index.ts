import {
  NgxSmartFormArrayItemComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormGroupComponent,
  NgxTableForm,
} from './directives';
import { SafeHTMLPipe } from './pipes';

export * from './directives';

export {
  ComponentReactiveFormHelpers,
  cloneAbstractControl,
  createAngularAbstractControl,
  createFormGroup,
  createFormControl,
  createFormArray,
  useBearerTokenInterceptor,
  getPropertyValue,
  pickAbstractControl,
  pickInputConfig,
} from './helpers';
// Module & component & services exports
export { NgxSmartFormModule } from './smart-form.module';
// Pipes exports
export { SafeHTMLPipe } from './pipes';
// Ng Services
export { FormsLoader as NgxFormLoader } from './services';

// Ng forms helpers classes & interfaces
export {
  AngularReactiveFormBuilderBridge,
  Builder,
  CacheProvider,
  FormComponentInterface,
  FormsClient,
  FormsLoader,
  InputEventArgs,
  InputOptionsClient,
  ReactiveFormComponentInterface,
} from './types';
// Validators
export {
  CustomValidators,
  uniqueValidator,
  existsValidator,
  equalsValidator,
  patternValidator,
} from './validators';

export {
  ANGULAR_REACTIVE_FORM_BRIDGE,
  API_HOST,
  FORM_CLIENT,
  HTTP_REQUEST_CLIENT,
} from './tokens';

/* Exported library providers */
export {
  provideFormsLoader,
  provideFormsHost,
  provideFormsInitialization,
  provideHttpClient,
} from './providers';

/** @description Exported library directives */
export const FORM_DIRECTIVES = [
  NgxSmartFormComponent,
  NgxSmartFormGroupComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormArrayItemComponent,
  SafeHTMLPipe,
  NgxTableForm,
] as const;
