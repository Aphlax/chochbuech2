import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  constructor() {
  }

  shoppingListRemoveDoneEvent = new EventEmitter();

  shoppingListRemoveDone() {
    this.shoppingListRemoveDoneEvent.emit();
  }
}
