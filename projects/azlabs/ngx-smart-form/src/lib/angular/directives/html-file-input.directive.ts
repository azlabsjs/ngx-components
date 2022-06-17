import { DOCUMENT } from '@angular/common';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';

// @internal
export type FileEventTarget = EventTarget & { files: FileList };

// @internal
type EventType<T = EventTarget> = Omit<Event, 'target'> & {
  target: T;
};

@Directive({
  selector: '[fileInput]',
})
export class HTMLFileInputDirective implements OnDestroy, AfterContentInit {
  //#region Directive inputs
  @Input() maxFiles = 1;
  @Input() maxFileSize = 10; // MB
  private _accept!: string;
  @Input() set accept(value: string | string[]) {
    this._accept = Array.isArray(value)
      ? (value as string[]).join(', ')
      : typeof value === 'string'
      ? value
      : '';
  }
  get accept() {
    return this._accept;
  }
  private _class!: string[];
  @Input('class') set elementClass(value: string | string[]) {
    this._class =
      typeof value === 'string' ? [value] : Array.isArray(value) ? value : [];
  }
  @Input() acceptCallback!: (value: File) => boolean;
  //#endregion Directive inputs

  //#region Directive outputs
  @Output() sizeError = new EventEmitter<File[]>();
  @Output() addedFile = new EventEmitter<File>();
  @Output() removed = new EventEmitter();
  @Output() acceptedFilesChange = new EventEmitter<File | File[]>();
  @Output() reset = new EventEmitter<void>();
  //#endregion Directive outputs

  //#region Directive local properties
  private _elements: HTMLElement[] = [];
  //#endregion Directive local properties

  // Construct the directive class
  public constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterContentInit(): void {
    let element = this.elementRef.nativeElement as HTMLElement;
    let _element: HTMLInputElement;
    if (
      typeof element === 'undefined' ||
      element === null ||
      typeof (element as HTMLInputElement).type === 'undefined' ||
      (element as HTMLInputElement).type !== 'file'
    ) {
      _element = this.createHTMLInputElement(element);
      this._elements.push(...[_element]);
    } else {
      _element = this.setRequiredHTMLElementAttributes(
        element as HTMLInputElement
      );
      this._elements.push(...[_element]);
    }

    _element.addEventListener('click', (event: Event) => {
      const _event = event as unknown as EventType<HTMLInputElement>;
      if (_event.target) {
        _event.target.value = '';
        this.reset.emit();
      }
    });

    _element.addEventListener('change', (event: Event) => {
      const _event = event as unknown as EventType<HTMLInputElement>;
      if (_event.target && _event.target.value === '') {
        return;
      }
      if (_event.target && (_event.target.files || []).length === 0) {
        return;
      }
      this.onInputChange(_event.target);
    });
  }

  private setRequiredHTMLElementAttributes(element: HTMLInputElement) {
    //#region Bind HTML attributes to file input
    element.accept = this._accept;
    element.multiple = false;
    element.classList.add(...(this._class ?? []));
    //#endregion Bind HTML attributes to file input
    return element;
  }

  public createHTMLInputElement(parent: HTMLElement) {
    if (this.document) {
      let element = this.document.createElement('input');
      element.type = 'file';
      element = this.setRequiredHTMLElementAttributes(element);
      parent.appendChild(element);
      return element;
    }
    throw new Error('Platform document is not defined');
  }

  onInputChange(target: HTMLInputElement) {
    if (target.files) {
      const length = target.files.length;
      const sizedErrored = [];
      const unAcceptedFiles = [];
      const acceptedFiles = [];
      const files =
        this.maxFiles === 1
          ? [target.files[0]]
          : Array.from(
              (function* () {
                for (let index = 0; index < length; index++) {
                  yield target.files![index];
                }
              })()
            ).filter(
              (current) => current !== null && typeof current !== 'undefined'
            );
      for (const file of files) {
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
        target.value = '';
        return this.sizeError.emit(sizedErrored);
      }
      this.acceptedFilesChange.emit(
        this.maxFiles === 1 ? acceptedFiles[0] : acceptedFiles
      );
    }
  }

  isAccepted(file: File) {
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

  //
  ngOnDestroy(): void {
    // Handle directive destruction
    for (const element of this._elements) {
      // element.remove('click');
    }
  }
}
