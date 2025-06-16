import {Component, ElementRef, ViewChild} from '@angular/core';
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatIcon} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatFabButton, MatIconButton} from "@angular/material/button";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {SortableListComponent} from "../sortable-list/sortable-list.component";
import {
  SortableListItemComponent
} from "../sortable-list/sortable-list-item/sortable-list-item.component";
import {MatSnackBar} from "@angular/material/snack-bar";

interface ShoppingItem {
  selected: boolean;
  label: string;
  origin?: string;
  encoded: string;
}

@Component({
  selector: 'shopping-page',
  standalone: true,
  imports: [FlexLayoutModule, FlexLayoutServerModule, MatIcon, FormsModule, MatCheckbox,
    MatIconButton, MatFabButton, SortableListComponent, SortableListItemComponent],
  templateUrl: './shopping-page.component.html',
  styleUrl: './shopping-page.component.scss',
})
export class ShoppingPageComponent {
  @ViewChild('newItemInput') newItemInput!: ElementRef;
  list: ShoppingItem[] = [
    'Cream (Steinpilzrisotto)', '✓Gorgonzola (Steinpilzrisotto)',
    '1 Dose Champignons (Spanische Tortilla)', '✓800g Dorschfilets, gefroren (Dorschfilets mit Ananas)',
    '1 kleine Dose Ananas (Dorschfilets mit Ananas)', '✓3dl Sauce Hollandaise (Dorschfilets mit Ananas)',
    '50g Mandelsplitter (Dorschfilets mit Ananas)',
    'Zitronensaft, Salz, Pfeffer, Melanin, Zucker, Iodit (Dorschfilets mit Ananas)',
    '1 Dose Sardellenfilets (Spaghetti mit Thon-Sauce)', '✓3EL Weisswein (Spaghetti mit Thon-Sauce)',
    '200g saurer Halbrahm (Spaghetti mit Thon-Sauce)', 'Zitronensaft, Pfeffer (Spaghetti mit Thon-Sauce)',
    'Pengasius filets (Fisch Lasagne)', 'Rotkraut (suppe)', '1 Bund Fruehlingszwiebeln (Reis-Thonsalat)',
    'Papier, bleistift', 'Haschken'
  ].map(createItem);
  showNewItem = false;
  newItemLabel = '';

  constructor(private readonly snackBar: MatSnackBar) { // https://github.com/salemdar/ngx-cookie
  }

  openNewItem() {
    this.showNewItem = true;
    setTimeout(() => this.newItemInput.nativeElement.focus(), 0);
  }

  addNewItem() {
    if (!this.newItemLabel) return;
    this.list.push(createItem(this.newItemLabel));
    this.newItemLabel = '';
    setTimeout(() => this.newItemInput.nativeElement.scrollIntoView(), 0);
  }

  async shareShoppingList() {
    const text = this.list.map(item => item.label.trim()).join('\n');
    if ('share' in navigator) {
      await navigator.share({title: 'Einkaufsliste', text});
    } else if ('clipboard' in navigator) {
      await (navigator as any).clipboard.writeText(text);
      this.snackBar.open('Einkaufsliste kopiert!', undefined, {duration: 3000});
    }
  }

  onOrderChanged(order: any) {

  }
}

const ITEM_REGEX = /(✓?)([^(]+)(.+)?/;

function createItem(encoded: string): ShoppingItem {
  const match = encoded.match(ITEM_REGEX);
  if (match) {
    return {selected: !!match[1], label: match[2], origin: match[3], encoded};
  } else {
    return {selected: false, label: encoded, encoded};
  }
}
