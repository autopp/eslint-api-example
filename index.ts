import { readFileSync } from 'fs'
import { Linter } from 'eslint'
import { Expression, Literal } from 'estree'

function isZeroLiteral(node: Expression): boolean {
  return node.type === 'Literal' && (node as Literal).value === 0
}

const linter = new Linter()
linter.defineRules({
  "no-this": {
    create(context) {
      return {
        ThisExpression(node) {
          context.report({ node, message: 'using this is not allowed' })
        },

      }
    }
  },
  "no-zero-division": {
    create(context) {
      return {
        BinaryExpression(node) {
          if (node.operator === '/' && isZeroLiteral(node.right)) {
            context.report({ node, message: 'zero division is not allowed' })
          }
        }
      }
    }
  }
})

process.argv.slice(2).forEach((path) => {
  const code = readFileSync(path).toString('utf-8')

  linter.verify(
    code,
    {
      parserOptions: { ecmaVersion: 10 },
      rules: {
        "no-this": "error",
        "no-zero-division": "error"
      }
    },
    { filename: path }).forEach(msg => {
      console.log(`${path}:${msg.line}:${msg.column} ${msg.message} [${msg.ruleId}]`)
    })
})
