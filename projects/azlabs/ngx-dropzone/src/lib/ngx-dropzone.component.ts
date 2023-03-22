import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { createDefaultPreviewTemplate, mergeDzAcceptFiles } from './helpers';
import { NgxDropzoneDirective } from './ngx-dropzone.directive';
import {
  DropzoneComponentInterface,
  DropzoneConfig,
  DropzoneEvent,
  DropzoneEvents,
  DROPZONE_CONFIG
} from './types';

@Component({
  selector: 'ngx-dropzone',
  template: `
    <ng-container *ngIf="state">
      <div
        class="dropzone-wrapper"
        [class.disabled]="disabled"
        [class]="'dz-wrapper'"
        [class.dropzone]="useDropzoneClass"
        [dropzone]="state"
        [disabled]="disabled"
        (init)="DZ_INIT.emit($event)"
      >
        <div
          class="dz-message"
          [class.disabled]="disabled"
          [class.dz-placeholder]="placeholder"
        >
          <div class="text-center dz-upload-btn">
            <ng-container *ngTemplateOutlet="dzuploadbuttonRef"></ng-container>
          </div>
          <span>{{ dragFileText || state.dictDrag }}</span>
          <span class="dz-text">
            <a href="javascript:undefined;">{{
              defaultMessage || state.dictDefaultMessage
            }}</a>
          </span>
          <span> {{ uploadFileText || state.dictDrag2 }}</span>
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
export class NgxDropzoneComponent
  implements AfterViewInit, DropzoneComponentInterface, OnChanges
{
  @ViewChild(NgxDropzoneDirective, { static: false })
  directive!: NgxDropzoneDirective;
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
  @Output('init') DZ_INIT = new EventEmitter<any>();

  @Output('error') DZ_ERROR = new EventEmitter<any>();
  @Output('success') DZ_SUCCESS = new EventEmitter<any>();
  @Output('sending') DZ_SENDING = new EventEmitter<any>();
  @Output('canceled') DZ_CANCELED = new EventEmitter<any>();
  @Output('complete') DZ_COMPLETE = new EventEmitter<any>();
  @Output('processing') DZ_PROCESSING = new EventEmitter<any>();

  @Output('drop') DZ_DROP = new EventEmitter<any>();
  @Output('dragStart') DZ_DRAGSTART = new EventEmitter<any>();
  @Output('dragEnd') DZ_DRAGEND = new EventEmitter<any>();
  @Output('dragEnter') DZ_DRAGENTER = new EventEmitter<any>();
  @Output('dragOver') DZ_DRAGOVER = new EventEmitter<any>();
  @Output('dragLeave') DZ_DRAGLEAVE = new EventEmitter<any>();

  @Output('thumbnail') DZ_THUMBNAIL = new EventEmitter<any>();
  @Output('addedFile') DZ_ADDEDFILE = new EventEmitter<any>();
  @Output('addedFiles') DZ_ADDEDFILES = new EventEmitter<any>();
  @Output('removedFile') DZ_REMOVEDFILE = new EventEmitter<any>();
  @Output('uploadProgress') DZ_UPLOADPROGRESS = new EventEmitter<any>();
  @Output('maxFilesReached') DZ_MAXFILESREACHED = new EventEmitter<any>();
  @Output('maxFilesExceeded') DZ_MAXFILESEXCEEDED = new EventEmitter<any>();

  @Output('errorMultiple') DZ_ERRORMULTIPLE = new EventEmitter<any>();
  @Output('successMultiple') DZ_SUCCESSMULTIPLE = new EventEmitter<any>();
  @Output('sendingMultiple') DZ_SENDINGMULTIPLE = new EventEmitter<any>();
  @Output('canceledMultiple') DZ_CANCELEDMULTIPLE = new EventEmitter<any>();
  @Output('completeMultiple') DZ_COMPLETEMULTIPLE = new EventEmitter<any>();
  @Output('processingMultiple') DZ_PROCESSINGMULTIPLE = new EventEmitter<any>();

  @Output('reset') DZ_RESET = new EventEmitter<any>();
  @Output('queueComplete') DZ_QUEUECOMPLETE = new EventEmitter<any>();
  @Output('totalUploadProgress') DZ_TOTALUPLOADPROGRESS =
    new EventEmitter<any>();

  //#region Content
  @ContentChild('dzuploadbutton') dzuploadbuttonRef!: TemplateRef<any>;
  //#endregion Content

  state: DropzoneConfig = {
    previewTemplate: createDefaultPreviewTemplate(),
    ...this.defaultConfig,
  };

  constructor(
    @Inject(PLATFORM_ID) private platform: object,
    @Inject(DROPZONE_CONFIG) private defaultConfig: DropzoneConfig,
    private changesRef: ChangeDetectorRef
  ) {}

  /**
   * Returns the dropzone element
   */
  dropzone() {
    return this.directive.dropzone();
  }

  /**
   * Reset the dropzone element
   */
  reset() {
    this.directive.reset();
  }

  /**
   * Returns the list of dropzone accepted files
   *
   * @returns
   */
  acceptedFiles() {
    return this.dropzone()?.getAcceptedFiles() ?? [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('config' in changes || 'accepted' in changes) {
      this.state = this.getDropzoneState(
        mergeDzAcceptFiles(
          { ...(this.defaultConfig ?? {}), ...(this.config ?? {}) },
          this.accepted
        )
      );
      this.changesRef!.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platform)) {
      return;
    }
    DropzoneEvents.forEach((event: DropzoneEvent) => {
      if (this.directive) {
        const output = `DZ_${event.toUpperCase()}`;
        this.directive.setEmitter(
          output as keyof NgxDropzoneDirective,
          this[output as keyof NgxDropzoneComponent]
        );
      }
    });
  }

  private getDropzoneState(value: DropzoneConfig) {
    if (typeof value === 'undefined' || value === null) {
      return {
        previewTemplate: createDefaultPreviewTemplate(this.filePreview),
      } as DropzoneConfig;
    }
    if (
      typeof value!.previewTemplate === 'undefined' ||
      value!.previewTemplate === null
    ) {
      return {
        ...value,
        previewTemplate: createDefaultPreviewTemplate(
          value.acceptedFiles && value.acceptedFiles.indexOf('image/*') !== -1
            ? undefined
            : this.filePreview
        ),
      } as DropzoneConfig;
    }
    return value;
  }

  getPlaceholder() {
    return 'url(' + encodeURI(this.placeholder) + ')';
  }
}
