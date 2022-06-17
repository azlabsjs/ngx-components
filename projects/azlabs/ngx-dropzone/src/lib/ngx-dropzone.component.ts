import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
  OnDestroy,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DropzoneEvents, DropzoneEvent, DROPZONE_CONFIG, DropzoneComponentInterface } from './types';
import { NgxDropzoneDirective } from './ngx-dropzone.directive';
import { DropzoneConfig } from './types';
import { BehaviorSubject, Subject } from 'rxjs';
import { mergeDzAcceptFiles, createDefaultPreviewTemplate } from './helpers';

@Component({
  selector: 'ngx-dropzone',
  template: `
    <ng-container *ngIf="defaults$ | async as defaults">
      <div
        class="dropzone-wrapper"
        [class.disabled]="disabled"
        [class]="'dz-wrapper'"
        [class.dropzone]="useDropzoneClass"
        [dropzone]="defaults"
        [disabled]="disabled"
        (init)="DZ_INIT.emit($event)"
        (error)="onUploadError()"
        (success)="onUploadSuccess()"
      >
        <div
          class="dz-message"
          [class.disabled]="disabled"
          [class.dz-placeholder]="placeholder"
        >
          <div class="text-center dz-upload-btn">
            <ng-container *ngTemplateOutlet="dzuploadbuttonRef"></ng-container>
          </div>
          <span>{{ dragFileText || defaults.dictDrag }}</span>
          <span class="dz-text">
            <a href="javascript:undefined;">{{
              defaultMessage || defaults?.dictDefaultMessage
            }}</a>
          </span>
          <span> {{ uploadFileText || defaults.dictDrag2 }}</span>
          <div
            *ngIf="placeholder"
            class="dz-image"
            [style.background-image]="getPlaceholder()"
          ></div>
        </div>
        <ng-content></ng-content>
      </div>
    </ng-container>
  `,
  styleUrls: ['./ngx-dropzone.component.scss'],
})
export class NgxDropzoneComponent implements OnInit, AfterViewInit, OnDestroy, DropzoneComponentInterface {
  @ViewChild(NgxDropzoneDirective, { static: false })
  dropzoneDirective!: NgxDropzoneDirective;
  @Input() defaultMessage!: string;
  @Input() dragFileText!: string;
  @Input() uploadFileText!: string;
  @Input() config!: DropzoneConfig;
  @Input() label = 'browse';
  @Input() placeholder!: string;
  @Input() useDropzoneClass = true;
  @Input() disabled = false;
  @Input() filePreview!: string;
  @Input() accepted!: string;

  // #region Output properties
  // tslint:disable-next-line: no-output-rename
  @Output('init') DZ_INIT = new EventEmitter<any>();

  // tslint:disable-next-line: no-output-rename
  // tslint:disable-next-line: no-output-native
  // tslint:disable-next-line: no-output-rename
  @Output('error') DZ_ERROR = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  // tslint:disable-next-line: no-output-native
  @Output('success') DZ_SUCCESS = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('sending') DZ_SENDING = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('canceled') DZ_CANCELED = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('complete') DZ_COMPLETE = new EventEmitter<any>();
  @Output('processing') DZ_PROCESSING = new EventEmitter<any>();

  // tslint:disable-next-line: no-output-rename
  @Output('drop') DZ_DROP = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('dragStart') DZ_DRAGSTART = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('dragEnd') DZ_DRAGEND = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('dragEnter') DZ_DRAGENTER = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('dragOver') DZ_DRAGOVER = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('dragLeave') DZ_DRAGLEAVE = new EventEmitter<any>();

  // tslint:disable-next-line: no-output-rename
  @Output('thumbnail') DZ_THUMBNAIL = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('addedFile') DZ_ADDEDFILE = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('addedFiles') DZ_ADDEDFILES = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('removedFile') DZ_REMOVEDFILE = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('uploadProgress') DZ_UPLOADPROGRESS = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('maxFilesReached') DZ_MAXFILESREACHED = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('maxFilesExceeded') DZ_MAXFILESEXCEEDED = new EventEmitter<any>();

  // tslint:disable-next-line: no-output-rename
  @Output('errorMultiple') DZ_ERRORMULTIPLE = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('successMultiple') DZ_SUCCESSMULTIPLE = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('sendingMultiple') DZ_SENDINGMULTIPLE = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('canceledMultiple') DZ_CANCELEDMULTIPLE = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('completeMultiple') DZ_COMPLETEMULTIPLE = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('processingMultiple') DZ_PROCESSINGMULTIPLE = new EventEmitter<any>();

  // tslint:disable-next-line: no-output-rename
  // tslint:disable-next-line: no-output-native
  @Output('reset') DZ_RESET = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('queueComplete') DZ_QUEUECOMPLETE = new EventEmitter<any>();
  // tslint:disable-next-line: no-output-rename
  @Output('totalUploadProgress') DZ_TOTALUPLOADPROGRESS =
    new EventEmitter<any>();

  //#region Content
  @ContentChild('dzuploadbutton') dzuploadbuttonRef!: TemplateRef<any>;
  //#endregion Content

  // tslint:disable-next-line: variable-name
  private config$ = new BehaviorSubject<DropzoneConfig>({} as DropzoneConfig);
  defaults$ = this.config$.asObservable();
  // tslint:disable-next-line: variable-name
  private _destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platform: object,
    @Inject(DROPZONE_CONFIG) private defaultConfig: DropzoneConfig
  ) {}

  // tslint:disable-next-line: typedef
  dropzone() {
    return this.dropzoneDirective.dropzone();
  }

  // tslint:disable-next-line: typedef
  public reset() {
    this.dropzoneDirective.reset();
  }

  // tslint:disable-next-line: typedef
  ngOnInit() {
    this.config = mergeDzAcceptFiles(
      { ...(this.defaultConfig ?? {}), ...(this.config ?? {}) },
      this.accepted
    );
    this.setDzConfig();
    console.log(this.config);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platform)) {
      return;
    }
    this.subscribeToEvents();
  }

  private setDzConfig() {
    if (typeof this.config === 'undefined' || this.config === null) {
      return this.config$.next({
        previewTemplate: createDefaultPreviewTemplate(this.filePreview),
      } as DropzoneConfig);
    }

    if (
      typeof this.config!.previewTemplate === 'undefined' &&
      this.config!.previewTemplate === null
    ) {
      return this.config$.next({
        ...this.config,
        previewTemplate: createDefaultPreviewTemplate(
          this.config.acceptedFiles &&
            this.config.acceptedFiles.indexOf('image/*') !== -1
            ? undefined
            : this.filePreview
        ),
      } as DropzoneConfig);
    }
    return this.config$.next(this.config);
  }

  private subscribeToEvents() {
    DropzoneEvents.forEach((event: DropzoneEvent) => {
      if (this.dropzoneDirective) {
        const output = `DZ_${event.toUpperCase()}`;
        this.dropzoneDirective.setEmitter(
          output as keyof NgxDropzoneDirective,
          this[output as keyof NgxDropzoneComponent]
        );
      }
    });
  }

  // tslint:disable-next-line: typedef
  onUploadError() {}

  // tslint:disable-next-line: typedef
  onUploadSuccess() {}

  public getPlaceholder(): string {
    return 'url(' + encodeURI(this.placeholder) + ')';
  }

  // tslint:disable-next-line: typedef
  ngOnDestroy() {
    this._destroy$.next();
  }
}
