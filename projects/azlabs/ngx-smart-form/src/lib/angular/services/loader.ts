import { map } from 'rxjs/operators';
import {
  ControlInterface,
  FormInterface,
  FormsLoader,
} from '@azlabsjs/smart-form-core';
import { LoadFormsRequestHandler } from '../types';

// #region Factory functions
/**
 * Input configuration factory function
 */
export function createInputConfig(
  input: Record<string, unknown>
): ControlInterface {
  return {
    id: input['id'],
    formId: input['formId'],
    formFormControlId: input['formFormControlId'],
    label: input['label'],
    placeholder: input['placeholder'],
    type: input['type'],
    classes: input['classes'],
    required: input['required'],
    disabled: input['disabled'],
    readonly: input['readonly'],
    unique: input['unique'],
    description: input['description'],
    controlGroupKey: input['controlGroupKey'],
    controlName: input['controlName'],
    controlIndex: input['controlIndex'],
    value: input['value'],
    requiredIf: input['requiredIf'],
    children: ((input['children'] as Record<string, unknown>[]) ?? []).map(
      createInputConfig
    ),
    uniqueOn: input['uniqueOn'],
    containerClass: input['containerClass'],
    valuefield: input['valuefield'],
    groupfield: input['groupfield'],
    keyfield: input['keyfield'],

    minDate: input['minDate'],
    maxDate: input['maxDate'],

    rows: input['rows'],
    columns: input['columns'],

    pattern: input['pattern'],
    maxLength: input['maxLength'],
    minLength: input['minLength'],

    selectableValues: input['selectableValues'],
    selectableModel: input['selectableModel'],
    optionsConfig: input['optionsConfig'],
    modelFilters: input['modelFilters'],
    options: input['options'],
    multiple: input['multiple'],
    isRepeatable: input['isRepeatable'],

    min: input['min'],
    max: input['max'],

    uploadURL: input['uploadURL'],
    autoupload: Boolean(input['autoupload'] ?? false),
    uploadAs: input['uploadAs'],
  } as ControlInterface;
}

/**
 * Form configuration factory function
 */
export function createFormConfig(value: Record<string, unknown>) {
  return {
    id: value['id'],
    title: value['title'],
    parentId: value['parentId'] ?? undefined,
    description: value['description'] ?? undefined,
    controls: (value['controls'] as Array<Record<string, unknown>>).map(
      createInputConfig
    ),
    url: value['url'] ?? undefined,
    status: Number(value['status']),
    appcontext: value['appcontext'] ?? undefined,
  } as FormInterface;
}

/**
 * @internal
 *
 * Internal implementation of forms loader that relies on a request handler implementation to query for
 * list of form from the resources
 */
export class DefaultFormsLoader implements FormsLoader {
  // @constructor
  public constructor(private requestHandler: LoadFormsRequestHandler) {}

  public load = (endpoint: string, options?: { [index: string]: any }) => {
    return this.requestHandler(endpoint, options).pipe(
      map((state) => {
        if (state && Array.isArray(state)) {
          return (state as any[]).map((value: { [index: string]: any }) => {
            let controls = value ? (value['formControls'] as any[]) ?? [] : [];
            if (controls.length === 0) {
              controls = value ? (value['controls'] as any[]) ?? [] : [];
            }
            if (controls.length !== 0) {
              value = {
                ...value,
                controls: controls,
              };
            }
            return createFormConfig(value);
          });
        }
        return [];
      })
    );
  };
}
