import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/** @description Type declaration of slide content loader instance */
export interface SlideContentDataLoader {
  /** @description Load the slides in cache */
  load(assets?: string): Promise<boolean> | Promise<void>;

  /** @var SlidesContents */
  contents: SlidesContents;
}

/** @description Type declaration of an object that can be used as slide content */
export type SlideData = {
  /** @description Returns the string representation of the slide data */
  toString(): string;
};

/** @description Type declaration of slides contents request client */
export interface SlidesRequestClient {
  /** @description Get list of preconfigured slides object */
  get(uri?: string): Promise<SlidesContents> | Observable<SlidesContents>;
}

/** @description Slide contents type declaration */
export type SlidesContents = {
  timer: number;
  slides: { data: string | SlideData }[];
};

/** @deprecated Query slides injection token */
export const SLIDES_REQUEST_CLIENT = new InjectionToken<SlidesRequestClient>(
  'Query for slides'
);

/** @description Default slides content provider */
export const SLIDES = new InjectionToken<
  Observable<{ timer: number; slides: Slide[] }>
>('Default slides content provider');

/** @description Slide object type declaration */
export type Slide = {
  id: number | string;
  src: string;
  alt?: string;
  title?: string;
};
