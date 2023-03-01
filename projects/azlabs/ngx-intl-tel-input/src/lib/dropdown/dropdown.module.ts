import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownSearchComponent } from './dropdown-search.component';
import { DropdownComponent } from './dropdown.component';

@NgModule({
  declarations: [DropdownSearchComponent, DropdownComponent],
  imports: [CommonModule, FormsModule],
  exports: [DropdownSearchComponent, DropdownComponent],
})
export class DropdownModule {}
