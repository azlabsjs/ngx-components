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

  /** create a view instance a.k.a `ComponentRef`, `EmbededViewRef`, etc... based on provided form element */
  createView(index: number, element: AbstractControl, triggered?: boolean): RefType<T>;

  updateView(ref: RefType<T>, element: AbstractControl): void

  /** clear the view container removing any ui element */
  clear(): void;
};
