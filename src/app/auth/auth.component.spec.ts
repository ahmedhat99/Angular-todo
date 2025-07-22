import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { TodoService } from '../todo/todo.service';
import { of, throwError } from 'rxjs';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let authServiceSpy: jasmine.SpyObj<any>;
  let routerSpy: jasmine.SpyObj<Router>;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'signup']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    todoServiceSpy = jasmine.createSpyObj('TodoService', ['clearTasks']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AuthComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TodoService, useValue: todoServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call todoService clearTasks on init', () => {
    expect(todoServiceSpy.clearTasks).toHaveBeenCalled();
  });

  it('should initialize the form with empty email and password', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    expect(emailControl?.value).toBe('');
    expect(passwordControl?.value).toBe('');
  });

  it('should toggle isLoginMode when onSwitchmode is called', () => {
    const initialMode = component.isLoginMode();
    component.onSwitchmode();
    expect(component.isLoginMode()).toBe(!initialMode);
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.get('email')?.setValue('invalid');
    component.loginForm.get('password')?.setValue('short');
    component.onLogin();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(authServiceSpy.signup).not.toHaveBeenCalled();
  });

  it('should call login and navigate on successful login', () => {
    component.isLoginMode.set(true);
    component.loginForm.setValue({ email: 'test@example.com', password: '123456' });

    authServiceSpy.login.and.returnValue(of({}));

    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith(
      'test@example.com',
      '123456'
    );

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/todo']);
    expect(component.isLoading()).toBeFalse();
    expect(component.loginForm.value).toEqual({ email: null, password: null });
  });

  it('should call signup and navigate on successful signup', () => {
    component.isLoginMode.set(false);
    component.loginForm.setValue({ email: 'test@example.com', password: '123456' });

    authServiceSpy.signup.and.returnValue(of({}));

    component.onLogin();

    expect(authServiceSpy.signup).toHaveBeenCalledWith(
      'test@example.com',
      '123456'
    );

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/todo']);
    expect(component.isLoading()).toBeFalse();
    expect(component.loginForm.value).toEqual({ email: null, password: null });
  });

  it('should set error message on error response', () => {
    component.isLoginMode.set(true);
    component.loginForm.setValue({ email: 'test@example.com', password: '123456' });

    const errorMsg = 'Invalid credentials';
    authServiceSpy.login.and.returnValue(throwError(() => errorMsg));

    component.onLogin();

    fixture.detectChanges();

    expect(component.error()).toBe(errorMsg);
    expect(component.isLoading()).toBeFalse();
  });
});
