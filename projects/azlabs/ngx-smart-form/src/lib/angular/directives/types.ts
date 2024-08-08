import { OutputRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** @internal */
export type RefType<T> = {
  index: number;
  element: T;
  destroy: () => void;
};

/** @internal */
export type ViewRefFactory<T> = {
  removed: OutputRef<RefType<ViewRefFactory<T>>>;
  /** Create a view instance a.k.a `ComponentRef`, `EmbededViewRef`, etc... based on provided form element */
  createView(index: number, element: AbstractControl): RefType<T>;

  /** Clear the view container removing any ui element */
  clear(): void;
};
