#!/usr/bin/env node

import { Command } from "commander";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { convertCjsToEsm } from "../src/converter.js";

const program = new Command();

program
  .name("cjs-to-esm")
  .description("Convert basic CommonJS code to ESM")
  .version("0.1.0")
  .argument("<input>", "Input CommonJS file")
  .requiredOption("-o, --output <file>", "Output ESM file")
  .action(async (input, options) => {
    try {
      const inputPath = path.resolve(input);
      const outputPath = path.resolve(options.output);

      if (inputPath === outputPath) {
        throw new Error("Input and output files must be different.");
      }

      const source = await readFile(inputPath, "utf8");
      const result = convertCjsToEsm(source);

      await writeFile(outputPath, result, "utf8");

      console.log(`Converted: ${inputPath}`);
      console.log(`Output: ${outputPath}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

await program.parseAsync(process.argv);
