import { Observable } from 'rxjs';

/** @description Defines the type of content published when dynamic input DOM event occurs */
export type InputEventArgs = {
  name: string;
  value: any;
};

/** @deprecated translated text to preview on form control elements */
export type Translations<T extends Record<string, any> = Record<string, any>> =
  Observable<T>;
