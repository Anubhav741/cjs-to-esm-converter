
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const cli = path.resolve("bin/cli.js");

test("CLI converts a file and writes ESM output", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "cjs-to-esm-"));

  try {
    const input = path.join(dir, "input.cjs");
    const output = path.join(dir, "output.mjs");

    writeFileSync(
      input,
      'const path = require("node:path");\nmodule.exports = path;\n'
    );

    const result = spawnSync(
      process.execPath,
      [cli, input, "-o", output],
      { encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr);

    const converted = readFileSync(output, "utf8");

    assert.match(converted, /import path from ["']node:path["']/);
    assert.match(converted, /export default path/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI reports an error for a missing input file", () => {
  const result = spawnSync(
    process.execPath,
    [cli, "file-that-does-not-exist.cjs", "-o", "output.mjs"],
    { encoding: "utf8" }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Error:/);
});
