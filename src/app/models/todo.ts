export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: TodoPriority;
}
