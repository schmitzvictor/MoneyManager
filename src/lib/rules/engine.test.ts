import test from 'node:test';
import assert from 'node:assert';
import { applyRules, applyRulesBulk, CategorizationRule, RuleTargetTransaction } from './engine';

const rules: CategorizationRule[] = [
  {
    id: '1',
    field: 'description',
    operator: 'equals',
    value: 'Netflix',
    category_id: 'cat-netflix',
    priority: 1,
    is_active: true,
  },
  {
    id: '2',
    field: 'description',
    operator: 'contains',
    value: 'Uber',
    category_id: 'cat-uber',
    priority: 2,
    is_active: true,
  },
  {
    id: '3',
    field: 'description',
    operator: 'starts_with',
    value: 'Amzn',
    category_id: 'cat-amzn',
    priority: 3,
    is_active: true,
  },
  {
    id: '4',
    field: 'description',
    operator: 'contains',
    value: 'Inactive',
    category_id: 'cat-inactive',
    priority: 4,
    is_active: false, // inactive!
  },
];

test('evaluateRule handles equals case-insensitive', () => {
  const tx: RuleTargetTransaction = { description: 'netflix' };
  const cat = applyRules(tx, rules);
  assert.strictEqual(cat, 'cat-netflix');
});

test('evaluateRule handles contains case-insensitive', () => {
  const tx: RuleTargetTransaction = { description: 'Uber Trip Help' };
  const cat = applyRules(tx, rules);
  assert.strictEqual(cat, 'cat-uber');
});

test('evaluateRule handles starts_with case-insensitive', () => {
  const tx: RuleTargetTransaction = { description: 'AMZN Digital' };
  const cat = applyRules(tx, rules);
  assert.strictEqual(cat, 'cat-amzn');
});

test('evaluateRule ignores inactive rules', () => {
  const tx: RuleTargetTransaction = { description: 'Inactive stuff' };
  const cat = applyRules(tx, rules);
  assert.strictEqual(cat, null);
});

test('applyRulesBulk assigns categories only to uncategorized transactions', () => {
  const txs = [
    { id: 't1', description: 'Netflix', categoryId: 'existing-cat' }, // should not overwrite
    { id: 't2', description: 'Uber Eats' }, // should get cat-uber
    { id: 't3', description: 'Random' }, // should remain uncategorized
  ];

  const results = applyRulesBulk(txs, rules);
  assert.strictEqual(results[0].categoryId, 'existing-cat');
  assert.strictEqual(results[1].categoryId, 'cat-uber');
  assert.strictEqual(results[2].categoryId, undefined);
});
