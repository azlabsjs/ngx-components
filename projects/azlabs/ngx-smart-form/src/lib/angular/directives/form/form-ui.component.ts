import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import { NgxSmartFormArrayComponent } from '../array';
import { NgxSmartFormGroupHeaderPipe } from '../group';
import { NgxSmartFormControlArrayComponent } from '../control-array';
import { PIPES } from '../../pipes';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ngx-form-ui',
  standalone: true,
  templateUrl: './form-ui.component.html',

  imports: [
    CommonModule,
    NgxSmartFormArrayComponent,
    NgxSmartFormControlArrayComponent,
    NgxSmartFormGroupHeaderPipe,
    ...PIPES,
  ],
  styleUrls: ['./form-grid.scss', './form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxFormComponent {
  @Input() formGroup!: FormGroup<any>;
  @Input() inputs!: FormConfigInterface['controlConfigs'];
  @Input() template!: TemplateRef<any>;
  @Input({ alias: 'add-template' }) addTemplate!: TemplateRef<any>;
  @Input() label!: TemplateRef<any>;
  @Input() autoupload: boolean = false;
  @Input('no-grid-layout') noGridLayout = false;
}
