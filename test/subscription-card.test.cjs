const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(fetch) {
  const source = fs.readFileSync(path.join(__dirname, '../src/subscription/update-credit-card.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const module = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(() => ({ default: { fetch } }), module.exports, module);
  return module.exports.updateSubscriptionCreditCard;
}
const validPayment = { holderName: ' Pessoa Teste ', number: '4111-1111-1111-1111', expiryDate: '12/99', cvv: '123', saveCard: true };

test('confirmation reads current form values and sends only subscription and card fields', async () => {
  let sent;
  const update = load(async (...args) => { sent = args; });
  let values;
  const confirm = () => update('user-subscription-id', { validateFields: async () => values });
  values = validPayment;
  await confirm();
  assert.equal(sent[0], '/subscription/update-credit-card');
  assert.equal(sent[1].method, 'PUT');
  assert.deepEqual(JSON.parse(sent[1].body), {
    subscriptionId: 'user-subscription-id', saveCard: true,
    creditCard: { holderName: 'Pessoa Teste', number: '4111111111111111', expiryMonth: '12', expiryYear: '2099', ccv: '123' },
  });
});
test('invalid or expired card values never reach the API', async () => {
  let called = false;
  const update = load(async () => { called = true; });
  for (const payment of [{ ...validPayment, expiryDate: '13/99' }, { ...validPayment, expiryDate: '01/00' }, { ...validPayment, number: '4111-____' }, { ...validPayment, cvv: '1' }]) {
    await assert.rejects(() => update('subscription', { validateFields: async () => payment }));
  }
  await assert.rejects(() => update('subscription', { validateFields: async () => { throw Error('invalid form'); } }));
  assert.equal(called, false);
});
test('payment service errors propagate to the modal without claiming success', async () => {
  const error = new Error('Complete o perfil');
  const update = load(async () => { throw error; });
  await assert.rejects(() => update('subscription', { validateFields: async () => validPayment }), error);
});
