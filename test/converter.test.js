import test from "node:test";
import assert from "node:assert/strict";

import { convertCjsToEsm } from "../src/converter.js";

test("converts require to import", () => {
  const source = 'const path = require("node:path");';

  const result = convertCjsToEsm(source);

  assert.match(result, /import path from ["']node:path["']/);
});

test("converts module.exports to export default", () => {
  const source = "module.exports = path;";

  const result = convertCjsToEsm(source);

  assert.match(result, /export default path/);
});

test("converts a complete basic CJS module", () => {
  const source = [
    'const path = require("node:path");',
    "module.exports = path;",
  ].join("\n");

  const result = convertCjsToEsm(source);

  assert.match(result, /import path from ["']node:path["']/);
  assert.match(result, /export default path/);
});

test("converts destructured require to named imports", () => {
  const source = 'const { join } = require("node:path");';
  const result = convertCjsToEsm(source);

  assert.match(result, /import\s*\{\s*join\s*\}\s*from/);
});

test("converts object exports to named exports", () => {
  const source = "module.exports = { join };";
  const result = convertCjsToEsm(source);

  assert.match(result, /export\s*\{\s*join\s*\}/);
});