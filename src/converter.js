
import { parse } from "@babel/parser";
import recast from "recast";

const parser = {
  parse(source) {
    return parse(source, {
      sourceType: "unambiguous",
    });
  },
};

const b = recast.types.builders;

function getRequireSource(init) {
  if (
    init?.type === "CallExpression" &&
    init.callee.type === "Identifier" &&
    init.callee.name === "require" &&
    init.arguments.length === 1 &&
    init.arguments[0].type === "StringLiteral"
  ) {
    return init.arguments[0];
  }

  return null;
}

function convertRequire(node) {
  if (
    node.type !== "VariableDeclaration" ||
    node.declarations.length !== 1
  ) {
    return null;
  }

  const declaration = node.declarations[0];
  const source = getRequireSource(declaration.init);

  if (!source) return null;

  // const path = require("node:path")
  if (declaration.id.type === "Identifier") {
    return b.importDeclaration(
      [
        b.importDefaultSpecifier(
          b.identifier(declaration.id.name)
        ),
      ],
      b.stringLiteral(source.value)
    );
  }

  // const { join } = require("node:path")
  if (declaration.id.type === "ObjectPattern") {
    const specifiers = [];

    for (const property of declaration.id.properties) {
      if (
        property.type !== "ObjectProperty" ||
        property.computed ||
        property.key.type !== "Identifier" ||
        property.value.type !== "Identifier"
      ) {
        return null;
      }

      specifiers.push(
        b.importSpecifier(
          b.identifier(property.value.name),
          b.identifier(property.key.name)
        )
      );
    }

    return b.importDeclaration(
      specifiers,
      b.stringLiteral(source.value)
    );
  }

  return null;
}

function convertModuleExports(node) {
  if (
    node.type !== "ExpressionStatement" ||
    node.expression.type !== "AssignmentExpression"
  ) {
    return null;
  }

  const assignment = node.expression;
  const left = assignment.left;

  if (
    assignment.operator !== "=" ||
    left.type !== "MemberExpression" ||
    left.computed ||
    left.object.type !== "Identifier" ||
    left.object.name !== "module" ||
    left.property.type !== "Identifier" ||
    left.property.name !== "exports"
  ) {
    return null;
  }

  const value = assignment.right;

  // module.exports = { join }
  if (value.type === "ObjectExpression") {
    const specifiers = [];

    for (const property of value.properties) {
      if (
        property.type !== "ObjectProperty" ||
        property.computed ||
        property.key.type !== "Identifier" ||
        property.value.type !== "Identifier"
      ) {
        return b.exportDefaultDeclaration(value);
      }

      // export { join }
        specifiers.push({
        type: "ExportSpecifier",
        exported: b.identifier(property.key.name),
        local: b.identifier(property.value.name),
        });
    }

    return b.exportNamedDeclaration(null, specifiers);
  }

  // module.exports = path
  return b.exportDefaultDeclaration(value);
}

export function convertCjsToEsm(source) {
  const ast = recast.parse(source, { parser });

  ast.program.body = ast.program.body.map((node) => {
    return (
      convertRequire(node) ??
      convertModuleExports(node) ??
      node
    );
  });

  return recast.print(ast).code;
}
