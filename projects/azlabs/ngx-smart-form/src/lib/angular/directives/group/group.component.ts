import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { PIPES } from '../../pipes';
import { NgxSmartFormGroupHeaderPipe } from './group-header.pipe';
import { NgxSmartFormControlArrayComponent } from '../control-array';
import { FORM_PIPES } from '../form/pipes';
import { Optional } from './types';

@Component({
  standalone: true,
  imports: [CommonModule, ...PIPES, ...FORM_PIPES, NgxSmartFormGroupHeaderPipe, NgxSmartFormControlArrayComponent],
  selector: 'ngx-smart-form-group',
  templateUrl: './group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormGroupComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private _formGroup!: FormGroup;
  @Input({ alias: 'formGroup' }) set setFormGroup(value: FormGroup) {
    this._formGroup = value;
  }
  get formGroup() {
    return this._formGroup;
  }
  private _inputs!: InputConfigInterface[];
  @Input({ alias: 'controls' }) set setinput(value: InputConfigInterface[]) {
    this._inputs = value;
  }
  get inputs() {
    return this._inputs;
  }
  @Input() template!: TemplateRef<any>;
  @Input() autoupload: boolean = false;
  @Input({ alias: 'no-grid-layout' }) nogridlayout = false;
  @Input({ required: true }) detached!: AbstractControl[];

  @Input({ alias: 'add' }) add!: Optional<TemplateRef<any>>;
  @Input() label!: Optional<TemplateRef<any>>;

  @Output() formGroupChange = new EventEmitter<FormGroup>();
  @Output('item-removed') removed = new EventEmitter<{ name: string, control: AbstractControl }>();

  // @internal
  private _destroy$ = new Subject<void>();

  constructor(private cdRef: ChangeDetectorRef) { }

  protected   onRemoved(event: { index: number, control: AbstractControl }, parent: string) {
    if (!event) {
      return;
    }

    if (typeof event.index === 'undefined' || event.index === null || !event.control) {
      return;
    }

    const name = `${parent}.${event.index}`;
    this.removed.emit({ name, control: event.control });
  }

  //
  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(tap(() => this.formGroupChange.emit(this.formGroup)), takeUntil(this._destroy$)).subscribe();
  }

  ngAfterViewInit(): void {
    this.registerControlChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('controls' in changes || 'formGroup' in changes) {
      this.registerControlChanges();
    }
  }

  registerControlChanges() {
    // unsubscribe from any previous subscription
    this._destroy$.next();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
