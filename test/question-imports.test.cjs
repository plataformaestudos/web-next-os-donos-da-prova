const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { once } = require("node:events");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");

// Compile the isolated API/rules modules using the project's installed TypeScript.
// No browser, Next server, database or new test dependency is required.
function loadTypeScript(relative) {
  const filename = resolve(__dirname, "../src/question-imports", relative);
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(resolve(__dirname, ".."));
  const originalRequire = compiled.require.bind(compiled);
  compiled.require = (name) =>
    name === "./question-import.rules" || name === "./import-preview.rules"
      ? loadTypeScript(`${name.slice(2)}.ts`)
      : originalRequire(name);
  const result = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  compiled._compile(result.outputText, filename);
  return compiled.exports;
}

const rules = loadTypeScript("question-import.rules.ts");
const previewRules = loadTypeScript("import-preview.rules.ts");
const file = { name: "questoes.docx", type: rules.DOCX_MIME, size: 100 };

test("draft patches preserve canonical images and only send explicitly reviewed fields", () => {
  const canonical = `import-image://${"a".repeat(64)}`;
  const original = {
    version: 7,
    payload: {
      text: `<p><img src="${canonical}"></p>`,
      comment: "original",
      answer: "A",
    },
    sourceNumber: 1,
    modulePath: ["Raiz", "Assunto"],
  };
  const edited = { ...original, payload: { ...original.payload, comment: "" } };
  assert.deepEqual(
    previewRules.buildDraftPatch(original, edited, ["comment"]),
    { version: 7, payload: { comment: "" } },
  );
  assert.deepEqual(previewRules.buildDraftPatch(original, edited, ["text"]), {
    version: 7,
    payload: { text: original.payload.text },
  });
  assert.deepEqual(
    previewRules.buildDraftPatch(original, edited, [
      "modulePath",
      "sourceNumber",
    ]),
    { version: 7, modulePath: original.modulePath, sourceNumber: 1 },
  );
});

test("approval excludes invalid, pending validation, saving and saved items", () => {
  for (const validity of [
    "VALID",
    "VALID_WITH_WARNINGS",
    "INVALID",
    "PENDING",
  ]) {
    for (const persistence of ["PENDING", "FAILED", "SAVING", "SAVED"]) {
      assert.equal(
        previewRules.canApproveItem({
          validationStatus: validity,
          persistenceStatus: persistence,
        }),
        ["VALID", "VALID_WITH_WARNINGS"].includes(validity) &&
          ["PENDING", "FAILED"].includes(persistence),
      );
    }
  }
  assert.equal(
    previewRules.canEditImport({ status: "READY", expiresAt: "2020-01-01" }),
    false,
  );
  assert.equal(
    previewRules.canEditImport({ status: "COMPLETED", expiresAt: null }),
    false,
  );
  assert.equal(
    previewRules.canEditImport({ status: "PARTIALLY_SAVED", expiresAt: null }),
    true,
  );
});

test("warning filter combines with invalid drafts and preserves exact module path parts", () => {
  const params = new URLSearchParams(
    previewRules.itemSearch({
      page: 2,
      pageSize: 20,
      hasWarnings: true,
      validationStatus: "INVALID",
      modulePath: ["Raiz & teste", "Módulo / parte"],
    }),
  );
  assert.equal(params.get("hasWarnings"), "true");
  assert.equal(params.get("validationStatus"), "INVALID");
  assert.deepEqual(params.getAll("modulePath[]"), [
    "Raiz & teste",
    "Módulo / parte",
  ]);
});

test("DOCX: accepts the size boundary, uppercase extension and missing OS MIME", () => {
  assert.equal(
    rules.validateDocument({ ...file, size: rules.MAX_DOCX_BYTES }),
    null,
  );
  assert.equal(
    rules.validateDocument({ ...file, name: "QUESTOES.DOCX" }),
    null,
  );
  assert.equal(rules.validateDocument({ ...file, type: "" }), null);
});

