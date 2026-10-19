import { AbstractControl } from "@angular/forms";
import { InputConfigInterface } from "@azlabsjs/smart-form-core";
import { Observable } from "rxjs";

/** @internal */
export type Optional<T> = T | null | undefined;

/** @internal */
export type ContextType = {
  formgroup: AbstractControl;
  autoupload: boolean;
  inputs: InputConfigInterface[];
  remove: (event: Event) => void;
  destroy: Observable<number>;
};