import {Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MatListOption, MatSelectionList} from "@angular/material/list";
import {MatButton, MatIconButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatIcon} from "@angular/material/icon";
import {AutoHeightDirective} from "../../utils/auto-height.directive";

const STORAGE_KEY = 'quick-items';
const DEFAULT_ITEMS = 'Brot\nMilch\nFrüchte\nJoghurt\nKäse\nAufschnitt';

@Component({
  selector: 'quick-items-dialog',
  standalone: true,
  imports: [
    MatSelectionList, MatListOption, MatButton, FormsModule, FlexLayoutModule, MatIconButton,
    MatIcon, AutoHeightDirective
  ],
  templateUrl: './quick-items-dialog.component.html',
  styleUrl: './quick-items-dialog.component.scss'
})
export class QuickItemsDialogComponent {
  items: string[];
  selectedItems: string[] = [];
  edit = false;
  editText = "";

  constructor(private readonly dialog: MatDialogRef<QuickItemsDialogComponent>) {
    const items = localStorage.getItem(STORAGE_KEY) || DEFAULT_ITEMS;
    this.items = items.split('\n').filter(item => item);
  }

  onCancel() {
    this.dialog.close();
  }

  onSubmit() {
    this.dialog.close(this.selectedItems);
  }

  openEdit() {
    this.edit = true;
    this.editText = this.items.join('\n');
  }

  closeEdit() {
    this.edit = false;
    this.items = this.editText.split('\n').filter((item, i, all) => item && all.indexOf(item) == i);
    localStorage.setItem(STORAGE_KEY, this.items.join('\n'));
  }
}
