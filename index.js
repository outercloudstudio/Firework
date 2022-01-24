const util = require('util')

const Tokenizer = require('./Tokenizer')
const Compiler = require('./Compiler')

const tokens = Tokenizer.tokenize(`(1 + 2) * 3
8 * 8
6 - 2`)

const ETree = Compiler.generateETree(tokens)

console.log(util.inspect(ETree, false, null, true /* enable colors */))