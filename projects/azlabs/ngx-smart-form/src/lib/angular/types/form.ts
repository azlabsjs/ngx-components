import { Observable } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FormConfigInterface, InputConfigInterface, FormsLoader as BaseFormsLoader } from '@azlabsjs/smart-form-core';

/** @internal */
export type Builder = FormBuilder;

export interface ReactiveFormBuilder {
  /** @var Builder */
  readonly builder: Builder;

  /** creates a reactive form element from the configuration from dynamic form or list of dynamic inputs */
  group(source: FormConfigInterface | InputConfigInterface[]): FormGroup;

  /** creates a form control instance from form configuration interface */
  control(state: InputConfigInterface): AbstractControl;

  /** creates a form array instance */
  array(state: InputConfigInterface): FormArray;
}

/**
 * @description Form client type definition. Implementation class must provide
 * functionality to load the form using form id from a given data source
 */
export interface FormsClient {
  /**
   * @description Get form definitions using the user provided id
   */
  get(id: string | number): Observable<FormConfigInterface>;
}

// /** @internal */
// export type FormsLoader = BaseFormsLoader;

/**  For form object query efficiency, object are loaded and managed by the cache provider */
export interface FormsCollection<T> {

  /** get form from cache using form id property value */
  get(id: string | number): Observable<T>;

  /** provides predefined dynamic forms loader implementation */
  init(options?: { [index: string]: any } ): Promise<unknown|void>;
}

/** @internal type definition for load form request handler function */
export type LoadFormsRequestHandler = (options?: Record<string, unknown>) => Observable<Record<string, unknown>[]> | Promise<Record<string, unknown>[]>;
