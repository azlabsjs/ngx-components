import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxInputErrorComponent } from './ngx-input-error.component';
import { NgxCommonModule } from '../../common';

@NgModule({
  imports: [CommonModule, NgxCommonModule],
  declarations: [NgxInputErrorComponent],
  exports: [NgxInputErrorComponent],
})
export class NgxInputErrorModule {}
