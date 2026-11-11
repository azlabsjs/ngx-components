
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output, TemplateRef, ViewChild, DOCUMENT, signal as createSignal, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { InputOptions, OptionsInput } from '@azlabsjs/smart-form-core';
import { InputEventArgs } from '../types';
import { FetchOptionsDirective, OPTIONS_DIRECTIVES } from '@azlabsjs/ngx-options-input';
import { SHARED_DIRECTIVES, SHARED_PIPES } from '../common';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { Thunk } from './pipes';

// @internal
type OptionalConfig = Omit<OptionsInput, 'options'> & { options?: OptionsInput['options'] };

/** @internal */
type StateType = {
  performingAction: boolean;
  config: OptionalConfig | null;
  loaded: boolean;
};

@Component({
  standalone: true,
  imports: [
    FormsModule,
    NgSelectModule,
    Thunk,
    ...OPTIONS_DIRECTIVES,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES
  ],
  selector: 'ngx-select-input',
  templateUrl: './ngx-select-input.component.html',
  styleUrls: ['./ngx-select-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxSelectInputComponent {
  protected signal = createSignal<StateType>({
    performingAction: false,
    config: null,
    loaded: false,
  });

  private fetchOnFocus: boolean = false;

  @Input() control!: FormControl<any>;
  @Input() describe = true;
  @Input() disabled = false;
  @Input() set config(config: OptionsInput) {
    if (!config) {
      return;
    }

    let { options } = config;
    this.autoSelect(config);

    options = options ?? [];
    this.signal.update((state) => ({ ...state, config, loaded: options.length !== 0 }));
  }
  @Input({ alias: 'loading-text' }) loadingText!: string;
  @Input() parent: string | null | undefined = 'body';
  @Input() input!: TemplateRef<any> | null | undefined;

  @Output() remove = new EventEmitter<any>();
  @Output() selected = new EventEmitter<InputEventArgs>();


  @ViewChild('optionsRef', { static: false })
  options!: FetchOptionsDirective;

  @ViewChild('ngselect', { static: false }) ngselect: NgSelectComponent | null | undefined;

  constructor(@Inject(DOCUMENT) private document: Document, private cdRef: ChangeDetectorRef | null) {
    const { defaultView: view } = this.document;

    if (!view) {
      return;
    }

    const { IntersectionObserverEntry: entry } = view;
    this.fetchOnFocus = !('IntersectionObserver' in view && 'IntersectionObserverEntry' in view && 'intersectionRatio' in entry.prototype);
  }

  onFocus(): void {
    if (this.fetchOnFocus) {
      this.options?.query();
    }
  }

  loadedChange(loaded: boolean) {
    this.signal.update((v) => ({ ...v, loaded }));
  }

  optionsChange(options: InputOptions) {
    let { config } = this.signal();

    if (!config) {
      return;
    }

    config = {
      ...config,
      options: options.map((state) => ({ ...state, name: state?.name?.toUpperCase(), description: state.description?.toUpperCase() })),
    };

    this.autoSelect(config);
    this.signal.update((state) => ({ ...state, performingAction: false, config: config }));
  }

  modelChange(value: any) {
    this.control.setValue(value, { onlySelf: false, emitEvent: true, emitModelToViewChange: true, emitViewToModelChange: true });
    this.control.updateValueAndValidity();
    this.cdRef?.detectChanges();
  }

  loadingChange(value: boolean) {
    this.signal.update((v) => ({ ...v, performingAction: value, loaded: !value }));
  }

  removed(config: OptionalConfig, e?: unknown) {
    this.remove.emit({ name: config.name, event: e });
  }

  select(config: OptionalConfig, e?: unknown) {
    this.selected.emit({ name: config.name, value: e });
  }

  private autoSelect(config: OptionalConfig) {
    const { autoselect, options: items } = config;
    if (items && autoselect && items.length === 1) {
      this.control.setValue(items[0].value);
      this.control.disable();
    }
  }

}
