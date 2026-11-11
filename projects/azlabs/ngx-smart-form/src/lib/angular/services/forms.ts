import { Injectable, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormConfigInterface, InputConfigInterface } from '@azlabsjs/smart-form-core';
import { createFormGroup, createFormArray, createFormControl } from '../helpers';
import { ReactiveFormBuilder } from '../types';
import { RequestClient, HTTP_REQUEST_CLIENT } from '../../http';

@Injectable()
export class NgReactiveFormBuilder implements ReactiveFormBuilder {
  public readonly builder!: FormBuilder;
  public readonly client!: RequestClient;

  constructor() {
    this.builder = inject(FormBuilder);
    this.client = inject(HTTP_REQUEST_CLIENT);
  }

  group(state: FormConfigInterface | InputConfigInterface[]) {
    let inputs = [] as InputConfigInterface[];
    if (state) {
      inputs = !Array.isArray(state) ? [...(state as FormConfigInterface).inputs] : state;
    }
    return createFormGroup(this.builder, inputs, this.client);
  }

  control(state: InputConfigInterface) {
    return createFormControl(this.builder, state, this.client);
  }

  array(state: InputConfigInterface) {
    return createFormArray(this.builder, state);
  }
}
