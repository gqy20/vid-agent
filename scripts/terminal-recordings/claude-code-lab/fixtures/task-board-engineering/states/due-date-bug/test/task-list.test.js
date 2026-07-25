import assert from 'node:assert/strict';
import test from 'node:test';
import {renderTaskList} from '../src/ui/task-list.js';

test('keeps the calendar date visible in the user timezone', () => {
  const output = renderTaskList([
    {title: 'Ship course', completed: false, dueDate: '2026-07-26'},
  ], 'America/Los_Angeles');
  assert.equal(output, '[ ] Ship course · 2026-07-26');
});
