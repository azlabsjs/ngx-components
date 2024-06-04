import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** @description upload event type definition */
export type UploadEvent = {
  id: string;
  processing: boolean;
  result?: unknown;
  file: File;
};

@Injectable({
  providedIn: 'root'
})
export class NgxUploadsEventsService {
  /** @description Cache of upload event entries to tracks uploads */
  private _events$ = new BehaviorSubject<UploadEvent[]>([]);

  /** @description Upload state event observables */
  public readonly events$ = this._events$.asObservable();

  /** @description notify an upload start event */
  public startUpload(value: UploadEvent) {
    this._events$.next([...this._events$.getValue(), value]);
  }

  /** @description notify an upload complete event */
  public completeUpload(uuid: string, result: unknown) {
    const state = [...this._events$.getValue()];
    const index = state.findIndex((event) => event.id === uuid);
    state.splice(index, 1, {
      ...state[index],
      result,
    });
    this._events$.next([...state]);
  }

  /** @description Removes an upload event from the cache */
  public removeUploadState(uuid: string) {
    this._events$.next(
      [...this._events$.getValue()].filter((event) => event.id === uuid)
    );
  }
}
