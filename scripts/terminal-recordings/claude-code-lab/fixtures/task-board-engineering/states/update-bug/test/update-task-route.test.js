import assert from 'node:assert/strict';
import test from 'node:test';
import {createTaskRoute} from '../src/http/create-task-route.js';
import {updateTaskRoute} from '../src/http/update-task-route.js';
import {createTaskStore} from '../src/tasks/task-store.js';

test('editing a title preserves the existing due date', () => {
  const store = createTaskStore();
  createTaskRoute({body: {title: 'Draft', dueDate: '2026-08-10'}}, store);
  const response = updateTaskRoute({params: {id: '1'}, body: {title: 'Publish'}}, store);
  assert.equal(response.status, 200);
  assert.equal(response.body.title, 'Publish');
  assert.equal(response.body.dueDate, '2026-08-10');
});
