import { InjectionToken, inject } from '@angular/core';
import { ReactiveFormBuilder, FormsClient, FormsCollection } from './types/form';
import { FormConfigInterface, FormsLoader } from '@azlabsjs/smart-form-core';
import { NgReactiveFormBuilder } from './services';
import { Observable } from 'rxjs';

/** generic forms collection loader instance */
export const FORMS_LOADER = new InjectionToken<FormsLoader>('generic forms collection loader instance');

/** angular injection token to build reactive form element from input config */
export const ANGULAR_REACTIVE_FORM_BRIDGE = new InjectionToken<ReactiveFormBuilder>('angular injection token to build reactive form element from input config', { factory: () => inject(NgReactiveFormBuilder) });

/** Forms server origin configuration */
export const API_HOST = new InjectionToken<string>('Forms server origin configuration');

/** forms collection class injection token */
export const FORMS_COLLECTION = new InjectionToken<FormsCollection>('forms collection class injection token');

/** @deprecated Use `{FORMS_COLLECTION}` token instead */
export const FORM_CLIENT = new InjectionToken<FormsClient>('client api for loading forms from provided collection', {
  providedIn: 'root',
  factory: () => {
    const collections = inject(FORMS_COLLECTION);
    return { get(id: string | number): Observable<FormConfigInterface> { return collections.get(id); } }
  },
});