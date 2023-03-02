/**
 * @internal
 *
 * @param cssClass
 * @param noHover
 * @param active
 * @param disabled
 */
export function computeCssClass(
  cssClass: string | undefined,
  noHover: boolean,
  active: boolean,
  disabled: boolean
) {
  let _cssClass: Record<string, boolean> = {};
  const list = cssClass ?? '';
  for (const item of list.split(' ')) {
    _cssClass = { ..._cssClass, [item]: true };
  }
  return {
    ..._cssClass,
    active: noHover && active,
    disabled,
    hover: !noHover,
  };
}

/**
 * @internal
 * 
 * @param orientation 
 * @param animation 
 */
export function computeMenuClass(
  orientation: string | undefined,
  animation: string | undefined
) {
  let classes: Record<string, boolean> = {};
  if (orientation) {
    classes = { [orientation]: true };
  }
  if (animation) {
    classes = { ...classes, [animation]: true };
  }
  return classes;
}
