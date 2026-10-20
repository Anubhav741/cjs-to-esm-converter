# cjs_esm

A lightweight CLI tool to convert basic CommonJS modules into ES modules.

## Installation

```bash
npm install @anubhav741/cjs_esm
```

## Usage

Convert a CommonJS file into an ES module:

```bash
npx cjs_esm input.cjs -o output.mjs
```

Options:

- `-o, --output <file>` — Specify the output file.
- `-V, --version` — Display the CLI version.
- `-h, --help` — Display help.

## Supported conversions

- `require("module")` to `import`
- Destructured `require()` to named imports
- `module.exports = value` to `export default`
- Simple object exports to named exports

## Example

Input (`input.cjs`):

```js
const fs = require("node:fs");
module.exports = fs;
```

Run:

```bash
npx cjs_esm input.cjs -o output.mjs
```

Output (`output.mjs`):

```js
import fs from "node:fs";
export default fs;
```

## Limitations

This tool supports basic CommonJS patterns. Complex or dynamic module patterns may require manual conversion. Review generated output before using it in production.

## Development

```bash
npm install
npm test
```

## License

MIT