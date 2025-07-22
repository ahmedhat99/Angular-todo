import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
 
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthResponseData, AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TodoService } from '../todo/todo.service';
 
@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  isLoginMode = signal(true);
  isLoading = signal(false);
  error = signal('');
 
  authService = inject(AuthService);
  router = inject(Router);
  todoService = inject(TodoService);
 
  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });
 
  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    const email = this.form.value.email;
    const password = this.form.value.password;
 
    let authObs: Observable<AuthResponseData>;
 
    this.isLoading.set(true);
    if (this.isLoginMode()) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password);
    }
    authObs.subscribe({
      next: (resData) => {
        this.isLoading.set(false);
        this.router.navigate(['/todo']);
      },
      error: (errorMessage) => {
        this.error.set(errorMessage);
        this.isLoading.set(false);
      },
    });
 
    this.form.reset();
  }
  onSwitchmode() {
    this.isLoginMode.set(!this.isLoginMode());
  }
 
  ngOnInit(): void {
    this.todoService.clearTasks();
  }
}