import {Component, Input} from '@angular/core';
import {ActionString} from "../utils/recipe";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'action-string',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './action-string.component.html',
  styleUrl: './action-string.component.scss'
})
export class ActionStringComponent {
  @Input() value: ActionString[] = [];
}
