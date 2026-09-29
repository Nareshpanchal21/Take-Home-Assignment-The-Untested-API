const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('taskService - create()', () => {
  test('should create a task with default values', () => {
    const task = taskService.create({
      title: 'Learn Node.js',
    });

    expect(task.title).toBe('Learn Node.js');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.description).toBe('');
    expect(task.dueDate).toBe(null);
    expect(task.completedAt).toBe(null);
    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });
});
//
describe('taskService - getAll() and findById()', () => {
  test('should return all created tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });

    const tasks = taskService.getAll();

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[1].title).toBe('Task 2');
  });

  test('should find a task by its id', () => {
    const createdTask = taskService.create({
      title: 'Find this task',
    });

    const task = taskService.findById(createdTask.id);

    expect(task).toEqual(createdTask);
  });

  test('should return undefined when task does not exist', () => {
    const task = taskService.findById('invalid-id');

    expect(task).toBeUndefined();
  });
});
//
describe('taskService - getByStatus()', () => {
  test('should return tasks with the requested status', () => {
    taskService.create({
      title: 'Todo task',
      status: 'todo',
    });

    taskService.create({
      title: 'Completed task',
      status: 'done',
    });

    const tasks = taskService.getByStatus('todo');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Todo task');
  });

  test('should return an empty array when no task has the requested status', () => {
    taskService.create({
      title: 'Todo task',
      status: 'todo',
    });

    const tasks = taskService.getByStatus('done');

    expect(tasks).toEqual([]);
  });

  test('should match the exact status', () => {
    taskService.create({
      title: 'Todo task',
      status: 'todo',
    });

    const tasks = taskService.getByStatus('do');

    expect(tasks).toEqual([]);
  });
});

//

describe('taskService - getPaginated()', () => {
  test('should return the first page of tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });
    taskService.create({ title: 'Task 3' });

    const tasks = taskService.getPaginated(1, 2);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[1].title).toBe('Task 2');
  });

  test('should return the second page of tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });
    taskService.create({ title: 'Task 3' });

    const tasks = taskService.getPaginated(2, 2);

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Task 3');
  });
});

//
describe('taskService - getStats()', () => {
  test('should return correct counts by status', () => {
    taskService.create({ title: 'Todo Task', status: 'todo' });
    taskService.create({ title: 'Progress Task', status: 'in_progress' });
    taskService.create({ title: 'Done Task', status: 'done' });

    const stats = taskService.getStats();

    expect(stats.todo).toBe(1);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(1);
  });

  test('should count overdue unfinished tasks', () => {
    taskService.create({
      title: 'Overdue Task',
      status: 'todo',
      dueDate: '2020-01-01T00:00:00.000Z',
    });

    const stats = taskService.getStats();

    expect(stats.overdue).toBe(1);
  });

  test('should not count completed overdue tasks as overdue', () => {
    taskService.create({
      title: 'Completed Task',
      status: 'done',
      dueDate: '2020-01-01T00:00:00.000Z',
    });

    const stats = taskService.getStats();

    expect(stats.overdue).toBe(0);
  });
});

//
describe('taskService - update()', () => {
  test('should update an existing task', () => {
    const task = taskService.create({
      title: 'Old title',
      priority: 'low',
    });

    const updatedTask = taskService.update(task.id, {
      title: 'New title',
      priority: 'high',
    });

    expect(updatedTask.title).toBe('New title');
    expect(updatedTask.priority).toBe('high');
    expect(updatedTask.id).toBe(task.id);
  });

  test('should return null when task does not exist', () => {
    const updatedTask = taskService.update('invalid-id', {
      title: 'New title',
    });

    expect(updatedTask).toBeNull();
  });
});

//
describe('taskService - remove()', () => {
  test('should remove an existing task', () => {
    const task = taskService.create({
      title: 'Delete this task',
    });

    const result = taskService.remove(task.id);

    expect(result).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });

  test('should return false when task does not exist', () => {
    const result = taskService.remove('invalid-id');

    expect(result).toBe(false);
  });
});

//
describe('taskService - completeTask()', () => {
  test('should mark an existing task as completed', () => {
    const task = taskService.create({
      title: 'Complete this task',
      priority: 'high',
    });

    const completedTask = taskService.completeTask(task.id);

    expect(completedTask.status).toBe('done');
    expect(completedTask.completedAt).toBeDefined();
    expect(completedTask.completedAt).not.toBeNull();
  });

  test('should return null when task does not exist', () => {
    const result = taskService.completeTask('invalid-id');

    expect(result).toBeNull();
  });

  test('should preserve the task priority when completing', () => {
    const task = taskService.create({
      title: 'High priority task',
      priority: 'high',
    });

    const completedTask = taskService.completeTask(task.id);

    expect(completedTask.priority).toBe('high');
  });
});

//
const {
  validateCreateTask,
  validateUpdateTask,
} = require('../src/utils/validators');

describe('validators', () => {
  describe('validateCreateTask()', () => {
    test('should accept a valid task', () => {
      const error = validateCreateTask({
        title: 'Learn Express',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-10-01T00:00:00.000Z',
      });

      expect(error).toBeNull();
    });

    test('should reject missing title', () => {
      const error = validateCreateTask({});

      expect(error).toBe('title is required and must be a non-empty string');
    });

    test('should reject invalid status', () => {
      const error = validateCreateTask({
        title: 'Test task',
        status: 'invalid',
      });

      expect(error).toContain('status must be one of');
    });

    test('should reject invalid priority', () => {
      const error = validateCreateTask({
        title: 'Test task',
        priority: 'urgent',
      });

      expect(error).toContain('priority must be one of');
    });

    test('should reject invalid dueDate', () => {
      const error = validateCreateTask({
        title: 'Test task',
        dueDate: 'invalid-date',
      });

      expect(error).toBe('dueDate must be a valid ISO date string');
    });
  });

  describe('validateUpdateTask()', () => {
    test('should accept valid update fields', () => {
      const error = validateUpdateTask({
        title: 'Updated task',
        status: 'done',
        priority: 'low',
      });

      expect(error).toBeNull();
    });

    test('should reject empty title', () => {
      const error = validateUpdateTask({
        title: '',
      });

      expect(error).toBe('title must be a non-empty string');
    });
  });
});

//
describe('taskService - assignTask()', () => {
  test('should assign a task to a user', () => {
    const task = taskService.create({
      title: 'Assign this task',
    });

    const updatedTask = taskService.assignTask(task.id, 'Naresh');

    expect(updatedTask.id).toBe(task.id);
    expect(updatedTask.assignee).toBe('Naresh');
  });

  test('should return null when task does not exist', () => {
    const result = taskService.assignTask('invalid-id', 'Naresh');

    expect(result).toBeNull();
  });
});