type ObservationOptions = {
  root: HTMLElement;
  rootMargin: string;
  threshold: number;
};

/**
 * Creates a browser intersection observer instance
 *
 * @param callback
 * @param options
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: ObservationOptions | undefined
) {
  return new IntersectionObserver(callback, options);
}
