import { Observable } from 'rxjs';

/** @description Defines the type of content published when dynamic input DOM event occurs */
export type InputEventArgs = {
  name: string;
  value: any;
};

/** @description Translated text to preview on form control elements */
export type Translations = Observable<Record<string, any>>;
