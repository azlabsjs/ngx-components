import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  Output,
} from '@angular/core';
import {
  HTTPRequest,
  HTTPResponse,
  Interceptor,
  RequestClient,
} from '@azlabsjs/requests';
import { Uploader, UploadOptions } from '@azlabsjs/uploader';
import { isValidHttpUrl, uuidv4 } from './helpers';
import { NgxUploadsEventsService } from './ngx-uploads-events.service';
import { SetStateParam, UploadOptionsType } from './types';
import { UPLOADER_OPTIONS } from './tokens';

type StateType = {
  uploading: boolean;
  hasError: boolean;
  tooLargeFiles: File[];
};

@Component({
  selector: 'ngx-file-input',
  templateUrl: './ngx-file-input.component.html',
  styles: [
    `
      .flex-files-input {
        display: flex;
      }

      .flex-files-input > input[type='file'] {
        flex-grow: 1;
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
})
export class NgxSmartFileInputComponent {
  //#region Component inputs
  @Input() describe = true;
  @Input('upload-as') uploadAs!: string | undefined;
  @Input('placeholder') placeholder!: string | undefined;
  @Input('class') cssClass!: string | undefined;
  @Input('description') description!: string | undefined;
  @Input('multiple') multiple: boolean = false;
  @Input('max-file-size') maxFilesize: number = 10;
  @Input('max-files') maxFiles: number = 50;
  @Input('has-error') hasError: boolean = false;

  @Input('required-error') requiredError!: string;
  @Input('file-size-error') fileSizeError!: string;
  @Input('file-upload-error') fileUploadError!: string;

  /**
   * Ng Input attribute that defines whether files must
   * automatically be uploaded when the get accepted by the
   * component
   *
   * @property
   */
  @Input('autoupload') autoupload: boolean = false;
  /**
   *
   * Ng Input attribute that defines whether files must
   * be uploaded during submit stage
   *
   * @property
   */
  @Input() submitupload: boolean = false;

  /**
   * @attr
   *
   * Uploader submit url
   */
  @Input() url!: string | undefined;
  //#endregion Component inputs

  // #region Component properties
  // Property for handling File Input types
  private _state: StateType = {
    uploading: false,
    hasError: false,
    tooLargeFiles: [] as File[],
  };
  get state() {
    return this._state;
  }
  // #endregion Component properties

  // #region component outputs
  @Output() reset = new EventEmitter<void>();
  @Output() value = new EventEmitter<File | File[]>();
  // #endregion component outputs

  /**
   * Creates a File Input component
   *
   * @param uploadOptions
   * @param uploadEvents
   * @param injector
   */
  constructor(
    @Inject(UPLOADER_OPTIONS)
    private uploadOptions: UploadOptionsType<HTTPRequest, HTTPResponse>,
    private uploadEvents: NgxUploadsEventsService,
    private injector: Injector,
    private changeRef: ChangeDetectorRef
  ) {}

  onTooLargeFilesEvent(event: File[]) {
    this.setState((state) => ({ ...state, tooLargeFiles: event }));
  }

  async onAcceptedFiles(
    event: File[],
    multiple: boolean = false,
    autoupload: boolean = false,
    uploadAs: string = 'file'
  ) {
    autoupload || this.autoupload
      ? this.processUploads(event, multiple, uploadAs)
      : this.value.emit(multiple ? event : event[0]);
  }

  private async processUploads(
    event: File[],
    multiple: boolean = false,
    uploadAs: string = 'file'
  ) {
    // When the autoupload is set on the current component, we send an upload request
    // to configured url or server url for each accepted files
    try {
      const path = this.url ?? this.uploadOptions.path;

      if (
        typeof path === 'undefined' ||
        path === null ||
        !isValidHttpUrl(path)
      ) {
        throw new Error('Failed processing upload, Invalid URL .');
      }
      // Process to files upload
      const _files = (multiple ? event : [event[0]]).map((file) => ({
        content: file,
        uuid: uuidv4(),
      }));

      //#region execute the interceptor factory and backend factory function
      let interceptor!: Interceptor<HTTPRequest>;
      let backend!: RequestClient<HTTPRequest, HTTPResponse>;
      if (typeof this.uploadOptions.interceptorFactory === 'function') {
        interceptor = this.uploadOptions.interceptorFactory(this.injector);
      }
      if (typeof this.uploadOptions.backendFactory === 'function') {
        backend = this.uploadOptions.backendFactory(this.injector);
      }
      //#endregion execute the interceptor factory and backend factory function
      const options = {
        ...{
          ...this.uploadOptions,
          // Set the backend and interceptor factory functions to undefined
          interceptorFactory: undefined,
          backendFactory: undefined,
        },
        // By the default, the url passed in the HTML template, takes preceedence on inputConfig uploadURL, which
        // in turn takes precedence over the globally configured upload path
        path,
        // We use the name provided in the input configuration or fallback to gloabbly configured name
        name: uploadAs ?? this.uploadOptions.name ?? 'file',
        // We use the default specified responseType else we fallback to 'json' response type
        responseType: this.uploadOptions.responseType ?? 'text',
        interceptor,
        backend,
      } as UploadOptions<HTTPRequest, HTTPResponse>;
      // Set the uploading state of the current component
      this.setState((state) => ({
        ...state,
        uploading: true,
        hasError: false,
      }));
      let results = await Promise.all(
        _files.map(async (file) => {
          this.uploadEvents.startUpload({
            id: file.uuid,
            processing: true,
            file: file.content,
          });
          // Creating a new uploader instance each time for bug in current version of the uploader
          const uploader = Uploader(options);
          const result = await uploader.upload(file.content);
          let _result!: Record<string, any>;
          if (typeof result === 'string') {
            try {
              // If parsing the string throws an error, then request may have
              // failed
              _result = JSON.parse(result);
            } catch (error) {
              _result = {} as Record<string, any>;
              _result['error'] = error;
            }
          } else {
            _result = result as any;
          }
          this.uploadEvents.completeUpload(file.uuid, _result);
          return _result;
        })
      );
      // We filter the result array and remove all result objects that
      // has been marked errored
      results = results.filter(
        (result) =>
          typeof result['error'] === 'undefined' || result['error'] === null
      );
      // Set the uploading state of the current component
      this.setState((_state) => ({
        ..._state,
        uploading: false,
        hasError: false,
      }));
      // After all files has been uploaded, we set the form control value to
      // ids returned by the uploader request
      this.value.emit(
        multiple
          ? results.map((result) =>
              typeof result['id'] === 'undefined' || result['id'] === null
                ? result
                : result['id']
            )
          : typeof results[0]['id'] === 'undefined' || results[0]['id'] === null
          ? results[0]
          : results[0]['id']
      );
    } catch (error) {
      this.setState((_state) => ({
        ..._state,
        uploading: false,
        hasError: true,
      }));
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
    this._state =
      typeof state === 'function'
        ? state(this._state)
        : { ...this._state, ...state };
    this.changeRef.markForCheck();
  }
}
