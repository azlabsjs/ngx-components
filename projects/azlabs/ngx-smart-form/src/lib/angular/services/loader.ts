import { map } from 'rxjs/operators';
import {
  ControlInterface,
  FormInterface,
  FormsLoader as AbstractFormLoader,
} from '@azlabsjs/smart-form-core';
import { LoadFormsRequestHandler } from '../types';

/** @internal */
type ControlsType = Record<string, unknown>;

/** @internal */
type FormConfigType = Record<string, unknown> & {
  controls: Array<ControlsType>;
};
/** @internal */
type LegacyFormConfigType = Record<string, unknown> & {
  formControls?: Array<ControlsType>;
};

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
    children: ((input['children'] as Record<string, unknown>[]) ?? [])?.map(
      createInputConfig
    ),
    uniqueOn: input['uniqueOn'],
    containerClass:
      // Added support legacy `dynamicControlContainerClass` property
      input['containerClass'] ?? input['dynamicControlContainerClass'],
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
    equals: input['equals'],
    exists: input['exists']
      ? {
          url:
            typeof input['exists'] === 'string'
              ? input['exists']
              : (input['exists'] as any)['url'],
          conditions:
            typeof input['exists'] === 'string'
              ? []
              : (input['exists'] as any)['conditions'],
        }
      : undefined,

    // read property support
    read: input['read'],

    // compute property support
    compute: input['compute'],

    // support for disabledIf
    disabledIf: input['disabledIf'],
  } as ControlInterface;
}

/**
 * Form configuration factory function
 */
export function createFormConfig(value: FormConfigType) {
  return {
    id: value['id'],
    title: value['title'],
    parentId: value['parentId'] ?? undefined,
    description: value['description'] ?? undefined,
    controls: value.controls?.map(createInputConfig),
    url: value['url'] ?? undefined,
    status: Number(value['status']),
    appcontext: value['appcontext'] ?? undefined,
  } as FormInterface;
}

/**
 * Basic URL validation logic
 */
function isValidURL(url: string) {
  try {
    const _url = new URL(url);
    return typeof _url.protocol !== 'undefined' && _url.protocol !== null;
  } catch {
    return false;
  }
}

/**
 * @internal
 *
 * Internal implementation of forms loader that relies on a request handler implementation to query for
 * list of form from the resources
 */
export class FormsLoader implements AbstractFormLoader {
  // @constructor
  public constructor(
    private requestHandler: LoadFormsRequestHandler,
    private endpointFactory: (path: string) => string
  ) {}

  load(endpoint: string, options?: { [index: string]: any }) {
    // Construct the endpoint url before passing it to the request handler
    endpoint = isValidURL(endpoint) ? endpoint : this.endpointFactory(endpoint);

    return this.requestHandler(endpoint, options).pipe(
      map((state) => {
        if (state && Array.isArray(state)) {
          return (state as any[]).map(
            (value: FormConfigType | LegacyFormConfigType) => {
              let controls = (
                value ? value['formControls'] : undefined
              ) as ControlsType[];
              if (typeof controls === 'undefined' || controls === null) {
                controls = (
                  value ? value['controls'] ?? [] : []
                ) as ControlsType[];
              }
              return createFormConfig({ ...value, controls: controls ?? [] });
            }
          );
        }
        return [];
      })
    );
  }
}
