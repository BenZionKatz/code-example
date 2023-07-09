import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BtControlAmountComponent} from "./bt-control-amount.component"
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [BtControlAmountComponent],
  imports: [
    CommonModule,
    MatIconModule
  ],exports:
   [BtControlAmountComponent]
})
export class BtControlAmountModule { }
