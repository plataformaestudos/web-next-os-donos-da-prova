const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/ebooks/page-content.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const moduleContent = { exports: {} };
new Function('exports', 'module', outputText)(moduleContent.exports, moduleContent);
const { pageImagePath, withPageImages, withoutSampleImage } = moduleContent.exports;

test('local image preview overlays only supported images without mutating the saved draft', () => {
  const content = { headline: 'Título', coverUrl: 'saved-cover', samples: [{ title: 'Página', description: 'Texto', imageUrl: 'saved-sample' }] };
  const preview = withPageImages(content, { coverUrl: 'blob:cover', 'samples.0.imageUrl': 'blob:sample', headline: 'Untrusted overwrite', 'samples.9.imageUrl': 'orphan' });
  assert.equal(preview.coverUrl, 'blob:cover');
  assert.equal(preview.samples[0].imageUrl, 'blob:sample');
  assert.equal(preview.headline, 'Título');
  assert.equal(content.coverUrl, 'saved-cover');
  assert.equal(content.samples[0].imageUrl, 'saved-sample');
  assert.equal(preview.samples.length, 1);
});
test('removing a sample discards its local upload and shifts remaining images to the correct pages', () => {
  const uploads = { coverUrl: 'cover', 'samples.0.imageUrl': 'first', 'samples.1.imageUrl': 'removed', 'samples.2.imageUrl': 'third' };
  const result = withoutSampleImage(uploads, 1);
  assert.deepEqual(result, { coverUrl: 'cover', 'samples.0.imageUrl': 'first', 'samples.1.imageUrl': 'third' });
  assert.equal(uploads['samples.2.imageUrl'], 'third');
  assert.deepEqual(pageImagePath('samples.1.imageUrl'), ['content', 'samples', 1, 'imageUrl']);
  assert.deepEqual(pageImagePath('coverUrl'), ['content', 'coverUrl']);
  assert.throws(() => pageImagePath('headline'));
});
