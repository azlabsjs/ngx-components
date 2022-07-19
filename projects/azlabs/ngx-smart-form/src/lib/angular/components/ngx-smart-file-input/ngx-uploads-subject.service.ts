import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

export type UploadEvent = {
  id: string;
  processing: boolean;
  result?: unknown;
  file: File;
};

@Injectable()
export class NgxUploadsSubjectService {
  /**
   * Cache of upload event entries to tracks uploads
   *
   * @property
   */
  private _events$ = new BehaviorSubject<UploadEvent[]>([]);

  //
  public readonly events$ = this._events$.asObservable().pipe(tap(console.log));

  /**
   * Signal an upload start event
   *
   * @method
   *
   * @param value
   */
  public startUpload(value: UploadEvent) {
    this._events$.next([...this._events$.getValue(), value]);
  }

  /**
   * Signals an upload complete event
   *
   * @param uuid
   * @param result
   */
  public completeUpload(uuid: string, result: unknown) {
    const state = [...this._events$.getValue()];
    const index = state.findIndex((event) => event.id === uuid);
    state.splice(index, 1, {
      ...state[index],
      result,
    });
    this._events$.next([...state]);
  }

  /**
   * Removes an upload event from the cache
   *
   * @param uuid
   */
  public removeUploadState(uuid: string) {
    this._events$.next(
      [...this._events$.getValue()].filter((event) => event.id === uuid)
    );
  }
}
