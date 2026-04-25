import test from 'node:test';
import assert from 'node:assert';
import { normalizeAmount, normalizeDate } from './normalize';

test('normalizeAmount handles BRL formats', () => {
  assert.strictEqual(normalizeAmount('1.234,56'), 1234.56);
  assert.strictEqual(normalizeAmount('12,34'), 12.34);
  assert.strictEqual(normalizeAmount('-5.000,00'), -5000.00);
});

test('normalizeAmount handles US formats', () => {
  assert.strictEqual(normalizeAmount('1,234.56'), 1234.56);
  assert.strictEqual(normalizeAmount('12.34'), 12.34);
  assert.strictEqual(normalizeAmount('-5000.00'), -5000.00);
});

test('normalizeDate handles various formats', () => {
  assert.strictEqual(normalizeDate('2023-10-15'), '2023-10-15');
  assert.strictEqual(normalizeDate('15/10/2023'), '2023-10-15');
  assert.strictEqual(normalizeDate('15-10-2023'), '2023-10-15');
});
