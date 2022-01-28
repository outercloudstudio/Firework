const util = require('util')
const fs = require('fs')

const Tokenizer = require('./Tokenizer')
const ExecutionTree = require('./ExecutionTree')
const ContextTree = require('./ContextTree')

const tokens = Tokenizer.tokenize(fs.readFileSync('./Context.frw').toString())

const ETree = ExecutionTree.generateETree(tokens)

//const CTree = ContextTree.buildContextTree(ETree)

console.log(util.inspect(ETree, false, null, true /* enable colors */))