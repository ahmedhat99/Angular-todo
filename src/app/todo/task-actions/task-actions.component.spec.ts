import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskActionsComponent } from './task-actions.component';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../todo.service';
import { AuthService } from '../../auth/auth.service';
import { of } from 'rxjs';

describe('TaskActionsComponent', () => {
  let component: TaskActionsComponent;
  let fixture: ComponentFixture<TaskActionsComponent>;
  let todoServiceSpy: jasmine.SpyObj<any>;
  let authServiceSpy: jasmine.SpyObj<any>;

  beforeEach(async () => {
    todoServiceSpy = jasmine.createSpyObj('TodoService', [
      'addTask',
      'setSearchQuery',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    await TestBed.configureTestingModule({
      imports: [FormsModule, TaskActionsComponent],
      providers: [
        { provide: TodoService, useValue: todoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();
  }); 

  beforeEach(() => {
    todoServiceSpy.addTask.and.returnValue(of({}));
    authServiceSpy.getUser.and.returnValue({ id: 'user-1' });
    fixture = TestBed.createComponent(TaskActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call addTask and reset input when a task is added', () => {
    component.inputTask.set('Task 1');
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('#addTaskButton');
    addButton.click();

    expect(todoServiceSpy.addTask).toHaveBeenCalledWith({
      text: 'Task 1',
      completed: false,
      userId: 'user-1',
    });

    expect(component.inputTask()).toBe('');
  });

  it('should not call addTask if input is empty', () => {
    component.inputTask.set('');
    component.addTask();
    expect(todoServiceSpy.addTask).not.toHaveBeenCalled();
  });

  it('should call setSearchQuery when search is updated', () => {
    component.searchedTask.set('task-1');
    component.updateSearch();
    expect(todoServiceSpy.setSearchQuery).toHaveBeenCalledWith('task-1');
  });
});
