import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Todo, TodoPriority } from '../models/todo';
import { TODOS_API_LIMIT } from '../models/constans';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private http = inject(HttpClient);

  private readonly BASE_URL = 'https://jsonplaceholder.typicode.com';

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(
      `${this.BASE_URL}/todos?_limit=${TODOS_API_LIMIT}`,
    );
  }

  addTodo(title: string, priority: TodoPriority): Observable<Todo> {
    return this.http.post<Todo>(`${this.BASE_URL}/todos`, {
      title,
      completed: false,
      priority,
    });
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/todos/${id}`);
  }

  updateTodo(id: number, data: Partial<Todo>): Observable<Todo> {
    return this.http.patch<Todo>(`${this.BASE_URL}/todos/${id}`, data);
  }
}
