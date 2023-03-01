/**
 * Dropdown animation types
 */
export type Animation = 'scaleY' | 'translateX'; // | 'scaleReverseY';

/**
 * Dropdown orientation
 */
export type Orientation = 'left' | 'right';

/**
 * @internal
 * **Note** setSate() function parameter type
 */
export type SetStateParam<T> = Partial<T> | ((state: T) => T);
