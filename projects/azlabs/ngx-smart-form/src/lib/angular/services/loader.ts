import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken } from '@angular/core';
import { map } from 'rxjs/operators';
import { Form, FormsLoader } from '../../core';
import { DeserializeObject } from '@iazlabs/built-value';

export const DYNAMIC_FORM_LOADER = new InjectionToken<FormsLoader>(
  'PROVIDE DYNAMIC FORM LOADER'
);

@Injectable()
export class FormHttpLoader implements FormsLoader {
  // @constructor
  public constructor(private _http: HttpClient) {}

  public load = (endpoint: string, options?: { [index: string]: any }) => {
    return this._http.get(endpoint, options || {}).pipe(
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
            return DeserializeObject(Form, value);
          });
        }
        return [];
      })
    );
  };
}
