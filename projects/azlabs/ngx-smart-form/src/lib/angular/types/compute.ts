import { Subject } from 'rxjs';

/** @internal */
export type ComputedInputValueConfigType<T = any> = {
  type: 'list' | 'scalar' | 'group';
  name?: string;
  cancel: Subject<void>;
  values: { path: string, name: string; fn: (...params: unknown[]) => unknown; params: unknown[], inplace: [number, string][] }[];
};
