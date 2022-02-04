#!/user/bin/env node

import chalk from 'chalk'
import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import * as fs from 'fs'
import * as path from 'path'
import * as Firework from './Firework.js'

function copyFileSync( source, target ) {

    var targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
    var files = [];

    // Check if folder needs to be created or integrated
    var targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }

    // Copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}

function getDirectories(path){
    return fs.readdirSync(path, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
}

function locateComMojang(){
    let users = getDirectories('C:/Users')

    if(users.includes('Default')){
        users.splice(users.indexOf('Default'), 1)
    }
    
    if(users.includes('Public')){
        users.splice(users.indexOf('Public'), 1)
    }

    if(users.length == 0){
        return {
            error: true,
            message: 'No users found.'
        }
    }

    let path = ''

    for(let i = 0; i < users.length; i++){
        if(fs.existsSync(`C:/Users/${users[i]}/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang`)){
            path = `C:/Users/${users[i]}/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang`
            break
        }
    }

    if(path == ''){
        return {
            error: true,
            message: 'Could not locate folder.'
        }
    }

    return path
}

//D:\.MCAddons\projects\Firework Testing

async function setupProject(path){
    const spinner = createSpinner('Setting up!').start()

    if(fs.existsSync(path + '/.firework')){
        spinner.error()

        console.log(chalk.hex('#ea323c').bold('Error:'), 'That project is already setup!')

        process.exit(1)
    }

    fs.mkdirSync(path + '/.firework/')

    fs.writeFileSync(path + '/.firework/config.json', JSON.stringify({
        delayChannels: 3
    }))

    spinner.success()

    configureProject(path)
}

async function configureProject(path){
    if(!fs.existsSync(path + '/.firework')){
        console.log(chalk.hex('#ea323c').bold('Error:'), 'That project is not setup!')

        process.exit(1)
    }

    const config = JSON.parse(fs.readFileSync(path + '/.firework/config.json'))

    const answer = await inquirer.prompt({
        name: 'delayChannels',
        type: 'input',
        message: 'How many delay channels do you want to use?',
        default: config.delayChannels
    })

    config.delayChannels = answer.delayChannels

    fs.writeFileSync(path + '/.firework/config.json', JSON.stringify(config, null, 2))
}

async function removeProject(path){
    const spinner = createSpinner('Removing!').start()
    
    if(!fs.existsSync(path + '/.firework')){
        spinner.error()

        console.log(chalk.hex('#ea323c').bold('Error:'), 'That project is not setup!')

        process.exit(1)
    }

    fs.rmSync(path + '/.firework', { recursive: true })

    spinner.success()
}

async function compileProject(path, com){
    Firework.Start(path, com)
}

async function chooseProject(path){
    const project = await inquirer.prompt({
        name: 'project',
        type: 'input',
        message: 'Choose the bridge project folder.',
    })

    if(fs.existsSync(project.project)){
        if(fs.existsSync(project.project + '/.bridge')){
            const confirm = await inquirer.prompt({
                name: 'confirm',
                type: 'list',
                message: `What operation to do on ${chalk.hex('#ffc825').bold(project.project)}?`,
                choices: [
                    'Setup',
                    'Configure',
                    'Remove',
                    'Compile',
                    'Exit'
                ]
            })
        
            if(confirm.confirm == 'Setup'){
                setupProject(project.project)
            }else if(confirm.confirm == 'Configure'){
                configureProject(project.project)
            }else if(confirm.confirm == 'Remove'){
                removeProject(project.project)
            }else if(confirm.confirm == 'Compile'){
                compileProject(project.project, path)
            }else if(confirm.confirm == 'Exit'){
                process.exit(0)
            }
        }else{
            console.log(chalk.hex('#ea323c').bold('Error:'), 'That project folder is not a bridge. v2 project!')

            chooseProject(path)
        }
    }else{
        console.log(chalk.hex('#ea323c').bold('Error:'), 'That project folder does not exist.')

        chooseProject(path)
    }
}

async function begin(){
    console.log(`${chalk.bold('Welcome to')} ${chalk.hex('#ea323c').bold('Firework')}🚀
${chalk.bold('Let\'s build something great together!')}`)

    const spinner = createSpinner('Locating com.mojang folder!').start()

    const result = locateComMojang()

    if(result.error){
        spinner.error({ text: result.message })

        process.exit(1)
    }else{
        spinner.success({ text: 'Found com.mojang folder!' })

        chooseProject(result)
    }
}

begin()