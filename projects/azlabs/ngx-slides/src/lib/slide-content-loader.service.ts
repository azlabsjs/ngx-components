import { Inject, Injectable, Optional } from '@angular/core';
import { from, lastValueFrom, of, tap } from 'rxjs';
import {
  SlidesContents,
  SlidesRequestClient,
  SLIDES_REQUEST_CLIENT,
} from './types';

@Injectable({
  providedIn: 'root',
})
export class SlideContentLoader {
  private _contents!: SlidesContents;

  get contents() {
    return this._contents;
  }

  constructor(
    @Inject(SLIDES_REQUEST_CLIENT)
    @Optional()
    private client: SlidesRequestClient
  ) {}

  //
  async load(assets?: string) {
    return lastValueFrom(
      (this.client
        ? from(this.client.get(assets))
        : of({ timer: 0, slides: [] } as SlidesContents)
      ).pipe(tap((state) => (this._contents = state)))
    );
  }
}
