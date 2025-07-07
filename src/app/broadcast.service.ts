import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  shoppingListRemoveDoneEvent = new EventEmitter();
  addRecipeToShoppingEvent = new EventEmitter();

  shoppingListRemoveDone() {
    this.shoppingListRemoveDoneEvent.emit();
  }

  addRecipeToShopping() {
    this.addRecipeToShoppingEvent.emit();
  }
}
