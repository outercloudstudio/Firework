const util = require('util')
const fs = require('fs')

function compile(tree){
    fs.copyFileSync('./world_runtime_template.json', './world_runtime.json')

    let worldRuntime = JSON.parse(fs.readFileSync('./world_runtime.json').toString())

    let functions = {}

    let dynamicVariables = {}

    let constants = {}

    for(let i = 0; i < tree.length; i++){
        if(tree[i].token == 'DEFINITION'){
            functions[tree[i].value[0].value] = tree[i].value[1].value
        }
    }

    const functionNames = Object.getOwnPropertyNames(functions)

    for(let i = 0; i < functionNames.length; i++){
        let data = {
            sequence: []
        }

        for(let l = 0; l < functions[functionNames[i]].length; l++){
            console.log(functions[functionNames[i]][l])
            if(functions[functionNames[i]][l].token == 'CALL'){
                console.log('ADDING CALL')

                if(functions[functionNames[i]][l].value[0].value == 'rc'){
                    console.log('ADDING RC')

                    data.sequence.push({
                        run_command: {
                            command: [
                                functions[functionNames[i]][l].value[1].value
                            ]
                        }
                    })
                }
            }
        }

        worldRuntime['minecraft:entity'].events['frw:' + functionNames[i]] = data
    }

    fs.writeFileSync('./world_runtime.json', JSON.stringify(worldRuntime, null, 4))
}

module.exports = { compile }