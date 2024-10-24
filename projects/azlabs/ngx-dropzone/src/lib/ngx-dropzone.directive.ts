import { isPlatformBrowser } from '@angular/common';
import {
  Directive, DoCheck, ElementRef, EventEmitter, Inject, Input, KeyValueDiffer,
  KeyValueDiffers, NgZone, OnChanges, OnDestroy, OnInit, Optional, Output, PLATFORM_ID, Renderer2, SimpleChanges
} from '@angular/core';

import { autoDiscover, createDropzone, createDzConfig } from './helpers';
import {
  DropzoneConfig, DropzoneEvent,
  DropzoneEvents, DROPZONE_CONFIG
} from './types';

@Directive({
  selector: '[dropzone]',
  exportAs: 'drewlabsDropzone',
})
export class NgxDropzoneDirective
  implements OnInit, OnDestroy, DoCheck, OnChanges
{
  private instance: any;
  private configDiff: KeyValueDiffer<string, any> | undefined = undefined;
  @Input() disabled: boolean = false;
  @Input('dropzone') config?: DropzoneConfig;

  // # region Outputs definitions
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

  constructor(
    private zone: NgZone,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private differs: KeyValueDiffers,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DROPZONE_CONFIG) @Optional() private defaults: DropzoneConfig
  ) {
    autoDiscover(false);
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    let params = createDzConfig(this.defaults);
    params = createDzConfig(this.config, params);

    this.renderer.addClass(
      this.elementRef.nativeElement,
      params.maxFiles === 1 ? 'dz-single' : 'dz-multiple'
    );

    this.renderer.removeClass(
      this.elementRef.nativeElement,
      params.maxFiles === 1 ? 'dz-multiple' : 'dz-single'
    );

    this.zone.runOutsideAngular(() => {
      this.instance = createDropzone(this.elementRef.nativeElement, params);
    });

    if (this.disabled) {
      this.instance.disable();
    }

    if (this.DZ_INIT.observed) {
      this.zone.run(() => {
        this.DZ_INIT.emit(this.instance);
      });
    }

    // Add auto reset handling for events
    this.instance.on('success', () => {
      if (params.autoReset) {
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          this.reset();
        }, params.autoReset);
      }
    });

    this.instance.on('error', () => {
      if (params.errorReset) {
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          this.reset();
        }, params.errorReset);
      }
    });

    this.instance.on('canceled', () => {
      if (params.cancelReset) {
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          this.reset();
        }, params.cancelReset);
      }
    });

    // Add native Dropzone event handling
    DropzoneEvents.forEach((eventName: DropzoneEvent) => {
      this.instance.on(eventName.toLowerCase(), (...args: any[]) => {
        args = args.length === 1 ? args[0] : args;
        const emitter = this[
          `DZ_${eventName.toUpperCase()}` as keyof NgxDropzoneDirective
        ] as EventEmitter<any>;
        if (emitter.observers.length > 0) {
          this.zone.run(() => {
            emitter.emit(args);
          });
        }
      });
    });

    if (!this.configDiff) {
      this.configDiff = this.differs.find(this.config || {}).create();
      this.configDiff.diff(this.config || {});
    }
  }

  ngOnDestroy(): void {
    if (this.instance) {
      this.zone.runOutsideAngular(() => {
        this.instance.destroy();
      });
      this.instance = undefined;
    }
  }

  ngDoCheck(): void {
    if (!this.disabled && this.configDiff) {
      const changes = this.configDiff.diff(this.config || {});
      if (changes && this.instance) {
        this.ngOnDestroy();
        this.ngOnInit();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.instance && changes['disabled']) {
      if (
        changes['disabled'].currentValue !== changes['disabled'].previousValue
      ) {
        if (changes['disabled'].currentValue === false) {
          this.zone.runOutsideAngular(() => {
            this.instance.enable();
          });
        } else if (changes['disabled'].currentValue === true) {
          this.zone.runOutsideAngular(() => {
            this.instance.disable();
          });
        }
      }
    }
  }

  public setEmitter(emitter: keyof this, value: EventEmitter<any> | any) {
    this[emitter] = value;
  }

  public dropzone() {
    return this.instance;
  }

  public reset(cancel?: boolean): void {
    if (this.instance) {
      this.zone.runOutsideAngular(() => {
        this.instance.removeAllFiles(cancel);
      });
    }
  }
}
