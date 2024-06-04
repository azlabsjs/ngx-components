import {
  ChangeDetectionStrategy,
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
import {
  decorateBlob,
  isValidHttpUrl,
  readPropertyValue,
  uuidv4,
} from './helpers';
import { NgxUploadsEventsService } from './uploads-events.service';
import { EventArgType, SetStateParam, UploadOptionsType } from './types';
import { UPLOADER_OPTIONS } from './tokens';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HTMLFileInputDirective } from './file-input.directive';
import { SafeHTMLPipe } from './safe-html.pipe';

/** @internal */
type StateType = {
  uploading: boolean;
  hasError: boolean;
  tooLargeFiles: File[];
};

@Component({
  standalone: true,
  selector: 'ngx-file-input',
  imports: [CommonModule, FormsModule, HTMLFileInputDirective, SafeHTMLPipe],
  templateUrl: './file-input.component.html',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFileInputComponent {
  //#region Component inputs
  @Input({ alias: 'upload-as' }) uploadAs!: string | undefined;
  @Input({ alias: 'placeholder' }) placeholder!: string | undefined;
  @Input({ alias: 'class' }) cssClass!: string | undefined;
  @Input({ alias: 'description' }) description!: string | undefined;
  @Input({ alias: 'multiple' }) multiple: boolean = false;
  @Input({ alias: 'max-file-size' }) maxFilesize: number = 10;
  @Input({ alias: 'max-files' }) maxFiles: number = 50;
  @Input({ alias: 'has-error' }) hasError: boolean = false;
  @Input() describe: boolean = true;
  /** @description Read the id property of the uploaded file result or the entire object */
  @Input() read: 'id' | 'url' | 'object' | undefined = 'id';
  @Input({ alias: 'required-error' }) requiredError!: string;
  @Input({ alias: 'file-size-error' }) fileSizeError!: string;
  @Input({ alias: 'file-upload-error' }) fileUploadError!: string;

  /**
   * Ng Input attribute that defines whether files must
   * automatically be uploaded when the get accepted by the
   * component
   *
   */
  @Input({ alias: 'autoupload' }) autoupload: boolean = false;

  /** @description Uploader submit url */
  @Input() url!: string | undefined;
  //#endregion Component inputs

  // #region Component properties
  // Property for handling File Input types
  _state: StateType = {
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
  @Output() value = new EventEmitter<
    EventArgType | EventArgType[] | string | string[]
  >();
  // #endregion component outputs

  // Class constructor
  constructor(
    private cdRef: ChangeDetectorRef | null,
    @Inject(UPLOADER_OPTIONS)
    public readonly uploadOptions: UploadOptionsType<HTTPRequest, HTTPResponse>,
    private uploadEvents: NgxUploadsEventsService,
    private injector: Injector
  ) {}

  onTooLargeFilesEvent(event: File[]) {
    this.setState((state) => ({ ...state, tooLargeFiles: event }));
  }

  async onAcceptedFiles(
    event: File[],
    url: string | undefined,
    o: UploadOptionsType<HTTPRequest, HTTPResponse>,
    multiple: boolean = false,
    autoupload: boolean = false,
    uploadAs: string = 'file'
  ) {
    if (autoupload) {
      return this.processUploads(event, url, o, multiple, uploadAs);
    }
    this.value.emit(multiple ? event : event[0]);
  }

  private async processUploads(
    event: File[],
    url: string | undefined,
    o: UploadOptionsType<HTTPRequest, HTTPResponse>,
    multiple: boolean = false,
    uploadAs: string = 'file'
  ) {
    // When the autoupload is set on the current component, we send an upload request
    // to configured url or server url for each accepted files
    try {
      const path = url ?? o.path;

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
      const { interceptorFactory, backendFactory, name, responseType } = o;
      if (typeof interceptorFactory === 'function') {
        interceptor = interceptorFactory(this.injector);
      }
      if (typeof backendFactory === 'function') {
        backend = backendFactory(this.injector);
      }
      //#endregion execute the interceptor factory and backend factory function
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
      this.setState((state) => ({
        ...state,
        uploading: true,
        hasError: false,
      }));

      // Wait for all uploads to complete
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
          let _result!: EventArgType;
          if (typeof result === 'string') {
            try {
              // If parsing the string throws an error, then request may have
              // failed
              _result = decorateBlob(file.content, {
                upload: {
                  result: JSON.parse(result),
                },
              });
            } catch (error) {
              _result = decorateBlob(file.content, {
                upload: {
                  result: result,
                  error: error,
                },
              });
            }
          } else {
            _result = decorateBlob(file.content, {
              upload: {
                result: result,
              },
            });
          }
          this.uploadEvents.completeUpload(file.uuid, _result);
          return _result;
        })
      );
      // We filter the result array and remove all result objects that
      // has been marked errored
      results = results.filter(
        (result) =>
          typeof result.upload?.error === 'undefined' ||
          result.upload?.error === null
      );
      // Set the uploading state of the current component
      this.setState((_state) => ({
        ..._state,
        uploading: false,
        hasError: false,
      }));

      // Resolve input based on the what is requested by developper
      const _eventArgs = multiple
        ? results.map((result) =>
            readPropertyValue<EventArgType>(result, this.read ?? 'id')
          )
        : readPropertyValue<EventArgType>(results[0], this.read ?? 'id');

      // Emit the list of values
      this.value.emit(_eventArgs);
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
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
