/**
 * Set the file input properties using user provided user parameters
 *
 * @param element
 * @param accept
 * @param classes
 */
export function setFileInputElementProperties(
  element: HTMLInputElement,
  accept: string = '*',
  classes: string[] = []
) {
  //#region Bind HTML attributes to file input
  element.accept = accept ?? '*';
  element.multiple = false;
  element.classList.add(...(classes ?? []));
  //#endregion Bind HTML attributes to file input
  return element;
}

/**
 * Creates a native file input element and attach it to the parent node
 *
 * @param parent
 * @param document
 * @returns
 */
export function createFileInputElement(
  parent: HTMLElement,
  document?: Document,
  accept: string = '*',
  classes: string[] = []
) {
  if (document) {
    let element = document.createElement('input');
    element.type = 'file';
    element = setFileInputElementProperties(element, accept, classes);
    parent.appendChild(element);
    return element;
  }
  throw new Error('platform document is not defined');
}
