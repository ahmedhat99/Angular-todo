import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './tasks.component';
import { TodoService } from '../todo.service';
import { Component, input, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-task-item',
  template: '<div>{{ taskName }}</div>',
})
class MockTaskItemComponent {
  taskName = input<string>('');
  isCompleted = input<boolean>(false);
  id = input<string>('');
}

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;

  const mockTasks = [
    { id: '1', text: 'Task 1', completed: false, userId: 'user-1' },
    { id: '2', text: 'Task 2', completed: true, userId: 'user-1' },
  ];

  beforeEach(async () => {
    todoServiceSpy = jasmine.createSpyObj('TodoService', ['loadTasks']);

    Object.defineProperty(todoServiceSpy, 'filteredTasks', {
      get: () => signal(mockTasks),
    });
    await TestBed.configureTestingModule({
      imports: [TasksComponent, MockTaskItemComponent],
      providers: [
        { provide: TodoService, useValue: todoServiceSpy },
        provideHttpClient(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    todoServiceSpy.loadTasks.and.returnValue(of([]));
    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call loadTasks on init', () => {
    expect(todoServiceSpy.loadTasks).toHaveBeenCalled();
  });

  it('should render pending and completed tasks', () => {
    const testElement = fixture.debugElement.queryAll(By.css('app-task-item'));
    expect(testElement.length).toBe(2);

    const pendingCard = fixture.debugElement.query(By.css('#pendingTasks'));
    expect(pendingCard.nativeElement.textContent).toContain('Task 1');

    const completedCard = fixture.debugElement.query(By.css('#completedTasks'));
    expect(completedCard.nativeElement.textContent).toContain('Task 2');
  });
  
});
