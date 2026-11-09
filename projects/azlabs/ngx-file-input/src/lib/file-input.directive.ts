import { DOCUMENT } from '@angular/common';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
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
  @Input() multiple: boolean = false;
  @Input({ transform: (value: string | string[]) => Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map((x) => x.trim()) : [] }) accept: string[] = [];
  @Input() acceptCallback!: (value: File) => boolean;
  @Input({ alias: 'class', transform: (value: string) => typeof value === 'string' ? value.split(' ') : Array.isArray(value) ? value : [] }) cssClass: string[] = [];
  @Input({ alias: 'max' }) maxFiles = 1;
  @Input({ alias: 'max-size' }) maxFileSize = 10;

  @Output() sizeError = new EventEmitter<File[]>();
  @Output() unAcceptedFiles = new EventEmitter<File[]>();
  @Output() acceptedFiles = new EventEmitter<File[]>();
  @Output() removed = new EventEmitter();
  @Output() reset = new EventEmitter<void>();

  private nodes: HTMLElement[] = [];
  private fileInput!: HTMLInputElement;

  private inputClickFn = this.inputClick.bind(this);
  private inputChangeFn = this.inputChange.bind(this);

  public constructor(private elementRef: ElementRef, @Inject(DOCUMENT) private document: Document) { }

  ngAfterContentInit(): void {
    let element = this.elementRef.nativeElement as HTMLInputElement;

    if (!element) {
      throw new Error('directive must be attached to a valid element');
    }

    this.fileInput = 'type' in element && element.type === 'file' ? this.initTag(element) : this.createInputTag(element);
    this.removeListeners();

    if (this.fileInput) {
      this.nodes.push(this.fileInput);
      this.fileInput.addEventListener('click', this.inputClickFn);
      this.fileInput.addEventListener('change', this.inputChangeFn);
    }
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    if (event.target === this.fileInput) {
      return;
    }

    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  private initTag(node: HTMLInputElement) {
    node.multiple = this.multiple;

    if (this.accept.length > 0) {
      node.accept = this.accept.join(',');
    }

    if (this.cssClass.length > 0) {
      node.classList.add(...this.cssClass);
    }

    return node;
  }

  private inputClick(event: Event) {

    // prevent input event click event to be propagated to the parent element
    event.stopPropagation();

    if (event.target) {
      this.reset.emit();
    }
  }

  private inputChange(event: Event) {
    const e = event as unknown as EventType<HTMLInputElement>;
    if (e.target && e.target.value === '') {
      return;
    }

    if (e.target && (e.target.files ?? []).length === 0) {
      return;
    }

    this.handleOnChange(e.target);
  }

  /** @description creates an HTML file input */
  private createInputTag(parent: HTMLElement) {
    if (!this.document) {
      throw new Error('unsupported platform, cannot initialize input tag');
    }

    let node = this.document.createElement('input');
    node.classList.add('ngx-file-input', 'hidden');
    node.type = 'file';
    node = this.initTag(node);
    parent.appendChild(node);

    return node;
  }

  /** @description handles input change event */
  private handleOnChange(target: HTMLInputElement) {
    if (!target.files) {
      return;
    }

    const sizedErrored: File[] = [];
    const unAcceptedFiles: File[] = [];
    const acceptedFiles: File[] = [];
    const files = this.getDroppedFiles(target.files);

    for (const file of files) {
      if (!this.inRange(file)) {
        sizedErrored.push(file);
        continue;
      }
      if ((typeof this.acceptCallback !== 'undefined' && this.acceptCallback !== null && this.acceptCallback(file)) || !this.accepted(file)) {
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

  /** @description returns the list of dropped files */
  private getDroppedFiles(files: FileList) {
    return this.maxFiles === 1 ? [files[0]] : Array.from(
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
    const values = this.accept ?? [];
    if (values.length === 0) {
      return true;
    }

    for (const name of values) {
      if (name.trim() === '*') {
        return true;
      }

      if (file.type.match(name)) {
        return true;
      }
    }
    return false;
  }

  /** @description check if the size is in the valid size range for dropped files */
  private inRange(file: File) {
    return Number((file.size / 1024 / 1024).toFixed(4)) <= this.maxFileSize;
  }

  private removeListeners() {
    for (const node of this.nodes) {
      if (!node) {
        continue;
      }

      node.removeEventListener('click', this.inputClickFn);
      node.removeEventListener('change', this.inputChangeFn);
    }
  }

  ngOnDestroy(): void {
    this.removeListeners();
  }
}
