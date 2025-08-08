import {
  NgxSmartFormArrayItemComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormGroupComponent,
  NgxTableForm,
  NgxFormDirective,
  NgxFormComponent
} from './directives';

/** @deprecated */
import { SafeHTMLPipe } from './pipes';

export {
  ComponentReactiveFormHelpers,
  cloneAbstractControl,
  createAngularAbstractControl,
  createFormGroup,
  createFormControl,
  createFormArray,
  useBearerTokenInterceptor,
  getPropertyValue,
  pickcontrol,
  pickconfig,
} from './helpers';

export { NgxSmartFormModule } from './smart-form.module';

export { SafeHTMLPipe } from './pipes';

export { FormsLoader as NgxFormLoader } from './services';

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
  ReactiveFormDirectiveInterface
} from './types';

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

export {
  provideFormsLoader,
  provideFormsHost,
  provideFormsInitialization,
  provideHttpClient,
} from './providers';

export * from './directives';

/** @description exported library directives */
export const FORM_DIRECTIVES = [
  NgxSmartFormComponent,
  NgxFormDirective,
  NgxSmartFormGroupComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormArrayItemComponent,
  SafeHTMLPipe,
  NgxTableForm,
  NgxFormComponent
] as const;
