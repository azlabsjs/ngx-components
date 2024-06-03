import { Provider, inject } from '@angular/core';
import { SLIDES, SlideData } from './types';
import { HttpClient } from '@angular/common/http';
import { map, of } from 'rxjs';
import { createSlide } from './helpers';

/** @description Provides default slides used if no slides is provides to the slides component */
export function provideSlides(timer: number = 1000, assets?: string) {
  return {
    provide: SLIDES,
    useFactory: () => {
      const http = inject(HttpClient);
      assets = assets ?? '/assets/resources/slides.json';
      const slides$ = http
        ? http.get<{ data: string | SlideData }[]>(assets).pipe(
            map((slides: { data: string | SlideData }[]) => ({
              timer,
              slides,
            }))
          )
        : of({ timer: 0, slides: [] });

      return slides$.pipe(
        map(({ timer, slides }) => ({
          timer,
          slides: slides.map((value, index: number) =>
            createSlide(
              index,
              typeof value.data === 'string'
                ? value.data
                : value.data?.toString()
            )
          ),
        }))
      );
    },
  } as Provider;
}
