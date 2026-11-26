import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { pwa } from "../pwa-plugin.js";
const template = readFileSync(new URL("../sw-template.js", import.meta.url), "utf8");
function setup() {
  const handlers = {},
    cached = new Map(),
    removed = [];
  let online = true;
  const cache = {
    addAll: async (assets) => assets.forEach((asset) => cached.set(asset, `cached:${asset}`)),
    match: async (path) => cached.get(path),
  };
  const self = {
    location: { origin: "https://game.test" },
    addEventListener: (key, cb) => (handlers[key] = cb),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  const caches = {
    open: async () => cache,
    keys: async () => ["moranguinho-shell-old", "moranguinho-shell-test", "other-app"],
    delete: async (key) => removed.push(key),
    match: cache.match,
  };
  const fetch = async (request) => {
    if (!online) throw new Error("offline");
    return `network:${request.url}`;
  };
  vm.runInNewContext(
    template
      .replace("__BUILD_VERSION__", "test")
      .replace(
        "__PRECACHE_ASSETS__",
        JSON.stringify(["/index.html", "/assets/app.js", "/manifest.webmanifest"]),
      ),
    { self, caches, fetch, URL },
  );
  function lifecycle(name) {
    let promise;
    handlers[name]({ waitUntil: (value) => (promise = value) });
    return promise;
  }
  function request(path, method = "GET", mode = "cors") {
    let promise;
    handlers.fetch({
      request: { url: new URL(path, self.location.origin).href, method, mode },
      respondWith: (value) => (promise = value),
    });
    return promise;
  }
  return { cached, removed, lifecycle, request, offline: () => (online = false) };
}
test("instala e atualiza cache versionado sem apagar cache de outros apps", async () => {
  const s = setup();
  await s.lifecycle("install");
  assert.equal(s.cached.size, 3);
  await s.lifecycle("activate");
  assert.deepEqual(s.removed, ["moranguinho-shell-old"]);
});
test("PWA abre tela e assets offline; não intercepta API, POST ou dados externos", async () => {
  const s = setup();
  await s.lifecycle("install");
  assert.equal(
    await s.request("/aventura", "GET", "navigate"),
    "network:https://game.test/aventura",
  );
  s.offline();
  assert.equal(await s.request("/aventura", "GET", "navigate"), "cached:/index.html");
  assert.equal(await s.request("/assets/app.js"), "cached:/assets/app.js");
  assert.equal(s.request("/api/journey/"), undefined);
  assert.equal(s.request("/api/journey/final/", "POST"), undefined);
  assert.equal(s.request("https://external.test/app.js"), undefined);
});
test("manifest tem ícones instaláveis e escopo da aventura", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
  );
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  for (const size of [192, 512])
    assert.ok(
      manifest.icons.some(
        (icon) =>
          icon.sizes === `${size}x${size}` &&
          readFileSync(new URL(`../public${icon.src}`, import.meta.url)).length > 100,
      ),
    );
});

test("plugin gera SW incluindo chunks, imagens e manifest, com versão por conteúdo", () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  function generate(code) {
    let file;
    pwa(root).generateBundle.call(
      { emitFile: (item) => (file = item) },
      {},
      {
        "assets/index.js": { type: "chunk", code },
        "assets/theme.css": { type: "asset", source: "body{}" },
      },
    );
    return file;
  }
  const first = generate("first");
  const second = generate("second");
  assert.equal(first.fileName, "sw.js");
  assert.notEqual(first.source, second.source);
  for (const path of [
    "/index.html",
    "/assets/index.js",
    "/assets/theme.css",
    "/manifest.webmanifest",
    "/icon-192.png",
    "/imagens/tutti-frutti-map.png",
  ])
    assert.ok(first.source.includes(JSON.stringify(path)), path);
  assert.ok(!first.source.includes("__PRECACHE_ASSETS__"));
});
