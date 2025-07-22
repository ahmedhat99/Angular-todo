import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TaskActionsComponent } from "./task-actions/task-actions.component";
import { TasksComponent } from './tasks/tasks.component';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-todo',
  imports: [TaskActionsComponent,TasksComponent],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent  {

}
