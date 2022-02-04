import * as util from 'util'
import * as fs from 'fs'
import * as paths from 'path'

//import * as Tokenizer from './Tokenizer.js'
//import * as ExecutionTree from './ExecutionTree.js'
//import * as Compiler from './Compiler.js'

import chalk from 'chalk'
import { createSpinner } from 'nanospinner'

/*function Compile(){
  const tokens = Tokenizer.tokenize(fs.readFileSync('./Delay.frw').toString())

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
}*/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function Start(path, com){
  console.log(chalk.hex('#5ac54f').bold('Starting compilation server v1.0.0!'))

  const spinner = createSpinner('Waiting for bridge to compile...').start()
    
  while(!fs.existsSync(com + '/development_behavior_packs/' + paths.basename(path) + ' BP') || !fs.existsSync(com + '/development_behavior_packs/' + paths.basename(path) + ' BP/manifest.json')){
    await(sleep(1000))
  }

  spinner.success()

  while(true){
    await sleep(100)

    while(!fs.existsSync(com + '/development_behavior_packs/' + paths.basename(path) + ' BP') || !fs.existsSync(com + '/development_behavior_packs/' + paths.basename(path) + ' BP/manifest.json')){
      await(sleep(100))
    }

    try{
      let mainfest = null

      while(!mainfest){
        try{
          mainfest = JSON.parse(fs.readFileSync(com + '/development_behavior_packs/' + paths.basename(path) + ' BP/manifest.json'))
        }catch{}

        await(sleep(100))
      }
      
      if(!mainfest.firework){
        console.log(chalk.hex('#ffc825').bold('Warning:'), 'Detected recompile!')
      }

      mainfest.firework = {
        
      }

      fs.writeFileSync(com + '/development_behavior_packs/' + paths.basename(path) + ' BP/manifest.json', JSON.stringify(mainfest, null, 2))
    }catch (err){
      console.log(chalk.hex('#ffc825').bold('Warning:'), 'Ignored error!')
      console.log(err.toString())
    }
  }
}