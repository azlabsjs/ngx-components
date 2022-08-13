import {
  Component,
  OnInit,
  Input,
  Inject,
  Output,
  EventEmitter,
  OnDestroy,
  Injector,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { DropzoneConfig } from '@azlabsjs/ngx-dropzone';
import { FileInput, isValidHttpUrl } from '@azlabsjs/smart-form-core';
import { UPLOADER_OPTIONS, UploadOptionsType } from '../../types';
import { Uploader, UploadOptions } from '@azlabsjs/uploader';
import {
  HTTPRequest,
  HTTPResponse,
  Interceptor,
  RequestClient,
} from '@azlabsjs/requests';
import { NgxUploadsSubjectService } from './ngx-uploads-subject.service';

function uuidv4() {
  const rand = Math.random;
  function substr(str: string, offset: number, length: number) {
    return str.substring(offset, Math.min(str.length, offset + length));
  }
  let nbr: number;
  let randStr = '';
  do {
    randStr += substr((nbr = rand()).toString(16), 3, 6);
  } while (randStr.length < 30);
  return `${substr(randStr, 0, 8)}-${substr(randStr, 8, 4)}-${substr(
    randStr,
    12,
    3
  )}-${(((nbr * 4) | 0) + 8).toString(16) + substr(randStr, 15, 3)}-${substr(
    randStr,
    18,
    12
  )}`;
}

@Component({
  selector: 'ngx-smart-file-input',
  templateUrl: './ngx-smart-file-input.component.html',
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
    `,
  ],
})
export class NgxSmartFileInputComponent implements OnInit, OnDestroy {
  //#region Component inputs
  @Input() control!: FormControl;
  @Input() describe = true;
  @Input() inputConfig!: FileInput;
  @Input() uploadAs!: string;

  /**
   * Ng Input attribute that defines whether files must
   * automatically be uploaded when the get accepted by the
   * component
   *
   * @property
   */
  @Input() autoupload: boolean = false;
  /**
   *
   * Ng Input attribute that defines whether files must
   * be uploaded during submit stage
   *
   * @property
   */
  @Input() submitupload: boolean = false;

  @Input() url!: string | undefined;
  //#endregion Component inputs

  //#region Component outputs
  @Output() addedEvent = new EventEmitter<any>();
  @Output() removedEvent = new EventEmitter<any>();
  //#endregion Component outputs

  private _destroy$ = new Subject<void>();
  // Property for handling File Input types
  public dropzoneConfigs!: DropzoneConfig;

  // Control HTML uploading indicator
  public uploading: boolean = false;
  public hasUploadError: boolean = false;

  _inputState$ = new BehaviorSubject({
    uploading: false,
    hasError: false,
    tooLargeFiles: [] as File[],
  });
  inputState$ = this._inputState$.asObservable();

  constructor(
    @Inject(UPLOADER_OPTIONS)
    private uploadOptions: UploadOptionsType<HTTPRequest, HTTPResponse>,
    private uploadEvents: NgxUploadsSubjectService,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    const config = this.inputConfig;
    //#region Set the dropzone configurations
    this.dropzoneConfigs = {
      maxFiles: config.multiple ? 50 : 1,
      maxFilesize: config.maxFileSize ? config.maxFileSize : 10,
      url:
        typeof config.uploadUrl !== 'undefined' &&
        config !== null &&
        config.uploadUrl !== ''
          ? config.uploadUrl
          : this.uploadOptions.path ?? 'http://localhost',
      uploadMultiple: config.multiple ? config.multiple : false,
      acceptedFiles: config.pattern,
    } as DropzoneConfig;
  }

  dzOnAdd(event?: any) {
    // Handle the add event on the dz component
  }

  // tslint:disable-next-line: typedef
  dzOnRemove(event: any, multiple: boolean = false) {
    if (
      typeof this.control.value === 'undefined' ||
      this.control.value === null
    ) {
      return;
    }
    // Notify the parent component of the remove event
    this.removedEvent.emit();

    // Then if supporting multiple files upload, remove the deleted file from the list
    if (multiple) {
      return this.control.setValue(
        (this.control.value as File[]).filter((file) => {
          return file !== event;
        })
      );
    }
    // Reset the input control
    this.onReset();
  }

  onTooLargeFilesEvent(event: File[]) {
    this._inputState$.next({
      ...this._inputState$.getValue(),
      tooLargeFiles: event,
    });
  }

  async onAcceptedFiles(
    event: File[],
    multiple: boolean = false,
    autoupload: boolean = false,
    uploadAs: string = 'file'
  ) {
    autoupload || this.autoupload
      ? this.processUploads(event, multiple, uploadAs)
      : this.control.setValue(multiple ? event : event[0]);
  }

  private async processUploads(
    event: File[],
    multiple: boolean = false,
    uploadAs: string = 'file'
  ) {
    // When the autoupload is set on the current component, we send an upload request
    // to configured url or server url for each accepted files
    try {
      const path =
        this.url ?? this.inputConfig.uploadUrl ?? this.uploadOptions.path;

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
      this._inputState$.next({
        ...this._inputState$.getValue(),
        uploading: true,
        hasError: false,
      });
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
      this._inputState$.next({
        ...this._inputState$.getValue(),
        uploading: false,
        hasError: false,
      });
      // After all files has been uploaded, we set the form control value to
      // ids returned by the uploader request
      this.control.setValue(
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
      this._inputState$.next({
        ...this._inputState$.getValue(),
        uploading: false,
        hasError: true,
      });
    }
  }

  onReset() {
    this.control.reset();
  }

  ngOnDestroy() {
    this._destroy$.next();
  }
}
