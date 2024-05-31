import { NgModule } from '@angular/core';
import { DropdownComponent } from './dropdown.component';
import { DropdownSearchComponent } from './search.component';

/** @deprecated Use exported `DROPDOWN_DIRECTIVES` instead in your module, as it provided `DropdownComponent` and `DropdownSearchComponent`  standalone directives */
@NgModule({
  imports: [DropdownComponent, DropdownSearchComponent],
  exports: [DropdownComponent, DropdownSearchComponent],
})
export class DropdownModule {}
