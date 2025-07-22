import { computed, inject, Injectable, signal } from '@angular/core';
import { NewTask, Task } from './task.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private httpClient = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();

  private searchQuery = signal('');

  readonly filteredTasks = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this._tasks().filter((task) =>
      task.text.toLowerCase().includes(query)
    );
  });

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  clearTasks() {
    this._tasks.set([]);
  }

  addTask(newTask: NewTask) {
    const body = {
      fields: {
        completed: { booleanValue: newTask.completed },
        text: { stringValue: newTask.text },
      },
    };

    return this.httpClient
      .post<{ name: string }>(
        'https://firestore.googleapis.com/v1/projects/to-do-list-80096/databases/(default)/documents/tasks',
        body
      )
      .pipe(
        map((res) => {
          const id = res.name.split('/').pop()!;
          return { id, ...newTask } as Task;
        }),
        tap((task) => {
          this._tasks.update((old) => [...old, task]);
        }),
        catchError((error) => {
          this.snackBar.open('Failed to add task. Try again.', 'Dismiss', {
            duration: 3000,
          });
          return throwError(() => new Error(error.message));
        })
      );
  }
  completeTask(task: Task) {
    this._tasks.update((old) =>
      old.map((oldTask) =>
        oldTask.id === task.id ? { ...oldTask, completed: true } : oldTask
      )
    );
    const body = {
      fields: {
        text: { stringValue: task.text },
        completed: { booleanValue: true },
      },
    };

    return this.httpClient
      .patch(
        `https://firestore.googleapis.com/v1/projects/to-do-list-80096/databases/(default)/documents/tasks/${task.id}`,
        body
      )
      .pipe(
        catchError((error) => {
          this._tasks.update((old) =>
            old.map((oldTask) =>
              oldTask.id === task.id
                ? { ...oldTask, completed: false }
                : oldTask
            )
          );
          this.snackBar.open('Failed to complete task. Try again.', 'Dismiss', {
            duration: 3000,
          });
          return throwError(() => new Error(error.message));
        })
      );
  }

  loadTasks() {
    return this.httpClient
      .get<{ documents: any[] }>(
        'https://firestore.googleapis.com/v1/projects/to-do-list-80096/databases/(default)/documents/tasks'
      )
      .pipe(
        map((res) => {
          const docs = res.documents ?? [];
          return docs
            .map((doc) => {
              const fullName = doc.name;
              const id = fullName.split('/').pop();
              return {
                id,
                completed: doc.fields.completed.booleanValue,
                text: doc.fields.text.stringValue,
              };
            });
        }),
        tap((res) => {
          this._tasks.set(res);
        }),
        catchError((error) => {
          this.snackBar.open(
            'Failed to load tasks. refresh the page to try again.',
            'Dismiss',
            {
              duration: 3000,
            }
          );
          return throwError(() => new Error(error.message));
        })
      );
  }
}
