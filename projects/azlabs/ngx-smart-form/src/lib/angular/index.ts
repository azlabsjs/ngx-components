import {
  NgxSmartFormArrayChildComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormGroupComponent,
} from './components';
import { SafeHTMLPipe } from './pipes';

export {
  NgxSmartFormArrayChildComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormGroupComponent,
} from './components';
// Fetch and HTML File directive exports
export {
  ComponentReactiveFormHelpers,
  cloneAbstractControl,
  createAngularAbstractControl,
  createFormGroup,
  createFormControl,
  createFormArray,
  useBearerTokenInterceptor,
} from './helpers';
// Module & component & services exports
export { NgxSmartFormModule } from './ngx-smart-form.module';
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

/** Exported library directives */
export const FORM_DIRECTIVES = [
  NgxSmartFormComponent,
  NgxSmartFormGroupComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormArrayChildComponent,
  SafeHTMLPipe,
] as const;
