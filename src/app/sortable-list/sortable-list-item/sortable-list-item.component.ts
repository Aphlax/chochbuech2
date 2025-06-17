import {Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {SortableListComponent} from "../sortable-list.component";
import {MatIcon} from "@angular/material/icon";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";

@Component({
  selector: 'sortable-list-item',
  standalone: true,
  imports: [MatIcon, FlexLayoutModule, FlexLayoutServerModule],
  templateUrl: './sortable-list-item.component.html',
  styleUrl: './sortable-list-item.component.scss'
})
export class SortableListItemComponent implements OnInit, OnDestroy {
  public static readonly HEIGHT = 48;

  @HostBinding('class.dragging') isDragging = false;
  @HostBinding('style.top.px') public offset: number = 0;
  public index: number = 0;
  public initialIndex: number = 0;
  private dragStart = 0;

  constructor(private readonly sortableList: SortableListComponent) {
  }

  ngOnInit() {
    this.sortableList.register(this);
  }

  ngOnDestroy() {
    this.sortableList.unregister(this);
  }

  startDrag(event: TouchEvent | MouseEvent) {
    event.preventDefault();
    this.dragStart = getPageY(event) - this.offset;
    this.isDragging = true;
  }

  mousemove(event: TouchEvent | MouseEvent) {
    if (!this.isDragging) return;
    const maxOffset = (this.sortableList.items.length - 1) * SortableListItemComponent.HEIGHT;
    this.offset = Math.max(Math.min(getPageY(event) - this.dragStart, maxOffset), 0);
    const oldIndex = this.index;
    this.index = Math.round(this.offset / SortableListItemComponent.HEIGHT);
    if (this.index != oldIndex) {
      if (Math.abs(this.index - oldIndex) >= 2) {
        this.mouseup();
        return;
      }
      this.sortableList.swap(oldIndex, this.index);
    }
  }

  mouseup() {
    this.offset = this.index * SortableListItemComponent.HEIGHT;
    this.isDragging = false;
  }
}

function getPageY(event: TouchEvent | MouseEvent) {
  return event instanceof TouchEvent ? event.touches[0].pageY : event.pageY;
}
