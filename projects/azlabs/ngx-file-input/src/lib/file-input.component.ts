import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  HTTPRequest,
  HTTPResponse,
  Interceptor,
  RequestClient,
} from '@azlabsjs/requests';
import { Uploader, UploadOptions } from '@azlabsjs/uploader';
import {
  decorateBlob,
  isValidHttpUrl,
  readPropertyValue,
  uuidv4,
} from './helpers';
import { NgxUploadsEventsService } from './uploads-events.service';
import {
  ErrorStateType,
  EventArgType,
  SetStateParam,
  StateType,
  UploadOptionsType,
  ValueType,
} from './types';
import { UPLOADER_OPTIONS } from './tokens';
import { CommonModule } from '@angular/common';
import { HTMLFileInputDirective } from './file-input.directive';
import { PIPES } from './pipes';

@Component({
  standalone: true,
  selector: 'ngx-file-input',
  imports: [CommonModule, HTMLFileInputDirective, ...PIPES],
  templateUrl: './file-input.component.html',
  styles: [
    `
      .flex-files-input {
        display: flex;
      }

      .flex-files-input > input[type='file'] {
        flex-grow: 1;
      }

      .flex-files-input.error > input[type='file'] {
        border: var(--error-input-border, 1px solid #ff494f);
      }

      .tooltip .tooltip-content.error {
        background-color: #ff494f !important;
      }
      .tooltip > .tooltip-content::before {
        border-left: 0.3rem solid #ff494f !important;
        border-left-color: #ff494f !important;
        border-top: 0.25rem solid #ff494f !important;
        border-top-color: #ff494f !important;
        border-right: 0.3rem solid transparent;
        border-bottom: 0.25rem solid transparent;
      }

      .error-icon {
        fill: red;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFileInputComponent {
  //#region component inputs
  @Input({ alias: 'upload-as' }) uploadAs!: string | undefined;
  @Input({ alias: 'placeholder' }) placeholder!: string | undefined;
  @Input({ alias: 'class' }) cssClass!: string | undefined;
  @Input({ alias: 'description' }) description!: string | undefined;
  @Input({ alias: 'multiple' }) multiple: boolean = false;
  @Input({ alias: 'max-file-size' }) maxFilesize: number = 10;
  @Input({ alias: 'max-files' }) maxFiles: number = 1;
  @Input() accept: string | string[] = [];
  @Input() url!: string | undefined;
  @Input() describe: boolean = true;
  @Input() read: 'id' | 'url' | 'object' | undefined = 'id';
  /**
   * ng Input attribute that defines whether files must automatically
   * be uploaded when the get accepted by the component
   */
  @Input({ alias: 'autoupload' }) autoupload: boolean = false;
  @Input({ alias: 'tooltip-error' }) tooltip!: TemplateRef<any>;

  /** @deprecated */
  @Input({ alias: 'file-size-error' }) fileSizeError!: string;
  /** @deprecated */
  @Input({ alias: 'file-upload-error' }) fileUploadError!: string;
  //#endregion

  // #region component properties
  _state: StateType = { uploading: false, error: undefined };
  get state() {
    return this._state;
  }
  // #endregion

  // #region component outputs
  @Output() reset = new EventEmitter<void>();
  @Output() value = new EventEmitter<ValueType>();
  @Output() error = new EventEmitter<ErrorStateType>();
  // #endregion

  // Class constructor
  constructor(
    private cdRef: ChangeDetectorRef | null,
    @Inject(UPLOADER_OPTIONS)
    public readonly uploadOptions: UploadOptionsType<HTTPRequest, HTTPResponse>,
    private uploadEvents: NgxUploadsEventsService,
    private injector: Injector
  ) {}

  sizeError(e: File[]) {
    const error: ErrorStateType = { type: 'size', data: e };
    this.setState((state) => ({ ...state, error }));
    this.error.emit(error);
  }

  notAccepted(e: File[]) {
    const error: ErrorStateType = { type: 'accept', data: e };
    this.setState((state) => ({ ...state, error }));
    this.error.emit(error);
  }

  accepted(e: File[]) {
    const { url, uploadOptions: o, multiple, autoupload, uploadAs } = this;
    if (autoupload) {
      this.upload(e, url, o, multiple, uploadAs);
      return;
    }

    this.value.emit(multiple ? e : e[0]);
  }

  private async upload(
    event: File[],
    url: string | undefined,
    o: UploadOptionsType<HTTPRequest, HTTPResponse>,
    multiple: boolean = false,
    uploadAs: string = 'file'
  ) {
    // when the autoupload is set on the current component,
    // we send an upload request to configured url or server
    // url for each accepted files
    try {
      const path = url ?? o.path;
      if (
        typeof path === 'undefined' ||
        path === null ||
        !isValidHttpUrl(path)
      ) {
        throw new Error('failed processing upload, invalid URL .');
      }

      let interceptor!: Interceptor<HTTPRequest>;
      let backend!: RequestClient<HTTPRequest, HTTPResponse>;
      const { interceptorFactory, backendFactory, name, responseType } = o;
      if (typeof interceptorFactory === 'function') {
        interceptor = interceptorFactory(this.injector);
      }
      if (typeof backendFactory === 'function') {
        backend = backendFactory(this.injector);
      }

      const options = {
        ...{
          ...o,
          // Set the backend and interceptor factory functions to undefined
          interceptorFactory: undefined,
          backendFactory: undefined,
        },
        // By the default, the url passed in the HTML template, takes preceedence on inputConfig uploadURL, which
        // in turn takes precedence over the globally configured upload path
        path,
        // We use the name provided in the input configuration or fallback to gloabbly configured name
        name: uploadAs ?? name ?? 'file',
        // We use the default specified responseType else we fallback to 'json' response type
        responseType: responseType ?? 'text',
        interceptor,
        backend,
      } as UploadOptions<HTTPRequest, HTTPResponse>;

      // Set the uploading state of the current component
      let change = { uploading: true, error: undefined };
      this.setState((value) => ({ ...value, ...change }));

      // process to files upload
      const items = (multiple ? event : [event[0]]).map((file) => ({
        content: file,
        uuid: uuidv4(),
      }));

      // wait for all uploads to complete
      let uploaded = await Promise.all(
        items.map(async (file) => {
          this.uploadEvents.startUpload({
            id: file.uuid,
            processing: true,
            file: file.content,
          });
          // Creating a new uploader instance each time for bug in current version of the uploader
          const uploader = Uploader(options);
          const result = await uploader.upload(file.content);
          let output!: EventArgType;
          if (typeof result === 'string') {
            try {
              output = decorateBlob(file.content, {
                upload: {
                  result: JSON.parse(result),
                },
              });
            } catch (error) {
              output = decorateBlob(file.content, {
                upload: {
                  result: result,
                  error: error,
                },
              });
            }
          } else {
            output = decorateBlob(file.content, {
              upload: {
                result: result,
              },
            });
          }
          this.uploadEvents.completeUpload(file.uuid, output);
          return output;
        })
      );

      // we filter the result array and remove all result objects that
      // has been marked errored
      uploaded = uploaded.filter(
        (result) =>
          typeof result.upload?.error === 'undefined' ||
          result.upload?.error === null
      );

      change = { uploading: false, error: undefined };
      this.setState((value) => ({ ...value, ...change }));

      const args = multiple
        ? uploaded.map((result) =>
            readPropertyValue<EventArgType>(result, this.read ?? 'id')
          )
        : readPropertyValue<EventArgType>(uploaded[0], this.read ?? 'id');

      // emit the list of values
      this.value.emit(args);
    } catch (error) {
      const err: ErrorStateType = { type: 'upload', data: event, error };
      this.setState((value) => ({ ...value, uploading: false, error: err }));
      // emit error event
      this.error.emit(err);
    }
  }

  onReset() {
    this.reset.emit();
  }

  /**
   * Local state management API that marks component for update on
   * each state changes
   */
  private setState(state: SetStateParam<StateType>) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
