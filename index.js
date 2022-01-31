const util = require('util')
const fs = require('fs')

const Tokenizer = require('./Tokenizer')
const ExecutionTree = require('./ExecutionTree')
const Compiler = require('./Compiler')

const tokens = Tokenizer.tokenize(fs.readFileSync('./Bounce.frw').toString())

const ETree = ExecutionTree.generateETree(tokens)

const Output = Compiler.compile(ETree)