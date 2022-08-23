import { DOCUMENT } from '@angular/common';
import {
  EventEmitter,
  Output,
  Input,
  HostBinding,
  HostListener,
  ElementRef,
  Directive,
  Inject,
  OnDestroy,
  AfterContentInit,
} from '@angular/core';
import {
  coerceBooleanProperty,
  coerceNumberProperty,
  getTransferredFileEntries,
  setFileInputElementProperties,
} from './helpers';
import { createFileInputElement } from './helpers';

type EventType<T = EventTarget> = Omit<Event, 'target'> & {
  target: T;
};

@Directive({
  selector: 'ngx-dropzone',
  // styleUrls: ['./ngx-dropzone.component.scss'],
})
export class NgxDropzoneDirective implements OnDestroy, AfterContentInit {
  /** A template reference to the native file input element. */
  _fileInput!: HTMLInputElement;

  @Input() maxFiles: number = 1;
  private _accept!: string;
  @Input() set accept(value: string | string[]) {
    this._accept = Array.isArray(value)
      ? (value as string[]).join(', ')
      : typeof value === 'string'
      ? value
      : '';
  }
  private _class!: string[];
  @Input('class') set elementClass(value: string | string[]) {
    this._class =
      typeof value === 'string' ? [value] : Array.isArray(value) ? value : [];
  }
  @Input() acceptCallback!: (value: File) => boolean;
  /** Disable any user interaction with the component. */
  @Input()
  @HostBinding('class.ngx-dz-disabled')
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);

    if (this._isHovered) {
      this._isHovered = false;
    }
  }
  private _disabled = false;

  /** Allow the selection of multiple files. */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
  }
  private _multiple = true;

  /** Set the maximum size a single file may have. */
  @Input()
  get maxFileSize(): number {
    return this._maxFileSize;
  }
  set maxFileSize(value: number) {
    this._maxFileSize = coerceNumberProperty(value);
  }
  private _maxFileSize!: number;

  /** Allow the dropzone container to expand vertically. */
  @Input()
  @HostBinding('class.expandable')
  get expandable(): boolean {
    return this._expandable;
  }
  set expandable(value: boolean) {
    this._expandable = coerceBooleanProperty(value);
  }
  private _expandable: boolean = false;

  /** Open the file selector on click. */
  @Input()
  @HostBinding('class.unclickable')
  get disableClick(): boolean {
    return this._disableClick;
  }
  set disableClick(value: boolean) {
    this._disableClick = coerceBooleanProperty(value);
  }
  private _disableClick = false;

  /** Allow dropping directories. */
  @Input()
  get supportDirectories(): boolean {
    return this._supportDirectories;
  }
  set supportDirectories(value: boolean) {
    this._supportDirectories = coerceBooleanProperty(value);
  }
  private _supportDirectories = false;

  //#region Component outputs
  @Output() sizeError = new EventEmitter<File[]>();
  @Output() unAcceptedFiles = new EventEmitter<File[]>();
  @Output() acceptedFiles = new EventEmitter<File[]>();
  //#endregion Component outputs

  /** Expose the id, aria-label, aria-labelledby and aria-describedby of the native file input for proper accessibility. */
  @Input() id!: string;
  @Input('aria-label') ariaLabel!: string;
  @Input('aria-labelledby') ariaLabelledby!: string;
  @Input('aria-describedby') ariaDescribedBy!: string;

  @HostBinding('class.ngx-dz-hovered')
  _isHovered = false;

  /** Show the native OS file explorer to select files. */
  @HostListener('click')
  _onClick() {
    if (!this.disableClick) {
      this.showFileSelector();
    }
  }

  @HostListener('dragover', ['$event'])
  _onDragOver(event: DragEvent) {
    if (this.disabled) {
      return;
    }

    this.preventDefault(event);
    this._isHovered = true;
  }

  @HostListener('dragleave')
  _onDragLeave() {
    this._isHovered = false;
  }

  @HostListener('drop', ['$event'])
  async _onDrop(event: DragEvent) {
    if (this.disabled) {
      return;
    }

    this.preventDefault(event);
    this._isHovered = false;
    // if processDirectoryDrop is not enabled or webkitGetAsEntry is not supported we handle the drop as usual
    if (
      (!this.supportDirectories ||
        !DataTransferItem.prototype.webkitGetAsEntry) &&
      event.dataTransfer?.files
    ) {
      this.handleFileDrop(event.dataTransfer.files);
      // if processDirectoryDrop is enabled and webkitGetAsEntry is supported we can extract files from a dropped directory
    } else {
      const droppedItems = event.dataTransfer?.items;
      if (droppedItems && droppedItems.length > 0) {
        const files = await getTransferredFileEntries(
          droppedItems,
          event.dataTransfer.files
        );
        this.handleFileDrop(files);
      }
    }
  }
  private _elements: { element: HTMLElement; callback: (e: any) => void }[] =
    [];

  // Construct the directive class
  public constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterContentInit(): void {
    let element = this.elementRef.nativeElement as HTMLElement;
    let _element!: HTMLInputElement;
    if (
      typeof element === 'undefined' ||
      element === null ||
      typeof (element as HTMLInputElement).type === 'undefined' ||
      (element as HTMLInputElement).type !== 'file'
    ) {
      _element = createFileInputElement(
        element,
        this.document,
        this._accept,
        this._class
      );
    } else {
      _element = setFileInputElementProperties(
        element as HTMLInputElement,
        this._accept,
        this._class
      );
    }
    const handleClickEvent = (event: Event) => {
      const _event = event as unknown as EventType<HTMLInputElement>;
      if (_event.target) {
        _event.target.value = '';
      }
    };
    // Subscribe to the click event on the html input element
    _element.addEventListener('click', handleClickEvent);
    this._elements.push({ element: _element, callback: handleClickEvent });
    // TODO : Uncomment to listen for changge event on the file input
    // const handleDropFiles = (event: Event) => {
    //   const _event = event as unknown as EventType<HTMLInputElement>;
    //   if (_event.target && _event.target.value === '') {
    //     return;
    //   }
    //   if (_event.target.files) {
    //     this.handleFileDrop(_event.target.files);
    //   }
    //   this.preventDefault(event);
    // };
    // // Subscribe to change event of the html input element
    // _element.addEventListener('change', handleDropFiles);
    this._fileInput = _element;
  }

  showFileSelector() {
    if (!this.disabled) {
      this._fileInput?.click();
    }
  }

  private handleFileDrop(files: FileList) {
    const {
      sizedErrored = [],
      unAcceptedFiles = [],
      acceptedFiles = [],
    } = {} as Record<string, File[]>;
    const _files = this.getDroppedFiles(files);
    for (const file of _files) {
      if (!this.inSizeRange(file)) {
        sizedErrored.push(file);
        continue;
      }
      if (
        (typeof this.acceptCallback !== 'undefined' &&
          this.acceptCallback !== null &&
          this.acceptCallback(file)) ||
        !this.isAccepted(file)
      ) {
        unAcceptedFiles.push(file);
        continue;
      }
      acceptedFiles.push(file);
    }
    if (sizedErrored.length !== 0) {
      // TODO: Set target a.k.a file input value to empty string
      return this.sizeError.emit(sizedErrored);
    }
    if (unAcceptedFiles.length !== 0) {
      // TODO: Set target a.k.a file input value to empty string
      return this.unAcceptedFiles.emit(unAcceptedFiles);
    }
    this.acceptedFiles.emit(acceptedFiles);
  }

  private getDroppedFiles(files: FileList) {
    return this.maxFiles === 1
      ? [files[0]]
      : Array.from(
          (function* () {
            for (let index = 0; index < files.length; index++) {
              const item = files![index];
              if (item !== null && typeof item !== 'undefined') {
                yield item;
              }
            }
          })()
        );
  }

  private isAccepted(file: File) {
    const types = this._accept ? this._accept.split(',') : [];
    if (types.length === 0) {
      return true;
    }
    for (var i = 0; i < types.length; i++) {
      if (file.type.match(types[i])) {
        return true;
      }
    }
    return false;
  }

  private inSizeRange(file: File) {
    return Number((file.size / 1024 / 1024).toFixed(4)) <= this.maxFileSize;
  }

  private preventDefault(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    for (const element of this._elements) {
      element.element.removeEventListener('click', element.callback);
    }
  }
}