test("DOCX: rejects DOC, disguised extensions, empty, oversized and incompatible MIME", () => {
  for (const invalid of [
    { ...file, name: "questoes.doc" },
    { ...file, name: "questoes.docx.exe" },
    { ...file, size: 0 },
    { ...file, size: rules.MAX_DOCX_BYTES + 1 },
    { ...file, type: "application/pdf" },
  ])
    assert.equal(typeof rules.validateDocument(invalid), "string");
});

test("polling and preview cover every persisted status without polling terminal batches", () => {
  for (const status of ["PENDING", "QUEUED", "PROCESSING"]) {
    assert.equal(rules.isProcessing(status), true);
    assert.equal(rules.hasPreview(status), false);
  }
  for (const status of ["READY", "PARTIALLY_SAVED", "COMPLETED"]) {
    assert.equal(rules.isProcessing(status), false);
    assert.equal(rules.hasPreview(status), true);
  }
  for (const status of ["FAILED", "EXPIRED"]) {
    assert.equal(rules.isProcessing(status), false);
    assert.equal(rules.hasPreview(status), false);
  }
});

test("route identifiers cannot contain path segments or query parameters", () => {
  assert.equal(rules.isImportId("11111111-1111-4111-8111-111111111111"), true);
  for (const id of [
    "invalid",
    "../other",
    "11111111-1111-4111-8111-111111111111?x=1",
  ]) {
    assert.equal(rules.isImportId(id), false);
  }
});

