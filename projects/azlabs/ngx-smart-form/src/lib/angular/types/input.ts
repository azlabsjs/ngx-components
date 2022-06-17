import { InputInterface } from '../../core';

/**
 * Defines the type of content published when dynamic input
 * DOM event occurs
 */
export interface InputEventArgs {
  name: string;
  value: any;
}

export interface MultiSelectItemRemoveEvent {
  event: any;
  control: InputInterface;
}
