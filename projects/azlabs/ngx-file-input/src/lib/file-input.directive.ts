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
  standalone: true,
  selector: '[fileInput]',
})
export class HTMLFileInputDirective implements OnDestroy, AfterContentInit {
  //#region Directive inputs
  @Input() multiple: boolean = false;
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
  @Input() acceptCallback!: (value: File) => boolean;
  private _class!: string[];
  @Input('class') set setClass(value: string | string[]) {
    this._class =
      typeof value === 'string'
        ? value.split(' ')
        : Array.isArray(value)
        ? value
        : [];
  }
  //#endregion Directive inputs

  //#region Directive outputs
  @Output() sizeError = new EventEmitter<File[]>();
  @Output() unAcceptedFiles = new EventEmitter<File[]>();
  @Output() acceptedFiles = new EventEmitter<File[]>();
  @Output() removed = new EventEmitter();
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
      _element = this.appendDirectiveAttributes(element);
      this._elements.push(...[_element]);
    }
    _element?.addEventListener('click', this.onClickedListener.bind(this));
    _element?.addEventListener('change', this.onChangeListener.bind(this));
  }

  /**  @description Add required files for the HTML input element */
  private appendDirectiveAttributes(element: any) {
    //#region Bind HTML attributes to file input
    element.accept = this._accept;
    element.multiple = this.multiple;
    element.classList.add(...(this._class ?? []));
    //#endregion Bind HTML attributes to file input
    return element;
  }

  /** @description File input click listener */
  private onClickedListener(event: Event) {
    const _event = event as unknown as EventType<HTMLInputElement>;
    if (_event.target) {
      _event.target.value = '';
      this.reset.emit();
    }
  }

  /** @description File change listener */
  private onChangeListener(event: Event) {
    const _event = event as unknown as EventType<HTMLInputElement>;
    if (_event.target && _event.target.value === '') {
      return;
    }
    if (_event.target && (_event.target.files || []).length === 0) {
      return;
    }
    this.onInputChange(_event.target);
  }

  /** @description Creates an HTML file input */
  private createHTMLInputElement(parent: HTMLElement) {
    if (this.document) {
      let el = this.document.createElement('input');
      el.classList.add('ngx-file-input');
      el.type = 'file';
      el = this.appendDirectiveAttributes(el);
      parent.appendChild(el);
      return el;
    }
    throw new Error('platform document is not defined');
  }

  /** @description Handles input change event */
  private onInputChange(target: HTMLInputElement) {
    if (target.files) {
      const {
        sizedErrored = [],
        unAcceptedFiles = [],
        acceptedFiles = [],
      } = {} as Record<string, File[]>;
      const files = this.getDroppedFiles(target.files);
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
      if (unAcceptedFiles.length !== 0) {
        target.value = '';
        return this.unAcceptedFiles.emit(unAcceptedFiles);
      }
      this.acceptedFiles.emit(acceptedFiles);
    }
  }

  /** @description Returns the list of dropped files */
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

  /** @description Returns the list of accepted files */
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

  /** @description Checks if the size is in the valid size range for dropped files */
  private inSizeRange(file: File) {
    return Number((file.size / 1024 / 1024).toFixed(4)) <= this.maxFileSize;
  }

  ngOnDestroy(): void {
    // Handle directive destruction
    for (const element of this._elements) {
      element?.removeEventListener('click', this.onClickedListener.bind(this));
      element?.removeEventListener('click', this.onClickedListener.bind(this));
    }
  }
}
