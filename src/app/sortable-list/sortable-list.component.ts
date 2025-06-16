import {Component, HostBinding, output} from '@angular/core';
import {SortableListItemComponent} from "./sortable-list-item/sortable-list-item.component";

@Component({
  selector: 'sortable-list',
  standalone: true,
  imports: [],
  templateUrl: './sortable-list.component.html',
  styleUrl: './sortable-list.component.scss'
})
export class SortableListComponent {
  @HostBinding('style.height.px') height: number = 0;
  orderChanged = output<number[]>();
  items: SortableListItemComponent[] = [];

  register(item: SortableListItemComponent) {
    item.index = item.initialIndex = this.items.length;
    item.offset = this.items.length * SortableListItemComponent.HEIGHT;
    this.items.push(item);
    this.height = this.items.length * SortableListItemComponent.HEIGHT + 1;

    this.orderChanged.emit(this.items.map(item => item.initialIndex));
  }

  unregister(item: SortableListItemComponent) {
    for (let i = item.index; i < this.items.length - 1; i++) {
      this.items[i] = this.items[i + 1];
      this.items[i].index = i;
      this.items[i].offset = i * SortableListItemComponent.HEIGHT;
    }
    this.items.pop();
    this.height = this.items.length * SortableListItemComponent.HEIGHT + 1;
    for (const other of this.items) {
      if (other.initialIndex > item.initialIndex) {
        other.initialIndex--;
      }
    }

    this.orderChanged.emit(this.items.map(item => item.initialIndex));
  }

  swap(first: number, second: number) {
    const secondItem = this.items[second];
    this.items[second] = this.items[first];
    this.items[first] = secondItem;
    secondItem.index = first;
    secondItem.offset = first * SortableListItemComponent.HEIGHT;
    this.orderChanged.emit(this.items.map(item => item.initialIndex));
  }
}
