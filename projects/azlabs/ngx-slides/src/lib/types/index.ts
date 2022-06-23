import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface SlideContentDataLoader {
  /**
   * Load the slides in cache
   */
  load(assets?: string): Promise<boolean> | Promise<void>;

  /**
   * @var SlidesContents
   */
  contents: SlidesContents;
}

export interface SlideData {
  /**
   * Returns the string representation of the slide data
   */
  toString(): string;
}

export interface SlidesRequestClient {
  /**
   * Get list of preconfigured slides object
   *
   * @param uri
   */
  get(uri?: string): Promise<SlidesContents> | Observable<SlidesContents>;
}

//
export interface SlidesContents {
  timer: number;
  slides: { data: string | SlideData }[];
}

export const SLIDES_REQUEST_CLIENT = new InjectionToken<SlidesRequestClient>(
  'Query for slides'
);
