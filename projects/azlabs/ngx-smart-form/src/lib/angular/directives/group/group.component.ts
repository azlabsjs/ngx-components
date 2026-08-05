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

@Component({
  standalone: true,
  imports: [CommonModule, ...PIPES],
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
  @Input({ alias: 'no-grid-layout' }) noGridLayout = false;
  @Input({ required: true }) detached!: AbstractControl[];

  // @internal
  private _destroy$ = new Subject<void>();

  @Output() formGroupChange = new EventEmitter<FormGroup>();

  constructor(private cdRef: ChangeDetectorRef) { }

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
