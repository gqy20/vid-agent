import assert from 'node:assert/strict';
import test from 'node:test';
import {createTaskRoute} from '../src/http/create-task-route.js';
import {createTaskStore} from '../src/tasks/task-store.js';

test('creates a task with an optional due date', () => {
  const response = createTaskRoute(
    {body: {title: 'Ship course', dueDate: '2026-07-26'}},
    createTaskStore(),
  );
  assert.deepEqual(response.body, {
    id: 1,
    title: 'Ship course',
    completed: false,
    dueDate: '2026-07-26',
  });
});

test('rejects an invalid due date', () => {
  assert.throws(
    () => createTaskRoute({body: {title: 'Ship', dueDate: 'tomorrow'}}, createTaskStore()),
    /YYYY-MM-DD/,
  );
});
