import { AbstractControl, FormGroup } from "@angular/forms";

/** @internal */
export const CONDITION_PROPERTIES = ['requiredIf', 'disabledIf'] as const;

/** @internal */
export type ConditionProperty = (typeof CONDITION_PROPERTIES)[number];

/** @internal */
export type ClauseFn = (control: AbstractControl, name: string, parent: FormGroup | null, path: string ) => void;