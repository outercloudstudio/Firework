const util = require('util')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')


function compile(tree){
    fs.copyFileSync('./world_runtime_template.json', './world_runtime.json')

    let worldRuntime = JSON.parse(fs.readFileSync('./world_runtime.json').toString())

    let blocks = {}

    let dynamicVariables = {}

    let constants = {}

    function indexCodeBlock(block, mode, preferedID = null){
        for(let i = 0; i < block.value.length; i++){
            block.value[i] = searchForCodeBlock(block.value[i])
        }

        let ID = uuidv4()

        if(preferedID != null && !blocks[preferedID]){
            ID = preferedID
        }

        blocks[ID] = block.value

        block = { value: [ID, mode], token: 'BLOCKREF'}

        return block
    }

    function searchForCodeBlock(tree){
        if(tree.token == 'DEFINITION'){
            tree = indexCodeBlock(tree.value[1], 'normal')
        }else if(tree.token == 'IF'){
            tree = indexCodeBlock(tree.value[1], 'conditional')
        }else if(tree.token == 'DELAY'){
            tree = indexCodeBlock(tree.value[1], 'delay')
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
                if(blocks[blockNames[i]][l].value[1] == 'normal'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                'event entity @s frw:' + blocks[blockNames[i]][l].value[0]
                            ]
                        }
                    })
                }else if(blocks[blockNames[i]][l].value[1] == 'conditional'){
                    data.sequence.push({
                        filters: {
							test: 'has_tag',
							value: 'exanmple_condition'
						},
                        run_command: {
                            command: [
                                'event entity @s frw:' + blocks[blockNames[i]][l].value[0]
                            ]
                        }
                    })
                }else if(blocks[blockNames[i]][l].value[1] == 'delay'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                'event entity @s frw:' + blocks[blockNames[i]][l].value[0]
                            ]
                        }
                    })
                }
            }
        }

        worldRuntime['minecraft:entity'].events['frw:' + blockNames[i]] = data
    }

    fs.writeFileSync('./world_runtime.json', JSON.stringify(worldRuntime, null, 4))
}

module.exports = { compile }