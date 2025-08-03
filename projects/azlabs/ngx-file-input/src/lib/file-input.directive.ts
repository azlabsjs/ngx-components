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
import { EventType } from './types';

@Directive({
  standalone: true,
  selector: '[fileinput]',
})
export class HTMLFileInputDirective implements OnDestroy, AfterContentInit {
  //#region directive inputs
  @Input() multiple: boolean = false;
  private _accept!: string[];
  @Input() set accept(value: string | string[]) {
    this._accept = Array.isArray(value)
      ? value
      : typeof value === 'string'
      ? value.split(',').map((x) => x.trim())
      : [];
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
  @Input({ alias: 'max' }) maxFiles = 1;
  @Input({ alias: 'max-size' }) maxFileSize = 10; // MB
  //#endregion

  //#region directive outputs
  @Output() sizeError = new EventEmitter<File[]>();
  @Output() unAcceptedFiles = new EventEmitter<File[]>();
  @Output() acceptedFiles = new EventEmitter<File[]>();
  @Output() removed = new EventEmitter();
  @Output() reset = new EventEmitter<void>();
  //#endregion

  //#region directive local properties
  private tags: HTMLElement[] = [];
  //#endregion

  // constructor the directive class
  public constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterContentInit(): void {
    let element = this.elementRef.nativeElement as HTMLElement;
    let input: HTMLInputElement;

    if (!element) {
      throw new Error('directive must be attached to a valid element');
    }
    if (
      typeof (element as HTMLInputElement).type === 'undefined' ||
      (element as HTMLInputElement).type !== 'file'
    ) {
      input = this.createInputElement(element);
      this.tags.push(input);
    } else {
      input = this.initTag(element);
      this.tags.push(input);
    }

    if (input) {
      input.addEventListener('click', this.onSelect.bind(this));
      input.addEventListener('change', this.onChange.bind(this));
    }
  }

  /**  @description add required files for the HTML input element */
  private initTag(element: any) {
    element.accept = this._accept;
    element.multiple = this.multiple;
    element.classList.add(...(this._class ?? []));

    return element;
  }

  /** @description file input click listener */
  private onSelect(event: Event) {
    const e = event as unknown as EventType<HTMLInputElement>;
    if (e.target) {
      e.target.value = '';
      this.reset.emit();
    }
  }

  /** @description file change listener */
  private onChange(event: Event) {
    const e = event as unknown as EventType<HTMLInputElement>;
    if (e.target && e.target.value === '') {
      return;
    }

    if (e.target && (e.target.files || []).length === 0) {
      return;
    }

    this.handleOnChange(e.target);
  }

  /** @description creates an HTML file input */
  private createInputElement(parent: HTMLElement) {
    if (this.document) {
      let el = this.document.createElement('input');
      el.classList.add('ngx-file-input');
      el.type = 'file';
      el = this.initTag(el);
      parent.appendChild(el);
      return el;
    }

    throw new Error('platform document is not defined');
  }

  /** @description handles input change event */
  private handleOnChange(target: HTMLInputElement) {
    if (target.files) {
      const {
        sizedErrored = [],
        unAcceptedFiles = [],
        acceptedFiles = [],
      } = {} as { [k: string]: File[] };
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
          !this.accepted(file)
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

  /** @description returns the list of dropped files */
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

  /** @description returns the list of accepted files */
  private accepted(file: File) {
    const types = this._accept ?? [];
    if (types.length === 0) {
      return true;
    }

    for (const item of types) {
      if (item.trim() === '*') {
        return true;
      }

      if (file.type.match(item)) {
        return true;
      }
    }
    return false;
  }

  /** @description check if the size is in the valid size range for dropped files */
  private inSizeRange(file: File) {
    return Number((file.size / 1024 / 1024).toFixed(4)) <= this.maxFileSize;
  }

  ngOnDestroy(): void {
    for (const element of this.tags) {
      element?.removeEventListener('click', this.onSelect.bind(this));
      element?.removeEventListener('click', this.onSelect.bind(this));
    }
  }
}
