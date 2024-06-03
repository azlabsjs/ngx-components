import { Injectable, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  FormConfigInterface,
  InputConfigInterface,
} from '@azlabsjs/smart-form-core';
import {
  createFormGroup,
  createFormArray,
  createFormControl,
} from '../helpers';
import { AngularReactiveFormBuilderBridge } from '../types';
import { RequestClient } from '../../http';
import { HTTP_REQUEST_CLIENT } from '../tokens';

@Injectable({
  providedIn: 'any',
})
export class ReactiveFormBuilder implements AngularReactiveFormBuilderBridge {
  private _builder!: FormBuilder;
  get builder() {
    return this._builder;
  }
  private _requestClient!: RequestClient;

  /** @description `ReactiveFormBuilder` class constructor */
  constructor() {
    this._builder = inject(FormBuilder);
    this._requestClient = inject(HTTP_REQUEST_CLIENT);
  }

  group(state: FormConfigInterface | InputConfigInterface[]) {
    let inputConfigs = [] as InputConfigInterface[];
    if (state) {
      inputConfigs = !Array.isArray(state)
        ? [...(state as FormConfigInterface).controlConfigs]
        : state;
    }
    return createFormGroup(this._builder, inputConfigs, this._requestClient);
  }

  control(state: InputConfigInterface) {
    return createFormControl(this._builder, state, this._requestClient);
  }

  array(state: InputConfigInterface) {
    return createFormArray(this._builder, state);
  }
}
