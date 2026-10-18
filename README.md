# cjs-to-esm-converter

A lightweight Node.js CLI tool that converts basic CommonJS syntax into ECMAScript Modules (ESM).

## Features

- Converts `require()` statements into `import` statements.
- Converts `module.exports` into ESM exports.
- Supports basic destructured imports.
- Supports named exports from simple object literals.
- Provides both a JavaScript API and a command-line interface.

## Requirements

- Node.js 18 or later

## Installation

```bash
npm install cjs-to-esm-converter
```

## CLI Usage

Convert a CommonJS file into an ESM file:

```bash
npx cjs-to-esm input.cjs -o output.mjs
```

Or install the package globally:

```bash
npm install -g cjs-to-esm-converter
cjs-to-esm input.cjs -o output.mjs
```

## JavaScript API

```javascript
import { convertCjsToEsm } from "cjs-to-esm-converter";

const source = `
const path = require("node:path");
module.exports = path;
`;

const result = convertCjsToEsm(source);
console.log(result);
```

## Limitations

This tool currently handles basic CommonJS patterns. Complex dynamic `require()` calls, conditional exports, and other advanced CommonJS patterns may not convert correctly. Review the generated code before using it in production.

## Development

```bash
git clone https://github.com/Anubhav741/cjs-to-esm-converter.git
cd cjs-to-esm-converter
npm install
npm test
```

## License

MIT
