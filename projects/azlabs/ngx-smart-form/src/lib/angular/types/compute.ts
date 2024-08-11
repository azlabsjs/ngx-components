import { Subject } from 'rxjs';

/** @internal */
export type ComputedInputValueConfigType<T = any> = {
  values: {
    name: string;
    fn: (model: T) => unknown;
  }[];
  cancel: Subject<void>;
};
