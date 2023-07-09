import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';



@Component({
  selector: 'bt-control-amount',
  templateUrl: './bt-control-amount.component.html',
  styleUrls: ['./bt-control-amount.component.css']
})

/**
 * 
 */
export class BtControlAmountComponent implements OnInit {
  @Input()btAmount: {amount:number,isPlus:boolean} = {amount:null,isPlus:false};
  @Input()btWidth;
  @Input()btHeight;
  @Input()btPlaceHolder;
  @Input()btAmountPlusShow = false
  @Input()btIsAmountPlus = false;
  @Output()btBlurs = new EventEmitter();
  @Output()btFocus = new EventEmitter();
  @Output()btChanges = new EventEmitter();
  @Output()btInput = new EventEmitter();
  constructor() { }
 

  id:string = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  idDisabled = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  input;
  tmp;
  isChanged:boolean = false;
  showAfter:boolean = false;
  ngOnInit(): void {
    if(!this.btAmount){
      this.btAmount = {amount:null,isPlus:false};
    }
    if(!this.btWidth)
      this.btWidth = 80;
    this.tmp = this.btAmount;
  }

  ngAfterViewInit(){
      this.input = document.getElementById(this.id)
  }

  ngOnDestroy(){
  }

  onFocus(e:Event){
    e.stopPropagation();
    this.btFocus.emit();
  }

  onBlur(event){
    if(this.isChanged){
      this.btChanges.emit(this.tmp);
      this.isChanged = false;
      return;
    }
    if(!this.isChanged)
      this.btBlurs.emit(this.tmp);
  }

  onInput(event){
    this.tmp.amount = event.target.value
    this.isChanged = true;
    this.btInput.emit(this.btAmount);
  }

  onKey(e){
    let keyCode = e.keyCode;
    if(keyCode === 39 || keyCode === 37)
        e.stopPropagation();
    if(keyCode === 13 || keyCode === 27){
      e.stopPropagation();
      setTimeout(()=>{
        this.input.blur();
        this.onBlur(null);  
      },0)
    }
     
  }
  onClickPlus(e){
    this.tmp = this.btAmount;
    this.tmp.isPlus = e;
    this.isChanged = true;
  }

  ngOnChanges(){
    this.tmp = this.btAmount;
  }
}