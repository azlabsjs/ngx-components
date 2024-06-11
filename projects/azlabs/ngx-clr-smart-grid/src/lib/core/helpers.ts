/**
 * @description Removed provided key from the list of object properties
 *
 * @internal
 */
export function remove<T extends Record<string, unknown>>(
  _object: T,
  key: keyof T
) {
  const { [key]: _, ...values } = _object;
  return values as T & Omit<T, keyof T>;
}
