/**
 * File Input constraints type declaration
 *
 * @internal
 */
export type InputConstraints = {
  maxFiles?: number;
  maxFilesize?: number;
};

/**
 * Set state parameter type declaration
 *
 * @internal
 */
export type SetStateParam<T> = Partial<T> | ((state: T) => T);
