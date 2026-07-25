import assert from 'node:assert/strict';
import test from 'node:test';
import {renderTaskList} from '../src/ui/task-list.js';

test('renders task title and completion state', () => {
  assert.equal(renderTaskList([{title: 'Ship course', completed: false}]), '[ ] Ship course');
});
