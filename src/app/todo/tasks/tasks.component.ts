import { Component, computed, inject, OnInit } from '@angular/core';
import { TaskItemComponent } from './task-item/task-item.component';
import { TodoService } from '../todo.service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tasks',
  imports: [TaskItemComponent, DragDropModule, MatSnackBarModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit {
  todoService = inject(TodoService);
  tasksSignal = this.todoService.filteredTasks;

  pendingTasks = computed(() =>
    this.tasksSignal().filter((task) => !task.completed)
  );
  completedTasks = computed(() =>
    this.tasksSignal().filter((task) => task.completed)
  );

  onTaskDropped(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      return;
    }
    const task = event.item.data;
    if (!task || task.completed) return;

    this.todoService.completeTask(task).subscribe({
      error: (error) => console.log(error),
    });
  }

  ngOnInit(): void {
    this.todoService.loadTasks().subscribe({
      error: (error) => console.log(error),
    });
  }
}
