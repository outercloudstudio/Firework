const util = require('util')

const Tokenizer = require('./Tokenizer')
const Compiler = require('./Compiler')

const tokens = Tokenizer.tokenize(`print("Hello World", "Goodbye World")`)

//console.log(util.inspect(tokens, false, null, true /* enable colors */))

const ETree = Compiler.generateFullETree(tokens)

console.log(util.inspect(ETree, false, null, true /* enable colors */))