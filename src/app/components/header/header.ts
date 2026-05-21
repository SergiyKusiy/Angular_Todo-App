import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  readonly title          = input('');
  readonly isLoading      = input(false);
  readonly hasTodos       = input(false);
  readonly isAllCompleted = input(false);

  readonly titleChange = output<string>();
  readonly addTodo     = output<void>();
  readonly toggleAll   = output<void>();

  onInput(event: Event): void {
    this.titleChange.emit((event.target as HTMLInputElement).value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.addTodo.emit();
  }
}
