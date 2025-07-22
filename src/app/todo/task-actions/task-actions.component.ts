import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../todo.service';
import { NewTask } from '../task.model';

@Component({
  selector: 'app-task-actions',
  imports: [FormsModule],
  templateUrl: './task-actions.component.html',
  styleUrl: './task-actions.component.css',
})
export class TaskActionsComponent {
  todoService = inject(TodoService);
  inputTask = signal('');
  searchedTask = signal('');
  addTask() {
    if(this.inputTask()===''){
      return;
    }
    const newTask: NewTask = {
      text: this.inputTask(),
      completed: false,
    };
    this.todoService.addTask(newTask).subscribe({
      next: () => {
        this.inputTask.set('');
      },
      error: (error) => console.log(error),
    });
  }

  updateSearch() {
    this.todoService.setSearchQuery(this.searchedTask());
  }
}
