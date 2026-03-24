import Dropzone from 'dropzone';

export interface DropzoneDirectiveInterface {
  /**
   * @description Resets the dropzone object
   *
   * **Note**
   * Implementation classes must initialize the dropzone object
   * to it default state
   */
  reset(cancel?: boolean): void;
}

export interface DropzoneComponentInterface extends DropzoneDirectiveInterface {
  /**
   * @description Returns the dropzone directive attached to the component
   */
  dropzone(): Dropzone;

  /**
   * @description defines the disabled state of the dropzone component object
   */
  disabled: boolean;
}
