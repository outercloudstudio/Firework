const util = require('util')
const fs = require('fs')

const Tokenizer = require('./Tokenizer')
const Compiler = require('./Compiler')

const tokens = Tokenizer.tokenize(fs.readFileSync('./Param.frw').toString())

//console.log(util.inspect(tokens, false, null, true /* enable colors */))

const ETree = Compiler.generateETree(tokens)

console.log(util.inspect(ETree, false, null, true /* enable colors */))