import assert from 'node:assert/strict';
import test from 'node:test';
import {createTaskRoute} from '../src/http/create-task-route.js';
import {createTaskStore} from '../src/tasks/task-store.js';

test('creates and stores a task from the request body', () => {
  const store = createTaskStore();
  const response = createTaskRoute({body: {title: 'Ship course'}}, store);

  assert.equal(response.status, 201);
  assert.deepEqual(response.body, {id: 1, title: 'Ship course', completed: false});
  assert.deepEqual(store.all(), [response.body]);
});

test('rejects an empty title', () => {
  const store = createTaskStore();

  assert.throws(
    () => createTaskRoute({body: {title: ''}}, store),
    /title is required/,
  );
});

test('documents the current whitespace-title gap', () => {
  const store = createTaskStore();
  const response = createTaskRoute({body: {title: '   '}}, store);

  assert.equal(response.status, 201);
  assert.equal(response.body.title, '   ');
});
