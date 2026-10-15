const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");

// Isolate the navigation hook without adding a renderer or browser dependency.
function fixture() {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const react = {
    useRef(value) {
      const index = cursor++;
      return (slots[index] ??= { current: value });
    },
    useCallback(callback) {
      const index = cursor++;
      return (slots[index] ??= callback);
    },
    useEffect(callback, deps) {
      const index = cursor++;
      const old = slots[index];
      if (!old || deps.some((value, i) => !Object.is(value, old.deps[i]))) {
        effects.push(() => {
          old?.cleanup?.();
          slots[index] = { deps, callback, cleanup: callback() };
        });
      }
    },
  };
  const filename = resolve(__dirname, "../src/question-imports/import-review-navigation.tsx");
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(resolve(__dirname, ".."));
  const requireOriginal = compiled.require.bind(compiled);
  compiled.require = (name) => {
    if (name === "react") return react;
    if (name === "antd" || name === "@ant-design/icons") return {};
    return requireOriginal(name);
  };
  compiled._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText, filename);
  const frames = new Map();
  let frameId = 0;
  const calls = [];
  const oldWindow = global.window;
  const oldDocument = global.document;
  global.document = { documentElement: {} };
  global.window = {
    matchMedia: () => ({ matches: false }),
    getComputedStyle: (element) => element.style,
    scrollY: 30,
    innerHeight: 600,
    scrollTo: (options) => calls.push({ window: true, ...options }),
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const container = {
    style: { overflowY: "auto" },
    scrollHeight: 2000,
    clientHeight: 200,
    clientTop: 2,
    scrollTop: 50,
    parentElement: document.documentElement,
    getBoundingClientRect: () => ({ top: 100 }),
    scrollTo: (options) => calls.push(options),
  };
  const target = {
    parentElement: container,
    getBoundingClientRect: () => ({ top: 240, bottom: 400 }),
  };
  return {
    ...compiled.exports,
    container, target, calls, frames,
    render(key, ready) {
      cursor = 0;
      effects = [];
      const navigation = compiled.exports.useReviewPageNavigation(key, ready);
      navigation.startRef.current = target;
      effects.forEach((effect) => effect());
      return navigation;
    },
    replayEffects() {
      for (const slot of slots) {
        if (slot?.callback) {
          slot.cleanup?.();
          slot.cleanup = slot.callback();
        }
      }
    },
    flush() {
      const queued = [...frames.values()];
      frames.clear();
      queued.forEach((callback) => callback());
    },
    cleanup() {
      slots.forEach((slot) => slot?.cleanup?.());
      global.window = oldWindow;
      global.document = oldDocument;
    },
  };
}

test("arrows use the actual scrolling ancestor and align list start / pagination end", (t) => {
  const f = fixture(); t.after(() => f.cleanup());
  f.scrollToReviewTarget(f.target);
  f.scrollToReviewTarget(f.target, true);
  assert.deepEqual(f.calls, [
    { top: 176, behavior: "smooth" },
    { top: 160, behavior: "smooth" },
  ]);
});

test("reduced motion is instant even when the scroll container has smooth CSS", (t) => {
  const f = fixture(); t.after(() => f.cleanup());
  window.matchMedia = () => ({ matches: true });
  f.scrollToReviewTarget(f.target);
  assert.equal(f.calls[0].behavior, "instant");
});

test("non-scrolling ancestors fall back to the document", (t) => {
  const f = fixture(); t.after(() => f.cleanup());
  f.container.scrollHeight = f.container.clientHeight;
  f.scrollToReviewTarget(f.target);
  f.scrollToReviewTarget(f.target, true);
  assert.deepEqual(f.calls, [
    { window: true, top: 258, behavior: "smooth" },
    { window: true, top: -158, behavior: "smooth" },
  ]);
});

test("initial load, refresh and editing do not reposition the list", (t) => {
  const f = fixture(); t.after(() => f.cleanup());
  f.render("page-1", false);
  f.render("page-1", true);
  f.flush();
  f.render("page-1", true);
  f.replayEffects();
  f.flush();
  assert.deepEqual(f.calls, []);
});

test("page changes wait for matching loaded data and scroll once", (t) => {
  const f = fixture(); t.after(() => f.cleanup());
  const nav = f.render("page-1", true);
  nav.requestScroll("page-2");
  f.render("page-2", false);
  f.flush();
  assert.equal(f.calls.length, 0);
  f.render("page-2", true);
  f.replayEffects(); // React Strict Mode must not consume the pending request early.
  f.flush();
  assert.equal(f.calls.length, 1);
  f.render("page-2", true);
  f.replayEffects();
  f.flush();
  assert.equal(f.calls.length, 1);
});

test("pageSize and cached page changes scroll without waiting for a network fetch", (t) => {
  const f = fixture(); t.after(() => f.cleanup());
  let nav = f.render("page-1-size-10", true);
  nav.requestScroll("page-1-size-50");
  nav = f.render("page-1-size-50", true);
  f.flush();
  nav.requestScroll("page-1-size-10");
  f.render("page-1-size-10", true);
  f.flush();
  assert.equal(f.calls.length, 2);
});

test("rapid navigation cancels stale frames; filter changes cancel pending navigation", (t) => {
  const f = fixture(); t.after(() => f.cleanup());
  let nav = f.render("page-1", true);
  nav.requestScroll("page-2");
  nav = f.render("page-2", true);
  nav.requestScroll("page-3");
  nav = f.render("page-3", false);
  f.flush();
  assert.equal(f.calls.length, 0);
  nav.cancelScroll();
  f.render("page-3", true);
  f.flush();
  assert.equal(f.calls.length, 0);
});

test("page normalization redirects only an explicit navigation request", (t) => {
  const f = fixture(); t.after(() => f.cleanup());
  const nav = f.render("page-3", false);
  nav.redirectScroll("page-2");
  f.render("page-2", true);
  f.flush();
  assert.equal(f.calls.length, 0);
  nav.requestScroll("page-5");
  f.render("page-5", false);
  nav.redirectScroll("page-4");
  f.render("page-4", true);
  f.flush();
  assert.equal(f.calls.length, 1);
});
