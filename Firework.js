const util = require('util')
const fs = require('fs')

const Tokenizer = require('./Tokenizer')
const ExecutionTree = require('./ExecutionTree')
const Compiler = require('./Compiler')
const Backend = require('./Backend')

function Compile(){
  const tokens = Tokenizer.tokenize(fs.readFileSync('./Error.frw').toString())

  const ETree = ExecutionTree.generateETree(tokens)

  if(ETree instanceof Backend.Error){
    console.log('\x1b[31m Error: ' + ETree.message + '\x1b[0m')

    return
  }

  const compiled = Compiler.compile(ETree)

  if(compiled instanceof Backend.Error){
    console.log('\x1b[31m Error: ' + compiled.message + '\x1b[0m')

    return
  }
}

module.exports = { Compile };