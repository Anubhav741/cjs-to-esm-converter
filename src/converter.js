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

export function convertCjsToEsm(source) {
  const ast = recast.parse(source, { parser });

  ast.program.body = ast.program.body.map((node) => {
    // const path = require("node:path")
    if (
      node.type === "VariableDeclaration" &&
      node.declarations.length === 1
    ) {
      const declaration = node.declarations[0];
      const init = declaration.init;

      if (
        declaration.id.type === "Identifier" &&
        init?.type === "CallExpression" &&
        init.callee.type === "Identifier" &&
        init.callee.name === "require" &&
        init.arguments.length === 1 &&
        init.arguments[0].type === "StringLiteral"
      ) {
        return b.importDeclaration(
          [
            b.importDefaultSpecifier(
              b.identifier(declaration.id.name)
            ),
          ],
          b.stringLiteral(init.arguments[0].value)
        );
      }
    }

    // module.exports = path
    if (
      node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression"
    ) {
      const assignment = node.expression;
      const left = assignment.left;

      if (
        assignment.operator === "=" &&
        left.type === "MemberExpression" &&
        !left.computed &&
        left.object.type === "Identifier" &&
        left.object.name === "module" &&
        left.property.type === "Identifier" &&
        left.property.name === "exports"
      ) {
        return b.exportDefaultDeclaration(assignment.right);
      }
    }

    return node;
  });

  return recast.print(ast).code;
}