/** @description Dropdown animation types */
export type Animation = 'scaleY' | 'translateX'; // | 'scaleReverseY';

/** @description Dropdown orientation */
export type Orientation = 'left' | 'right';

/** @internal setSate() function parameter type */
export type SetStateParam<T> = Partial<T> | ((state: T) => T);


/** @internal optional type declaration */
export type Optional<T> = T | null | undefined;