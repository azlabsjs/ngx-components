import { Injector, Type } from '@angular/core';

/** @description modal component type reference */
export type ModalElement = {
  /** manually closes the modal. */
  close(): void;

  /** resize the modal to the provided size value */
  resize(size: SizeType): void;

  /** manually opens the modal. */
  open(): void;
};

/** @description modal size type declaration */
export type SizeType = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Projected component outlet configuration */
export type OutletConfig = {
  /** Component object must support data and columns properties as input */
  component: Type<any>;
  inputs?:
    | Record<string, unknown>
    | ((injector: Injector) => Record<string, unknown>);
  module?: Type<any>;
  injector?: Injector;
  content?: any[][];
};
