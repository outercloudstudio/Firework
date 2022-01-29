const util = require('util')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')


function compile(tree){
    fs.copyFileSync('./world_runtime_template.json', './world_runtime.json')

    let worldRuntime = JSON.parse(fs.readFileSync('./world_runtime.json').toString())

    let blocks = {}

    let dynamicVariables = {}

    let constants = {}

    function indexCodeBlock(block, preferedID = null){
        for(let i = 0; i < block.value.length; i++){
            block.value[i] = searchForCodeBlock(block.value[i])
        }

        let ID = uuidv4()

        if(preferedID != null && !blocks[preferedID]){
            ID = preferedID
        }

        blocks[ID] = block.value

        block = { value: ID, token: 'BLOCKREF'}

        return block
    }

    function searchForCodeBlock(tree){
        if(tree.token == 'BLOCK'){
            tree = indexCodeBlock(tree)
        }else if(tree.token == 'DEFINITION' || tree.token == 'IF' || tree.token == 'DELAY'){
            tree = indexCodeBlock(tree.value[1])
        }

        return tree
    }

    for(let i = 0; i < tree.length; i++){
        tree[i] = searchForCodeBlock(tree[i])
    }

    console.log(util.inspect(blocks, false, null, true))

    const blockNames = Object.getOwnPropertyNames(blocks)

    for(let i = 0; i < blockNames.length; i++){
        let data = {
            sequence: []
        }

        for(let l = 0; l < blocks[blockNames[i]].length; l++){
            console.log(blocks[blockNames[i]][l])
            if(blocks[blockNames[i]][l].token == 'CALL'){
                if(blocks[blockNames[i]][l].value[0].value == 'rc'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                blocks[blockNames[i]][l].value[1].value
                            ]
                        }
                    })
                }
            }else if(blocks[blockNames[i]][l].token == 'BLOCKREF'){
                data.sequence.push({
                    run_command: {
                        command: [
                            'event entity @s frw:' + blocks[blockNames[i]][l].value
                        ]
                    }
                })
            }
        }

        worldRuntime['minecraft:entity'].events['frw:' + blockNames[i]] = data
    }

    fs.writeFileSync('./world_runtime.json', JSON.stringify(worldRuntime, null, 4))
}

module.exports = { compile }