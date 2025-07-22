import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TodoService } from './todo.service';
import { Task } from './task.model';
import { AuthService } from '../auth/auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;
  let authServiceSpy : jasmine.SpyObj<any>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    TestBed.configureTestingModule({
      providers: [
        TodoService,
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy.getUser.and.returnValue({ id: 'user-1' });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a new task and update the task list', () => {
    const newTask = {
      text: 'Task 1',
      completed: false,
      userId: 'user-1',
    };

    service.addTask(newTask).subscribe((createdTask) => {
      expect(createdTask).toEqual({
        id: 'task-1',
        ...newTask,
      });

      const allTasks = service.tasks();
      expect(allTasks.length).toBe(1);
      expect(allTasks[0].text).toBe('Task 1');
    });

    const req = httpMock.expectOne(
      (r) => r.url.includes('/documents/tasks') && r.method === 'POST'
    );

    expect(req.request.body.fields.text.stringValue).toBe('Task 1');

    req.flush({
      name: 'projects/todo-app/databases/(default)/documents/tasks/task-1',
    });
  });

  it('should load tasks and update the task list', () => {
    const mockFirestoreResponse = {
      documents: [
        {
          name: 'projects/.../documents/tasks/task-1',
          fields: {
            text: { stringValue: 'Task 1' },
            completed: { booleanValue: false },
            userId: { stringValue: 'user-1' },
          },
        },
        {
          name: 'projects/.../documents/tasks/task-2',
          fields: {
            text: { stringValue: 'Task 2' },
            completed: { booleanValue: false },
            userId: { stringValue: 'user-2' },
          },
        },
      ],
    };
    service.loadTasks().subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].text).toBe('Task 1');
      const allTasks = service.tasks();
      expect(allTasks.length).toBe(1);
      expect(allTasks[0].text).toBe('Task 1');
      expect(allTasks[0].userId).toBe('user-1');
    });
    const req = httpMock.expectOne(
      (r) => r.url.includes('/documents/tasks') && r.method === 'GET'
    );
    req.flush(mockFirestoreResponse);
  });

  it('should complete a task and update the task list', () => {
    const task: Task = {
      id: 'task-1',
      text: 'Task 1',
      completed: false,
      userId: 'user-1',
    };

    (service as any)._tasks.set([task]);

    service.completeTask(task).subscribe(() => {
      const allTasks = service.tasks();
      expect(allTasks.length).toBe(1);
      expect(allTasks[0].completed).toBeTrue();
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url.includes(`/documents/tasks/${task.id}`) && r.method === 'PATCH'
    );

    expect(req.request.body.fields.completed.booleanValue).toBe(true);

    req.flush({});
  });
});
