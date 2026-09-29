const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('GET /tasks', () => {
  test('should return all tasks', async () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });

    const response = await request(app)
      .get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Task 1');
  });

  test('should return an empty array when no tasks exist', async () => {
    const response = await request(app)
      .get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});

//
describe('GET /tasks?status=', () => {
  test('should return tasks with the requested status', async () => {
    taskService.create({
      title: 'Todo Task',
      status: 'todo',
    });

    taskService.create({
      title: 'Done Task',
      status: 'done',
    });

    const response = await request(app)
      .get('/tasks?status=todo');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Todo Task');
  });

  test('should return an empty array when no task has the requested status', async () => {
    taskService.create({
      title: 'Todo Task',
      status: 'todo',
    });

    const response = await request(app)
      .get('/tasks?status=done');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});

//
describe('GET /tasks?page=&limit=', () => {
  test('should return the first page of tasks', async () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });
    taskService.create({ title: 'Task 3' });

    const response = await request(app)
      .get('/tasks?page=1&limit=2');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Task 1');
    expect(response.body[1].title).toBe('Task 2');
  });

  test('should return the second page of tasks', async () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });
    taskService.create({ title: 'Task 3' });

    const response = await request(app)
      .get('/tasks?page=2&limit=2');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Task 3');
  });
});

//
describe('POST /tasks', () => {
  test('should create a new task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Learn Express',
        description: 'Practice Express API',
        status: 'todo',
        priority: 'high',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Learn Express');
    expect(response.body.description).toBe('Practice Express API');
    expect(response.body.status).toBe('todo');
    expect(response.body.priority).toBe('high');
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  test('should return 400 when title is missing', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        description: 'Task without title',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      'title is required and must be a non-empty string'
    );
  });
});

//
describe('PUT /tasks/:id', () => {
  test('should update an existing task', async () => {
    const task = taskService.create({
      title: 'Old title',
      priority: 'low',
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        title: 'Updated title',
        priority: 'high',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(task.id);
    expect(response.body.title).toBe('Updated title');
    expect(response.body.priority).toBe('high');
  });

  test('should return 404 when task does not exist', async () => {
    const response = await request(app)
      .put('/tasks/invalid-id')
      .send({
        title: 'Updated title',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  test('should return 400 when title is empty', async () => {
    const task = taskService.create({
      title: 'Original title',
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        title: '',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      'title must be a non-empty string'
    );
  });
});

//
describe('DELETE /tasks/:id', () => {
  test('should delete an existing task', async () => {
    const task = taskService.create({
      title: 'Delete this task',
    });

    const response = await request(app)
      .delete(`/tasks/${task.id}`);

    expect(response.statusCode).toBe(204);
    expect(response.body).toEqual({});

    const deletedTask = taskService.findById(task.id);

    expect(deletedTask).toBeUndefined();
  });

  test('should return 404 when task does not exist', async () => {
    const response = await request(app)
      .delete('/tasks/invalid-id');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });
});

//
describe('PATCH /tasks/:id/complete', () => {
  test('should mark an existing task as completed', async () => {
    const task = taskService.create({
      title: 'Complete this task',
      priority: 'high',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/complete`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(task.id);
    expect(response.body.status).toBe('done');
    expect(response.body.completedAt).toBeDefined();
    expect(response.body.priority).toBe('high');
  });

  test('should return 404 when task does not exist', async () => {
    const response = await request(app)
      .patch('/tasks/invalid-id/complete');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });
});

//
describe('GET /tasks/stats', () => {
  test('should return task counts by status', async () => {
    taskService.create({
      title: 'Todo task',
      status: 'todo',
    });

    taskService.create({
      title: 'In progress task',
      status: 'in_progress',
    });

    taskService.create({
      title: 'Completed task',
      status: 'done',
    });

    const response = await request(app).get('/tasks/stats');

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      todo: 1,
      in_progress: 1,
      done: 1,
      overdue: 0,
    });
  });

  test('should return zero counts when no tasks exist', async () => {
    const response = await request(app).get('/tasks/stats');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      todo: 0,
      in_progress: 0,
      done: 0,
      overdue: 0,
    });
  });
});

//

describe('PATCH /tasks/:id/assign', () => {
  test('should assign a task to a user', async () => {
    const task = taskService.create({
      title: 'Assign this task',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: 'Naresh',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(task.id);
    expect(response.body.assignee).toBe('Naresh');
  });

  test('should return 404 when task does not exist', async () => {
    const response = await request(app)
      .patch('/tasks/invalid-id/assign')
      .send({
        assignee: 'Naresh',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  test('should return 400 when assignee is empty', async () => {
    const task = taskService.create({
      title: 'Assign this task',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: '',
      });

    expect(response.statusCode).toBe(400);
  });

  test('should return 400 when assignee is not a string', async () => {
    const task = taskService.create({
      title: 'Assign this task',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: 123,
      });

    expect(response.statusCode).toBe(400);
  });


  test('should return 409 when task is already assigned', async () => {
  const task = taskService.create({
    title: 'Already assigned task',
  });

  await request(app)
    .patch(`/tasks/${task.id}/assign`)
    .send({
      assignee: 'Naresh',
    });

  const response = await request(app)
    .patch(`/tasks/${task.id}/assign`)
    .send({
      assignee: 'Rahul',
    });

  expect(response.statusCode).toBe(409);
  expect(response.body.error).toBe('Task is already assigned');
});

});