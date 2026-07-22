import assert from 'node:assert/strict';
import test from 'node:test';
import {validateToken} from '../src/auth/validate-token.js';

test('accepts a non-empty token', () => {
  assert.equal(validateToken('course-token'), true);
});

test('rejects an empty token', () => {
  assert.equal(validateToken(''), false);
});

test('rejects a whitespace-only token', () => {
  assert.equal(validateToken('   '), false);
});
