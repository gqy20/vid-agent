import assert from 'node:assert/strict';
import test from 'node:test';
import {createTaskRoute} from '../src/http/create-task-route.js';
import {createTaskStore} from '../src/tasks/task-store.js';

test('creates a task from the request body', () => {
  const store = createTaskStore();
  const response = createTaskRoute({body: {title: 'Ship course'}}, store);
  assert.equal(response.status, 201);
  assert.deepEqual(response.body, {id: 1, title: 'Ship course', completed: false});
});

test('rejects a whitespace title', () => {
  assert.throws(
    () => createTaskRoute({body: {title: '   '}}, createTaskStore()),
    /title is required/,
  );
});
