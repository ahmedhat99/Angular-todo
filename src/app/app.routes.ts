import { Routes } from '@angular/router';
import { TodoComponent } from './todo/todo.component';

import { TodoService } from './todo/todo.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'todo',
    pathMatch: 'full',
  },
  {
    path: 'todo',
    component: TodoComponent,
  },
  
];
