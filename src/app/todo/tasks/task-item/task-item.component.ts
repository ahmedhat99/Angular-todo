import { Component, inject, input, Input } from '@angular/core';
import { TodoService } from '../../todo.service';
import { Task } from '../../task.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-task-item',
  imports: [],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css',
})
export class TaskItemComponent {
  taskName = input<string>('');
  isCompleted = input<boolean>(false);
  id = input<string>('');

  todoService = inject(TodoService);
  authService = inject(AuthService);

  completeTask() {
    const task: Task = {
      id: this.id(),
      text: this.taskName(),
      completed: this.isCompleted(),
      userId:this.authService.getUser()?.id
    };
    this.todoService.completeTask(task).subscribe({
      error:(error)=>console.log(error)
    });
  }
}
