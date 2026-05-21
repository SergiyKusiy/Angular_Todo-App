import {
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Todo, TodoPriority } from '../../models/todo';

@Component({
  selector: 'app-todo-item',
  imports: [FormsModule],
  templateUrl: './todo-item.html',
  styleUrl: './todo-item.scss',
})
export class TodoItemComponent {
  readonly todo    = input.required<Todo>();
  readonly loading = input(false);

  readonly delete = output<number>();
  readonly toggle = output<{ id: number; completed: boolean }>();
  readonly rename = output<{ id: number; title: string }>();

  readonly priorityOptions: TodoPriority[] = ['low', 'medium', 'high'];

  isEditing = false;
  editTitle = '';

  startEditing(): void {
    this.isEditing = true;
    this.editTitle = this.todo().title;
  }

  saveTitle(): void {
    const trimmedTitle = this.editTitle.trim();

    if (!trimmedTitle) {
      this.delete.emit(this.todo().id);
      return;
    }

    if (trimmedTitle !== this.todo().title) {
      this.rename.emit({ id: this.todo().id, title: trimmedTitle });
    }

    this.isEditing = false;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editTitle = this.todo().title;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveTitle();
    } else if (event.key === 'Escape') {
      this.cancelEditing();
    }
  }

  onToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggle.emit({ id: this.todo().id, completed: checked });
  }

  onDelete(): void {
    this.delete.emit(this.todo().id);
  }
}
