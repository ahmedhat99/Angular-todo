import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthResponseData, AuthService } from './auth.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TodoService } from '../todo/todo.service';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';

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
    MatStepperModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  isLoginMode = signal(true);
  isLoading = signal(false);
  error = signal('');
  stepperOrientation = signal<'horizontal' | 'vertical'>('horizontal');
  private breakpointSub?: Subscription;

  authService = inject(AuthService);
  router = inject(Router);
  todoService = inject(TodoService);
  breakPointObserver = inject(BreakpointObserver);

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });
  signupForm = new FormGroup({
    formArray: new FormArray<FormGroup>([
      new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
      }),
      new FormGroup({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
      }),
      new FormGroup({
        phone: new FormControl('', [Validators.required]),
        address: new FormControl('', [Validators.required]),
      }),
    ]),
  });

  get formGroups() {
    return this.signupForm.controls.formArray.controls;
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    let authObs: Observable<AuthResponseData>;

    this.isLoading.set(true);

    this.authService.login(email, password).subscribe({
      next: (resData) => {
        this.isLoading.set(false);
        this.router.navigate(['/todo']);
      },
      error: (errorMessage) => {
        this.error.set(errorMessage);
        this.isLoading.set(false);
      },
    });

    this.loginForm.reset();
  }
  onSignUp() {
    if (this.signupForm.invalid) return;

    const email = this.formGroups[0].value.email;
    const password = this.formGroups[0].value.password;

    this.isLoading.set(true);
    this.authService.signup(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/todo']);
      },
      error: (err) => {
        this.error.set(err);
        this.isLoading.set(false);
      },
    });
    this.signupForm.reset();
  }

  onSwitchmode() {
    this.isLoginMode.set(!this.isLoginMode());
  }

  ngOnInit(): void {
    this.todoService.clearTasks();
    this.breakpointSub = this.breakPointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((result) => {
        this.stepperOrientation.set(result.matches ? 'vertical' : 'horizontal');
      });
  }
  ngOnDestroy() {
    this.breakpointSub?.unsubscribe();
  }
}
