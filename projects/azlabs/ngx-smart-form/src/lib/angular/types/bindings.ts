import { AbstractControl, FormGroup } from '@angular/forms';

// @internal
export type DetachedInputType = [
  (formgroup: FormGroup<any>, key: string) => void,
  AbstractControl
];

/** @internal */
export interface Condition {
  match: (name: string) => boolean;
  dependencyChanged: (
    formgroup: FormGroup,
    dependency: string,
    value: unknown
  ) => [[string, AbstractControl][], [string, AbstractControl][]];
}
