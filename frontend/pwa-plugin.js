import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

export function pwa(root) {
  return {
    name: "moranguinho-pwa",
    apply: "build",
    generateBundle(_options, bundle) {
      const publicDir = resolve(root, "public");
      const publicFiles = readdirSync(publicDir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) =>
          resolve(entry.parentPath, entry.name).slice(publicDir.length).replaceAll("\\", "/"),
        );
      const assets = [
        ...new Set([
          "/index.html",
          ...Object.keys(bundle).map((name) => `/${name}`),
          ...publicFiles,
        ]),
      ].sort();
      const template = readFileSync(resolve(root, "sw-template.js"), "utf8");
      const hash = createHash("sha256")
        .update(template)
        .update(JSON.stringify(assets))
        .update(readFileSync(resolve(root, "index.html")));
      for (const name of publicFiles.sort())
        hash.update(readFileSync(resolve(publicDir, `.${name}`)));
      for (const file of Object.values(bundle))
        hash.update(file.type === "chunk" ? file.code : file.source);
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: template
          .replace("__BUILD_VERSION__", hash.digest("hex").slice(0, 12))
          .replace("__PRECACHE_ASSETS__", JSON.stringify(assets)),
      });
    },
  };
}
