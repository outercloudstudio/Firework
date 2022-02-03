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
    console.log('Error: ' + ETree.message)

    return
  }

  //Compiler.compile(ETree)
}

module.exports = { Compile };