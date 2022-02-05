import * as util from 'util'
import * as fs from 'fs'
import * as paths from 'path'

import * as Tokenizer from './Tokenizer.js'
import * as ExecutionTree from './ExecutionTree.js'
import * as Compiler from './Compiler.js'
import * as Backend from './Backend.js'

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

function CompileFile(source, path, endPath){
  //console.log('Compiling entity from ' + source + ' to ' + endPath + ' with ' + path)

  const tokens = Tokenizer.Tokenize(fs.readFileSync(path).toString())

  const ETree = ExecutionTree.GenerateETree(tokens)

  if(ETree instanceof Backend.Error){
    return ETree
  }

  console.log(ETree)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getDirectories(path){
  return fs.readdirSync(path, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
}

function getFiles(path){
  return fs.readdirSync(path, { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name)
}

export async function Start(path, com){
  console.log(chalk.hex('#5ac54f').bold('Starting compilation server v1.0.0!'))

  const projectName = paths.basename(path)

  const spinner = createSpinner('Waiting for bridge to compile...').start()
    
  while(!fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP') || !fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/manifest.json')){
    await(sleep(1000))
  }

  spinner.success()

  let forced = true

  while(true){
    await sleep(100)

    while(!fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP') || !fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/manifest.json')){
      await(sleep(100))
    }

    //try{
      let mainfest = null

      while(!mainfest || !fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/entities/')){
        try{
          mainfest = JSON.parse(fs.readFileSync(com + '/development_behavior_packs/' + projectName + ' BP/manifest.json'))
        }catch{}

        await(sleep(100))
      }
      
      if(!mainfest.firework || forced){
        console.log(chalk.hex('#ffc825').bold('Warning:') + ' Detected recompile!')

        forced = false

        mainfest.firework = {

        }

        if(fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/entities/')){
          //Find entity .frw files
          let files = []
          let fileRelPaths = []

          function searchFolderForEntity(dir){
            let foundFiles = getFiles(dir)

            for(let i = 0; i < foundFiles.length; i++){
              if(foundFiles[i].endsWith('.json')){
                files.push(foundFiles[i])
                fileRelPaths.push(dir.substring((com + '/development_behavior_packs/' + projectName + ' BP/entities').length))
              }
            }

            const directories = getDirectories(dir)

            for(let i = 0; i < directories.length; i++){
              searchFolderForEntity(dir + '/' + directories[i])
            }
          }

          searchFolderForEntity(com + '/development_behavior_packs/' + projectName + ' BP/entities')

          console.log(files)

          for(let i = 0; i < files.length; i++){
            const targetFileName = files[i].substring(0, files[i].length - 5) + '.frw'
            const targetFilePath = com + '/development_behavior_packs/' + projectName + ' BP/firework/' + fileRelPaths[i] + targetFileName
            const sourceFilePath = com + '/development_behavior_packs/' + projectName + ' BP/enities/' + fileRelPaths[i] + files[i]

            if(fs.existsSync(targetFilePath)){
              const result = CompileFile(sourceFilePath, targetFilePath, com + '/development_behavior_packs/' + projectName + ' BP/enities/' + fileRelPaths[i] + files[1])

              if(result instanceof Backend.Error){
                console.log(chalk.hex('#ea323c').bold('Error:') + ' ' + result.message)

                break
              }else{
                console.log(chalk.hex('#5ac54f').bold(`Compiled ${targetFileName}!`))
              }
            }else{
              console.log(chalk.hex('#ffc825').bold('Warning:') +  ' Could not find file for ' + files[i])
            }
          }
        }else{
          console.log(chalk.hex('#ffc825').bold('Warning:') + ' Could not find entities folder!')
        }

        fs.writeFileSync(com + '/development_behavior_packs/' + projectName + ' BP/manifest.json', JSON.stringify(mainfest, null, 2))
      }
    /*}catch (err){
      console.log(chalk.hex('#ffc825').bold('Warning:'), 'Ignored error!')
      console.log(err.toString())
    }*/
  }
}