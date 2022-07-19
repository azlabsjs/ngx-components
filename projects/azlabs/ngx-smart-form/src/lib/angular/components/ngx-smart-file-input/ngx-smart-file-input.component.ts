import {
  Component,
  OnInit,
  Input,
  Inject,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { DropzoneConfig } from '@azlabsjs/ngx-dropzone';
import { FileInput } from '@azlabsjs/smart-form-core';
import { UPLOADER_OPTIONS } from '../../types';
import { Uploader, UploadOptions } from '@azlabsjs/uploader';
import { HttpRequest, HttpResponse } from '@azlabsjs/requests';
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
})
export class NgxSmartFileInputComponent implements OnInit, OnDestroy {
  //#region Component inputs
  @Input() control!: FormControl;
  @Input() describe = true;
  @Input() inputConfig!: FileInput;
  @Input() uploadAs!: string;
  @Input() autoupload: boolean = false;
  @Input() url!: string | undefined;
  //#endregion Component inputs

  //#region Component outputs
  @Output() addedEvent = new EventEmitter<any>();
  @Output() removedEvent = new EventEmitter<any>();
  //#endregion Component outputs

  private _destroy$ = new Subject<void>();
  // Property for handling File Input types
  public dropzoneConfigs!: DropzoneConfig;

  constructor(
    @Inject(UPLOADER_OPTIONS)
    private uploadOptions: UploadOptions<HttpRequest, HttpResponse>,
    private uploadEvents: NgxUploadsSubjectService
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
          : this.uploadOptions.path ?? '',
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
    // TODO: Add error to control
  }

  async onAcceptedFiles(
    event: File[],
    multiple: boolean = false,
    autoupload: boolean = false,
    uploadAs: string = 'file'
  ) {
    return !autoupload
      ? this.control.setValue(multiple ? event : event[0])
      : this.processUploads(event, multiple, autoupload, uploadAs);
  }

  private async processUploads(
    event: File[],
    multiple: boolean = false,
    autoupload: boolean = false,
    uploadAs: string = 'file'
  ) {
    // When the autoupload is set on the current component, we send an upload request
    // to configured url or server url for each accepted files
    const _files = (multiple ? [event[0]] : event).map((file) => ({
      content: file,
      uuid: uuidv4(),
    }));
    const uploader = Uploader({
      ...this.uploadOptions,
      // By the default, the url passed in the HTML template, takes preceedence on inputConfig uploadURL, which
      // in turn takes precedence over the globally configured upload path
      path: this.url ?? this.inputConfig.uploadUrl ?? this.uploadOptions.path,
      // We use the name provided in the input configuration or fallback to gloabbly configured name
      name: uploadAs ?? this.uploadOptions.name ?? 'file',
      // We use the default specified responseType else we fallback to 'json' response type
      responseType: this.uploadOptions.responseType ?? 'json',
    });
    let results = await Promise.all(
      _files.map(async (file) => {
        this.uploadEvents.startUpload({
          id: file.uuid,
          processing: true,
          file: file.content,
        });
        const result = (await uploader.upload(file.content)) as Record<
          string,
          any
        >;
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
          _result = result;
        }
        this.uploadEvents.completeUpload(file.uuid, _result);
        return _result;
      })
    );
    // We filter the result array and remove all result objects that
    // has been marked errored
    results = results.filter(
      (result) =>
        typeof result['error'] !== 'undefined' && result['error'] !== null
    );
    // After all files has been uploaded, we set the form control value to
    // ids returned by the uploader request
    this.control.setValue(
      multiple ? results[0]['id'] : results.map((result) => result['id'])
    );
  }

  onReset() {
    this.control.reset();
  }

  ngOnDestroy() {
    this._destroy$.next();
  }
}
