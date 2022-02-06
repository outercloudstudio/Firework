import * as util from 'util'
import * as fs from 'fs'
import * as paths from 'path'

import * as Tokenizer from './Tokenizer.js'
import * as ExecutionTree from './ExecutionTree.js'
import * as Compiler from './Compiler.js'
import * as Backend from './Backend.js'

import chalk from 'chalk'
import { createSpinner } from 'nanospinner'

//D:\.MCAddons\projects\Firework Testing

function CompileFile(source, path, endPath, config){
  //console.log('Compiling entity from ' + source + ' to ' + endPath + ' with ' + path)

  const tokens = Tokenizer.Tokenize(fs.readFileSync(path).toString())

  const ETree = ExecutionTree.GenerateETree(tokens)

  if(ETree instanceof Backend.Error){
    return ETree
  }

  const compiled = Compiler.Compile(ETree, config, source, endPath)

  if(compiled instanceof Backend.Error){
    return compiled
  }
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
    await sleep(1000)
  }

  spinner.success()

  let forced = true

  while(true){
    await sleep(100)

    while(!fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP') || !fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/manifest.json')){
      await sleep(100)
    }

    //try{
      let mainfest = null

      while(!mainfest || !fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/entities/')){
        try{
          mainfest = JSON.parse(fs.readFileSync(com + '/development_behavior_packs/' + projectName + ' BP/manifest.json'))
        }catch{}

        await sleep(100)
      }
      
      if(!mainfest.firework || forced){
        console.log(chalk.hex('#ffc825').bold('Warning:') + ' Detected recompile!')

        //Create intial files
        if(!fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/functions/')){
          fs.mkdirSync(com + '/development_behavior_packs/' + projectName + ' BP/functions/')
        }

        if(!fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/functions/tick.json')){
          fs.writeFileSync(com + '/development_behavior_packs/' + projectName + ' BP/functions/tick.json', JSON.stringify({
            values: [
              'firework_runtime'
            ]
          }, null, 2))
        }

        fs.copyFileSync('./data/firework_runtime.mcfunction', com + '/development_behavior_packs/' + projectName + ' BP/functions/firework_runtime.mcfunction')

        if(!fs.existsSync(com + '/development_behavior_packs/' + projectName + ' BP/animations/')){
          fs.mkdirSync(com + '/development_behavior_packs/' + projectName + ' BP/animations/')
        }

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

        searchFolderForEntity(path + '/BP/entities')
        
        for(let i = 0; i < files.length; i++){
          const targetFileName = files[i].substring(0, files[i].length - 5) + '.frw'
          const targetFilePath = com + '/development_behavior_packs/' + projectName + ' BP/firework/' + fileRelPaths[i] + targetFileName
          const sourceFilePath = com + '/development_behavior_packs/' + projectName + ' BP/entities/' + fileRelPaths[i] + files[i]
          const projectSourceFilePath = path + '/BP/firework/' + fileRelPaths[i] + targetFileName

          if(!fs.existsSync(projectSourceFilePath)){
            console.log(chalk.hex('#ffc825').bold('Warning:') + ' Skipping ' + files[i])

            continue
          }

          const spinner = createSpinner('Waiting for source of ' + files[i] + '...').start()

          while(!fs.existsSync(sourceFilePath)){
            await sleep(100)
          }

          spinner.success()

          const spinner2 = createSpinner('Waiting for target of ' + targetFileName + '...').start()

          while(!fs.existsSync(targetFilePath)){
            await sleep(100)
          }

          spinner2.success()

          const spinner3 = createSpinner('Waiting for source JSON of ' + targetFileName + '...').start()

          let sourceJson = null

          let waits = 0

          while(!sourceJson && waits < 100){
            try{
              sourceJson = JSON.parse(fs.readFileSync(sourceFilePath))
            }catch{}

            waits++

            await sleep(100)
          }

          if(waits >= 100){
            spinner3.fail()

            console.log(chalk.hex('#ffc825').bold('Warning:') + ' Failed to load ' + files[i])

            continue
          }else{
            spinner3.success()
          }

          const result = CompileFile(sourceFilePath, targetFilePath, com + '/development_behavior_packs/' + projectName + ' BP', JSON.parse(fs.readFileSync(path + '/.firework/config.json')))

          if(result instanceof Backend.Error){
            console.log(chalk.hex('#ea323c').bold('Error:') + ' ' + result.message)

            break
          }else{
            console.log(chalk.hex('#5ac54f').bold(`Compiled ${targetFileName}!`))
          }
        }

        //Update manifest
        forced = false

        mainfest.firework = {

        }

        fs.writeFileSync(com + '/development_behavior_packs/' + projectName + ' BP/manifest.json', JSON.stringify(mainfest, null, 2))
      }
    //}catch (err){
    //  console.log(chalk.hex('#ffc825').bold('Warning:') + ' Ignored error: ' + err.toString())
    //}
  }
}