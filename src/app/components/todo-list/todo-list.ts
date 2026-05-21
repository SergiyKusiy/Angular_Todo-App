import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../../models/todo';
import { TodoItemComponent } from '../todo-item/todo-item';

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss',
})
export class TodoListComponent {
  @Input() todos: Todo[] = [];
  @Input() processingTodoIds: number[] = [];

  @Output() deleteTodo = new EventEmitter<number>();
  @Output() toggleTodo = new EventEmitter<{ id: number; completed: boolean }>();
  @Output() renameTodo = new EventEmitter<{ id: number; title: string }>();

  isProcessing(todoId: number): boolean {
    return this.processingTodoIds.includes(todoId);
  }
}