test("HTTP contract: multipart upload, retry, status, roots and recoverable failures", async (t) => {
  const importId = "11111111-1111-4111-8111-111111111111";
  const nextId = "22222222-2222-4222-8222-222222222222";
  const rootId = "33333333-3333-4333-8333-333333333333";
  const requests = [];
  let failUpload = false;
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    requests.push({
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: Buffer.concat(chunks).toString(),
    });
    res.setHeader("Content-Type", "application/json");
    if (
      req.method === "PATCH" &&
      JSON.parse(requests.at(-1).body).version === 99
    ) {
      res.statusCode = 409;
      res.end(
        JSON.stringify({
          code: "IMPORT_ITEM_VERSION_CONFLICT",
          currentVersion: 100,
          message: "O rascunho foi alterado.",
        }),
      );
      return;
    }
    if (req.method === "POST" && failUpload) {
      res.statusCode = 503;
      res.end(JSON.stringify({ message: "Fila indisponível", importId }));
      return;
    }
    res.statusCode = req.method === "POST" ? 202 : 200;
    let data;
    if (req.url === "/modules/root-modules")
      data = [
        { id: rootId, name: "Contabilidade", parentModuleId: null },
        { id: "child", name: "Submódulo", parentModuleId: rootId },
      ];
    else if (req.method === "GET")
      data = { id: importId, status: "READY", summary: { invalidItems: 2 } };
    else
      data = {
        id: req.url.endsWith("/retry") ? nextId : importId,
        status: "QUEUED",
      };
    res.end(JSON.stringify({ statusCode: res.statusCode, data }));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const previousBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_API_BASE_URL = `http://127.0.0.1:${server.address().port}`;
  const api = loadTypeScript("question-import.api.ts");
  if (previousBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = previousBase;
  const document = new File(["PK\x03\x04sample"], "sample.docx");

  await t.test(
    "preview endpoints send the draft version and preserve partial payloads",
    async () => {
      await api.updateImportItem(importId, nextId, {
        version: 7,
        payload: { comment: "" },
      });
      assert.equal(requests.at(-1).method, "PATCH");
      assert.deepEqual(JSON.parse(requests.at(-1).body), {
        version: 7,
        payload: { comment: "" },
      });
      await api.reviewImportItem(importId, nextId, 8, "APPROVED");
      assert.equal(
        requests.at(-1).url,
        `/question-imports/${importId}/items/${nextId}/review`,
      );
      assert.deepEqual(JSON.parse(requests.at(-1).body), {
        version: 8,
        reviewStatus: "APPROVED",
      });
      await api.revalidateImportItem(importId, nextId, 9);
      assert.equal(
        requests.at(-1).url,
        `/question-imports/${importId}/items/${nextId}/revalidate`,
      );
      await api.loadImportErrors(importId, "WARNING", 2);
      assert.match(
        requests.at(-1).url,
        /errors\?severity=WARNING&page=2&pageSize=20/,
      );
      await api.loadImportModulePaths(importId);
      assert.equal(
        requests.at(-1).url,
        `/question-imports/${importId}/module-paths`,
      );
    },
  );

  await t.test(
    "version conflicts never resend a patch with a refreshed version",
    async () => {
      const count = requests.length;
      await assert.rejects(
        api.updateImportItem(importId, nextId, {
          version: 99,
          payload: { comment: "local" },
        }),
        (error) => {
          assert.equal(
            api.importErrorCode(error),
            "IMPORT_ITEM_VERSION_CONFLICT",
          );
          return true;
        },
      );
      assert.equal(requests.length, count + 1);
    },
  );

  await t.test(
    "upload includes root and browser-generated multipart boundary",
    async () => {
      const accepted = await api.uploadImport({
        file: document,
        rootModuleId: rootId,
        onProgress() {},
      });
      assert.equal(accepted.id, importId);
      const request = requests.at(-1);
      assert.equal(request.url, "/question-imports");
      assert.match(
        request.headers["content-type"],
        /^multipart\/form-data; boundary=/,
      );
      assert.match(request.body, /name="rootModuleId"/);
      assert.ok(request.body.includes(rootId));
      assert.match(request.body, /filename="sample.docx"/);
      assert.ok(request.body.includes(rules.DOCX_MIME));
    },
  );

  await t.test(
    "retry sends only file and uses the new returned identifier",
    async () => {
      const accepted = await api.uploadImport({
        file: document,
        rootModuleId: rootId,
        retryId: importId,
        onProgress() {},
      });
      assert.equal(accepted.id, nextId);
      assert.equal(requests.at(-1).url, `/question-imports/${importId}/retry`);
      assert.doesNotMatch(requests.at(-1).body, /name="rootModuleId"/);
    },
  );

  await t.test(
    "READY batches with invalid items remain available; roots exclude children",
    async () => {
      const status = await api.loadImport(importId);
      assert.equal(status.status, "READY");
      assert.equal(status.summary.invalidItems, 2);
      assert.deepEqual(
        (await api.loadImportRoots()).map((root) => root.id),
        [rootId],
      );
    },
  );

  await t.test(
    "503 preserves importId and never automatically repeats the POST",
    async () => {
      failUpload = true;
      const count = requests.length;
      await assert.rejects(
        api.uploadImport({
          file: document,
          rootModuleId: rootId,
          onProgress() {},
        }),
        (error) => {
          assert.equal(api.failedImportId(error), importId);
          assert.equal(api.importErrorStatus(error), 503);
          assert.equal(api.importErrorMessage(error), "Fila indisponível");
          return true;
        },
      );
      assert.equal(requests.length, count + 1);
    },
  );

  await t.test(
    "permission errors and interrupted connections have actionable messages",
    () => {
      const error = (status, data = {}) => ({
        isAxiosError: true,
        response: { status, data },
      });
      assert.match(api.importErrorMessage(error(401)), /sessão expirou/);
      assert.match(api.importErrorMessage(error(403)), /permissão/);
      assert.match(api.importErrorMessage(error(404)), /não encontrada/);
      assert.match(api.importErrorMessage(error(413)), /30 MB/);
      assert.match(
        api.importErrorMessage({ isAxiosError: true }, true),
        /pode ter recebido/,
      );
      assert.equal(
        api.failedImportId(error(503, { importId: "../bad" })),
        undefined,
      );
    },
  );
});
