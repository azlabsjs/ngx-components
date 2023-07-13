import { Observable } from "rxjs";

/**
 * Defines the type of content published when dynamic input
 * DOM event occurs
 */
export type InputEventArgs = {
  name: string;
  value: any;
};

/**
 * Translated text to preview on form control elements
 */
export type Translations = Observable<
{ [index: string]: any } | Record<string, any>
>;