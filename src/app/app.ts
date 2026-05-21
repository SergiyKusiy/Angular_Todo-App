import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { Todo } from './models/todo';
import { Filter } from './models/filter';
import { ErrorMessage } from './models/error-message';
import { TodoService } from './services/todo.service';

import { HeaderComponent }            from './components/header/header';
import { FooterComponent }            from './components/footer/footer';
import { TodoListComponent }          from './components/todo-list/todo-list';
import { ErrorNotificationComponent } from './components/error-notification/error-notification';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    FooterComponent,
    TodoListComponent,
    ErrorNotificationComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private todoService = inject(TodoService);
  private destroyRef  = inject(DestroyRef);

  readonly todos             = signal<Todo[]>([]);
  readonly title             = signal('');
  readonly filter            = signal(Filter.All);
  readonly error             = signal<ErrorMessage>(ErrorMessage.Default);
  readonly isLoading         = signal(false);
  readonly processingTodoIds = signal<number[]>([]);

  readonly filteredTodos = computed(() => {
    const todos = this.todos();
    switch (this.filter()) {
      case Filter.Active:    return todos.filter(t => !t.completed);
      case Filter.Completed: return todos.filter(t =>  t.completed);
      default:               return todos;
    }
  });

  readonly activeCount    = computed(() => this.todos().filter(t => !t.completed).length);
  readonly completedCount = computed(() => this.todos().filter(t =>  t.completed).length);
  readonly isAllCompleted = computed(() => this.todos().every(t => t.completed));

  constructor() {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  todos => this.todos.set(
          todos.map(todo => ({ ...todo, priority: 'medium' as const })),
        ),
        error: () => this.error.set(ErrorMessage.LoadTodos),
      });
  }

  onAddTodo(): void {
    const trimmedTitle = this.title().trim();

    if (!trimmedTitle) {
      this.error.set(ErrorMessage.TitleEmpty);
      return;
    }

    this.isLoading.set(true);

    this.todoService.addTodo(trimmedTitle, 'medium')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: todo => {
          this.todos.update(current => [...current, todo]);
          this.title.set('');
        },
        error:    () => this.error.set(ErrorMessage.AddTodo),
        complete: () => this.isLoading.set(false),
      });
  }

  onDeleteTodo(id: number): void {
    this.addProcessing(id);

    this.todoService.deleteTodo(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:     () => this.todos.update(todos => todos.filter(t => t.id !== id)),
        error:    () => this.error.set(ErrorMessage.DeleteTodo),
        complete: () => this.removeProcessing(id),
      });
  }

  onUpdateTodo(id: number, patch: Partial<Todo>): void {
    this.addProcessing(id);

    this.todoService.updateTodo(id, patch)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.todos.update(todos =>
            todos.map(t => (t.id === id ? { ...t, ...updated } : t)),
          );
        },
        error:    () => this.error.set(ErrorMessage.UpdateTodo),
        complete: () => this.removeProcessing(id),
      });
  }

  onToggleTodo(data: { id: number; completed: boolean }): void {
    this.onUpdateTodo(data.id, { completed: data.completed });
  }

  onRenameTodo(data: { id: number; title: string }): void {
    this.onUpdateTodo(data.id, { title: data.title });
  }

  onToggleAll(): void {
    const newStatus     = !this.isAllCompleted();
    const todosToUpdate = this.todos().filter(t => t.completed !== newStatus);

    if (!todosToUpdate.length) return;

    todosToUpdate.forEach(t => this.addProcessing(t.id));

    forkJoin(
      todosToUpdate.map(t =>
        this.todoService.updateTodo(t.id, { completed: newStatus }),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          const updatedMap = new Map(updated.map(t => [t.id, t]));
          this.todos.update(todos =>
            todos.map(t => updatedMap.has(t.id) ? { ...t, ...updatedMap.get(t.id) } : t),
          );
        },
        error:    () => this.error.set(ErrorMessage.UpdateTodo),
        complete: () => todosToUpdate.forEach(t => this.removeProcessing(t.id)),
      });
  }

  onClearCompleted(): void {
    const completed = this.todos().filter(t => t.completed);

    if (!completed.length) return;

    completed.forEach(t => this.addProcessing(t.id));

    forkJoin(
      completed.map(t => this.todoService.deleteTodo(t.id)),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:     () => this.todos.update(todos => todos.filter(t => !t.completed)),
        error:    () => this.error.set(ErrorMessage.DeleteTodo),
        complete: () => completed.forEach(t => this.removeProcessing(t.id)),
      });
  }

  onFilterChange(filter: Filter): void { this.filter.set(filter); }
  onTitleChange(title: string):   void { this.title.set(title); }
  onCloseError():                 void { this.error.set(ErrorMessage.Default); }

  private addProcessing(id: number): void {
    this.processingTodoIds.update(ids => [...ids, id]);
  }

  private removeProcessing(id: number): void {
    this.processingTodoIds.update(ids => ids.filter(i => i !== id));
  }
}
