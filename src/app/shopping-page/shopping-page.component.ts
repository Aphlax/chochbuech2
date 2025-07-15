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
import {CookieService} from "ngx-cookie";
import {BroadcastService} from "../broadcast.service";
import {Recipe} from "../utils/recipe";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {QuickItemsDialogComponent} from "./quick-items-dialog/quick-items-dialog.component";

interface ShoppingItem {
  selected: boolean;
  label: string;
  origin?: string;
  encoded: string;
}

const COOKIE_NAME = 'shopping-list';
const TICK = '✓';
const COOKIE_OPTIONS = {expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))};

@Component({
  selector: 'shopping-page',
  standalone: true,
  imports: [FlexLayoutModule, FlexLayoutServerModule, MatIcon, FormsModule, MatCheckbox,
    MatIconButton, MatFabButton, SortableListComponent, SortableListItemComponent],
  templateUrl: './shopping-page.component.html',
  styleUrl: './shopping-page.component.scss',
})
export class ShoppingPageComponent {
  // noinspection JSAnnotator; element is behind an @if, messing up the inspection.
  @ViewChild('newItemInput') newItemInput?: ElementRef;
  list: ShoppingItem[];
  order: number[];
  showNewItem = false;
  newItemLabel = '';

  constructor(private readonly cookieService: CookieService, private readonly snackBar: MatSnackBar,
              $broadcast: BroadcastService, router: Router, private readonly dialog: MatDialog) {
    const addRecipe = router.getCurrentNavigation()?.extras.state?.["addRecipe"] as Recipe;
    if (addRecipe) {
      this.addRecipeToShopping(addRecipe);
    }
    this.list = (cookieService.get(COOKIE_NAME) ?? '').split('\n').filter(i => i).map(createItem);
    this.order = this.list.map((s, i) => i);
    $broadcast.shoppingListRemoveDoneEvent.subscribe(() => this.onRemoveDone());
  }

  addRecipeToShopping(recipe: Recipe) {
    const shoppingList = (this.cookieService.get(COOKIE_NAME) ?? '') +
      recipe.ingredients.split('\n').filter(i => i && !i.startsWith('-- '))
        .map(i => `${i} (${recipe.name})\n`).join('');
    this.cookieService.put(COOKIE_NAME, shoppingList, COOKIE_OPTIONS);
  }

  openNewItem() {
    this.showNewItem = true;
    setTimeout(() => this.newItemInput?.nativeElement.focus(), 0);
  }

  addNewItem() {
    if (!this.newItemLabel) return;
    this.list.push(createItem(this.newItemLabel));
    this.newItemLabel = '';
    setTimeout(() => this.newItemInput?.nativeElement.scrollIntoView(), 0);
  }

  async shareShoppingList() {
    const shoppingList = this.cookieService.get(COOKIE_NAME);
    if (!shoppingList) return;
    const text = shoppingList.split('\n').filter(i => i)
      .map(item => createItem(item).label.trim()).join('\n');
    if ('share' in navigator) {
      await navigator.share({title: 'Einkaufsliste', text});
    } else if ('clipboard' in navigator) {
      await (navigator as any).clipboard.writeText(text);
      this.snackBar.open('Einkaufsliste kopiert!', undefined, {duration: 1000});
    }
  }

  onOrderChanged(order: number[]) {
    if (order.length != this.list.length) return;
    this.order = order;
    const orderedList = order.map(i => this.list[i].encoded + '\n');
    this.cookieService.put(COOKIE_NAME, orderedList.join(''), COOKIE_OPTIONS);
  }

  onSelectionChanged(i: number) {
    const shoppingItem = this.list[i];
    if (shoppingItem.selected && shoppingItem.encoded[0] != TICK) {
      shoppingItem.encoded = TICK + shoppingItem.encoded;
    } else if (!shoppingItem.selected && shoppingItem.encoded[0] == TICK) {
      shoppingItem.encoded = shoppingItem.encoded.slice(1);
    }
    const orderedList = this.order.map(i => this.list[i].encoded + '\n');
    this.cookieService.put(COOKIE_NAME, orderedList.join(''), COOKIE_OPTIONS);
  }

  onRemoveDone() {
    const list = this.order.map(i => this.list[i]).filter(i => !i.selected);
    this.list = [];
    setTimeout(() => {
      this.list = list;
    }, 0);
  }

  openQuickItems() {
    this.dialog.open(QuickItemsDialogComponent, {autoFocus: false}).afterClosed().subscribe(items =>
      items?.forEach((item: string) => this.list.push(createItem(item))));
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
