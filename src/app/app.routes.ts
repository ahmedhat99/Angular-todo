import { Routes } from '@angular/router';
// import { TodoComponent } from './todo/todo.component';
import { AuthComponent } from './auth/auth.component';
import { authGuard } from './auth/auth.service';
import { TodoService } from './todo/todo.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'todo',
    pathMatch: 'full',
  },
  {
    path: 'todo',
    // component: TodoComponent,
    loadComponent:()=>import('./todo/todo.component').then(mod=>mod.TodoComponent),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  
];
